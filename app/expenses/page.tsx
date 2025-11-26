'use client';
import React, { useState } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Syringe,
  Wrench,
  Users,
  FileText,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Save,
  Receipt,
  CreditCard,
  Building,
  TrendingUp
} from 'lucide-react';

// --- Types ---

type ExpenseCategory = 'Feed' | 'Medicine' | 'Infrastructure' | 'Salary' | 'Other';
type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Mobile Money' | 'Credit' | 'Other';
type PaymentStatus = 'Paid' | 'Pending' | 'Partial';

interface ExpenseData {
  // Step 1: Category
  category: ExpenseCategory;

  // Step 2: Details
  description: string;
  date: string;
  vendor_supplier: string;
  quantity: number;
  unit: string;

  // Step 3: Cost
  unit_cost: number;
  total_amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  amount_paid: number;
  balance_due: number;

  // Additional
  invoice_number: string;
  receipt_number: string;
  notes: string;
  recorded_by: string;
}

// --- Constants ---

const EXPENSE_CATEGORIES = [
  {
    id: 'Feed' as ExpenseCategory,
    icon: ShoppingBag,
    label: 'Feed',
    description: 'Feed purchases and deliveries',
    color: 'green'
  },
  {
    id: 'Medicine' as ExpenseCategory,
    icon: Syringe,
    label: 'Medicine',
    description: 'Vaccines, drugs, and veterinary supplies',
    color: 'blue'
  },
  {
    id: 'Infrastructure' as ExpenseCategory,
    icon: Wrench,
    label: 'Infrastructure',
    description: 'Repairs, construction, and equipment',
    color: 'orange'
  },
  {
    id: 'Salary' as ExpenseCategory,
    icon: Users,
    label: 'Salary',
    description: 'Staff wages and labor costs',
    color: 'purple'
  },
  {
    id: 'Other' as ExpenseCategory,
    icon: FileText,
    label: 'Other',
    description: 'Miscellaneous expenses',
    color: 'gray'
  }
];

const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Bank Transfer', 'Mobile Money', 'Credit', 'Other'];

// --- Component ---

const ExpenseLoggingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState<ExpenseData>({
    category: 'Feed',
    description: '',
    date: new Date().toISOString().split('T')[0],
    vendor_supplier: '',
    quantity: 0,
    unit: '',
    unit_cost: 0,
    total_amount: 0,
    currency: 'KES',
    payment_method: 'Cash',
    payment_status: 'Paid',
    amount_paid: 0,
    balance_due: 0,
    invoice_number: '',
    receipt_number: '',
    notes: '',
    recorded_by: 'Farm Manager'
  });

  // --- Handlers ---

  const handleCategorySelect = (category: ExpenseCategory) => {
    setFormData(prev => ({
      ...prev,
      category,
      // Set smart defaults based on category
      unit: category === 'Feed' ? 'bags' : category === 'Medicine' ? 'units' : ''
    }));
    setStep(2);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
    }));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseFloat(e.target.value) || 0;
    const totalAmount = quantity * formData.unit_cost;
    const balanceDue = totalAmount - formData.amount_paid;

    setFormData(prev => ({
      ...prev,
      quantity,
      total_amount: totalAmount,
      balance_due: balanceDue
    }));
  };

  const handleUnitCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const unitCost = parseFloat(e.target.value) || 0;
    const totalAmount = formData.quantity * unitCost;
    const balanceDue = totalAmount - formData.amount_paid;

    setFormData(prev => ({
      ...prev,
      unit_cost: unitCost,
      total_amount: totalAmount,
      balance_due: balanceDue
    }));
  };

  const handleTotalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const totalAmount = parseFloat(e.target.value) || 0;
    const balanceDue = totalAmount - formData.amount_paid;

    setFormData(prev => ({
      ...prev,
      total_amount: totalAmount,
      balance_due: balanceDue
    }));
  };

  const handleAmountPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amountPaid = parseFloat(e.target.value) || 0;
    const balanceDue = formData.total_amount - amountPaid;

    // Determine payment status
    let paymentStatus: PaymentStatus = 'Pending';
    if (amountPaid >= formData.total_amount) {
      paymentStatus = 'Paid';
    } else if (amountPaid > 0) {
      paymentStatus = 'Partial';
    }

    setFormData(prev => ({
      ...prev,
      amount_paid: amountPaid,
      balance_due: balanceDue,
      payment_status: paymentStatus
    }));
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }

    if (formData.total_amount === 0) {
      alert('Please enter the expense amount');
      return;
    }

    // In production, this would be an API call
    const expenseRecord = {
      ...formData,
      created_at: new Date().toISOString(),
      expense_id: `EXP-${Date.now()}`
    };

    console.log('Expense Record:', expenseRecord);
    setShowSuccess(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setStep(1);
      setFormData({
        category: 'Feed',
        description: '',
        date: new Date().toISOString().split('T')[0],
        vendor_supplier: '',
        quantity: 0,
        unit: '',
        unit_cost: 0,
        total_amount: 0,
        currency: 'KES',
        payment_method: 'Cash',
        payment_status: 'Paid',
        amount_paid: 0,
        balance_due: 0,
        invoice_number: '',
        receipt_number: '',
        notes: '',
        recorded_by: 'Farm Manager'
      });
    }, 3000);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[
        { id: 1, label: 'Category', icon: FileText },
        { id: 2, label: 'Details', icon: Receipt },
        { id: 3, label: 'Payment', icon: DollarSign },
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

  const getCategoryInfo = (category: ExpenseCategory) => {
    return EXPENSE_CATEGORIES.find(c => c.id === category) || EXPENSE_CATEGORIES[0];
  };

  const categoryInfo = getCategoryInfo(formData.category);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen font-sans text-slate-800">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <DollarSign className="text-green-600" />
          Expense Logging
        </h1>
        <p className="text-slate-500 mt-1">Record and track farm expenses for investor transparency</p>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Success Banner */}
      {showSuccess && (
        <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-xl p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 text-white rounded-full p-2">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900">Expense Recorded Successfully!</h3>
              <p className="text-sm text-green-700">
                {formData.category}: {formData.description} - {formData.currency} {formData.total_amount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8">

          {/* STEP 1: CATEGORY SELECTION */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-1">Select Expense Category</h2>
                <p className="text-sm text-slate-500">What type of expense are you recording?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EXPENSE_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`p-6 border-2 rounded-xl hover:border-${category.color}-400 hover:bg-${category.color}-50 transition-all text-left group`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-${category.color}-100 text-${category.color}-600 group-hover:bg-${category.color}-200`}>
                        <category.icon size={28} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{category.label}</h3>
                        <p className="text-sm text-slate-600 mt-1">{category.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: EXPENSE DETAILS */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg bg-${categoryInfo.color}-100 text-${categoryInfo.color}-600`}>
                  <categoryInfo.icon size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{categoryInfo.label} Details</h2>
                  <p className="text-sm text-slate-500">Provide information about this expense</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder={`e.g., ${
                      formData.category === 'Feed' ? '20 bags of Layers Mash' :
                      formData.category === 'Medicine' ? 'Newcastle Disease vaccine' :
                      formData.category === 'Infrastructure' ? 'Coop 3 Repair' :
                      formData.category === 'Salary' ? 'Weekly wages for farm staff' :
                      'Miscellaneous expense'
                    }`}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
                  />
                  <p className="text-xs text-slate-500 mt-1">Brief description of what this expense is for</p>
                </div>

                {/* Date and Vendor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                      <Calendar size={16} />
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">When was this expense incurred?</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                      <Building size={16} />
                      Vendor/Supplier
                    </label>
                    <input
                      type="text"
                      name="vendor_supplier"
                      value={formData.vendor_supplier}
                      onChange={handleChange}
                      placeholder="e.g., Pembe Feeds, Local Hardware"
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">Who did you purchase from?</p>
                  </div>
                </div>

                {/* Quantity and Unit (Optional for some categories) */}
                {formData.category !== 'Salary' && (
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-5">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Quantity Information (Optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Quantity</label>
                        <input
                          type="number"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleQuantityChange}
                          step="0.1"
                          min="0"
                          placeholder="e.g., 20"
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                        />
                        <p className="text-xs text-slate-500 mt-1">How many units?</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Unit</label>
                        <input
                          type="text"
                          name="unit"
                          value={formData.unit}
                          onChange={handleChange}
                          placeholder="e.g., bags, liters, pieces"
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">Unit of measurement</p>
                      </div>
                    </div>

                    {formData.quantity > 0 && formData.unit && (
                      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          <span className="font-semibold">{formData.quantity} {formData.unit}</span> purchased
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: COST & PAYMENT */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2 mb-1">
                  <DollarSign size={24} className="text-green-600" />
                  Cost & Payment
                </h2>
                <p className="text-sm text-slate-500">Financial details of this expense</p>
              </div>

              <div className="space-y-6">
                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full md:w-1/3 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="KES">KES (Kenyan Shilling)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </div>

                {/* Unit Cost (if quantity provided) */}
                {formData.quantity > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Cost Per {formData.unit || 'Unit'}
                    </label>
                    <input
                      type="number"
                      value={formData.unit_cost}
                      onChange={handleUnitCostChange}
                      step="0.01"
                      min="0"
                      placeholder="e.g., 2500"
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg"
                    />
                    <p className="text-xs text-slate-500 mt-1">Price per {formData.unit || 'unit'}</p>
                  </div>
                )}

                {/* Total Amount */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Total Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.total_amount}
                    onChange={handleTotalAmountChange}
                    step="0.01"
                    min="0"
                    placeholder="e.g., 50000"
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-3xl font-bold"
                  />
                  <p className="text-xs text-slate-500 mt-1">Total cost of this expense</p>
                  {formData.quantity > 0 && formData.unit_cost > 0 && (
                    <p className="text-sm text-blue-600 mt-2">
                      Auto-calculated: {formData.quantity} {formData.unit} × {formData.currency} {formData.unit_cost} = {formData.currency} {formData.total_amount.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                    <CreditCard size={16} />
                    Payment Method
                  </label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleChange}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {PAYMENT_METHODS.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">How was this expense paid?</p>
                </div>

                {/* Amount Paid */}
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-5">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Amount Paid</label>
                  <input
                    type="number"
                    value={formData.amount_paid}
                    onChange={handleAmountPaidChange}
                    step="0.01"
                    min="0"
                    max={formData.total_amount}
                    placeholder="e.g., 50000"
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xl font-bold"
                  />
                  <p className="text-xs text-slate-500 mt-1">How much has been paid so far?</p>

                  {/* Payment Status Indicator */}
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        formData.payment_status === 'Paid' ? 'bg-green-200 text-green-800' :
                        formData.payment_status === 'Partial' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-red-200 text-red-800'
                      }`}>
                        {formData.payment_status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-600">Balance Due</p>
                      <p className={`text-xl font-bold ${formData.balance_due > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formData.currency} {formData.balance_due.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Invoice and Receipt Numbers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Invoice Number</label>
                    <input
                      type="text"
                      name="invoice_number"
                      value={formData.invoice_number}
                      onChange={handleChange}
                      placeholder="e.g., INV-2025-001"
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Receipt Number</label>
                    <input
                      type="text"
                      name="receipt_number"
                      value={formData.receipt_number}
                      onChange={handleChange}
                      placeholder="e.g., RCP-2025-001"
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any additional details about this expense..."
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2 mb-1">
                  <CheckCircle2 size={24} className="text-green-600" />
                  Review Expense
                </h2>
                <p className="text-sm text-slate-500">Verify all information before submitting</p>
              </div>

              <div className="space-y-4">
                {/* Category & Description */}
                <div className={`border-2 border-${categoryInfo.color}-200 bg-${categoryInfo.color}-50 rounded-lg p-5`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-${categoryInfo.color}-100`}>
                      <categoryInfo.icon size={20} className={`text-${categoryInfo.color}-600`} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium">Category</p>
                      <p className="text-lg font-semibold text-slate-900">{formData.category}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 font-medium mb-1">Description</p>
                    <p className="text-base text-slate-900 font-medium">{formData.description || 'No description'}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
                  <h3 className="text-sm font-semibold text-blue-900 mb-3">Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700">Date</p>
                      <p className="font-semibold text-blue-900">{new Date(formData.date).toLocaleDateString()}</p>
                    </div>
                    {formData.vendor_supplier && (
                      <div>
                        <p className="text-blue-700">Vendor</p>
                        <p className="font-semibold text-blue-900">{formData.vendor_supplier}</p>
                      </div>
                    )}
                    {formData.quantity > 0 && (
                      <div>
                        <p className="text-blue-700">Quantity</p>
                        <p className="font-semibold text-blue-900">{formData.quantity} {formData.unit}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-5">
                  <h3 className="text-sm font-semibold text-green-900 mb-3">Financial Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-green-700">Total Amount</span>
                      <span className="text-2xl font-bold text-green-900">{formData.currency} {formData.total_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-green-700">Amount Paid</span>
                      <span className="font-semibold text-green-900">{formData.currency} {formData.amount_paid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-green-300 pt-2">
                      <span className="text-green-700">Balance Due</span>
                      <span className={`font-bold ${formData.balance_due > 0 ? 'text-red-600' : 'text-green-900'}`}>
                        {formData.currency} {formData.balance_due.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-green-700">Payment Method</span>
                      <span className="font-semibold text-green-900">{formData.payment_method}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 text-sm">Payment Status</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        formData.payment_status === 'Paid' ? 'bg-green-200 text-green-800' :
                        formData.payment_status === 'Partial' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-red-200 text-red-800'
                      }`}>
                        {formData.payment_status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                {(formData.invoice_number || formData.receipt_number || formData.notes) && (
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-5">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Additional Information</h3>
                    <div className="space-y-2 text-sm">
                      {formData.invoice_number && (
                        <div>
                          <span className="text-slate-600">Invoice #:</span>
                          <span className="ml-2 font-semibold text-slate-900">{formData.invoice_number}</span>
                        </div>
                      )}
                      {formData.receipt_number && (
                        <div>
                          <span className="text-slate-600">Receipt #:</span>
                          <span className="ml-2 font-semibold text-slate-900">{formData.receipt_number}</span>
                        </div>
                      )}
                      {formData.notes && (
                        <div>
                          <span className="text-slate-600">Notes:</span>
                          <p className="mt-1 text-slate-900">{formData.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
              disabled={step === 2 && !formData.description.trim()}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-sm ${
                step === 2 && !formData.description.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Next <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-sm"
            >
              <Save size={20} />
              Record Expense
            </button>
          )}
        </div>

      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg bg-${categoryInfo.color}-100 text-${categoryInfo.color}-600`}>
              <categoryInfo.icon size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-600">Category</p>
              <p className="text-xl font-bold text-slate-900">{formData.category}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 text-green-600 p-3 rounded-lg">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-600">Total Amount</p>
              <p className="text-xl font-bold text-slate-900">{formData.currency} {formData.total_amount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${
              formData.payment_status === 'Paid' ? 'bg-green-100 text-green-600' :
              formData.payment_status === 'Partial' ? 'bg-yellow-100 text-yellow-600' :
              'bg-red-100 text-red-600'
            }`}>
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-600">Payment Status</p>
              <p className="text-xl font-bold text-slate-900">{formData.payment_status}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ExpenseLoggingPage;
