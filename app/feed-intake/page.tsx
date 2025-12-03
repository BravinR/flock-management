'use client';
import React, { useState } from 'react';
import {
  ShoppingBag,
  Calendar,
  DollarSign,
  Package,
  Scale,
  Truck,
  Save,
  CheckCircle2,
  Plus,
  Minus,
  FileText,
  TrendingUp,
  Warehouse
} from 'lucide-react';

// --- Types ---

type FeedType = 'Starters Mash' | 'Growers Mash' | 'Layers Mash' | 'Finisher Mash' | 'Other';
type FeedInputMode = 'bags' | 'kg';

interface FeedIntakeData {
  delivery_date: string;
  feed_type: FeedType;
  custom_feed_name: string;
  supplier: string;
  input_mode: FeedInputMode;
  bags_received: number;
  kg_received: number;
  cost_per_bag: number;
  cost_per_kg: number;
  total_cost: number;
  currency: string;
  batch_number: string;
  invoice_number: string;
  notes: string;
  received_by: string;
}

// --- Constants ---

const KG_PER_BAG = 50;
const FEED_TYPES: FeedType[] = ['Starters Mash', 'Growers Mash', 'Layers Mash', 'Finisher Mash', 'Other'];
const SUPPLIERS = ['Pembe Feeds', 'Unga Feeds', 'Sigma Feeds', 'Local Supplier', 'Other'];

// --- Component ---

