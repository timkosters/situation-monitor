<script lang="ts">
	interface Props {
		data: number[];
		width?: number;
		height?: number;
		color?: string;
		fillOpacity?: number;
	}

	let { data = [], width = 80, height = 24, color = '#00ff88', fillOpacity = 0.15 }: Props = $props();

	const points = $derived(() => {
		if (data.length < 2) return '';
		const min = Math.min(...data);
		const max = Math.max(...data);
		const range = max - min || 1;
		const step = width / (data.length - 1);
		return data
			.map((v, i) => `${i * step},${height - ((v - min) / range) * height}`)
			.join(' ');
	});

	const fillPoints = $derived(() => {
		if (data.length < 2) return '';
		const min = Math.min(...data);
		const max = Math.max(...data);
		const range = max - min || 1;
		const step = width / (data.length - 1);
		const line = data
			.map((v, i) => `${i * step},${height - ((v - min) / range) * height}`)
			.join(' ');
		return `0,${height} ${line} ${width},${height}`;
	});

	const isUp = $derived(data.length >= 2 ? data[data.length - 1] >= data[0] : true);
	const lineColor = $derived(color === 'auto' ? (isUp ? '#00ff88' : '#ff4444') : color);
</script>

{#if data.length >= 2}
	<svg {width} {height} viewBox="0 0 {width} {height}" class="sparkline">
		<polygon points={fillPoints()} fill={lineColor} opacity={fillOpacity} />
		<polyline
			points={points()}
			fill="none"
			stroke={lineColor}
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
{/if}

<style>
	.sparkline {
		display: block;
	}
</style>
