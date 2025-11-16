import { useState } from "react";
import { Bell, Calendar, DollarSign, ChevronRight, Eye, EyeOff, Loader2, LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  businessName: string;
  currentMonth: number;
  cashBalance: number;
  notifications: number;
  onNextMonth?: () => void;
  isLoadingNextMonth?: boolean;
  onLogout?: () => void;
  onAddInvestment?: (amount: number) => void;
};

const DashboardHeader = ({
  businessName,
  currentMonth,
  cashBalance,
  notifications,
  onNextMonth,
  isLoadingNextMonth = false,
  onLogout,
  onAddInvestment
}: Props) => {
  const [showBalance, setShowBalance] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddInvestment = () => {
    const amount = parseFloat(investmentAmount);
    if (!isNaN(amount) && amount > 0 && onAddInvestment) {
      onAddInvestment(amount);
      setInvestmentAmount("");
      setIsDialogOpen(false);
    }
  };

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
          <div className="flex items-center gap-2 text-base text-white/50">
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
                <span className="text-accent font-light text-base">
                  ${cashBalance.toLocaleString()}
                </span>
              ) : (
                <span className="text-white/40 text-base font-light">••••••</span>
              )}
            </button>
          </div>
        </div>

        {/* Minimalist Actions */}
        <div className="flex items-center gap-3">
          {/* Add Investment Button */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button 
                className="p-2.5 rounded-xl glass-button hover:border-green-500/20 transition-all duration-300 group"
                title="Add Investment"
              >
                <Plus className="h-4 w-4 text-white/50 group-hover:text-green-400 transition-colors" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md backdrop-blur-xl bg-black/90 border-white/10">
              <DialogHeader>
                <DialogTitle className="text-xl text-white">Add Investment</DialogTitle>
                <DialogDescription className="text-white/60">
                  Inject additional capital into your business
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-white/80">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddInvestment();
                      }
                    }}
                  />
                </div>
                <Button 
                  onClick={handleAddInvestment}
                  className="w-full bg-gradient-to-r from-green-500/80 to-green-600/80 hover:from-green-500 hover:to-green-600"
                  disabled={!investmentAmount || parseFloat(investmentAmount) <= 0}
                >
                  Add Investment
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2.5 rounded-xl glass-button hover:border-red-500/20 transition-all duration-300 group"
              title="Logout"
            >
              <LogOut className="h-4 w-4 text-white/50 group-hover:text-red-400 transition-colors" />
            </button>
          )}

          {/* Glassy Run Full Month Simulation Button */}
          <Button
            onClick={onNextMonth}
            disabled={isLoadingNextMonth}
            className="px-6 py-2.5 rounded-xl font-light text-base tracking-wide transition-all duration-300 group border-0"
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
                <span className="text-white/90">RUN FULL MONTH SIMULATION</span>
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
