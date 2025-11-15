import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BusinessData } from "@/pages/Onboarding";
import { MapPin, Sparkles } from "lucide-react";
import InteractiveMap from "./InteractiveMap";
import RecommendationsDisplay from "./RecommendationsDisplay";
import { useToast } from "@/hooks/use-toast";

type Props = {
  businessData: BusinessData;
  updateBusinessData: (data: Partial<BusinessData>) => void;
  onNext: () => void;
  onBack: () => void;
};

const LocationSelector = ({ businessData, updateBusinessData, onNext, onBack }: Props) => {
  const [selectedLocation, setSelectedLocation] = useState(businessData.location);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [agentStatus, setAgentStatus] = useState({
    demographics: false,
    lifestyle: false,
    industry: false,
    aggregator: false,
  });
  const { toast } = useToast();
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

  const handleGenerateRecommendations = async () => {
    if (!selectedLocation) {
      toast({
        title: "No location selected",
        description: "Please select a location on the map first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingAI(true);
    setRecommendations([]);
    setAgentStatus({
      demographics: false,
      lifestyle: false,
      industry: false,
      aggregator: false,
    });

    try {
      // Step 1: Get Census data from FastAPI backend
      console.log('📍 Calling Census API with coordinates:', selectedLocation);

      const censusResponse = await fetch('http://localhost:8000/api/launch-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
          business_name: businessData.name || 'Test Business',
          industry: businessData.type || 'Retail',
        }),
      });

      if (!censusResponse.ok) {
        throw new Error(`Census API error: ${censusResponse.statusText}`);
      }

      const censusData = await censusResponse.json();
      console.log('✅ Census data received:', censusData);

      // Simulate agent progress (in reality, this would be from streaming)
      setTimeout(() => setAgentStatus(prev => ({ ...prev, demographics: true })), 1000);
      setTimeout(() => setAgentStatus(prev => ({ ...prev, lifestyle: true })), 2000);
      setTimeout(() => setAgentStatus(prev => ({ ...prev, industry: true })), 3000);

      // Step 2: Call AI Agents with Census data
      console.log('🤖 Calling AI Agents with Census data...');

      const aiResponse = await fetch('http://localhost:3000/api/recommend-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: selectedLocation,
          census_data: censusData.data || {},
          detailed_data: censusData.detailed_data || {},
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`AI API error: ${aiResponse.statusText}`);
      }

      const aiData = await aiResponse.json();
      console.log('✅ AI recommendations received:', aiData);

      setAgentStatus({
        demographics: true,
        lifestyle: true,
        industry: true,
        aggregator: true,
      });

      // Extract recommendations
      const recs = aiData.final_recommendations?.top_recommendations || [];
      setRecommendations(recs);

      toast({
        title: "🎉 Recommendations Generated!",
        description: `Found ${recs.length} AI-powered business recommendations for your location.`,
      });

    } catch (error) {
      console.error('❌ Error generating recommendations:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAI(false);
    }
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

          {/* Generate TOP 3 Button */}
          {selectedLocation && !isLoadingAI && recommendations.length === 0 && (
            <Button
              onClick={handleGenerateRecommendations}
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Generate TOP 3 Businesses with AI
            </Button>
          )}
        </div>

        {/* AI Recommendations Display */}
        {(isLoadingAI || recommendations.length > 0) && (
          <RecommendationsDisplay
            recommendations={recommendations}
            isLoading={isLoadingAI}
            agentStatus={agentStatus}
          />
        )}

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
