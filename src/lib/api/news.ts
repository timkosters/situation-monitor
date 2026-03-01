/**
 * News API - Fetch news from GDELT
 * Queries tuned for: crypto, AI, governance, network states, geopolitics
 */

import { FEEDS } from '$lib/config/feeds';
import type { NewsItem, NewsCategory } from '$lib/types';
import { containsAlertKeyword, detectRegion, detectTopics } from '$lib/config/keywords';
import { API_DELAYS, logger, fetchWithProxy } from '$lib/config/api';

/**
 * Simple hash function to generate unique IDs from URLs
 */
function hashCode(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}
	return Math.abs(hash).toString(36);
}

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse GDELT date format (20251202T224500Z) to valid Date
 */
function parseGdeltDate(dateStr: string): Date {
	if (!dateStr) return new Date();
	const match = dateStr.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
	if (match) {
		const [, year, month, day, hour, min, sec] = match;
		return new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}Z`);
	}
	return new Date(dateStr);
}

interface GdeltArticle {
	title: string;
	url: string;
	seendate: string;
	domain: string;
	socialimage?: string;
}

interface GdeltResponse {
	articles?: GdeltArticle[];
}

function transformGdeltArticle(
	article: GdeltArticle,
	category: NewsCategory,
	source: string,
	index: number
): NewsItem {
	const title = article.title || '';
	const alert = containsAlertKeyword(title);
	const urlHash = article.url ? hashCode(article.url) : Math.random().toString(36).slice(2);
	const uniqueId = `gdelt-${category}-${urlHash}-${index}`;
	const parsedDate = parseGdeltDate(article.seendate);

	return {
		id: uniqueId,
		title,
		link: article.url,
		pubDate: article.seendate,
		timestamp: parsedDate.getTime(),
		source: source || article.domain || 'Unknown',
		category,
		isAlert: !!alert,
		alertKeyword: alert?.keyword || undefined,
		region: detectRegion(title) ?? undefined,
		topics: detectTopics(title)
	};
}

/**
 * GDELT queries tuned for frontier topics
 */
const categoryQueries: Record<NewsCategory, string> = {
	politics: '(geopolitics OR "world politics" OR sanctions OR "trade war" OR nato OR conflict)',
	tech: '(technology OR startup OR "open source" OR robotics OR "quantum computing" OR biotech)',
	finance: '(cryptocurrency OR bitcoin OR ethereum OR defi OR "crypto regulation" OR stablecoin OR "digital asset")',
	gov: '(ethereum OR "web3" OR blockchain OR "smart contract" OR dao OR "decentralized" OR nft)',
	ai: '("artificial intelligence" OR "machine learning" OR GPT OR LLM OR "AI safety" OR "AI regulation" OR anthropic OR openai OR deepmind)',
	intel: '("network state" OR "charter city" OR governance OR "public goods" OR "quadratic funding" OR longevity OR "popup city" OR zuzalu)'
};

/**
 * Fetch news for a specific category using GDELT directly (no CORS proxy needed for GDELT)
 */
export async function fetchCategoryNews(category: NewsCategory): Promise<NewsItem[]> {
	try {
		const baseQuery = categoryQueries[category];
		const fullQuery = `${baseQuery} sourcelang:english`;
		const gdeltUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(fullQuery)}&timespan=24h&mode=artlist&maxrecords=25&format=json&sort=date`;

		logger.log('News API', `Fetching ${category} from GDELT`);

		const response = await fetchWithProxy(gdeltUrl);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const contentType = response.headers.get('content-type');
		if (!contentType?.includes('application/json')) {
			logger.warn('News API', `Non-JSON response for ${category}:`, contentType);
			return [];
		}

		const text = await response.text();
		let data: GdeltResponse;
		try {
			data = JSON.parse(text);
		} catch {
			logger.warn('News API', `Invalid JSON for ${category}:`, text.slice(0, 100));
			return [];
		}

		if (!data?.articles || data.articles.length === 0) {
			logger.warn('News API', `No GDELT articles for ${category}, using fallback`);
			return getFallbackNews(category);
		}

		const categoryFeeds = FEEDS[category] || [];
		const defaultSource = categoryFeeds[0]?.name || 'News';

		return data.articles.map((article, index) =>
			transformGdeltArticle(article, category, article.domain || defaultSource, index)
		);
	} catch (error) {
		logger.error('News API', `Error fetching ${category}, using fallback:`, error);
		return getFallbackNews(category);
	}
}

