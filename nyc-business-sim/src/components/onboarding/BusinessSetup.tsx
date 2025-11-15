import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { BusinessData } from "@/pages/Onboarding";
import { Store, Coffee, Utensils, Scissors, Dumbbell, ShoppingBag } from "lucide-react";

const industries = [
  { id: "coffee_shop", name: "Coffee Shop", icon: Coffee, products: ["Espresso", "Latte", "Cappuccino", "Pastries", "Sandwiches"] },
  { id: "restaurant", name: "Restaurant", icon: Utensils, products: ["Appetizers", "Main Courses", "Desserts", "Beverages", "Specials"] },
  { id: "retail", name: "Retail Store", icon: ShoppingBag, products: ["Clothing", "Accessories", "Electronics", "Home Goods", "Beauty"] },
  { id: "barbershop", name: "Barbershop", icon: Scissors, products: ["Haircut", "Beard Trim", "Shave", "Hair Color", "Styling"] },
  { id: "gym", name: "Fitness Center", icon: Dumbbell, products: ["Monthly Membership", "Personal Training", "Classes", "Day Pass", "Equipment Rental"] },
  { id: "bakery", name: "Bakery", icon: Store, products: ["Bread", "Cakes", "Cookies", "Pastries", "Custom Orders"] },
];

type Props = {
  businessData: BusinessData;
  updateBusinessData: (data: Partial<BusinessData>) => void;
  onNext: () => void;
};

const BusinessSetup = ({ businessData, updateBusinessData, onNext }: Props) => {
  const [selectedIndustry, setSelectedIndustry] = useState(businessData.industry || "");
  const [businessName, setBusinessName] = useState(businessData.name || "");
  const [budget, setBudget] = useState(businessData.budget || 50000);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(businessData.products || []);

  const handleIndustrySelect = (industryId: string) => {
    setSelectedIndustry(industryId);
    setSelectedProducts([]);
  };

  const toggleProduct = (product: string) => {
    if (selectedProducts.includes(product)) {
      setSelectedProducts(selectedProducts.filter(p => p !== product));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const handleNext = () => {
    if (businessName && selectedIndustry && selectedProducts.length > 0) {
      updateBusinessData({
        name: businessName,
        industry: selectedIndustry,
        products: selectedProducts,
        budget,
      });
      onNext();
    }
  };

  const currentIndustry = industries.find(i => i.id === selectedIndustry);
  const canProceed = businessName && selectedIndustry && selectedProducts.length > 0;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Define Your Business</h2>
        <p className="text-muted-foreground">Let's set up your entrepreneurial venture</p>
      </div>

      <div className="glass-card p-8 rounded-2xl space-y-8">
        {/* Business Name */}
        <div className="space-y-3">
          <Label htmlFor="businessName" className="text-lg font-semibold">Business Name</Label>
          <Input
            id="businessName"
            placeholder="Enter your business name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="h-12 text-lg bg-background/50"
          />
        </div>

        {/* Industry Selection */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">Select Industry</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {industries.map((industry) => {
              const Icon = industry.icon;
              return (
                <button
                  key={industry.id}
                  onClick={() => handleIndustrySelect(industry.id)}
                  className={`
                    p-6 rounded-xl border-2 transition-all duration-300 group
                    ${selectedIndustry === industry.id 
                      ? "border-primary bg-primary/10 shadow-lg scale-105" 
                      : "border-border bg-background/50 hover:border-primary/50 hover:bg-primary/5"
                    }
                  `}
                >
                  <Icon className={`h-8 w-8 mx-auto mb-3 transition-colors ${
                    selectedIndustry === industry.id ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                  }`} />
                  <p className="font-medium text-sm">{industry.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Selection */}
        {currentIndustry && (
          <div className="space-y-4 animate-slide-in">
            <Label className="text-lg font-semibold">Select Products/Services</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {currentIndustry.products.map((product) => (
                <button
                  key={product}
                  onClick={() => toggleProduct(product)}
                  className={`
                    px-4 py-3 rounded-lg border transition-all duration-200 text-sm font-medium
                    ${selectedProducts.includes(product)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background/50 hover:border-primary/50"
                    }
                  `}
                >
                  {product}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Budget Slider */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-lg font-semibold">Initial Budget</Label>
            <span className="text-2xl font-bold text-primary">
              ${budget.toLocaleString()}
            </span>
          </div>
          <Slider
            value={[budget]}
            onValueChange={([value]) => setBudget(value)}
            min={10000}
            max={200000}
            step={5000}
            className="py-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>$10,000</span>
            <span>$200,000</span>
          </div>
        </div>

        {/* Next Button */}
        <Button 
          onClick={handleNext}
          disabled={!canProceed}
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
        >
          Continue to Location
        </Button>
      </div>
    </div>
  );
};

export default BusinessSetup;
