import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BusinessSetup from "@/components/onboarding/BusinessSetup";
import LocationSelector from "@/components/onboarding/LocationSelector";
import Confirmation from "@/components/onboarding/Confirmation";

export type BusinessData = {
  name: string;
  industry: string;
  products: string[];
  budget: number;
  areaId?: number;
  location?: {
    lat: number;
    lng: number;
    address: string;
    neighborhood: string;
  };
};

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [businessData, setBusinessData] = useState<BusinessData>({
    name: "",
    industry: "",
    products: [],
    budget: 50000,
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    // Save business data to localStorage
    localStorage.setItem("businessData", JSON.stringify(businessData));
    navigate("/dashboard");
  };

  const updateBusinessData = (data: Partial<BusinessData>) => {
    setBusinessData({ ...businessData, ...data });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Step Indicators */}
          <div className="flex items-center justify-center mb-12 space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300
                  ${step === stepNum
                    ? "bg-gradient-to-br from-primary to-accent text-white scale-110 shadow-lg"
                    : step > stepNum
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                  }
                `}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-16 h-1 mx-2 rounded transition-all duration-300 ${step > stepNum ? "bg-success" : "bg-muted"
                    }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="animate-slide-in">
            {step === 1 && (
              <BusinessSetup
                businessData={businessData}
                updateBusinessData={updateBusinessData}
                onNext={handleNext}
              />
            )}
            {step === 2 && (
              <LocationSelector
                businessData={businessData}
                updateBusinessData={updateBusinessData}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {step === 3 && (
              <Confirmation
                businessData={businessData}
                onComplete={handleComplete}
                onBack={handleBack}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
