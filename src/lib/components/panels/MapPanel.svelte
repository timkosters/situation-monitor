<script lang="ts">
	import { onMount } from 'svelte';
	import { Panel } from '$lib/components/common';
	import {
		HOTSPOTS,
		SANCTIONED_COUNTRY_IDS,
		THREAT_COLORS,
		WEATHER_CODES
	} from '$lib/config/map';
	import { CACHE_TTLS } from '$lib/config/api';
	import type { CustomMonitor } from '$lib/types';

	interface Props {
		monitors?: CustomMonitor[];
		loading?: boolean;
		error?: string | null;
	}

	let { monitors = [], loading = false, error = null }: Props = $props();

	let mapContainer: HTMLDivElement;
	// D3 objects - initialized in initMap, null before initialization
	// Using 'any' for D3 objects as they're dynamically imported and have complex generic types
	/* eslint-disable @typescript-eslint/no-explicit-any */
	let d3Module: typeof import('d3') | null = null;
	let svg: any = null;
	let mapGroup: any = null;
	let projection: any = null;
	let path: any = null;
	/* eslint-enable @typescript-eslint/no-explicit-any */

	const WIDTH = 600;
	const HEIGHT = 600;

	// Tooltip state
	let tooltipContent = $state<{
		title: string;
		color: string;
		lines: string[];
	} | null>(null);
	let tooltipPosition = $state({ left: 0, top: 0 });
	let tooltipVisible = $state(false);

	// Data cache for tooltips with TTL support
	interface CacheEntry<T> {
		data: T;
		timestamp: number;
	}
	const dataCache: Record<string, CacheEntry<unknown>> = {};

	function getCachedData<T>(key: string): T | null {
		const entry = dataCache[key] as CacheEntry<T> | undefined;
		if (!entry) return null;
		// Check if cache entry has expired
		if (Date.now() - entry.timestamp > CACHE_TTLS.weather) {
			delete dataCache[key];
			return null;
		}
		return entry.data;
	}

	function setCachedData<T>(key: string, data: T): void {
		dataCache[key] = { data, timestamp: Date.now() };
	}

	// Get local time at longitude
	function getLocalTime(lon: number): string {
		const now = new Date();
		const utcHours = now.getUTCHours();
		const utcMinutes = now.getUTCMinutes();
		const offsetHours = Math.round(lon / 15);
		let localHours = (utcHours + offsetHours + 24) % 24;
		const ampm = localHours >= 12 ? 'PM' : 'AM';
		localHours = localHours % 12 || 12;
		return `${localHours}:${utcMinutes.toString().padStart(2, '0')} ${ampm}`;
	}

	// Weather result type
	interface WeatherResult {
		temp: number | null;
		wind: number | null;
		condition: string;
	}

	// Fetch weather from Open-Meteo with TTL-based caching
	async function getWeather(lat: number, lon: number): Promise<WeatherResult | null> {
		const key = `weather_${lat}_${lon}`;
		const cached = getCachedData<WeatherResult>(key);
		if (cached) return cached;

		try {
			const res = await fetch(
				`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m`
			);
			const data = await res.json();
			const temp = data.current?.temperature_2m;
			const tempF = temp ? Math.round((temp * 9) / 5 + 32) : null;
			const wind = data.current?.wind_speed_10m;
			const code = data.current?.weather_code;
			const result: WeatherResult = {
				temp: tempF,
				wind: wind ? Math.round(wind) : null,
				condition: WEATHER_CODES[code] || '—'
			};
			setCachedData(key, result);
			return result;
		} catch {
			return null;
		}
	}


	// Slow auto-rotation
	let autoRotateTimer: ReturnType<typeof setInterval> | null = null;

	function startAutoRotate(): void {
		if (autoRotateTimer) return;
		autoRotateTimer = setInterval(() => {
			if (!projection) return;
			const r = projection.rotate() as [number, number, number];
			projection.rotate([r[0] + 0.15, r[1], r[2]]);
			mapGroup?.selectAll('path').attr('d', path as unknown as string);
			redrawMarkers();
		}, 50);
	}

	function stopAutoRotate(): void {
		if (autoRotateTimer) {
			clearInterval(autoRotateTimer);
			autoRotateTimer = null;
		}
	}

	// Show tooltip using state (safe rendering)
	function showTooltip(
		event: MouseEvent,
		title: string,
		color: string,
		lines: string[] = []
	): void {
		if (!mapContainer) return;
		const rect = mapContainer.getBoundingClientRect();
		tooltipContent = { title, color, lines };
		tooltipPosition = {
			left: event.clientX - rect.left + 15,
			top: event.clientY - rect.top - 10
		};
		tooltipVisible = true;
	}

	// Move tooltip
	function moveTooltip(event: MouseEvent): void {
		if (!mapContainer) return;
		const rect = mapContainer.getBoundingClientRect();
		tooltipPosition = {
			left: event.clientX - rect.left + 15,
			top: event.clientY - rect.top - 10
		};
	}

	// Hide tooltip
	function hideTooltip(): void {
		tooltipVisible = false;
		tooltipContent = null;
	}

	// Build enhanced tooltip with weather
	async function showEnhancedTooltip(
		event: MouseEvent,
		_name: string,
		lat: number,
		lon: number,
		desc: string,
		color: string
	): Promise<void> {
		const localTime = getLocalTime(lon);
		const lines = [`🕐 Local: ${localTime}`];
		showTooltip(event, desc, color, lines);

		// Fetch weather asynchronously
		const weather = await getWeather(lat, lon);
		if (weather && tooltipVisible) {
			tooltipContent = {
				title: desc,
				color,
				lines: [
					`🕐 Local: ${localTime}`,
					`${weather.condition} ${weather.temp}°F, ${weather.wind}mph`
				]
			};
		}
	}

	// Initialize map
	async function initMap(): Promise<void> {
		const d3 = await import('d3');
		d3Module = d3;
		const topojson = await import('topojson-client');

		const svgEl = mapContainer.querySelector('svg');
		if (!svgEl) return;

		svg = d3.select(svgEl);
		svg.attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);

		mapGroup = svg.append('g').attr('id', 'mapGroup');

		// Setup orthographic (globe) projection
		projection = d3
			.geoOrthographic()
			.scale(250)
			.center([0, 0])
			.rotate([0, -20])
			.translate([WIDTH / 2, HEIGHT / 2]);

		path = d3.geoPath().projection(projection);

		// Add drag-to-rotate behavior
		let rotateStart: [number, number, number] = [0, -20, 0];
		const dragBehavior = d3
			.drag<SVGSVGElement, unknown>()
			.on('start', () => {
				stopAutoRotate();
				rotateStart = projection.rotate() as [number, number, number];
			})
			.on('end', () => {
				startAutoRotate();
			})
			.on('drag', (event) => {
				const sensitivity = 0.4;
				const rotate: [number, number, number] = [
					rotateStart[0] + event.dx * sensitivity,
					Math.max(-90, Math.min(90, rotateStart[1] - event.dy * sensitivity)),
					0
				];
				rotateStart = rotate;
				projection.rotate(rotate);
				// Redraw everything
				mapGroup.selectAll('path').attr('d', path as unknown as string);
				redrawMarkers();
			});

		svg.call(dragBehavior);

		// Load world data
		try {
			const response = await fetch(
				'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
			);
			const world = await response.json();
			const countries = topojson.feature(
				world,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				world.objects.countries as any
			) as unknown as GeoJSON.FeatureCollection;

			// Draw globe outline (ocean) — first so countries render on top
			mapGroup
				.append('path')
				.datum({ type: 'Sphere' } as unknown as GeoJSON.GeoJsonObject)
				.attr('d', path as unknown as string)
				.attr('fill', '#050a08')
				.attr('stroke', '#1a5040')
				.attr('stroke-width', 1.5);

			// Draw graticule
			const graticule = d3.geoGraticule().step([30, 30]);
			mapGroup
				.append('path')
				.datum(graticule)
				.attr('d', path as unknown as string)
				.attr('fill', 'none')
				.attr('stroke', '#1a3830')
				.attr('stroke-width', 0.3)
				.attr('stroke-dasharray', '2,2');

			// Draw countries
			mapGroup
				.selectAll('path.country')
				.data(countries.features)
				.enter()
				.append('path')
				.attr('class', 'country')
				.attr('d', path as unknown as string)
				.attr('fill', (d: GeoJSON.Feature) =>
					SANCTIONED_COUNTRY_IDS.includes(+(d.id || 0)) ? '#2a1a1a' : '#0f3028'
				)
				.attr('stroke', (d: GeoJSON.Feature) =>
					SANCTIONED_COUNTRY_IDS.includes(+(d.id || 0)) ? '#4a2020' : '#1a5040'
				)
				.attr('stroke-width', 0.5);

			// Draw hotspots with type-specific symbols
			drawAllHotspots();

			// Draw custom monitors with locations
			drawMonitors();
		} catch (err) {
			console.error('Failed to load map data:', err);
		}
	}

	// Check if a point is visible on the globe (not on the back side)
	function isVisible(lon: number, lat: number): boolean {
		if (!projection) return false;
		const coords = projection([lon, lat]);
		if (!coords) return false;
		// Check if point is on the visible hemisphere
		const center = projection.invert?.([WIDTH / 2, HEIGHT / 2]);
		if (!center) return true;
		const d = d3Module!.geoDistance([lon, lat], center as [number, number]);
		return d < Math.PI / 2;
	}

	// Draw a diamond shape at position
	function drawDiamond(x: number, y: number, size: number, color: string): void {
		const s = size;
		mapGroup
			.append('path')
			.attr('class', 'hotspot-marker')
			.attr('d', `M${x},${y - s} L${x + s},${y} L${x},${y + s} L${x - s},${y} Z`)
			.attr('fill', color)
			.attr('fill-opacity', 0.7)
			.attr('stroke', color)
			.attr('stroke-width', 1);
	}

	// Draw a triangle shape at position
	function drawTriangle(x: number, y: number, size: number, color: string): void {
		const s = size;
		mapGroup
			.append('path')
			.attr('class', 'hotspot-marker')
			.attr('d', `M${x},${y - s} L${x + s},${y + s * 0.7} L${x - s},${y + s * 0.7} Z`)
			.attr('fill', 'none')
			.attr('stroke', color)
			.attr('stroke-width', 1.5);
	}

	// Draw all hotspots with type-specific symbols
	function drawAllHotspots(): void {
		if (!mapGroup || !projection) return;
		mapGroup.selectAll('.hotspot-marker,.hotspot-label,.hotspot-hit,.pulse').remove();

		HOTSPOTS.forEach((h) => {
			if (!isVisible(h.lon, h.lat)) return;
			const coords = projection([h.lon, h.lat]);
			if (!coords) return;
			const [x, y] = coords;
			const color = THREAT_COLORS[h.level];

			if (h.type === 'geopolitical') {
				// Pulsing circle for geopolitical
				mapGroup
					.append('circle')
					.attr('class', 'hotspot-marker pulse')
					.attr('cx', x)
					.attr('cy', y)
					.attr('r', 6)
					.attr('fill', color)
					.attr('fill-opacity', 0.3);
				mapGroup
					.append('circle')
					.attr('class', 'hotspot-marker')
					.attr('cx', x)
					.attr('cy', y)
					.attr('r', 3)
					.attr('fill', color);
			} else if (h.type === 'crypto') {
				// Diamond for crypto hubs
				drawDiamond(x, y, 5, color);
			} else if (h.type === 'network-state') {
				// Triangle for network state / popup cities
				drawTriangle(x, y, 6, color);
			}

			// Label
			mapGroup
				.append('text')
				.attr('class', 'hotspot-label')
				.attr('x', x + 8)
				.attr('y', y + 3)
				.attr('fill', color)
				.attr('font-size', '7px')
				.attr('font-family', 'monospace')
				.text(h.name);

			// Hit area for tooltip
			mapGroup
				.append('circle')
				.attr('class', 'hotspot-hit')
				.attr('cx', x)
				.attr('cy', y)
				.attr('r', 12)
				.attr('fill', 'transparent')
				.on('mouseenter', (event: MouseEvent) =>
					showEnhancedTooltip(event, h.name, h.lat, h.lon, h.desc, color)
				)
				.on('mousemove', moveTooltip)
				.on('mouseleave', hideTooltip);
		});
	}

	// Redraw all markers after rotation
	function redrawMarkers(): void {
		drawAllHotspots();
		drawMonitors();
	}

	// Draw custom monitor locations
	function drawMonitors(): void {
		if (!mapGroup || !projection) return;

		// Remove existing monitor markers
		mapGroup.selectAll('.monitor-marker').remove();

		monitors
			.filter((m) => m.enabled && m.location)
			.forEach((m) => {
				if (!m.location) return;
				if (!isVisible(m.location.lon, m.location.lat)) return;
				const coords = projection([m.location.lon, m.location.lat]);
				if (!coords) return;
				const [x, y] = coords;
				if (x && y) {
					const color = m.color || '#00ffff';
					mapGroup
						.append('circle')
						.attr('class', 'monitor-marker')
						.attr('cx', x)
						.attr('cy', y)
						.attr('r', 5)
						.attr('fill', color)
						.attr('fill-opacity', 0.6)
						.attr('stroke', color)
						.attr('stroke-width', 2);
					mapGroup
						.append('text')
						.attr('class', 'monitor-marker')
						.attr('x', x + 8)
						.attr('y', y + 3)
						.attr('fill', color)
						.attr('font-size', '8px')
						.attr('font-family', 'monospace')
						.text(m.name);
					mapGroup
						.append('circle')
						.attr('class', 'monitor-marker')
						.attr('cx', x)
						.attr('cy', y)
						.attr('r', 10)
						.attr('fill', 'transparent')
						.on('mouseenter', (event: MouseEvent) =>
							showTooltip(event, `📡 ${m.name}`, color, [
								m.location?.name || '',
								m.keywords.join(', ')
							])
						)
						.on('mousemove', moveTooltip)
						.on('mouseleave', hideTooltip);
				}
			});
	}


	// Reactively update monitors when they change
	$effect(() => {
		// Track monitors changes
		const _monitorsRef = monitors;
		if (_monitorsRef && mapGroup && projection) {
			drawMonitors();
		}
	});

	onMount(() => {
		initMap().then(() => {
			startAutoRotate();
		});
		return () => {
			stopAutoRotate();
		};
	});
