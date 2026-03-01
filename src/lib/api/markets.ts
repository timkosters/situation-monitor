/**
 * Markets API - Fetch market data from Finnhub
 *
 * Get your free API key at: https://finnhub.io/
 * Free tier: 60 calls/minute
 */

import { INDICES, SECTORS, COMMODITIES, CRYPTO } from '$lib/config/markets';
import type { MarketItem, SectorPerformance, CryptoItem } from '$lib/types';
import { fetchWithProxy, logger, FINNHUB_API_KEY, FINNHUB_BASE_URL } from '$lib/config/api';

interface CoinGeckoMarketItem {
	id: string;
	symbol: string;
	name: string;
	current_price: number;
	price_change_percentage_24h: number;
	sparkline_in_7d?: { price: number[] };
	market_cap: number;
}

interface FinnhubQuote {
	c: number; // Current price
	d: number; // Change
	dp: number; // Percent change
	h: number; // High price of the day
	l: number; // Low price of the day
	o: number; // Open price of the day
	pc: number; // Previous close price
	t: number; // Timestamp
}

/**
 * Check if Finnhub API key is configured
 */
function hasFinnhubApiKey(): boolean {
	return Boolean(FINNHUB_API_KEY && FINNHUB_API_KEY.length > 0);
}

/**
 * Create an empty market item (used for error/missing data states)
 */
function createEmptyMarketItem<T extends 'index' | 'commodity'>(
	symbol: string,
	name: string,
	type: T
): MarketItem {
	return { symbol, name, price: NaN, change: NaN, changePercent: NaN, type };
}

/**
 * Create an empty sector performance item
 */
function createEmptySectorItem(symbol: string, name: string): SectorPerformance {
	return { symbol, name, price: NaN, change: NaN, changePercent: NaN };
}

// Map index symbols to ETF proxies (free tier doesn't support direct indices)
const INDEX_ETF_MAP: Record<string, string> = {
	'^DJI': 'DIA', // Dow Jones -> SPDR Dow Jones ETF
	'^GSPC': 'SPY', // S&P 500 -> SPDR S&P 500 ETF
	'^IXIC': 'QQQ', // NASDAQ -> Invesco QQQ (NASDAQ-100)
	'^RUT': 'IWM' // Russell 2000 -> iShares Russell 2000 ETF
};

/**
 * Fetch a quote from Finnhub
 */
async function fetchFinnhubQuote(symbol: string): Promise<FinnhubQuote | null> {
	try {
		const url = `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data: FinnhubQuote = await response.json();

		// Finnhub returns all zeros when symbol not found
		if (data.c === 0 && data.pc === 0) {
			return null;
		}

		return data;
	} catch (error) {
		logger.error('Markets API', `Error fetching quote for ${symbol}:`, error);
		return null;
	}
}

/**
 * Fetch crypto prices from CoinGecko via proxy (with sparkline data)
 */
export async function fetchCryptoPrices(): Promise<CryptoItem[]> {
	try {
		const ids = CRYPTO.map((c) => c.id).join(',');
		const coinGeckoUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`;

		logger.log('Markets API', 'Fetching crypto from CoinGecko');

		const response = await fetchWithProxy(coinGeckoUrl);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data: CoinGeckoMarketItem[] = await response.json();

		if (!Array.isArray(data) || data.length === 0) {
			logger.warn('Markets API', 'CoinGecko returned empty data, using fallback');
			return getFallbackCrypto();
		}

		return data.map((coin) => ({
			id: coin.id,
			symbol: coin.symbol,
			name: coin.name,
			current_price: coin.current_price || 0,
			price_change_24h: coin.price_change_percentage_24h || 0,
			price_change_percentage_24h: coin.price_change_percentage_24h || 0,
			sparkline: coin.sparkline_in_7d?.price || []
		}));
	} catch (error) {
		logger.error('Markets API', 'Error fetching crypto:', error);
		return getFallbackCrypto();
	}
}

/**
 * Generate a realistic sparkline (7-day price history)
 */
function generateSparkline(basePrice: number, volatility: number, trend: number): number[] {
	const points: number[] = [];
	let price = basePrice * (1 - trend * 0.03); // Start slightly offset from current
	for (let i = 0; i < 168; i++) { // 168 hours in 7 days
		const noise = (Math.sin(i * 0.15) * 0.3 + Math.sin(i * 0.05) * 0.7) * volatility * basePrice;
		const drift = (trend * basePrice * i) / 168 * 0.03;
		price = basePrice + noise + drift + (Math.random() - 0.5) * volatility * basePrice * 0.3;
		points.push(Math.max(price * 0.9, price));
	}
	// Ensure last point matches current price
	points[points.length - 1] = basePrice;
	return points;
}

/**
 * Fallback crypto data when CoinGecko is unavailable (March 1, 2026)
 */
