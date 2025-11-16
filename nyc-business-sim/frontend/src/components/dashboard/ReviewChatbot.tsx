import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    X,
    Loader2,
    MapPin,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewRecommendation {
    recommendation: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'RISKY' | 'NOT_RECOMMENDED';
    confidence: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    survival_analysis: {
        rate: number;
        industry: string;
        risk_level: string;
        interpretation: string;
    };
    demographic_insights: {
        income_match: string;
        education_level: string;
        population_density: string;
        key_metric: string;
    };
    actionable_advice: string[];
    competitor_warning?: string;
}

interface ReviewChatbotProps {
    isOpen: boolean;
    onClose: () => void;
    location: {
        lat: number;
        lng: number;
        address?: string;
        neighborhood?: string;
    };
    businessType: string;
}

const ReviewChatbot = ({ isOpen, onClose, location, businessType }: ReviewChatbotProps) => {
    const [loading, setLoading] = useState(false);
    const [recommendation, setRecommendation] = useState<ReviewRecommendation | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showDetails, setShowDetails] = useState(true); // Auto-expand details

    // Auto-fetch când se deschide chatbot-ul
    useEffect(() => {
        if (isOpen && !recommendation && !loading) {
            fetchRecommendation();
        }
    }, [isOpen]);

    const fetchRecommendation = async () => {
        setLoading(true);
        setError(null);

        try {
            // Step 1: Obținem survival data din backend
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

            // Fetch detailed analysis (census + geocoding)
            const detailedResponse = await fetch(`${backendUrl}/api/analyze-area-detailed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    latitude: location.lat,
                    longitude: location.lng,
                }),
            });

            let censusData = null;
            if (detailedResponse.ok) {
                censusData = await detailedResponse.json();
            }

            // Fetch survival data (presupunem că există endpoint)
            let survivalData = null;
            try {
                const survivalResponse = await fetch(
                    `${backendUrl}/api/business-survival/find?business_type=${encodeURIComponent(businessType)}&county=New York County, New York`
                );
                if (survivalResponse.ok) {
                    survivalData = await survivalResponse.json();
                }
            } catch (err) {
                console.warn('Survival data not available:', err);
            }

            // Step 2: Trimitem datele la agentul nostru
            const orchestratorUrl = import.meta.env.VITE_ORCHESTRATOR_URL || 'http://localhost:3000';

            const response = await fetch(`${orchestratorUrl}/api/register-review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    location,
                    businessType,
                    survivalData,
                    censusData,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get recommendation');
            }

            const result = await response.json();

            if (result.success) {
                setRecommendation(result.recommendation);
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (err: any) {
            console.error('Error fetching recommendation:', err);
            setError(err.message || 'Failed to analyze location');
        } finally {
            setLoading(false);
        }
    };

    const getRecommendationColor = (rec: string) => {
        switch (rec) {
            case 'EXCELLENT': return 'bg-green-500';
            case 'GOOD': return 'bg-blue-500';
            case 'MODERATE': return 'bg-amber-500';
            case 'RISKY': return 'bg-orange-500';
            case 'NOT_RECOMMENDED': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getRecommendationIcon = (rec: string) => {
        switch (rec) {
            case 'EXCELLENT':
            case 'GOOD':
                return <CheckCircle2 className="h-5 w-5" />;
            case 'MODERATE':
            case 'RISKY':
                return <AlertCircle className="h-5 w-5" />;
            case 'NOT_RECOMMENDED':
                return <X className="h-5 w-5" />;
            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className={cn(
                "fixed bottom-0 right-0 z-50 w-[650px] h-[90vh] transition-all duration-300",
                "transform translate-x-0 opacity-100",
                "shadow-2xl rounded-tl-2xl overflow-hidden"
            )}
        >
            <Card className="border-2 border-primary/20 bg-background/98 backdrop-blur-md h-full flex flex-col rounded-none rounded-tl-2xl">
                <CardHeader className="pb-4 border-b bg-gradient-to-r from-primary/10 to-primary/5 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2.5 rounded-full">
                                <Sparkles className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Location Review</CardTitle>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    AI-powered business analysis
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>

                <div className="flex-1 overflow-y-auto">
                    <CardContent className="pt-5 pb-6 space-y-5">{/* Location Info */}
                        <div className="bg-gradient-to-br from-muted/70 to-muted/40 p-4 rounded-xl border border-border/50 space-y-2.5">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-base font-semibold text-foreground">
                                        {location.neighborhood || 'New York'}
                                    </p>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                                        {location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                                <Badge variant="secondary" className="text-sm font-medium">
                                    {businessType}
                                </Badge>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <div className="text-center space-y-1">
                                    <p className="text-base font-medium">Analyzing location...</p>
                                    <p className="text-sm text-muted-foreground">
                                        This may take a few seconds
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
                                    <div className="space-y-2">
                                        <p className="text-base font-medium text-destructive">Analysis Failed</p>
                                        <p className="text-sm text-muted-foreground">{error}</p>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={fetchRecommendation}
                                            className="mt-2"
                                        >
                                            Try Again
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recommendation Result */}
                        {recommendation && !loading && (
                            <div className="space-y-5">
                                {/* Main Recommendation Card */}
                                <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border-2 border-primary/20 rounded-xl p-5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Badge
                                            className={cn(
                                                "px-4 py-2 text-base font-bold text-white shadow-md",
                                                getRecommendationColor(recommendation.recommendation)
                                            )}
                                        >
                                            <span className="flex items-center gap-2">
                                                {getRecommendationIcon(recommendation.recommendation)}
                                                {recommendation.recommendation.replace('_', ' ')}
                                            </span>
                                        </Badge>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Confidence</p>
                                            <p className="text-2xl font-bold text-primary">{recommendation.confidence}%</p>
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 border border-border/50">
                                        <p className="text-base leading-relaxed font-medium">
                                            {recommendation.summary}
                                        </p>
                                    </div>
                                </div>

                                {/* Quick Stats Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 p-4 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="bg-green-500/10 p-1.5 rounded-lg">
                                                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            </div>
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                Survival Rate
                                            </span>
                                        </div>
                                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                            {recommendation.survival_analysis.rate}%
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1 font-medium">
                                            {recommendation.survival_analysis.industry}
                                        </p>
                                        <Badge variant="outline" className="mt-2 text-xs">
                                            {recommendation.survival_analysis.risk_level} risk
                                        </Badge>
                                    </div>

                                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 p-4 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="bg-blue-500/10 p-1.5 rounded-lg">
                                                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                Income Match
                                            </span>
                                        </div>
                                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 line-clamp-3 leading-relaxed">
                                            {recommendation.demographic_insights.income_match}
                                        </p>
                                    </div>
                                </div>

                                {/* Details Section - Always Shown */}
                                <div className="space-y-5">
                                    {/* Strengths */}
                                    <div className="bg-gradient-to-br from-green-50/50 to-green-100/30 dark:from-green-950/20 dark:to-green-900/10 border border-green-200/50 dark:border-green-800/30 rounded-xl p-5">
                                        <h4 className="text-base font-bold mb-4 flex items-center gap-2 text-green-700 dark:text-green-400">
                                            <div className="bg-green-500/20 p-1.5 rounded-lg">
                                                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            Key Strengths
                                        </h4>
                                        <ul className="space-y-3">
                                            {recommendation.strengths.map((strength, idx) => (
                                                <li key={idx} className="flex gap-3 items-start group">
                                                    <span className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5 text-lg font-bold">✓</span>
                                                    <span className="text-sm text-foreground leading-relaxed">
                                                        {strength}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Weaknesses */}
                                    <div className="bg-gradient-to-br from-orange-50/50 to-orange-100/30 dark:from-orange-950/20 dark:to-orange-900/10 border border-orange-200/50 dark:border-orange-800/30 rounded-xl p-5">
                                        <h4 className="text-base font-bold mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-400">
                                            <div className="bg-orange-500/20 p-1.5 rounded-lg">
                                                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            Potential Concerns
                                        </h4>
                                        <ul className="space-y-3">
                                            {recommendation.weaknesses.map((weakness, idx) => (
                                                <li key={idx} className="flex gap-3 items-start group">
                                                    <span className="text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5 text-lg font-bold">⚠</span>
                                                    <span className="text-sm text-foreground leading-relaxed">
                                                        {weakness}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Actionable Advice */}
                                    <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 border-2 border-primary/20 rounded-xl p-5">
                                        <h4 className="text-base font-bold mb-4 flex items-center gap-2 text-primary">
                                            <div className="bg-primary/20 p-1.5 rounded-lg">
                                                <Sparkles className="h-5 w-5 text-primary" />
                                            </div>
                                            Recommended Actions
                                        </h4>
                                        <ul className="space-y-3">
                                            {recommendation.actionable_advice.map((advice, idx) => (
                                                <li key={idx} className="flex gap-3 items-start group">
                                                    <span className="text-primary flex-shrink-0 mt-0.5 font-bold text-lg">→</span>
                                                    <span className="text-sm text-foreground leading-relaxed font-medium">
                                                        {advice}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Competitor Warning */}
                                    {recommendation.competitor_warning && (
                                        <div className="bg-gradient-to-br from-amber-50/80 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-2 border-amber-400/50 dark:border-amber-600/40 rounded-xl p-5">
                                            <div className="flex gap-3 items-start">
                                                <div className="bg-amber-500/20 p-2 rounded-lg flex-shrink-0">
                                                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">
                                                        Important Note
                                                    </p>
                                                    <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
                                                        {recommendation.competitor_warning}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </div>
            </Card>
        </div>
    );
};

export default ReviewChatbot;
