import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ReportsTab from "@/components/dashboard/ReportsTab";

const Reports = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const data = localStorage.getItem("businessData");
        if (!data) {
            navigate("/onboarding");
        }
    }, [navigate]);

    return (
        <DashboardLayout>
            <DashboardHeader
                businessName="Your Business"
                currentMonth={1}
                cashBalance={50000}
                notifications={5}
            />
            <ReportsTab />
        </DashboardLayout>
    );
};

export default Reports;
