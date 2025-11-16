import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import BusinessSetup from "@/components/onboarding/BusinessSetup";
import LocationSelector from "@/components/onboarding/LocationSelector";
import { BusinessData } from "./Onboarding";
import { checkUsernameAvailability } from "@/lib/auth";

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<"username" | "business" | "location">("username");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [businessData, setBusinessData] = useState<BusinessData>({
        name: "",
        industry: "",
        products: [],
        budget: 50000,
    });

    useEffect(() => {
        // Check if resuming registration
        const savedStep = localStorage.getItem("register_step");
        const savedUsername = localStorage.getItem("temp_username");
        const savedBusiness = localStorage.getItem("temp_businessData");

        if (savedStep && savedUsername) {
            setUsername(savedUsername);
            if (savedBusiness) {
                setBusinessData(JSON.parse(savedBusiness));
            }
            setStep(savedStep as "username" | "business" | "location");
            // Clear the step flag
            localStorage.removeItem("register_step");
        }
    }, []);

    const handleUsernameNext = async () => {
        if (!username.trim()) {
            setError("Please enter a username");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Check if username is available
            const result = await checkUsernameAvailability(username.trim());

            if (!result.available) {
                setError(result.error || "Username already taken. Please choose another.");
                setLoading(false);
                return;
            }

            // Save username to temp storage (not in DB yet!)
            localStorage.setItem("temp_username", username.trim());

            // Move to business setup
            setStep("business");
        } catch (err) {
            setError("Failed to validate username");
        } finally {
            setLoading(false);
        }
    };

    const handleBusinessNext = () => {
        // Save business data to temp storage
        localStorage.setItem("temp_businessData", JSON.stringify(businessData));
        setStep("location");
    };

    const updateBusinessData = (data: Partial<BusinessData>) => {
        setBusinessData(prev => {
            const updated = { ...prev, ...data };
            // If we're updating location in the last step, save it immediately
            if (data.location && step === "location") {
                console.log("📍 Location updated and saved:", data.location);
                localStorage.setItem("temp_businessData", JSON.stringify(updated));
            }
            return updated;
        });
    };

    const handleLocationComplete = () => {
        // Data is already saved by updateBusinessData when location is selected
        console.log("✅ Location step complete, navigating to overview");
        console.log("📦 Final businessData:", businessData);

        // Navigate to overview page for review
        navigate("/overview");
    };

    if (step === "username") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-2xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            NYC Business Simulator
                        </CardTitle>
                        <CardDescription className="text-center text-base">
                            Create your account to start simulating
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleUsernameNext()}
                                disabled={loading}
                            />
                        </div>

                        <Button
                            onClick={handleUsernameNext}
                            disabled={loading}
                            className="w-full"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Validating...
                                </>
                            ) : (
                                "Continue"
                            )}
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Button
                                variant="link"
                                className="p-0 h-auto"
                                onClick={() => navigate("/login")}
                            >
                                Login here
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (step === "business") {
        return (
            <div className="min-h-screen bg-background">
                <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                        style={{ width: "50%" }}
                    />
                </div>

                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8 text-center">
                            <p className="text-sm text-muted-foreground">
                                Welcome, <span className="font-semibold">{username}</span>!
                            </p>
                        </div>

                        <BusinessSetup
                            businessData={businessData}
                            updateBusinessData={updateBusinessData}
                            onNext={handleBusinessNext}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Location step
    return (
        <div className="min-h-screen bg-background">
            <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
                <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{ width: "100%" }}
                />
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <LocationSelector
                        businessData={businessData}
                        updateBusinessData={updateBusinessData}
                        onNext={handleLocationComplete}
                        onBack={() => setStep("business")}
                    />
                </div>
            </div>
        </div>
    );
};

export default Register;
