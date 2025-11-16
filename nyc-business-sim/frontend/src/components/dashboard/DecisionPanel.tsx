import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Users, Clock, Package, Award, ChevronDown, ChevronUp } from "lucide-react";

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
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const updateDecision = (key: keyof PlayerDecisions, value: any) => {
        onChange({ ...decisions, [key]: value });
    };

    const getPriceStrategyFromModifier = (modifier: number): PlayerDecisions['pricing_strategy'] => {
        if (modifier >= 1.15) return 'premium';
        if (modifier <= 0.90) return 'discount';
        return 'competitive';
    };

    const handlePriceModifierChange = (value: number) => {
        console.log('🎚️ Price modifier changing to:', value);
        const newDecisions = { 
            ...decisions, 
            product_price_modifier: value,
            pricing_strategy: getPriceStrategyFromModifier(value)
        };
        console.log('📦 New decisions:', newDecisions);
        onChange(newDecisions);
    };

    const estimatedMonthlyCost =
        decisions.marketing_spend +
        (decisions.target_employee_count * decisions.avg_hourly_wage * decisions.working_hours_per_week * 4.33);

    const canAfford = cashBalance >= estimatedMonthlyCost;

    const sections = [
        {
            id: 'pricing',
            name: 'Pricing',
            icon: DollarSign,
            value: `${Math.round(decisions.product_price_modifier * 100)}%`,
            color: 'primary'
        },
        {
            id: 'quality',
            name: 'Quality',
            icon: Award,
            value: decisions.quality_level.charAt(0).toUpperCase() + decisions.quality_level.slice(1),
            color: 'accent'
        },
        {
            id: 'marketing',
            name: 'Marketing',
            icon: TrendingUp,
            value: `$${decisions.marketing_spend.toLocaleString()}`,
            color: 'primary'
        },
        {
            id: 'staff',
            name: 'Staff',
            icon: Users,
            value: `${decisions.target_employee_count} employees`,
            color: 'accent'
        },
        {
            id: 'inventory',
            name: 'Inventory',
            icon: Package,
            value: decisions.inventory_strategy.charAt(0).toUpperCase() + decisions.inventory_strategy.slice(1),
            color: 'primary'
        }
    ];

    return (
        <div className="space-y-2">
            {/* Cash Balance Info */}
            <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-white/50">Current Month</p>
                        <p className="text-sm font-semibold text-white">Month {currentMonth}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-white/50">Cash Balance</p>
                        <p className="text-lg font-bold text-primary">${cashBalance.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Compact Grid of Options */}
            {sections.map((section) => {
                    const Icon = section.icon;
                    const isExpanded = expandedSection === section.id;
                    
                    return (
                        <div key={section.id} className="rounded-xl border border-white/10 bg-black/20 overflow-hidden transition-all duration-300">
                            {/* Compact Button */}
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg bg-${section.color}/10 border border-${section.color}/20 flex items-center justify-center`}>
                                        <Icon className={`h-4 w-4 text-${section.color}`} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-white">{section.name}</p>
                                        <p className="text-xs text-white/50">{section.value}</p>
                                    </div>
                                </div>
                                {isExpanded ? (
                                    <ChevronUp className="h-4 w-4 text-primary" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-white/50 group-hover:text-primary transition-colors" />
                                )}
                            </button>

                            {/* Expandable Content */}
                            {isExpanded && (
                                <div className="px-4 pb-4 pt-2 border-t border-white/10 bg-black/30 animate-in slide-in-from-top-2">
                                    {section.id === 'pricing' && (
                                        <div className="space-y-4 py-2">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-xs text-white/70">Price Modifier</Label>
                                                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                                                    {Math.round(decisions.product_price_modifier * 100)}%
                                                </Badge>
                                            </div>
                                            <div className="py-2 relative z-10" onMouseDown={(e) => e.stopPropagation()}>
                                                <Slider
                                                    min={0.7}
                                                    max={1.5}
                                                    step={0.05}
                                                    value={[decisions.product_price_modifier]}
                                                    onValueChange={([val]) => handlePriceModifierChange(val)}
                                                    className="cursor-pointer"
                                                    disabled={false}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-white/40">
                                                <span>70%</span>
                                                <span>150%</span>
                                            </div>
                                        </div>
                                    )}

                                    {section.id === 'quality' && (
                                        <div className="space-y-3">
                                            <Label className="text-xs text-white/70">Quality Level</Label>
                                            <Select
                                                value={decisions.quality_level}
                                                onValueChange={(val) => updateDecision('quality_level', val as PlayerDecisions['quality_level'])}
                                            >
                                                <SelectTrigger className="bg-black/40 border-white/10 text-white h-9 text-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
                                                    <SelectItem value="basic" className="text-white hover:bg-white/10 text-sm">Basic</SelectItem>
                                                    <SelectItem value="standard" className="text-white hover:bg-white/10 text-sm">Standard</SelectItem>
                                                    <SelectItem value="premium" className="text-white hover:bg-white/10 text-sm">Premium</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {section.id === 'marketing' && (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-xs text-white/70">Monthly Budget</Label>
                                                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs font-mono">
                                                    ${decisions.marketing_spend.toLocaleString()}
                                                </Badge>
                                            </div>
                                            <Slider
                                                min={0}
                                                max={10000}
                                                step={500}
                                                value={[decisions.marketing_spend]}
                                                onValueChange={([val]) => updateDecision('marketing_spend', val)}
                                                className="cursor-pointer"
                                            />
                                            <div className="flex justify-between text-xs text-white/40">
                                                <span>$0</span>
                                                <span>$10k</span>
                                            </div>
                                        </div>
                                    )}

                                    {section.id === 'staff' && (
                                        <div className="space-y-4">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-xs text-white/70">Employees</Label>
                                                    <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">
                                                        {decisions.target_employee_count}
                                                    </Badge>
                                                </div>
                                                <Slider
                                                    min={1}
                                                    max={20}
                                                    step={1}
                                                    value={[decisions.target_employee_count]}
                                                    onValueChange={([val]) => updateDecision('target_employee_count', val)}
                                                    className="cursor-pointer"
                                                />
                                                <div className="flex justify-between text-xs text-white/40">
                                                    <span>1</span>
                                                    <span>20</span>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-xs text-white/70">Hourly Wage</Label>
                                                    <Badge className="bg-accent/20 text-accent border-accent/30 text-xs font-mono">
                                                        ${decisions.avg_hourly_wage}/hr
                                                    </Badge>
                                                </div>
                                                <Slider
                                                    min={15}
                                                    max={50}
                                                    step={1}
                                                    value={[decisions.avg_hourly_wage]}
                                                    onValueChange={([val]) => updateDecision('avg_hourly_wage', val)}
                                                    className="cursor-pointer"
                                                />
                                                <div className="flex justify-between text-xs text-white/40">
                                                    <span>$15</span>
                                                    <span>$50</span>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-xs text-white/70">Weekly Hours</Label>
                                                    <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">
                                                        {decisions.working_hours_per_week}h
                                                    </Badge>
                                                </div>
                                                <Slider
                                                    min={40}
                                                    max={80}
                                                    step={5}
                                                    value={[decisions.working_hours_per_week]}
                                                    onValueChange={([val]) => updateDecision('working_hours_per_week', val)}
                                                    className="cursor-pointer"
                                                />
                                                <div className="flex justify-between text-xs text-white/40">
                                                    <span>40h</span>
                                                    <span>80h</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {section.id === 'inventory' && (
                                        <div className="space-y-3">
                                            <Label className="text-xs text-white/70">Strategy</Label>
                                            <Select
                                                value={decisions.inventory_strategy}
                                                onValueChange={(val) => updateDecision('inventory_strategy', val as PlayerDecisions['inventory_strategy'])}
                                            >
                                                <SelectTrigger className="bg-black/40 border-white/10 text-white h-9 text-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
                                                    <SelectItem value="minimal" className="text-white hover:bg-white/10 text-sm">Minimal</SelectItem>
                                                    <SelectItem value="balanced" className="text-white hover:bg-white/10 text-sm">Balanced</SelectItem>
                                                    <SelectItem value="abundant" className="text-white hover:bg-white/10 text-sm">Abundant</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Compact Cost Summary */}
                <div className={`p-3 rounded-xl border-2 ${canAfford ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-white text-xs">Monthly Cost</h4>
                            <p className="text-xs text-white/40 mt-0.5">
                                Labor + Marketing
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-primary">${estimatedMonthlyCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                            <p className={`text-xs font-semibold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                                {canAfford ? '✅ OK' : '⚠️ Over'}
                            </p>
                        </div>
                    </div>
                </div>
        </div>
    );
}
