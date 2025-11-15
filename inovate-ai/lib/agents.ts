import {
  CompetitorAgent,
  CustomerAgent,
  SupplierAgent,
  EmployeeAgent,
  MonthlyDecisions,
  CompetitorAction,
  CustomerFeedback,
} from './types';

/**
 * Generează agenți AI pentru competitori bazat pe datele reale scraped
 */
export function generateCompetitorAgents(
  competitorNames: string[],
  averageMarketPrice: number
): CompetitorAgent[] {
  const competitorProfiles: Record<string, Partial<CompetitorAgent>> = {
    'Starbucks': {
      priceStrategy: 1.3, // 30% mai scump decât media
      qualityLevel: 'high',
      marketingPower: 95,
      reputation: 90,
      marketShare: 35,
    },
    '5 to go': {
      priceStrategy: 0.7, // 30% mai ieftin decât media
      qualityLevel: 'medium',
      marketingPower: 80,
      reputation: 75,
      marketShare: 30,
    },
    "Ted's Coffee": {
      priceStrategy: 1.0,
      qualityLevel: 'high',
      marketingPower: 70,
      reputation: 80,
      marketShare: 20,
    },
    'Costa Coffee': {
      priceStrategy: 1.1,
      qualityLevel: 'high',
      marketingPower: 75,
      reputation: 85,
      marketShare: 15,
    },
  };

  return competitorNames.map((name) => {
    const profile = competitorProfiles[name] || {
      priceStrategy: 1.0,
      qualityLevel: 'medium' as const,
      marketingPower: 60,
      reputation: 70,
      marketShare: 10,
    };

    return {
      name,
      priceStrategy: profile.priceStrategy!,
      qualityLevel: profile.qualityLevel!,
      marketingPower: profile.marketingPower!,
      reputation: profile.reputation!,
      marketShare: profile.marketShare!,
    };
  });
}

/**
 * Generează agenți clienți cu preferințe variate
 */
export function generateCustomerAgents(count: number, competitors: string[]): CustomerAgent[] {
  const customers: CustomerAgent[] = [];

  for (let i = 0; i < count; i++) {
    // Distribuție realistă de preferințe
    const pricesSensitivity = Math.random() * 0.4 + 0.3; // 0.3-0.7
    const qualityPreference = Math.random() * 0.4 + 0.3; // 0.3-0.7
    
    // Brand loyalty începe cu competitorii stabiliți
    const brandLoyalty: Record<string, number> = { 'Your Business': 0 };
    competitors.forEach((comp) => {
      brandLoyalty[comp] = Math.random() * 50 + 20; // 20-70
    });

    customers.push({
      id: `customer_${i}`,
      pricesSensitivity,
      qualityPreference,
      brandLoyalty,
      monthlyPurchases: Math.floor(Math.random() * 15) + 5, // 5-20 cafele/lună
    });
  }

  return customers;
}

/**
 * Generează agenți furnizori
 */
export function generateSuppliers(): SupplierAgent[] {
  return [
    {
      name: 'Budget Coffee Co.',
      quality: 'low',
      pricePerUnit: 0.8,
      reliability: 70,
      minimumOrder: 100,
    },
    {
      name: 'Standard Roasters',
      quality: 'medium',
      pricePerUnit: 1.2,
      reliability: 85,
      minimumOrder: 50,
    },
    {
      name: 'Premium Bean Importers',
      quality: 'high',
      pricePerUnit: 2.0,
      reliability: 95,
      minimumOrder: 30,
    },
  ];
}

/**
 * Generează agenți angajați
 */
export function generateEmployees(count: number): EmployeeAgent[] {
  const names = [
    'Andrei', 'Maria', 'Ionuț', 'Elena', 'Mihai',
    'Alexandra', 'Cristian', 'Diana', 'Vlad', 'Ioana',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `employee_${i}`,
    name: names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ''),
    skill: Math.floor(Math.random() * 30) + 60, // 60-90
    satisfaction: 80,
    salary: 3000 + Math.random() * 1000, // 3000-4000 RON
    productivity: 40 + Math.random() * 20, // 40-60 cafele/zi
  }));
}

/**
 * Simulează acțiunile competitorilor pentru luna curentă
 */
export function simulateCompetitorActions(
  competitors: CompetitorAgent[],
  playerDecisions: MonthlyDecisions,
  marketData: { averagePrice: number }
): CompetitorAction[] {
  const actions: CompetitorAction[] = [];

  competitors.forEach((competitor) => {
    // Competitorii reacționează la prețurile tale
    if (playerDecisions.productPrice < marketData.averagePrice * 0.8) {
      // Ai prețuri foarte mici - competitorii răspund
      const willRespond = Math.random() < 0.6;
      if (willRespond) {
        actions.push({
          competitor: competitor.name,
          action: 'price_reduction',
          impact: 'negative',
          description: `${competitor.name} a redus prețurile cu 10% pentru a contracara oferta ta agresivă.`,
        });
      }
    }

    // Competitorii fac promovări random
    if (Math.random() < 0.3) {
      actions.push({
        competitor: competitor.name,
        action: 'marketing_campaign',
        impact: 'negative',
        description: `${competitor.name} a lansat o campanie de marketing intensivă în zona ta.`,
      });
    }

    // Îmbunătățiri de calitate
    if (Math.random() < 0.2 && competitor.qualityLevel !== 'high') {
      actions.push({
        competitor: competitor.name,
        action: 'quality_upgrade',
        impact: 'negative',
        description: `${competitor.name} a introdus o nouă gamă de produse premium.`,
      });
    }
  });

  return actions;
}