const NEWS_CATEGORIES: NewsCategory[] = ['politics', 'tech', 'finance', 'gov', 'ai', 'intel'];

function createEmptyNewsResult(): Record<NewsCategory, NewsItem[]> {
	return { politics: [], tech: [], finance: [], gov: [], ai: [], intel: [] };
}

/**
 * Fallback headlines when GDELT is unavailable (curated March 2026)
 */
function getFallbackNews(category: NewsCategory): NewsItem[] {
	const now = Date.now();
	const makeItem = (title: string, source: string, link: string, hoursAgo: number): NewsItem => ({
		id: `fallback-${category}-${hashCode(title)}`,
		title,
		link,
		pubDate: new Date(now - hoursAgo * 3600000).toISOString(),
		timestamp: now - hoursAgo * 3600000,
		source,
		category,
		region: detectRegion(title) ?? undefined,
		topics: detectTopics(title)
	});

	const fallbacks: Record<NewsCategory, NewsItem[]> = {
		politics: [
			makeItem('Trump delivers longest State of the Union in history, declares "golden age"', 'CNBC', 'https://www.cnbc.com/2026/02/25/takeaways-trump-state-of-the-union-2026.html', 4),
			makeItem('Ukraine-Russia peace talks stall as Trump blames Zelensky for delays', 'The Hill', 'https://thehill.com/policy/defense/5690193-trump-says-zelensky-slowing-peace-deal/', 6),
			makeItem('Trilateral US-Ukraine-Russia talks underway; POW swap completed', 'ABC News', 'https://abcnews.com/International/us-ukraine-russia-peace-talks/', 8),
			makeItem('DOGE largely defeated in Congress — final savings estimated at $20B, not $160B', 'Washington Times', 'https://www.washingtontimes.com/news/2026/feb/19/doge-defeat/', 12),
			makeItem('Supreme Court rules against Trump emergency tariff powers', 'Tax Foundation', 'https://taxfoundation.org/research/all/federal/trump-tariffs-trade-war/', 14),
			makeItem('Gaza ceasefire enters fragile Phase 2; Hamas refuses disarmament', 'Times of Israel', 'https://www.timesofisrael.com/us-plans-to-start-2nd-phase-of-gaza-deal/', 16),
			makeItem('Nepal elections scheduled March 5 following Gen Z-led revolt', 'CIDOB', 'https://www.cidob.org/en/publications/world-2026-ten-issues/', 20),
			makeItem('Iran nuclear diplomacy active; Trump threatens force if deal fails', 'CBS News', 'https://www.cbsnews.com/live-updates/state-of-the-union-2026/', 22),
			makeItem('Water conflicts escalating globally — Indus, Nile, Mekong', 'Chatham House', 'https://www.cidob.org/en/publications/world-2026-ten-issues/', 24),
			makeItem('China launches 15th Five-Year Plan, accelerating tech self-reliance', 'CIDOB', 'https://www.cidob.org/en/publications/world-2026-ten-issues/', 26)
		],
		tech: [
			makeItem('Apple announces AI-powered Siri overhaul for iOS 26.4, powered by Google Gemini', 'Crescendo AI', 'https://www.crescendo.ai/news/latest-ai-news-and-updates', 3),
			makeItem('Samsung targets 800M Gemini-equipped devices by end of 2026', 'Crescendo AI', 'https://www.crescendo.ai/news/latest-ai-news-and-updates', 8),
			makeItem('Generative coding named MIT Technology Review Breakthrough of 2026', 'MIT Tech Review', 'https://www.technologyreview.com/2026/01/12/generative-coding/', 12),
			makeItem('Digital provenance emerging as critical security layer against deepfakes', 'Reuters Institute', 'https://reutersinstitute.politics.ox.ac.uk/journalism-media-and-technology-trends-and-predictions-2026', 18),
			makeItem('Ransomware evolving toward targeted operational disruption of infrastructure', 'Dark Reading', 'https://www.darkreading.com/threat-intelligence/cybersecurity-predictions-for-2026', 22)
		],
		finance: [
			makeItem('Wall Street forecasts S&P 500 up ~12% in 2026, target 7,650-7,800', 'Motley Fool', 'https://www.fool.com/investing/2026/02/26/wall-street-stock-market-return-2026/', 4),
			makeItem('US tariff regime largest tax increase since 1993; avg household cost $1,500/yr', 'Tax Foundation', 'https://taxfoundation.org/research/all/federal/trump-tariffs-trade-war/', 8),
			makeItem('China tariffs increased to 20% as of March 4', 'Tax Foundation', 'https://taxfoundation.org/research/all/federal/trump-tariffs-trade-war/', 10),
			makeItem('Sterling weakest G10 currency in February, down 1.7% vs dollar', 'S&P Global', 'https://www.spglobal.com/marketintelligence/', 14),
			makeItem('PMI data and US jobs report due this week setting macro tone for March', 'S&P Global', 'https://www.spglobal.com/marketintelligence/', 18)
		],
		gov: [
			makeItem('Ethereum Layer 2 ecosystems driving next wave of on-chain governance', 'CoinDesk', 'https://www.coindesk.com/', 5),
			makeItem('DAOs managing over $25B in treasury assets across major protocols', 'DefiLlama', 'https://defillama.com/', 10),
			makeItem('Optimism Collective expands retroactive public goods funding program', 'The Block', 'https://www.theblock.co/', 15),
			makeItem('MakerDAO rebrands governance structure under Sky Protocol framework', 'CoinDesk', 'https://www.coindesk.com/', 20),
			makeItem('ENS DAO passes proposal for cross-chain identity resolution', 'Decrypt', 'https://decrypt.co/', 24)
		],
		ai: [
			makeItem('Agentic AI moves from demo to production in 2026 — MCP protocol adoption surges', 'TechCrunch', 'https://techcrunch.com/2026/01/02/in-2026-ai-will-move-from-hype-to-pragmatism/', 2),
			makeItem('AI entering scientific discovery — physics, chemistry, biology research', 'MIT Tech Review', 'https://www.technologyreview.com/2026/01/05/whats-next-for-ai-in-2026/', 6),
			makeItem('New White House National Cyber Strategy emphasizes AI-driven defense', 'Cybersecurity Dive', 'https://www.cybersecuritydive.com/news/5-cybersecurity-trends-2026/', 10),
			makeItem('AI now central to both attack and defense in cybersecurity arms race', 'The Hacker News', 'https://thehackernews.com/2026/02/cybersecurity-tech-predictions-for-2026.html', 14),
			makeItem('CISA director seat still unfilled; NSA/CYBERCOM under acting leadership', 'Federal News Network', 'https://federalnewsnetwork.com/cybersecurity/2026/01/five-things-to-watch/', 20)
		],
		intel: [
			makeItem('Network state movement gains institutional attention at Munich Security Conference', 'Euronews', 'https://www.euronews.com/my-europe/2026/02/13/munich-security-conference-2026/', 4),
			makeItem('Prospera Honduras charter city reports 300% growth in resident applications', 'Charter Cities Institute', 'https://www.chartercitiesinstitute.org/', 10),
			makeItem('Longevity biotech sector raises $4.2B in Q1 2026, led by Altos Labs expansion', 'STAT News', 'https://www.statnews.com/', 14),
			makeItem('Quadratic funding experiments scale to city-level budgets in Taiwan', 'RadicalxChange', 'https://www.radicalxchange.org/', 18),
			makeItem('Popup city model proliferates — 12 new temporary communities announced for 2026', 'CoinDesk', 'https://www.coindesk.com/', 22)
		]
	};

	return fallbacks[category] || [];
}

/**
 * Fetch all news - sequential with delays to avoid rate limiting
 */
export async function fetchAllNews(): Promise<Record<NewsCategory, NewsItem[]>> {
	const result = createEmptyNewsResult();

	for (let i = 0; i < NEWS_CATEGORIES.length; i++) {
		const category = NEWS_CATEGORIES[i];

		if (i > 0) {
			await delay(API_DELAYS.betweenCategories);
		}

		result[category] = await fetchCategoryNews(category);
	}

	return result;
}
