import { useState } from "react";
import { Bell, Calendar, DollarSign, ChevronRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  businessName: string;
  currentMonth: number;
  cashBalance: number;
  notifications: number;
  onNextMonth?: () => void;
  isLoadingNextMonth?: boolean;
};

const DashboardHeader = ({
  businessName,
  currentMonth,
  cashBalance,
  notifications,
  onNextMonth,
  isLoadingNextMonth = false
}: Props) => {
  const [showBalance, setShowBalance] = useState(false);

  return (
    <header
      className="h-20 border-b border-white/[0.06] sticky top-0 z-30 backdrop-blur-xl"
      style={{
        background: 'rgba(0, 0, 0, 0.4)',
      }}
    >
      <div className="h-full px-8 flex items-center justify-between">
        {/* Minimalist Business Info */}
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-light tracking-wide text-white/90">
            {businessName}
          </h1>
          <div className="h-6 w-px bg-white/[0.08]" />
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Calendar className="h-4 w-4" />
            <span className="font-light">M{currentMonth}</span>
          </div>

          {/* Progressive Disclosure - Cash Balance */}
          <div className="relative group">
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-button hover:border-primary/30 transition-all duration-300"
            >
              {showBalance ? (
                <EyeOff className="h-4 w-4 text-white/50" />
              ) : (
                <Eye className="h-4 w-4 text-white/50" />
              )}
              {showBalance ? (
                <span className="text-accent font-light text-sm">
                  ${cashBalance.toLocaleString()}
                </span>
              ) : (
                <span className="text-white/40 text-sm font-light">••••••</span>
              )}
            </button>
          </div>
        </div>

        {/* Minimalist Actions */}
        <div className="flex items-center gap-3">
          {/* Subtle Notifications */}
          <button className="relative p-2.5 rounded-xl glass-button hover:border-primary/20 transition-all duration-300 group">
            <Bell className="h-4 w-4 text-white/50 group-hover:text-white/70 transition-colors" />
            {notifications > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-medium"
                style={{
                  background: 'rgba(13, 115, 119, 0.8)',
                  boxShadow: '0 0 12px rgba(13, 115, 119, 0.4)',
                }}
              >
                {notifications}
              </span>
            )}
          </button>

          {/* Glassy NEXT MONTH Button */}
          <Button
            onClick={onNextMonth}
            disabled={isLoadingNextMonth}
            className="px-6 py-2.5 rounded-xl font-light text-sm tracking-wide transition-all duration-300 group border-0"
            style={{
              background: 'linear-gradient(135deg, rgba(13, 115, 119, 0.3) 0%, rgba(20, 255, 236, 0.15) 100%)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 0 20px rgba(13, 115, 119, 0.2)',
            }}
            onMouseEnter={(e) => {
              if (!isLoadingNextMonth) {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(13, 115, 119, 0.4)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(13, 115, 119, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isLoadingNextMonth ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 text-accent animate-spin" />
                <span className="text-white/90">GENERATING...</span>
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2 text-accent group-hover:scale-110 transition-transform" />
                <span className="text-white/90">NEXT MONTH</span>
                <ChevronRight className="h-4 w-4 ml-2 text-accent group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
