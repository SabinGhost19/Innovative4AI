import { NextRequest, NextResponse } from 'next/server';
import { createSimulation } from '@/lib/simulation';
import { MonthlyDecisions, BusinessSetup } from '@/lib/types';

// Store temporar pentru simulări (în producție ar fi DB)
const simulations = new Map<string, any>();
const businesses = new Map<string, BusinessSetup>();

export async function POST(request: NextRequest) {
  try {
    const { businessId, decisions } = await request.json();

    if (!businessId || !decisions) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validăm deciziile
    const monthlyDecisions: MonthlyDecisions = {
      employees: parseInt(decisions.employees) || 1,
      coffeeQuality: decisions.coffeeQuality || 'medium',
      marketingBudget: parseFloat(decisions.marketingBudget) || 0,
      productPrice: parseFloat(decisions.productPrice) || 12,
    };

    // Obținem business-ul (în realitate din DB)
    let business = businesses.get(businessId);
    
    if (!business) {
      // Mock business pentru testing
      business = {
        id: businessId,
        name: 'My Coffee Shop',
        location: 'Piața Victoriei',
        locationData: {
          averageCoffeePrice: 15,
          rentEstimate: 3500,
          competitors: ['Starbucks', '5 to go', "Ted's Coffee"],
          footTraffic: 'high',
        },
        currentMonth: 1,
        cash: 50000,
        reputation: 50,
        createdAt: new Date(),
      };
      businesses.set(businessId, business);
    }

    // Creăm sau obținem simularea
    let simulation = simulations.get(businessId);
    if (!simulation) {
      simulation = createSimulation(business);
      simulations.set(businessId, simulation);
    }

    // Rulăm simularea
    console.log('🎮 Running simulation for month:', business.currentMonth);
    const result = await simulation.runMonth(monthlyDecisions);

    // Actualizăm luna curentă
    business.currentMonth++;
    businesses.set(businessId, simulation.getBusinessState());

    return NextResponse.json({
      result,
      business: simulation.getBusinessState(),
    });
  } catch (error) {
    console.error('Error running simulation:', error);
    return NextResponse.json(
      { error: 'Failed to run simulation', details: (error as Error).message },
      { status: 500 }
    );
  }
}
