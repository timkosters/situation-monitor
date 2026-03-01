<script lang="ts">
	import { Panel, Sparkline } from '$lib/components/common';
	import { crypto } from '$lib/stores';
	import { formatCurrency, formatPercentChange, getChangeClass } from '$lib/utils';

	const items = $derived($crypto.items);
	const loading = $derived($crypto.loading);
	const error = $derived($crypto.error);
	const count = $derived(items.length);

	// Stock indices - updated periodically (free stock APIs require keys)
	const stockIndices = [
		{ symbol: 'SPY', name: 'S&P 500', price: 5954, change: -0.42 },
		{ symbol: 'QQQ', name: 'NASDAQ', price: 20712, change: -0.68 },
		{ symbol: 'DIA', name: 'Dow Jones', price: 43840, change: -0.19 },
		{ symbol: 'VIX', name: 'Fear Index', price: 19.63, change: 4.2 }
	];
</script>

<Panel id="whales" title="Markets" {count} {loading} {error}>
	<!-- Stock Indices -->
	<div class="section-header">INDICES</div>
	<div class="indices-grid">
		{#each stockIndices as idx}
			{@const isUp = idx.change >= 0}
			<div class="index-card">
				<div class="index-name">{idx.name}</div>
				<div class="index-price">{idx.price.toLocaleString()}</div>
				<div class="index-change" class:up={isUp} class:down={!isUp}>
					{isUp ? '+' : ''}{idx.change.toFixed(2)}%
				</div>
			</div>
		{/each}
	</div>

	<!-- Crypto -->
	<div class="section-header">CRYPTO</div>
	{#if items.length === 0 && !loading && !error}
		<div class="empty-state">No crypto data available</div>
	{:else}
		<div class="crypto-list">
			{#each items as coin (coin.id)}
				{@const changeClass = getChangeClass(coin.price_change_percentage_24h)}
				<div class="crypto-item">
					<div class="crypto-info">
						<div class="crypto-name">{coin.name}</div>
						<div class="crypto-symbol">{coin.symbol.toUpperCase()}</div>
					</div>
					{#if coin.sparkline && coin.sparkline.length > 0}
						<div class="crypto-chart">
							<Sparkline data={coin.sparkline.slice(-48)} width={64} height={20} color="auto" />
						</div>
					{/if}
					<div class="crypto-data">
						<div class="crypto-price">{formatCurrency(coin.current_price)}</div>
						<div class="crypto-change {changeClass}">
							{formatPercentChange(coin.price_change_percentage_24h)}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</Panel>

<style>
	.section-header {
		font-size: 0.55rem;
		font-weight: 600;
		color: var(--green);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin-top: 0.5rem;
		margin-bottom: 0.4rem;
		padding-bottom: 0.2rem;
		border-bottom: 1px solid var(--border);
	}

	.section-header:first-child {
		margin-top: 0;
	}

	.indices-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.4rem;
		margin-bottom: 0.5rem;
	}

	.index-card {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 0.4rem;
	}

	.index-name {
		font-size: 0.55rem;
		color: var(--text-muted);
	}

	.index-price {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--text-primary);
		font-variant-numeric: tabular-nums;
	}

	.index-change {
		font-size: 0.6rem;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}

	.index-change.up { color: var(--success); }
	.index-change.down { color: var(--danger); }

	.crypto-list {
		display: flex;
		flex-direction: column;
	}

	.crypto-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.4rem 0;
		border-bottom: 1px solid var(--border);
		gap: 0.5rem;
	}

	.crypto-item:last-child { border-bottom: none; }

	.crypto-info {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		min-width: 60px;
	}

	.crypto-name {
		font-size: 0.65rem;
		font-weight: 500;
		color: var(--text-primary);
	}

	.crypto-symbol {
		font-size: 0.5rem;
		color: var(--text-muted);
	}

	.crypto-chart {
		flex: 1;
		display: flex;
		justify-content: center;
	}

	.crypto-data {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.1rem;
		min-width: 60px;
	}

	.crypto-price {
		font-size: 0.65rem;
		font-weight: 500;
		color: var(--text-primary);
		font-variant-numeric: tabular-nums;
	}

	.crypto-change {
		font-size: 0.55rem;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}

	.crypto-change.up { color: var(--success); }
	.crypto-change.down { color: var(--danger); }

	.empty-state {
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>
