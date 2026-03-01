/**
 * RSS feed and news source configuration
 * Tuned for: governance, AI, crypto, network states, geopolitics
 */

import type { NewsCategory } from '$lib/types';

export interface FeedSource {
	name: string;
	url: string;
}

export interface IntelSource extends FeedSource {
	type: 'think-tank' | 'defense' | 'regional' | 'osint' | 'govt' | 'cyber' | 'governance' | 'crypto';
	topics: string[];
	region?: string;
}

export const FEEDS: Record<NewsCategory, FeedSource[]> = {
	politics: [
		{ name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
		{ name: 'Guardian World', url: 'https://www.theguardian.com/world/rss' },
		{ name: 'NYT World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml' },
		{ name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' }
	],
	tech: [
		{ name: 'Hacker News', url: 'https://hnrss.org/frontpage' },
		{ name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab' },
		{ name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/' },
		{ name: 'Wired', url: 'https://www.wired.com/feed/rss' }
	],
	finance: [
		{ name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
		{ name: 'The Block', url: 'https://www.theblock.co/rss.xml' },
		{ name: 'Decrypt', url: 'https://decrypt.co/feed' },
		{ name: 'CoinTelegraph', url: 'https://cointelegraph.com/rss' },
		{ name: 'DeFi Pulse', url: 'https://defipulse.com/blog/feed/' }
	],
	gov: [
		{ name: 'Ethereum Foundation', url: 'https://blog.ethereum.org/feed.xml' },
		{ name: 'Vitalik Blog', url: 'https://vitalik.eth.limo/feed.xml' },
		{ name: 'Placeholder VC', url: 'https://www.placeholder.vc/blog?format=rss' },
		{ name: 'a16z Crypto', url: 'https://a16zcrypto.com/posts/rss/' }
	],
	ai: [
		{ name: 'OpenAI Blog', url: 'https://openai.com/news/rss.xml' },
		{ name: 'ArXiv AI', url: 'https://rss.arxiv.org/rss/cs.AI' },
		{ name: 'Anthropic', url: 'https://www.anthropic.com/feed.xml' },
		{ name: 'DeepMind Blog', url: 'https://deepmind.google/blog/rss.xml' },
		{ name: 'The Gradient', url: 'https://thegradient.pub/rss/' }
	],
	intel: [
		{ name: 'Palladium Mag', url: 'https://www.palladiummag.com/feed/' },
		{ name: 'Works in Progress', url: 'https://worksinprogress.co/feed' },
		{ name: 'Astral Codex Ten', url: 'https://www.astralcodexten.com/feed' },
		{ name: 'Noahpinion', url: 'https://www.noahpinion.blog/feed' }
	]
};

export const INTEL_SOURCES: IntelSource[] = [
	{
		name: 'Palladium Mag',
		url: 'https://www.palladiummag.com/feed/',
		type: 'governance',
		topics: ['governance', 'institutions', 'civilization']
	},
	{
		name: 'Works in Progress',
		url: 'https://worksinprogress.co/feed',
		type: 'governance',
		topics: ['progress', 'institutions', 'policy']
	},
	{
		name: 'Astral Codex Ten',
		url: 'https://www.astralcodexten.com/feed',
		type: 'governance',
		topics: ['rationality', 'governance', 'prediction']
	},
	{
		name: 'Noahpinion',
		url: 'https://www.noahpinion.blog/feed',
		type: 'governance',
		topics: ['economics', 'geopolitics', 'tech']
	},
	{
		name: 'CoinDesk',
		url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
		type: 'crypto',
		topics: ['crypto', 'defi', 'regulation']
	},
	{
		name: 'The Block',
		url: 'https://www.theblock.co/rss.xml',
		type: 'crypto',
		topics: ['crypto', 'infrastructure']
	},
	{
		name: 'Bellingcat',
		url: 'https://www.bellingcat.com/feed/',
		type: 'osint',
		topics: ['investigation', 'osint']
	},
	{
		name: 'CSIS',
		url: 'https://www.csis.org/analysis/feed',
		type: 'think-tank',
		topics: ['defense', 'geopolitics']
	},
	{
		name: 'Brookings',
		url: 'https://www.brookings.edu/feed/',
		type: 'think-tank',
		topics: ['policy', 'geopolitics']
	},
	{
		name: 'CFR',
		url: 'https://www.cfr.org/rss.xml',
		type: 'think-tank',
		topics: ['foreign-policy']
	},
	{
		name: 'Krebs Security',
		url: 'https://krebsonsecurity.com/feed/',
		type: 'cyber',
		topics: ['cyber', 'security']
	}
];
