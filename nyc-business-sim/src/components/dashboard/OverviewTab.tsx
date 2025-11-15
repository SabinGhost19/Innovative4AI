import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Package,
  Target,
  Zap,
  Star,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import MetricCard from "./MetricCard";
import ProgressRing from "./ProgressRing";
import MiniChart from "./MiniChart";
import { Button } from "@/components/ui/button";

const OverviewTab = () => {
  // Mock data
  const revenueData = [4200, 4800, 5100, 4900, 5500, 6200, 6800];
  const customersData = [120, 135, 142, 138, 155, 168, 182];
  
  return (
    <div className="p-8 space-y-8">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Monthly Revenue"
          value="$6,800"
          change={12.5}
          icon={DollarSign}
          iconColor="text-success"
          trend="up"
          subtitle="vs. last month"
        />
        <MetricCard
          title="Total Customers"
          value="182"
          change={8.3}
          icon={Users}
          iconColor="text-primary"
          trend="up"
          subtitle="active this month"
        />
        <MetricCard
          title="Profit Margin"
          value="24.5%"
          change={-2.1}
          icon={TrendingUp}
          iconColor="text-accent"
          trend="down"
          subtitle="needs attention"
        />
        <MetricCard
          title="Customer Satisfaction"
          value="4.6"
          change={5.2}
          icon={Star}
          iconColor="text-accent"
          trend="up"
          subtitle="out of 5.0"
        />
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 metric-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Revenue Trend</h3>
              <p className="text-sm text-muted-foreground">Last 7 months performance</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-success">+15.8%</p>
              <p className="text-xs text-muted-foreground">growth rate</p>
            </div>
          </div>
          <div className="h-32">
            <MiniChart data={revenueData} trend="up" height={80} />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Avg. Daily</p>
              <p className="text-lg font-bold">$226</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Best Day</p>
              <p className="text-lg font-bold text-success">$342</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Forecast</p>
              <p className="text-lg font-bold text-primary">$7,200</p>
            </div>
          </div>
        </div>

        {/* Market Position */}
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Market Position</h3>
          <div className="flex flex-col items-center py-4">
            <ProgressRing 
              percentage={68} 
              size={140}
              label="market share"
              value="68%"
            />
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your Business</span>
              <span className="font-semibold text-primary">Rank #3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Competitors</span>
              <span className="font-semibold">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Category Leader</span>
              <span className="font-semibold text-accent">You're close!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operations Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Staff Status */}
        <div className="metric-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Staff Status</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Employees</span>
                <span className="font-semibold">8 / 10</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: "80%" }} />
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Avg. Satisfaction</span>
              <span className="font-semibold text-success">8.4/10</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Productivity</span>
              <span className="font-semibold text-primary">92%</span>
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="metric-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-accent" />
            </div>
            <h3 className="font-semibold">Inventory</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Stock Level</span>
                <span className="font-semibold">Good</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-success to-success/80" style={{ width: "75%" }} />
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Low Stock Items</span>
              <span className="font-semibold text-destructive">2</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Turnover Rate</span>
              <span className="font-semibold text-success">High</span>
            </div>
          </div>
        </div>

        {/* Customer Engagement */}
        <div className="metric-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-success" />
            </div>
            <h3 className="font-semibold">Engagement</h3>
          </div>
          <div className="space-y-3">
            <div className="text-center py-2">
              <p className="text-4xl font-bold gradient-text">142</p>
              <p className="text-xs text-muted-foreground mt-1">new messages</p>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Reviews</span>
              <span className="font-semibold">18 new</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Loyalty Rate</span>
              <span className="font-semibold text-success">76%</span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="metric-card border-destructive/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <h3 className="font-semibold">Alerts</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <p className="text-sm font-medium mb-1">Competitor Alert</p>
              <p className="text-xs text-muted-foreground">New rival opened nearby</p>
            </div>
            <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
              <p className="text-sm font-medium mb-1">Price Pressure</p>
              <p className="text-xs text-muted-foreground">Market prices dropping</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="glass-button h-auto py-6 flex flex-col gap-2">
            <Target className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">Set Goals</span>
          </Button>
          <Button variant="outline" className="glass-button h-auto py-6 flex flex-col gap-2">
            <ShoppingCart className="h-6 w-6 text-accent" />
            <span className="text-sm font-medium">Order Supplies</span>
          </Button>
          <Button variant="outline" className="glass-button h-auto py-6 flex flex-col gap-2">
            <Users className="h-6 w-6 text-success" />
            <span className="text-sm font-medium">Hire Staff</span>
          </Button>
          <Button variant="outline" className="glass-button h-auto py-6 flex flex-col gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">Launch Campaign</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
