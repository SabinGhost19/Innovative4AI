import { Bell, Calendar, DollarSign, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  businessName: string;
  currentMonth: number;
  cashBalance: number;
  notifications: number;
};

const DashboardHeader = ({ businessName, currentMonth, cashBalance, notifications }: Props) => {
  return (
    <header className="h-20 border-b border-border/50 glass-card sticky top-0 z-30">
      <div className="h-full px-8 flex items-center justify-between">
        {/* Business Info */}
        <div>
          <h1 className="text-2xl font-bold">{businessName}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Month {currentMonth}</span>
            </div>
            <div className="flex items-center gap-1.5 text-success font-semibold">
              <DollarSign className="h-4 w-4" />
              <span>${cashBalance.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-3 rounded-xl glass-button hover:bg-primary/10 transition-colors">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-destructive to-destructive/80 text-white text-xs flex items-center justify-center font-bold animate-pulse">
                {notifications}
              </span>
            )}
          </button>

          {/* Next Month Button */}
          <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 glow-primary group">
            <Calendar className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            NEXT MONTH
            <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
