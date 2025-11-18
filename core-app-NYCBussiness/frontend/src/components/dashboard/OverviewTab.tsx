import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  Users,
  ChevronDown,
  ChevronUp,
  Eye,
  Briefcase,
  Target,
  AlertCircle
} from "lucide-react";
import { Chart } from "react-google-charts";
import BusinessMap from "./BusinessMap";

interface OverviewTabProps {
  sessionId: string | null;
  currentMonth: number;
  currentYear: number;
  simulationOutputs: any;
  businessLocation?: {
    lat: number;
    lng: number;
    address?: string;
    neighborhood?: string;
  };
  areaId?: number;
  industryType?: string;
}

interface HistoryData {
  month: number;
  year: number;
  revenue: number;
  profit: number;
  customers: number;
  cash_balance: number;
}

const OverviewTab = ({ sessionId, currentMonth, currentYear, simulationOutputs, businessLocation, areaId, industryType }: OverviewTabProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [history, setHistory] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/api/simulation/session/${sessionId}/history`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.history) {
            setHistory(data.history);
          }
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [sessionId, currentMonth]); // Refetch when month changes

  // Calculate metrics from current simulation outputs
  const currentRevenue = simulationOutputs?.financialData?.profit_loss?.revenue || 0;
  const currentProfit = simulationOutputs?.financialData?.profit_loss?.net_profit || 0;
  const currentCustomers = simulationOutputs?.customerData?.total_active_customers || 0;
  const currentMargin = simulationOutputs?.financialData?.profit_loss?.profit_margin || 0;
  const currentEmployees = simulationOutputs?.employeeData?.total_employees || 0;
  const employeeSatisfaction = simulationOutputs?.employeeData?.satisfaction_score || 0;
  const employeeProductivity = simulationOutputs?.employeeData?.productivity_score || 0;
  const marketShare = simulationOutputs?.competitionData?.market_share || 0;
  const marketRank = simulationOutputs?.competitionData?.rank || 0;
  const totalCompetitors = simulationOutputs?.competitionData?.total_competitors || 0;
  
  // Calculate trends from history
  const calculateTrend = (data: number[]) => {
    if (data.length < 2) return 0;
    const lastValue = data[data.length - 1];
    const prevValue = data[data.length - 2];
    if (prevValue === 0) return 0;
    return ((lastValue - prevValue) / prevValue) * 100;
  };

  const revenueData = history.map(h => h.revenue);
  const profitData = history.map(h => h.profit);
  const customerData = history.map(h => h.customers);
  
  const revenueTrend = calculateTrend(revenueData);
  const customerTrend = calculateTrend(customerData);
  const profitTrend = calculateTrend(profitData);

  // Calculate average daily revenue
  const avgDaily = currentRevenue / 30;
  const bestDay = avgDaily * 1.5; // Estimate
  const forecast = currentRevenue * 1.05; // 5% growth estimate

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-white/50">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Google Maps Integration */}
      {businessLocation && (
        <BusinessMap 
          businessLocation={businessLocation}
          areaId={areaId}
          industryType={industryType}
        />
      )}

      {/* No data message */}
      {history.length === 0 && !loading && (
        <div
          className="text-center p-8"
          style={{
            background: 'rgba(13, 13, 13, 0.4)',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
          }}
        >
          <AlertCircle className="h-12 w-12 text-white/30 mx-auto mb-3" />
          <p className="text-white/50 font-light">
            No historical data yet. Run your first simulation to see analytics.
          </p>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
