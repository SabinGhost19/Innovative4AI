import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, TrendingUp, Briefcase } from "lucide-react";

interface SimulationResultsProps {
    outputs: any;
    month: number;
    year: number;
    executionTime: number;
}

export default function SimulationResults({ outputs, month, year, executionTime }: SimulationResultsProps) {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    if (!outputs) return null;

    const {
        marketContext,
        eventsData,
        trendsData,
        supplierData,
        competitionData,
        employeeData,
        customerData,
        financialData,
    } = outputs;

    const cards = [
        {
            id: 'financial',
            title: 'Financial',
            icon: DollarSign,
            color: 'primary',
            summary: {
                revenue: financialData?.profit_loss?.revenue || 0,
                profit: financialData?.profit_loss?.net_profit || 0,
                margin: financialData?.profit_loss?.profit_margin || 0,
                cashBalance: financialData?.cash_flow?.closing_balance || 0
            },
            details: financialData
        },
        {
            id: 'customers',
            title: 'Customers',
            icon: Users,
            color: 'accent',
            summary: {
                total: customerData?.total_active_customers || 0,
                newCustomers: customerData?.new_customers_acquired || 0,
                retention: customerData?.loyalty_rate || 0
            },
            details: customerData
        },
        {
            id: 'market',
            title: 'Market',
            icon: TrendingUp,
            color: 'primary',
            summary: {
                saturation: marketContext?.industry_saturation || 0,
                riskLevel: marketContext?.market_risk_level || 'unknown',
                competitors: competitionData?.total_competitors || 0
            },
            details: { marketContext, trendsData, competitionData, eventsData }
        },
        {
            id: 'operations',
            title: 'Operations',
            icon: Briefcase,
            color: 'accent',
            summary: {
                employees: employeeData?.total_employees || 0,
                productivity: employeeData?.productivity_score || 0,
                turnover: employeeData?.turnover?.annual_turnover_rate || 0
            },
            details: { employeeData, supplierData }
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="backdrop-blur-xl bg-black/30 p-6 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="text-3xl">📊</span>
                        Simulation Results - Month {month}/{year}
                    </h2>
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                        ⚡ {executionTime}ms
                    </Badge>
                </div>
                <p className="text-white/60 text-sm">
                    Hover over cards to see detailed analysis
                </p>
            </div>

            {/* Interactive Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card) => {
                    const Icon = card.icon;
                    const isHovered = hoveredCard === card.id;

                    return (
                        <div
                            key={card.id}
                            className="relative"
                            onMouseEnter={() => setHoveredCard(card.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            {/* Main Card */}
                            <div className={`backdrop-blur-xl bg-black/30 rounded-xl border p-6 cursor-pointer transition-all duration-300 ${
                                isHovered 
                                    ? card.color === 'primary' 
                                        ? 'border-primary/50 shadow-lg shadow-primary/25 scale-105' 
                                        : 'border-accent/50 shadow-lg shadow-accent/25 scale-105'
                                    : 'border-white/10 hover:border-white/20'
                            }`}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                                    card.color === 'primary' 
                                        ? 'bg-primary/10 border border-primary/20' 
                                        : 'bg-accent/10 border border-accent/20'
                                }`}>
                                    <Icon className={`h-6 w-6 ${card.color === 'primary' ? 'text-primary' : 'text-accent'}`} />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-3">{card.title}</h3>
                                
                                {/* Summary based on card type */}
                                {card.id === 'financial' && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/60">Revenue</span>
                                            <span className="text-green-400 font-semibold">${card.summary.revenue.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/60">Net Profit</span>
                                            <span className={`font-semibold ${card.summary.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                ${card.summary.profit.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/60">Margin</span>
                                            <span className="text-white font-semibold">{card.summary.margin.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                )}

                                {card.id === 'customers' && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/60">Total</span>
                                            <span className="text-primary font-semibold">{card.summary.total}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/60">New</span>
                                            <span className="text-green-400 font-semibold">+{card.summary.newCustomers}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/60">Retention</span>
                                            <span className="text-white font-semibold">{(card.summary.retention * 100).toFixed(1)}%</span>
                                        </div>
                                    </div>
                                )}

                                {card.id === 'market' && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/60">Saturation</span>
                                            <span className="text-primary font-semibold">{card.summary.saturation}%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/60">Risk Level</span>
                                            <span className={`font-semibold ${
                                                card.summary.riskLevel === 'high' ? 'text-red-400' : 
                                                card.summary.riskLevel === 'medium' ? 'text-yellow-400' : 
                                                'text-green-400'
                                            }`}>
                                                {card.summary.riskLevel}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/60">Competitors</span>
                                            <span className="text-accent font-semibold">{card.summary.competitors}</span>
                                        </div>
                                    </div>
                                )}

                                {card.id === 'operations' && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/60">Employees</span>
                                            <span className="text-primary font-semibold">{card.summary.employees}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/60">Productivity</span>
                                            <span className="text-white font-semibold">{(card.summary.productivity * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/60">Turnover</span>
                                            <span className={`font-semibold ${card.summary.turnover < 0.1 ? 'text-green-400' : 'text-yellow-400'}`}>
                                                {(card.summary.turnover * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 text-xs text-white/40 text-center">
                                    Hover for details
                                </div>
                            </div>

                            {/* Expanded Details Popup */}
                            {isHovered && (
                                <div className="absolute top-0 left-0 w-full z-50 backdrop-blur-xl bg-black/95 rounded-xl border border-primary/30 p-6 shadow-2xl shadow-primary/20 max-h-[600px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10 sticky top-0 bg-black/95 z-10">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                            card.color === 'primary' 
                                                ? 'bg-primary/10 border border-primary/20' 
                                                : 'bg-accent/10 border border-accent/20'
                                        }`}>
                                            <Icon className={`h-5 w-5 ${card.color === 'primary' ? 'text-primary' : 'text-accent'}`} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">{card.title} Details</h3>
                                    </div>

                                    {/* Financial Details */}
                                    {card.id === 'financial' && card.details && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                                    <div className="text-xs text-white/50 mb-1">Revenue</div>
                                                    <div className="text-xl font-bold text-green-400">
                                                        ${card.details.profit_loss?.revenue?.toLocaleString() || '0'}
                                                    </div>
                                                </div>
                                                <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                                                    <div className="text-xs text-white/50 mb-1">Cash Balance</div>
                                                    <div className="text-xl font-bold text-primary">
                                                        ${card.summary.cashBalance.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h4 className="text-sm font-semibold text-white mb-2">Cost Breakdown</h4>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between p-2 rounded bg-black/40">
                                                        <span className="text-sm text-white/70">Labor</span>
                                                        <span className="text-sm font-semibold text-white">
                                                            ${card.details.cost_breakdown?.labor?.toLocaleString() || '0'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between p-2 rounded bg-black/40">
                                                        <span className="text-sm text-white/70">Inventory/COGS</span>
                                                        <span className="text-sm font-semibold text-white">
                                                            ${card.details.cost_breakdown?.inventory?.toLocaleString() || '0'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between p-2 rounded bg-black/40">
                                                        <span className="text-sm text-white/70">Rent</span>
                                                        <span className="text-sm font-semibold text-white">
                                                            ${card.details.cost_breakdown?.rent?.toLocaleString() || '0'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between p-2 rounded bg-black/40">
                                                        <span className="text-sm text-white/70">Marketing</span>
                                                        <span className="text-sm font-semibold text-white">
                                                            ${card.details.cost_breakdown?.marketing?.toLocaleString() || '0'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between p-2 rounded bg-black/40">
                                                        <span className="text-sm text-white/70">Utilities</span>
                                                        <span className="text-sm font-semibold text-white">
                                                            ${card.details.cost_breakdown?.utilities?.toLocaleString() || '0'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {card.details.alerts && card.details.alerts.length > 0 && (
                                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                                    <div className="text-sm font-semibold text-red-400 mb-2">⚠️ Alerts</div>
                                                    <ul className="list-disc pl-4 space-y-1">
                                                        {card.details.alerts.map((alert: string, i: number) => (
                                                            <li key={i} className="text-xs text-white/80">{alert}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Customer Details */}
                                    {card.id === 'customers' && card.details && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-center">
                                                    <div className="text-lg font-bold text-blue-400">{card.summary.total}</div>
                                                    <div className="text-xs text-white/50">Total</div>
                                                </div>
                                                <div className="p-2 rounded bg-green-500/10 border border-green-500/20 text-center">
                                                    <div className="text-lg font-bold text-green-400">+{card.summary.newCustomers}</div>
                                                    <div className="text-xs text-white/50">New</div>
                                                </div>
                                                <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-center">
                                                    <div className="text-lg font-bold text-red-400">
                                                        -{card.details.churned_customers || 0}
                                                    </div>
                                                    <div className="text-xs text-white/50">Churned</div>
                                                </div>
                                            </div>

                                            {card.details.customer_segments && (
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-semibold text-white">Customer Segments</h4>
                                                    {card.details.customer_segments.map((segment: any, i: number) => (
                                                        <div key={i} className="p-3 rounded-lg bg-black/40 border border-white/10">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="font-medium text-white text-sm">{segment.segment_name}</div>
                                                                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                                                                    {segment.loyalty_score}% loyal
                                                                </Badge>
                                                            </div>
                                                            <div className="text-xs text-white/60">
                                                                {segment.customer_count} customers • Avg spend: ${segment.avg_spend_per_visit}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {card.details.behavioral_insights && card.details.behavioral_insights.length > 0 && (
                                                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                                                    <div className="text-sm font-semibold text-primary mb-2">💡 Insights</div>
                                                    <ul className="list-disc pl-4 space-y-1">
                                                        {card.details.behavioral_insights.map((insight: string, i: number) => (
                                                            <li key={i} className="text-xs text-white/80">{insight}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Market Details */}
                                    {card.id === 'market' && card.details && (
                                        <div className="space-y-4">
                                            {card.details.eventsData && (
                                                <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                                                    <div className="text-sm font-semibold text-accent mb-2">🎲 Monthly Event</div>
                                                    <div className="font-medium text-white text-sm mb-1">
                                                        {card.details.eventsData.nume_eveniment}
                                                    </div>
                                                    <div className="text-xs text-white/70 mb-2">
                                                        {card.details.eventsData.descriere_scurta}
                                                    </div>
                                                    <Badge className={card.details.eventsData.impact_clienti_lunar > 0 
                                                        ? "bg-green-500/20 text-green-400 border-green-500/30" 
                                                        : "bg-red-500/20 text-red-400 border-red-500/30"}>
                                                        Impact: {card.details.eventsData.impact_clienti_lunar > 0 ? '+' : ''}
                                                        {card.details.eventsData.impact_clienti_lunar}%
                                                    </Badge>
                                                </div>
                                            )}

                                            {card.details.trendsData && (
                                                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                                                    <div className="text-sm font-semibold text-primary mb-2">📈 Main Trend</div>
                                                    <div className="font-medium text-white text-sm mb-1">
                                                        {card.details.trendsData.main_trend.trend_name}
                                                    </div>
                                                    <div className="text-xs text-white/70 mb-2">
                                                        {card.details.trendsData.main_trend.description}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Badge className="bg-white/10 text-white border-white/20 text-xs">
                                                            {card.details.trendsData.market_momentum}
                                                        </Badge>
                                                        <Badge className="bg-white/10 text-white border-white/20 text-xs">
                                                            Impact: {card.details.trendsData.main_trend.impact_score}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            )}

                                            {card.details.competitionData && (
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-semibold text-white">⚔️ Competition</h4>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div className="p-2 rounded bg-black/40 border border-white/10 text-center">
                                                            <div className="text-lg font-bold text-white">
                                                                {card.details.competitionData.total_competitors || 0}
                                                            </div>
                                                            <div className="text-xs text-white/50">Total</div>
                                                        </div>
                                                        <div className="p-2 rounded bg-green-500/10 border border-green-500/20 text-center">
                                                            <div className="text-lg font-bold text-green-400">
                                                                +{card.details.competitionData.new_entrants || 0}
                                                            </div>
                                                            <div className="text-xs text-white/50">New</div>
                                                        </div>
                                                        <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-center">
                                                            <div className="text-lg font-bold text-red-400">
                                                                -{card.details.competitionData.businesses_closed || 0}
                                                            </div>
                                                            <div className="text-xs text-white/50">Closed</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Operations Details */}
                                    {card.id === 'operations' && card.details && (
                                        <div className="space-y-4">
                                            {card.details.employeeData && (
                                                <>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                                                            <div className="text-xs text-white/50 mb-1">Employees</div>
                                                            <div className="text-xl font-bold text-primary">
                                                                {card.summary.employees}
                                                            </div>
                                                        </div>
                                                        <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                                                            <div className="text-xs text-white/50 mb-1">Total Salaries</div>
                                                            <div className="text-xl font-bold text-white">
                                                                ${card.details.employeeData.total_salaries?.toLocaleString() || '0'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                                                        <div className="text-sm font-semibold text-accent mb-2">📊 Team Status</div>
                                                        <div className="text-xs text-white/70 mb-1">
                                                            Morale: {card.details.employeeData.morale}%
                                                        </div>
                                                        <div className="text-xs text-white/70">
                                                            {card.details.employeeData.overworked ? '⚠️ Staff is overworked' : '✓ Workload manageable'}
                                                        </div>
                                                    </div>

                                                    {card.details.employeeData.turnover && (
                                                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                                                            <div className="text-sm font-semibold text-primary mb-2">💡 Turnover Info</div>
                                                            <div className="text-xs text-white/70 mb-1">
                                                                Annual rate: {(card.details.employeeData.turnover.annual_turnover_rate * 100).toFixed(1)}%
                                                            </div>
                                                            <div className="text-xs text-white/70">
                                                                Expected departures: {card.details.employeeData.turnover.expected_departures_this_month}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