</script>

<Panel id="map" title="Global Situation" {loading} {error}>
	<div class="map-container" bind:this={mapContainer}>
		<svg class="map-svg"></svg>
		{#if tooltipVisible && tooltipContent}
			<div
				class="map-tooltip"
				style="left: {tooltipPosition.left}px; top: {tooltipPosition.top}px;"
			>
				<strong style="color: {tooltipContent.color}">{tooltipContent.title}</strong>
				{#each tooltipContent.lines as line}
					<br /><span class="tooltip-line">{line}</span>
				{/each}
			</div>
		{/if}
		<div class="map-legend">
			<div class="legend-item">
				<span class="legend-symbol">●</span> Geopolitical
			</div>
			<div class="legend-item">
				<span class="legend-symbol" style="color: var(--green)">◆</span> Crypto
			</div>
			<div class="legend-item">
				<span class="legend-symbol" style="color: var(--cyan)">△</span> Network State
			</div>
		</div>
	</div>
</Panel>

<style>
	.map-container {
		position: relative;
		width: 100%;
		aspect-ratio: 1 / 1;
		background: #030306;
		border-radius: 50%;
		overflow: hidden;
	}

	.map-svg {
		width: 100%;
		height: 100%;
	}

	.map-tooltip {
		position: absolute;
		background: rgba(10, 10, 10, 0.95);
		border: 1px solid #333;
		border-radius: 4px;
		padding: 0.5rem;
		font-size: 0.65rem;
		color: #ddd;
		max-width: 250px;
		pointer-events: none;
		z-index: 100;
	}

	.tooltip-line {
		opacity: 0.7;
	}

	.map-legend {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		background: rgba(10, 10, 10, 0.8);
		padding: 0.3rem 0.5rem;
		border-radius: 4px;
		font-size: 0.55rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		color: #888;
	}

	.legend-symbol {
		font-size: 0.7rem;
		color: #ff4444;
	}

	/* Pulse animation for hotspots */
	:global(.pulse) {
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			r: 6;
			opacity: 0.3;
		}
		50% {
			r: 10;
			opacity: 0.1;
		}
	}

	:global(.hotspot-hit) {
		cursor: pointer;
	}

</style>
