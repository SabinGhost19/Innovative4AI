import { useState } from "react";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Users, DollarSign, Package, MapPin, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Product = {
    name: string;
    price: number;
    unitsSold: number;
};

type MonthlyData = {
    month: number;
    revenue: number;
    profit: number;
    customers: number;
};

type Competitor = {
    id: number;
    name: string;
    type: string;
    location: string;
    rating: number;
    monthlyRevenue: number;
    monthlyProfit: number;
    profitMargin: number;
    monthlyCustomers: number;
    products: Product[];
    monthlyHistory: MonthlyData[];
    marketShare: number;
    strengths: string[];
    weaknesses: string[];
};

const mockCompetitors: Competitor[] = [
    {
        id: 1,
        name: "Urban Brew Coffee",
        type: "Coffee Shop",
        location: "SoHo, Manhattan",
        rating: 4.5,
        monthlyRevenue: 85000,
        monthlyProfit: 22000,
        profitMargin: 25.9,
        monthlyCustomers: 2840,
        marketShare: 18.5,
        products: [
            { name: "Espresso", price: 4.5, unitsSold: 1200 },
            { name: "Latte", price: 5.5, unitsSold: 980 },
            { name: "Cold Brew", price: 6.0, unitsSold: 660 },
        ],
        monthlyHistory: [
            { month: 1, revenue: 78000, profit: 19500, customers: 2600 },
            { month: 2, revenue: 82000, profit: 21000, customers: 2750 },
            { month: 3, revenue: 85000, profit: 22000, customers: 2840 },
        ],
        strengths: ["Prime location", "Strong brand loyalty", "High-quality products"],
        weaknesses: ["Higher prices", "Limited seating", "Crowded during peak hours"],
    },
    {
        id: 2,
        name: "Tech Haven Electronics",
        type: "Electronics Store",
        location: "Williamsburg, Brooklyn",
        rating: 4.2,
        monthlyRevenue: 125000,
        monthlyProfit: 31000,
        profitMargin: 24.8,
        monthlyCustomers: 1560,
        marketShare: 15.2,
        products: [
            { name: "Laptops", price: 1200, unitsSold: 45 },
            { name: "Smartphones", price: 850, unitsSold: 68 },
            { name: "Accessories", price: 45, unitsSold: 520 },
        ],
        monthlyHistory: [
            { month: 1, revenue: 115000, profit: 28000, customers: 1420 },
            { month: 2, revenue: 120000, profit: 29500, customers: 1490 },
            { month: 3, revenue: 125000, profit: 31000, customers: 1560 },
        ],
        strengths: ["Wide product range", "Expert staff", "Competitive pricing"],
        weaknesses: ["Limited parking", "Stock issues", "Slow delivery"],
    },
    {
        id: 3,
        name: "Fitness First Gym",
        type: "Fitness Center",
        location: "Upper East Side, Manhattan",
        rating: 4.7,
        monthlyRevenue: 95000,
        monthlyProfit: 38000,
        profitMargin: 40.0,
        monthlyCustomers: 850,
        marketShare: 22.3,
        products: [
            { name: "Monthly Membership", price: 89, unitsSold: 650 },
            { name: "Personal Training", price: 120, unitsSold: 95 },
            { name: "Group Classes", price: 25, unitsSold: 380 },
        ],
        monthlyHistory: [
            { month: 1, revenue: 88000, profit: 35000, customers: 780 },
            { month: 2, revenue: 92000, profit: 36500, customers: 820 },
            { month: 3, revenue: 95000, profit: 38000, customers: 850 },
        ],
        strengths: ["Modern equipment", "Experienced trainers", "Diverse class schedule"],
        weaknesses: ["Premium pricing", "Limited hours on weekends", "Crowded mornings"],
    },
    {
        id: 4,
        name: "Bella's Boutique",
        type: "Fashion Retail",
        location: "Greenwich Village, Manhattan",
        rating: 4.3,
        monthlyRevenue: 68000,
        monthlyProfit: 17000,
        profitMargin: 25.0,
        monthlyCustomers: 1240,
        marketShare: 12.8,
        products: [
            { name: "Dresses", price: 125, unitsSold: 180 },
            { name: "Accessories", price: 45, unitsSold: 420 },
            { name: "Shoes", price: 95, unitsSold: 210 },
        ],
        monthlyHistory: [
            { month: 1, revenue: 62000, profit: 15500, customers: 1100 },
            { month: 2, revenue: 65000, profit: 16200, customers: 1170 },
            { month: 3, revenue: 68000, profit: 17000, customers: 1240 },
        ],
        strengths: ["Unique designs", "Instagram presence", "Loyal customer base"],
        weaknesses: ["Higher price point", "Limited size range", "Seasonal inventory"],
    },
];

