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

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              Raw API Response (Debug)
            </CardTitle>
            <CardDescription>Complete JSON data from Census API</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="p-4 rounded-lg bg-background/50 border border-border overflow-x-auto text-xs">
              {JSON.stringify(analysisData, null, 2)}
            </pre>
          </CardContent>
        </Card>

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
