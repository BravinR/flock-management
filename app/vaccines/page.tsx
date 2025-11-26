'use client';
import React, { useState } from 'react';
import {
  Calendar,
  Syringe,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  FileText,
  X,
  Check,
  Plus
} from 'lucide-react';

// --- Types ---

type VaccineStatus = 'pending' | 'completed' | 'overdue' | 'upcoming';

interface VaccineSchedule {
  id: string;
  vaccine_name: string;
  week_number: number;
  scheduled_date: string;
  status: VaccineStatus;
  description?: string;
}

interface VaccineAdministration {
  schedule_id: string;
  administration_date: string;
  full_flock_vaccinated: boolean;
  head_count_vaccinated?: number;
  cost: number;
  currency: string;
  notes: string;
  administered_by: string;
}

// --- Sample Data (In production, this would come from API) ---

const VACCINE_SCHEDULES: VaccineSchedule[] = [
  {
    id: '1',
    vaccine_name: 'Marek\'s Disease',
    week_number: 0,
    scheduled_date: '2025-01-01',
    status: 'completed',
    description: 'Given at hatchery or day 1'
  },
  {
    id: '2',
    vaccine_name: 'Newcastle Disease (ND)',
    week_number: 1,
    scheduled_date: '2025-01-08',
    status: 'completed',
    description: 'First dose via eye drop or spray'
  },
  {
    id: '3',
    vaccine_name: 'Infectious Bursal Disease (Gumboro)',
    week_number: 2,
    scheduled_date: '2025-01-15',
    status: 'pending',
    description: 'Drinking water administration'
  },
  {
    id: '4',
    vaccine_name: 'Newcastle Disease (ND) - Booster',
    week_number: 4,
    scheduled_date: '2025-01-29',
    status: 'upcoming',
    description: 'Second dose booster'
  },
  {
    id: '5',
    vaccine_name: 'Fowl Pox',
    week_number: 6,
    scheduled_date: '2025-02-12',
    status: 'upcoming',
    description: 'Wing web method'
  },
  {
    id: '6',
    vaccine_name: 'Fowl Typhoid',
    week_number: 8,
    scheduled_date: '2025-02-26',
    status: 'upcoming',
    description: 'Intramuscular injection'
  },
];

// --- Component ---

