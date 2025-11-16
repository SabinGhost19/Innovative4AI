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
        <Card className="border-2 border-primary/20 bg-slate-900/50 backdrop-blur">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <TrendingUp className="h-5 w-5" />
                    Business Controls - Month {currentMonth}
                </CardTitle>
                <CardDescription className="text-slate-300">
                    Adjust your business parameters to influence market performance
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">

                {/* Pricing Controls */}
                <div className="space-y-4 p-4 bg-blue-950/30 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-blue-400" />
                        <h3 className="font-semibold text-blue-100">Pricing Strategy</h3>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="price-modifier" className="text-slate-200">Product Price Modifier</Label>
                            <Badge variant={
                                decisions.product_price_modifier >= 1.15 ? 'default' :
                                    decisions.product_price_modifier <= 0.90 ? 'destructive' : 'secondary'
                            }>
                                {decisions.product_price_modifier < 1 ? '🔽 Discount' :
                                    decisions.product_price_modifier > 1.1 ? '🔼 Premium' :
                                        '⚖️ Market Price'}
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
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>70% (Deep Discount)</span>
                            <span className="font-semibold text-slate-200">
                                {Math.round(decisions.product_price_modifier * 100)}%
                            </span>
                            <span>150% (Premium)</span>
                        </div>
                        <p className="text-sm text-slate-300 mt-2">
                            {decisions.product_price_modifier < 0.85 && "⚠️ Very low prices may attract customers but hurt profit margins"}
                            {decisions.product_price_modifier >= 0.85 && decisions.product_price_modifier < 1.0 && "✅ Competitive pricing to attract price-conscious customers"}
                            {decisions.product_price_modifier >= 1.0 && decisions.product_price_modifier < 1.15 && "⚖️ Market-standard pricing for balanced approach"}
                            {decisions.product_price_modifier >= 1.15 && decisions.product_price_modifier < 1.3 && "💎 Premium pricing for higher margins (may reduce volume)"}
                            {decisions.product_price_modifier >= 1.3 && "⚠️ Very high prices may significantly reduce customer count"}
                        </p>
                    </div>
                </div>

                {/* Quality Level */}
                <div className="space-y-4 p-4 bg-purple-950/30 border border-purple-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-purple-400" />
                        <h3 className="font-semibold text-purple-100">Product/Service Quality</h3>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quality-level" className="text-slate-200">Quality Level</Label>
                        <Select
                            value={decisions.quality_level}
                            onValueChange={(val) => updateDecision('quality_level', val as PlayerDecisions['quality_level'])}
                        >
                            <SelectTrigger id="quality-level" className="bg-slate-800/50 border-slate-700 text-white">
                                <SelectValue placeholder="Select quality level" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="basic" className="text-white hover:bg-slate-700">
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">Basic</span>
                                        <span className="text-xs text-slate-400">Lower cost, lower satisfaction</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="standard" className="text-white hover:bg-slate-700">
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">Standard</span>
                                        <span className="text-xs text-slate-400">Balanced cost and quality</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="premium" className="text-white hover:bg-slate-700">
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">Premium</span>
                                        <span className="text-xs text-slate-400">High cost, high satisfaction</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-slate-300">
                            {decisions.quality_level === 'basic' && "⚠️ Lower quality may reduce customer satisfaction and retention"}
                            {decisions.quality_level === 'standard' && "✅ Good balance between cost and customer satisfaction"}
                            {decisions.quality_level === 'premium' && "💎 High quality builds loyalty but increases costs"}
                        </p>
                    </div>
                </div>

                {/* Marketing Budget */}
                <div className="space-y-4 p-4 bg-green-950/30 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        <h3 className="font-semibold text-green-100">Marketing & Growth</h3>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="marketing-spend" className="text-slate-200">Monthly Marketing Budget</Label>
                            <Badge variant="outline" className="font-mono border-slate-600 text-slate-200">
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
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>$0 (No Marketing)</span>
                            <span>${decisions.marketing_spend.toLocaleString()}</span>
                            <span>$10,000 (Aggressive)</span>
                        </div>
                        <p className="text-sm text-slate-300">
                            {decisions.marketing_spend === 0 && "⚠️ No marketing may limit customer acquisition"}
                            {decisions.marketing_spend > 0 && decisions.marketing_spend < 2000 && "💡 Minimal marketing for organic growth"}
                            {decisions.marketing_spend >= 2000 && decisions.marketing_spend < 5000 && "✅ Moderate marketing for steady growth"}
                            {decisions.marketing_spend >= 5000 && "🚀 Aggressive marketing for rapid expansion"}
                        </p>
                    </div>
                </div>

                {/* Staff Management */}
                <div className="space-y-4 p-4 bg-orange-950/30 border border-orange-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-orange-400" />
                        <h3 className="font-semibold text-orange-100">Staff Management</h3>
                    </div>

                    <div className="space-y-4">
                        {/* Employee Count */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="staff-count" className="text-slate-200">Number of Employees</Label>
                                <Badge variant="outline" className="border-slate-600 text-slate-200">{decisions.target_employee_count} staff</Badge>
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
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>1 (Solo)</span>
                                <span>{decisions.target_employee_count} employees</span>
                                <span>20 (Large Team)</span>
                            </div>
                        </div>

                        {/* Hourly Wage */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="hourly-wage" className="text-slate-200">Average Hourly Wage</Label>
                                <Badge variant="outline" className="font-mono border-slate-600 text-slate-200">${decisions.avg_hourly_wage}/hr</Badge>
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
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>$15/hr (Minimum)</span>
                                <span>${decisions.avg_hourly_wage}/hr</span>
                                <span>$50/hr (Premium)</span>
                            </div>
                            <p className="text-sm text-slate-300">
                                {decisions.avg_hourly_wage < 18 && "⚠️ Low wages may cause high turnover and poor service"}
                                {decisions.avg_hourly_wage >= 18 && decisions.avg_hourly_wage < 25 && "✅ Competitive wages for reliable staff"}
                                {decisions.avg_hourly_wage >= 25 && "💎 Premium wages attract top talent"}
                            </p>
                        </div>

                        {/* Working Hours */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="working-hours" className="text-slate-200">Weekly Operating Hours</Label>
                                <Badge variant="outline" className="border-slate-600 text-slate-200">{decisions.working_hours_per_week}h/week</Badge>
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
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>40h (Standard)</span>
                                <span>{decisions.working_hours_per_week}h</span>
                                <span>80h (24/7)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory Strategy */}
                <div className="space-y-4 p-4 bg-amber-950/30 border border-amber-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-amber-400" />
                        <h3 className="font-semibold text-amber-100">Inventory Strategy</h3>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="inventory-strategy" className="text-slate-200">Inventory Level</Label>
                        <Select
                            value={decisions.inventory_strategy}
                            onValueChange={(val) => updateDecision('inventory_strategy', val as PlayerDecisions['inventory_strategy'])}
                        >
                            <SelectTrigger id="inventory-strategy" className="bg-slate-800/50 border-slate-700 text-white">
                                <SelectValue placeholder="Select inventory strategy" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="minimal" className="text-white hover:bg-slate-700">
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">Minimal</span>
                                        <span className="text-xs text-slate-400">Just-in-time, lower costs</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="balanced" className="text-white hover:bg-slate-700">
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">Balanced</span>
                                        <span className="text-xs text-slate-400">Moderate stock levels</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="abundant" className="text-white hover:bg-slate-700">
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">Abundant</span>
                                        <span className="text-xs text-slate-400">High stock, always available</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-slate-300">
                            {decisions.inventory_strategy === 'minimal' && "⚠️ Lower costs but risk of stockouts"}
                            {decisions.inventory_strategy === 'balanced' && "✅ Good balance between availability and cost"}
                            {decisions.inventory_strategy === 'abundant' && "💰 Always in stock but higher carrying costs"}
                        </p>
                    </div>
                </div>

                {/* Cost Summary */}
                <div className={`p-4 rounded-lg border-2 ${canAfford ? 'bg-green-950/30 border-green-500/40' : 'bg-red-950/30 border-red-500/40'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-sm text-slate-200">Estimated Monthly Operating Cost</h4>
                            <p className="text-xs text-slate-400 mt-1">
                                Labor: ${(decisions.target_employee_count * decisions.avg_hourly_wage * decisions.working_hours_per_week * 4.33).toLocaleString('en-US', { maximumFractionDigits: 0 })} +
                                Marketing: ${decisions.marketing_spend.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-white">${estimatedMonthlyCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                            <p className={`text-xs font-semibold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                                {canAfford ? '✅ Affordable' : '⚠️ Exceeds current cash'}
                            </p>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
