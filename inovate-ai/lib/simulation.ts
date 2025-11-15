import {
  BusinessSetup,
  MonthlyDecisions,
  SimulationResult,
  ProfitLoss,
  SimulationEvent,
  CompetitorAgent,
  CustomerAgent,
  EmployeeAgent,
} from './types';
import {
  generateCompetitorAgents,
  generateCustomerAgents,
  generateEmployees,
  simulateCompetitorActions,
  generateCustomerFeedback,
  distributeCustomers,
} from './agents';

/**
 * Motorul principal de simulare - rulează o lună întreagă (30 zile) instant
 */
export class SimulationEngine {
  private business: BusinessSetup;
  private competitors: CompetitorAgent[];
  private customers: CustomerAgent[];
  private employees: EmployeeAgent[];

  constructor(business: BusinessSetup) {
    this.business = business;
    
    // Inițializăm agenții
    this.competitors = generateCompetitorAgents(
      business.locationData.competitors,
      business.locationData.averageCoffeePrice
    );
    
    // Număr de clienți bazat pe traficul pietonal
    const customerCount = this.getCustomerCountByFootTraffic(business.locationData.footTraffic);
    this.customers = generateCustomerAgents(customerCount, business.locationData.competitors);
    
    this.employees = [];
  }

  private getCustomerCountByFootTraffic(footTraffic: string): number {
    const trafficMap = {
      low: 300,
      medium: 800,
      high: 1500,
    };
    return trafficMap[footTraffic as keyof typeof trafficMap] || 500;
  }

  /**
   * Rulează simularea pentru o lună întreagă
   */
  public async runMonth(decisions: MonthlyDecisions): Promise<SimulationResult> {
    const events: SimulationEvent[] = [];
    
    // 1. Actualizăm angajații conform deciziilor
    this.employees = generateEmployees(decisions.employees);

    // 2. Simulăm acțiunile competitorilor
    const competitorActions = simulateCompetitorActions(
      this.competitors,
      decisions,
      { averagePrice: this.business.locationData.averageCoffeePrice }
    );

    // 3. Distribuim clienții între businesses
    const { playerCustomers, competitorDistribution } = distributeCustomers(
      this.customers,
      decisions,
      this.competitors,
      this.business.reputation,
      this.business.locationData.averageCoffeePrice
    );

    // 4. Calculăm vânzările (presupunem fiecare client cumpără ~1 cafea/vizită în medie)
    const avgPurchasesPerCustomer = 1.2;
    const salesVolume = Math.floor(playerCustomers * avgPurchasesPerCustomer);

    // 5. Calculăm financials (P&L)
    const profitLoss = this.calculateProfitLoss(decisions, salesVolume);

    // 6. Generăm feedback de la clienți
    const customerFeedback = generateCustomerFeedback(
      this.customers,
      decisions,
      this.business.locationData.averageCoffeePrice
    );

    // 7. Generăm evenimente bazate pe performanță
    events.push(...this.generatePerformanceEvents(decisions, profitLoss, salesVolume));

    // 8. Calculăm schimbările în metrici
    const reputationChange = this.calculateReputationChange(
      decisions,
      customerFeedback,
      profitLoss
    );
    
    const marketShare = this.calculateMarketShare(playerCustomers, this.customers.length);

    // 9. Actualizăm business-ul
    this.business.reputation = Math.max(0, Math.min(100, this.business.reputation + reputationChange));
    this.business.cash += profitLoss.profit;

    return {
      month: this.business.currentMonth,
      financials: profitLoss,
      events,
      competitorActions,
      customerFeedback,
      metricsChange: {
        reputation: reputationChange,
        marketShare,
      },
    };
  }