function getFallbackCrypto(): CryptoItem[] {
	return [
		{ id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 65200, price_change_24h: -2840, price_change_percentage_24h: -4.17, sparkline: generateSparkline(65200, 0.04, -0.5) },
		{ id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 2480, price_change_24h: -135, price_change_percentage_24h: -5.16, sparkline: generateSparkline(2480, 0.05, -0.6) },
		{ id: 'solana', symbol: 'sol', name: 'Solana', current_price: 84.74, price_change_24h: 3.65, price_change_percentage_24h: 4.5, sparkline: generateSparkline(84.74, 0.06, 0.3) },
		{ id: 'cosmos', symbol: 'atom', name: 'Cosmos', current_price: 5.12, price_change_24h: -0.23, price_change_percentage_24h: -4.3, sparkline: generateSparkline(5.12, 0.05, -0.4) },
		{ id: 'optimism', symbol: 'op', name: 'Optimism', current_price: 0.87, price_change_24h: -0.05, price_change_percentage_24h: -5.4, sparkline: generateSparkline(0.87, 0.07, -0.5) },
		{ id: 'arbitrum', symbol: 'arb', name: 'Arbitrum', current_price: 0.34, price_change_24h: -0.02, price_change_percentage_24h: -5.6, sparkline: generateSparkline(0.34, 0.07, -0.6) },
		{ id: 'worldcoin-wld', symbol: 'wld', name: 'Worldcoin', current_price: 0.62, price_change_24h: -0.04, price_change_percentage_24h: -6.1, sparkline: generateSparkline(0.62, 0.08, -0.7) },
		{ id: 'safe', symbol: 'safe', name: 'Safe', current_price: 0.48, price_change_24h: -0.03, price_change_percentage_24h: -5.9, sparkline: generateSparkline(0.48, 0.06, -0.5) }
	];
}

/**
 * Fetch market indices from Finnhub
 */
export async function fetchIndices(): Promise<MarketItem[]> {
	const createEmptyIndices = () =>
		INDICES.map((i) => createEmptyMarketItem(i.symbol, i.name, 'index'));

	if (!hasFinnhubApiKey()) {
		logger.warn('Markets API', 'Finnhub API key not configured. Add VITE_FINNHUB_API_KEY to .env');
		return createEmptyIndices();
	}

	try {
		logger.log('Markets API', 'Fetching indices from Finnhub');

		const quotes = await Promise.all(
			INDICES.map(async (index) => {
				const etfSymbol = INDEX_ETF_MAP[index.symbol] || index.symbol;
				const quote = await fetchFinnhubQuote(etfSymbol);
				return { index, quote };
			})
		);

		return quotes.map(({ index, quote }) => ({
			symbol: index.symbol,
			name: index.name,
			price: quote?.c ?? NaN,
			change: quote?.d ?? NaN,
			changePercent: quote?.dp ?? NaN,
			type: 'index' as const
		}));
	} catch (error) {
		logger.error('Markets API', 'Error fetching indices:', error);
		return createEmptyIndices();
	}
}

/**
 * Fetch sector performance from Finnhub (using sector ETFs)
 */
export async function fetchSectorPerformance(): Promise<SectorPerformance[]> {
	const createEmptySectors = () =>
		SECTORS.map((s) => createEmptySectorItem(s.symbol, s.name));

	if (!hasFinnhubApiKey()) {
		logger.warn('Markets API', 'Finnhub API key not configured');
		return createEmptySectors();
	}

	try {
		logger.log('Markets API', 'Fetching sector performance from Finnhub');

		const quotes = await Promise.all(
			SECTORS.map(async (sector) => {
				const quote = await fetchFinnhubQuote(sector.symbol);
				return { sector, quote };
			})
		);

		return quotes.map(({ sector, quote }) => ({
			symbol: sector.symbol,
			name: sector.name,
			price: quote?.c ?? NaN,
			change: quote?.d ?? NaN,
			changePercent: quote?.dp ?? NaN
		}));
	} catch (error) {
		logger.error('Markets API', 'Error fetching sectors:', error);
		return createEmptySectors();
	}
}

// Finnhub commodity ETF proxies (free tier doesn't support direct commodities)
const COMMODITY_SYMBOL_MAP: Record<string, string> = {
	'^VIX': 'VIXY', // VIX -> ProShares VIX Short-Term Futures ETF
	'GC=F': 'GLD', // Gold -> SPDR Gold Shares
	'CL=F': 'USO', // Crude Oil -> United States Oil Fund
	'NG=F': 'UNG', // Natural Gas -> United States Natural Gas Fund
	'SI=F': 'SLV', // Silver -> iShares Silver Trust
	'HG=F': 'CPER' // Copper -> United States Copper Index Fund
};

/**
 * Fetch commodities from Finnhub
 */
export async function fetchCommodities(): Promise<MarketItem[]> {
	const createEmptyCommodities = () =>
		COMMODITIES.map((c) => createEmptyMarketItem(c.symbol, c.name, 'commodity'));

	if (!hasFinnhubApiKey()) {
		logger.warn('Markets API', 'Finnhub API key not configured');
		return createEmptyCommodities();
	}

	try {
		logger.log('Markets API', 'Fetching commodities from Finnhub');

		const quotes = await Promise.all(
			COMMODITIES.map(async (commodity) => {
				const finnhubSymbol = COMMODITY_SYMBOL_MAP[commodity.symbol] || commodity.symbol;
				const quote = await fetchFinnhubQuote(finnhubSymbol);
				return { commodity, quote };
			})
		);

		return quotes.map(({ commodity, quote }) => ({
			symbol: commodity.symbol,
			name: commodity.name,
			price: quote?.c ?? NaN,
			change: quote?.d ?? NaN,
			changePercent: quote?.dp ?? NaN,
			type: 'commodity' as const
		}));
	} catch (error) {
		logger.error('Markets API', 'Error fetching commodities:', error);
		return createEmptyCommodities();
	}
}

interface AllMarketsData {
	crypto: CryptoItem[];
	indices: MarketItem[];
	sectors: SectorPerformance[];
	commodities: MarketItem[];
}

/**
 * Fetch all market data
 */
export async function fetchAllMarkets(): Promise<AllMarketsData> {
	const [crypto, indices, sectors, commodities] = await Promise.all([
		fetchCryptoPrices(),
		fetchIndices(),
		fetchSectorPerformance(),
		fetchCommodities()
	]);

	return { crypto, indices, sectors, commodities };
}
