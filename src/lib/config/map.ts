// Map configuration - hotspots tuned for governance, crypto, network states, geopolitics

export interface Hotspot {
	name: string;
	lat: number;
	lon: number;
	level: 'critical' | 'high' | 'elevated' | 'low';
	desc: string;
	type: 'geopolitical' | 'crypto' | 'network-state';
}

export interface ConflictZone {
	name: string;
	coords: [number, number][];
	color: string;
}

export interface Chokepoint {
	name: string;
	lat: number;
	lon: number;
	desc: string;
}

export interface CableLanding {
	name: string;
	lat: number;
	lon: number;
	desc: string;
}

export interface NuclearSite {
	name: string;
	lat: number;
	lon: number;
	desc: string;
}

export interface MilitaryBase {
	name: string;
	lat: number;
	lon: number;
	desc: string;
}

export interface Ocean {
	name: string;
	lat: number;
	lon: number;
}

export const THREAT_COLORS = {
	critical: '#ff0000',
	high: '#ff4444',
	elevated: '#ffcc00',
	low: '#00ff88'
} as const;

export const SANCTIONED_COUNTRY_IDS = [
	364, // Iran
	408, // North Korea
	760, // Syria
	862, // Venezuela
	112, // Belarus
	643, // Russia
	728, // South Sudan
	729 // Sudan
];

export const HOTSPOTS: Hotspot[] = [
	// Geopolitical hotspots
	{
		name: 'DC',
		lat: 38.9,
		lon: -77.0,
		level: 'elevated',
		desc: 'Washington DC — US crypto regulation, SEC enforcement, AI policy',
		type: 'geopolitical'
	},
	{
		name: 'Brussels',
		lat: 50.85,
		lon: 4.35,
		level: 'elevated',
		desc: 'Brussels — EU MiCA regulation, AI Act enforcement, digital identity',
		type: 'geopolitical'
	},
	{
		name: 'Beijing',
		lat: 39.9,
		lon: 116.4,
		level: 'elevated',
		desc: 'Beijing — AI race with US, digital yuan, tech crackdown',
		type: 'geopolitical'
	},
	{
		name: 'Kyiv',
		lat: 50.45,
		lon: 30.5,
		level: 'high',
		desc: 'Kyiv — Active conflict zone, crypto donations, digital resilience',
		type: 'geopolitical'
	},
	{
		name: 'Tehran',
		lat: 35.7,
		lon: 51.4,
		level: 'high',
		desc: 'Tehran — Sanctions, nuclear program, protest movements',
		type: 'geopolitical'
	},
	{
		name: 'Tel Aviv',
		lat: 32.07,
		lon: 34.78,
		level: 'high',
		desc: 'Tel Aviv — Gaza conflict, crypto/AI startup hub',
		type: 'geopolitical'
	},
	{
		name: 'Taipei',
		lat: 25.03,
		lon: 121.5,
		level: 'elevated',
		desc: 'Taipei — Taiwan Strait tensions, TSMC, digital democracy (vTaiwan, Audrey Tang)',
		type: 'geopolitical'
	},
	// Crypto & Web3 hubs
	{
		name: 'Zug',
		lat: 47.17,
		lon: 8.52,
		level: 'low',
		desc: 'Zug — Crypto Valley, Ethereum Foundation, Swiss regulation',
		type: 'crypto'
	},
	{
		name: 'Singapore',
		lat: 1.35,
		lon: 103.82,
		level: 'low',
		desc: 'Singapore — Crypto hub, MAS regulation, Web3 capital',
		type: 'crypto'
	},
	{
		name: 'Dubai',
		lat: 25.2,
		lon: 55.27,
		level: 'low',
		desc: 'Dubai — VARA regulation, crypto-friendly zone, Binance HQ',
		type: 'crypto'
	},
	{
		name: 'San Francisco',
		lat: 37.77,
		lon: -122.42,
		level: 'low',
		desc: 'San Francisco — AI frontier (OpenAI, Anthropic), crypto VC, tech policy',
		type: 'crypto'
	},
	{
		name: 'London',
		lat: 51.5,
		lon: -0.12,
		level: 'low',
		desc: 'London — DeepMind, FCA regulation, DeFi capital',
		type: 'crypto'
	},
	// Network state / popup city locations
	{
		name: 'Healdsburg',
		lat: 38.61,
		lon: -122.87,
		level: 'low',
		desc: 'Healdsburg, CA — Edge Esmeralda 2026, popup village, frontier governance experiments',
		type: 'network-state'
	},
	{
		name: 'Lustica Bay',
		lat: 42.38,
		lon: 18.67,
		level: 'low',
		desc: 'Lustica Bay, Montenegro — Zuzalu 2023, first popup city experiment',
		type: 'network-state'
	},
	{
		name: 'Chiang Mai',
		lat: 18.79,
		lon: 98.98,
		level: 'low',
		desc: 'Chiang Mai — Network School, digital nomad hub, Zuzalu community',
		type: 'network-state'
	},
	{
		name: 'Prospera',
		lat: 16.3,
		lon: -86.53,
		level: 'elevated',
		desc: 'Prospera, Honduras — Charter city ZEDE, legal battles, governance experiment',
		type: 'network-state'
	},
	{
		name: 'Patagonia',
		lat: -41.81,
		lon: -71.5,
		level: 'low',
		desc: 'Patagonia, Argentina — Edge City Patagonia 2025, popup village',
		type: 'network-state'
	},
	{
		name: 'Berlin',
		lat: 52.52,
		lon: 13.4,
		level: 'low',
		desc: 'Berlin — Ethereum community, governance research hub, CCC',
		type: 'network-state'
	},
	{
		name: 'Bhutan',
		lat: 27.47,
		lon: 89.64,
		level: 'low',
		desc: 'Bhutan — Edge City Bhutan 2025, GNH, unique governance model',
		type: 'network-state'
	},
	{
		name: 'Delhi',
		lat: 28.6,
		lon: 77.2,
		level: 'low',
		desc: 'Delhi — Edge City India 2026, emerging crypto regulation',
		type: 'network-state'
	}
];

