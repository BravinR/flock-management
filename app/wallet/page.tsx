'use client';
import React, { useState } from 'react';
import {
  Wallet,
  Send,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  User,
  RefreshCw,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';

// --- Types ---

interface WalletUser {
  id: string;
  name: string;
  role: 'Investor' | 'Staff' | 'Manager';
  balance_usd: number;
  balance_kes: number;
}

interface TransferData {
  from_user_id: string;
  to_user_id: string;
  amount: number;
  currency: 'USD' | 'KES';
  exchange_rate: number;
  amount_received: number;
  currency_received: 'USD' | 'KES';
  purpose: string;
  reference: string;
}

interface Transaction {
  id: string;
  type: 'incoming' | 'outgoing';
  from_name: string;
  to_name: string;
  amount: number;
  currency: string;
  amount_received?: number;
  currency_received?: string;
  exchange_rate?: number;
  date: string;
  purpose: string;
  status: 'completed' | 'pending';
}

// --- Sample Data ---

const USERS: WalletUser[] = [
  {
    id: 'investor_lauryn',
    name: 'Lauryn',
    role: 'Investor',
    balance_usd: 10000,
    balance_kes: 0
  },
  {
    id: 'staff_paul',
    name: 'Paul',
    role: 'Staff',
    balance_usd: 0,
    balance_kes: 127000
  },
  {
    id: 'manager_admin',
    name: 'Farm Manager',
    role: 'Manager',
    balance_usd: 500,
    balance_kes: 50000
  }
];

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn_001',
    type: 'incoming',
    from_name: 'Lauryn',
    to_name: 'Paul',
    amount: 500,
    currency: 'USD',
    amount_received: 63500,
    currency_received: 'KES',
    exchange_rate: 127,
    date: '2025-01-20',
    purpose: 'Monthly farm operations budget',
    status: 'completed'
  },
  {
    id: 'txn_002',
    type: 'incoming',
    from_name: 'Lauryn',
    to_name: 'Paul',
    amount: 300,
    currency: 'USD',
    amount_received: 38100,
    currency_received: 'KES',
    exchange_rate: 127,
    date: '2025-01-15',
    purpose: 'Feed purchase',
    status: 'completed'
  }
];

// --- Component ---

