import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Users, Clock, Package, Award } from "lucide-react";

export interface PlayerDecisions {
    pricing_strategy: 'premium' | 'competitive' | 'discount';
    product_price_modifier: number;     // 0.7 - 1.5 (70% - 150% of base price)
    quality_level: 'premium' | 'standard' | 'basic';
    marketing_spend: number;            // $0 - $10,000
    target_employee_count: number;      // 1 - 20
    avg_hourly_wage: number;            // $15 - $50
    inventory_strategy: 'minimal' | 'balanced' | 'abundant';
    working_hours_per_week: number;     // 40 - 80
}

interface DecisionPanelProps {
    decisions: PlayerDecisions;
    onChange: (decisions: PlayerDecisions) => void;
    currentMonth: number;
    cashBalance: number;
}

export default function DecisionPanel({
    decisions,
    onChange,
    currentMonth,
    cashBalance
}: DecisionPanelProps) {

    const updateDecision = (key: keyof PlayerDecisions, value: any) => {
        onChange({ ...decisions, [key]: value });
    };

    const getPriceStrategyFromModifier = (modifier: number): PlayerDecisions['pricing_strategy'] => {
        if (modifier >= 1.15) return 'premium';
        if (modifier <= 0.90) return 'discount';
        return 'competitive';
    };

    const handlePriceModifierChange = (value: number) => {
        updateDecision('product_price_modifier', value);
        updateDecision('pricing_strategy', getPriceStrategyFromModifier(value));
    };

    const estimatedMonthlyCost =
        decisions.marketing_spend +
        (decisions.target_employee_count * decisions.avg_hourly_wage * decisions.working_hours_per_week * 4.33);

    const canAfford = cashBalance >= estimatedMonthlyCost;

    return (
        <div className="backdrop-blur-xl bg-black/30 rounded-2xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-black/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Business Controls</h2>
                            <p className="text-sm text-white/60">Month {currentMonth}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-white/50">Cash Balance</p>
                        <p className="text-lg font-semibold text-primary">${cashBalance.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">{/* Pricing Controls */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="font-semibold text-white">Pricing</h3>
                    </div>

                    <div className="space-y-3 pl-11">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="price-modifier" className="text-white/80 text-sm">Price Modifier</Label>
                            <Badge variant={
                                decisions.product_price_modifier >= 1.15 ? 'default' :
                                    decisions.product_price_modifier <= 0.90 ? 'destructive' : 'secondary'
                            } className="bg-primary/20 text-primary border-primary/30">
                                {Math.round(decisions.product_price_modifier * 100)}%
                            </Badge>
                        </div>
                        <Slider
                            id="price-modifier"
                            min={0.7}
                            max={1.5}
                            step={0.05}
                            value={[decisions.product_price_modifier]}
                            onValueChange={([val]) => handlePriceModifierChange(val)}
                            className="cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-white/50">
                            <span>70%</span>
                            <span>150%</span>
                        </div>
                    </div>
                </div>

                {/* Quality Level */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Award className="h-4 w-4 text-accent" />
                        </div>
                        <h3 className="font-semibold text-white">Quality</h3>
                    </div>

                    <div className="space-y-3 pl-11">
                        <Label htmlFor="quality-level" className="text-white/80 text-sm">Quality Level</Label>
                        <Select
                            value={decisions.quality_level}
                            onValueChange={(val) => updateDecision('quality_level', val as PlayerDecisions['quality_level'])}
                        >
                            <SelectTrigger id="quality-level" className="bg-black/40 border-white/10 text-white">
                                <SelectValue placeholder="Select quality" />
                            </SelectTrigger>
                            <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
                                <SelectItem value="basic" className="text-white hover:bg-white/10">Basic</SelectItem>
                                <SelectItem value="standard" className="text-white hover:bg-white/10">Standard</SelectItem>
                                <SelectItem value="premium" className="text-white hover:bg-white/10">Premium</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Marketing Budget */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="font-semibold text-white">Marketing</h3>
                    </div>

                    <div className="space-y-3 pl-11">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="marketing-spend" className="text-white/80 text-sm">Monthly Budget</Label>
                            <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 font-mono">
                                ${decisions.marketing_spend.toLocaleString()}
                            </Badge>
                        </div>
                        <Slider
                            id="marketing-spend"
                            min={0}
                            max={10000}
                            step={500}
                            value={[decisions.marketing_spend]}
                            onValueChange={([val]) => updateDecision('marketing_spend', val)}
                            className="cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-white/50">
                            <span>$0</span>
                            <span>$10k</span>
                        </div>
                    </div>
                </div>

                {/* Staff Management */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-accent" />
                        </div>
                        <h3 className="font-semibold text-white">Staff</h3>
                    </div>

                    <div className="space-y-4 pl-11">
                        {/* Employee Count */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="staff-count" className="text-white/80 text-sm">Employees</Label>
                                <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30">{decisions.target_employee_count}</Badge>
                            </div>
                            <Slider
                                id="staff-count"
                                min={1}
                                max={20}
                                step={1}
                                value={[decisions.target_employee_count]}
                                onValueChange={([val]) => updateDecision('target_employee_count', val)}
                                className="cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-white/50">
                                <span>1</span>
                                <span>20</span>
                            </div>
                        </div>

                        {/* Hourly Wage */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="hourly-wage" className="text-white/80 text-sm">Hourly Wage</Label>
                                <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30 font-mono">${decisions.avg_hourly_wage}/hr</Badge>
                            </div>
                            <Slider
                                id="hourly-wage"
                                min={15}
                                max={50}
                                step={1}
                                value={[decisions.avg_hourly_wage]}
                                onValueChange={([val]) => updateDecision('avg_hourly_wage', val)}
                                className="cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-white/50">
                                <span>$15</span>
                                <span>$50</span>
                            </div>
                        </div>

                        {/* Working Hours */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="working-hours" className="text-white/80 text-sm">Weekly Hours</Label>
                                <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30">{decisions.working_hours_per_week}h</Badge>
                            </div>
                            <Slider
                                id="working-hours"
                                min={40}
                                max={80}
                                step={5}
                                value={[decisions.working_hours_per_week]}
                                onValueChange={([val]) => updateDecision('working_hours_per_week', val)}
                                className="cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-white/50">
                                <span>40h</span>
                                <span>80h</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory Strategy */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Package className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="font-semibold text-white">Inventory</h3>
                    </div>

                    <div className="space-y-3 pl-11">
                        <Label htmlFor="inventory-strategy" className="text-white/80 text-sm">Strategy</Label>
                        <Select
                            value={decisions.inventory_strategy}
                            onValueChange={(val) => updateDecision('inventory_strategy', val as PlayerDecisions['inventory_strategy'])}
                        >
                            <SelectTrigger id="inventory-strategy" className="bg-black/40 border-white/10 text-white">
                                <SelectValue placeholder="Select strategy" />
                            </SelectTrigger>
                            <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
                                <SelectItem value="minimal" className="text-white hover:bg-white/10">Minimal</SelectItem>
                                <SelectItem value="balanced" className="text-white hover:bg-white/10">Balanced</SelectItem>
                                <SelectItem value="abundant" className="text-white hover:bg-white/10">Abundant</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Cost Summary */}
                <div className={`p-4 rounded-xl border-2 ${canAfford ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-white text-sm">Monthly Operating Cost</h4>
                            <p className="text-xs text-white/50 mt-1">
                                Labor: ${(decisions.target_employee_count * decisions.avg_hourly_wage * decisions.working_hours_per_week * 4.33).toLocaleString('en-US', { maximumFractionDigits: 0 })} + Marketing: ${decisions.marketing_spend.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-primary">${estimatedMonthlyCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                            <p className={`text-xs font-semibold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                                {canAfford ? '✅ Affordable' : '⚠️ Over Budget'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