export const CONFLICT_ZONES: ConflictZone[] = [
	{
		name: 'Ukraine',
		coords: [
			[30, 52],
			[40, 52],
			[40, 45],
			[30, 45],
			[30, 52]
		],
		color: '#ff4444'
	},
	{
		name: 'Gaza',
		coords: [
			[34, 32],
			[35, 32],
			[35, 31],
			[34, 31],
			[34, 32]
		],
		color: '#ff4444'
	},
	{
		name: 'Taiwan Strait',
		coords: [
			[117, 28],
			[122, 28],
			[122, 22],
			[117, 22],
			[117, 28]
		],
		color: '#ffaa00'
	},
	{
		name: 'Yemen',
		coords: [
			[42, 19],
			[54, 19],
			[54, 12],
			[42, 12],
			[42, 19]
		],
		color: '#ff6644'
	},
	{
		name: 'Sudan',
		coords: [
			[22, 23],
			[38, 23],
			[38, 8],
			[22, 8],
			[22, 23]
		],
		color: '#ff6644'
	}
];

export const CHOKEPOINTS: Chokepoint[] = [
	{
		name: 'Suez',
		lat: 30.0,
		lon: 32.5,
		desc: 'Suez Canal — 12% of global trade, Europe-Asia route'
	},
	{
		name: 'Panama',
		lat: 9.1,
		lon: -79.7,
		desc: 'Panama Canal — Americas transit, Pacific-Atlantic link'
	},
	{
		name: 'Hormuz',
		lat: 26.5,
		lon: 56.5,
		desc: 'Strait of Hormuz — 21% of global oil, Persian Gulf exit'
	},
	{
		name: 'Malacca',
		lat: 2.5,
		lon: 101.0,
		desc: 'Strait of Malacca — 25% of global trade, China supply line'
	}
];

export const CABLE_LANDINGS: CableLanding[] = [
	{ name: 'NYC', lat: 40.7, lon: -74.0, desc: 'New York — Transatlantic hub, 10+ cables' },
	{ name: 'Marseille', lat: 43.3, lon: 5.4, desc: 'Marseille — Mediterranean hub, SEA-ME-WE' },
	{ name: 'Mumbai', lat: 19.1, lon: 72.9, desc: 'Mumbai — India gateway, 10+ cables' },
	{ name: 'Singapore', lat: 1.3, lon: 103.8, desc: 'Singapore — Asia-Pacific nexus' },
	{ name: 'Tokyo', lat: 35.5, lon: 139.8, desc: 'Tokyo — Trans-Pacific terminus' }
];

export const NUCLEAR_SITES: NuclearSite[] = [
	{ name: 'Natanz', lat: 33.7, lon: 51.7, desc: 'Natanz — Iran uranium enrichment' },
	{ name: 'Yongbyon', lat: 39.8, lon: 125.8, desc: 'Yongbyon — North Korea nuclear complex' },
	{
		name: 'Zaporizhzhia',
		lat: 47.5,
		lon: 34.6,
		desc: 'Zaporizhzhia — Europe largest NPP, conflict zone'
	}
];

export const MILITARY_BASES: MilitaryBase[] = [
	{ name: 'Ramstein', lat: 49.4, lon: 7.6, desc: 'Ramstein — US Air Force, NATO hub Germany' },
	{
		name: 'Okinawa',
		lat: 26.5,
		lon: 127.9,
		desc: 'Okinawa — US Forces Japan, Pacific presence'
	},
	{ name: 'Guam', lat: 13.5, lon: 144.8, desc: 'Guam — US Pacific Command, bomber base' }
];

export const OCEANS: Ocean[] = [
	{ name: 'ATLANTIC', lat: 25, lon: -40 },
	{ name: 'PACIFIC', lat: 0, lon: -150 },
	{ name: 'INDIAN', lat: -20, lon: 75 },
	{ name: 'ARCTIC', lat: 75, lon: 0 }
];

export const WEATHER_CODES: Record<number, string> = {
	0: '☀️ Clear',
	1: '🌤️ Mostly clear',
	2: '⛅ Partly cloudy',
	3: '☁️ Overcast',
	45: '🌫️ Fog',
	48: '🌫️ Fog',
	51: '🌧️ Drizzle',
	53: '🌧️ Drizzle',
	55: '🌧️ Drizzle',
	61: '🌧️ Rain',
	63: '🌧️ Rain',
	65: '🌧️ Heavy rain',
	71: '🌨️ Snow',
	73: '🌨️ Snow',
	75: '🌨️ Heavy snow',
	80: '🌧️ Showers',
	81: '🌧️ Showers',
	82: '⛈️ Heavy showers',
	95: '⛈️ Thunderstorm',
	96: '⛈️ Thunderstorm',
	99: '⛈️ Thunderstorm'
};