const WalletPage: React.FC = () => {
  // Current logged in user (in production, this would come from auth)
  const [currentUser] = useState<WalletUser>(USERS[0]); // Lauryn (Investor)

  const [users] = useState<WalletUser[]>(USERS);
  const [transactions, setTransactions] = useState<Transaction[]>(SAMPLE_TRANSACTIONS);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  const [transferData, setTransferData] = useState<TransferData>({
    from_user_id: currentUser.id,
    to_user_id: 'staff_paul', // Default to Paul
    amount: 0,
    currency: 'USD',
    exchange_rate: 127,
    amount_received: 0,
    currency_received: 'KES',
    purpose: '',
    reference: ''
  });

  // --- Handlers ---

  const handleTransferChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value;

    setTransferData(prev => {
      const updated = { ...prev, [name]: newValue };

      // Auto-calculate converted amount when amount or rate changes
      if (name === 'amount' || name === 'exchange_rate') {
        const amount = name === 'amount' ? parseFloat(value) || 0 : prev.amount;
        const rate = name === 'exchange_rate' ? parseFloat(value) || 0 : prev.exchange_rate;

        if (updated.currency === 'USD') {
          updated.amount_received = amount * rate;
          updated.currency_received = 'KES';
        } else {
          updated.amount_received = amount / rate;
          updated.currency_received = 'USD';
        }
      }

      // If currency changes, swap and recalculate
      if (name === 'currency') {
        if (value === 'USD') {
          updated.currency_received = 'KES';
          updated.amount_received = updated.amount * updated.exchange_rate;
        } else {
          updated.currency_received = 'USD';
          updated.amount_received = updated.amount / updated.exchange_rate;
        }
      }

      return updated;
    });
  };

  const handleSendMoney = () => {
    // Validation
    if (transferData.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!transferData.to_user_id) {
      alert('Please select a recipient');
      return;
    }

    if (!transferData.purpose.trim()) {
      alert('Please enter the purpose of this transfer');
      return;
    }

    // Check sufficient balance
    const senderBalance = transferData.currency === 'USD' ? currentUser.balance_usd : currentUser.balance_kes;
    if (transferData.amount > senderBalance) {
      alert(`Insufficient balance. You have ${transferData.currency} ${senderBalance.toLocaleString()}`);
      return;
    }

    const recipient = users.find(u => u.id === transferData.to_user_id);

    // Create transaction record
    const newTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      type: 'outgoing',
      from_name: currentUser.name,
      to_name: recipient?.name || 'Unknown',
      amount: transferData.amount,
      currency: transferData.currency,
      amount_received: transferData.amount_received,
      currency_received: transferData.currency_received,
      exchange_rate: transferData.exchange_rate,
      date: new Date().toISOString().split('T')[0],
      purpose: transferData.purpose,
      status: 'completed'
    };

    // In production, this would be an API call
    console.log('Transfer:', {
      ...transferData,
      from_name: currentUser.name,
      to_name: recipient?.name,
      timestamp: new Date().toISOString()
    });

    setTransactions(prev => [newTransaction, ...prev]);
    setShowSuccess(true);
    setShowTransferForm(false);

    // Reset form after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setTransferData({
        from_user_id: currentUser.id,
        to_user_id: 'staff_paul',
        amount: 0,
        currency: 'USD',
        exchange_rate: 127,
        amount_received: 0,
        currency_received: 'KES',
        purpose: '',
        reference: ''
      });
    }, 3000);
  };

  const getRecipient = (userId: string) => users.find(u => u.id === userId);
  const recipient = getRecipient(transferData.to_user_id);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen font-sans text-slate-800">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Wallet className="text-blue-600" />
          Wallet & Remittances
        </h1>
        <p className="text-slate-500 mt-1">Send money and track balances</p>
      </div>

      {/* Success Banner */}
      {showSuccess && (
        <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-xl p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 text-white rounded-full p-2">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900">Transfer Successful!</h3>
              <p className="text-sm text-green-700">
                {transferData.currency} {transferData.amount.toLocaleString()} sent to {recipient?.name}
                {transferData.currency !== transferData.currency_received && (
                  <> • Received {transferData.currency_received} {transferData.amount_received.toLocaleString()}</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* USD Balance */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-blue-100 text-sm font-medium">USD Balance</p>
              <div className="flex items-center gap-2 mt-2">
                {showBalance ? (
                  <p className="text-4xl font-bold">${currentUser.balance_usd.toLocaleString()}</p>
                ) : (
                  <p className="text-4xl font-bold">••••••</p>
                )}
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="bg-blue-400 bg-opacity-30 p-3 rounded-lg">
              <DollarSign size={28} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-blue-100 text-sm">
            <User size={16} />
            <span>{currentUser.name} ({currentUser.role})</span>
          </div>
        </div>

        {/* KES Balance */}
        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-green-100 text-sm font-medium">KES Balance</p>
              <div className="flex items-center gap-2 mt-2">
                {showBalance ? (
                  <p className="text-4xl font-bold">KES {currentUser.balance_kes.toLocaleString()}</p>
                ) : (
                  <p className="text-4xl font-bold">••••••</p>
                )}
              </div>
            </div>
            <div className="bg-green-400 bg-opacity-30 p-3 rounded-lg">
              <Wallet size={28} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-100 text-sm">
            <RefreshCw size={16} />
            <span>Rate: 1 USD = {transferData.exchange_rate} KES</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setShowTransferForm(!showTransferForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
        >
          <Send size={20} />
          Send Money
        </button>
      </div>

      {/* Transfer Form */}
      {showTransferForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-blue-50 border-b border-blue-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Send className="text-blue-600" />
              Send Money
            </h2>
            <p className="text-sm text-slate-600 mt-1">Transfer funds to staff wallet</p>
          </div>

          <div className="p-6 space-y-6">
            {/* From (Current User) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">From</label>
              <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{currentUser.name}</p>
                    <p className="text-sm text-slate-600">{currentUser.role}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* To (Recipient) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">To</label>
              <select
                name="to_user_id"
                value={transferData.to_user_id}
                onChange={handleTransferChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {users
                  .filter(u => u.id !== currentUser.id)
                  .map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Defaults to Paul (Staff)</p>
            </div>

            {/* Amount and Currency */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-5">
              <label className="block text-sm font-medium text-slate-700 mb-3">Amount to Send</label>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="col-span-2">
                  <input
                    type="number"
                    name="amount"
                    value={transferData.amount}
                    onChange={handleTransferChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full p-4 text-3xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <select
                    name="currency"
                    value={transferData.currency}
                    onChange={handleTransferChange}
                    className="w-full h-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg font-semibold"
                  >
                    <option value="USD">USD</option>
                    <option value="KES">KES</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Your balance: {transferData.currency} {
                  transferData.currency === 'USD'
                    ? currentUser.balance_usd.toLocaleString()
                    : currentUser.balance_kes.toLocaleString()
                }
              </p>
            </div>

            {/* Exchange Rate */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <RefreshCw size={16} />
                Exchange Rate (1 USD = ? KES)
              </label>
              <input
                type="number"
                name="exchange_rate"
                value={transferData.exchange_rate}
                onChange={handleTransferChange}
                step="0.01"
                min="0"
                placeholder="127"
                className="w-full md:w-1/2 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg"
              />
              <p className="text-xs text-slate-500 mt-1">Default: 127 (editable)</p>
            </div>

            {/* Conversion Preview */}
            {transferData.amount > 0 && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <TrendingUp size={16} />
                  Conversion Preview
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-blue-700">You send</span>
                    <span className="font-bold text-blue-900">
                      {transferData.currency} {transferData.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-center py-2">
                    <ArrowDownLeft className="text-blue-500" size={24} />
                  </div>
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-blue-700">{recipient?.name} receives</span>
                    <span className="font-bold text-green-600 text-2xl">
                      {transferData.currency_received} {transferData.amount_received.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  {transferData.currency !== transferData.currency_received && (
                    <p className="text-xs text-blue-700 text-center pt-2 border-t border-blue-200">
                      Rate: 1 {transferData.currency === 'USD' ? 'USD' : 'KES'} = {transferData.exchange_rate} {transferData.currency_received}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Purpose */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Purpose / Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="purpose"
                value={transferData.purpose}
                onChange={handleTransferChange}
                rows={3}
                placeholder="e.g., Monthly farm operations budget, Feed purchase, Staff salary"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
              <p className="text-xs text-slate-500 mt-1">Required: Explain the purpose of this transfer</p>
            </div>

            {/* Reference Number (Optional) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reference Number (Optional)
              </label>
              <input
                type="text"
                name="reference"
                value={transferData.reference}
                onChange={handleTransferChange}
                placeholder="e.g., TXN-2025-001"
                className="w-full md:w-1/2 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={() => setShowTransferForm(false)}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-slate-700 font-medium hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSendMoney}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Send size={18} />
              Send {transferData.currency} {transferData.amount.toLocaleString()}
            </button>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Transaction History</h2>
          <p className="text-sm text-slate-600 mt-1">Recent transfers and remittances</p>
        </div>

        <div className="divide-y divide-gray-200">
          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="text-slate-400" size={32} />
              </div>
              <p className="text-slate-600 font-medium">No transactions yet</p>
              <p className="text-sm text-slate-500 mt-1">Send money to see your transaction history</p>
            </div>
          ) : (
            transactions.map((txn) => (
              <div key={txn.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      txn.type === 'incoming'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {txn.type === 'incoming' ? (
                        <ArrowDownLeft size={24} />
                      ) : (
                        <ArrowUpRight size={24} />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-slate-900">
                          {txn.type === 'incoming' ? 'Received from' : 'Sent to'} {
                            txn.type === 'incoming' ? txn.from_name : txn.to_name
                          }
                        </p>
                        {txn.status === 'completed' ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            Completed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full flex items-center gap-1">
                            <Clock size={12} />
                            Pending
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-600 mb-2">{txn.purpose}</p>

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(txn.date).toLocaleDateString()}
                        </span>
                        {txn.exchange_rate && (
                          <span className="flex items-center gap-1">
                            <RefreshCw size={14} />
                            Rate: {txn.exchange_rate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-2xl font-bold ${
                      txn.type === 'incoming' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {txn.type === 'incoming' ? '+' : '-'}
                      {txn.currency} {txn.amount.toLocaleString()}
                    </p>
                    {txn.amount_received && txn.currency_received && (
                      <p className="text-sm text-slate-600 mt-1">
                        = {txn.currency_received} {txn.amount_received.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default WalletPage;
