import axios from 'axios';
import * as cheerio from 'cheerio';

export interface LocationData {
  location: string;
  averageCoffeePrice: number | null;
  rentEstimate: number | null;
  competitors: string[];
  footTraffic: 'low' | 'medium' | 'high';
  marketData: {
    priceRange: { min: number; max: number };
    competitorCount: number;
    popularTimes?: string;
  };
}

/**
 * Extrage numere din text (ex: "14 RON", "3000€")
 */
function extractNumbers(text: string): number[] {
  const numbers: number[] = [];
  const patterns = [
    /(\d+(?:[.,]\d+)?)\s*(?:RON|lei|euro|EUR|€)/gi,
    /(\d+(?:[.,]\d+)?)/g,
  ];

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const num = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(num) && num > 0 && num < 100000) {
        numbers.push(num);
      }
    }
  }

  return numbers;
}

/**
 * Face scraping simplu pe Google Search pentru un query
 */
async function googleSearch(query: string): Promise<string[]> {
  const snippets: string[] = [];
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    // Extragem snippet-uri din rezultatele de căutare
    $('.VwiC3b, .hgKElc, .s3v9rd, .st').each((_, element) => {
      const text = $(element).text().trim();
      if (text && text.length > 10) {
        snippets.push(text);
      }
    });

    // Extragem și din knowledge panels
    $('.kno-rdesc span, .Z0LcW, .IZ6rdc').each((_, element) => {
      const text = $(element).text().trim();
      if (text && text.length > 10) {
        snippets.push(text);
      }
    });
  } catch (error) {
    console.error(`Eroare la scraping pentru query: ${query}`, error);
  }

  return snippets;
}

/**
 * Extrage prețul mediu al cafelei într-o locație
 */
async function getAverageCoffeePrice(location: string): Promise<{ price: number | null; range: { min: number; max: number } }> {
  const queries = [
    `preț cafea ${location} România`,
    `cât costă o cafea ${location}`,
    `prețuri cafenele ${location}`,
  ];

  const allPrices: number[] = [];

  for (const query of queries) {
    const snippets = await googleSearch(query);
    for (const snippet of snippets) {
      const prices = extractNumbers(snippet);
      allPrices.push(...prices);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Filtrăm prețuri realiste pentru cafea (5-30 RON)
  const validPrices = allPrices.filter((p) => p >= 5 && p <= 30);

  if (validPrices.length === 0) {
    return { price: null, range: { min: 10, max: 20 } };
  }

  const avg = validPrices.reduce((a, b) => a + b, 0) / validPrices.length;
  const min = Math.min(...validPrices);
  const max = Math.max(...validPrices);

  return {
    price: Math.round(avg * 100) / 100,
    range: { min, max },
  };
}

/**
 * Extrage chiria estimată pentru spațiu comercial
 */
async function getRentEstimate(location: string): Promise<number | null> {
  const queries = [
    `chirie spațiu comercial ${location}`,
    `închiriere local ${location}`,
    `preț chirie magazin ${location}`,
  ];

  const allRents: number[] = [];

  for (const query of queries) {
    const snippets = await googleSearch(query);
    for (const snippet of snippets) {
      const numbers = extractNumbers(snippet);
      // Filtrăm pentru valori realiste de chirie (500-10000 EUR)
      const validRents = numbers.filter((n) => n >= 500 && n <= 10000);
      allRents.push(...validRents);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  if (allRents.length === 0) {
    return null;
  }

  return Math.round(allRents.reduce((a, b) => a + b, 0) / allRents.length);
}

/**
 * Identifică competitorii (cafenele) din locație
 */
async function getCompetitors(location: string): Promise<string[]> {
  const competitors = new Set<string>();
  const knownChains = [
    'Starbucks',
    '5 to go',
    '5togo',
    "Ted's Coffee",
    'Teds Coffee',
    'Costa Coffee',
    'McCafe',
    'Gregory',
    'Paul',
    'Urban Coffee',
  ];

  const query = `cafenele ${location} România`;
  const snippets = await googleSearch(query);

  for (const snippet of snippets) {
    for (const chain of knownChains) {
      if (snippet.toLowerCase().includes(chain.toLowerCase())) {
        // Normalizăm numele
        if (chain.includes('5')) competitors.add('5 to go');
        else if (chain.toLowerCase().includes('ted')) competitors.add("Ted's Coffee");
        else competitors.add(chain);
      }
    }
  }

  return Array.from(competitors).slice(0, 5);
}

/**
 * Estimează traficul pietonal (low, medium, high)
 */
async function getFootTraffic(location: string): Promise<'low' | 'medium' | 'high'> {
  const queries = [
    `populație ${location}`,
    `trafic pietonal ${location}`,
    `zonă aglomerată ${location}`,
  ];

  let score = 0;
  const keywords = {
    high: ['aglomerat', 'mult trafic', 'populație mare', 'zonă centrală', 'foarte populat'],
    medium: ['moderat', 'mediu', 'zonă rezidenţială'],
    low: ['liniștit', 'puțin trafic', 'periferică', 'zonă liniștită'],
  };

  for (const query of queries) {
    const snippets = await googleSearch(query);
    const text = snippets.join(' ').toLowerCase();

    keywords.high.forEach((kw) => {
      if (text.includes(kw)) score += 2;
    });
    keywords.medium.forEach((kw) => {
      if (text.includes(kw)) score += 1;
    });
    keywords.low.forEach((kw) => {
      if (text.includes(kw)) score -= 1;
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  if (score > 3) return 'high';
  if (score < -1) return 'low';
  return 'medium';
}

/**
 * Funcția principală care agregă toate datele despre locație
 */
export async function scrapeLocationData(location: string): Promise<LocationData> {
  console.log(`🔍 Scraping date pentru: ${location}`);

  const [priceData, rent, competitors, footTraffic] = await Promise.all([
    getAverageCoffeePrice(location),
    getRentEstimate(location),
    getCompetitors(location),
    getFootTraffic(location),
  ]);

  const locationData: LocationData = {
    location,
    averageCoffeePrice: priceData.price,
    rentEstimate: rent,
    competitors,
    footTraffic,
    marketData: {
      priceRange: priceData.range,
      competitorCount: competitors.length,
    },
  };

  console.log('✅ Date extrase:', locationData);
  return locationData;
}

/**
 * Versiune mock pentru development (nu face scraping real)
 */
export function getMockLocationData(location: string): LocationData {
  const mockData: Record<string, LocationData> = {
    'Piața Victoriei': {
      location: 'Piața Victoriei, București',
      averageCoffeePrice: 15,
      rentEstimate: 3500,
      competitors: ['Starbucks', '5 to go', "Ted's Coffee"],
      footTraffic: 'high',
      marketData: {
        priceRange: { min: 12, max: 20 },
        competitorCount: 3,
      },
    },
    'Universitate': {
      location: 'Piața Universității, București',
      averageCoffeePrice: 14,
      rentEstimate: 4000,
      competitors: ['Starbucks', '5 to go', 'Costa Coffee'],
      footTraffic: 'high',
      marketData: {
        priceRange: { min: 10, max: 18 },
        competitorCount: 3,
      },
    },
  };

  return mockData[location] || {
    location,
    averageCoffeePrice: 12,
    rentEstimate: 2500,
    competitors: ['5 to go', 'Starbucks'],
    footTraffic: 'medium',
    marketData: {
      priceRange: { min: 10, max: 15 },
      competitorCount: 2,
    },
  };
}
