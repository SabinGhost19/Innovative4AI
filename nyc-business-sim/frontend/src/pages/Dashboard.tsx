import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BusinessData } from "./Onboarding";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import OverviewTab from "@/components/dashboard/OverviewTab";

const Dashboard = () => {
  const navigate = useNavigate();
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [currentMonth, setCurrentMonth] = useState(1);
  const [cashBalance, setCashBalance] = useState(0);

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
      />
      <OverviewTab />
    </DashboardLayout>
  );
};

export default Dashboard;
