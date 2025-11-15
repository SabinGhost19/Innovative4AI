import { useState } from "react";
import { Card } from "@/components/ui/card";
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
    AlertCircle,
    FileText,
    Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
    const [reportPeriod, setReportPeriod] = useState<ReportType>("monthly");
    const [selectedChart, setSelectedChart] = useState<ChartType>("revenue");
    const [showCharts, setShowCharts] = useState(true);

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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold">Business Reports</h2>
                    <p className="text-muted-foreground">
                        Comprehensive financial analysis and performance metrics
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={reportPeriod} onValueChange={(value) => setReportPeriod(value as ReportType)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="monthly">Monthly Report</SelectItem>
                            <SelectItem value="quarterly">Quarterly Report</SelectItem>
                            <SelectItem value="yearly">Yearly Report</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Key Metrics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                            <p className="text-2xl font-bold">${currentMonth.revenue.toLocaleString()}</p>
                            <div className={`flex items-center gap-1 text-sm ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {revenueChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                <span>{Math.abs(revenueChange).toFixed(1)}% vs last month</span>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-500/10">
                            <DollarSign className="h-6 w-6 text-blue-500" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Net Profit</p>
                            <p className="text-2xl font-bold text-green-600">${currentMonth.profit.toLocaleString()}</p>
                            <div className={`flex items-center gap-1 text-sm ${profitChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {profitChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                <span>{Math.abs(profitChange).toFixed(1)}% vs last month</span>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-green-500/10">
                            <TrendingUp className="h-6 w-6 text-green-500" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Total Customers</p>
                            <p className="text-2xl font-bold">{currentMonth.customers.toLocaleString()}</p>
                            <div className={`flex items-center gap-1 text-sm ${customerChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {customerChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                <span>{Math.abs(customerChange).toFixed(1)}% vs last month</span>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-purple-500/10">
                            <Users className="h-6 w-6 text-purple-500" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Total Expenses</p>
                            <p className="text-2xl font-bold text-red-600">${currentMonth.expenses.toLocaleString()}</p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <AlertCircle className="h-4 w-4" />
                                <span>{((currentMonth.expenses / currentMonth.revenue) * 100).toFixed(1)}% of revenue</span>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-red-500/10">
                            <ShoppingCart className="h-6 w-6 text-red-500" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Chart Controls */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Performance Analytics</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant={showCharts ? "default" : "outline"}
                            onClick={() => setShowCharts(!showCharts)}
                            size="sm"
                        >
                            {showCharts ? "Hide Charts" : "Show Charts"}
                        </Button>
                        {showCharts && (
                            <Select value={selectedChart} onValueChange={(value) => setSelectedChart(value as ChartType)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select metric" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="revenue">Revenue Trend</SelectItem>
                                    <SelectItem value="profit">Profit Trend</SelectItem>
                                    <SelectItem value="customers">Customer Growth</SelectItem>
                                    <SelectItem value="expenses">Expense Tracking</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>

                {showCharts && (
                    <div className="space-y-8">
                        {/* Main Chart */}
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={getChartData()}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="month" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1f2937',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ fill: '#3b82f6', r: 5 }}
                                        activeDot={{ r: 7 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Secondary Charts Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Revenue vs Expenses Bar Chart */}
                            <div>
                                <h4 className="text-sm font-semibold mb-4">Revenue vs Expenses</h4>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={monthlyData.slice(-4)}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="month" stroke="#9ca3af" />
                                        <YAxis stroke="#9ca3af" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1f2937',
                                                border: '1px solid #374151',
                                                borderRadius: '8px',
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                                        <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Expense Breakdown Pie Chart */}
                            <div>
                                <h4 className="text-sm font-semibold mb-4">Expense Breakdown</h4>
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
                                        >
                                            {expenseBreakdown.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1f2937',
                                                border: '1px solid #374151',
                                                borderRadius: '8px',
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Product Performance Table */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    Product Performance
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-3 px-4 font-semibold">Product</th>
                                <th className="text-right py-3 px-4 font-semibold">Units Sold</th>
                                <th className="text-right py-3 px-4 font-semibold">Revenue</th>
                                <th className="text-right py-3 px-4 font-semibold">Margin</th>
                                <th className="text-right py-3 px-4 font-semibold">Performance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productPerformance.map((product, idx) => (
                                <tr key={idx} className="border-b border-border/50 hover:bg-accent/5 transition-colors">
                                    <td className="py-3 px-4 font-medium">{product.product}</td>
                                    <td className="text-right py-3 px-4">{product.sales}</td>
                                    <td className="text-right py-3 px-4">${product.revenue.toLocaleString()}</td>
                                    <td className="text-right py-3 px-4">{product.margin}%</td>
                                    <td className="text-right py-3 px-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-primary to-accent"
                                                    style={{ width: `${product.margin}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-muted-foreground">{product.margin}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Financial Summary */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Financial Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-accent/5">
                            <span className="text-sm font-medium">Total Revenue (6 months)</span>
                            <span className="font-bold text-blue-600">
                                ${monthlyData.reduce((sum, m) => sum + m.revenue, 0).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-accent/5">
                            <span className="text-sm font-medium">Total Profit (6 months)</span>
                            <span className="font-bold text-green-600">
                                ${monthlyData.reduce((sum, m) => sum + m.profit, 0).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-accent/5">
                            <span className="text-sm font-medium">Average Profit Margin</span>
                            <span className="font-bold">
                                {((monthlyData.reduce((sum, m) => sum + m.profit, 0) /
                                    monthlyData.reduce((sum, m) => sum + m.revenue, 0)) * 100).toFixed(1)}%
                            </span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-accent/5">
                            <span className="text-sm font-medium">Total Expenses (6 months)</span>
                            <span className="font-bold text-red-600">
                                ${monthlyData.reduce((sum, m) => sum + m.expenses, 0).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-accent/5">
                            <span className="text-sm font-medium">Avg. Monthly Revenue</span>
                            <span className="font-bold">
                                ${(monthlyData.reduce((sum, m) => sum + m.revenue, 0) / monthlyData.length).toFixed(0)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-accent/5">
                            <span className="text-sm font-medium">Customer Growth Rate</span>
                            <span className="font-bold text-green-600">+{customerChange.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ReportsTab;
