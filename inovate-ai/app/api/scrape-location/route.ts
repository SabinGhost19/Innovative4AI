import { NextRequest, NextResponse } from 'next/server';
import { scrapeLocationData, getMockLocationData } from '@/lib/scraper';

export async function POST(request: NextRequest) {
  try {
    const { location, useMock } = await request.json();

    if (!location) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    // Folosim mock data pentru development (scraping-ul real poate fi lent/blocat)
    const locationData = useMock 
      ? getMockLocationData(location)
      : await scrapeLocationData(location);

    return NextResponse.json({ locationData });
  } catch (error) {
    console.error('Error scraping location:', error);
    return NextResponse.json(
      { error: 'Failed to scrape location data' },
      { status: 500 }
    );
  }
}
