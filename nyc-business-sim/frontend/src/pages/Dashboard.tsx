import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BusinessData } from "./Onboarding";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import OverviewTab from "@/components/dashboard/OverviewTab";
import SimulationResults from "@/components/dashboard/SimulationResults";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { getAuthState, createSession, saveMonthlyState, logout, updateSession } from "@/lib/auth";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [currentMonth, setCurrentMonth] = useState(1);
  const [currentYear, setCurrentYear] = useState(2024);
  const [cashBalance, setCashBalance] = useState(0);
  const [isLoadingEvent, setIsLoadingEvent] = useState(false);
  const [lastEvent, setLastEvent] = useState<any>(null);
  const [lastTrends, setLastTrends] = useState<any>(null);
  const [simulationOutputs, setSimulationOutputs] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Track previous month state for accumulation
  const [previousMonthState, setPreviousMonthState] = useState({
    revenue: 0,
    profit: 0,
    customers: 0,
    cashBalance: 0,
  });

  useEffect(() => {
    const authState = getAuthState();

    // Check if user is authenticated
    if (!authState.user) {
      navigate("/login");
      return;
    }

    setUserId(authState.user.user_id);

    // If user has active session, restore it
    if (authState.session) {
      const session = authState.session;
      setSessionId(session.session_id);
      setCurrentMonth(session.current_month);
      setCurrentYear(session.current_year);
      setCashBalance(session.latest_state?.cash_balance || session.initial_budget);

      // Restore business data from session
      setBusinessData({
        name: session.business_name,
        industry: session.business_type,
        products: [],
        budget: session.initial_budget,
        location: {
          lat: session.location.lat,
          lng: session.location.lng,
          address: session.location.address,
          neighborhood: session.location.neighborhood,
        },
      });

      // Restore previous state if exists
      if (session.latest_state) {
        setPreviousMonthState({
          revenue: session.latest_state.revenue,
          profit: session.latest_state.profit,
          customers: session.latest_state.customers,
          cashBalance: session.latest_state.cash_balance,
        });
      } else {
        setPreviousMonthState({
          revenue: 0,
          profit: 0,
          customers: 0,
          cashBalance: session.initial_budget,
        });
      }

      toast({
        title: "Welcome back!",
        description: `Continuing ${session.business_name} - Month ${session.current_month}`,
      });
    } else {
      // New user - check if they have business data from registration
      const data = localStorage.getItem("businessData");
      if (!data) {
        navigate("/register");
        return;
      }
      const business = JSON.parse(data);
      setBusinessData(business);
      setCashBalance(business.budget);

      // Create new session
      if (business.location && authState.user) {
        createNewSession(authState.user.user_id, business);
      }

      // Initialize previous month state with starting budget
      setPreviousMonthState({
        revenue: 0,
        profit: 0,
        customers: 0,
        cashBalance: business.budget,
      });
    }
  }, [navigate, toast]);

  const createNewSession = async (userId: string, business: BusinessData) => {
    try {
      const result = await createSession(
        userId,
        business.name,
        business.industry,
        business.industry,
        {
          address: business.location?.address || "",
          neighborhood: business.location?.neighborhood || "",
          county: "New York County",
          lat: business.location?.lat || 0,
          lng: business.location?.lng || 0,
        },
        business.budget
      );

      if (result.success && result.session) {
        setSessionId(result.session.session_id);
        toast({
          title: "Session Created",
          description: `Started simulation for ${business.name}`,
        });
      }
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const saveCurrentState = async (
    month: number,
    year: number,
    outputs: any
  ) => {
    if (!sessionId) return;

    try {
      const revenue = outputs.financialData?.profit_loss?.revenue || 0;
      const profit = outputs.financialData?.profit_loss?.net_profit || 0;
      const customers = outputs.customerData?.total_active_customers || 0;
      const cashBal = outputs.financialData?.cash_flow?.closing_balance || previousMonthState.cashBalance;

      await saveMonthlyState(
        sessionId,
        month,
        year,
        revenue,
        profit,
        customers,
        cashBal,
        {
          marketContext: outputs.marketContext,
          eventsData: outputs.eventsData,
          trendsData: outputs.trendsData,
          supplierData: outputs.supplierData,
          competitionData: outputs.competitionData,
          employeeData: outputs.employeeData,
          customerData: outputs.customerData,
          financialData: outputs.financialData,
        },
        {
          pricing_strategy: "competitive",
          marketing_spend: 1000,
          quality_level: "standard",
        }
      );

      // Update session in localStorage
      updateSession({
        current_month: month,
        current_year: year,
        latest_state: {
          month,
          year,
          revenue,
          profit,
          customers,
          cash_balance: cashBal,
        },
      });

      console.log(`✅ State saved for Month ${month}, Year ${year}`);
    } catch (error) {
      console.error("Error saving state:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNextMonth = async () => {
    if (!businessData?.areaId) {
      toast({
        title: "Error",
        description: "No area data found. Please complete onboarding first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingEvent(true);

    try {
      const response = await fetch("http://localhost:8000/api/simulation/next-month", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          area_id: businessData.areaId,
          business_type: businessData.industry || businessData.name,
          current_month: currentMonth,
          current_year: currentYear,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate event");
      }

      const data = await response.json();

      if (data.success && data.event) {
        // Backend returns: { event: { success: true, event: {...} }, trends: { success: true, analysis: {...} } }
        const event = data.event.event || data.event; // Handle both nested and direct structure
        const trends = data.trends?.analysis; // trends data
        setLastEvent(event);
        setLastTrends(trends);

        // Update month
        if (currentMonth === 12) {
          setCurrentMonth(1);
          setCurrentYear(currentYear + 1);
        } else {
          setCurrentMonth(currentMonth + 1);
        }

        // Show combined notification
        toast({
          title: `🎲 Month ${currentMonth} Complete!`,
          description: `Event: ${event.nume_eveniment} (${event.impact_clienti_lunar > 0 ? '+' : ''}${event.impact_clienti_lunar}%)\n${trends ? `Trend: ${trends.main_trend.trend_name}` : ''}`,
          duration: 5000,
        });

        // Log detailed data
        console.log("Event generated:", event);
        console.log("Trends analysis:", trends);
      } else {
        throw new Error(data.error || "Unknown error");
      }

    } catch (error: any) {
      console.error("Error generating event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate event for next month",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEvent(false);
    }
  };

  const handleFullSimulation = async () => {
    if (!businessData?.areaId) {
      toast({
        title: "Error",
        description: "No area data found. Please complete onboarding first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingEvent(true);

    try {
      // First, get census data from backend
      const censusResponse = await fetch(`http://localhost:8000/api/get-area/${businessData.areaId}`);
      if (!censusResponse.ok) {
        throw new Error("Failed to fetch area data");
      }
      const areaData = await censusResponse.json();

      // Get trends data
      const trendsResponse = await fetch("http://localhost:8000/api/get-trends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          business_type: businessData.industry || businessData.name,
          location: "US-NY"
        }),
      });
      const trendsData = await trendsResponse.json();

      // Call full simulation endpoint
      const response = await fetch("http://localhost:3000/api/simulation/run-full", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessType: businessData.industry || businessData.name,
          location: {
            address: areaData.data?.area_name || "Unknown",
            neighborhood: areaData.data?.area_name || "Unknown",
            county: "New York County",
            lat: businessData.location.lat,
            lng: businessData.location.lng,
          },
          censusData: areaData.detailed_data,
          trendsData: trendsData,
          survivalData: null,
          currentMonth: currentMonth,
          currentYear: currentYear,
          playerDecisions: {
            pricing_strategy: "competitive",
            marketing_spend: 1000,
            quality_level: "standard",
            target_employee_count: 3,
            avg_hourly_wage: 20
          },
          // NEW: Send sessionId and initialBudget for state fetching
          sessionId: sessionId,
          initialBudget: businessData.budget,
          // Still send previousMonthState as fallback
          previousMonthState: previousMonthState
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to run full simulation");
      }

      const data = await response.json();

      if (data.success && data.outputs) {
        setSimulationOutputs(data);

        // Update month
        if (currentMonth === 12) {
          setCurrentMonth(1);
          setCurrentYear(currentYear + 1);
        } else {
          setCurrentMonth(currentMonth + 1);
        }

        // Update previous month state for next iteration
        setPreviousMonthState({
          revenue: data.outputs.financialData?.profit_loss?.revenue || 0,
          profit: data.outputs.financialData?.profit_loss?.net_profit || 0,
          customers: data.outputs.customerData?.total_active_customers || 0,
          cashBalance: data.outputs.financialData?.cash_flow?.closing_balance || previousMonthState.cashBalance,
        });

        // Update cash balance display
        if (data.outputs.financialData?.cash_flow?.closing_balance) {
          setCashBalance(data.outputs.financialData.cash_flow.closing_balance);
        }

        // Save state to database
        const newMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const newYear = currentMonth === 12 ? currentYear + 1 : currentYear;
        await saveCurrentState(newMonth, newYear, data.outputs);

        toast({
          title: `✅ Simulation Complete!`,
          description: `Month ${currentMonth} simulated in ${data.executionTime}ms`,
          duration: 5000,
        });

        console.log("Full simulation results:", data);
      } else {
        throw new Error(data.error || "Unknown error");
      }

    } catch (error: any) {
      console.error("Error running full simulation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to run simulation",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEvent(false);
    }
  };

  if (!businessData) {
    return null;
  }

  return (
    <DashboardLayout>
      <DashboardHeader
        businessName={businessData.name}
        currentMonth={currentMonth}
        cashBalance={cashBalance}
        notifications={5}
        onNextMonth={handleNextMonth}
        isLoadingNextMonth={isLoadingEvent}
        onLogout={handleLogout}
      />

      {/* Action Buttons */}
      <div className="px-8 py-4 flex gap-4">
        <Button
          onClick={handleFullSimulation}
          disabled={isLoadingEvent}
          size="lg"
          className="bg-gradient-to-r from-primary to-accent"
        >
          {isLoadingEvent ? "🔄 Running Simulation..." : "🚀 Run Full Month Simulation"}
        </Button>
        <Button
          onClick={handleNextMonth}
          disabled={isLoadingEvent}
          variant="outline"
          size="lg"
        >
          {isLoadingEvent ? "⏳ Generating..." : "🎲 Quick Event Only"}
        </Button>
      </div>

      {/* Full Simulation Results */}
      {simulationOutputs && (
        <div className="px-8 py-6">
          <SimulationResults
            outputs={simulationOutputs.outputs}
            month={simulationOutputs.month}
            year={simulationOutputs.year}
            executionTime={simulationOutputs.executionTime}
          />
        </div>
      )}

      {/* Simulation Insights Section */}
      <div className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Events Card */}
          {lastEvent && (
            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎲</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Latest Event</h3>
                  <h4 className="text-accent font-medium mb-2">{lastEvent.nume_eveniment}</h4>
                  <p className="text-sm text-white/70 mb-3">{lastEvent.descriere_scurta}</p>

                  <div className="flex items-center gap-4">
                    <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-xs text-white/50">Customer Impact</span>
                      <div className={`text-lg font-bold ${lastEvent.impact_clienti_lunar > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {lastEvent.impact_clienti_lunar > 0 ? '+' : ''}{lastEvent.impact_clienti_lunar}%
                      </div>
                    </div>

                    {lastEvent.relevanta_pentru_business && (
                      <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                        ✓ Relevant
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trends Card */}
          {lastTrends && (
            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Market Trends</h3>

                  {/* Main Trend */}
                  <div className="mb-4">
                    <h4 className="text-accent font-medium mb-1">{lastTrends.main_trend.trend_name}</h4>
                    <p className="text-sm text-white/70 mb-2">{lastTrends.main_trend.description}</p>

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-xs text-white/50">Impact Score</span>
                        <div className={`text-lg font-bold ${lastTrends.main_trend.impact_score > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {lastTrends.main_trend.impact_score > 0 ? '+' : ''}{lastTrends.main_trend.impact_score}
                        </div>
                      </div>

                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${lastTrends.main_trend.confidence === 'high' ? 'bg-green-500/20 text-green-400' :
                        lastTrends.main_trend.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                        {lastTrends.main_trend.confidence} confidence
                      </div>
                    </div>
                  </div>

                  {/* Actionable Insight */}
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="text-xs text-blue-400 font-medium mb-1">💡 Action Item</div>
                    <p className="text-sm text-white/80">{lastTrends.main_trend.actionable_insight}</p>
                  </div>

                  {/* Overall Metrics */}
                  <div className="mt-4 flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-white/50">Sentiment:</span>
                      <span className={`font-medium ${lastTrends.overall_sentiment === 'positive' ? 'text-green-400' :
                        lastTrends.overall_sentiment === 'negative' ? 'text-red-400' :
                          'text-gray-400'
                        }`}>
                        {lastTrends.overall_sentiment}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-white/50">Momentum:</span>
                      <span className="text-accent font-medium">{lastTrends.market_momentum}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Secondary Trends */}
        {lastTrends?.secondary_trends && lastTrends.secondary_trends.length > 0 && (
          <div className="glass-card p-6 rounded-2xl border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Secondary Trends</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lastTrends.secondary_trends.map((trend: any, index: number) => (
                <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <h4 className="text-sm font-medium text-accent mb-1">{trend.trend_name}</h4>
                  <p className="text-xs text-white/60 mb-2">{trend.description}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${trend.impact_score > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trend.impact_score > 0 ? '+' : ''}{trend.impact_score}
                    </span>
                    <span className="text-xs text-white/40">•</span>
                    <span className="text-xs text-white/50">{trend.confidence}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <OverviewTab />
    </DashboardLayout>
  );
};

export default Dashboard;