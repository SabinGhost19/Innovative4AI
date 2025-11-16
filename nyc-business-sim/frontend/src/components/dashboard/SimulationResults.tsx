import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, TrendingUp, Briefcase, X } from "lucide-react";

interface SimulationResultsProps {
    outputs: any;
    month: number;
    year: number;
    executionTime: number;
}

export default function SimulationResults({ outputs, month, year, executionTime }: SimulationResultsProps) {
    const [selectedCard, setSelectedCard] = useState<string | null>(null);

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
            color: 'primary' as const,
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
            color: 'accent' as const,
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
            color: 'primary' as const,
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
            color: 'accent' as const,
            summary: {
                employees: employeeData?.total_employees || 0,
                productivity: employeeData?.productivity_score || 0,
                turnover: employeeData?.turnover?.annual_turnover_rate || 0
            },
            details: { employeeData, supplierData }
        }
    ];

    const selectedCardData = cards.find(c => c.id === selectedCard);

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
                <p className="text-white/60 text-base">
                    Click on cards to see detailed analysis
                </p>
            </div>

            {/* Interactive Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.id}
                            onClick={() => setSelectedCard(card.id)}
                            className="backdrop-blur-xl bg-black/30 rounded-xl border border-white/10 p-6 cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/25 hover:scale-105"
                        >
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
                                    <div className="flex justify-between text-base">
                                        <span className="text-white/60">Revenue</span>
                                        <span className="text-green-400 font-semibold">${card.summary.revenue.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-base">
                                        <span className="text-white/60">Net Profit</span>
                                        <span className={`font-semibold ${card.summary.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            ${card.summary.profit.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-base">
                                        <span className="text-white/60">Margin</span>
                                        <span className="text-white font-semibold">{card.summary.margin.toFixed(1)}%</span>
                                    </div>
                                </div>
                            )}

                            {card.id === 'customers' && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-base">
                                        <span className="text-white/60">Total</span>
                                        <span className="text-primary font-semibold">{card.summary.total}</span>
                                    </div>
                                    <div className="flex justify-between text-base">
                                        <span className="text-white/60">New</span>
                                        <span className="text-green-400 font-semibold">+{card.summary.newCustomers}</span>
                                    </div>
                                    <div className="flex justify-between text-base">
                                        <span className="text-white/60">Retention</span>
                                        <span className="text-white font-semibold">{(card.summary.retention).toFixed(1)}%</span>
                                    </div>
                                </div>
                            )}

                            {card.id === 'market' && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-base">
                                        <span className="text-white/60">Saturation</span>
                                        <span className="text-primary font-semibold">{card.summary.saturation}%</span>
                                    </div>
                                    <div className="flex justify-between text-base">
                                        <span className="text-white/60">Risk Level</span>
                                        <span className={`font-semibold ${
                                            card.summary.riskLevel === 'high' ? 'text-red-400' : 
                                            card.summary.riskLevel === 'medium' ? 'text-yellow-400' : 
                                            'text-green-400'
                                        }`}>
                                            {card.summary.riskLevel}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-base">
                                        <span className="text-white/60">Competitors</span>
                                        <span className="text-accent font-semibold">{card.summary.competitors}</span>
                                    </div>
                                </div>
                            )}

                            {card.id === 'operations' && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-base">
                                        <span className="text-white/60">Employees</span>
                                        <span className="text-primary font-semibold">{card.summary.employees}</span>
                                    </div>
                                    <div className="flex justify-between text-base">
                                        <span className="text-white/60">Productivity</span>
                                        <span className="text-white font-semibold">{(card.summary.productivity).toFixed(0)}%</span>
                                    </div>
                                    <div className="flex justify-between text-base">
                                        <span className="text-white/60">Turnover</span>
                                        <span className={`font-semibold ${card.summary.turnover < 0.1 ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {(card.summary.turnover * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 text-sm text-white/40 text-center">
                                Click for details
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal Overlay */}
            {selectedCard && selectedCardData && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedCard(null)}
                >
                    {/* Backdrop Blur */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
                    
                    {/* Modal Content */}
                    <div 
                        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-black/95 rounded-2xl border border-primary/30 shadow-2xl shadow-primary/20 animate-in zoom-in-95 duration-200 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8">
                            {/* Header with Close Button */}
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 sticky top-0 bg-black/95 z-10 -mt-8 pt-8 -mx-8 px-8">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                        selectedCardData.color === 'primary' 
                                            ? 'bg-primary/10 border border-primary/20' 
                                            : 'bg-accent/10 border border-accent/20'
                                    }`}>
                                        <selectedCardData.icon className={`h-6 w-6 ${selectedCardData.color === 'primary' ? 'text-primary' : 'text-accent'}`} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">{selectedCardData.title} Details</h2>
                                </div>
                                <button
                                    onClick={() => setSelectedCard(null)}
                                    className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center text-white/60 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Financial Details */}
                            {selectedCardData.id === 'financial' && selectedCardData.details && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                            <div className="text-sm text-white/50 mb-1">Revenue</div>
                                            <div className="text-xl font-bold text-green-400">
                                                ${selectedCardData.details.profit_loss?.revenue?.toLocaleString() || '0'}
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                                            <div className="text-sm text-white/50 mb-1">Cash Balance</div>
                                            <div className="text-xl font-bold text-primary">
                                                ${selectedCardData.summary.cashBalance.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="text-base font-semibold text-white mb-2">Cost Breakdown</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between p-2 rounded bg-black/40">
                                                <span className="text-base text-white/70">Labor</span>
                                                <span className="text-base font-semibold text-white">
                                                    ${selectedCardData.details.cost_breakdown?.labor?.toLocaleString() || '0'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between p-2 rounded bg-black/40">
                                                <span className="text-base text-white/70">Inventory/COGS</span>
                                                <span className="text-base font-semibold text-white">
                                                    ${selectedCardData.details.cost_breakdown?.inventory?.toLocaleString() || '0'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between p-2 rounded bg-black/40">
                                                <span className="text-sm text-white/70">Rent</span>
                                                <span className="text-sm font-semibold text-white">
                                                    ${selectedCardData.details.cost_breakdown?.rent?.toLocaleString() || '0'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between p-2 rounded bg-black/40">
                                                <span className="text-sm text-white/70">Marketing</span>
                                                <span className="text-sm font-semibold text-white">
                                                    ${selectedCardData.details.cost_breakdown?.marketing?.toLocaleString() || '0'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between p-2 rounded bg-black/40">
                                                <span className="text-sm text-white/70">Utilities</span>
                                                <span className="text-sm font-semibold text-white">
                                                    ${selectedCardData.details.cost_breakdown?.utilities?.toLocaleString() || '0'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedCardData.details.alerts && selectedCardData.details.alerts.length > 0 && (
                                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                            <div className="text-sm font-semibold text-red-400 mb-2">⚠️ Alerts</div>
                                            <ul className="list-disc pl-4 space-y-1">
                                                {selectedCardData.details.alerts.map((alert: string, i: number) => (
                                                    <li key={i} className="text-xs text-white/80">{alert}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Customer Details */}
                            {selectedCardData.id === 'customers' && selectedCardData.details && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-center">
                                            <div className="text-lg font-bold text-blue-400">{selectedCardData.summary.total}</div>
                                            <div className="text-xs text-white/50">Total</div>
                                        </div>
                                        <div className="p-2 rounded bg-green-500/10 border border-green-500/20 text-center">
                                            <div className="text-lg font-bold text-green-400">+{selectedCardData.summary.newCustomers}</div>
                                            <div className="text-xs text-white/50">New</div>
                                        </div>
                                        <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-center">
                                            <div className="text-lg font-bold text-red-400">
                                                -{selectedCardData.details.churned_customers || 0}
                                            </div>
                                            <div className="text-xs text-white/50">Churned</div>
                                        </div>
                                    </div>

                                    {selectedCardData.details.customer_segments && (
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-semibold text-white">Customer Segments</h4>
                                            {selectedCardData.details.customer_segments.map((segment: any, i: number) => (
                                                <div key={i} className="p-3 rounded-lg bg-black/40 border border-white/10">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="font-medium text-white text-sm">{segment.segment_name}</div>
                                                        <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                                                            {segment.loyalty}% loyal
                                                        </Badge>
                                                    </div>
                                                    <div className="text-xs text-white/60">
                                                        {segment.size} customers • Avg spend: ${segment.avg_spend}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {selectedCardData.details.behavioral_insights && selectedCardData.details.behavioral_insights.length > 0 && (
                                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                                            <div className="text-sm font-semibold text-primary mb-2">💡 Insights</div>
                                            <ul className="list-disc pl-4 space-y-1">
                                                {selectedCardData.details.behavioral_insights.map((insight: string, i: number) => (
                                                    <li key={i} className="text-xs text-white/80">{insight}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Market Details */}
                            {selectedCardData.id === 'market' && selectedCardData.details && (
                                <div className="space-y-4">
                                    {selectedCardData.details.eventsData && (
                                        <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                                            <div className="text-sm font-semibold text-accent mb-2">🎲 Monthly Event</div>
                                            <div className="font-medium text-white text-sm mb-1">
                                                {selectedCardData.details.eventsData.nume_eveniment}
                                            </div>
                                            <div className="text-xs text-white/70 mb-2">
                                                {selectedCardData.details.eventsData.descriere_scurta}
                                            </div>
                                            <Badge className={selectedCardData.details.eventsData.impact_clienti_lunar > 0 
                                                ? "bg-green-500/20 text-green-400 border-green-500/30" 
                                                : "bg-red-500/20 text-red-400 border-red-500/30"}>
                                                Impact: {selectedCardData.details.eventsData.impact_clienti_lunar > 0 ? '+' : ''}
                                                {selectedCardData.details.eventsData.impact_clienti_lunar}%
                                            </Badge>
                                        </div>
                                    )}

                                    {selectedCardData.details.trendsData && (
                                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                                            <div className="text-sm font-semibold text-primary mb-2">📈 Main Trend</div>
                                            <div className="font-medium text-white text-sm mb-1">
                                                {selectedCardData.details.trendsData.main_trend.trend_name}
                                            </div>
                                            <div className="text-xs text-white/70 mb-2">
                                                {selectedCardData.details.trendsData.main_trend.description}
                                            </div>
                                            <div className="flex gap-2">
                                                <Badge className="bg-white/10 text-white border-white/20 text-xs">
                                                    {selectedCardData.details.trendsData.market_momentum}
                                                </Badge>
                                                <Badge className="bg-white/10 text-white border-white/20 text-xs">
                                                    Impact: {selectedCardData.details.trendsData.main_trend.impact_score}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}

                                    {selectedCardData.details.competitionData && (
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-semibold text-white">⚔️ Competition</h4>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="p-2 rounded bg-black/40 border border-white/10 text-center">
                                                    <div className="text-lg font-bold text-white">
                                                        {selectedCardData.details.competitionData.total_competitors || 0}
                                                    </div>
                                                    <div className="text-xs text-white/50">Total</div>
                                                </div>
                                                <div className="p-2 rounded bg-green-500/10 border border-green-500/20 text-center">
                                                    <div className="text-lg font-bold text-green-400">
                                                        +{selectedCardData.details.competitionData.new_entrants || 0}
                                                    </div>
                                                    <div className="text-xs text-white/50">New</div>
                                                </div>
                                                <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-center">
                                                    <div className="text-lg font-bold text-red-400">
                                                        -{selectedCardData.details.competitionData.competitors_closing || 0}
                                                    </div>
                                                    <div className="text-xs text-white/50">Closed</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Operations Details */}
                            {selectedCardData.id === 'operations' && selectedCardData.details && (
                                <div className="space-y-4">
                                    {selectedCardData.details.employeeData && (
                                        <>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                                                    <div className="text-xs text-white/50 mb-1">Employees</div>
                                                    <div className="text-xl font-bold text-primary">
                                                        {selectedCardData.summary.employees}
                                                    </div>
                                                </div>
                                                <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                                                    <div className="text-xs text-white/50 mb-1">Total Salaries</div>
                                                    <div className="text-xl font-bold text-white">
                                                        ${selectedCardData.details.employeeData.total_salaries?.toLocaleString() || '0'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                                                <div className="text-sm font-semibold text-accent mb-2">📊 Team Status</div>
                                                <div className="text-xs text-white/70 mb-1">
                                                    Morale: {selectedCardData.details.employeeData.morale}%
                                                </div>
                                                <div className="text-xs text-white/70">
                                                    {selectedCardData.details.employeeData.overworked ? '⚠️ Staff is overworked' : '✓ Workload manageable'}
                                                </div>
                                            </div>

                                            {selectedCardData.details.employeeData.turnover && (
                                                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                                                    <div className="text-sm font-semibold text-primary mb-2">💡 Turnover Info</div>
                                                    <div className="text-xs text-white/70 mb-1">
                                                        Annual rate: {(selectedCardData.details.employeeData.turnover.annual_turnover_rate * 100).toFixed(1)}%
                                                    </div>
                                                    <div className="text-xs text-white/70">
                                                        Expected departures: {selectedCardData.details.employeeData.turnover.expected_departures_this_month}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
