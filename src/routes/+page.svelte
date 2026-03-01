<script lang="ts">
	import { onMount } from 'svelte';
	import { Header, Dashboard } from '$lib/components/layout';
	import { SettingsModal, MonitorFormModal, OnboardingModal } from '$lib/components/modals';
	import {
		NewsPanel,
		MarketsPanel,
		HeatmapPanel,
		CommoditiesPanel,
		CryptoPanel,
		MainCharPanel,
		CorrelationPanel,
		NarrativePanel,
		MonitorsPanel,
		MapPanel,
		WhalePanel,
		PolymarketPanel,
		ContractsPanel,
		LayoffsPanel,
		IntelPanel,
		SituationPanel,
		WorldLeadersPanel,
		PrinterPanel,
		FedPanel
	} from '$lib/components/panels';
	import {
		news,
		markets,
		monitors,
		settings,
		refresh,
		allNewsItems,
		fedIndicators,
		fedNews
	} from '$lib/stores';
	import {
		fetchAllNews,
		fetchAllMarkets,
		fetchPolymarket,
		fetchWhaleTransactions,
		fetchGovContracts,
		fetchLayoffs,
		fetchWorldLeaders,
		fetchFedIndicators,
		fetchFedNews
	} from '$lib/api';
	import type { Prediction, WhaleTransaction, Contract, Layoff } from '$lib/api';
	import type { CustomMonitor, WorldLeader } from '$lib/types';
	import type { PanelId } from '$lib/config';

	// Modal state
	let settingsOpen = $state(false);
	let monitorFormOpen = $state(false);
	let onboardingOpen = $state(false);
	let editingMonitor = $state<CustomMonitor | null>(null);

	// Misc panel data
	let predictions = $state<Prediction[]>([]);
	let whales = $state<WhaleTransaction[]>([]);
	let contracts = $state<Contract[]>([]);
	let layoffs = $state<Layoff[]>([]);
	let leaders = $state<WorldLeader[]>([]);
	let leadersLoading = $state(false);

	// Data fetching
	async function loadNews() {
		// Set loading for all categories
		const categories = ['politics', 'tech', 'finance', 'gov', 'ai', 'intel'] as const;
		categories.forEach((cat) => news.setLoading(cat, true));

		try {
			const data = await fetchAllNews();
			Object.entries(data).forEach(([category, items]) => {
				news.setItems(category as keyof typeof data, items);
			});
		} catch (error) {
			categories.forEach((cat) => news.setError(cat, String(error)));
		}
	}

	async function loadMarkets() {
		try {
			const data = await fetchAllMarkets();
			markets.setIndices(data.indices);
			markets.setSectors(data.sectors);
			markets.setCommodities(data.commodities);
			markets.setCrypto(data.crypto);
		} catch (error) {
			console.error('Failed to load markets:', error);
		}
	}

	async function loadMiscData() {
		try {
			const [predictionsData, whalesData, contractsData, layoffsData] = await Promise.all([
				fetchPolymarket(),
				fetchWhaleTransactions(),
				fetchGovContracts(),
				fetchLayoffs()
			]);
			predictions = predictionsData;
			whales = whalesData;
			contracts = contractsData;
			layoffs = layoffsData;
		} catch (error) {
			console.error('Failed to load misc data:', error);
		}
	}

	async function loadWorldLeaders() {
		if (!isPanelVisible('leaders')) return;
		leadersLoading = true;
		try {
			leaders = await fetchWorldLeaders();
		} catch (error) {
			console.error('Failed to load world leaders:', error);
		} finally {
			leadersLoading = false;
		}
	}

	async function loadFedData() {
		if (!isPanelVisible('fed')) return;
		fedIndicators.setLoading(true);
		fedNews.setLoading(true);
		try {
			const [indicatorsData, newsData] = await Promise.all([fetchFedIndicators(), fetchFedNews()]);
			fedIndicators.setData(indicatorsData);
			fedNews.setItems(newsData);
		} catch (error) {
			console.error('Failed to load Fed data:', error);
			fedIndicators.setError(String(error));
			fedNews.setError(String(error));
		}
	}

	// Refresh handlers
	async function handleRefresh() {
		refresh.startRefresh();
		try {
			await Promise.all([loadNews(), loadMarkets()]);
			refresh.endRefresh();
		} catch (error) {
			refresh.endRefresh([String(error)]);
		}
	}

	// Monitor handlers
	function handleCreateMonitor() {
		editingMonitor = null;
		monitorFormOpen = true;
	}

	function handleEditMonitor(monitor: CustomMonitor) {
		editingMonitor = monitor;
		monitorFormOpen = true;
	}

	function handleDeleteMonitor(id: string) {
		monitors.deleteMonitor(id);
	}

	function handleToggleMonitor(id: string) {
		monitors.toggleMonitor(id);
	}

	// Get panel visibility
	function isPanelVisible(id: PanelId): boolean {
		return $settings.enabled[id] !== false;
	}

	// Handle preset selection from onboarding
	function handleSelectPreset(presetId: string) {
		settings.applyPreset(presetId);
		onboardingOpen = false;
		// Refresh data after applying preset
		handleRefresh();
	}

	// Show onboarding again (called from settings)
	function handleReconfigure() {
		settingsOpen = false;
		settings.resetOnboarding();
		onboardingOpen = true;
	}

	// Initial load
	onMount(() => {
		// Check if first visit
		if (!settings.isOnboardingComplete()) {
			onboardingOpen = true;
		}

		// Load initial data and track as refresh
		async function initialLoad() {
			refresh.startRefresh();
			try {
				await Promise.all([
					loadNews(),
					loadMarkets(),
					loadMiscData(),
					loadWorldLeaders(),
					loadFedData()
				]);
				refresh.endRefresh();
			} catch (error) {
				refresh.endRefresh([String(error)]);
			}
		}
		initialLoad();
		refresh.setupAutoRefresh(handleRefresh);

		return () => {
			refresh.stopAutoRefresh();
		};
	});
