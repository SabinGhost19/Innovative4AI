import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Database } from "lucide-react";

interface AnalysisData {
    success: boolean;
    message: string;
    area_id: number;
    data: {
        latitude: number;
        longitude: number;
        area_name: string;
        fips_codes: {
            state: string;
            county: string;
            tract: string;
        };
        demographics: {
            [key: string]: string | number;
        };
    };
    detailed_data?: {
        latitude: number;
        longitude: number;
        area_name: string;
        analysis_type: string;
        year: string;
        fips_codes: {
            state: string;
            county: string;
            tract: string;
            block: string;
            full_tract_id: string;
            full_block_id: string;
        };
        demographics_detailed: {
            [key: string]: {
                value: string | number;
                label: string;
            };
        };
        derived_statistics: {
            poverty_rate: number;
            high_income_households_rate: number;
            bachelor_plus_rate: number;
            renter_rate: number;
            work_from_home_rate: number;
            high_income_count: number;
            bachelor_plus_count: number;
        };
    };
}

const AreaAnalysisDebug = () => {
    const navigate = useNavigate();
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedData = localStorage.getItem("areaAnalysisData");
        if (savedData) {
            setAnalysisData(JSON.parse(savedData));
        }
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading analysis data...</p>
                </div>
            </div>
        );
    }

    if (!analysisData) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle>No Analysis Data Found</CardTitle>
                        <CardDescription>
                            Please complete the business launch process first.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => navigate("/")} className="w-full">
                            Go to Onboarding
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-8 w-8 text-success" />
                                <h1 className="text-3xl font-bold gradient-text">Area Analysis Complete</h1>
                            </div>
                            <p className="text-muted-foreground">
                                Review the demographic and economic data extracted for your business location
                            </p>
                        </div>
                        <Button
                            onClick={() => navigate("/dashboard")}
                            size="lg"
                            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                        >
                            Go to Dashboard
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Standard Census Data */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5 text-muted-foreground" />
                            Standard Census Analysis (ACS 2022)
                        </CardTitle>
                        <CardDescription>Basic demographic and economic indicators</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <pre className="p-4 rounded-lg bg-background/50 border border-border overflow-x-auto text-xs">
                            {JSON.stringify(analysisData.data, null, 2)}
                        </pre>
                    </CardContent>
                </Card>

                {/* Detailed Analysis Data */}
                {analysisData.detailed_data && (
                    <>
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Database className="h-5 w-5 text-primary" />
                                    Detailed Residential Profile (ACS 2021)
                                </CardTitle>
                                <CardDescription>
                                    Ultra-local analysis including block-level data and derived statistics
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Location Info */}
                                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                                    <h3 className="font-semibold mb-3 text-primary">Location Details</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Area Name</p>
                                            <p className="font-medium">{analysisData.detailed_data.area_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">State FIPS</p>
                                            <p className="font-medium">{analysisData.detailed_data.fips_codes.state}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">County FIPS</p>
                                            <p className="font-medium">{analysisData.detailed_data.fips_codes.county}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Tract</p>
                                            <p className="font-medium">{analysisData.detailed_data.fips_codes.tract}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Block</p>
                                            <p className="font-medium">{analysisData.detailed_data.fips_codes.block}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Full Tract ID</p>
                                            <p className="font-medium text-xs">{analysisData.detailed_data.fips_codes.full_tract_id}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-muted-foreground">Full Block ID</p>
                                            <p className="font-medium text-xs">{analysisData.detailed_data.fips_codes.full_block_id}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Derived Statistics */}
                                {analysisData.detailed_data.derived_statistics && (
                                    <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                                        <h3 className="font-semibold mb-3 text-success">Key Market Indicators</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="p-3 rounded bg-background/50">
                                                <p className="text-xs text-muted-foreground">Poverty Rate</p>
                                                <p className="text-2xl font-bold text-success">
                                                    {analysisData.detailed_data.derived_statistics.poverty_rate}%
                                                </p>
                                            </div>
                                            <div className="p-3 rounded bg-background/50">
                                                <p className="text-xs text-muted-foreground">High Income HH</p>
                                                <p className="text-2xl font-bold text-success">
                                                    {analysisData.detailed_data.derived_statistics.high_income_households_rate.toFixed(1)}%
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    ({analysisData.detailed_data.derived_statistics.high_income_count.toLocaleString()} households)
                                                </p>
                                            </div>
                                            <div className="p-3 rounded bg-background/50">
                                                <p className="text-xs text-muted-foreground">Bachelor's+</p>
                                                <p className="text-2xl font-bold text-success">
                                                    {analysisData.detailed_data.derived_statistics.bachelor_plus_rate.toFixed(1)}%
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    ({analysisData.detailed_data.derived_statistics.bachelor_plus_count.toLocaleString()} people)
                                                </p>
                                            </div>
                                            <div className="p-3 rounded bg-background/50">
                                                <p className="text-xs text-muted-foreground">Renters</p>
                                                <p className="text-2xl font-bold text-success">
                                                    {analysisData.detailed_data.derived_statistics.renter_rate.toFixed(1)}%
                                                </p>
                                            </div>
                                            <div className="p-3 rounded bg-background/50">
                                                <p className="text-xs text-muted-foreground">Work From Home</p>
                                                <p className="text-2xl font-bold text-success">
                                                    {analysisData.detailed_data.derived_statistics.work_from_home_rate.toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Raw Detailed Data */}
                                <div>
                                    <h3 className="font-semibold mb-3">Complete Detailed Demographics</h3>
                                    <div className="p-4 rounded-lg bg-background/50 border border-border overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-2 px-2">Variable Code</th>
                                                    <th className="text-left py-2 px-2">Description</th>
                                                    <th className="text-right py-2 px-2">Value</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(analysisData.detailed_data.demographics_detailed).map(([code, data]) => (
                                                    <tr key={code} className="border-b border-border/50">
                                                        <td className="py-2 px-2 font-mono text-xs text-muted-foreground">{code}</td>
                                                        <td className="py-2 px-2">{data.label}</td>
                                                        <td className="py-2 px-2 text-right font-medium">
                                                            {typeof data.value === 'number' ? data.value.toLocaleString() : data.value || 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* JSON Debug */}
                                <details className="p-4 rounded-lg bg-background/50 border border-border">
                                    <summary className="cursor-pointer font-semibold mb-2">Raw JSON (Click to expand)</summary>
                                    <pre className="text-xs overflow-x-auto mt-2 p-2 rounded bg-background">
                                        {JSON.stringify(analysisData.detailed_data, null, 2)}
                                    </pre>
                                </details>
                            </CardContent>
                        </Card>
                    </>
                )}

                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="font-semibold text-lg mb-1">Ready to start your business?</h3>
                            <p className="text-sm text-muted-foreground">
                                All area data has been analyzed and saved. Proceed to your dashboard to begin operations.
                            </p>
                        </div>
                        <Button
                            onClick={() => navigate("/dashboard")}
                            size="lg"
                            className="bg-gradient-to-r from-success to-success/90 hover:from-success/90 hover:to-success/80 glow-primary"
                        >
                            Go to Dashboard
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AreaAnalysisDebug;
