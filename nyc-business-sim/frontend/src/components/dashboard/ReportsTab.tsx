import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    ShoppingCart,
    ChevronDown,
    ChevronUp,
    BarChart3,
} from "lucide-react";

type ReportType = "monthly" | "quarterly" | "yearly";
type ChartType = "revenue" | "profit" | "customers" | "expenses";

// Mock data pentru rapoarte
const monthlyData = [
    { month: "Jan", revenue: 45000, profit: 12000, expenses: 33000, customers: 1200 },
    { month: "Feb", revenue: 52000, profit: 15000, expenses: 37000, customers: 1450 },
    { month: "Mar", revenue: 48000, profit: 13500, expenses: 34500, customers: 1350 },
    { month: "Apr", revenue: 61000, profit: 18500, expenses: 42500, customers: 1680 },
    { month: "May", revenue: 58000, profit: 17000, expenses: 41000, customers: 1590 },
    { month: "Jun", revenue: 65000, profit: 20000, expenses: 45000, customers: 1820 },
];

const expenseBreakdown = [
    { name: "Rent", value: 12000, color: "#3b82f6" },
    { name: "Salaries", value: 18000, color: "#8b5cf6" },
    { name: "Inventory", value: 8500, color: "#ec4899" },
    { name: "Marketing", value: 4500, color: "#f59e0b" },
    { name: "Utilities", value: 2000, color: "#10b981" },
];

const productPerformance = [
    { product: "Product A", sales: 320, revenue: 16000, margin: 35 },
    { product: "Product B", sales: 280, revenue: 14000, margin: 42 },
    { product: "Product C", sales: 190, revenue: 9500, margin: 28 },
    { product: "Product D", sales: 150, revenue: 7500, margin: 38 },
];

