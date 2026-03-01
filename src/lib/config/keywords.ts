/**
 * Keyword configuration for alerts and categorization
 * Tuned for: governance, AI, crypto, network states, geopolitics
 */

export const ALERT_KEYWORDS = [
	'war',
	'invasion',
	'military',
	'nuclear',
	'sanctions',
	'missile',
	'attack',
	'conflict',
	'coup',
	'emergency',
	'hack',
	'exploit',
	'rug pull',
	'depeg',
	'crash',
	'sec enforcement',
	'ban crypto',
	'agi',
	'superintelligence',
	'existential risk',
	'alignment failure',
	'network state',
	'charter city',
	'special economic zone'
] as const;

export type AlertKeyword = (typeof ALERT_KEYWORDS)[number];

export const REGION_KEYWORDS: Record<string, string[]> = {
	EUROPE: [
		'eu',
		'european',
		'ukraine',
		'russia',
		'germany',
		'berlin',
		'france',
		'uk',
		'britain',
		'switzerland',
		'zug',
		'liechtenstein',
		'estonia'
	],
	MENA: [
		'iran',
		'israel',
		'saudi',
		'dubai',
		'uae',
		'qatar',
		'bahrain',
		'gaza',
		'lebanon'
	],
	APAC: [
		'china',
		'taiwan',
		'japan',
		'korea',
		'singapore',
		'hong kong',
		'india',
		'bhutan',
		'indonesia',
		'thailand'
	],
	AMERICAS: ['us', 'america', 'canada', 'brazil', 'argentina', 'patagonia', 'colorado', 'california', 'wyoming'],
	AFRICA: ['africa', 'kenya', 'nigeria', 'ethiopia', 'tanzania', 'zanzibar', 'prospera', 'honduras']
};

export const TOPIC_KEYWORDS: Record<string, string[]> = {
	CRYPTO: ['ethereum', 'bitcoin', 'defi', 'dao', 'nft', 'layer 2', 'rollup', 'staking', 'validator', 'token', 'airdrop', 'protocol'],
	AI: ['gpt', 'llm', 'transformer', 'anthropic', 'openai', 'deepmind', 'alignment', 'agi', 'compute', 'inference', 'training', 'frontier model'],
	GOVERNANCE: ['governance', 'dao', 'quadratic', 'voting', 'delegation', 'proposal', 'constitution', 'charter', 'legitimacy', 'coordination'],
	NETWORK_STATES: ['network state', 'popup city', 'popup village', 'zuzalu', 'edge city', 'edge esmeralda', 'charter city', 'special economic zone', 'seasteading', 'free city', 'startup society'],
	SCIENCE: ['longevity', 'biotech', 'neurotech', 'consciousness', 'psychedelics', 'desci', 'open science', 'replication crisis'],
	FUNDING: ['grant', 'retroactive', 'public goods', 'quadratic funding', 'gitcoin', 'optimism', 'hypercerts', 'impact certificate']
};

/**
 * Check if a headline contains alert keywords
 */
export function containsAlertKeyword(text: string): { isAlert: boolean; keyword?: string } {
	const lowerText = text.toLowerCase();
	for (const keyword of ALERT_KEYWORDS) {
		if (lowerText.includes(keyword)) {
			return { isAlert: true, keyword };
		}
	}
	return { isAlert: false };
}

/**
 * Detect region from text
 */
export function detectRegion(text: string): string | null {
	const lowerText = text.toLowerCase();
	for (const [region, keywords] of Object.entries(REGION_KEYWORDS)) {
		if (keywords.some((k) => lowerText.includes(k))) {
			return region;
		}
	}
	return null;
}

/**
 * Detect topics from text
 */
export function detectTopics(text: string): string[] {
	const lowerText = text.toLowerCase();
	const detected: string[] = [];
	for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
		if (keywords.some((k) => lowerText.includes(k))) {
			detected.push(topic);
		}
	}
	return detected;
}
