import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Overview from "./pages/Overview";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Competitors from "./pages/Competitors";
import Reports from "./pages/Reports";
import Revert from "./pages/Revert";
import AreaAnalysisDebug from "./pages/AreaAnalysisDebug";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/area-analysis" element={<AreaAnalysisDebug />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/competitors" element={<Competitors />} />
          <Route path="/dashboard/reports" element={<Reports />} />
          <Route path="/dashboard/revert" element={<Revert />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
