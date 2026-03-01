<script lang="ts">
	import { onMount } from 'svelte';
	import { isRefreshing, lastRefresh } from '$lib/stores';

	interface Props {
		onSettingsClick?: () => void;
	}

	let { onSettingsClick }: Props = $props();

	let currentTime = $state('');
	let currentDate = $state('');

	function updateClock() {
		const now = new Date();
		currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
		currentDate = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
	}

	onMount(() => {
		updateClock();
		const interval = setInterval(updateClock, 1000);
		return () => clearInterval(interval);
	});

	const lastRefreshText = $derived(
		$lastRefresh
			? `Updated ${new Date($lastRefresh).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
			: ''
	);
</script>

<header class="header">
	<div class="header-left">
		<div class="live-dot"></div>
		<h1 class="logo">
			<span class="logo-r2">R2</span>
			<span class="logo-sep">//</span>
			<span class="logo-text">SITUATION MONITOR</span>
		</h1>
	</div>

	<div class="header-center">
		<div class="clock-display">
			<span class="clock-date">{currentDate}</span>
			<span class="clock-time">{currentTime}</span>
		</div>
		{#if $isRefreshing}
			<span class="status-badge scanning">SCANNING</span>
		{:else if lastRefreshText}
			<span class="status-badge">{lastRefreshText}</span>
		{/if}
	</div>

	<div class="header-right">
		<button class="header-btn" onclick={onSettingsClick} title="Settings">
			<span class="btn-label">CONFIG</span>
		</button>
	</div>
</header>

<style>
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.6rem 1.2rem;
		background: linear-gradient(180deg, rgba(10, 10, 16, 0.98) 0%, rgba(3, 3, 6, 0.95) 100%);
		border-bottom: 1px solid var(--border);
		position: sticky;
		top: 2px;
		z-index: 100;
		gap: 1.5rem;
		backdrop-filter: blur(12px);
	}

	.header-left {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		gap: 0.6rem;
	}

	.live-dot {
		width: 6px;
		height: 6px;
		background: var(--green);
		border-radius: 50%;
		box-shadow: 0 0 8px var(--green), 0 0 16px rgba(0, 255, 127, 0.3);
		animation: pulse-dot 2s ease-in-out infinite;
	}

	@keyframes pulse-dot {
		0%, 100% { opacity: 1; box-shadow: 0 0 8px var(--green), 0 0 16px rgba(0, 255, 127, 0.3); }
		50% { opacity: 0.5; box-shadow: 0 0 4px var(--green), 0 0 8px rgba(0, 255, 127, 0.15); }
	}

	.logo {
		font-size: 0.85rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		margin: 0;
		display: flex;
		align-items: baseline;
		gap: 0;
	}

	.logo-r2 {
		color: var(--green);
		font-weight: 800;
		text-shadow: 0 0 12px rgba(0, 255, 127, 0.4);
	}

	.logo-sep {
		color: var(--text-muted);
		margin: 0 0.4rem;
		font-weight: 400;
	}

	.logo-text {
		color: var(--text-dim);
		font-weight: 500;
		letter-spacing: 0.15em;
	}

	.header-center {
		display: flex;
		align-items: center;
		flex: 1;
		justify-content: center;
		gap: 1rem;
		min-width: 0;
	}

	.clock-display {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
	}

	.clock-date {
		font-size: 0.55rem;
		color: var(--text-muted);
		letter-spacing: 0.08em;
	}

	.clock-time {
		font-size: 0.7rem;
		color: var(--cyan);
		font-weight: 600;
		letter-spacing: 0.05em;
		font-variant-numeric: tabular-nums;
	}

	.status-badge {
		font-size: 0.5rem;
		color: var(--text-muted);
		padding: 0.15rem 0.5rem;
		border: 1px solid var(--border);
		border-radius: 2px;
		letter-spacing: 0.05em;
	}

	.status-badge.scanning {
		color: var(--green);
		border-color: rgba(0, 255, 127, 0.3);
		animation: pulse-dot 1.5s ease-in-out infinite;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.header-btn {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.35rem 0.8rem;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: 2px;
		color: var(--text-muted);
		cursor: pointer;
		transition: all 0.15s ease;
		font-size: 0.55rem;
		font-family: inherit;
		letter-spacing: 0.1em;
		font-weight: 500;
	}

	.header-btn:hover {
		background: var(--border);
		color: var(--text);
		border-color: var(--border-light);
	}

	.btn-label {
		display: inline;
	}
</style>
