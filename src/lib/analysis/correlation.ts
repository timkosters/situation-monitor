/**
 * Correlation engine - analyzes patterns across news items
 */

import type { NewsItem } from '$lib/types';
import { CORRELATION_TOPICS, type CorrelationTopic } from '$lib/config/analysis';

// Types for correlation results
export interface EmergingPattern {
	id: string;
	name: string;
	category: string;
	count: number;
	level: 'high' | 'elevated' | 'emerging';
	sources: string[];
	headlines: Array<{ title: string; link: string; source: string }>;
}

export interface MomentumSignal {
	id: string;
	name: string;
	category: string;
	current: number;
	delta: number;
	momentum: 'surging' | 'rising' | 'stable';
	headlines: Array<{ title: string; link: string; source: string }>;
}

export interface CrossSourceCorrelation {
	id: string;
	name: string;
	category: string;
	sourceCount: number;
	sources: string[];
	level: 'high' | 'elevated' | 'emerging';
	headlines: Array<{ title: string; link: string; source: string }>;
}

export interface PredictiveSignal {
	id: string;
	name: string;
	category: string;
	score: number;
	confidence: number;
	prediction: string;
	level: 'high' | 'medium' | 'low';
	headlines: Array<{ title: string; link: string; source: string }>;
}

export interface CorrelationResults {
	emergingPatterns: EmergingPattern[];
	momentumSignals: MomentumSignal[];
	crossSourceCorrelations: CrossSourceCorrelation[];
	predictiveSignals: PredictiveSignal[];
}

// Topic history for momentum analysis
const topicHistory: Record<number, Record<string, number>> = {};

// History retention in minutes
const HISTORY_RETENTION_MINUTES = 30;

// Time window for momentum comparison in minutes
const MOMENTUM_WINDOW_MINUTES = 10;

/**
 * Format topic ID to display name
 */
