import { Button } from "@/components/ui/button";
import { BusinessData } from "@/pages/Onboarding";
import { Check, MapPin, DollarSign, Store, Package } from "lucide-react";

type Props = {
  businessData: BusinessData;
  onComplete: () => void;
  onBack: () => void;
};

const Confirmation = ({ businessData, onComplete, onBack }: Props) => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-success to-success/80 text-white mb-4">
          <Check className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-bold">Ready to Launch!</h2>
        <p className="text-muted-foreground">Review your business setup before we begin</p>
      </div>

      <div className="glass-card p-8 rounded-2xl space-y-6">
        {/* Business Overview */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold gradient-text">{businessData.name}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Industry */}
            <div className="p-6 rounded-xl bg-background/50 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Industry</p>
                  <p className="font-semibold capitalize">{businessData.industry.replace(/_/g, ' ')}</p>
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="p-6 rounded-xl bg-background/50 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Initial Budget</p>
                  <p className="font-semibold text-success">${businessData.budget.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Location */}
            {businessData.location && (
              <div className="p-6 rounded-xl bg-background/50 border border-border md:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold">{businessData.location.neighborhood}</p>
                    <p className="text-sm text-muted-foreground">{businessData.location.address}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Products */}
            <div className="p-6 rounded-xl bg-background/50 border border-border md:col-span-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-3">Products/Services</p>
                  <div className="flex flex-wrap gap-2">
                    {businessData.products.map((product) => (
                      <span
                        key={product}
                        className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/20"
                      >
                        {product}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
          <h4 className="font-semibold mb-3">What happens next?</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>Your business will be initialized with your chosen settings</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>You'll start with Month 1 and can make strategic decisions</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>Run simulations to see how your business performs</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>Receive feedback from AI competitors, customers, and employees</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            className="flex-1 glass-button"
          >
            Back
          </Button>
          <Button
            onClick={onComplete}
            size="lg"
            className="flex-1 bg-gradient-to-r from-success to-success/90 hover:from-success/90 hover:to-success/80 glow-primary"
          >
            Launch My Business
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
