import { NextRequest, NextResponse } from 'next/server';
import { BusinessSetup } from '@/lib/types';

// Store temporar pentru businesses (în producție ar fi o bază de date)
const businesses = new Map<string, BusinessSetup>();

export async function POST(request: NextRequest) {
  try {
    const { name, location, locationData } = await request.json();

    if (!name || !location || !locationData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const businessId = `business_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const business: BusinessSetup = {
      id: businessId,
      name,
      location,
      locationData: {
        averageCoffeePrice: locationData.averageCoffeePrice || 12,
        rentEstimate: locationData.rentEstimate || 2500,
        competitors: locationData.competitors || [],
        footTraffic: locationData.footTraffic || 'medium',
      },
      currentMonth: 1,
      cash: 50000, // Start cu 50,000 RON capital inițial
      reputation: 50, // Start cu reputație medie
      createdAt: new Date(),
    };

    businesses.set(businessId, business);

    return NextResponse.json({ business });
  } catch (error) {
    console.error('Error creating business:', error);
    return NextResponse.json(
      { error: 'Failed to create business' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const businessId = searchParams.get('id');

  if (!businessId) {
    return NextResponse.json(
      { error: 'Business ID is required' },
      { status: 400 }
    );
  }

  const business = businesses.get(businessId);

  if (!business) {
    return NextResponse.json(
      { error: 'Business not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ business });
}
