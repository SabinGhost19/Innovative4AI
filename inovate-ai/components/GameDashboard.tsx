'use client';

import { useState } from 'react';
import { BusinessSetup, MonthlyDecisions, SimulationResult } from '@/lib/types';
import { TrendingUp, Users, DollarSign, Award, Play, Loader2 } from 'lucide-react';

interface GameDashboardProps {
  business: BusinessSetup;
  lastSimulation: SimulationResult | null;
  onSimulationComplete: (result: SimulationResult, business: BusinessSetup) => void;
}

export default function GameDashboard({
  business,
  lastSimulation,
  onSimulationComplete,
}: GameDashboardProps) {
  const [decisions, setDecisions] = useState<MonthlyDecisions>({
    employees: 3,
    coffeeQuality: 'medium',
    marketingBudget: 2000,
    productPrice: business.locationData.averageCoffeePrice,
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setShowResults(false);

    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          decisions,
        }),
      });

      const data = await response.json();
      onSimulationComplete(data.result, data.business);
      setShowResults(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Eroare la simulare. Te rog încearcă din nou.');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-amber-900">☕ {business.name}</h1>
              <p className="text-gray-600 mt-1">{business.location}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Luna</p>
              <p className="text-3xl font-bold text-amber-700">{business.currentMonth}</p>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Capital</span>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {business.cash.toFixed(0)} RON
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reputație</span>
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {business.reputation.toFixed(1)}/100
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Competitori</span>
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-700 mt-1">
                {business.locationData.competitors.length}
              </p>
            </div>
          </div>
        </div>

        {/* Decisions Panel */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            📊 Decizii Strategice - Luna {business.currentMonth}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Angajați */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Număr Angajați (Baristas)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={decisions.employees}
                onChange={(e) =>
                  setDecisions({ ...decisions, employees: parseInt(e.target.value) || 1 })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
              />
              <p className="text-sm text-gray-500 mt-1">
                Cost: {(decisions.employees * 3500).toFixed(0)} RON/lună
              </p>
            </div>

            {/* Preț Produs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preț Cafea (RON)
              </label>
              <input
                type="number"
                min="5"
                max="50"
                step="0.5"
                value={decisions.productPrice}
                onChange={(e) =>
                  setDecisions({ ...decisions, productPrice: parseFloat(e.target.value) || 10 })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
              />
              <p className="text-sm text-gray-500 mt-1">
                Preț mediu piață: {business.locationData.averageCoffeePrice} RON
              </p>
            </div>

            {/* Calitate Cafea */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calitate Cafea
              </label>
              <select
                value={decisions.coffeeQuality}
                onChange={(e) =>
                  setDecisions({
                    ...decisions,
                    coffeeQuality: e.target.value as 'low' | 'medium' | 'high',
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
              >
                <option value="low">Scăzută (0.8 RON/cafea)</option>
                <option value="medium">Medie (1.2 RON/cafea)</option>
                <option value="high">Premium (2.0 RON/cafea)</option>
              </select>
            </div>

            {/* Marketing Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Marketing (RON)
              </label>
              <input
                type="number"
                min="0"
                max="20000"
                step="500"
                value={decisions.marketingBudget}
                onChange={(e) =>
                  setDecisions({
                    ...decisions,
                    marketingBudget: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
              />
              <p className="text-sm text-gray-500 mt-1">Social media, flyers, promoții</p>
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="w-full mt-8 bg-amber-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isSimulating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Se simulează luna...
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                RULEAZĂ LUNA {business.currentMonth}
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {showResults && lastSimulation && (
          <div className="space-y-6">
            {/* P&L */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Raport Financiar - Luna {lastSimulation.month}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Venituri</p>
                  <p className="text-2xl font-bold text-green-700">
                    +{lastSimulation.financials.revenue.toFixed(0)} RON
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {lastSimulation.financials.salesVolume} cafele vândute
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Costuri Totale</p>
                  <p className="text-2xl font-bold text-red-700">
                    -{lastSimulation.financials.totalCosts.toFixed(0)} RON
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Chirie:</span>
                  <span className="font-medium">-{lastSimulation.financials.costs.rent} RON</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Salarii:</span>
                  <span className="font-medium">
                    -{lastSimulation.financials.costs.salaries.toFixed(0)} RON
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Furnizori (cafea):</span>
                  <span className="font-medium">
                    -{lastSimulation.financials.costs.supplies.toFixed(0)} RON
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Marketing:</span>
                  <span className="font-medium">
                    -{lastSimulation.financials.costs.marketing.toFixed(0)} RON
                  </span>
                </div>
              </div>

              <div
                className={`mt-6 p-4 rounded-lg ${
                  lastSimulation.financials.profit > 0 ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                <p className="text-sm text-gray-700 mb-1">Profit Net</p>
                <p
                  className={`text-3xl font-bold ${
                    lastSimulation.financials.profit > 0 ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {lastSimulation.financials.profit > 0 ? '+' : ''}
                  {lastSimulation.financials.profit.toFixed(0)} RON
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Marjă: {lastSimulation.financials.profitMargin.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Evenimente & Feedback */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Evenimente */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📬 Evenimente</h3>
                <div className="space-y-3">
                  {lastSimulation.events.map((event, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border-l-4 ${
                        event.type === 'success'
                          ? 'bg-green-50 border-green-500'
                          : event.type === 'error'
                          ? 'bg-red-50 border-red-500'
                          : event.type === 'warning'
                          ? 'bg-yellow-50 border-yellow-500'
                          : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <p className="font-semibold text-sm">{event.title}</p>
                      <p className="text-sm text-gray-700 mt-1">{event.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback Clienți */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">💬 Feedback Clienți</h3>
                <div className="space-y-3">
                  {lastSimulation.customerFeedback.map((feedback, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        feedback.sentiment === 'positive'
                          ? 'bg-green-50'
                          : feedback.sentiment === 'negative'
                          ? 'bg-red-50'
                          : 'bg-gray-50'
                      }`}
                    >
                      <p className="text-sm font-medium">
                        {feedback.sentiment === 'positive' ? '😊' : feedback.sentiment === 'negative' ? '😞' : '😐'}{' '}
                        {feedback.count} clienți
                      </p>
                      <p className="text-sm text-gray-700 mt-1">{feedback.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Acțiuni Competitori */}
            {lastSimulation.competitorActions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 Acțiuni Competitori</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lastSimulation.competitorActions.map((action, idx) => (
                    <div key={idx} className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="font-semibold text-red-900">{action.competitor}</p>
                      <p className="text-sm text-gray-700 mt-1">{action.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
