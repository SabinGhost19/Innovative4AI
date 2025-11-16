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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="max-w-5xl mx-auto space-y-6">

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
                <Card className="border-2 border-blue-500/20 bg-slate-900/50 backdrop-blur">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <User className="h-6 w-6 text-blue-400" />
                                <div>
                                    <CardTitle className="text-white">User Account</CardTitle>
                                    <CardDescription className="text-slate-400">Your simulation profile</CardDescription>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleEditUsername}
                                className="border-slate-700 hover:border-blue-500"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                                {data.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Username</p>
                                <p className="text-xl font-semibold text-white">{data.username}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Business Info Card */}
                <Card className="border-2 border-purple-500/20 bg-slate-900/50 backdrop-blur">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Building2 className="h-6 w-6 text-purple-400" />
                                <div>
                                    <CardTitle className="text-white">Business Details</CardTitle>
                                    <CardDescription className="text-slate-400">Your NYC business setup</CardDescription>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleEditBusiness}
                                className="border-slate-700 hover:border-purple-500"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <Briefcase className="h-4 w-4 text-purple-400" />
                                    <p className="text-sm text-slate-400">Business Name</p>
                                </div>
                                <p className="text-lg font-semibold text-white">{data.business.name}</p>
                            </div>

                            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <Building2 className="h-4 w-4 text-purple-400" />
                                    <p className="text-sm text-slate-400">Industry</p>
                                </div>
                                <Badge variant="secondary" className="text-sm">
                                    {data.business.industry}
                                </Badge>
                            </div>

                            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="h-4 w-4 text-green-400" />
                                    <p className="text-sm text-slate-400">Initial Budget</p>
                                </div>
                                <p className="text-2xl font-bold text-green-400">
                                    ${data.business.budget.toLocaleString()}
                                </p>
                            </div>

                            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="h-4 w-4 text-orange-400" />
                                    <p className="text-sm text-slate-400">Starting Month</p>
                                </div>
                                <p className="text-lg font-semibold text-white">January 2024</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Location Card */}
                <Card className="border-2 border-green-500/20 bg-slate-900/50 backdrop-blur">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MapPin className="h-6 w-6 text-green-400" />
                                <div>
                                    <CardTitle className="text-white">Business Location</CardTitle>
                                    <CardDescription className="text-slate-400">NYC area demographics</CardDescription>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleEditLocation}
                                className="border-slate-700 hover:border-green-500"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                            <div className="flex items-center gap-2 mb-3">
                                <Home className="h-4 w-4 text-green-400" />
                                <p className="text-sm text-slate-400">Address</p>
                            </div>
                            <p className="text-white font-medium">{data.business.location?.address || "N/A"}</p>
                            <p className="text-slate-400 text-sm mt-1">
                                {data.business.location?.neighborhood || "N/A"}
                            </p>
                            <div className="flex gap-2 mt-2 text-xs text-slate-500">
                                <span>Lat: {data.business.location?.lat.toFixed(4)}</span>
                                <span>•</span>
                                <span>Lng: {data.business.location?.lng.toFixed(4)}</span>
                            </div>
                        </div>

                        {/* Census Data Preview */}
                        {loadingCensus ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="h-6 w-6 animate-spin text-green-400" />
                                <span className="ml-2 text-slate-400">Loading area demographics...</span>
                            </div>
                        ) : censusData ? (
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-950/50 to-blue-900/30 border border-blue-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="h-4 w-4 text-blue-400" />
                                        <p className="text-xs text-blue-300">Population</p>
                                    </div>
                                    <p className="text-2xl font-bold text-white">
                                        {Number(censusData?.demographics_detailed?.B01001_001E?.value || 0).toLocaleString()}
                                    </p>
                                </div>

                                <div className="p-4 rounded-lg bg-gradient-to-br from-green-950/50 to-green-900/30 border border-green-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="h-4 w-4 text-green-400" />
                                        <p className="text-xs text-green-300">Median Income</p>
                                    </div>
                                    <p className="text-2xl font-bold text-white">
                                        ${Number(censusData?.demographics_detailed?.B19013_001E?.value || 0).toLocaleString()}
                                    </p>
                                </div>

                                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-950/50 to-purple-900/30 border border-purple-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="h-4 w-4 text-purple-400" />
                                        <p className="text-xs text-purple-300">High Income %</p>
                                    </div>
                                    <p className="text-2xl font-bold text-white">
                                        {(censusData?.derived_statistics?.high_income_households_rate * 100 || 0).toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                <Separator className="bg-slate-700" />

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-6">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => navigate("/register")}
                        disabled={loading}
                        className="border-slate-700 hover:border-slate-500 text-slate-300 w-full sm:w-auto"
                    >
                        <Edit className="h-5 w-5 mr-2" />
                        Go Back to Edit
                    </Button>

                    <Button
                        size="lg"
                        onClick={handleStartSimulation}
                        disabled={loading}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-lg px-12 py-6 w-full sm:w-auto shadow-lg shadow-green-500/50"
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

                <p className="text-center text-slate-500 text-sm pb-8">
                    By starting the simulation, your account and business will be created in the database
                </p>
            </div>
        </div>
    );
};

export default Overview;
