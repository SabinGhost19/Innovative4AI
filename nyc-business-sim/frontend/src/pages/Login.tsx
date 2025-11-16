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
            // Navigate to dashboard - it will load the session
            navigate("/dashboard");
        } else {
            setError(result.error || "Login failed");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
            <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
                {/* Left side - Branding */}
                <div className="space-y-6 hidden md:block">
                    <div>
                        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Welcome Back
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Continue your NYC business simulation journey
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-4 rounded-lg bg-card border">
                            <Building2 className="w-6 h-6 text-primary mt-1" />
                            <div>
                                <h3 className="font-semibold">Pick Up Where You Left Off</h3>
                                <p className="text-sm text-muted-foreground">
                                    Your business simulation is saved and ready to continue
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 p-4 rounded-lg bg-card border">
                            <TrendingUp className="w-6 h-6 text-primary mt-1" />
                            <div>
                                <h3 className="font-semibold">Real-Time Market Data</h3>
                                <p className="text-sm text-muted-foreground">
                                    Experience realistic NYC business dynamics
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 p-4 rounded-lg bg-card border">
                            <Users className="w-6 h-6 text-primary mt-1" />
                            <div>
                                <h3 className="font-semibold">AI-Powered Simulation</h3>
                                <p className="text-sm text-muted-foreground">
                                    Smart agents analyze demographics and trends
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Login Form */}
                <Card className="shadow-2xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Login</CardTitle>
                        <CardDescription>
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

                        <div className="text-center text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <Button
                                variant="link"
                                className="p-0 h-auto"
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