</script>

<svelte:head>
	<title>R2 Situation Monitor</title>
	<meta name="description" content="Real-time frontier monitoring — AI, crypto, governance, network states" />
</svelte:head>

<div class="app">
	<Header onSettingsClick={() => (settingsOpen = true)} />

	<main class="main-content">
		<div class="split-layout">
			<!-- Left side: feeds -->
			<div class="feeds-column">
				<Dashboard>
					<!-- News Panels -->
					{#if isPanelVisible('politics')}
						<div class="panel-slot">
							<NewsPanel category="politics" panelId="politics" title="Politics" />
						</div>
					{/if}

					{#if isPanelVisible('tech')}
						<div class="panel-slot">
							<NewsPanel category="tech" panelId="tech" title="Tech" />
						</div>
					{/if}

					{#if isPanelVisible('finance')}
						<div class="panel-slot">
							<NewsPanel category="finance" panelId="finance" title="Crypto & DeFi" />
						</div>
					{/if}

					{#if isPanelVisible('gov')}
						<div class="panel-slot">
							<NewsPanel category="gov" panelId="gov" title="Ethereum & Web3" />
						</div>
					{/if}

					{#if isPanelVisible('ai')}
						<div class="panel-slot">
							<NewsPanel category="ai" panelId="ai" title="AI Frontier" />
						</div>
					{/if}

					<!-- Markets Panels -->
					{#if isPanelVisible('markets')}
						<div class="panel-slot">
							<MarketsPanel />
						</div>
					{/if}

					{#if isPanelVisible('heatmap')}
						<div class="panel-slot">
							<HeatmapPanel />
						</div>
					{/if}

					{#if isPanelVisible('commodities')}
						<div class="panel-slot">
							<CommoditiesPanel />
						</div>
					{/if}

					{#if isPanelVisible('crypto')}
						<div class="panel-slot">
							<CryptoPanel />
						</div>
					{/if}

					<!-- Analysis Panels -->
					{#if isPanelVisible('mainchar')}
						<div class="panel-slot">
							<MainCharPanel />
						</div>
					{/if}

					{#if isPanelVisible('correlation')}
						<div class="panel-slot">
							<CorrelationPanel news={$allNewsItems} />
						</div>
					{/if}

					{#if isPanelVisible('narrative')}
						<div class="panel-slot">
							<NarrativePanel news={$allNewsItems} />
						</div>
					{/if}

					<!-- Intel Panel -->
					{#if isPanelVisible('intel')}
						<div class="panel-slot">
							<IntelPanel />
						</div>
					{/if}

					<!-- Fed Panel -->
					{#if isPanelVisible('fed')}
						<div class="panel-slot">
							<FedPanel />
						</div>
					{/if}

					<!-- World Leaders Panel -->
					{#if isPanelVisible('leaders')}
						<div class="panel-slot">
							<WorldLeadersPanel {leaders} loading={leadersLoading} />
						</div>
					{/if}

					<!-- Situation Panels -->
					{#if isPanelVisible('networkstates')}
						<div class="panel-slot">
							<SituationPanel
								panelId="networkstates"
								config={{
									title: 'Network States Watch',
									subtitle: 'Popup cities, charter cities, startup societies',
									criticalKeywords: ['network state', 'charter city', 'zuzalu', 'edge city', 'popup city', 'prospera', 'special economic zone', 'seasteading']
								}}
								news={$allNewsItems.filter(
									(n) => {
										const t = n.title.toLowerCase();
										return t.includes('network state') ||
											t.includes('charter city') ||
											t.includes('zuzalu') ||
											t.includes('popup') ||
											t.includes('prospera') ||
											t.includes('special economic zone') ||
											t.includes('startup societ');
									}
								)}
							/>
						</div>
					{/if}

					{#if isPanelVisible('aigovernance')}
						<div class="panel-slot">
							<SituationPanel
								panelId="aigovernance"
								config={{
									title: 'AI Governance',
									subtitle: 'Regulation, alignment, safety, and policy',
									criticalKeywords: ['ai regulation', 'alignment', 'ai safety', 'ai act', 'agi', 'superintelligence', 'existential risk', 'pause ai']
								}}
								news={$allNewsItems.filter(
									(n) => {
										const t = n.title.toLowerCase();
										return t.includes('ai regulat') ||
											t.includes('ai safety') ||
											t.includes('alignment') ||
											t.includes('ai act') ||
											t.includes('agi') ||
											t.includes('superintelligen') ||
											t.includes('ai governance') ||
											t.includes('ai policy');
									}
								)}
							/>
						</div>
					{/if}

					{#if isPanelVisible('etheco')}
						<div class="panel-slot">
							<SituationPanel
								panelId="etheco"
								config={{
									title: 'Ethereum Ecosystem',
									subtitle: 'L2s, DeFi, governance, public goods funding',
									criticalKeywords: ['ethereum', 'vitalik', 'layer 2', 'optimism', 'arbitrum', 'gitcoin', 'ens', 'eip']
								}}
								news={$allNewsItems.filter(
									(n) => {
										const t = n.title.toLowerCase();
										return t.includes('ethereum') ||
											t.includes('vitalik') ||
											t.includes('layer 2') ||
											t.includes('optimism') ||
											t.includes('arbitrum') ||
											t.includes('gitcoin') ||
											t.includes('eip-') ||
											t.includes('ens ');
									}
								)}
							/>
						</div>
					{/if}

					<!-- Placeholder panels for additional data sources -->
					{#if isPanelVisible('whales')}
						<div class="panel-slot">
							<WhalePanel {whales} />
						</div>
					{/if}

					{#if isPanelVisible('polymarket')}
						<div class="panel-slot">
							<PolymarketPanel {predictions} />
						</div>
					{/if}

					{#if isPanelVisible('contracts')}
						<div class="panel-slot">
							<ContractsPanel {contracts} />
						</div>
					{/if}

					{#if isPanelVisible('layoffs')}
						<div class="panel-slot">
							<LayoffsPanel {layoffs} />
						</div>
					{/if}

					<!-- Money Printer Panel -->
					{#if isPanelVisible('printer')}
						<div class="panel-slot">
							<PrinterPanel />
						</div>
					{/if}

					<!-- Custom Monitors (always last) -->
					{#if isPanelVisible('monitors')}
						<div class="panel-slot">
							<MonitorsPanel
								monitors={$monitors.monitors}
								matches={$monitors.matches}
								onCreateMonitor={handleCreateMonitor}
								onEditMonitor={handleEditMonitor}
								onDeleteMonitor={handleDeleteMonitor}
								onToggleMonitor={handleToggleMonitor}
							/>
						</div>
					{/if}
				</Dashboard>
			</div>

			<!-- Right side: map (quarter screen) -->
			{#if isPanelVisible('map')}
				<div class="map-column">
					<MapPanel monitors={$monitors.monitors} />
				</div>
			{/if}
		</div>
	</main>

	<!-- Modals -->
	<SettingsModal
		open={settingsOpen}
		onClose={() => (settingsOpen = false)}
		onReconfigure={handleReconfigure}
	/>
	<MonitorFormModal
		open={monitorFormOpen}
		onClose={() => (monitorFormOpen = false)}
		editMonitor={editingMonitor}
	/>
	<OnboardingModal open={onboardingOpen} onSelectPreset={handleSelectPreset} />
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--bg);
	}

	.main-content {
		flex: 1;
		padding: 0.5rem;
		overflow-y: auto;
	}

	.split-layout {
		display: flex;
		gap: 0.5rem;
		max-width: 2000px;
		margin: 0 auto;
	}

	.feeds-column {
		flex: 3;
		min-width: 0;
	}

	.map-column {
		flex: 1;
		position: sticky;
		top: 0.5rem;
		height: calc(100vh - 4rem);
		min-width: 300px;
	}

	.map-column :global(.panel) {
		height: 100%;
	}

	.map-column :global(.map-container),
	.map-column :global(svg) {
		height: 100% !important;
	}

	@media (max-width: 900px) {
		.split-layout {
			flex-direction: column-reverse;
		}

		.map-column {
			position: relative;
			height: 300px;
			min-width: unset;
		}
	}
</style>
