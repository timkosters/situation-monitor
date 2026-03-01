/**
 * Analysis configuration - correlation topics, narrative patterns, source classification
 * Tuned for: governance, AI, crypto, network states, geopolitics
 */

export interface CorrelationTopic {
	id: string;
	patterns: RegExp[];
	category: string;
}

export interface NarrativePattern {
	id: string;
	keywords: string[];
	category: string;
	severity: 'watch' | 'emerging' | 'spreading' | 'disinfo';
}

export interface SourceTypes {
	fringe: string[];
	alternative: string[];
	mainstream: string[];
}

export const CORRELATION_TOPICS: CorrelationTopic[] = [
	// Crypto & DeFi
	{
		id: 'ethereum-ecosystem',
		patterns: [/ethereum/i, /vitalik/i, /eip-/i, /layer\s*2/i, /rollup/i, /blob/i],
		category: 'Crypto'
	},
	{
		id: 'defi-regulation',
		patterns: [/defi.*regulat/i, /sec.*crypto/i, /crypto.*ban/i, /stablecoin.*law/i, /mica/i],
		category: 'Crypto'
	},
	{
		id: 'bitcoin-macro',
		patterns: [/bitcoin/i, /btc.*etf/i, /bitcoin.*treasury/i, /bitcoin.*reserve/i],
		category: 'Crypto'
	},
	{
		id: 'dao-governance',
		patterns: [/\bdao\b/i, /on-chain.*governance/i, /token.*voting/i, /quadratic/i, /governance.*attack/i],
		category: 'Governance'
	},
	// AI
	{
		id: 'ai-frontier',
		patterns: [/\bgpt/i, /claude/i, /gemini.*ai/i, /frontier.*model/i, /\bllm\b/i, /foundation.*model/i],
		category: 'AI'
	},
	{
		id: 'ai-regulation',
		patterns: [/ai regulation/i, /ai.*law/i, /ai safety/i, /ai governance/i, /ai act/i, /alignment/i],
		category: 'AI'
	},
	{
		id: 'ai-agents',
		patterns: [/ai agent/i, /autonomous.*agent/i, /tool.*use/i, /agentic/i, /mcp.*server/i],
		category: 'AI'
	},
	// Geopolitics
	{
		id: 'china-tensions',
		patterns: [/china.*taiwan/i, /south china sea/i, /us.*china/i, /beijing.*washington/i],
		category: 'Geopolitics'
	},
	{
		id: 'russia-ukraine',
		patterns: [/ukraine/i, /zelensky/i, /putin.*war/i, /crimea/i, /donbas/i],
		category: 'Conflict'
	},
	{
		id: 'israel-gaza',
		patterns: [/gaza/i, /hamas/i, /netanyahu/i, /israel.*attack/i, /hostage/i],
		category: 'Conflict'
	},
	// Network States & Governance
	{
		id: 'network-states',
		patterns: [/network state/i, /popup city/i, /charter city/i, /startup societ/i, /special economic zone/i, /zede/i],
		category: 'Governance'
	},
	{
		id: 'digital-democracy',
		patterns: [/digital democracy/i, /e-residency/i, /digital identity/i, /quadratic voting/i, /liquid democracy/i],
		category: 'Governance'
	},
	{
		id: 'public-goods',
		patterns: [/public goods/i, /retroactive.*funding/i, /gitcoin/i, /hypercert/i, /impact.*certificate/i, /quadratic funding/i],
		category: 'Funding'
	},
	// Economy
	{
		id: 'fed-rates',
		patterns: [/federal reserve/i, /interest rate/i, /rate cut/i, /rate hike/i, /powell/i, /fomc/i],
		category: 'Economy'
	},
	{
		id: 'dollar-system',
		patterns: [/dollar collapse/i, /dedollarization/i, /brics currency/i, /cbdc/i, /stablecoin/i],
		category: 'Economy'
	},
	// Science & Longevity
	{
		id: 'longevity',
		patterns: [/longevity/i, /aging.*reverse/i, /lifespan/i, /senolytics/i, /rapamycin/i],
		category: 'Science'
	},
	{
		id: 'desci',
		patterns: [/desci/i, /decentralized science/i, /open science/i, /ip-nft/i, /molecule.*dao/i],
		category: 'Science'
	},
	{
		id: 'psychedelics',
		patterns: [/psychedelic/i, /psilocybin/i, /mdma.*therapy/i, /ketamine.*clinic/i, /consciousness/i],
		category: 'Science'
	}
];

