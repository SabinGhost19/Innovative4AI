import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BusinessData } from "@/pages/Onboarding";
import { MapPin } from "lucide-react";
import InteractiveMap from "./InteractiveMap";

type Props = {
  businessData: BusinessData;
  updateBusinessData: (data: Partial<BusinessData>) => void;
  onNext: () => void;
  onBack: () => void;
};

const LocationSelector = ({ businessData, updateBusinessData, onNext, onBack }: Props) => {
  const [selectedLocation, setSelectedLocation] = useState(businessData.location);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const handleMapLocationSelect = (location: {
    lat: number;
    lng: number;
    address?: string;
    neighborhood?: string;
  }) => {
    const fullLocation = {
      lat: location.lat,
      lng: location.lng,
      address: location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
      neighborhood: location.neighborhood || 'New York',
    };
    setSelectedLocation(fullLocation);
  };

  const handleNext = () => {
    if (selectedLocation) {
      updateBusinessData({ location: selectedLocation });
    }
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Choose Your Location</h2>
        <p className="text-muted-foreground">Select a strategic spot in New York City</p>
      </div>

      <div className="glass-card p-8 rounded-2xl space-y-8">
        {/* Interactive Google Map */}
        <div className="space-y-4">
          <InteractiveMap
            onLocationSelect={handleMapLocationSelect}
            selectedLocation={selectedLocation}
            apiKey={apiKey}
          />
          {selectedLocation && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">Selected Location</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedLocation.address || `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            className="flex-1 glass-button"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            size="lg"
            className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
          >
            Continue to Review
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;
