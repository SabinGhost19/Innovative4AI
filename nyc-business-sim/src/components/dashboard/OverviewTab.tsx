import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Users,
  ChevronDown,
  ChevronUp,
  Eye
} from "lucide-react";
import MiniChart from "./MiniChart";

const OverviewTab = () => {
  const [showDetails, setShowDetails] = useState(false);

  // Mock data
  const revenueData = [4200, 4800, 5100, 4900, 5500, 6200, 6800];

  return (
    <div className="p-8 space-y-6">
      {/* Essential Metrics Only - Progressive Disclosure */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Revenue - Primary Metric */}
        <div
          className="group cursor-pointer transition-all duration-300"
          style={{
            background: 'rgba(13, 13, 13, 0.4)',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '24px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(13, 115, 119, 0.3)';
            e.currentTarget.style.boxShadow = '0 0 24px rgba(13, 115, 119, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{
                  background: 'rgba(13, 115, 119, 0.15)',
                }}
              >
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-light text-white/40 uppercase tracking-wider">Revenue</span>
            </div>
            <div className="text-xs text-accent font-light">+12.5%</div>
          </div>
          <p className="text-3xl font-light text-white/90 mb-1">$6,800</p>
          <p className="text-xs text-white/30 font-light">this month</p>
        </div>

        {/* Customers */}
        <div
          className="group cursor-pointer transition-all duration-300"
          style={{
            background: 'rgba(13, 13, 13, 0.4)',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '24px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(13, 115, 119, 0.3)';
            e.currentTarget.style.boxShadow = '0 0 24px rgba(13, 115, 119, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{
                  background: 'rgba(13, 115, 119, 0.15)',
                }}
              >
                <Users className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-light text-white/40 uppercase tracking-wider">Customers</span>
            </div>
            <div className="text-xs text-accent font-light">+8.3%</div>
          </div>
          <p className="text-3xl font-light text-white/90 mb-1">182</p>
          <p className="text-xs text-white/30 font-light">active</p>
        </div>

        {/* Profit Margin */}
        <div
          className="group cursor-pointer transition-all duration-300"
          style={{
            background: 'rgba(13, 13, 13, 0.4)',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '24px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(13, 115, 119, 0.3)';
            e.currentTarget.style.boxShadow = '0 0 24px rgba(13, 115, 119, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{
                  background: 'rgba(13, 115, 119, 0.15)',
                }}
              >
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-light text-white/40 uppercase tracking-wider">Margin</span>
            </div>
            <div className="text-xs text-white/40 font-light">-2.1%</div>
          </div>
          <p className="text-3xl font-light text-white/90 mb-1">24.5%</p>
          <p className="text-xs text-white/30 font-light">profit</p>
        </div>
      </div>

      {/* Progressive Disclosure - Show Details Toggle */}
      <div className="flex items-center justify-center">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300"
          style={{
            background: showDetails
              ? 'rgba(13, 115, 119, 0.2)'
              : 'rgba(13, 13, 13, 0.4)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(13, 115, 119, 0.4)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(13, 115, 119, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Eye className="h-4 w-4 text-white/50" />
          <span className="text-sm font-light text-white/70">
            {showDetails ? 'Hide Details' : 'Show Details'}
          </span>
          {showDetails ? (
            <ChevronUp className="h-4 w-4 text-accent" />
          ) : (
            <ChevronDown className="h-4 w-4 text-accent" />
          )}
        </button>
      </div>

      {/* Detailed Analytics - Hidden by Default */}
      {showDetails && (
        <div className="space-y-5 animate-in fade-in duration-500">
          {/* Revenue Trend Chart */}
          <div
            className="transition-all duration-300"
            style={{
              background: 'rgba(13, 13, 13, 0.4)',
              backdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '28px',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-light text-white/80 mb-1">Revenue Trend</h3>
                <p className="text-xs text-white/40 font-light">7-month performance</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-light text-accent">+15.8%</p>
                <p className="text-xs text-white/30 font-light">growth</p>
              </div>
            </div>
            <div className="h-32 mb-6">
              <MiniChart data={revenueData} trend="up" height={80} />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-5 border-t border-white/[0.06]">
              <div>
                <p className="text-xs text-white/40 mb-1 font-light">Avg. Daily</p>
                <p className="text-lg font-light text-white/80">$226</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1 font-light">Best Day</p>
                <p className="text-lg font-light text-accent">$342</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1 font-light">Forecast</p>
                <p className="text-lg font-light text-primary">$7,200</p>
              </div>
            </div>
          </div>

          {/* Additional Metrics Grid - Minimalist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Staff Status */}
            <div
              className="transition-all duration-300"
              style={{
                background: 'rgba(13, 13, 13, 0.4)',
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px',
              }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'rgba(13, 115, 119, 0.15)',
                  }}
                >
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-light text-white/80">Staff Status</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/40 font-light">Employees</span>
                    <span className="font-light text-white/70">8 / 10</span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: "80%",
                        background: 'linear-gradient(90deg, rgba(13, 115, 119, 0.8) 0%, rgba(20, 255, 236, 0.6) 100%)',
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 font-light">Satisfaction</span>
                  <span className="font-light text-accent">8.4/10</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 font-light">Productivity</span>
                  <span className="font-light text-primary">92%</span>
                </div>
              </div>
            </div>

            {/* Market Position */}
            <div
              className="transition-all duration-300"
              style={{
                background: 'rgba(13, 13, 13, 0.4)',
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px',
              }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'rgba(13, 115, 119, 0.15)',
                  }}
                >
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-light text-white/80">Market Position</h3>
              </div>
              <div className="space-y-4">
                <div className="text-center py-3">
                  <p className="text-5xl font-light text-accent mb-1">68%</p>
                  <p className="text-xs text-white/30 font-light">market share</p>
                </div>
                <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/40 font-light">Your Rank</span>
                    <span className="font-light text-primary">#3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/40 font-light">Competitors</span>
                    <span className="font-light text-white/70">12</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
