import { useState, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin } from 'lucide-react';

type LocationData = {
    lat: number;
    lng: number;
    address?: string;
    neighborhood?: string;
};

type Props = {
    onLocationSelect: (location: LocationData) => void;
    selectedLocation?: LocationData;
    apiKey: string;
};

// NYC bounds
const NYC_BOUNDS = {
    north: 40.9176,
    south: 40.4774,
    west: -74.2591,
    east: -73.7004,
};

const NYC_CENTER = { lat: 40.7589, lng: -73.9851 }; // Times Square area

const InteractiveMap = ({ onLocationSelect, selectedLocation, apiKey }: Props) => {
    const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
        selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : null
    );

    const handleMapClick = useCallback(
        async (event: any) => {
            if (!event.detail?.latLng) return;

            const lat = event.detail.latLng.lat;
            const lng = event.detail.latLng.lng;

            // Check if click is within NYC bounds
            if (
                lat >= NYC_BOUNDS.south &&
                lat <= NYC_BOUNDS.north &&
                lng >= NYC_BOUNDS.west &&
                lng <= NYC_BOUNDS.east
            ) {
                setMarkerPosition({ lat, lng });

                // Reverse geocoding to get address
                try {
                    const geocoder = new google.maps.Geocoder();
                    const response = await geocoder.geocode({ location: { lat, lng } });

                    if (response.results[0]) {
                        const addressComponents = response.results[0].address_components;
                        const neighborhood =
                            addressComponents.find((c) => c.types.includes('neighborhood'))?.long_name ||
                            addressComponents.find((c) => c.types.includes('sublocality'))?.long_name ||
                            'New York';

                        onLocationSelect({
                            lat,
                            lng,
                            address: response.results[0].formatted_address,
                            neighborhood,
                        });
                    } else {
                        onLocationSelect({ lat, lng });
                    }
                } catch (error) {
                    console.error('Geocoding error:', error);
                    onLocationSelect({ lat, lng });
                }
            }
        },
        [onLocationSelect]
    );

    if (!apiKey || apiKey === 'your_api_key_here') {
        return (
            <div className="aspect-video rounded-xl bg-muted/50 border border-border flex items-center justify-center">
                <div className="text-center space-y-3 p-8">
                    <MapPin className="h-16 w-16 mx-auto text-primary/50" />
                    <p className="text-lg font-medium text-muted-foreground">Google Maps API Key Required</p>
                    <p className="text-sm text-muted-foreground max-w-md">
                        Please add your Google Maps API key to the .env file as VITE_GOOGLE_MAPS_API_KEY
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Get your key at: console.cloud.google.com/google/maps-apis
                    </p>
                </div>
            </div>
        );
    }

    return (
        <APIProvider apiKey={apiKey}>
            <div className="aspect-video rounded-xl overflow-hidden border border-border shadow-lg">
                <Map
                    defaultCenter={NYC_CENTER}
                    defaultZoom={12}
                    gestureHandling="greedy"
                    disableDefaultUI={false}
                    onClick={handleMapClick}
                    restriction={{
                        latLngBounds: NYC_BOUNDS,
                        strictBounds: true,
                    }}
                    mapId="nyc-business-map"
                    style={{ width: '100%', height: '100%' }}
                >
                    {markerPosition && (
                        <AdvancedMarker position={markerPosition}>
                            <Pin
                                background={'#3b82f6'}
                                borderColor={'#1e40af'}
                                glyphColor={'#ffffff'}
                                scale={1.2}
                            />
                        </AdvancedMarker>
                    )}
                </Map>
            </div>
            <p className="text-sm text-muted-foreground mt-2 text-center">
                Click anywhere on the map to select your business location in NYC
            </p>
        </APIProvider>
    );
};

export default InteractiveMap;
