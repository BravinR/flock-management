'use client';
import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Calculator, 
  Home, 
  DollarSign, 
  ClipboardList, 
  Plus, 
  Trash2 
} from 'lucide-react';

// --- Types based on your Schema ---

type Breed = 'Layers' | 'Broilers' | 'Kenbro';
type PaymentStatus = 'paid' | 'partial' | 'pending';

interface CoopAllocation {
  coop_id: string;
  allocated_quantity: number;
  placement_date: string;
  notes: string;
  initial_mortality: number;
}

interface BatchFormData {
  // Basic Info
  batch_name: string;
  supplier: string;
  breed: Breed;
  arrival_date: string;
  intake_age_days: number;
  initial_quantity: number;
  // Financials
  currency: string;
  cost_per_bird: number;
  transport_cost: number;
  equipment_cost: number;
  amount_paid_upfront: number;
  
  // Allocations
  coop_allocations: CoopAllocation[];
}

// --- Component ---

const CreateBatchForm: React.FC = () => {
  const [step, setStep] = useState(1);
  
  // Initial State with smart defaults
  const [formData, setFormData] = useState<BatchFormData>({
    batch_name: `Batch-${new Date().toISOString().split('T')[0]}`, // Auto-generate name
    supplier: 'Kenchic', // Default supplier
    breed: 'Layers',
    arrival_date: new Date().toISOString().split('T')[0], // Today
    intake_age_days: 1, // Default to Day-Old Chick
    initial_quantity: 0,
    currency: 'KES',
    cost_per_bird: 0,
    transport_cost: 0,
    equipment_cost: 0,
    amount_paid_upfront: 0,
    coop_allocations: [
      {
        coop_id: '',
        allocated_quantity: 0,
        placement_date: new Date().toISOString().split('T')[0],
        notes: '',
        initial_mortality: 0
      }
    ]
  });

  // Derived Financial Calculations
  const totalAcquisitionCost = formData.initial_quantity * formData.cost_per_bird + formData.transport_cost + formData.equipment_cost;
  const balanceDue = totalAcquisitionCost - formData.amount_paid_upfront;
  const paymentStatus: PaymentStatus = balanceDue <= 0 ? 'paid' : (formData.amount_paid_upfront > 0 ? 'partial' : 'pending');

  // Derived Allocation Calculations
  const totalAllocated = formData.coop_allocations.reduce((acc, curr) => acc + Number(curr.allocated_quantity), 0);
  const unallocatedQuantity = formData.initial_quantity - totalAllocated;

  // --- Handlers ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        type === "number"
          ? value === ""                      // allow empty
              ? ""                            // so user can delete
              : parseFloat(value)
          : value
    }));
  };

  const handleAllocationChange = (index: number, field: keyof CoopAllocation, value: any) => {
    const newAllocations = [...formData.coop_allocations];
    newAllocations[index] = {
      ...newAllocations[index],
      [field]: field === 'allocated_quantity' || field === 'initial_mortality' ? Number(value) : value
    };
    setFormData(prev => ({ ...prev, coop_allocations: newAllocations }));
  };

  const addAllocationRow = () => {
    setFormData(prev => ({
      ...prev,
      coop_allocations: [
        ...prev.coop_allocations,
        {
          coop_id: '',
          allocated_quantity: 0,
          placement_date: formData.arrival_date,
          notes: '',
          initial_mortality: 0
        }
      ]
    }));
  };

  const removeAllocationRow = (index: number) => {
    const newAllocations = formData.coop_allocations.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, coop_allocations: newAllocations }));
  };

  const handleSubmit = () => {
    // Construct the final payload matching your JSON schema exactly
    const payload = {
      ...formData,
      total_allocated: totalAllocated,
      unallocated_quantity: unallocatedQuantity,
      total_acquisition_cost: totalAcquisitionCost,
      balance_due: balanceDue,
      payment_status: paymentStatus,
      created_at: new Date().toISOString(),
      // Add logic here to send to backend
    };
    console.log("Submitting Payload:", payload);
    alert("Batch Created! Check console for JSON payload.");
  };

  // --- Steps Rendering ---

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[
        { id: 1, label: 'Basic Info', icon: ClipboardList },
        { id: 2, label: 'Quantity', icon: Calculator },
        { id: 3, label: 'Financials', icon: DollarSign },
        { id: 4, label: 'Allocations', icon: Home },
        { id: 5, label: 'Review', icon: CheckCircle2 },
      ].map((s, idx) => (
        <div key={s.id} className="flex items-center">
          <div className={`flex flex-col items-center ${step === s.id ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === s.id ? 'border-blue-600 bg-blue-50' : step > s.id ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200'}`}>
              <s.icon size={20} />
            </div>
            <span className="text-xs mt-1 font-medium">{s.label}</span>
          </div>
          {idx !== 4 && <div className={`w-12 h-1 mx-2 ${step > s.id ? 'bg-green-500' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen font-sans text-slate-800">
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">New Flock Registration</h1>
        <p className="text-slate-500">Register a new batch acting as the Source of Truth.</p>
      </div>

      {renderStepIndicator()}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8">
          
          {/* STEP 1: BASIC INFO */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900">
                  <ClipboardList className="text-blue-500" size={24} /> Basic Information
                </h2>
                <p className="text-sm text-slate-500 mt-1">Basic information about the batch</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Batch Name</label>
                  <input
                    type="text" name="batch_name" value={formData.batch_name} onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">Custom display name for this batch</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
                  <div className="relative">
                    <input
                        type="text" list="suppliers" name="supplier" value={formData.supplier} onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <datalist id="suppliers">
                        <option value="Kenchic" />
                        <option value="Kutuku" />
                        <option value="Local Breeder" />
                    </datalist>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Who is supplying these birds?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Breed Type</label>
                  <select
                    name="breed" value={formData.breed} onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Layers">Layers</option>
                    <option value="Broilers">Broilers</option>
                    <option value="Kenbro">Kenbro</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">What breed of birds are these?</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: QUANTITY & TIMING */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900">
                  <Calculator className="text-blue-500" size={24} /> Quantity & Timing
                </h2>
                <p className="text-sm text-slate-500 mt-1">Details about batch size and arrival</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total Quantity</label>
                  <input
                    type="number" name="initial_quantity" value={formData.initial_quantity} onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                  <p className="text-xs text-slate-500 mt-1">How many birds in this batch?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Intake Age (Days)</label>
                  <input
                    type="number" name="intake_age_days" value={formData.intake_age_days} onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">At what age are the birds when they arrive? (1 for Day-Old Chicks)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Arrival Date</label>
                  <input
                    type="date" name="arrival_date" value={formData.arrival_date} onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">When do the birds arrive at the farm?</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FINANCIALS */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <h2 className="text-xl font-semibold flex items-center gap-2">
                <DollarSign className="text-blue-500" /> Financial Obligation
              </h2>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex justify-between items-center">
                <div>
                    <p className="text-sm text-blue-600 font-medium">Total Acquisition Cost</p>
                    <p className="text-2xl font-bold text-blue-800">KES {totalAcquisitionCost.toLocaleString()}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-blue-600 font-medium">Balance Due</p>
                    <p className={`text-2xl font-bold ${balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>KES {balanceDue.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cost Per Bird</label>
                  <input 
                    type="number" name="cost_per_bird" value={formData.cost_per_bird} onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Transport Cost</label>
                  <input 
                    type="number" name="transport_cost" value={formData.transport_cost} onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Equipment/Misc</label>
                  <input 
                    type="number" name="equipment_cost" value={formData.equipment_cost} onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <hr className="border-gray-200" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount Paid Upfront</label>
                    <input 
                        type="number" name="amount_paid_upfront" value={formData.amount_paid_upfront} onChange={handleChange}
                        className="w-full p-2.5 border border-green-200 bg-green-50 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                    <select 
                        name="currency" value={formData.currency} onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50"
                    >
                        <option value="KES">KES (Kenyan Shilling)</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                    </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ALLOCATIONS */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Home className="text-blue-500" /> Coop Allocation
                  </h2>
                  <div className={`text-sm font-bold px-3 py-1 rounded-full ${unallocatedQuantity === 0 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {unallocatedQuantity === 0 ? 'All Birds Allocated' : `${unallocatedQuantity} Unallocated`}
                  </div>
               </div>

               <div className="bg-slate-50 p-3 rounded-md text-sm text-slate-600 flex justify-between">
                    <span>Total Batch: <strong>{formData.initial_quantity}</strong></span>
                    <span>Currently Placed: <strong>{totalAllocated}</strong></span>
               </div>

               <div className="space-y-4">
                  {formData.coop_allocations.map((alloc, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 relative hover:border-blue-300 transition-colors">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                              <div className="md:col-span-1">
                                  <label className="text-xs font-bold text-slate-500 uppercase">Coop ID</label>
                                  <select 
                                    value={alloc.coop_id}
                                    onChange={(e) => handleAllocationChange(index, 'coop_id', e.target.value)}
                                    className="w-full mt-1 p-2 border rounded-md bg-white"
                                  >
                                      <option value="">Select Coop...</option>
                                      <option value="coop_01">Coop 01 (East)</option>
                                      <option value="coop_02">Coop 02 (West)</option>
                                      <option value="coop_03">Coop 03 (Iso)</option>
                                  </select>
                              </div>
                              <div className="md:col-span-1">
                                  <label className="text-xs font-bold text-slate-500 uppercase">Quantity</label>
                                  <input 
                                    type="number" 
                                    value={alloc.allocated_quantity}
                                    onChange={(e) => handleAllocationChange(index, 'allocated_quantity', e.target.value)}
                                    className="w-full mt-1 p-2 border rounded-md"
                                  />
                              </div>
                              <div className="md:col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Notes</label>
                                <input 
                                    type="text" 
                                    value={alloc.notes}
                                    onChange={(e) => handleAllocationChange(index, 'notes', e.target.value)}
                                    placeholder="e.g. Top tier cages"
                                    className="w-full mt-1 p-2 border rounded-md"
                                />
                              </div>
                          </div>
                          
                          {formData.coop_allocations.length > 1 && (
                              <button 
                                onClick={() => removeAllocationRow(index)}
                                className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full hover:bg-red-200"
                              >
                                  <Trash2 size={14} />
                              </button>
                          )}
                      </div>
                  ))}
               </div>

               <button 
                onClick={addAllocationRow}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 flex items-center justify-center gap-2 font-medium transition-all"
               >
                   <Plus size={18} /> Add Another Coop
               </button>
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <CheckCircle2 className="text-blue-500" /> Review & Submit
                </h2>
                
                <div className="bg-gray-50 rounded-lg p-6 space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-4">
                        <div>
                            <span className="block text-slate-500">Batch Name</span>
                            <span className="font-semibold">{formData.batch_name}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500">Supplier</span>
                            <span className="font-semibold">{formData.supplier}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500">Breed</span>
                            <span className="font-semibold">{formData.breed}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500">Total Birds</span>
                            <span className="font-semibold">{formData.initial_quantity}</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-4">
                         <div>
                            <span className="block text-slate-500">Total Cost</span>
                            <span className="font-semibold text-slate-900">KES {totalAcquisitionCost.toLocaleString()}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500">Payment Status</span>
                            <span className={`font-bold uppercase text-xs px-2 py-1 rounded-full inline-block mt-1 ${paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {paymentStatus}
                            </span>
                        </div>
                    </div>

                    <div>
                        <span className="block text-slate-500 mb-2">Coop Allocations</span>
                        <ul className="space-y-2">
                            {formData.coop_allocations.map((c, i) => (
                                <li key={i} className="flex justify-between bg-white p-2 border rounded">
                                    <span>{c.coop_id || 'Unassigned'}</span>
                                    <span className="font-mono">{c.allocated_quantity} birds</span>
                                </li>
                            ))}
                        </ul>
                        {unallocatedQuantity !== 0 && (
                             <div className="mt-2 text-red-600 font-medium flex items-center gap-1">
                                <CheckCircle2 size={16} /> Warning: {unallocatedQuantity} birds are unallocated.
                             </div>
                        )}
                    </div>
                </div>
            </div>
          )}
        </div>

        {/* FOOTER NAVIGATION */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-between items-center">
            <button 
                onClick={() => setStep(prev => Math.max(1, prev - 1))}
                disabled={step === 1}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium ${step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-slate-600 hover:bg-gray-200'}`}
            >
                <ChevronLeft size={18} /> Back
            </button>

            {step < 5 ? (
                <button
                    onClick={() => setStep(prev => Math.min(5, prev + 1))}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all"
                >
                    Next Step <ChevronRight size={18} />
                </button>
            ) : (
                <button 
                    onClick={handleSubmit}
                    disabled={unallocatedQuantity !== 0}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all ${unallocatedQuantity !== 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                >
                    <CheckCircle2 size={18} /> Confirm Registration
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default CreateBatchForm;


