import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CompetitorsTab from "@/components/dashboard/CompetitorsTab";

const Competitors = () => {
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
            <CompetitorsTab />
        </DashboardLayout>
    );
};

export default Competitors;
