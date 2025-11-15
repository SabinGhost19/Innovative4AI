'use client';

import { useState } from 'react';
import { BusinessSetup, SimulationResult } from '@/lib/types';
import SetupScreen from '@/components/SetupScreen';
import GameDashboard from '@/components/GameDashboard';

export default function Home() {
  const [gameState, setGameState] = useState<'setup' | 'playing'>('setup');
  const [business, setBusiness] = useState<BusinessSetup | null>(null);
  const [lastSimulation, setLastSimulation] = useState<SimulationResult | null>(null);

  const handleBusinessCreated = (newBusiness: BusinessSetup) => {
    setBusiness(newBusiness);
    setGameState('playing');
  };

  const handleSimulationComplete = (result: SimulationResult, updatedBusiness: BusinessSetup) => {
    setLastSimulation(result);
    setBusiness(updatedBusiness);
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-amber-50 to-orange-50">
      {gameState === 'setup' ? (
        <SetupScreen onBusinessCreated={handleBusinessCreated} />
      ) : business ? (
        <GameDashboard
          business={business}
          lastSimulation={lastSimulation}
          onSimulationComplete={handleSimulationComplete}
        />
      ) : null}
    </main>
  );
}

