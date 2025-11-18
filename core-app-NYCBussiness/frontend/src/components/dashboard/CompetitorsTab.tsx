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
            {/* Minimalist Competitor List */}
            <div className="space-y-3">
                {mockCompetitors.map((competitor) => {
                    const isExpanded = expandedId === competitor.id;
                    const trend = competitor.monthlyHistory[2].revenue > competitor.monthlyHistory[1].revenue;

                    return (
                        <div
                            key={competitor.id}
                            className="overflow-hidden transition-all duration-300"
                            style={{
                                background: isExpanded
                                    ? 'rgba(13, 115, 119, 0.08)'
                                    : 'rgba(13, 13, 13, 0.4)',
                                backdropFilter: 'blur(20px) saturate(180%)',
                                border: isExpanded
                                    ? '1px solid rgba(13, 115, 119, 0.3)'
                                    : '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '16px',
                            }}
                        >
                            {/* Compact Header - Only Name + Revenue */}
                            <div
                                className="p-5 cursor-pointer transition-all duration-300 flex items-center justify-between"
                                onClick={() => toggleExpand(competitor.id)}
                                onMouseEnter={(e) => {
                                    if (!isExpanded) {
                                        e.currentTarget.parentElement!.style.borderColor = 'rgba(13, 115, 119, 0.2)';
                                        e.currentTarget.parentElement!.style.boxShadow = '0 0 20px rgba(13, 115, 119, 0.1)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isExpanded) {
                                        e.currentTarget.parentElement!.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                        e.currentTarget.parentElement!.style.boxShadow = 'none';
                                    }
                                }}
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    {/* Initial Circle */}
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(13, 115, 119, 0.2) 0%, rgba(20, 255, 236, 0.1) 100%)',
                                        }}
                                    >
                                        <span className="text-lg font-light text-primary">
                                            {competitor.name.charAt(0)}
                                        </span>
                                    </div>

                                    {/* Name & Location */}
                                    <div className="flex-1">
                                        <h3 className="text-base font-light text-white/90">{competitor.name}</h3>
                                        <p className="text-xs text-white/40 font-light mt-0.5">{competitor.location}</p>
                                    </div>

                                    {/* Revenue (Primary Metric) */}
                                    <div className="text-right mr-4">
                                        <p className="text-lg font-light text-accent">${(competitor.monthlyRevenue / 1000).toFixed(0)}K</p>
                                        <p className="text-xs text-white/30 font-light">revenue</p>
                                    </div>

                                    {/* Expand Icon */}
                                    <button className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors">
                                        {isExpanded ? (
                                            <ChevronUp className="h-4 w-4 text-white/40" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-white/40" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Details - Progressive Disclosure */}
                            {isExpanded && (
                                <div
                                    className="border-t p-6 space-y-6 animate-in fade-in duration-500"
                                    style={{
                                        borderColor: 'rgba(255, 255, 255, 0.06)',
                                        background: 'rgba(0, 0, 0, 0.2)',
                                    }}
                                >
                                    {/* Key Metrics Grid */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-xs text-white/40 mb-1 font-light">Profit</p>
                                            <p className="text-lg font-light text-accent">${(competitor.monthlyProfit / 1000).toFixed(0)}K</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/40 mb-1 font-light">Margin</p>
                                            <p className="text-lg font-light text-white/80">{competitor.profitMargin}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/40 mb-1 font-light">Customers</p>
                                            <p className="text-lg font-light text-white/80">{competitor.monthlyCustomers.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Products Section - Minimalist */}
                                    <div>
                                        <h4 className="text-xs font-light text-white/50 uppercase tracking-wider mb-3">Top Products</h4>
                                        <div className="space-y-2">
                                            {competitor.products.map((product, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between p-3 rounded-lg transition-all duration-300"
                                                    style={{
                                                        background: 'rgba(255, 255, 255, 0.02)',
                                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                                    }}
                                                >
                                                    <div>
                                                        <p className="text-sm font-light text-white/80">{product.name}</p>
                                                        <p className="text-xs text-white/40 font-light mt-0.5">{product.unitsSold} units</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-light text-accent">${product.price}</p>
                                                        <p className="text-xs text-white/30 font-light">${(product.price * product.unitsSold).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 3-Month History - Minimalist */}
                                    <div>
                                        <h4 className="text-xs font-light text-white/50 uppercase tracking-wider mb-3">Performance History</h4>
                                        <div className="grid grid-cols-3 gap-3">
                                            {competitor.monthlyHistory.map((data) => (
                                                <div
                                                    key={data.month}
                                                    className="p-3 rounded-lg"
                                                    style={{
                                                        background: 'rgba(255, 255, 255, 0.02)',
                                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                                    }}
                                                >
                                                    <p className="text-xs text-white/40 font-light mb-2">M{data.month}</p>
                                                    <div className="space-y-1.5 text-xs">
                                                        <div className="flex justify-between">
                                                            <span className="text-white/40 font-light">Revenue</span>
                                                            <span className="font-light text-white/70">${(data.revenue / 1000).toFixed(0)}K</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-white/40 font-light">Profit</span>
                                                            <span className="font-light text-accent">${(data.profit / 1000).toFixed(0)}K</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* SWOT - Minimalist */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-xs font-light text-white/50 uppercase tracking-wider mb-2">Strengths</h4>
                                            <ul className="space-y-1.5">
                                                {competitor.strengths.map((strength, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="text-xs p-2 rounded-lg font-light"
                                                        style={{
                                                            background: 'rgba(13, 115, 119, 0.1)',
                                                            color: 'rgba(20, 255, 236, 0.8)',
                                                        }}
                                                    >
                                                        • {strength}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-light text-white/50 uppercase tracking-wider mb-2">Weaknesses</h4>
                                            <ul className="space-y-1.5">
                                                {competitor.weaknesses.map((weakness, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="text-xs p-2 rounded-lg font-light"
                                                        style={{
                                                            background: 'rgba(255, 255, 255, 0.05)',
                                                            color: 'rgba(255, 255, 255, 0.5)',
                                                        }}
                                                    >
                                                        • {weakness}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CompetitorsTab;
