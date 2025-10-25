import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Phone,
  TrendingUp,
  Clock,
  DollarSign,
  Smile,
  Loader,
} from "lucide-react";
import KPICard from "../components/KPICard";
import LineChart from "../components/LineChart";
import BarChart from "../components/BarChart";
import DataTable from "../components/DataTable";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { metricsApi, breakdownsApi } from "../api/client";

const Performance = () => {
  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
  } = useQuery({
    queryKey: ["overview"],
    queryFn: () => metricsApi.getOverview().then((res) => res.data),
  });

  const {
    data: trends,
    isLoading: trendsLoading,
    error: trendsError,
  } = useQuery({
    queryKey: ["trends"],
    queryFn: () => metricsApi.getTrends().then((res) => res.data),
  });

  const {
    data: laneBreakdown,
    isLoading: laneLoading,
    error: laneError,
  } = useQuery({
    queryKey: ["laneBreakdown"],
    queryFn: () => breakdownsApi.getByLane().then((res) => res.data),
  });

  const {
    data: equipmentBreakdown,
    isLoading: equipmentLoading,
    error: equipmentError,
  } = useQuery({
    queryKey: ["equipmentBreakdown"],
    queryFn: () => breakdownsApi.getByEquipment().then((res) => res.data),
  });

  if (overviewLoading || trendsLoading || laneLoading || equipmentLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (overviewError || trendsError || laneError || equipmentError) {
    return (
      <ErrorMessage
        message="Failed to load performance data"
        onRetry={() => window.location.reload()}
      />
    );
  }

  const formatCurrency = (value) => `$${value?.toLocaleString() || 0}`;
  const formatPercentage = (value) => `${value || 0}%`;
  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Sentiment distribution data
  const sentimentData = Object.entries(
    overview?.sentiment_distribution || {}
  ).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: value,
    color:
      key === "positive"
        ? "#10B981"
        : key === "negative"
        ? "#EF4444"
        : key === "unknown"
        ? "#3B82F6"
        : "#6B7280",
  }));

  // Lane breakdown data
  const topLanes =
    laneBreakdown?.slice(0, 10).map((lane) => ({
      name: lane.lane,
      calls: lane.total_calls,
      successRate: lane.success_rate,
      avgRpm: lane.avg_rpm,
      avgLoadboardRate: lane.avg_loadboard_rate,
      avgFinalRate: lane.avg_final_rate,
    })) || [];

  // Equipment breakdown data
  const equipmentData =
    equipmentBreakdown?.map((eq) => ({
      name: eq.equipment_type,
      calls: eq.total_calls,
      successRate: eq.success_rate,
      avgRpm: eq.avg_rpm,
      avgRounds: eq.avg_negotiation_rounds,
    })) || [];

  // Recent calls data
  const recentCalls =
    laneBreakdown?.slice(0, 5).map((lane) => ({
      lane: lane.lane,
      calls: lane.total_calls,
      successRate: `${lane.success_rate}%`,
      avgRpm: `$${lane.avg_rpm}`,
      avgLoadboardRate: `$${lane.avg_loadboard_rate}`,
      avgFinalRate: `$${lane.avg_final_rate}`,
    })) || [];

  const recentCallsColumns = [
    { key: "lane", label: "Lane" },
    { key: "calls", label: "Calls" },
    { key: "successRate", label: "Success Rate" },
    { key: "avgRpm", label: "Avg RPM" },
    { key: "avgLoadboardRate", label: "Loadboard Rate" },
    { key: "avgFinalRate", label: "Final Rate" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Performance Metrics
        </h1>
        <p className="text-gray-600">
          Overview of carrier call performance and trends
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Calls"
          value={overview?.total_calls || 0}
          icon={Phone}
          formatValue={(val) => val?.toLocaleString() || 0}
        />
        <KPICard
          title="Success Rate"
          value={overview?.success_rate || 0}
          icon={TrendingUp}
          formatValue={formatPercentage}
          changeType="positive"
        />
        <KPICard
          title="Avg Call Duration"
          value={overview?.avg_call_duration_seconds || 0}
          icon={Clock}
          formatValue={formatDuration}
        />
        <KPICard
          title="Avg Loads/Call"
          value={overview?.avg_loads_per_call || 0}
          icon={Loader}
          formatValue={(val) => val?.toFixed(1) || 0}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Success Rate Over Time
          </h3>
          <LineChart
            data={trends?.data || []}
            dataKey="success_rate"
            xAxisKey="date"
            color="#10b981"
          />
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sentiment Distribution
          </h3>
          <BarChart
            data={sentimentData}
            dataKey="value"
            xAxisKey="name"
            colors={sentimentData.map((item) => item.color)}
          />
        </div>
      </div>

      {/* Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Lanes by Volume
          </h3>
          <DataTable
            data={topLanes}
            columns={[
              { key: "name", label: "Lane" },
              { key: "calls", label: "Calls" },
              { key: "successRate", label: "Success Rate" },
              { key: "avgRpm", label: "Avg RPM" },
            ]}
          />
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Equipment Performance
          </h3>
          <DataTable
            data={equipmentData}
            columns={[
              { key: "name", label: "Equipment" },
              { key: "calls", label: "Calls" },
              { key: "successRate", label: "Success Rate" },
              { key: "avgRpm", label: "Avg RPM" },
            ]}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <DataTable data={recentCalls} columns={recentCallsColumns} />
      </div>
    </div>
  );
};

export default Performance;
