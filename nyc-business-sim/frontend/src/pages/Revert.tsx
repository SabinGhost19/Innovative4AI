import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Clock,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    AlertTriangle,
    ArrowLeft,
    Loader2,
    History,
    RotateCcw,
    Trash2,
    CheckCircle,
    XCircle,
    Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthlyState {
    month: number;
    year: number;
    revenue: number;
    profit: number;
    customers: number;
    cash_balance: number;
    created_at: string;
}

interface SessionData {
    session_id: string;
    current_month: number;
    current_year: number;
}

const Revert = () => {
    const navigate = useNavigate();
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [history, setHistory] = useState<MonthlyState[]>([]);
    const [loading, setLoading] = useState(true);
    const [reverting, setReverting] = useState(false);
    const [error, setError] = useState("");
    const [selectedMonth, setSelectedMonth] = useState<MonthlyState | null>(null);
    const [expandedMonth, setExpandedMonth] = useState<MonthlyState | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const timelineRef = useRef<HTMLDivElement>(null);
    const expandedCardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadSessionHistory();
    }, []);

    // Scroll to expanded card when it opens
    useEffect(() => {
        if (expandedMonth && expandedCardRef.current) {
            setTimeout(() => {
                expandedCardRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }, 100);
        }
    }, [expandedMonth]);

    const loadSessionHistory = async () => {
        setLoading(true);
        setError("");

        try {
            // Get session data from localStorage
            const sessionStr = localStorage.getItem("nyc_sim_session");
            if (!sessionStr) {
                setError("No active simulation session found");
                setLoading(false);
                return;
            }

            const session = JSON.parse(sessionStr);
            setSessionData(session);

            // Fetch history from backend
            const response = await fetch(
                `http://localhost:8000/api/simulation/session/${session.session_id}/history`
            );

            if (!response.ok) {
                throw new Error("Failed to load session history");
            }

            const result = await response.json();
            if (result.success) {
                setHistory(result.history);
            } else {
                throw new Error("No history data available");
            }
        } catch (err: any) {
            console.error("Error loading history:", err);
            setError(err.message || "Failed to load simulation history");
        } finally {
            setLoading(false);
        }
    };

    const handleRevertClick = (state: MonthlyState) => {
        // Can't revert to current month or future months
        if (!sessionData) return;

        const isCurrent =
            state.month === sessionData.current_month &&
            state.year === sessionData.current_year;

        if (isCurrent) {
            setError("You are already in this month");
            return;
        }

        setSelectedMonth(state);
        setShowConfirmDialog(true);
    };

    const executeRevert = async () => {
        if (!selectedMonth || !sessionData) return;

        setReverting(true);
        setError("");

        try {
            const response = await fetch(
                `http://localhost:8000/api/simulation/revert?` +
                `session_id=${sessionData.session_id}&` +
                `target_month=${selectedMonth.month}&` +
                `target_year=${selectedMonth.year}`,
                {
                    method: "POST",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to revert simulation");
            }

            const result = await response.json();

            if (result.success) {
                // Update session data in localStorage
                const updatedSession = {
                    ...sessionData,
                    current_month: selectedMonth.month,
                    current_year: selectedMonth.year,
                };
                localStorage.setItem("nyc_sim_session", JSON.stringify(updatedSession));

                // Clear any cached dashboard data and simulation outputs
                localStorage.removeItem("dashboard_cache");
                localStorage.removeItem("current_simulation_outputs");

                // Navigate back to dashboard with success message
                navigate("/dashboard", {
                    state: {
                        revertSuccess: true,
                        revertedTo: `Month ${selectedMonth.month}, ${selectedMonth.year}`,
                        deletedMonths: result.deleted_months,
                    },
                });
            } else {
                throw new Error("Revert operation failed");
            }
        } catch (err: any) {
            console.error("Error reverting simulation:", err);
            setError(err.message || "Failed to revert simulation");
        } finally {
            setReverting(false);
            setShowConfirmDialog(false);
        }
    };

    const getMonthName = (month: number): string => {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return months[month - 1] || "Unknown";
    };

    const isCurrentMonth = (state: MonthlyState): boolean => {
        if (!sessionData) return false;
        return state.month === sessionData.current_month && state.year === sessionData.current_year;
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Calculate Y position based on cash balance (normalized to 0-100 range)
    const getYPosition = (cashBalance: number): number => {
        if (history.length === 0) return 50;

        const allBalances = history.map(h => h.cash_balance);
        const minBalance = Math.min(...allBalances);
        const maxBalance = Math.max(...allBalances);
        const range = maxBalance - minBalance;

        if (range === 0) return 50; // All same value, put in middle

        // Normalize to 0-100, inverted (higher balance = lower Y position on screen)
        const normalized = ((cashBalance - minBalance) / range) * 80 + 10; // 10-90 range for padding
        return 100 - normalized; // Invert so higher values are at top
    };

    // Generate SVG path for the line chart
    const generatePath = (): string => {
        if (history.length === 0) return "";

        const width = 100; // percentage
        const step = width / (history.length - 1 || 1);

        const points = history.map((state, index) => {
            const x = index * step;
            const y = getYPosition(state.cash_balance);
            return `${x},${y}`;
        });

        return `M ${points.join(' L ')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-lg text-muted-foreground">Loading simulation history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate("/dashboard")}
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold flex items-center gap-3">
                                    <History className="h-8 w-8 text-primary" />
                                    Time Travel - Revert Simulation
                                </h1>
                                <p className="text-muted-foreground mt-1">
                                    Roll back to a previous month and continue from there
                                </p>
                            </div>
                        </div>
                    </div>

                    {sessionData && (
                        <Badge variant="outline" className="text-lg px-4 py-2">
                            <Clock className="h-4 w-4 mr-2" />
                            Current: Month {sessionData.current_month}, {sessionData.current_year}
                        </Badge>
                    )}
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* History Timeline */}
                {history.length === 0 ? (
                    <Card className="border-2">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <History className="h-16 w-16 text-muted-foreground mb-4" />
                            <p className="text-xl font-semibold text-muted-foreground">No History Available</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Start your simulation to build a history timeline
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Financial Journey Timeline</h2>
                            <p className="text-sm text-muted-foreground">
                                {history.length} month{history.length !== 1 ? 's' : ''} • Click any point to view details
                            </p>
                        </div>

                        {/* Chart Container */}
                        <Card className="border-0 bg-background overflow-hidden shadow-2xl">
                            <CardContent className="p-12">
                                <div className="relative w-full" style={{ height: '450px' }}>
                                    {/* Subtle Grid */}
                                    <svg className="absolute inset-0 w-full h-full opacity-[0.07]">
                                        {[20, 40, 60, 80].map((y) => (
                                            <line
                                                key={y}
                                                x1="0"
                                                y1={`${y}%`}
                                                x2="100%"
                                                y2={`${y}%`}
                                                stroke="currentColor"
                                                strokeWidth="1"
                                            />
                                        ))}
                                    </svg>

                                    {/* Main Chart SVG */}
                                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        {/* Gradient Definitions */}
                                        <defs>
                                            {/* Line Gradient - Sophisticated blues */}
                                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                                                <stop offset="50%" stopColor="#6366f1" stopOpacity="1" />
                                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="1" />
                                            </linearGradient>

                                            {/* Area Gradient - Ultra subtle */}
                                            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                                                <stop offset="50%" stopColor="#6366f1" stopOpacity="0.08" />
                                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
                                            </linearGradient>

                                            {/* Glow Filter */}
                                            <filter id="glow">
                                                <feGaussianBlur stdDeviation="0.8" result="coloredBlur" />
                                                <feMerge>
                                                    <feMergeNode in="coloredBlur" />
                                                    <feMergeNode in="SourceGraphic" />
                                                </feMerge>
                                            </filter>
                                        </defs>

                                        {/* Area under the line */}
                                        {history.length > 0 && (
                                            <path
                                                d={`${generatePath()} L ${((history.length - 1) * 100) / (history.length - 1 || 1)},100 L 0,100 Z`}
                                                fill="url(#areaGradient)"
                                            />
                                        )}

                                        {/* Main Line - Thinner and elegant */}
                                        <path
                                            d={generatePath()}
                                            fill="none"
                                            stroke="url(#lineGradient)"
                                            strokeWidth="0.6"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            filter="url(#glow)"
                                        />
                                    </svg>

                                    {/* Data Points - Minimal & Professional */}
                                    <div className="absolute inset-0 w-full h-full">
                                        {history.map((state, index) => {
                                            const isCurrent = isCurrentMonth(state);
                                            const isExpanded = expandedMonth?.month === state.month && expandedMonth?.year === state.year;
                                            const xPosition = (index * 100) / (history.length - 1 || 1);
                                            const yPosition = getYPosition(state.cash_balance);

                                            // Sophisticated color scheme
                                            const getPointColor = () => {
                                                if (isCurrent) return {
                                                    border: 'border-blue-500',
                                                    bg: 'bg-blue-500',
                                                    shadow: 'shadow-blue-500/40',
                                                    glow: 'bg-blue-400/30',
                                                    ring: 'ring-blue-500/20'
                                                };
                                                if (state.profit >= 0) return {
                                                    border: 'border-emerald-500',
                                                    bg: 'bg-emerald-500',
                                                    shadow: 'shadow-emerald-500/30',
                                                    glow: 'bg-emerald-400/20',
                                                    ring: 'ring-emerald-500/15'
                                                };
                                                return {
                                                    border: 'border-rose-500',
                                                    bg: 'bg-rose-500',
                                                    shadow: 'shadow-rose-500/30',
                                                    glow: 'bg-rose-400/20',
                                                    ring: 'ring-rose-500/15'
                                                };
                                            };

                                            const colors = getPointColor();

                                            return (
                                                <div
                                                    key={`${state.year}-${state.month}`}
                                                    className="absolute group"
                                                    style={{
                                                        left: `${xPosition}%`,
                                                        top: `${yPosition}%`,
                                                        transform: 'translate(-50%, -50%)',
                                                    }}
                                                >
                                                    <div
                                                        onClick={() => setExpandedMonth(isExpanded ? null : state)}
                                                        className="relative cursor-pointer"
                                                    >
                                                        {/* Animated pulse ring (only for current) */}
                                                        {isCurrent && (
                                                            <div className={cn(
                                                                "absolute inset-0 rounded-full animate-ping",
                                                                colors.glow
                                                            )}
                                                                style={{
                                                                    width: '40px',
                                                                    height: '40px',
                                                                    margin: '-20px',
                                                                    opacity: 0.6
                                                                }} />
                                                        )}

                                                        {/* Hover glow */}
                                                        <div className={cn(
                                                            "absolute inset-0 rounded-full transition-all duration-500 opacity-0 group-hover:opacity-100",
                                                            colors.glow,
                                                            "blur-md"
                                                        )}
                                                            style={{
                                                                width: '36px',
                                                                height: '36px',
                                                                margin: '-18px'
                                                            }} />

                                                        {/* Outer ring (on hover/expand) */}
                                                        <div className={cn(
                                                            "absolute inset-0 rounded-full transition-all duration-300",
                                                            "ring-0 group-hover:ring-8",
                                                            isExpanded && "ring-8",
                                                            colors.ring
                                                        )}
                                                            style={{
                                                                width: '16px',
                                                                height: '16px',
                                                                margin: '-8px'
                                                            }} />

                                                        {/* Main Point */}
                                                        <div className={cn(
                                                            "relative rounded-full transition-all duration-300",
                                                            "transform group-hover:scale-[1.8]",
                                                            isExpanded && "scale-[2]",
                                                            colors.bg,
                                                            "shadow-lg",
                                                            colors.shadow,
                                                            isCurrent ? "w-5 h-5" : "w-4 h-4"
                                                        )}>
                                                            {/* Inner highlight */}
                                                            <div className="absolute top-[3px] left-[3px] w-1.5 h-1.5 rounded-full bg-white/60" />
                                                        </div>

                                                        {/* Minimal hover tooltip */}
                                                        <div className={cn(
                                                            "absolute left-1/2 -translate-x-1/2 bottom-full mb-4",
                                                            "opacity-0 group-hover:opacity-100 transition-all duration-200",
                                                            "pointer-events-none whitespace-nowrap z-50",
                                                            "transform group-hover:translate-y-0 translate-y-1"
                                                        )}>
                                                            <div className="relative">
                                                                <div className="bg-slate-900/95 dark:bg-slate-100/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-2xl border border-white/10">
                                                                    <p className="text-xs font-bold text-white dark:text-slate-900">
                                                                        {getMonthName(state.month)} {state.year}
                                                                    </p>
                                                                    <p className="text-xs text-slate-300 dark:text-slate-600 font-medium">
                                                                        {formatCurrency(state.cash_balance)}
                                                                    </p>
                                                                </div>
                                                                {/* Tooltip arrow */}
                                                                <div className="absolute left-1/2 -translate-x-1/2 top-full">
                                                                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900/95 dark:border-t-slate-100/95" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Current badge - minimal */}
                                                        {isCurrent && !isExpanded && (
                                                            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3">
                                                                <div className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap">
                                                                    NOW
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Month Label - Refined */}
                                                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-10 text-center pointer-events-none">
                                                        <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap tracking-wide">
                                                            {getMonthName(state.month).substring(0, 3).toUpperCase()}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium">
                                                            '{state.year.toString().slice(-2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Modern Legend */}
                                <div className="flex items-center justify-center gap-8 mt-10 pt-8 border-t border-slate-200/60 dark:border-slate-800/60">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40" />
                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Profitable</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-4 h-4 rounded-full bg-rose-500 shadow-sm shadow-rose-500/40" />
                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Loss</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-5 h-5 rounded-full bg-blue-500 shadow-md shadow-blue-500/40 relative">
                                            <div className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping" />
                                        </div>
                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Current</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Expanded Details Card */}
                        {expandedMonth && (
                            <div
                                ref={expandedCardRef}
                                className={cn(
                                    "transition-all duration-500 ease-out",
                                    "border-4 border-primary rounded-2xl bg-card shadow-2xl shadow-primary/20",
                                    "animate-in zoom-in-95 fade-in-0"
                                )}
                            >
                                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-t-2xl border-b-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-16 w-16 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl shadow-lg">
                                                {expandedMonth.month}
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-bold">
                                                    {getMonthName(expandedMonth.month)} {expandedMonth.year}
                                                </h2>
                                                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                                                    <Clock className="h-4 w-4" />
                                                    {isCurrentMonth(expandedMonth) ? "Current Month" : `Month ${expandedMonth.month} of Simulation`}
                                                </p>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => setExpandedMonth(null)}
                                            variant="outline"
                                            size="sm"
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Collapse
                                        </Button>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Financial Metrics Grid */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <DollarSign className="h-5 w-5 text-primary" />
                                            Financial Performance
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Revenue */}
                                            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/30">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="p-3 bg-blue-500/20 rounded-lg">
                                                            <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                                                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                                                {formatCurrency(expandedMonth.revenue)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">Gross income for the month</p>
                                                </CardContent>
                                            </Card>

                                            {/* Profit */}
                                            <Card className={cn(
                                                "border-2",
                                                expandedMonth.profit >= 0
                                                    ? "bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/30"
                                                    : "bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/30"
                                            )}>
                                                <CardContent className="p-6">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className={cn(
                                                            "p-3 rounded-lg",
                                                            expandedMonth.profit >= 0 ? "bg-green-500/20" : "bg-red-500/20"
                                                        )}>
                                                            {expandedMonth.profit >= 0 ? (
                                                                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                                                            ) : (
                                                                <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                                                            <p className={cn(
                                                                "text-3xl font-bold",
                                                                expandedMonth.profit >= 0
                                                                    ? "text-green-600 dark:text-green-400"
                                                                    : "text-red-600 dark:text-red-400"
                                                            )}>
                                                                {formatCurrency(expandedMonth.profit)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {expandedMonth.profit >= 0 ? "Positive" : "Negative"} net income
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            {/* Customers */}
                                            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/30">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="p-3 bg-purple-500/20 rounded-lg">
                                                            <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-muted-foreground">Customers Served</p>
                                                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                                                {expandedMonth.customers.toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">Total customer count</p>
                                                </CardContent>
                                            </Card>

                                            {/* Cash Balance */}
                                            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/30">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="p-3 bg-amber-500/20 rounded-lg">
                                                            <Wallet className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-muted-foreground">Cash Balance</p>
                                                            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                                                                {formatCurrency(expandedMonth.cash_balance)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">Available funds</p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between pt-4 border-t-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>Recorded on {new Date(expandedMonth.created_at).toLocaleString()}</span>
                                        </div>

                                        {isCurrentMonth(expandedMonth) ? (
                                            <Badge className="bg-primary text-lg px-4 py-2">
                                                <CheckCircle className="h-5 w-5 mr-2" />
                                                You are currently here
                                            </Badge>
                                        ) : (
                                            <div className="flex gap-3">
                                                <Button
                                                    onClick={() => setExpandedMonth(null)}
                                                    variant="outline"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setExpandedMonth(null);
                                                        handleRevertClick(expandedMonth);
                                                    }}
                                                    variant="destructive"
                                                    size="lg"
                                                    disabled={reverting}
                                                    className="font-semibold"
                                                >
                                                    <RotateCcw className="h-5 w-5 mr-2" />
                                                    Revert to This Month
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            Confirm Destructive Action
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                            {selectedMonth && sessionData && (
                                <>
                                    <p className="text-base">
                                        You are about to revert your simulation to{" "}
                                        <strong className="text-foreground">
                                            {getMonthName(selectedMonth.month)} {selectedMonth.year}
                                        </strong>.
                                    </p>
                                    <p className="text-base font-semibold text-destructive">
                                        This will permanently delete all data from months{" "}
                                        {selectedMonth.month + 1} through {sessionData.current_month}.
                                    </p>
                                    <p className="text-sm">
                                        This action cannot be undone. Are you absolutely sure?
                                    </p>
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={reverting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeRevert}
                            disabled={reverting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {reverting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Reverting...
                                </>
                            ) : (
                                <>
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Yes, Revert Now
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Revert;