export const NARRATIVE_PATTERNS: NarrativePattern[] = [
	{
		id: 'ai-doom',
		keywords: ['ai doom', 'ai extinction', 'superintelligence risk', 'agi danger', 'existential risk'],
		category: 'AI',
		severity: 'emerging'
	},
	{
		id: 'ai-consciousness',
		keywords: ['ai sentient', 'ai conscious', 'ai feelings', 'ai alive'],
		category: 'AI',
		severity: 'emerging'
	},
	{
		id: 'cbdc-surveillance',
		keywords: ['cbdc control', 'digital currency surveillance', 'social credit', 'programmable money'],
		category: 'Crypto',
		severity: 'watch'
	},
	{
		id: 'crypto-winter',
		keywords: ['crypto dead', 'bitcoin crash', 'defi collapse', 'rug pull'],
		category: 'Crypto',
		severity: 'watch'
	},
	{
		id: 'network-state-hype',
		keywords: ['network state', 'balaji', 'cloud country', 'startup society'],
		category: 'Governance',
		severity: 'emerging'
	},
	{
		id: 'governance-innovation',
		keywords: ['quadratic voting', 'futarchy', 'prediction market governance', 'liquid democracy'],
		category: 'Governance',
		severity: 'emerging'
	},
	{
		id: 'robot-replacement',
		keywords: ['robots replacing', 'automation unemployment', 'job automation', 'ai unemployment'],
		category: 'Economy',
		severity: 'spreading'
	},
	{
		id: 'dollar-collapse',
		keywords: ['dollar collapse', 'dedollarization', 'brics currency', 'petrodollar death'],
		category: 'Finance',
		severity: 'spreading'
	},
	{
		id: 'longevity-escape',
		keywords: ['longevity escape velocity', 'cure aging', 'immortality', 'reverse aging'],
		category: 'Science',
		severity: 'emerging'
	},
	{
		id: 'ubi-momentum',
		keywords: ['universal basic income', 'ubi pilot', 'ubi experiment', 'guaranteed income'],
		category: 'Policy',
		severity: 'emerging'
	}
];

export const SOURCE_TYPES: SourceTypes = {
	fringe: [
		'zerohedge',
		'infowars',
		'naturalnews',
		'gateway'
	],
	alternative: ['substack', 'mirror.xyz', 'farcaster', 'paragraph', 'telegram'],
	mainstream: [
		'reuters',
		'ap news',
		'bbc',
		'nytimes',
		'wsj',
		'guardian',
		'coindesk',
		'the block',
		'decrypt',
		'techcrunch',
		'wired',
		'mit tech review'
	]
};

// Main character patterns for tracking prominent figures
export interface PersonPattern {
	pattern: RegExp;
	name: string;
}

export const PERSON_PATTERNS: PersonPattern[] = [
	{ pattern: /\bvitalik\b/gi, name: 'Vitalik Buterin' },
	{ pattern: /\bsam\s*altman\b/gi, name: 'Sam Altman' },
	{ pattern: /\belon\b|\bmusk\b/gi, name: 'Elon Musk' },
	{ pattern: /\bbalaji\b/gi, name: 'Balaji Srinivasan' },
	{ pattern: /\bdario\s*amodei\b|\bamodei\b/gi, name: 'Dario Amodei' },
	{ pattern: /\btrump\b/gi, name: 'Trump' },
	{ pattern: /\bputin\b/gi, name: 'Putin' },
	{ pattern: /\bxi\s*jinping\b/gi, name: 'Xi Jinping' },
	{ pattern: /\bjensen\s*huang\b|\bhuang\b/gi, name: 'Jensen Huang' },
	{ pattern: /\bgary\s*gensler\b|\bgensler\b/gi, name: 'Gary Gensler' },
	{ pattern: /\bchangpeng\b|\bcz\b.*binance/gi, name: 'CZ (Binance)' },
	{ pattern: /\bbrian\s*armstrong\b/gi, name: 'Brian Armstrong' },
	{ pattern: /\bzelensky\b/gi, name: 'Zelensky' },
	{ pattern: /\bnetanyahu\b/gi, name: 'Netanyahu' },
	{ pattern: /\bjerome\s*powell\b|\bpowell\b/gi, name: 'Jerome Powell' },
	{ pattern: /\baudrey\s*tang\b/gi, name: 'Audrey Tang' },
	{ pattern: /\bglen\s*weyl\b|\bweyl\b/gi, name: 'Glen Weyl' },
	{ pattern: /\bzuckerberg\b/gi, name: 'Zuckerberg' },
	{ pattern: /\bsundar\s*pichai\b|\bpichai\b/gi, name: 'Sundar Pichai' },
	{ pattern: /\bdemis\s*hassabis\b|\bhassabis\b/gi, name: 'Demis Hassabis' }
];
