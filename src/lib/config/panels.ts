/**
 * Panel configuration
 * Tuned for: governance, AI, crypto, network states, geopolitics
 */

export interface PanelConfig {
	name: string;
	priority: 1 | 2 | 3;
}

export type PanelId =
	| 'map'
	| 'politics'
	| 'tech'
	| 'finance'
	| 'gov'
	| 'heatmap'
	| 'markets'
	| 'monitors'
	| 'commodities'
	| 'crypto'
	| 'polymarket'
	| 'whales'
	| 'mainchar'
	| 'printer'
	| 'contracts'
	| 'ai'
	| 'layoffs'
	| 'networkstates'
	| 'aigovernance'
	| 'etheco'
	| 'leaders'
	| 'intel'
	| 'correlation'
	| 'narrative'
	| 'fed';

export const PANELS: Record<PanelId, PanelConfig> = {
	map: { name: 'Global Map', priority: 1 },
	politics: { name: 'World / Geopolitical', priority: 1 },
	tech: { name: 'Technology', priority: 1 },
	finance: { name: 'Crypto & DeFi', priority: 1 },
	gov: { name: 'Ethereum & Web3', priority: 1 },
	heatmap: { name: 'Sector Heatmap', priority: 2 },
	markets: { name: 'Markets', priority: 1 },
	monitors: { name: 'My Monitors', priority: 1 },
	commodities: { name: 'Commodities / VIX', priority: 2 },
	crypto: { name: 'Crypto Prices', priority: 1 },
	polymarket: { name: 'Polymarket', priority: 1 },
	whales: { name: 'Whale Watch', priority: 2 },
	mainchar: { name: 'Main Character', priority: 2 },
	printer: { name: 'Money Printer', priority: 2 },
	contracts: { name: 'Gov Contracts', priority: 3 },
	ai: { name: 'AI Frontier', priority: 1 },
	layoffs: { name: 'Layoffs Tracker', priority: 3 },
	networkstates: { name: 'Network States Watch', priority: 1 },
	aigovernance: { name: 'AI Governance', priority: 1 },
	etheco: { name: 'Ethereum Ecosystem', priority: 1 },
	leaders: { name: 'World Leaders', priority: 2 },
	intel: { name: 'Long Reads & Analysis', priority: 1 },
	correlation: { name: 'Correlation Engine', priority: 1 },
	narrative: { name: 'Narrative Tracker', priority: 1 },
	fed: { name: 'Federal Reserve', priority: 2 }
};

export const NON_DRAGGABLE_PANELS: PanelId[] = ['map'];

export const MAP_ZOOM_MIN = 1;
export const MAP_ZOOM_MAX = 4;
export const MAP_ZOOM_STEP = 0.5;