const FeedIntakePage: React.FC = () => {
  const [formData, setFormData] = useState<FeedIntakeData>({
    delivery_date: new Date().toISOString().split('T')[0],
    feed_type: 'Starters Mash',
    custom_feed_name: '',
    supplier: 'Pembe Feeds',
    input_mode: 'bags',
    bags_received: 0,
    kg_received: 0,
    cost_per_bag: 0,
    cost_per_kg: 0,
    total_cost: 0,
    currency: 'KES',
    batch_number: '',
    invoice_number: '',
    notes: '',
    received_by: 'Farm Manager'
  });

  const [showSuccess, setShowSuccess] = useState(false);

  // --- Handlers ---

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, delivery_date: e.target.value }));
  };

  const handleFeedTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      feed_type: e.target.value as FeedType,
      custom_feed_name: e.target.value === 'Other' ? prev.custom_feed_name : ''
    }));
  };

  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, supplier: e.target.value }));
  };

  const handleInputModeToggle = (mode: FeedInputMode) => {
    setFormData(prev => ({ ...prev, input_mode: mode }));
  };

  const handleBagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const bags = parseFloat(e.target.value) || 0;
    const kg = bags * KG_PER_BAG;
    const costPerKg = bags > 0 ? formData.cost_per_bag / KG_PER_BAG : 0;
    const totalCost = bags * formData.cost_per_bag;

    setFormData(prev => ({
      ...prev,
      bags_received: bags,
      kg_received: kg,
      cost_per_kg: costPerKg,
      total_cost: totalCost
    }));
  };

  const handleKgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const kg = parseFloat(e.target.value) || 0;
    const bags = kg / KG_PER_BAG;
    const costPerBag = formData.cost_per_kg * KG_PER_BAG;
    const totalCost = kg * formData.cost_per_kg;

    setFormData(prev => ({
      ...prev,
      kg_received: kg,
      bags_received: bags,
      cost_per_bag: costPerBag,
      total_cost: totalCost
    }));
  };

  const handleCostPerBagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const costPerBag = parseFloat(e.target.value) || 0;
    const costPerKg = costPerBag / KG_PER_BAG;
    const totalCost = formData.bags_received * costPerBag;

    setFormData(prev => ({
      ...prev,
      cost_per_bag: costPerBag,
      cost_per_kg: costPerKg,
      total_cost: totalCost
    }));
  };

  const handleCostPerKgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const costPerKg = parseFloat(e.target.value) || 0;
    const costPerBag = costPerKg * KG_PER_BAG;
    const totalCost = formData.kg_received * costPerKg;

    setFormData(prev => ({
      ...prev,
      cost_per_kg: costPerKg,
      cost_per_bag: costPerBag,
      total_cost: totalCost
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBagsIncrement = (delta: number) => {
    const newBags = Math.max(0, formData.bags_received + delta);
    const kg = newBags * KG_PER_BAG;
    const totalCost = newBags * formData.cost_per_bag;

    setFormData(prev => ({
      ...prev,
      bags_received: newBags,
      kg_received: kg,
      total_cost: totalCost
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (formData.feed_type === 'Other' && !formData.custom_feed_name.trim()) {
      alert('Please enter the custom feed name');
      return;
    }

    if (formData.kg_received === 0) {
      alert('Please enter the quantity received');
      return;
    }

    if (!formData.supplier) {
      alert('Please select a supplier');
      return;
    }

    try {
      const response = await fetch("/api/feed-intakes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to record feed intake");
      }

      const result = await response.json();
      console.log('Feed intake recorded successfully:', result);
      setShowSuccess(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          delivery_date: new Date().toISOString().split('T')[0],
          feed_type: 'Starters Mash',
          custom_feed_name: '',
          supplier: 'Pembe Feeds',
          input_mode: 'bags',
          bags_received: 0,
          kg_received: 0,
          cost_per_bag: 0,
          cost_per_kg: 0,
          total_cost: 0,
          currency: 'KES',
          batch_number: '',
          invoice_number: '',
          notes: '',
          received_by: 'Farm Manager'
        });
      }, 3000);
    } catch (error) {
      console.error("Error recording feed intake:", error);
      alert(`Failed to record feed intake: ${(error as Error).message}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen font-sans text-slate-800">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Warehouse className="text-green-600" />
          Feed Intake / Purchase
        </h1>
        <p className="text-slate-500 mt-1">Record feed deliveries and purchases</p>
      </div>

      {/* Success Banner */}
      {showSuccess && (
        <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-xl p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 text-white rounded-full p-2">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900">Feed Intake Recorded Successfully!</h3>
              <p className="text-sm text-green-700">
                {formData.bags_received.toFixed(1)} bags ({formData.kg_received}kg) of {formData.feed_type === 'Other' ? formData.custom_feed_name : formData.feed_type} received
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 space-y-8">

          {/* Delivery Information */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Truck size={20} className="text-blue-600" />
              Delivery Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                  <Calendar size={16} />
                  Delivery Date
                </label>
                <input
                  type="date"
                  value={formData.delivery_date}
                  onChange={handleDateChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">When did the feed arrive?</p>
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Supplier
                </label>
                <select
                  value={formData.supplier}
                  onChange={handleSupplierChange}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {SUPPLIERS.map(supplier => (
                    <option key={supplier} value={supplier}>{supplier}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Who supplied this feed?</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Feed Details */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <ShoppingBag size={20} className="text-green-600" />
              Feed Details
            </h2>

            <div className="space-y-6">
              {/* Feed Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Feed Type
                </label>
                <select
                  value={formData.feed_type}
                  onChange={handleFeedTypeChange}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
                >
                  {FEED_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Select the type of feed received</p>
              </div>

              {/* Custom Feed Name - Only if "Other" is selected */}
              {formData.feed_type === 'Other' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Custom Feed Name
                  </label>
                  <input
                    type="text"
                    name="custom_feed_name"
                    value={formData.custom_feed_name}
                    onChange={handleChange}
                    placeholder="e.g., Organic Layer Feed, Premium Broiler Mix"
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">Specify the name of the custom feed</p>
                </div>
              )}

              {/* Input Mode Toggle */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Input Mode</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleInputModeToggle('bags')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                      formData.input_mode === 'bags'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <Package size={20} />
                    Count Bags
                  </button>
                  <button
                    onClick={() => handleInputModeToggle('kg')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                      formData.input_mode === 'kg'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <Scale size={20} />
                    Weigh in Kg
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Bags for quick counting, Kg for precise weight</p>
              </div>

              {/* Quantity Input */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-6">
                {formData.input_mode === 'bags' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Number of Bags Received</label>

                    {/* Bag Counter with +/- buttons */}
                    <div className="flex items-center gap-4 mb-4">
                      <button
                        onClick={() => handleBagsIncrement(-1)}
                        disabled={formData.bags_received === 0}
                        className="w-12 h-12 flex items-center justify-center bg-red-100 hover:bg-red-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-red-600 disabled:text-gray-400 rounded-lg border-2 border-red-300 disabled:border-gray-200 transition-all"
                      >
                        <Minus size={20} />
                      </button>

                      <input
                        type="number"
                        value={formData.bags_received}
                        onChange={handleBagsChange}
                        step="1"
                        min="0"
                        placeholder="0"
                        className="flex-1 p-4 text-center text-4xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                      />

                      <button
                        onClick={() => handleBagsIncrement(1)}
                        className="w-12 h-12 flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-600 rounded-lg border-2 border-green-300 transition-all"
                      >
                        <Plus size={20} />
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 mb-3">
                      Assuming {KG_PER_BAG}kg per bag
                    </p>
                    {formData.bags_received > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          <span className="font-semibold">{formData.bags_received} bags</span> = <span className="font-bold text-lg">{formData.kg_received}kg</span>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Weight in Kilograms</label>
                    <input
                      type="number"
                      value={formData.kg_received}
                      onChange={handleKgChange}
                      step="0.1"
                      min="0"
                      placeholder="e.g., 1000"
                      className="w-full p-4 text-4xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                    />
                    <p className="text-xs text-slate-500 mt-3">
                      Total weight of feed received
                    </p>
                    {formData.kg_received > 0 && (
                      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          <span className="font-semibold">{formData.kg_received}kg</span> ≈ <span className="font-bold text-lg">{formData.bags_received.toFixed(1)} bags</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Cost Information */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-yellow-600" />
              Cost Information
            </h2>

            <div className="space-y-6">
              {/* Currency Selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="KES">KES</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>

                {/* Cost Per Unit */}
                {formData.input_mode === 'bags' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Cost Per Bag</label>
                    <input
                      type="number"
                      value={formData.cost_per_bag}
                      onChange={handleCostPerBagChange}
                      step="0.01"
                      min="0"
                      placeholder="e.g., 2500"
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    />
                    <p className="text-xs text-slate-500 mt-1">Price per 50kg bag</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Cost Per Kg</label>
                    <input
                      type="number"
                      value={formData.cost_per_kg}
                      onChange={handleCostPerKgChange}
                      step="0.01"
                      min="0"
                      placeholder="e.g., 50"
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    />
                    <p className="text-xs text-slate-500 mt-1">Price per kilogram</p>
                  </div>
                )}

                {/* Total Cost (Calculated) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Total Cost</label>
                  <div className="w-full p-3 border-2 border-green-300 bg-green-50 rounded-lg font-mono text-2xl font-bold text-green-800">
                    {formData.currency} {formData.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Auto-calculated</p>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Additional Information */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-purple-600" />
              Additional Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Batch Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Batch Number (Optional)
                </label>
                <input
                  type="text"
                  name="batch_number"
                  value={formData.batch_number}
                  onChange={handleChange}
                  placeholder="e.g., BATCH2025-001"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">Manufacturer's batch number</p>
              </div>

              {/* Invoice Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Invoice Number (Optional)
                </label>
                <input
                  type="text"
                  name="invoice_number"
                  value={formData.invoice_number}
                  onChange={handleChange}
                  placeholder="e.g., INV-2025-12345"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">Supplier's invoice number</p>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notes & Observations (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Any observations about the feed quality? Packaging condition? Special instructions?"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            {/* Received By */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Received By
              </label>
              <input
                type="text"
                name="received_by"
                value={formData.received_by}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full md:w-1/2 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">Who received this delivery?</p>
            </div>
          </div>

        </div>

        {/* Footer - Submit Button */}
        <div className="bg-gray-50 px-8 py-5 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md"
          >
            <Save size={24} />
            Record Feed Intake
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 text-green-600 p-3 rounded-lg">
              <Package size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-600">Quantity</p>
              <p className="text-2xl font-bold text-slate-900">{formData.bags_received.toFixed(1)} bags</p>
              <p className="text-sm text-slate-600">{formData.kg_received}kg</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-600">Total Cost</p>
              <p className="text-2xl font-bold text-slate-900">{formData.currency} {formData.total_cost.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-600">Cost Per Kg</p>
              <p className="text-2xl font-bold text-slate-900">{formData.currency} {formData.cost_per_kg.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default FeedIntakePage;
