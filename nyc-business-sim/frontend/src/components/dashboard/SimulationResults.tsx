import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
interface SimulationResultsProps {
    outputs: any;
    month: number;
    year: number;
    executionTime: number;
}

export default function SimulationResults({ outputs, month, year, executionTime }: SimulationResultsProps) {
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass-card p-6 rounded-2xl border border-white/10">
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
                    Complete analysis of all business aspects for this month
                </p>
            </div>

            {/* Tabs for different aspects */}
            <Tabs defaultValue="financial" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10 p-1 rounded-xl">
                    <TabsTrigger value="financial" className="data-[state=active]:bg-primary data-[state=active]:text-white text-white/70">
                        💰 Financial
                    </TabsTrigger>
                    <TabsTrigger value="customers" className="data-[state=active]:bg-primary data-[state=active]:text-white text-white/70">
                        👥 Customers
                    </TabsTrigger>
                    <TabsTrigger value="market" className="data-[state=active]:bg-primary data-[state=active]:text-white text-white/70">
                        🏪 Market
                    </TabsTrigger>
                    <TabsTrigger value="operations" className="data-[state=active]:bg-primary data-[state=active]:text-white text-white/70">
                        ⚙️ Operations
                    </TabsTrigger>
                </TabsList>

                {/* Financial Tab */}
                <TabsContent value="financial" className="space-y-4 mt-6">
                    <div className="glass-card p-6 rounded-2xl border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span>💰</span> Financial Performance
                        </h3>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="text-sm text-white/60 mb-2">Revenue</div>
                                    <div className="text-2xl font-bold text-green-400">
                                        ${financialData?.profit_loss?.revenue?.toLocaleString() || '0'}
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="text-sm text-white/60 mb-2">Net Profit</div>
                                    <div className={`text-2xl font-bold ${(financialData?.profit_loss?.net_profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        ${financialData?.profit_loss?.net_profit?.toLocaleString() || '0'}
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="text-sm text-white/60 mb-2">Profit Margin</div>
                                    <div className="text-xl font-semibold text-white">
                                        {financialData?.profit_loss?.profit_margin?.toFixed(1) || '0'}%
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="text-sm text-white/60 mb-2">Cash Balance</div>
                                    <div className="text-xl font-semibold text-white">
                                        ${financialData?.cash_flow?.closing_balance?.toLocaleString() || '0'}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <h4 className="font-semibold text-white mb-3">Cost Breakdown</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-white/80">
                                        <span>Labor:</span>
                                        <span className="font-medium">${financialData?.cost_breakdown?.labor?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-white/80">
                                        <span>Inventory/COGS:</span>
                                        <span className="font-medium">${financialData?.cost_breakdown?.inventory?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-white/80">
                                        <span>Rent:</span>
                                        <span className="font-medium">${financialData?.cost_breakdown?.rent?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-white/80">
                                        <span>Marketing:</span>
                                        <span className="font-medium">${financialData?.cost_breakdown?.marketing?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-white/80">
                                        <span>Utilities:</span>
                                        <span className="font-medium">${financialData?.cost_breakdown?.utilities?.toLocaleString() || '0'}</span>
                                    </div>
                                </div>
                            </div>

                            {financialData?.alerts && financialData.alerts.length > 0 && (
                                <Alert className="bg-red-500/10 border-red-500/20">
                                    <AlertDescription className="text-white/90">
                                        <ul className="list-disc pl-4">
                                            {financialData.alerts.map((alert: string, i: number) => (
                                                <li key={i}>{alert}</li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* Customers Tab */}
                <TabsContent value="customers" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>👥 Customer Analytics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {customerData?.total_active_customers?.toLocaleString() || '0'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Total Customers</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        +{customerData?.new_customers_acquired?.toLocaleString() || '0'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">New Customers</div>
                                </div>
                                <div className="text-center p-4 bg-red-50 rounded-lg">
                                    <div className="text-2xl font-bold text-red-600">
                                        -{customerData?.churned_customers?.toLocaleString() || '0'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Churned</div>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <h4 className="font-semibold mb-2">Customer Segments</h4>
                                <div className="space-y-3">
                                    {customerData?.customer_segments?.map((segment: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <div className="font-medium">{segment.segment_name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {segment.size} customers • Avg spend: ${segment.avg_spend}
                                                </div>
                                            </div>
                                            <Badge>{segment.loyalty}% loyal</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {customerData?.behavioral_insights && (
                                <div className="pt-4 border-t">
                                    <h4 className="font-semibold mb-2">📌 Key Insights</h4>
                                    <ul className="list-disc pl-4 space-y-1">
                                        {customerData.behavioral_insights.map((insight: string, i: number) => (
                                            <li key={i} className="text-sm">{insight}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Market Tab */}
                <TabsContent value="market" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>🏪 Market Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Market Context */}
                            <div>
                                <h4 className="font-semibold mb-3">📊 Market Context</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-sm text-muted-foreground">Economic Climate</div>
                                        <Badge variant="outline" className="mt-1">
                                            {marketContext?.economic_climate}
                                        </Badge>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-sm text-muted-foreground">Industry Saturation</div>
                                        <div className="text-lg font-semibold">{marketContext?.industry_saturation}%</div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-sm text-muted-foreground">Market Risk</div>
                                        <Badge variant="outline" className="mt-1">
                                            {marketContext?.market_risk_level}
                                        </Badge>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-sm text-muted-foreground">5-Year Survival Rate</div>
                                        <div className="text-lg font-semibold">
                                            {marketContext?.survival_benchmark?.industry_5yr_survival || 'N/A'}%
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Events */}
                            {eventsData && (
                                <div className="pt-4 border-t">
                                    <h4 className="font-semibold mb-3">🎲 Monthly Event</h4>
                                    <Alert>
                                        <AlertDescription>
                                            <div className="font-semibold">{eventsData.nume_eveniment}</div>
                                            <div className="text-sm mt-1">{eventsData.descriere_scurta}</div>
                                            <div className="mt-2">
                                                <Badge variant={eventsData.impact_clienti_lunar > 0 ? "default" : "destructive"}>
                                                    Impact: {eventsData.impact_clienti_lunar > 0 ? '+' : ''}{eventsData.impact_clienti_lunar}%
                                                </Badge>
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            )}

                            {/* Trends */}
                            {trendsData && (
                                <div className="pt-4 border-t">
                                    <h4 className="font-semibold mb-3">📈 Market Trends</h4>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <div className="font-medium">{trendsData.main_trend.trend_name}</div>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                {trendsData.main_trend.description}
                                            </div>
                                            <div className="mt-2 flex gap-2">
                                                <Badge>{trendsData.market_momentum} momentum</Badge>
                                                <Badge variant="outline">Impact: {trendsData.main_trend.impact_score}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Competition */}
                            <div className="pt-4 border-t">
                                <h4 className="font-semibold mb-3">⚔️ Competition</h4>
                                <div className="grid grid-cols-3 gap-4 mb-3">
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold">{competitionData?.total_competitors || 0}</div>
                                        <div className="text-xs text-muted-foreground">Total Competitors</div>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">
                                            +{competitionData?.new_entrants || 0}
                                        </div>
                                        <div className="text-xs text-muted-foreground">New Entrants</div>
                                    </div>
                                    <div className="text-center p-3 bg-red-50 rounded-lg">
                                        <div className="text-2xl font-bold text-red-600">
                                            -{competitionData?.competitors_closing || 0}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Closures</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Badge variant="outline">Market: {competitionData?.market_space}</Badge>
                                    <Badge variant="outline">Pricing Pressure: {competitionData?.pricing_pressure}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Operations Tab */}
                <TabsContent value="operations" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>⚙️ Operations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Employees */}
                            <div>
                                <h4 className="font-semibold mb-3">👥 Team Performance</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <div className="text-2xl font-bold">{employeeData?.total_employees || 0}</div>
                                        <div className="text-sm text-muted-foreground">Employees</div>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold">{employeeData?.productivity_score || 0}%</div>
                                        <div className="text-sm text-muted-foreground">Productivity</div>
                                    </div>
                                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                                        <div className="text-2xl font-bold">{employeeData?.morale || 0}%</div>
                                        <div className="text-sm text-muted-foreground">Morale</div>
                                    </div>
                                </div>
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="text-sm text-muted-foreground">Total Labor Cost</div>
                                    <div className="text-xl font-semibold">
                                        ${employeeData?.total_salaries?.toLocaleString() || '0'}
                                    </div>
                                </div>
                            </div>

                            {/* Suppliers */}
                            <div className="pt-4 border-t">
                                <h4 className="font-semibold mb-3">📦 Supply Chain</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Supplier Availability:</span>
                                        <Badge variant="outline">{supplierData?.supplier_availability}</Badge>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Price Volatility:</span>
                                        <Badge variant="outline">{supplierData?.price_volatility}</Badge>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Reliability Score:</span>
                                        <span className="font-medium">{supplierData?.supplier_reliability}%</span>
                                    </div>
                                </div>

                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="text-sm text-muted-foreground mb-2">Monthly Supply Costs</div>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span>Inventory:</span>
                                            <span className="font-medium">
                                                ${supplierData?.estimated_monthly_costs?.inventory?.toLocaleString() || '0'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Utilities:</span>
                                            <span className="font-medium">
                                                ${supplierData?.estimated_monthly_costs?.utilities?.toLocaleString() || '0'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between font-semibold pt-1 border-t">
                                            <span>Total:</span>
                                            <span>${supplierData?.estimated_monthly_costs?.total?.toLocaleString() || '0'}</span>
                                        </div>
                                    </div>
                                </div>

                                {supplierData?.cost_optimization_tips && (
                                    <div className="mt-3">
                                        <div className="text-sm font-medium mb-2">💡 Cost Optimization Tips:</div>
                                        <ul className="list-disc pl-4 space-y-1 text-sm">
                                            {supplierData.cost_optimization_tips.map((tip: string, i: number) => (
                                                <li key={i}>{tip}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
