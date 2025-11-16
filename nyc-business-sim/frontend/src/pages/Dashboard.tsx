import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BusinessData } from "./Onboarding";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import OverviewTab from "@/components/dashboard/OverviewTab";
import { useToast } from "@/hooks/use-toast";

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
  const [lastSupplier, setLastSupplier] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem("businessData");
    if (!data) {
      navigate("/onboarding");
      return;
    }
    const business = JSON.parse(data);
    setBusinessData(business);
    setCashBalance(business.budget);
  }, [navigate]);

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

      console.log("Simulation response:", data); // Debug log

      if (data.success) {
        const event = data.event?.event; // nested structure from agents-orchestrator
        const trends = data.trends?.analysis; // trends data
        const supplier = data.supplier?.supplier_analysis; // supplier data
        
        if (event) setLastEvent(event);
        if (trends) setLastTrends(trends);
        if (supplier) setLastSupplier(supplier);

        // Update month
        if (currentMonth === 12) {
          setCurrentMonth(1);
          setCurrentYear(currentYear + 1);
        } else {
          setCurrentMonth(currentMonth + 1);
        }

        // Build notification message
        let notificationParts: string[] = [];
        if (event) {
          notificationParts.push(`Event: ${event.nume_eveniment} (${event.impact_clienti_lunar > 0 ? '+' : ''}${event.impact_clienti_lunar}%)`);
        }
        if (trends) {
          notificationParts.push(`Trend: ${trends.main_trend.trend_name}`);
        }
        if (supplier) {
          notificationParts.push(`Supplier: ${supplier.recommended_tier} tier`);
        }

        // Show combined notification
        toast({
          title: `🎲 Month ${currentMonth} Complete!`,
          description: notificationParts.length > 0 ? notificationParts.join('\n') : 'Simulation completed',
          duration: 5000,
        });

        // Log detailed data
        console.log("Event generated:", event);
        console.log("Trends analysis:", trends);
        console.log("Supplier analysis:", supplier);
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
      />

      {/* Simulation Insights Section */}
      <div className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

          {/* Supplier Analysis Card */}
          {lastSupplier && (
            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Supplier Analysis</h3>

                  {/* Recommended Tier */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-white/60">Recommended Tier:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        lastSupplier.recommended_tier === 'premium' ? 'bg-purple-500/20 text-purple-400' :
                        lastSupplier.recommended_tier === 'mid-range' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {lastSupplier.recommended_tier}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap mb-3">
                      <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-xs text-white/50">Confidence</span>
                        <div className="text-lg font-bold text-accent">
                          {lastSupplier.tier_confidence_score}%
                        </div>
                      </div>

                      <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-xs text-white/50">Quality Score</span>
                        <div className="text-lg font-bold text-green-400">
                          {lastSupplier.base_quality_score}/100
                        </div>
                      </div>

                      <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-xs text-white/50">Seasonal</span>
                        <div className="text-lg font-bold text-orange-400">
                          {lastSupplier.seasonal_cost_modifier}x
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cost Estimates Preview */}
                  {lastSupplier.cost_estimates && (
                    <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <div className="text-xs text-orange-400 font-medium mb-2">💰 Cost Estimates (F&B)</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-white/50">Budget:</span>
                          <span className="text-white font-medium ml-1">
                            ${lastSupplier.cost_estimates.food_and_beverage.budget.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/50">Mid:</span>
                          <span className="text-white font-medium ml-1">
                            ${lastSupplier.cost_estimates.food_and_beverage['mid-range'].toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/50">Premium:</span>
                          <span className="text-white font-medium ml-1">
                            ${lastSupplier.cost_estimates.food_and_beverage.premium.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Key Insights */}
                  {lastSupplier.key_insights && lastSupplier.key_insights.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {lastSupplier.key_insights.slice(0, 2).map((insight: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-white/70">
                          <span className="text-orange-400 mt-0.5">•</span>
                          <span>{insight}</span>
                        </div>
                      ))}
                    </div>
                  )}
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