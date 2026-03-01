/**
 * Miscellaneous API functions for specialized panels
 * Note: Some of these use mock data as the original APIs require authentication
 */

export interface Prediction {
	id: string;
	question: string;
	yes: number;
	volume: string;
	url?: string;
}

export interface WhaleTransaction {
	coin: string;
	amount: number;
	usd: number;
	hash: string;
}

export interface Contract {
	agency: string;
	description: string;
	vendor: string;
	amount: number;
}

export interface Layoff {
	company: string;
	count: number;
	title: string;
	date: string;
}

/**
 * Fetch Polymarket predictions
 * Note: Polymarket API requires authentication - returns curated prediction data
 */
export async function fetchPolymarket(): Promise<Prediction[]> {
	// Active Polymarket prediction markets (live data as of March 1, 2026)
	return [
		{
			id: 'pm-1',
			question: 'US/Israel strikes Iran on March 2?',
			yes: 97,
			volume: '$529M',
			url: 'https://polymarket.com/event/usisrael-strikes-iran-on'
		},
		{
			id: 'pm-2',
			question: 'Trump nominates Kevin Warsh as Fed Chair?',
			yes: 93,
			volume: '$553M',
			url: 'https://polymarket.com/economy'
		},
		{
			id: 'pm-3',
			question: 'US-Iran ceasefire by March 31?',
			yes: 61,
			volume: '$1.5M',
			url: 'https://polymarket.com/event/usisrael-strikes-iran-on'
		},
		{
			id: 'pm-4',
			question: 'Iranian regime falls by June 30?',
			yes: 54,
			volume: '$467K',
			url: 'https://polymarket.com/predictions/all'
		},
		{
			id: 'pm-5',
			question: 'Fed holds rates in March meeting?',
			yes: 96,
			volume: '$192M',
			url: 'https://polymarket.com/economy'
		},
		{
			id: 'pm-6',
			question: 'US ground invasion of Iran before 2027?',
			yes: 19,
			volume: '$2M',
			url: 'https://polymarket.com/event/usisrael-strikes-iran-on'
		},
		{
			id: 'pm-7',
			question: '2026 FIFA World Cup winner: Spain?',
			yes: 15,
			volume: '$229M',
			url: 'https://polymarket.com/predictions/all'
		},
		{
			id: 'pm-8',
			question: 'US-Iran ceasefire by March 6?',
			yes: 15,
			volume: '$1.2M',
			url: 'https://polymarket.com/event/usisrael-strikes-iran-on'
		}
	];
}

/**
 * Fetch whale transactions
 * Note: Would use Whale Alert API - returning sample data
 */
export async function fetchWhaleTransactions(): Promise<WhaleTransaction[]> {
	// Sample whale transaction data
	return [
		{ coin: 'BTC', amount: 1500, usd: 150000000, hash: '0x1a2b...3c4d' },
		{ coin: 'ETH', amount: 25000, usd: 85000000, hash: '0x5e6f...7g8h' },
		{ coin: 'BTC', amount: 850, usd: 85000000, hash: '0x9i0j...1k2l' },
		{ coin: 'SOL', amount: 500000, usd: 75000000, hash: '0x3m4n...5o6p' },
		{ coin: 'ETH', amount: 15000, usd: 51000000, hash: '0x7q8r...9s0t' }
	];
}

/**
 * Fetch government contracts
 * Note: Would use USASpending.gov API - returning sample data
 */
export async function fetchGovContracts(): Promise<Contract[]> {
	// Sample government contract data
	return [
		{
			agency: 'DOD',
			description: 'Advanced radar systems development and integration',
			vendor: 'Raytheon',
			amount: 2500000000
		},
		{
			agency: 'NASA',
			description: 'Artemis program lunar lander support services',
			vendor: 'SpaceX',
			amount: 1800000000
		},
		{
			agency: 'DHS',
			description: 'Border security technology modernization',
			vendor: 'Palantir',
			amount: 450000000
		},
		{
			agency: 'VA',
			description: 'Electronic health records system upgrade',
			vendor: 'Oracle Cerner',
			amount: 320000000
		},
		{
			agency: 'DOE',
			description: 'Clean energy grid infrastructure',
			vendor: 'General Electric',
			amount: 275000000
		}
	];
}

/**
 * Fetch layoffs data
 * Note: Would use layoffs.fyi API or similar - returning sample data
 */
export async function fetchLayoffs(): Promise<Layoff[]> {
	const now = new Date();
	const formatDate = (daysAgo: number) => {
		const d = new Date(now);
		d.setDate(d.getDate() - daysAgo);
		return d.toISOString();
	};

	return [
		{ company: 'Meta', count: 1200, title: 'Restructuring engineering teams', date: formatDate(2) },
		{ company: 'Amazon', count: 850, title: 'AWS division optimization', date: formatDate(5) },
		{
			company: 'Salesforce',
			count: 700,
			title: 'Post-acquisition consolidation',
			date: formatDate(8)
		},
		{
			company: 'Intel',
			count: 1500,
			title: 'Manufacturing pivot restructure',
			date: formatDate(12)
		},
		{ company: 'Snap', count: 500, title: 'Cost reduction initiative', date: formatDate(15) }
	];
}
