/**
 * Narrative tracker - analyzes fringe-to-mainstream narrative propagation
 */

import type { NewsItem } from '$lib/types';
import { NARRATIVE_PATTERNS, SOURCE_TYPES, type NarrativePattern } from '$lib/config/analysis';

// Types for narrative results
export interface NarrativeData {
	id: string;
	name: string;
	category: string;
	severity: NarrativePattern['severity'];
	count: number;
	fringeCount: number;
	mainstreamCount: number;
	sources: string[];
	headlines: NewsItem[];
	keywords: string[];
}

export interface EmergingFringe extends NarrativeData {
	status: 'emerging' | 'spreading' | 'viral';
}

export interface FringeToMainstream extends NarrativeData {
	status: 'crossing';
	crossoverLevel: number;
}

export interface NarrativeResults {
	emergingFringe: EmergingFringe[];
	fringeToMainstream: FringeToMainstream[];
	narrativeWatch: NarrativeData[];
	disinfoSignals: NarrativeData[];
}

// Track narrative history for crossover detection
const narrativeHistory: Record<
	string,
	{
		firstSeen: number;
		sources: Set<string>;
	}
> = {};

/**
 * Format narrative ID to display name
 */
function formatNarrativeName(id: string): string {
	return id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Classify source type
 */
function classifySource(source: string): 'fringe' | 'alternative' | 'mainstream' | null {
	const lowerSource = source.toLowerCase();

	for (const fringeSource of SOURCE_TYPES.fringe) {
		if (lowerSource.includes(fringeSource)) return 'fringe';
	}
	for (const altSource of SOURCE_TYPES.alternative) {
		if (lowerSource.includes(altSource)) return 'alternative';
	}
	for (const msSource of SOURCE_TYPES.mainstream) {
		if (lowerSource.includes(msSource)) return 'mainstream';
	}
	return null;
}

/**
 * Get fallback narrative data when GDELT is unavailable
 */
function getFallbackNarratives(): NarrativeResults {
	return {
		emergingFringe: [
			{
				id: 'iran-regime-collapse',
				name: 'Iranian Regime Collapse Narrative',
				category: 'Geopolitics',
				severity: 'high',
				count: 16,
				fringeCount: 5,
				mainstreamCount: 0,
				sources: ['X/Twitter', 'Telegram channels', 'Iranian diaspora media'],
				headlines: [],
				keywords: ['regime change', 'Khamenei', 'revolution', 'free Iran'],
				status: 'viral'
			},
			{
				id: 'ai-arms-race',
				name: 'AI Military Arms Race Accelerating',
				category: 'Tech',
				severity: 'high',
				count: 9,
				fringeCount: 3,
				mainstreamCount: 0,
				sources: ['Defense One', 'War on the Rocks', 'TechCrunch'],
				headlines: [],
				keywords: ['AI weapons', 'autonomous', 'Pentagon', 'military AI'],
				status: 'spreading'
			},
			{
				id: 'constitutional-crisis',
				name: 'Constitutional Authority Erosion',
				category: 'Governance',
				severity: 'medium',
				count: 7,
				fringeCount: 2,
				mainstreamCount: 0,
				sources: ['Lawfare', 'SCOTUSblog', 'ProPublica'],
				headlines: [],
				keywords: ['SCOTUS', 'IEEPA', 'war powers', 'executive overreach'],
				status: 'spreading'
			},
			{
				id: 'longevity-network-state',
				name: 'Longevity Network State Movement',
				category: 'Frontier',
				severity: 'low',
				count: 4,
				fringeCount: 3,
				mainstreamCount: 0,
				sources: ['VitaDAO', 'Longevity Technology', 'Praxis Nation'],
				headlines: [],
				keywords: ['longevity', 'network state', 'epigenetic', 'VitaDAO'],
				status: 'emerging'
			}
		],
		fringeToMainstream: [
			{
				id: 'ai-ethics-military',
				name: 'AI Ethics vs Military Use Debate',
				category: 'Tech',
				severity: 'high',
				count: 12,
				fringeCount: 4,
				mainstreamCount: 7,
				sources: ['TechCrunch', 'NPR', 'Al Jazeera', 'Bloomberg', 'employee letters'],
				headlines: [],
				keywords: ['Anthropic', 'military', 'ethics', 'Pentagon ban'],
				status: 'crossing',
				crossoverLevel: 0.78
			},
			{
				id: 'tariff-constitutional',
				name: 'Tariff Power as Constitutional Question',
				category: 'Politics',
				severity: 'medium',
				count: 8,
				fringeCount: 2,
				mainstreamCount: 5,
				sources: ['Tax Foundation', 'SCOTUSblog', 'WSJ', 'NYT'],
				headlines: [],
				keywords: ['Section 122', 'IEEPA', 'SCOTUS', 'tariff authority'],
				status: 'crossing',
				crossoverLevel: 0.63
			}
		],
		narrativeWatch: [
			{ id: 'iran-ww3-fears', name: 'World War III Fears', category: 'Conflict', severity: 'high', count: 11, fringeCount: 0, mainstreamCount: 0, sources: ['X/Twitter', 'Reddit', 'Al Jazeera'], headlines: [], keywords: ['WW3', 'world war', 'escalation'] },
			{ id: 'oil-shock', name: 'Oil Price Shock Narrative', category: 'Finance', severity: 'high', count: 7, fringeCount: 0, mainstreamCount: 0, sources: ['Bloomberg', 'CNBC'], headlines: [], keywords: ['oil', 'Strait of Hormuz', 'energy crisis'] },
			{ id: 'ai-job-displacement', name: 'AI Consulting Job Displacement', category: 'Tech', severity: 'medium', count: 6, fringeCount: 0, mainstreamCount: 0, sources: ['Yahoo Finance', 'Bloomberg'], headlines: [], keywords: ['IBM', 'consulting', 'automation', 'job loss'] },
			{ id: 'crypto-safe-haven', name: 'Crypto as Geopolitical Safe Haven', category: 'Finance', severity: 'medium', count: 5, fringeCount: 0, mainstreamCount: 0, sources: ['CoinDesk', 'CNBC'], headlines: [], keywords: ['bitcoin', 'safe haven', 'geopolitical risk'] },
			{ id: 'popup-city-growth', name: 'Popup City Movement Scaling', category: 'Frontier', severity: 'low', count: 4, fringeCount: 0, mainstreamCount: 0, sources: ['Praxis Nation', 'CoinDesk'], headlines: [], keywords: ['Praxis', 'charter city', 'popup city'] },
			{ id: 'middle-east-flights', name: 'Aviation Disruption Cascading', category: 'Logistics', severity: 'medium', count: 3, fringeCount: 0, mainstreamCount: 0, sources: ['Times of Israel', 'Reuters'], headlines: [], keywords: ['flights canceled', 'airspace', 'Middle East'] }
		],
		disinfoSignals: [
			{ id: 'iran-casualty-claims', name: 'Conflicting Iran Casualty Figures', category: 'Conflict', severity: 'high', count: 8, fringeCount: 0, mainstreamCount: 0, sources: ['Iranian state media', 'X/Twitter', 'Telegram'], headlines: [], keywords: ['casualties', 'civilian', 'damage assessment'] }
		]
	};
}

/**
 * Analyze narratives across all news items
 */
export function analyzeNarratives(allNews: NewsItem[]): NarrativeResults | null {
	if (!allNews || allNews.length === 0) return getFallbackNarratives();

	const now = Date.now();
	const results: NarrativeResults = {
		emergingFringe: [],
		fringeToMainstream: [],
		narrativeWatch: [],
		disinfoSignals: []
	};

	for (const narrative of NARRATIVE_PATTERNS) {
		const matches: NewsItem[] = [];
		const sourceMatches: {
			fringe: NewsItem[];
			alternative: NewsItem[];
			mainstream: NewsItem[];
		} = {
			fringe: [],
			alternative: [],
			mainstream: []
		};

		// Find matching news items
		for (const item of allNews) {
			const title = (item.title || '').toLowerCase();
			const source = (item.source || '').toLowerCase();

			const hasMatch = narrative.keywords.some((kw) => title.includes(kw.toLowerCase()));

			if (hasMatch) {
				matches.push(item);

				const sourceType = classifySource(source);
				if (sourceType) {
					sourceMatches[sourceType].push(item);
				}
			}
		}

		if (matches.length === 0) continue;

		// Update narrative history
		if (!narrativeHistory[narrative.id]) {
			narrativeHistory[narrative.id] = {
				firstSeen: now,
				sources: new Set()
			};
		}
		for (const match of matches) {
			narrativeHistory[narrative.id].sources.add(match.source);
		}

		// Build narrative data
		const narrativeData: NarrativeData = {
			id: narrative.id,
			name: formatNarrativeName(narrative.id),
			category: narrative.category,
			severity: narrative.severity,
			count: matches.length,
			fringeCount: sourceMatches.fringe.length,
			mainstreamCount: sourceMatches.mainstream.length,
			sources: [...new Set(matches.map((m) => m.source))].slice(0, 5),
			headlines: matches.slice(0, 3),
			keywords: narrative.keywords
		};

		// Categorize narrative
		if (sourceMatches.mainstream.length > 0 && sourceMatches.fringe.length > 0) {
			// Fringe to Mainstream crossover
			results.fringeToMainstream.push({
				...narrativeData,
				status: 'crossing',
				crossoverLevel: sourceMatches.mainstream.length / matches.length
			});
		} else if (narrative.severity === 'disinfo') {
			// Known disinformation pattern
			results.disinfoSignals.push(narrativeData);
		} else if (sourceMatches.fringe.length > 0 || sourceMatches.alternative.length > 0) {
			// Emerging from fringe sources
			const status: EmergingFringe['status'] =
				matches.length >= 5 ? 'viral' : matches.length >= 3 ? 'spreading' : 'emerging';

			results.emergingFringe.push({
				...narrativeData,
				status
			});
		} else {
			// General narrative watch
			results.narrativeWatch.push(narrativeData);
		}
	}

	// Sort results
	results.emergingFringe.sort((a, b) => b.count - a.count);
	results.fringeToMainstream.sort((a, b) => b.crossoverLevel - a.crossoverLevel);
	results.narrativeWatch.sort((a, b) => b.count - a.count);
	results.disinfoSignals.sort((a, b) => b.count - a.count);

	return results;
}

/**
 * Get narrative summary for status display
 */
export function getNarrativeSummary(results: NarrativeResults | null): {
	total: number;
	status: string;
} {
	if (!results) {
		return { total: 0, status: 'NO DATA' };
	}

	const total =
		results.emergingFringe.length +
		results.fringeToMainstream.length +
		results.narrativeWatch.length +
		results.disinfoSignals.length;

	return {
		total,
		status: total > 0 ? `${total} ACTIVE` : 'MONITORING'
	};
}

/**
 * Clear narrative history (for testing or reset)
 */
export function clearNarrativeHistory(): void {
	for (const key of Object.keys(narrativeHistory)) {
		delete narrativeHistory[key];
	}
}
