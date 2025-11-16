import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
    MapPin,
    Building2,
    DollarSign,
    User,
    Edit,
    Loader2,
    CheckCircle2,
    TrendingUp,
    Users,
    Home,
    Briefcase
} from "lucide-react";
import { register as registerUser, createSession, cleanupTempRegistration } from "@/lib/auth";
import { BusinessData } from "./Onboarding";

interface RegistrationData {
    username: string;
    business: BusinessData;
}

const Overview = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<RegistrationData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [censusData, setCensusData] = useState<any>(null);
    const [loadingCensus, setLoadingCensus] = useState(false);

    useEffect(() => {
        // Load registration data from localStorage
        const username = localStorage.getItem("temp_username");
        const businessDataStr = localStorage.getItem("temp_businessData");

        console.log("📋 Overview loaded - temp_username:", username);
        console.log("📋 Overview loaded - temp_businessData:", businessDataStr);

        if (!username || !businessDataStr) {
            // Missing data - redirect to register
            navigate("/register");
            return;
        }

        const businessData = JSON.parse(businessDataStr);
        console.log("📦 Parsed business data:", businessData);
        console.log("📍 Location data:", businessData.location);

        setData({
            username,
            business: businessData,
        });

        // Fetch census data preview if we have location
        if (businessData.areaId) {
            fetchCensusPreview(businessData.areaId);
        }
    }, [navigate]);

    const fetchCensusPreview = async (areaId: number) => {
        setLoadingCensus(true);
        try {
            const response = await fetch(`http://localhost:8000/api/get-area/${areaId}`);
            if (response.ok) {
                const result = await response.json();
                setCensusData(result.detailed_data);
            }
        } catch (error) {
            console.error("Error fetching census data:", error);
        } finally {
            setLoadingCensus(false);
        }
    };

    const handleStartSimulation = async () => {
        if (!data) return;

        setLoading(true);
        setError("");

        try {
            // Step 1: Launch business to get area_id
            console.log("🚀 Step 1: Launching business to get area_id...");
            const launchResponse = await fetch("http://localhost:8000/api/launch-business", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    latitude: data.business.location?.lat || 0,
                    longitude: data.business.location?.lng || 0,
                    business_name: data.business.name,
                    industry: data.business.industry,
                }),
            });

            if (!launchResponse.ok) {
                const errorData = await launchResponse.json();
                throw new Error(errorData.detail || "Failed to analyze location");
            }

            const launchResult = await launchResponse.json();
            console.log("✅ Launch result:", launchResult);

            if (!launchResult.area_id) {
                throw new Error("No area_id returned from backend");
            }

            // Step 2: Register user in database
            console.log("🚀 Step 2: Registering user...");
            const registerResult = await registerUser(data.username);

            if (!registerResult.success) {
                setError(registerResult.error || "Failed to create user");
                setLoading(false);
                return;
            }

            const userId = registerResult.user!.user_id;
            console.log("✅ User registered:", userId);

            // Step 3: Create simulation session
            console.log("🚀 Step 3: Creating simulation session...");
            const sessionResult = await createSession(
                userId,
                data.business.name,
                data.business.industry,
                data.business.industry,
                {
                    address: data.business.location?.address || "",
                    neighborhood: data.business.location?.neighborhood || "",
                    county: "New York County",
                    lat: data.business.location?.lat || 0,
                    lng: data.business.location?.lng || 0,
                },
                data.business.budget
            );

            if (!sessionResult.success) {
                setError("Failed to create simulation session");
                setLoading(false);
                return;
            }
            console.log("✅ Session created:", sessionResult.session?.session_id);

            // Step 4: Clean up temporary localStorage data
            cleanupTempRegistration();

            // Step 5: Store business data WITH areaId for dashboard
            const businessDataWithAreaId = {
                ...data.business,
                areaId: launchResult.area_id,
            };
            localStorage.setItem("businessData", JSON.stringify(businessDataWithAreaId));
            console.log("✅ Business data saved with areaId:", launchResult.area_id);

            // Step 6: Navigate to dashboard
            navigate("/dashboard");

        } catch (err: any) {
            console.error("Error starting simulation:", err);
            setError(err.message || "An unexpected error occurred");
            setLoading(false);
        }
    };

    const handleEditUsername = () => {
        navigate("/register");
    };

    const handleEditBusiness = () => {
        // Navigate back to register but skip to business step
        localStorage.setItem("register_step", "business");
        navigate("/register");
    };

    const handleEditLocation = () => {
        // Navigate back to register but skip to location step
        localStorage.setItem("register_step", "location");
        navigate("/register");
    };

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            {/* Video Background */}
            <div className="fixed inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover blur-sm scale-105"
                    style={{ filter: 'blur(8px) brightness(0.5)' }}
                >
                    <source src="/bg2.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-5xl mx-auto space-y-6 p-6">

                {/* Header */}
                <div className="text-center space-y-2 py-8">
                    <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
                        <CheckCircle2 className="h-10 w-10 text-green-500" />
                        Review Your Simulation Setup
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Review all details before starting your NYC business simulation
                    </p>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* User Info Card */}
                <Card className="border border-white/10 backdrop-blur-xl bg-black/30 shadow-2xl">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <User className="h-6 w-6 text-primary" />
                                <div>
                                    <CardTitle className="text-white">User Account</CardTitle>
                                    <CardDescription className="text-white/60">Your simulation profile</CardDescription>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleEditUsername}
                                className="border-white/20 hover:border-primary/50 text-white hover:bg-primary/10"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-black font-bold text-xl">
                                {data.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm text-white/50">Username</p>
                                <p className="text-xl font-semibold text-white">{data.username}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Business Info Card */}
                <Card className="border border-white/10 backdrop-blur-xl bg-black/30 shadow-2xl">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Building2 className="h-6 w-6 text-primary" />
                                <div>
                                    <CardTitle className="text-white">Business Details</CardTitle>
                                    <CardDescription className="text-white/60">Your NYC business setup</CardDescription>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleEditBusiness}
                                className="border-white/20 hover:border-primary/50 text-white hover:bg-primary/10"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Briefcase className="h-4 w-4 text-primary" />
                                    <p className="text-sm text-white/50">Business Name</p>
                                </div>
                                <p className="text-lg font-semibold text-white">{data.business.name}</p>
                            </div>

                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Building2 className="h-4 w-4 text-primary" />
                                    <p className="text-sm text-white/50">Industry</p>
                                </div>
                                <Badge variant="secondary" className="text-sm bg-primary/20 text-primary border-primary/30">
                                    {data.business.industry}
                                </Badge>
                            </div>

                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="h-4 w-4 text-primary" />
                                    <p className="text-sm text-white/50">Initial Budget</p>
                                </div>
                                <p className="text-2xl font-bold text-primary">
                                    ${data.business.budget.toLocaleString()}
                                </p>
                            </div>

                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="h-4 w-4 text-accent" />
                                    <p className="text-sm text-white/50">Starting Month</p>
                                </div>
                                <p className="text-lg font-semibold text-white">January 2024</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Location Card */}
                <Card className="border border-white/10 backdrop-blur-xl bg-black/30 shadow-2xl">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MapPin className="h-6 w-6 text-primary" />
                                <div>
                                    <CardTitle className="text-white">Business Location</CardTitle>
                                    <CardDescription className="text-white/60">NYC area demographics</CardDescription>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleEditLocation}
                                className="border-white/20 hover:border-primary/50 text-white hover:bg-primary/10"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2 mb-3">
                                <Home className="h-4 w-4 text-primary" />
                                <p className="text-sm text-white/50">Address</p>
                            </div>
                            <p className="text-white font-medium">{data.business.location?.address || "N/A"}</p>
                            <p className="text-white/60 text-sm mt-1">
                                {data.business.location?.neighborhood || "N/A"}
                            </p>
                            <div className="flex gap-2 mt-2 text-xs text-white/40">
                                <span>Lat: {data.business.location?.lat.toFixed(4)}</span>
                                <span>•</span>
                                <span>Lng: {data.business.location?.lng.toFixed(4)}</span>
                            </div>
                        </div>

                        {/* Census Data Preview */}
                        {loadingCensus ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <span className="ml-2 text-white/60">Loading area demographics...</span>
                            </div>
                        ) : censusData ? (
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="h-4 w-4 text-primary" />
                                        <p className="text-xs text-primary/80">Population</p>
                                    </div>
                                    <p className="text-2xl font-bold text-white">
                                        {Number(censusData?.demographics_detailed?.B01001_001E?.value || 0).toLocaleString()}
                                    </p>
                                </div>

                                <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="h-4 w-4 text-accent" />
                                        <p className="text-xs text-accent/80">Median Income</p>
                                    </div>
                                    <p className="text-2xl font-bold text-white">
                                        ${Number(censusData?.demographics_detailed?.B19013_001E?.value || 0).toLocaleString()}
                                    </p>
                                </div>

                                <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="h-4 w-4 text-primary" />
                                        <p className="text-xs text-primary/80">High Income %</p>
                                    </div>
                                    <p className="text-2xl font-bold text-white">
                                        {(censusData?.derived_statistics?.high_income_households_rate * 100 || 0).toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                <Separator className="bg-white/20" />

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-6">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => navigate("/register")}
                        disabled={loading}
                        className="border-white/20 hover:border-white/40 text-white hover:bg-white/5 w-full sm:w-auto backdrop-blur-md"
                    >
                        <Edit className="h-5 w-5 mr-2" />
                        Go Back to Edit
                    </Button>

                    <Button
                        size="lg"
                        onClick={handleStartSimulation}
                        disabled={loading}
                        className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-black font-bold text-lg px-12 py-6 w-full sm:w-auto shadow-lg shadow-primary/30"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                                Creating Simulation...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-6 w-6 mr-3" />
                                START SIMULATION
                            </>
                        )}
                    </Button>
                </div>

                <p className="text-center text-white/40 text-sm pb-8">
                    By starting the simulation, your account and business will be created in the database
                </p>
            </div>
        </div>
    );
};

export default Overview;
