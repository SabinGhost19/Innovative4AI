import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Building2, TrendingUp, Users } from "lucide-react";
import { login as loginUser } from "@/lib/auth";

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        if (!username.trim()) {
            setError("Please enter your username");
            return;
        }

        setLoading(true);
        setError("");

        const result = await loginUser(username.trim());

        setLoading(false);

        if (result.success) {
            // Check if user has an active session
            if (result.session) {
                // User has session - go to dashboard
                navigate("/dashboard");
            } else {
                // User exists but no session - go to overview to start simulation
                navigate("/overview");
            }
        } else {
            setError(result.error || "Login failed");
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4">
            {/* Video Background */}
            <div className="fixed inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover blur-sm scale-105"
                    style={{ filter: 'blur(8px) brightness(0.3)' }}
                >
                    <source src="/bg2.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
                {/* Left side - Branding */}
                <div className="space-y-6 hidden md:block">
                    <div>
                        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Welcome Back
                        </h1>
                        <p className="text-xl text-white/70">
                            Continue your NYC business simulation journey
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-4 rounded-lg backdrop-blur-xl bg-black/15 border border-white/10">
                            <Building2 className="w-6 h-6 text-primary mt-1" />
                            <div>
                                <h3 className="font-semibold text-white">Pick Up Where You Left Off</h3>
                                <p className="text-sm text-white/60">
                                    Your business simulation is saved and ready to continue
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 p-4 rounded-lg backdrop-blur-xl bg-black/15 border border-white/10">
                            <TrendingUp className="w-6 h-6 text-primary mt-1" />
                            <div>
                                <h3 className="font-semibold text-white">Real-Time Market Data</h3>
                                <p className="text-sm text-white/60">
                                    Experience realistic NYC business dynamics
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 p-4 rounded-lg backdrop-blur-xl bg-black/15 border border-white/10">
                            <Users className="w-6 h-6 text-primary mt-1" />
                            <div>
                                <h3 className="font-semibold text-white">AI-Powered Simulation</h3>
                                <p className="text-sm text-white/60">
                                    Smart agents analyze demographics and trends
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Login Form */}
                <Card className="shadow-2xl backdrop-blur-xl bg-black/20 border-white/10">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-white">Login</CardTitle>
                        <CardDescription className="text-white/70">
                            Enter your username to access your simulation
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
                                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                                disabled={loading}
                                autoFocus
                            />
                        </div>

                        <Button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Logging in...
                                </>
                            ) : (
                                "Login"
                            )}
                        </Button>

                        <div className="text-center text-sm text-white/60">
                            Don't have an account?{" "}
                            <Button
                                variant="link"
                                className="p-0 h-auto text-primary hover:text-primary/80"
                                onClick={() => navigate("/register")}
                            >
                                Register here
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Login;