const CompetitorsTab = () => {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="p-8 space-y-6">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold">Market Competitors</h2>
                <p className="text-muted-foreground">
                    Track and analyze your competition to stay ahead in the market
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {mockCompetitors.map((competitor) => {
                    const isExpanded = expandedId === competitor.id;
                    const trend = competitor.monthlyHistory[2].revenue > competitor.monthlyHistory[1].revenue;

                    return (
                        <Card
                            key={competitor.id}
                            className="overflow-hidden hover:shadow-xl transition-all duration-300"
                        >
                            {/* Header - Always Visible */}
                            <div
                                className="p-6 cursor-pointer hover:bg-accent/5 transition-colors"
                                onClick={() => toggleExpand(competitor.id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                                <span className="text-2xl font-bold text-primary">
                                                    {competitor.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-xl font-bold">{competitor.name}</h3>
                                                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                                        {competitor.type}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" />
                                                        {competitor.location}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                        {competitor.rating} / 5.0
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-4 w-4" />
                                                        {competitor.marketShare}% market share
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Key Metrics Grid */}
                                        <div className="grid grid-cols-4 gap-4 pt-4">
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-lg font-bold text-primary">
                                                        ${(competitor.monthlyRevenue / 1000).toFixed(0)}K
                                                    </p>
                                                    {trend ? (
                                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <TrendingDown className="h-4 w-4 text-red-500" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">Monthly Profit</p>
                                                <p className="text-lg font-bold text-green-600">
                                                    ${(competitor.monthlyProfit / 1000).toFixed(0)}K
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">Profit Margin</p>
                                                <p className="text-lg font-bold">{competitor.profitMargin}%</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">Monthly Customers</p>
                                                <p className="text-lg font-bold">{competitor.monthlyCustomers.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="ml-4 p-2 hover:bg-accent/10 rounded-lg transition-colors">
                                        {isExpanded ? (
                                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="border-t border-border bg-accent/5">
                                    <div className="p-6 space-y-6">
                                        {/* Products Section */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <Package className="h-5 w-5 text-primary" />
                                                <h4 className="text-lg font-semibold">Top Products</h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {competitor.products.map((product, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-4 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors"
                                                    >
                                                        <p className="font-semibold mb-2">{product.name}</p>
                                                        <div className="space-y-1 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Price:</span>
                                                                <span className="font-medium">${product.price}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Units Sold:</span>
                                                                <span className="font-medium">{product.unitsSold}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Revenue:</span>
                                                                <span className="font-medium text-primary">
                                                                    ${(product.price * product.unitsSold).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Monthly Performance History */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <TrendingUp className="h-5 w-5 text-primary" />
                                                <h4 className="text-lg font-semibold">3-Month Performance</h4>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                {competitor.monthlyHistory.map((data) => (
                                                    <div
                                                        key={data.month}
                                                        className="p-4 rounded-xl bg-background border border-border"
                                                    >
                                                        <p className="text-sm font-semibold text-muted-foreground mb-3">
                                                            Month {data.month}
                                                        </p>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Revenue:</span>
                                                                <span className="font-medium">${(data.revenue / 1000).toFixed(0)}K</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Profit:</span>
                                                                <span className="font-medium text-green-600">
                                                                    ${(data.profit / 1000).toFixed(0)}K
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Customers:</span>
                                                                <span className="font-medium">{data.customers.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* SWOT Analysis */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="text-sm font-semibold text-green-600 mb-3 flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4" />
                                                    Strengths
                                                </h4>
                                                <ul className="space-y-2">
                                                    {competitor.strengths.map((strength, idx) => (
                                                        <li
                                                            key={idx}
                                                            className="text-sm p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                                                        >
                                                            • {strength}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                                                    <TrendingDown className="h-4 w-4" />
                                                    Weaknesses
                                                </h4>
                                                <ul className="space-y-2">
                                                    {competitor.weaknesses.map((weakness, idx) => (
                                                        <li
                                                            key={idx}
                                                            className="text-sm p-2 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
                                                        >
                                                            • {weakness}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default CompetitorsTab;
