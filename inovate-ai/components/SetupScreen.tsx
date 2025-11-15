'use client';

import { useState } from 'react';
import { BusinessSetup } from '@/lib/types';
import { MapPin, Search, Loader2 } from 'lucide-react';

interface SetupScreenProps {
  onBusinessCreated: (business: BusinessSetup) => void;
}

export default function SetupScreen({ onBusinessCreated }: SetupScreenProps) {
  const [step, setStep] = useState<'name' | 'location' | 'confirm'>('name');
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [locationData, setLocationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (businessName.trim()) {
      setStep('location');
    }
  };

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/scrape-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, useMock: true }), // Folosim mock pentru dev
      });

      const data = await response.json();
      setLocationData(data.locationData);
      setStep('confirm');
    } catch (error) {
      console.error('Error:', error);
      alert('Eroare la extragerea datelor. Te rog încearcă din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: businessName,
          location,
          locationData,
        }),
      });

      const data = await response.json();
      onBusinessCreated(data.business);
    } catch (error) {
      console.error('Error:', error);
      alert('Eroare la crearea business-ului.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-amber-900 mb-4">
            ☕ Sim-Antreprenor
          </h1>
          <p className="text-lg text-amber-700">
            Construiește și gestionează propria ta cafenea într-o locație reală din România
          </p>
        </div>

        {/* Setup Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {step === 'name' && (
            <form onSubmit={handleNameSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numele Cafenelei Tale
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="ex: Coffee Paradise"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={!businessName.trim()}
                className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuă
              </button>
            </form>
          )}

          {step === 'location' && (
            <form onSubmit={handleLocationSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-5 h-5 mr-1" />
                  Locația (Adresă Reală din România)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="ex: Piața Victoriei, București"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                  autoFocus
                />
                <p className="text-sm text-gray-500 mt-2">
                  Vom extrage date reale despre prețuri, competitori și trafic din această locație
                </p>
              </div>
              <button
                type="submit"
                disabled={!location.trim() || isLoading}
                className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analizăm locația...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Analizează Locația
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'confirm' && locationData && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Confirmă Setup-ul</h2>
              
              <div className="bg-amber-50 p-6 rounded-lg space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Numele Business-ului</p>
                  <p className="text-lg font-semibold">{businessName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Locație</p>
                  <p className="text-lg font-semibold">{location}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-amber-200">
                  <div>
                    <p className="text-sm text-gray-600">Preț Mediu Cafea</p>
                    <p className="text-xl font-bold text-amber-700">
                      {locationData.averageCoffeePrice} RON
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Chirie Estimată</p>
                    <p className="text-xl font-bold text-amber-700">
                      {locationData.rentEstimate} EUR/lună
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Trafic Pietonal</p>
                    <p className="text-xl font-bold text-amber-700 capitalize">
                      {locationData.footTraffic}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Competitori</p>
                    <p className="text-xl font-bold text-amber-700">
                      {locationData.competitors.length}
                    </p>
                  </div>
                </div>
                {locationData.competitors.length > 0 && (
                  <div className="pt-4 border-t border-amber-200">
                    <p className="text-sm text-gray-600 mb-2">Competitorii Tăi:</p>
                    <div className="flex flex-wrap gap-2">
                      {locationData.competitors.map((comp: string) => (
                        <span
                          key={comp}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('location')}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Înapoi
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="flex-1 bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Se creează...
                    </>
                  ) : (
                    'Începe Jocul! 🎮'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            💡 Vei lua decizii lunare despre personal, prețuri, marketing și calitate.
          </p>
          <p className="mt-2">
            Agentii AI vor simula competitorii și clienții pentru a-ți testa strategia!
          </p>
        </div>
      </div>
    </div>
  );
}