const VaccineTrackingPage: React.FC = () => {
  const [schedules, setSchedules] = useState<VaccineSchedule[]>(VACCINE_SCHEDULES);
  const [selectedSchedule, setSelectedSchedule] = useState<VaccineSchedule | null>(null);
  const [showAdminForm, setShowAdminForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    schedule_id: '',
    custom_vaccine_name: '',
    administration_date: new Date().toISOString().split('T')[0],
    full_flock_vaccinated: true,
    head_count_vaccinated: 0,
    cost: 0,
    currency: 'KES',
    notes: '',
    administered_by: 'Admin'
  });

  const totalBirds = 500; // This would come from the batch data

  const handleScheduleClick = (schedule: VaccineSchedule) => {
    setSelectedSchedule(schedule);
    setShowAdminForm(true);
    setFormData({
      schedule_id: schedule.id,
      custom_vaccine_name: '',
      administration_date: new Date().toISOString().split('T')[0],
      full_flock_vaccinated: true,
      head_count_vaccinated: totalBirds,
      cost: 0,
      currency: 'KES',
      notes: '',
      administered_by: 'Admin'
    });
  };

  const openAdminForm = () => {
    // Open form without a pre-selected schedule (user will select from dropdown)
    setSelectedSchedule(null);
    setShowAdminForm(true);
    setFormData({
      schedule_id: '',
      custom_vaccine_name: '',
      administration_date: new Date().toISOString().split('T')[0],
      full_flock_vaccinated: true,
      head_count_vaccinated: totalBirds,
      cost: 0,
      currency: 'KES',
      notes: '',
      administered_by: 'Admin'
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        // If checking "full flock", set count to total, otherwise reset to 0
        ...(name === 'full_flock_vaccinated' && {
          head_count_vaccinated: checked ? totalBirds : 0
        })
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
      }));
    }
  };

  const handleSubmit = () => {
    // If no schedule selected, user must select from dropdown
    const scheduleId = selectedSchedule?.id || formData.schedule_id;

    // If "other" is selected, validate custom vaccine name
    if (scheduleId === 'other') {
      if (!formData.custom_vaccine_name.trim()) {
        alert('Please enter the vaccine name');
        return;
      }
    } else if (!scheduleId) {
      alert('Please select a vaccine from the list');
      return;
    }

    // In production, this would be an API call
    const administration: VaccineAdministration = {
      schedule_id: scheduleId,
      ...formData
    };

    console.log('Vaccine Administration:', administration);

    // Update the schedule status (only if not "other")
    if (scheduleId !== 'other') {
      setSchedules(prev => prev.map(s =>
        s.id === scheduleId
          ? { ...s, status: 'completed' as VaccineStatus }
          : s
      ));
    }

    // Close form
    setShowAdminForm(false);
    setSelectedSchedule(null);

    alert('Vaccine administration recorded successfully!');
  };

  const getStatusBadge = (status: VaccineStatus) => {
    const styles = {
      completed: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      overdue: 'bg-red-100 text-red-700 border-red-200',
      upcoming: 'bg-blue-100 text-blue-700 border-blue-200'
    };

    const icons = {
      completed: <CheckCircle2 size={14} />,
      pending: <Clock size={14} />,
      overdue: <AlertCircle size={14} />,
      upcoming: <Calendar size={14} />
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border inline-flex items-center gap-1 ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getStatusIcon = (status: VaccineStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="text-green-500" size={24} />;
      case 'overdue':
        return <AlertCircle className="text-red-500" size={24} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={24} />;
      default:
        return <Calendar className="text-blue-500" size={24} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans text-slate-800">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Syringe className="text-blue-600" />
            Vaccine Schedule & Tracking
          </h1>
          <p className="text-slate-500 mt-1">Track vaccination schedule and record administrations</p>
        </div>
        <button
          onClick={openAdminForm}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-all"
        >
          <Plus size={20} />
          Record Vaccination
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Completed', count: schedules.filter(s => s.status === 'completed').length, color: 'green' },
          { label: 'Pending', count: schedules.filter(s => s.status === 'pending').length, color: 'yellow' },
          { label: 'Overdue', count: schedules.filter(s => s.status === 'overdue').length, color: 'red' },
          { label: 'Upcoming', count: schedules.filter(s => s.status === 'upcoming').length, color: 'blue' },
        ].map((stat) => (
          <div key={stat.label} className={`bg-white rounded-lg border-2 border-${stat.color}-200 p-4`}>
            <p className="text-sm text-slate-600">{stat.label}</p>
            <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Vaccine Schedule List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900">Vaccination Timeline</h2>
          <p className="text-sm text-slate-500 mt-1">Click on any vaccine to view details or record administration</p>
        </div>

        <div className="divide-y divide-gray-200">
          {schedules.map((schedule, index) => (
            <div
              key={schedule.id}
              onClick={() => handleScheduleClick(schedule)}
              className="p-6 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  {getStatusIcon(schedule.status)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{schedule.vaccine_name}</h3>
                      <p className="text-sm text-slate-600 mt-1">{schedule.description}</p>
                    </div>
                    {getStatusBadge(schedule.status)}
                  </div>

                  <div className="flex items-center gap-6 mt-3 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>Week {schedule.week_number}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{new Date(schedule.scheduled_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Administration Form Modal */}
      {showAdminForm && (
        <div className="fixed inset-0 lg:left-64 bg-gray-500 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <Syringe className="text-blue-500" />
                  Administer Vaccine
                </h2>
                {selectedSchedule && (
                  <p className="text-sm text-slate-600 mt-1">{selectedSchedule.vaccine_name} - Week {selectedSchedule.week_number}</p>
                )}
              </div>
              <button
                onClick={() => setShowAdminForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">

              {/* Vaccine Selector - Only show if no vaccine pre-selected */}
              {!selectedSchedule && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Select Vaccine
                    </label>
                    <select
                      name="schedule_id"
                      value={formData.schedule_id}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Choose a vaccine...</option>
                      {schedules.map((schedule) => (
                        <option key={schedule.id} value={schedule.id}>
                          Week {schedule.week_number}: {schedule.vaccine_name} - {schedule.status}
                        </option>
                      ))}
                      <option value="other">Other (Custom Vaccine)</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Select which vaccine was administered</p>
                  </div>

                  {/* Custom Vaccine Name - Only show if "Other" is selected */}
                  {formData.schedule_id === 'other' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Vaccine Name
                      </label>
                      <input
                        type="text"
                        name="custom_vaccine_name"
                        value={formData.custom_vaccine_name}
                        onChange={handleChange}
                        placeholder="Enter vaccine name (e.g., Avian Influenza, Salmonella)"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <p className="text-xs text-slate-500 mt-1">Type the name of the vaccine you administered</p>
                    </div>
                  )}
                </div>
              )}

              {/* Administration Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Administration Date
                </label>
                <input
                  type="date"
                  name="administration_date"
                  value={formData.administration_date}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">Did you give it today? If not, select the actual date.</p>
              </div>

              {/* Full Flock Vaccination */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="full_flock"
                    name="full_flock_vaccinated"
                    checked={formData.full_flock_vaccinated}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <label htmlFor="full_flock" className="font-medium text-slate-900 cursor-pointer">
                      Was the whole flock vaccinated?
                    </label>
                    <p className="text-xs text-slate-600 mt-1">Total birds in batch: {totalBirds}</p>
                  </div>
                </div>

                {/* Conditional: Head Count Input */}
                {!formData.full_flock_vaccinated && (
                  <div className="mt-4 pl-7">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Head Count Vaccinated
                    </label>
                    <input
                      type="number"
                      name="head_count_vaccinated"
                      value={formData.head_count_vaccinated}
                      onChange={handleChange}
                      max={totalBirds}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      How many birds received the vaccine? (Max: {totalBirds})
                    </p>
                  </div>
                )}
              </div>

              {/* Cost Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                  <DollarSign size={16} />
                  Medicine Cost
                </label>
                <div className="flex gap-3">
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="KES">KES</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    step="0.01"
                    className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">How much did the medicine cost?</p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                  <FileText size={16} />
                  Notes & Observations
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Any reactions? Birds looking drowsy? Any adverse effects noticed?"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">Record any observations or reactions from the flock</p>
              </div>

              {/* Administered By */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Administered By
                </label>
                <input
                  type="text"
                  name="administered_by"
                  value={formData.administered_by}
                  onChange={handleChange}
                  placeholder="Your name or staff member name"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowAdminForm(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-slate-700 font-medium hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Check size={18} />
                Record Administration
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default VaccineTrackingPage;