const ReportsTab = () => {
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [selectedChart, setSelectedChart] = useState<ChartType>("revenue");

    const currentMonth = monthlyData[monthlyData.length - 1];
    const previousMonth = monthlyData[monthlyData.length - 2];

    const revenueChange = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;
    const profitChange = ((currentMonth.profit - previousMonth.profit) / previousMonth.profit) * 100;
    const customerChange = ((currentMonth.customers - previousMonth.customers) / previousMonth.customers) * 100;

    const getChartData = () => {
        switch (selectedChart) {
            case "revenue":
                return monthlyData.map(d => ({ month: d.month, value: d.revenue, name: "Revenue" }));
            case "profit":
                return monthlyData.map(d => ({ month: d.month, value: d.profit, name: "Profit" }));
            case "customers":
                return monthlyData.map(d => ({ month: d.month, value: d.customers, name: "Customers" }));
            case "expenses":
                return monthlyData.map(d => ({ month: d.month, value: d.expenses, name: "Expenses" }));
            default:
                return monthlyData;
        }
    };

    return (
        <div className="p-8 space-y-6">
            {/* Minimalist Summary - Only 4 Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                {/* Revenue */}
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
                    <div className="flex items-center gap-2 mb-3">
                        <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{
                                background: 'rgba(13, 115, 119, 0.15)',
                            }}
                        >
                            <DollarSign className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-light text-white/40 uppercase tracking-wider">Revenue</span>
                    </div>
                    <p className="text-3xl font-light text-white/90 mb-2">${currentMonth.revenue.toLocaleString()}</p>
                    <div className={`flex items-center gap-1.5 text-base ${revenueChange >= 0 ? 'text-accent' : 'text-white/40'}`}>
                        {revenueChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span className="font-light text-sm">{Math.abs(revenueChange).toFixed(1)}%</span>
                    </div>
                </div>

                {/* Profit */}
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
                    <div className="flex items-center gap-2 mb-3">
                        <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{
                                background: 'rgba(13, 115, 119, 0.15)',
                            }}
                        >
                            <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-light text-white/40 uppercase tracking-wider">Profit</span>
                    </div>
                    <p className="text-3xl font-light text-accent mb-2">${currentMonth.profit.toLocaleString()}</p>
                    <div className={`flex items-center gap-1.5 text-base ${profitChange >= 0 ? 'text-accent' : 'text-white/40'}`}>
                        {profitChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span className="font-light text-sm">{Math.abs(profitChange).toFixed(1)}%</span>
                    </div>
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
                    <div className="flex items-center gap-2 mb-3">
                        <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{
                                background: 'rgba(13, 115, 119, 0.15)',
                            }}
                        >
                            <Users className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-light text-white/40 uppercase tracking-wider">Customers</span>
                    </div>
                    <p className="text-3xl font-light text-white/90 mb-2">{currentMonth.customers.toLocaleString()}</p>
                    <div className={`flex items-center gap-1.5 text-base ${customerChange >= 0 ? 'text-accent' : 'text-white/40'}`}>
                        {customerChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span className="font-light text-sm">{Math.abs(customerChange).toFixed(1)}%</span>
                    </div>
                </div>

                {/* Expenses */}
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
                    <div className="flex items-center gap-2 mb-3">
                        <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{
                                background: 'rgba(13, 115, 119, 0.15)',
                            }}
                        >
                            <ShoppingCart className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-light text-white/40 uppercase tracking-wider">Expenses</span>
                    </div>
                    <p className="text-3xl font-light text-white/40 mb-2">${currentMonth.expenses.toLocaleString()}</p>
                    <p className="text-sm text-white/30 font-light">
                        {((currentMonth.expenses / currentMonth.revenue) * 100).toFixed(1)}% of revenue
                    </p>
                </div>
            </div>

            {/* Progressive Disclosure - Show Analytics Toggle */}
            <div className="flex items-center justify-center">
                <button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className="flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300"
                    style={{
                        background: showAnalytics
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
                    <BarChart3 className="h-4 w-4 text-white/50" />
                    <span className="text-sm font-light text-white/70">
                        {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                    </span>
                    {showAnalytics ? (
                        <ChevronUp className="h-4 w-4 text-accent" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-accent" />
                    )}
                </button>
            </div>

            {/* Analytics - Hidden by Default */}
            {showAnalytics && (
                <div className="space-y-5 animate-in fade-in duration-500">
                    {/* Chart Controls */}
                    <div
                        className="flex items-center justify-between p-5"
                        style={{
                            background: 'rgba(13, 13, 13, 0.4)',
                            backdropFilter: 'blur(20px) saturate(180%)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '16px',
                        }}
                    >
                        <h3 className="text-sm font-light text-white/70">Select Metric</h3>
                        <Select value={selectedChart} onValueChange={(value) => setSelectedChart(value as ChartType)}>
                            <SelectTrigger className="w-[180px] glass-button border-white/[0.08]">
                                <SelectValue placeholder="Select metric" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="revenue">Revenue Trend</SelectItem>
                                <SelectItem value="profit">Profit Trend</SelectItem>
                                <SelectItem value="customers">Customer Growth</SelectItem>
                                <SelectItem value="expenses">Expense Tracking</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Main Chart */}
                    <div
                        className="p-6"
                        style={{
                            background: 'rgba(13, 13, 13, 0.4)',
                            backdropFilter: 'blur(20px) saturate(180%)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '16px',
                        }}
                    >
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={getChartData()}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                                    <XAxis
                                        dataKey="month"
                                        stroke="rgba(255, 255, 255, 0.3)"
                                        style={{ fontSize: '12px', fontWeight: '300' }}
                                    />
                                    <YAxis
                                        stroke="rgba(255, 255, 255, 0.3)"
                                        style={{ fontSize: '12px', fontWeight: '300' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(13, 13, 13, 0.95)',
                                            backdropFilter: 'blur(20px)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            fontSize: '13px',
                                            fontWeight: '300',
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="hsl(182, 79%, 26%)"
                                        strokeWidth={2}
                                        dot={{ fill: 'hsl(178, 100%, 54%)', r: 4 }}
                                        activeDot={{ r: 6, fill: 'hsl(178, 100%, 54%)' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Secondary Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Revenue vs Expenses */}
                        <div
                            className="p-6"
                            style={{
                                background: 'rgba(13, 13, 13, 0.4)',
                                backdropFilter: 'blur(20px) saturate(180%)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '16px',
                            }}
                        >
                            <h4 className="text-sm font-light text-white/70 mb-4">Revenue vs Expenses</h4>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={monthlyData.slice(-4)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                                    <XAxis
                                        dataKey="month"
                                        stroke="rgba(255, 255, 255, 0.3)"
                                        style={{ fontSize: '12px', fontWeight: '300' }}
                                    />
                                    <YAxis
                                        stroke="rgba(255, 255, 255, 0.3)"
                                        style={{ fontSize: '12px', fontWeight: '300' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(13, 13, 13, 0.95)',
                                            backdropFilter: 'blur(20px)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            fontWeight: '300',
                                        }}
                                    />
                                    <Bar dataKey="revenue" fill="hsl(182, 79%, 26%)" name="Revenue" />
                                    <Bar dataKey="expenses" fill="rgba(255, 255, 255, 0.2)" name="Expenses" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Expense Breakdown */}
                        <div
                            className="p-6"
                            style={{
                                background: 'rgba(13, 13, 13, 0.4)',
                                backdropFilter: 'blur(20px) saturate(180%)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '16px',
                            }}
                        >
                            <h4 className="text-sm font-light text-white/70 mb-4">Expense Breakdown</h4>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={expenseBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        style={{ fontSize: '12px', fontWeight: '300' }}
                                    >
                                        {expenseBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(13, 13, 13, 0.95)',
                                            backdropFilter: 'blur(20px)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            fontWeight: '300',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Product Performance - Top 3 Only */}
                    <div
                        className="p-6"
                        style={{
                            background: 'rgba(13, 13, 13, 0.4)',
                            backdropFilter: 'blur(20px) saturate(180%)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '16px',
                        }}
                    >
                        <h3 className="text-sm font-light text-white/70 mb-5">Top Products</h3>
                        <div className="space-y-3">
                            {productPerformance.slice(0, 3).map((product, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-4 rounded-lg transition-all duration-300 hover:bg-white/[0.02]"
                                    style={{
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                    }}
                                >
                                    <div className="flex-1">
                                        <p className="text-sm font-light text-white/80">{product.product}</p>
                                        <p className="text-xs text-white/40 mt-1">{product.sales} units</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-light text-accent">${product.revenue.toLocaleString()}</p>
                                        <p className="text-xs text-white/40 mt-1">{product.margin}% margin</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            className="w-full mt-4 py-2 text-xs font-light text-white/50 hover:text-accent transition-colors"
                        >
                            View All Products →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsTab;
