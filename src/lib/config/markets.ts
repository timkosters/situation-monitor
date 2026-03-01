/**
 * Market configuration - crypto-heavy + key indices
 */

export interface SectorConfig {
	symbol: string;
	name: string;
}

export interface CommodityConfig {
	symbol: string;
	name: string;
	display: string;
}

export const SECTORS: SectorConfig[] = [
	{ symbol: 'XLK', name: 'Tech' },
	{ symbol: 'XLF', name: 'Finance' },
	{ symbol: 'XLE', name: 'Energy' },
	{ symbol: 'XLV', name: 'Health' },
	{ symbol: 'SMH', name: 'Semis' },
	{ symbol: 'ARKK', name: 'Innovation' }
];

export const COMMODITIES: CommodityConfig[] = [
	{ symbol: '^VIX', name: 'VIX', display: 'VIX' },
	{ symbol: 'GC=F', name: 'Gold', display: 'GOLD' },
	{ symbol: 'CL=F', name: 'Crude Oil', display: 'OIL' },
	{ symbol: 'SI=F', name: 'Silver', display: 'SILVER' }
];

// Major stock indices
export const INDICES = [
	{ symbol: '^GSPC', name: 'S&P 500', display: 'S&P' },
	{ symbol: '^IXIC', name: 'NASDAQ', display: 'NDQ' },
	{ symbol: '^DJI', name: 'Dow Jones', display: 'DOW' }
];

// Crypto assets tracked - expanded for crypto focus
export const CRYPTO = [
	{ id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
	{ id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
	{ id: 'solana', symbol: 'SOL', name: 'Solana' },
	{ id: 'cosmos', symbol: 'ATOM', name: 'Cosmos' },
	{ id: 'optimism', symbol: 'OP', name: 'Optimism' },
	{ id: 'arbitrum', symbol: 'ARB', name: 'Arbitrum' },
	{ id: 'worldcoin-wld', symbol: 'WLD', name: 'Worldcoin' },
	{ id: 'safe', symbol: 'SAFE', name: 'Safe' }
];
