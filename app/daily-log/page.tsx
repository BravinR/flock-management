'use client';
import React, { useState } from 'react';
import {
  Calendar,
  ClipboardList,
  AlertTriangle,
  ShoppingBag,
  Minus,
  Plus,
  Save,
  Scale,
  Package,
  TrendingDown,
  Info,
  ChevronRight,
  ChevronLeft,
  Droplets,
  CheckCircle2
} from 'lucide-react';

// --- Types ---

type FeedType = 'Starters Mash' | 'Growers Mash' | 'Layers Mash';
type FeedInputMode = 'bags' | 'kg';

interface DailyLogData {
  log_date: string;
  mortality_count: number | string;
  feed_type: FeedType;
  feed_input_mode: FeedInputMode;
  feed_bags: number | string;
  feed_kg: number | string;
  water_intake_liters: number | string;
  notes: string;
  logged_by: string;
}

// --- Constants ---

const KG_PER_BAG = 50;
const FEED_TYPES: FeedType[] = ['Starters Mash', 'Growers Mash', 'Layers Mash'];

// --- Component ---

const DailyOperationsLog: React.FC = () => {
  // Sample data - would come from batch context in production
  const currentFlockCount = 500;
  const batchName = "Batch-2025-01-01";

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<DailyLogData>({
    log_date: new Date().toISOString().split('T')[0],
    mortality_count: '',
    feed_type: 'Starters Mash',
    feed_input_mode: 'bags',
    feed_bags: '',
    feed_kg: '',
    water_intake_liters: '',
    notes: '',
    logged_by: 'Farm Manager'
  });

  const [showSummary, setShowSummary] = useState(false);

  // --- Handlers ---

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, log_date: e.target.value }));
  };

  const handleMortalityChange = (delta: number) => {
    setFormData(prev => {
      const currentCount = Number(prev.mortality_count) || 0;
      const newCount = Math.max(0, Math.min(currentFlockCount, currentCount + delta));
      return { ...prev, mortality_count: newCount };
    });
  };

  const handleMortalityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setFormData(prev => ({ ...prev, mortality_count: '' }));
    } else {
      const numValue = parseInt(value);
      const clampedValue = Math.max(0, Math.min(currentFlockCount, numValue));
      setFormData(prev => ({ ...prev, mortality_count: clampedValue }));
    }
  };

  const handleFeedTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, feed_type: e.target.value as FeedType }));
  };

  const handleFeedModeToggle = (mode: FeedInputMode) => {
    setFormData(prev => ({ ...prev, feed_input_mode: mode }));
  };

  const handleFeedBagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setFormData(prev => ({ ...prev, feed_bags: '', feed_kg: '' }));
    } else {
      const bags = parseFloat(value);
      const kg = bags * KG_PER_BAG;
      setFormData(prev => ({ ...prev, feed_bags: bags, feed_kg: kg }));
    }
  };

  const handleFeedKgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setFormData(prev => ({ ...prev, feed_kg: '', feed_bags: '' }));
    } else {
      const kg = parseFloat(value);
      const bags = kg / KG_PER_BAG;
      setFormData(prev => ({ ...prev, feed_kg: kg, feed_bags: bags }));
    }
  };

  const handleWaterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setFormData(prev => ({ ...prev, water_intake_liters: '' }));
    } else {
      const liters = parseFloat(value);
      setFormData(prev => ({ ...prev, water_intake_liters: liters }));
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, notes: e.target.value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (Number(formData.mortality_count) > currentFlockCount) {
      alert(`Mortality cannot exceed current flock count (${currentFlockCount})`);
      return;
    }

    try {
      const response = await fetch("/api/daily-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create daily log");
      }

      const result = await response.json();
      console.log("Daily log created successfully:", result);
      setShowSummary(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setShowSummary(false);
        setStep(1);
        setFormData({
          log_date: new Date().toISOString().split('T')[0],
          mortality_count: '',
          feed_type: 'Starters Mash',
          feed_input_mode: 'bags',
          feed_bags: '',
          feed_kg: '',
          water_intake_liters: '',
          notes: '',
          logged_by: 'Farm Manager'
        });
      }, 3000);
    } catch (error) {
      console.error("Error creating daily log:", error);
      alert(`Failed to save daily log: ${(error as Error).message}`);
    }
  };

  const remainingFlock = currentFlockCount - Number(formData.mortality_count);

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[
        { id: 1, label: 'Feed', icon: ShoppingBag },
        { id: 2, label: 'Water', icon: Droplets },
        { id: 3, label: 'Mortality', icon: AlertTriangle },
        { id: 4, label: 'Review', icon: CheckCircle2 },
      ].map((s, idx) => (
        <div key={s.id} className="flex items-center">
          <div className={`flex flex-col items-center ${step === s.id ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === s.id ? 'border-blue-600 bg-blue-50' : step > s.id ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200'}`}>
              <s.icon size={20} />
            </div>
            <span className="text-xs mt-1 font-medium">{s.label}</span>
          </div>
          {idx !== 3 && <div className={`w-12 h-1 mx-2 ${step > s.id ? 'bg-green-500' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen font-sans text-slate-800">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardList className="text-blue-600" />
          Daily Operations Log
        </h1>
        <p className="text-slate-500 mt-1">Log daily activities - Step by step</p>
        <div className="mt-2 inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {batchName} • Current Flock: {currentFlockCount} birds
        </div>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Success Summary */}
      {showSummary && (
        <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-xl p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-500 text-white rounded-full p-2">
              <Save size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900">Daily Log Saved Successfully!</h3>
              <p className="text-sm text-green-700">Entry recorded for {new Date(formData.log_date).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-green-700">Feed Used:</span>
              <span className="font-semibold text-green-900 ml-2">{formData.feed_kg}kg</span>
            </div>
            <div>
              <span className="text-green-700">Water:</span>
              <span className="font-semibold text-green-900 ml-2">{formData.water_intake_liters}L</span>
            </div>
            <div>
              <span className="text-green-700">Mortality:</span>
              <span className="font-semibold text-green-900 ml-2">{formData.mortality_count} birds</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8">

          {/* Date Selector - Always visible at top */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Calendar size={18} />
              Date
            </label>
            <input
              type="date"
              value={formData.log_date}
              onChange={handleDateChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full md:w-1/2 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
            />
            <p className="text-xs text-slate-500 mt-2">Defaults to today. Change if logging for a previous date.</p>
          </div>

          {/* STEP 1: FEED */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2 mb-1">
                  <ShoppingBag size={24} className="text-green-600" />
                  Feed Consumption
                </h2>
                <p className="text-sm text-slate-500">Record today's feed usage</p>
              </div>

              {/* Feed Type Selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Feed Type</label>
                <select
                  value={formData.feed_type}
                  onChange={handleFeedTypeChange}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
                >
                  {FEED_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Select the type of feed given today</p>
              </div>

              {/* Input Mode Toggle */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Input Mode</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFeedModeToggle('bags')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                      formData.feed_input_mode === 'bags'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <Package size={20} />
                    By Bags
                  </button>
                  <button
                    onClick={() => handleFeedModeToggle('kg')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                      formData.feed_input_mode === 'kg'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <Scale size={20} />
                    By Kg
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Bags are easier for staff, Kg is more precise</p>
              </div>

              {/* Feed Amount Input */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-5">
                {formData.feed_input_mode === 'bags' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Number of Bags</label>
                    <input
                      type="number"
                      value={formData.feed_bags}
                      onChange={handleFeedBagsChange}
                      step="0.5"
                      min="0"
                      placeholder="0"
                      className="w-full p-4 text-3xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Assuming {KG_PER_BAG}kg per bag
                    </p>
                    {Number(formData.feed_bags) > 0 && (
                      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          <span className="font-semibold">{formData.feed_bags} bags</span> = <span className="font-bold text-lg">{formData.feed_kg}kg</span>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Weight in Kilograms</label>
                    <input
                      type="number"
                      value={formData.feed_kg}
                      onChange={handleFeedKgChange}
                      step="0.1"
                      min="0"
                      placeholder="100"
                      className="w-full p-4 text-3xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Enter precise weight in kilograms
                    </p>
                    {Number(formData.feed_kg) > 0 && (
                      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          <span className="font-semibold">{formData.feed_kg}kg</span> ≈ <span className="font-bold text-lg">{Number(formData.feed_bags).toFixed(2)} bags</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: WATER */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2 mb-1">
                  <Droplets size={24} className="text-blue-600" />
                  Water Intake
                </h2>
                <p className="text-sm text-slate-500">Record water consumption for the flock</p>
              </div>

              <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">Water Consumed (Liters)</label>
                <input
                  type="number"
                  value={formData.water_intake_liters}
                  onChange={handleWaterChange}
                  step="1"
                  min="0"
                  placeholder="0"
                  className="w-full p-4 text-3xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                />
                <p className="text-xs text-slate-500 mt-3">
                  Total liters of water consumed by the flock today
                </p>

                {Number(formData.water_intake_liters) > 0 && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      Average per bird: <span className="font-bold text-lg">{(Number(formData.water_intake_liters) / currentFlockCount).toFixed(2)}L</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                <Info size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Tip: Monitor water intake</p>
                  <p className="mt-1">Sudden changes in water consumption can indicate health issues or environmental stress.</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: MORTALITY */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2 mb-1">
                  <AlertTriangle size={24} className="text-red-600" />
                  Mortality Count
                </h2>
                <p className="text-sm text-slate-500">Record any bird losses today</p>
              </div>

              <div className="flex items-center gap-4 justify-center">
                {/* Minus Button */}
                <button
                  onClick={() => handleMortalityChange(-1)}
                  disabled={Number(formData.mortality_count) === 0}
                  className="w-16 h-16 flex items-center justify-center bg-red-100 hover:bg-red-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-red-600 disabled:text-gray-400 rounded-lg border-2 border-red-300 disabled:border-gray-200 transition-all"
                >
                  <Minus size={28} />
                </button>

                {/* Count Display */}
                <div className="flex-1 max-w-xs">
                  <input
                    type="number"
                    value={formData.mortality_count}
                    onChange={handleMortalityInput}
                    placeholder="0"
                    min={0}
                    max={currentFlockCount}
                    className="w-full p-5 text-center text-5xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                  />
                </div>

                {/* Plus Button */}
                <button
                  onClick={() => handleMortalityChange(1)}
                  disabled={Number(formData.mortality_count) >= currentFlockCount}
                  className="w-16 h-16 flex items-center justify-center bg-red-100 hover:bg-red-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-red-600 disabled:text-gray-400 rounded-lg border-2 border-red-300 disabled:border-gray-200 transition-all"
                >
                  <Plus size={28} />
                </button>
              </div>

              {/* Validation Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-start gap-2 text-sm">
                  <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-600 text-base">
                      Birds lost today: <span className="font-bold text-slate-900 text-xl">{formData.mortality_count || 0}</span>
                    </p>
                    {Number(formData.mortality_count) > 0 && (
                      <p className="text-slate-600 mt-2 text-base">
                        Remaining flock: <span className="font-bold text-green-600 text-xl">{remainingFlock} birds</span>
                      </p>
                    )}
                    {Number(formData.mortality_count) >= currentFlockCount && (
                      <p className="text-red-600 font-medium mt-2">⚠️ Cannot exceed current flock count!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes about mortality (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={handleNotesChange}
                  rows={4}
                  placeholder="Any observations about the losses? Disease symptoms? Causes?"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2 mb-1">
                  <CheckCircle2 size={24} className="text-green-600" />
                  Review & Submit
                </h2>
                <p className="text-sm text-slate-500">Verify all information before submitting</p>
              </div>

              <div className="space-y-4">
                {/* Feed Summary */}
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag size={20} className="text-green-600" />
                    <h3 className="font-semibold text-green-900">Feed</h3>
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="text-green-800"><span className="font-medium">Type:</span> {formData.feed_type}</p>
                    <p className="text-green-800"><span className="font-medium">Amount:</span> {formData.feed_kg}kg ({Number(formData.feed_bags).toFixed(2)} bags)</p>
                  </div>
                </div>

                {/* Water Summary */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets size={20} className="text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Water</h3>
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="text-blue-800"><span className="font-medium">Total:</span> {formData.water_intake_liters} liters</p>
                    <p className="text-blue-800"><span className="font-medium">Per bird:</span> {(Number(formData.water_intake_liters) / currentFlockCount).toFixed(2)}L</p>
                  </div>
                </div>

                {/* Mortality Summary */}
                <div className={`border-2 rounded-lg p-4 ${Number(formData.mortality_count) > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={20} className={Number(formData.mortality_count) > 0 ? 'text-red-600' : 'text-gray-600'} />
                    <h3 className={`font-semibold ${Number(formData.mortality_count) > 0 ? 'text-red-900' : 'text-gray-900'}`}>Mortality</h3>
                  </div>
                  <div className="text-sm space-y-1">
                    <p className={Number(formData.mortality_count) > 0 ? 'text-red-800' : 'text-gray-800'}>
                      <span className="font-medium">Birds lost:</span> {formData.mortality_count || 0}
                    </p>
                    <p className={Number(formData.mortality_count) > 0 ? 'text-red-800' : 'text-gray-800'}>
                      <span className="font-medium">Remaining:</span> {remainingFlock} birds
                    </p>
                    {formData.notes && (
                      <p className={Number(formData.mortality_count) > 0 ? 'text-red-800' : 'text-gray-800'}>
                        <span className="font-medium">Notes:</span> {formData.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="bg-gray-50 px-8 py-5 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            disabled={step === 1}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all ${
              step === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-slate-600 hover:bg-gray-200'
            }`}
          >
            <ChevronLeft size={20} /> Back
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep(prev => Math.min(4, prev + 1))}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-sm"
            >
              Next <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-sm"
            >
              <Save size={20} />
              Submit Daily Log
            </button>
          )}
        </div>

      </div>

      {/* Quick Stats Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 text-green-600 p-3 rounded-lg">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-600">Feed (Step 1)</p>
              <p className="text-2xl font-bold text-slate-900">{formData.feed_kg}kg</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
              <Droplets size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-600">Water (Step 2)</p>
              <p className="text-2xl font-bold text-slate-900">{formData.water_intake_liters}L</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${Number(formData.mortality_count) > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-600">Mortality (Step 3)</p>
              <p className="text-2xl font-bold text-slate-900">{formData.mortality_count || 0}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DailyOperationsLog;