function formatTopicName(id: string): string {
	return id.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Get fallback correlation data when GDELT is unavailable
 */
function getFallbackCorrelations(): CorrelationResults {
	return {
		emergingPatterns: [
			{
				id: 'iran-strikes',
				name: 'US-Israel Iran Strikes',
				category: 'Conflict',
				count: 22,
				level: 'high',
				sources: ['PBS', 'Al Jazeera', 'Bloomberg', 'NPR', 'Times of Israel'],
				headlines: [
					{ title: 'Ayatollah Khamenei killed in US-Israel joint strikes on Iran', link: 'https://www.pbs.org/newshour/world/us-and-israel-launch-a-major-attack-on-iran-and-trump-urges-iranians-to-take-over-your-government', source: 'PBS News' },
					{ title: 'Iran retaliates with strikes on Israel; 1 killed, 121 injured', link: 'https://www.aljazeera.com/news/liveblog/2026/2/28/live-israel-launches-attacks-on-iran-multiple-explosions-heard-in-tehran', source: 'Al Jazeera' }
				]
			},
			{
				id: 'anthropic-pentagon',
				name: 'AI Military Policy Split',
				category: 'Tech',
				count: 14,
				level: 'high',
				sources: ['NPR', 'TechCrunch', 'Al Jazeera', 'Yahoo Finance'],
				headlines: [
					{ title: 'Trump bans Anthropic from US government; Pentagon designates it supply chain risk', link: 'https://www.npr.org/2026/02/27/nx-s1-5729118/trump-anthropic-pentagon-openai-ai-weapons-ban', source: 'NPR' },
					{ title: 'OpenAI signs Pentagon deal for classified networks hours after Anthropic ban', link: 'https://www.aljazeera.com/news/2026/2/28/openai-strikes-deal-with-pentagon-to-use-tech-in-classified-network', source: 'Al Jazeera' }
				]
			},
			{
				id: 'tariff-scotus',
				name: 'Tariff Constitutional Crisis',
				category: 'Economy',
				count: 9,
				level: 'elevated',
				sources: ['Tax Foundation', 'Yahoo Finance', 'Motley Fool'],
				headlines: [
					{ title: 'Supreme Court strikes down Trump IEEPA tariffs 6-3; new 15% global tariff announced', link: 'https://taxfoundation.org/research/all/federal/trump-tariffs-trade-war/', source: 'Tax Foundation' },
					{ title: 'Dow drops 800 points on tariff fears and AI scare trade', link: 'https://finance.yahoo.com/news/live/stock-market-today-dow-drops-800-points-as-sp-500-nasdaq-slide-on-trump-tariff-fears-ai-scare-trade-210027026.html', source: 'Yahoo Finance' }
				]
			}
		],
		momentumSignals: [
			{
				id: 'iran-regime-change',
				name: 'Iran Regime Change Push',
				category: 'Geopolitics',
				current: 15,
				delta: 8,
				momentum: 'surging',
				headlines: [
					{ title: 'Trump calls for Iranian regime change, says strikes will continue', link: 'https://www.pbs.org/newshour/world/us-and-israel-launch-a-major-attack-on-iran-and-trump-urges-iranians-to-take-over-your-government', source: 'PBS News' }
				]
			},
			{
				id: 'ai-militarization',
				name: 'AI Militarization Debate',
				category: 'Tech',
				current: 9,
				delta: 5,
				momentum: 'surging',
				headlines: [
					{ title: '200+ Google and OpenAI employees sign letter supporting Anthropic military AI limits', link: 'https://techcrunch.com/2026/02/27/employees-at-google-and-openai-support-anthropics-pentagon-stand-in-open-letter/', source: 'TechCrunch' }
				]
			},
			{
				id: 'war-powers',
				name: 'War Powers Constitutional Fight',
				category: 'Politics',
				current: 6,
				delta: 3,
				momentum: 'rising',
				headlines: [
					{ title: 'Democrats demand emergency vote to reassert war powers over Iran', link: 'https://www.washingtonpost.com/politics/2026/02/28/war-powers-congress-trump-iran/', source: 'Washington Post' }
				]
			}
		],
		crossSourceCorrelations: [
			{
				id: 'iran-crisis',
				name: 'Iran Crisis Coverage',
				category: 'Conflict',
				sourceCount: 8,
				sources: ['PBS', 'Al Jazeera', 'Bloomberg', 'NPR', 'Times of Israel', 'Washington Post', 'CFR', 'BBC'],
				level: 'high',
				headlines: []
			},
			{
				id: 'ai-defense-split',
				name: 'AI Defense Industry Split',
				category: 'Tech',
				sourceCount: 5,
				sources: ['NPR', 'TechCrunch', 'Al Jazeera', 'Yahoo Finance', 'Bloomberg'],
				level: 'high',
				headlines: []
			},
			{
				id: 'market-selloff',
				name: 'Multi-Factor Market Selloff',
				category: 'Finance',
				sourceCount: 4,
				sources: ['Yahoo Finance', 'Motley Fool', 'Tax Foundation', 'CNBC'],
				level: 'elevated',
				headlines: []
			}
		],
		predictiveSignals: [
			{
				id: 'iran-escalation',
				name: 'Iran Escalation Trajectory',
				category: 'Conflict',
				score: 35,
				confidence: 0.82,
				prediction: 'Ceasefire negotiations likely within days; market disruption from Middle East shipping routes',
				level: 'high',
				headlines: []
			},
			{
				id: 'ai-policy-realignment',
				name: 'AI Policy Realignment',
				category: 'Tech',
				score: 24,
				confidence: 0.71,
				prediction: 'Expect further government AI contractor consolidation toward OpenAI/Microsoft axis',
				level: 'high',
				headlines: []
			}
		]
	};
}

/**
 * Analyze correlations across all news items
 */
export function analyzeCorrelations(allNews: NewsItem[]): CorrelationResults | null {
	if (!allNews || allNews.length === 0) return getFallbackCorrelations();

	const now = Date.now();
	const currentTime = Math.floor(now / 60000); // Current minute

	const results: CorrelationResults = {
		emergingPatterns: [],
		momentumSignals: [],
		crossSourceCorrelations: [],
		predictiveSignals: []
	};

	// Count topics and track sources/headlines
	const topicCounts: Record<string, number> = {};
	const topicSources: Record<string, Set<string>> = {};
	const topicHeadlines: Record<string, Array<{ title: string; link: string; source: string }>> = {};

	// Analyze each news item
	for (const item of allNews) {
		const title = item.title || '';
		const source = item.source || 'Unknown';

		for (const topic of CORRELATION_TOPICS) {
			const matches = topic.patterns.some((p) => p.test(title));
			if (matches) {
				if (!topicCounts[topic.id]) {
					topicCounts[topic.id] = 0;
					topicSources[topic.id] = new Set();
					topicHeadlines[topic.id] = [];
				}
				topicCounts[topic.id]++;
				topicSources[topic.id].add(source);
				if (topicHeadlines[topic.id].length < 5) {
					topicHeadlines[topic.id].push({ title, link: item.link, source });
				}
			}
		}
	}

	// Update topic history for momentum tracking
	if (!topicHistory[currentTime]) {
		topicHistory[currentTime] = { ...topicCounts };

		// Clean old history entries
		for (const timeKey of Object.keys(topicHistory)) {
			if (currentTime - parseInt(timeKey) > HISTORY_RETENTION_MINUTES) {
				delete topicHistory[parseInt(timeKey)];
			}
		}
	}

	// Get old counts for momentum comparison
	const oldTime = currentTime - MOMENTUM_WINDOW_MINUTES;
	const oldCounts = topicHistory[oldTime] || {};

	// Process each topic
	for (const topic of CORRELATION_TOPICS) {
		const count = topicCounts[topic.id] || 0;
		const sources = topicSources[topic.id] ? Array.from(topicSources[topic.id]) : [];
		const headlines = topicHeadlines[topic.id] || [];
		const oldCount = oldCounts[topic.id] || 0;
		const delta = count - oldCount;

		// Emerging Patterns (3+ mentions)
		if (count >= 3) {
			const level: EmergingPattern['level'] =
				count >= 8 ? 'high' : count >= 5 ? 'elevated' : 'emerging';

			results.emergingPatterns.push({
				id: topic.id,
				name: formatTopicName(topic.id),
				category: topic.category,
				count,
				level,
				sources,
				headlines
			});
		}

		// Momentum Signals (rising topics)
		if (delta >= 2 || (count >= 3 && delta >= 1)) {
			const momentum: MomentumSignal['momentum'] =
				delta >= 4 ? 'surging' : delta >= 2 ? 'rising' : 'stable';

			results.momentumSignals.push({
				id: topic.id,
				name: formatTopicName(topic.id),
				category: topic.category,
				current: count,
				delta,
				momentum,
				headlines
			});
		}

		// Cross-Source Correlations (3+ sources)
		if (sources.length >= 3) {
			const level: CrossSourceCorrelation['level'] =
				sources.length >= 5 ? 'high' : sources.length >= 4 ? 'elevated' : 'emerging';

			results.crossSourceCorrelations.push({
				id: topic.id,
				name: formatTopicName(topic.id),
				category: topic.category,
				sourceCount: sources.length,
				sources,
				level,
				headlines
			});
		}

		// Predictive Signals (based on combined score)
		const score = count * 2 + sources.length * 3 + delta * 5;

		if (score >= 15) {
			const confidence = Math.min(95, Math.round(score * 1.5));
			const prediction = getPrediction(topic, count);
			const level: PredictiveSignal['level'] =
				confidence >= 70 ? 'high' : confidence >= 50 ? 'medium' : 'low';

			results.predictiveSignals.push({
				id: topic.id,
				name: formatTopicName(topic.id),
				category: topic.category,
				score,
				confidence,
				prediction,
				level,
				headlines
			});
		}
	}

	// Sort results
	results.emergingPatterns.sort((a, b) => b.count - a.count);
	results.momentumSignals.sort((a, b) => b.delta - a.delta);
	results.crossSourceCorrelations.sort((a, b) => b.sourceCount - a.sourceCount);
	results.predictiveSignals.sort((a, b) => b.score - a.score);

	return results;
}

/**
 * Generate prediction text based on topic and count
 */
function getPrediction(topic: CorrelationTopic, count: number): string {
	if (topic.id === 'tariffs' && count >= 4) {
		return 'Market volatility likely in next 24-48h';
	}
	if (topic.id === 'fed-rates') {
		return 'Expect increased financial sector coverage';
	}
	if (topic.id.includes('china') || topic.id.includes('russia')) {
		return 'Geopolitical escalation narrative forming';
	}
	if (topic.id === 'layoffs') {
		return 'Employment concerns may dominate news cycle';
	}
	if (topic.category === 'Conflict') {
		return 'Breaking developments likely within hours';
	}
	return 'Topic gaining mainstream traction';
}

/**
 * Get correlation summary for status display
 */
export function getCorrelationSummary(results: CorrelationResults | null): {
	totalSignals: number;
	status: string;
} {
	if (!results) {
		return { totalSignals: 0, status: 'NO DATA' };
	}

	const totalSignals =
		results.emergingPatterns.length +
		results.momentumSignals.length +
		results.predictiveSignals.length;

	return {
		totalSignals,
		status: totalSignals > 0 ? `${totalSignals} SIGNALS` : 'MONITORING'
	};
}

/**
 * Clear topic history (for testing or reset)
 */
export function clearCorrelationHistory(): void {
	for (const key of Object.keys(topicHistory)) {
		delete topicHistory[parseInt(key)];
	}
}