  /**
   * Calculează Profit & Loss pentru luna curentă
   */
  private calculateProfitLoss(decisions: MonthlyDecisions, salesVolume: number): ProfitLoss {
    // REVENUE
    const revenue = salesVolume * decisions.productPrice;

    // COSTS
    const rent = this.business.locationData.rentEstimate;
    
    const salaries = decisions.employees * 3500; // 3500 RON/angajat/lună
    
    const qualityCosts = {
      low: 0.8,
      medium: 1.2,
      high: 2.0,
    };
    const supplies = salesVolume * qualityCosts[decisions.coffeeQuality];
    
    const marketing = decisions.marketingBudget;
    
    const utilities = 800 + (salesVolume * 0.1); // Curent, apă, etc.
    
    const other = 500; // Diverse

    const totalCosts = rent + salaries + supplies + marketing + utilities + other;
    const profit = revenue - totalCosts;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      revenue,
      costs: {
        rent,
        salaries,
        supplies,
        marketing,
        utilities,
        other,
      },
      totalCosts,
      profit,
      profitMargin,
      salesVolume,
    };
  }

  /**
   * Generează evenimente narrative bazate pe performanță
   */
  private generatePerformanceEvents(
    decisions: MonthlyDecisions,
    profitLoss: ProfitLoss,
    salesVolume: number
  ): SimulationEvent[] {
    const events: SimulationEvent[] = [];

    // Evenimente legate de profit
    if (profitLoss.profit > 10000) {
      events.push({
        type: 'success',
        category: 'financial',
        title: 'Lună profitabilă!',
        message: `Ai generat un profit de ${profitLoss.profit.toFixed(0)} RON. Business-ul merge excelent!`,
      });
    } else if (profitLoss.profit < 0) {
      events.push({
        type: 'error',
        category: 'financial',
        title: 'Pierderi financiare',
        message: `Ai înregistrat o pierdere de ${Math.abs(profitLoss.profit).toFixed(0)} RON. Revizuiește strategia!`,
      });
    }

    // Evenimente legate de angajați
    const customersPerEmployee = salesVolume / decisions.employees;
    if (customersPerEmployee > 150) {
      events.push({
        type: 'warning',
        category: 'staff',
        title: 'Angajați suprasolicitați',
        message: `Angajații tăi servesc ${customersPerEmployee.toFixed(0)} clienți fiecare. Acest lucru afectează calitatea serviciului.`,
        impact: { metric: 'reputation', change: -2 },
      });
    } else if (customersPerEmployee < 30) {
      events.push({
        type: 'warning',
        category: 'staff',
        title: 'Prea mulți angajați',
        message: `Ai angajați care stau degeaba. Costurile cu salariile sunt prea mari față de vânzări.`,
      });
    }

    // Evenimente legate de preț
    const avgMarketPrice = this.business.locationData.averageCoffeePrice;
    if (decisions.productPrice > avgMarketPrice * 1.5) {
      events.push({
        type: 'warning',
        category: 'customer',
        title: 'Prețuri prea mari',
        message: `Prețurile tale sunt cu ${((decisions.productPrice / avgMarketPrice - 1) * 100).toFixed(0)}% peste media pieței. Riști să pierzi clienți.`,
      });
    } else if (decisions.productPrice < avgMarketPrice * 0.6) {
      events.push({
        type: 'warning',
        category: 'financial',
        title: 'Marjă de profit prea mică',
        message: 'Prețurile tale sunt prea mici. Deși atragi clienți, profitabilitatea suferă.',
      });
    }

    // Evenimente legate de marketing
    if (decisions.marketingBudget > 5000) {
      events.push({
        type: 'success',
        category: 'marketing',
        title: 'Campanie de marketing intensivă',
        message: 'Investiția ta în marketing începe să aducă clienți noi!',
        impact: { metric: 'reputation', change: 3 },
      });
    }

    // Evenimente legate de calitate
    if (decisions.coffeeQuality === 'high' && decisions.productPrice > avgMarketPrice) {
      events.push({
        type: 'success',
        category: 'customer',
        title: 'Brand premium',
        message: 'Clienții apreciază calitatea superioară și sunt dispuși să plătească mai mult.',
        impact: { metric: 'reputation', change: 2 },
      });
    }

    return events;
  }

  /**
   * Calculează schimbarea în reputație bazată pe performanță
   */
  private calculateReputationChange(
    decisions: MonthlyDecisions,
    customerFeedback: any[],
    profitLoss: ProfitLoss
  ): number {
    let change = 0;

    // Feedback pozitiv/negativ
    customerFeedback.forEach((feedback) => {
      if (feedback.sentiment === 'positive') {
        change += 0.5;
      } else if (feedback.sentiment === 'negative') {
        change -= 0.8;
      }
    });

    // Calitate înaltă = reputație mai bună
    if (decisions.coffeeQuality === 'high') change += 1;
    if (decisions.coffeeQuality === 'low') change -= 1;

    // Marketing ajută reputația
    if (decisions.marketingBudget > 3000) change += 1;

    // Profitabilitate (business-uri de succes au reputație mai bună)
    if (profitLoss.profit > 5000) change += 0.5;
    if (profitLoss.profit < -5000) change -= 1;

    return Math.round(change * 100) / 100;
  }

  /**
   * Calculează market share
   */
  private calculateMarketShare(playerCustomers: number, totalCustomers: number): number {
    return (playerCustomers / totalCustomers) * 100;
  }

  /**
   * Returnează starea curentă a business-ului
   */
  public getBusinessState(): BusinessSetup {
    return this.business;
  }
}

/**
 * Factory function pentru a crea o nouă instanță de simulare
 */
export function createSimulation(business: BusinessSetup): SimulationEngine {
  return new SimulationEngine(business);
}
