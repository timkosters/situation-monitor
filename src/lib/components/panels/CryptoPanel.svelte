<script lang="ts">
	import { Panel, Sparkline } from '$lib/components/common';
	import { crypto } from '$lib/stores';
	import { formatCurrency, formatPercentChange, getChangeClass } from '$lib/utils';

	const items = $derived($crypto.items);
	const loading = $derived($crypto.loading);
	const error = $derived($crypto.error);
	const count = $derived(items.length);

	// Stock indices
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

	<!-- Crypto with charts -->
	<div class="section-header">CRYPTO</div>
	{#if items.length === 0 && !loading && !error}
		<div class="empty-state">No crypto data available</div>
	{:else}
		<!-- Featured coins with big charts -->
		<div class="featured-coins">
			{#each items.slice(0, 3) as coin (coin.id)}
				{@const changeClass = getChangeClass(coin.price_change_percentage_24h)}
				<div class="featured-coin">
					<div class="featured-header">
						<div class="featured-left">
							<span class="featured-symbol">{coin.symbol.toUpperCase()}</span>
							<span class="featured-name">{coin.name}</span>
						</div>
						<div class="featured-right">
							<span class="featured-price">{formatCurrency(coin.current_price)}</span>
							<span class="featured-change {changeClass}">
								{formatPercentChange(coin.price_change_percentage_24h)}
							</span>
						</div>
					</div>
					{#if coin.sparkline && coin.sparkline.length > 0}
						<div class="featured-chart">
							<Sparkline data={coin.sparkline.slice(-96)} width={280} height={50} color="auto" fillOpacity={0.1} />
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Remaining coins compact list -->
		{#if items.length > 3}
			<div class="crypto-list">
				{#each items.slice(3, 8) as coin (coin.id)}
					{@const changeClass = getChangeClass(coin.price_change_percentage_24h)}
					<div class="crypto-item">
						<div class="crypto-info">
							<span class="crypto-symbol-sm">{coin.symbol.toUpperCase()}</span>
							<span class="crypto-name-sm">{coin.name}</span>
						</div>
						{#if coin.sparkline && coin.sparkline.length > 0}
							<div class="crypto-chart-sm">
								<Sparkline data={coin.sparkline.slice(-48)} width={60} height={18} color="auto" />
							</div>
						{/if}
						<div class="crypto-data">
							<span class="crypto-price-sm">{formatCurrency(coin.current_price)}</span>
							<span class="crypto-change-sm {changeClass}">
								{formatPercentChange(coin.price_change_percentage_24h)}
							</span>
						</div>
					</div>
				{/each}
			</div>
		{/if}
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

	/* Featured coins with big charts */
	.featured-coins {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.featured-coin {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 0.5rem;
	}

	.featured-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.3rem;
	}

	.featured-left {
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
	}

	.featured-symbol {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.featured-name {
		font-size: 0.55rem;
		color: var(--text-muted);
	}

	.featured-right {
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
	}

	.featured-price {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-primary);
		font-variant-numeric: tabular-nums;
	}

	.featured-change {
		font-size: 0.6rem;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}

	.featured-change.up { color: var(--success); }
	.featured-change.down { color: var(--danger); }

	.featured-chart {
		width: 100%;
		overflow: hidden;
	}

	.featured-chart :global(svg) {
		width: 100%;
		height: auto;
	}

	/* Compact list for remaining coins */
	.crypto-list {
		display: flex;
		flex-direction: column;
	}

	.crypto-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.3rem 0;
		border-bottom: 1px solid var(--border);
		gap: 0.3rem;
	}

	.crypto-item:last-child { border-bottom: none; }

	.crypto-info {
		display: flex;
		align-items: baseline;
		gap: 0.3rem;
		min-width: 80px;
	}

	.crypto-symbol-sm {
		font-size: 0.6rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.crypto-name-sm {
		font-size: 0.5rem;
		color: var(--text-muted);
	}

	.crypto-chart-sm {
		flex: 1;
		display: flex;
		justify-content: center;
	}

	.crypto-data {
		display: flex;
		align-items: baseline;
		gap: 0.3rem;
		min-width: 80px;
		justify-content: flex-end;
	}

	.crypto-price-sm {
		font-size: 0.6rem;
		font-weight: 500;
		color: var(--text-primary);
		font-variant-numeric: tabular-nums;
	}

	.crypto-change-sm {
		font-size: 0.5rem;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}

	.crypto-change-sm.up { color: var(--success); }
	.crypto-change-sm.down { color: var(--danger); }

	.empty-state {
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>
