import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BusinessData } from "./Onboarding";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import OverviewTab from "@/components/dashboard/OverviewTab";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [currentMonth, setCurrentMonth] = useState(1);
  const [currentYear, setCurrentYear] = useState(2024);
  const [cashBalance, setCashBalance] = useState(0);
  const [isLoadingEvent, setIsLoadingEvent] = useState(false);
  const [lastEvent, setLastEvent] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem("businessData");
    if (!data) {
      navigate("/onboarding");
      return;
    }
    const business = JSON.parse(data);
    setBusinessData(business);
    setCashBalance(business.budget);
  }, [navigate]);

  const handleNextMonth = async () => {
    if (!businessData?.areaId) {
      toast({
        title: "Error",
        description: "No area data found. Please complete onboarding first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingEvent(true);

    try {
      const response = await fetch("http://localhost:8000/api/simulation/next-month", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          area_id: businessData.areaId,
          business_type: businessData.industry || businessData.name,
          current_month: currentMonth,
          current_year: currentYear,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate event");
      }

      const data = await response.json();

      if (data.success && data.event) {
        const event = data.event.event; // nested structure from agents-orchestrator
        setLastEvent(event);

        // Update month
        if (currentMonth === 12) {
          setCurrentMonth(1);
          setCurrentYear(currentYear + 1);
        } else {
          setCurrentMonth(currentMonth + 1);
        }

        // Show event notification
        toast({
          title: `🎲 ${event.nume_eveniment}`,
          description: `${event.descriere_scurta}\nImpact: ${event.impact_clienti_lunar > 0 ? '+' : ''}${event.impact_clienti_lunar}% clienți/lună`,
          duration: 8000,
        });

        // TODO: Apply event impact to simulation state
        console.log("Event generated:", event);

      } else {
        throw new Error(data.error || "Unknown error");
      }

    } catch (error: any) {
      console.error("Error generating event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate event for next month",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEvent(false);
    }
  };

  if (!businessData) {
    return null;
  }

  return (
    <DashboardLayout>
      <DashboardHeader
        businessName={businessData.name}
        currentMonth={currentMonth}
        cashBalance={cashBalance}
        notifications={5}
        onNextMonth={handleNextMonth}
        isLoadingNextMonth={isLoadingEvent}
      />
      <OverviewTab />
    </DashboardLayout>
  );
};

export default Dashboard;