import { Sparkles, TrendingUp, DollarSign, AlertTriangle, Target, CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type Recommendation = {
    rank: number;
    business_type: string;
    confidence_score: number;
    why_this_location: string;
    target_customer: string;
    investment_range: string;
    risk_level: "low" | "medium" | "high";
    key_data_points: string[];
    consensus?: "full" | "partial" | "unique";
};

type Props = {
    recommendations: Recommendation[];
    isLoading: boolean;
    agentStatus?: {
        demographics?: boolean;
        lifestyle?: boolean;
        industry?: boolean;
        supplier?: boolean;
        aggregator?: boolean;
    };
};

const RecommendationsDisplay = ({ recommendations, isLoading, agentStatus }: Props) => {
    if (isLoading) {
        return (
            <div className="glass-card p-8 rounded-2xl space-y-6">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="relative">
                            <Loader2 className="h-16 w-16 text-primary animate-spin" />
                            <Sparkles className="h-8 w-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            AI Agents Analyzing Your Location
                        </h3>
                        <p className="text-muted-foreground">
                            Claude 3.5 Sonnet is processing Census data...
                        </p>
                    </div>

                    {/* Agent Status */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                        <AgentStatusCard
                            name="Demographics"
                            completed={agentStatus?.demographics || false}
                            icon="👥"
                        />
                        <AgentStatusCard
                            name="Lifestyle"
                            completed={agentStatus?.lifestyle || false}
                            icon="🏠"
                        />
                        <AgentStatusCard
                            name="Industry"
                            completed={agentStatus?.industry || false}
                            icon="💼"
                        />
                        <AgentStatusCard
                            name="Supplier"
                            completed={agentStatus?.supplier || false}
                            icon="📦"
                        />
                        <AgentStatusCard
                            name="Aggregator"
                            completed={agentStatus?.aggregator || false}
                            icon="🎯"
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (recommendations.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                    <h3 className="text-2xl font-bold">AI-Generated Business Recommendations</h3>
                    <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                </div>
                <p className="text-muted-foreground">
                    Based on detailed Census data analysis from {recommendations.length} specialized AI agents
                </p>
            </div>

            {/* Recommendations Cards */}
            <div className="grid gap-6">
                {recommendations.map((rec, index) => (
                    <RecommendationCard key={index} recommendation={rec} index={index} />
                ))}
            </div>

            {/* Footer Note */}
            <div className="glass-card p-4 rounded-lg border border-primary/20 bg-primary/5">
                <p className="text-sm text-center text-muted-foreground">
                    💡 <span className="font-semibold">Pro Tip:</span> Recommendations are ranked by confidence score based on real-time Census data + NYC supplier market analysis
                </p>
            </div>
        </div>
    );
};

// Agent Status Card Component
const AgentStatusCard = ({ name, completed, icon }: { name: string; completed: boolean; icon: string }) => (
    <div className={`p-4 rounded-lg border transition-all ${completed
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-muted/50 border-muted'
        }`}>
        <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <span className="text-xs font-medium">{name}</span>
            {completed ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
        </div>
    </div>
);

// Individual Recommendation Card
const RecommendationCard = ({ recommendation, index }: { recommendation: Recommendation; index: number }) => {
    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-muted-foreground bg-muted/10 border-muted/20';
        }
    };

    const getRiskIcon = (risk: string) => {
        switch (risk) {
            case 'low': return <CheckCircle2 className="h-4 w-4" />;
            case 'medium': return <AlertTriangle className="h-4 w-4" />;
            case 'high': return <AlertTriangle className="h-4 w-4" />;
            default: return null;
        }
    };

    return (
        <Card className={`glass-card p-6 rounded-xl border-2 transition-all hover:shadow-lg ${index === 0 ? 'border-primary bg-primary/5' : 'border-muted'
            }`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center h-10 w-10 rounded-full ${index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                        <span className="text-lg font-bold">#{recommendation.rank}</span>
                    </div>
                    <div>
                        <h4 className="text-xl font-bold">{recommendation.business_type}</h4>
                        {recommendation.consensus && (
                            <Badge variant="outline" className="mt-1 text-xs">
                                {recommendation.consensus === 'full' ? '🎯 Full Consensus' :
                                    recommendation.consensus === 'partial' ? '✅ Partial Consensus' :
                                        '⭐ Unique Opportunity'}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Confidence Score */}
                <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                        {recommendation.confidence_score}%
                    </div>
                    <div className="text-xs text-muted-foreground">Confidence</div>
                </div>
            </div>

            {/* Confidence Progress Bar */}
            <Progress value={recommendation.confidence_score} className="h-2 mb-4" />

            {/* Why This Location */}
            <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 border border-muted">
                    <div className="flex items-start gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                            <h5 className="font-semibold text-sm mb-1">Why This Location?</h5>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {recommendation.why_this_location}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Target Customer */}
                    <div className="p-3 rounded-lg bg-background border">
                        <div className="flex items-center gap-2 mb-1">
                            <Target className="h-4 w-4 text-primary" />
                            <span className="text-xs font-medium text-muted-foreground">Target Customer</span>
                        </div>
                        <p className="text-sm font-semibold">{recommendation.target_customer}</p>
                    </div>

                    {/* Investment Range */}
                    <div className="p-3 rounded-lg bg-background border">
                        <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="h-4 w-4 text-primary" />
                            <span className="text-xs font-medium text-muted-foreground">Investment Range</span>
                        </div>
                        <p className="text-sm font-semibold">{recommendation.investment_range}</p>
                    </div>

                    {/* Risk Level */}
                    <div className={`p-3 rounded-lg border ${getRiskColor(recommendation.risk_level)}`}>
                        <div className="flex items-center gap-2 mb-1">
                            {getRiskIcon(recommendation.risk_level)}
                            <span className="text-xs font-medium">Risk Level</span>
                        </div>
                        <p className="text-sm font-semibold capitalize">{recommendation.risk_level}</p>
                    </div>
                </div>

                {/* Key Data Points */}
                {recommendation.key_data_points && recommendation.key_data_points.length > 0 && (
                    <div className="space-y-2">
                        <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            📊 Key Census Data Points
                        </h5>
                        <div className="space-y-1">
                            {recommendation.key_data_points.map((point, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm">
                                    <span className="text-primary mt-0.5">•</span>
                                    <span className="text-muted-foreground">{point}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default RecommendationsDisplay;
