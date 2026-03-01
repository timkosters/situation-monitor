/**
 * Onboarding presets
 */

import type { PanelId } from './panels';

export interface Preset {
	id: string;
	name: string;
	icon: string;
	description: string;
	panels: PanelId[];
}

export const PRESETS: Record<string, Preset> = {
	frontier: {
		id: 'frontier',
		name: 'Frontier Observer',
		icon: '///',
		description: 'AI, crypto, governance, network states — the full frontier stack',
		panels: [
			'map',
			'ai',
			'finance',
			'gov',
			'crypto',
			'polymarket',
			'networkstates',
			'correlation',
			'narrative',
			'intel',
			'tech',
			'politics'
		]
	},
	cryptonative: {
		id: 'cryptonative',
		name: 'Crypto Native',
		icon: 'ETH',
		description: 'Markets, DeFi, whale movements, Ethereum ecosystem',
		panels: [
			'crypto',
			'finance',
			'gov',
			'markets',
			'whales',
			'polymarket',
			'heatmap',
			'commodities',
			'printer',
			'map'
		]
	},
	geopolitics: {
		id: 'geopolitics',
		name: 'Geopolitics Watcher',
		icon: 'GEO',
		description: 'Global situation awareness, conflicts, and power shifts',
		panels: [
			'map',
			'intel',
			'leaders',
			'politics',
			'networkstates',
			'correlation',
			'narrative',
			'mainchar'
		]
	},
	airesearcher: {
		id: 'airesearcher',
		name: 'AI Researcher',
		icon: 'AGI',
		description: 'AI frontier, governance, alignment, and tech industry',
		panels: ['ai', 'aigovernance', 'tech', 'correlation', 'narrative', 'mainchar', 'polymarket']
	},
	minimal: {
		id: 'minimal',
		name: 'Minimal',
		icon: '---',
		description: 'Just the essentials — map, headlines, prices',
		panels: ['map', 'politics', 'crypto', 'ai']
	},
	everything: {
		id: 'everything',
		name: 'Everything',
		icon: 'ALL',
		description: 'All panels enabled',
		panels: [
			'map',
			'politics',
			'tech',
			'finance',
			'gov',
			'heatmap',
			'markets',
			'monitors',
			'commodities',
			'crypto',
			'polymarket',
			'whales',
			'mainchar',
			'printer',
			'ai',
			'networkstates',
			'aigovernance',
			'etheco',
			'leaders',
			'intel',
			'correlation',
			'narrative'
		]
	}
};

export const PRESET_ORDER = [
	'frontier',
	'cryptonative',
	'geopolitics',
	'airesearcher',
	'minimal',
	'everything'
];

// Storage keys
export const ONBOARDING_STORAGE_KEY = 'onboardingComplete';
export const PRESET_STORAGE_KEY = 'selectedPreset';