/**
 * Simulează feedback-ul clienților bazat pe decizii și calitate
 */
export function generateCustomerFeedback(
  customers: CustomerAgent[],
  decisions: MonthlyDecisions,
  averageMarketPrice: number
): CustomerFeedback[] {
  const feedback: CustomerFeedback[] = [];

  // Analiză preț
  const priceRatio = decisions.productPrice / averageMarketPrice;
  if (priceRatio > 1.2) {
    feedback.push({
      sentiment: 'negative',
      aspect: 'price',
      message: 'Prețurile sunt prea mari comparativ cu alte cafenele din zonă.',
      count: Math.floor(customers.length * 0.3),
    });
  } else if (priceRatio < 0.8) {
    feedback.push({
      sentiment: 'positive',
      aspect: 'price',
      message: 'Prețuri excelente! Raport calitate-preț foarte bun.',
      count: Math.floor(customers.length * 0.4),
    });
  }

  // Analiză calitate
  const qualityScores = { low: 1, medium: 2, high: 3 };
  const qualityScore = qualityScores[decisions.coffeeQuality];
  
  if (qualityScore >= 3) {
    feedback.push({
      sentiment: 'positive',
      aspect: 'quality',
      message: 'Cafea excelentă! Cea mai bună din zonă.',
      count: Math.floor(customers.length * 0.35),
    });
  } else if (qualityScore <= 1) {
    feedback.push({
      sentiment: 'negative',
      aspect: 'quality',
      message: 'Calitatea cafelei lasă de dorit.',
      count: Math.floor(customers.length * 0.25),
    });
  }

  // Analiză staff (employees)
  const customersPerEmployee = customers.length / decisions.employees;
  if (customersPerEmployee > 100) {
    feedback.push({
      sentiment: 'negative',
      aspect: 'service',
      message: 'Timpul de așteptare este prea lung. Aveți nevoie de mai mulți angajați.',
      count: Math.floor(customers.length * 0.4),
    });
  } else if (customersPerEmployee < 30) {
    feedback.push({
      sentiment: 'positive',
      aspect: 'service',
      message: 'Serviciu rapid și atenție la detalii. Personal foarte amabil!',
      count: Math.floor(customers.length * 0.3),
    });
  }

  return feedback;
}

/**
 * Calculează câți clienți aleg fiecare business (player vs competitori)
 */
export function distributeCustomers(
  customers: CustomerAgent[],
  playerDecisions: MonthlyDecisions,
  competitors: CompetitorAgent[],
  playerReputation: number,
  averageMarketPrice: number
): {
  playerCustomers: number;
  competitorDistribution: Record<string, number>;
} {
  const distribution: Record<string, number> = { 'Your Business': 0 };
  competitors.forEach((c) => (distribution[c.name] = 0));

  customers.forEach((customer) => {
    // Calculăm score pentru fiecare business
    const scores: Record<string, number> = {};

    // Score pentru player
    const playerPriceScore = (1 - customer.pricesSensitivity) * 50 +
      customer.pricesSensitivity * (1 - playerDecisions.productPrice / averageMarketPrice) * 50;
    
    const qualityScores = { low: 20, medium: 50, high: 100 };
    const playerQualityScore = customer.qualityPreference * qualityScores[playerDecisions.coffeeQuality];
    
    const playerMarketingBonus = Math.min(playerDecisions.marketingBudget / 100, 20);
    
    scores['Your Business'] = 
      playerPriceScore + 
      playerQualityScore + 
      playerMarketingBonus +
      (playerReputation / 100) * 30;

    // Score pentru competitori
    competitors.forEach((competitor) => {
      const compPrice = averageMarketPrice * competitor.priceStrategy;
      const compPriceScore = (1 - customer.pricesSensitivity) * 50 +
        customer.pricesSensitivity * (1 - compPrice / averageMarketPrice) * 50;
      
      const compQualityScores = { low: 20, medium: 50, high: 100 };
      const compQualityScore = customer.qualityPreference * compQualityScores[competitor.qualityLevel];
      
      scores[competitor.name] = 
        compPriceScore +
        compQualityScore +
        (competitor.marketingPower / 100) * 20 +
        (competitor.reputation / 100) * 30 +
        (customer.brandLoyalty[competitor.name] || 0);
    });

    // Alege business-ul cu cel mai mare score
    const winner = Object.entries(scores).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
    distribution[winner]++;
  });

  const { 'Your Business': playerCustomers, ...competitorDistribution } = distribution;
  return { playerCustomers, competitorDistribution };
}
