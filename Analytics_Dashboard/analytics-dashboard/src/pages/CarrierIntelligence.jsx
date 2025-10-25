import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Star,
  TrendingUp,
  Clock,
  DollarSign,
  Truck,
  MapPin,
} from "lucide-react";
import KPICard from "../components/KPICard";
import DataTable from "../components/DataTable";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { carriersApi } from "../api/client";

const CarrierIntelligence = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("success_rate");

  const {
    data: carriers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["carriers"],
    queryFn: () => carriersApi.getCarriers().then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message="Failed to load carrier data"
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Filter and sort carriers
  const filteredCarriers =
    carriers
      ?.filter((carrier) => {
        const matchesSearch = carrier.carrier_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || carrier.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      ?.sort((a, b) => {
        switch (sortBy) {
          case "success_rate":
            return (b.success_rate || 0) - (a.success_rate || 0);
          case "avg_rpm":
            return (b.avg_rpm || 0) - (a.avg_rpm || 0);
          case "total_calls":
            return (b.total_calls || 0) - (a.total_calls || 0);
          case "name":
            return a.carrier_name.localeCompare(b.carrier_name);
          default:
            return 0;
        }
      }) || [];

  const formatPercentage = (value) => `${Number(value || 0).toFixed(2)}%`;
  const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;
  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(Number(seconds) / 60);
    const remainingSeconds = Number(seconds) % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const carrierCards = filteredCarriers.map((carrier) => ({
    id: carrier.carrier_id,
    name: carrier.carrier_name,
    mcNumber: carrier.mc_number,
    status: carrier.status,
    preferred: carrier.preferred,
    successRate: Number(carrier.success_rate || 0),
    avgRpm: Number(carrier.avg_rpm || 0),
    totalCalls: carrier.total_calls,
    avgCallDuration: carrier.avg_call_duration_seconds,
    avgLoadsPerCall: Number(carrier.avg_loads_per_call || 0),
    lastCallDate: carrier.last_call_date,
  }));

  const carrierTableData = filteredCarriers.map((carrier) => ({
    id: carrier.carrier_id,
    name: carrier.carrier_name,
    mcNumber: carrier.mc_number,
    status: carrier.status,
    preferred: carrier.preferred,
    totalCalls: carrier.total_calls,
    successRate: `${Number(carrier.success_rate || 0).toFixed(2)}%`,
    avgRpm: `$${carrier.avg_rpm || 0}`,
    avgLoadsPerCall: carrier.avg_loads_per_call
      ? Number(carrier.avg_loads_per_call).toFixed(1)
      : 0,
    lastCallDate: carrier.last_call_date
      ? new Date(carrier.last_call_date).toLocaleDateString()
      : "Never",
  }));

  const tableColumns = [
    { key: "name", label: "Carrier Name" },
    { key: "mcNumber", label: "MC Number" },
    { key: "status", label: "Status" },
    { key: "totalCalls", label: "Total Calls" },
    { key: "successRate", label: "Success Rate" },
    { key: "avgRpm", label: "Avg RPM" },
    { key: "avgLoadsPerCall", label: "Avg Loads/Call" },
    { key: "lastCallDate", label: "Last Call" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Carrier Intelligence
        </h1>
        <p className="text-gray-600">
          Comprehensive carrier performance analysis and insights
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search carriers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="watch_list">Watch List</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="success_rate">Success Rate</option>
              <option value="avg_rpm">Avg RPM</option>
              <option value="total_calls">Total Calls</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          title="Total Carriers"
          value={carriers?.length || 0}
          icon={Truck}
          formatValue={(val) => val?.toLocaleString() || 0}
        />
        <KPICard
          title="Active Carriers"
          value={carriers?.filter((c) => c.status === "active").length || 0}
          icon={TrendingUp}
          formatValue={(val) => val?.toLocaleString() || 0}
        />
        <KPICard
          title="Preferred Carriers"
          value={carriers?.filter((c) => c.preferred).length || 0}
          icon={Star}
          formatValue={(val) => val?.toLocaleString() || 0}
        />
        <KPICard
          title="Avg Success Rate"
          value={Number(
            carriers?.reduce((sum, c) => sum + (c.success_rate || 0), 0) /
              (carriers?.length || 1) || 0
          ).toFixed(2)}
          icon={TrendingUp}
          formatValue={formatPercentage}
        />
      </div>

      {/* Carrier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {carrierCards.map((carrier) => (
          <div
            key={carrier.id}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {carrier.preferred && (
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  )}
                  {carrier.name}
                </h3>
                {carrier.mcNumber && (
                  <p className="text-sm text-gray-500">
                    MC #{carrier.mcNumber}
                  </p>
                )}
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  carrier.status === "active"
                    ? "bg-green-100 text-green-800"
                    : carrier.status === "inactive"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {carrier.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-sm font-medium">
                  {formatPercentage(carrier.successRate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg RPM</span>
                <span className="text-sm font-medium">
                  {formatCurrency(carrier.avgRpm)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Calls</span>
                <span className="text-sm font-medium">
                  {carrier.totalCalls}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Duration</span>
                <span className="text-sm font-medium">
                  {formatDuration(carrier.avgCallDuration)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Loads/Call</span>
                <span className="text-sm font-medium">
                  {carrier.avgLoadsPerCall?.toFixed(1) || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Call</span>
                <span className="text-sm font-medium">
                  {carrier.lastCallDate
                    ? new Date(carrier.lastCallDate).toLocaleDateString()
                    : "Never"}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          All Carriers
        </h3>
        <DataTable data={carrierTableData} columns={tableColumns} />
      </div>
    </div>
  );
};

export default CarrierIntelligence;
