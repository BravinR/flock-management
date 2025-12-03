"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

interface Batch {
  id: number;
  batchId: string;
  name: string;
  supplier: string;
  breed: string;
  arrivalDate: string;
  intakeAgeDays: number;
  initialQuantity: number;
  currentCount: number;
  currency: string;
  costPerBird: string;
  transportCost: string;
  equipmentCost: string;
  amountPaidUpfront: string;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/batches");

      if (!response.ok) {
        throw new Error("Failed to fetch batches");
      }

      const data = await response.json();
      setBatches(data);
    } catch (err) {
      const errorMessage = (err as Error).message || "Failed to load batches";
      setError(errorMessage);
      toast.error("Error loading batches", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMortality = (batch: Batch) => {
    const mortality = batch.initialQuantity - batch.currentCount;
    const mortalityRate = (mortality / batch.initialQuantity) * 100;
    return { mortality, mortalityRate: mortalityRate.toFixed(1) };
  };

  const getDaysInFarm = (arrivalDate: string) => {
    const arrival = new Date(arrivalDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - arrival.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading batches...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-600 text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Error Loading Batches
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchBatches}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">🐔</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                No Batches Yet
              </h2>
              <p className="text-gray-600 mb-6">
                Get started by creating your first batch
              </p>
              <Link
                href="/batch-intake"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create First Batch
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Flock Batches
            </h1>
            <p className="text-gray-600">
              Manage and monitor all your poultry batches
            </p>
          </div>
          <Link
            href="/batch-intake"
            className="mt-4 sm:mt-0 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + New Batch
          </Link>
        </div>

        {/* Batches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => {
            const { mortality, mortalityRate } = calculateMortality(batch);
            const daysInFarm = getDaysInFarm(batch.arrivalDate);
            const currentAge = batch.intakeAgeDays + daysInFarm;

            return (
              <div
                key={batch.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {batch.name}
                    </h3>
                    <p className="text-sm text-gray-500">{batch.batchId}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      batch.breed === "Layers"
                        ? "bg-blue-100 text-blue-700"
                        : batch.breed === "Broilers"
                        ? "bg-green-100 text-green-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {batch.breed}
                  </span>
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Count</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {batch.currentCount.toLocaleString()} birds
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Initial Count</span>
                    <span className="text-sm text-gray-500">
                      {batch.initialQuantity.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Mortality</span>
                    <span
                      className={`text-sm font-medium ${
                        Number(mortalityRate) < 5
                          ? "text-green-600"
                          : Number(mortalityRate) < 10
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {mortality} ({mortalityRate}%)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Age</span>
                    <span className="text-sm text-gray-900">
                      {currentAge} days
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Days in Farm</span>
                    <span className="text-sm text-gray-900">{daysInFarm}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Supplier</span>
                    <span className="text-sm text-gray-900">
                      {batch.supplier}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>
                      Arrived:{" "}
                      {new Date(batch.arrivalDate).toLocaleDateString()}
                    </span>
                  </div>

                  <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
