// Tipuri pentru business-ul simulat

export interface BusinessSetup {
  id: string;
  name: string;
  location: string;
  locationData: {
    averageCoffeePrice: number;
    rentEstimate: number;
    competitors: string[];
    footTraffic: 'low' | 'medium' | 'high';
  };
  currentMonth: number;
  cash: number;
  reputation: number; // 0-100
  createdAt: Date;
}

export interface MonthlyDecisions {
  employees: number; // Număr de baristas
  coffeeQuality: 'low' | 'medium' | 'high'; // Calitatea cafelei
  marketingBudget: number; // Budget marketing în RON
  productPrice: number; // Prețul cafelei în RON
}

export interface SimulationResult {
  month: number;
  financials: ProfitLoss;
  events: SimulationEvent[];
  competitorActions: CompetitorAction[];
  customerFeedback: CustomerFeedback[];
  metricsChange: {
    reputation: number;
    marketShare: number;
  };
}

export interface ProfitLoss {
  revenue: number;
  costs: {
    rent: number;
    salaries: number;
    supplies: number;
    marketing: number;
    utilities: number;
    other: number;
  };
  totalCosts: number;
  profit: number;
  profitMargin: number;
  salesVolume: number; // Număr de cafele vândute
}

export interface SimulationEvent {
  type: 'info' | 'warning' | 'success' | 'error';
  category: 'staff' | 'customer' | 'competitor' | 'financial' | 'marketing';
  title: string;
  message: string;
  impact?: {
    metric: string;
    change: number;
  };
}

export interface CompetitorAction {
  competitor: string;
  action: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface CustomerFeedback {
  sentiment: 'positive' | 'neutral' | 'negative';
  aspect: 'price' | 'quality' | 'service' | 'location';
  message: string;
  count: number; // Câți clienți au avut acest feedback
}

// Agent AI interfaces

export interface CompetitorAgent {
  name: string;
  priceStrategy: number; // Factor de preț vs. media pieței
  qualityLevel: 'low' | 'medium' | 'high';
  marketingPower: number; // 0-100
  reputation: number; // 0-100
  marketShare: number; // Procent din piață
}

export interface CustomerAgent {
  id: string;
  pricesSensitivity: number; // 0-1 (0 = nu contează prețul, 1 = foarte sensibil)
  qualityPreference: number; // 0-1 (preferință pentru calitate)
  brandLoyalty: Record<string, number>; // Loialitate față de fiecare brand
  monthlyPurchases: number; // Câte cafele cumpără pe lună
}

export interface SupplierAgent {
  name: string;
  quality: 'low' | 'medium' | 'high';
  pricePerUnit: number;
  reliability: number; // 0-100
  minimumOrder: number;
}

export interface EmployeeAgent {
  id: string;
  name: string;
  skill: number; // 0-100
  satisfaction: number; // 0-100
  salary: number;
  productivity: number; // Cafele/zi
}
