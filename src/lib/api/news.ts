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
			makeItem('Ayatollah Khamenei killed in US-Israel joint strikes on Iran', 'PBS News', 'https://www.pbs.org/newshour/world/us-and-israel-launch-a-major-attack-on-iran-and-trump-urges-iranians-to-take-over-your-government', 2),
			makeItem('Trump calls for Iranian regime change, says strikes will continue', 'PBS News', 'https://www.pbs.org/newshour/world/us-and-israel-launch-a-major-attack-on-iran-and-trump-urges-iranians-to-take-over-your-government', 4),
			makeItem('Democrats demand emergency vote to reassert war powers over Iran', 'Washington Post', 'https://www.washingtonpost.com/politics/2026/02/28/war-powers-congress-trump-iran/', 6),
			makeItem('CFR: US-Israel Iran strikes could reshape Middle East balance of power', 'CFR', 'https://www.cfr.org/articles/gauging-the-impact-of-massive-u-s-israeli-strikes-on-iran', 8),
			makeItem('Supreme Court strikes down Trump IEEPA tariffs 6-3; new 15% global tariff announced', 'Tax Foundation', 'https://taxfoundation.org/research/all/federal/trump-tariffs-trade-war/', 12),
			makeItem('House votes 219-211 to repeal Canadian tariffs, small GOP group crosses lines', 'Tax Foundation', 'https://taxfoundation.org/research/all/federal/trump-tariffs-trade-war/', 16),
			makeItem('Iran retaliates with strikes on Israel; 1 killed, 121 injured', 'Al Jazeera', 'https://www.aljazeera.com/news/liveblog/2026/2/28/live-israel-launches-attacks-on-iran-multiple-explosions-heard-in-tehran', 18),
			makeItem('1,800+ flights canceled across Middle East following Iran strikes', 'Times of Israel', 'https://www.timesofisrael.com/liveblog-february-28-2026/', 20),
			makeItem('Putin calls Khamenei killing a "cynical murder"', 'Bloomberg', 'https://www.bloomberg.com/news/articles/2026-02-28/ali-khamenei-iran-s-supreme-leader-killed-in-us-israel-strikes', 22),
			makeItem('Secretary Rubio traveling to Israel for post-strike coordination talks', 'NPR', 'https://www.npr.org/2026/02/28/nx-s1-5730151/trump-iran-nuclear-talks', 24)
		],
		tech: [
			makeItem('Trump bans US government from using Anthropic; Pentagon designates it supply chain risk', 'NPR', 'https://www.npr.org/2026/02/27/nx-s1-5729118/trump-anthropic-pentagon-openai-ai-weapons-ban', 2),
			makeItem('OpenAI immediately signs Pentagon deal for classified networks after Anthropic ban', 'Al Jazeera', 'https://www.aljazeera.com/news/2026/2/28/openai-strikes-deal-with-pentagon-to-use-tech-in-classified-network', 4),
			makeItem('200+ Google and OpenAI employees sign letter supporting Anthropic military AI limits', 'TechCrunch', 'https://techcrunch.com/2026/02/27/employees-at-google-and-openai-support-anthropics-pentagon-stand-in-open-letter/', 8),
			makeItem('The trap Anthropic built for itself', 'TechCrunch', 'https://techcrunch.com/2026/02/28/the-trap-anthropic-built-for-itself/', 12),
			makeItem('White House hosting AI data center summit March 4 on electricity demand', 'Yahoo Finance', 'https://finance.yahoo.com/news/live/stock-market-today-dow-drops-800-points-as-sp-500-nasdaq-slide-on-trump-tariff-fears-ai-scare-trade-210027026.html', 18)
		],
		finance: [
			makeItem('Dow drops 800 points on Trump tariff fears and AI scare trade', 'Yahoo Finance', 'https://finance.yahoo.com/news/live/stock-market-today-dow-drops-800-points-as-sp-500-nasdaq-slide-on-trump-tariff-fears-ai-scare-trade-210027026.html', 2),
			makeItem('IBM stock sinks 13% after Anthropic launches AI consulting automation tool', 'Yahoo Finance', 'https://finance.yahoo.com/news/live/stock-market-today-dow-drops-800-points-as-sp-500-nasdaq-slide-on-trump-tariff-fears-ai-scare-trade-210027026.html', 6),
			makeItem('Trump announces new 15% global tariff under Section 122 after SCOTUS ruling', 'Tax Foundation', 'https://taxfoundation.org/research/all/federal/trump-tariffs-trade-war/', 10),
			makeItem('Stocks drop on hot PPI data; core PPI +0.8% vs +0.3% expected', 'Motley Fool', 'https://www.fool.com/investing/2026/02/26/wall-street-stock-market-return-2026-crush-average/', 14),
			makeItem('Wall Street median forecast: S&P 500 to reach 7,650 by year-end', 'Motley Fool', 'https://www.fool.com/investing/2026/02/26/wall-street-stock-market-return-2026-crush-average/', 20)
		],
		gov: [
			makeItem('Bitcoin falls to ~$65K on tariff shock and Middle East escalation', 'CNBC', 'https://www.cnbc.com/2026/02/23/bitcoin-falls-to-nearly-64000-as-2026-crypto-woes-continue-.html', 3),
			makeItem('SOL gains 4.5% to $84.74 as geopolitical selloff eases; down 17% on month', 'dMarket Forces', 'https://dmarketforces.com/sol-gains-4-5-as-geopolitical-selloffs-ease/', 8),
			makeItem('Solana Alpenglow consensus upgrade targeting sub-second finality, Q1 mainnet', 'CoinDesk', 'https://www.coindesk.com/tech/2026/01/03/ethereum-and-solana-set-the-stage-for-2026-s-defi-reboot', 12),
			makeItem('Crypto market funding drops 19.3% in February 2026 to $864M', 'CoinDesk', 'https://www.coindesk.com/tech/2026/01/03/ethereum-and-solana-set-the-stage-for-2026-s-defi-reboot', 18),
			makeItem('Flash crash: single sell order triggers 30% drop on decentralized perp exchange', 'CoinDesk', 'https://www.coindesk.com/tech/2026/01/03/ethereum-and-solana-set-the-stage-for-2026-s-defi-reboot', 22)
		],
		ai: [
			makeItem('Trump bans Anthropic from US government; Pentagon calls it "supply chain risk"', 'NPR', 'https://www.npr.org/2026/02/27/nx-s1-5729118/trump-anthropic-pentagon-openai-ai-weapons-ban', 2),
			makeItem('OpenAI signs Pentagon deal for classified networks hours after Anthropic ban', 'Al Jazeera', 'https://www.aljazeera.com/news/2026/2/28/openai-strikes-deal-with-pentagon-to-use-tech-in-classified-network', 4),
			makeItem('200+ employees at Google and OpenAI back Anthropic stance on military AI limits', 'TechCrunch', 'https://techcrunch.com/2026/02/27/employees-at-google-and-openai-support-anthropics-pentagon-stand-in-open-letter/', 8),
			makeItem('Anthropic launches AI tool to automate consulting analysis, IBM drops 13%', 'Yahoo Finance', 'https://finance.yahoo.com/news/live/stock-market-today-dow-drops-800-points-as-sp-500-nasdaq-slide-on-trump-tariff-fears-ai-scare-trade-210027026.html', 14),
			makeItem('NASA Perseverance rover navigates Mars using AI-planned routes for first time', 'NPR', 'https://www.npr.org/2026/02/27/nx-s1-5729118/trump-anthropic-pentagon-openai-ai-weapons-ban', 20)
		],
		intel: [
			makeItem('Praxis reaches 151K citizens from 80 countries; targets non-US city location', 'Praxis Nation', 'https://www.praxisnation.com/news/financing-announcement-10-24', 4),
			makeItem('Prospera vs Honduras: $11B arbitration claim equals 31% of Honduras GDP', 'Liberation News', 'https://liberationnews.org/honduras-prospera-investment-colony/', 10),
			makeItem('Scientists begin first human trials of DNA repair therapies targeting aging', 'yourNEWS', 'https://yournews.com/2026/02/28/6563273/scientists-are-testing-dna-repair-therapies-in-humans-what/', 14),
			makeItem('Partial epigenetic reprogramming therapy ER-100 entering human clinical trials', 'Longevity Technology', 'https://longevity.technology/news/ais-role-in-the-next-era-of-longevity-biotech/', 18),
			makeItem('VitaDAO governance forum: longevity network state discussion gains traction', 'VitaDAO', 'https://gov.vitadao.com/t/longevity-network-state-x-praxis-prospera-et-al/982', 22)
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
