<script lang="ts">
	import { Panel } from '$lib/components/common';

	interface Prediction {
		id: string;
		question: string;
		yes: number;
		volume: number | string;
		url?: string;
	}

	interface Props {
		predictions?: Prediction[];
		loading?: boolean;
		error?: string | null;
	}

	let { predictions = [], loading = false, error = null }: Props = $props();

	const count = $derived(predictions.length);

	function formatVolume(v: number | string): string {
		if (typeof v === 'string') return '$' + v;
		if (!v) return '$0';
		if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
		if (v >= 1e3) return '$' + (v / 1e3).toFixed(0) + 'K';
		return '$' + v.toFixed(0);
	}

	function getBarColor(yes: number): string {
		if (yes >= 70) return 'var(--success)';
		if (yes >= 40) return 'var(--cyan, #00cccc)';
		if (yes >= 20) return 'var(--warning)';
		return 'var(--text-muted)';
	}
</script>

<Panel id="polymarket" title="Polymarket" {count} {loading} {error}>
	{#if predictions.length === 0 && !loading && !error}
		<div class="empty-state">No predictions available</div>
	{:else}
		<div class="predictions-list">
			{#each predictions as pred (pred.id)}
				<div class="prediction-item">
					<div class="prediction-info">
						{#if pred.url}
							<a class="prediction-question" href={pred.url} target="_blank" rel="noopener noreferrer">
								{pred.question}
							</a>
						{:else}
							<div class="prediction-question">{pred.question}</div>
						{/if}
						<div class="prediction-meta">
							<span class="prediction-volume">Vol: {formatVolume(pred.volume)}</span>
						</div>
					</div>
					<div class="prediction-chart">
						<div class="bar-container">
							<div
								class="bar-fill"
								style="width: {pred.yes}%; background: {getBarColor(pred.yes)}"
							></div>
						</div>
						<span class="prediction-yes" style="color: {getBarColor(pred.yes)}">{pred.yes}%</span>
					</div>
				</div>
			{/each}
		</div>
		<div class="polymarket-link">
			<a href="https://polymarket.com" target="_blank" rel="noopener noreferrer">
				View all on Polymarket
			</a>
		</div>
	{/if}
</Panel>

<style>
	.predictions-list {
		display: flex;
		flex-direction: column;
	}

	.prediction-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border);
		gap: 0.75rem;
	}

	.prediction-item:last-child {
		border-bottom: none;
	}

	.prediction-info {
		flex: 1;
		min-width: 0;
	}

	.prediction-question {
		font-size: 0.65rem;
		color: var(--text-primary);
		line-height: 1.3;
		margin-bottom: 0.2rem;
		text-decoration: none;
		display: block;
	}

	a.prediction-question:hover {
		color: var(--green);
	}

	.prediction-meta {
		display: flex;
		gap: 0.5rem;
	}

	.prediction-volume {
		font-size: 0.5rem;
		color: var(--text-muted);
	}

	.prediction-chart {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		min-width: 100px;
	}

	.bar-container {
		flex: 1;
		height: 6px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 3px;
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		border-radius: 3px;
		transition: width 0.5s ease;
	}

	.prediction-yes {
		font-size: 0.75rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		min-width: 32px;
		text-align: right;
	}

	.polymarket-link {
		padding-top: 0.5rem;
		border-top: 1px solid var(--border);
		margin-top: 0.25rem;
	}

	.polymarket-link a {
		font-size: 0.55rem;
		color: var(--green);
		text-decoration: none;
	}

	.polymarket-link a:hover {
		text-decoration: underline;
	}

	.empty-state {
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>
