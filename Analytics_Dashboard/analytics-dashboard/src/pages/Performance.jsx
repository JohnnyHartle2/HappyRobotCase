import React, { useState } from "react";
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
  const [timeRange, setTimeRange] = useState("30"); // days
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
    queryKey: ["trends", timeRange],
    queryFn: () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      return metricsApi
        .getTrends({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        })
        .then((res) => res.data);
    },
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

  const {
    data: recentCalls,
    isLoading: recentCallsLoading,
    error: recentCallsError,
  } = useQuery({
    queryKey: ["recentCalls"],
    queryFn: () => metricsApi.getRecentCalls(10).then((res) => res.data),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const {
    data: rateVariance,
    isLoading: rateVarianceLoading,
    error: rateVarianceError,
  } = useQuery({
    queryKey: ["rateVariance"],
    queryFn: () =>
      metricsApi.getRateVarianceDistribution().then((res) => res.data),
  });

  const {
    data: conversionFunnel,
    isLoading: conversionFunnelLoading,
    error: conversionFunnelError,
  } = useQuery({
    queryKey: ["conversionFunnel"],
    queryFn: () => metricsApi.getConversionFunnel().then((res) => res.data),
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
  const recentCallsData =
    recentCalls?.map((call) => ({
      callId: call.call_id,
      carrier: call.carrier_name,
      lane: call.lane,
      outcome: call.group_outcome_simple,
      duration: formatDuration(call.call_duration_seconds),
      rate: call.final_rate_agreed
        ? `$${Number(call.final_rate_agreed).toFixed(2)}`
        : "N/A",
      date: new Date(call.created_at).toLocaleString(),
    })) || [];

  const recentCallsColumns = [
    { key: "carrier", label: "Carrier" },
    { key: "lane", label: "Lane" },
    { key: "outcome", label: "Outcome" },
    { key: "duration", label: "Duration" },
    { key: "rate", label: "Final Rate" },
    { key: "date", label: "Date/Time" },
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
          title="Avg RPM"
          value={overview?.avg_rpm || 0}
          icon={DollarSign}
          formatValue={(val) => `$${Number(val || 0).toFixed(2)}`}
        />
      </div>

      {/* Negotiation Efficiency */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Avg Negotiation Rounds
          </h4>
          <p className="text-2xl font-bold text-gray-900">
            {overview?.avg_negotiation_rounds?.toFixed(1) || 0}
          </p>
        </div>
        <div className="card">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Avg Rate Variance
          </h4>
          <p className="text-2xl font-bold text-gray-900">
            {overview?.avg_rate_variance_pct?.toFixed(1) || 0}%
          </p>
        </div>
        <div className="card">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Success Rate
          </h4>
          <p className="text-2xl font-bold text-gray-900">
            {overview?.success_rate?.toFixed(1) || 0}%
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Success Rate Over Time
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Time Range:
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setTimeRange("1")}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    timeRange === "1"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  24h
                </button>
                <button
                  onClick={() => setTimeRange("7")}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    timeRange === "7"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  7d
                </button>
                <button
                  onClick={() => setTimeRange("30")}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    timeRange === "30"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  30d
                </button>
                <button
                  onClick={() => setTimeRange("90")}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    timeRange === "90"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  90d
                </button>
              </div>
            </div>
          </div>
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

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rate Variance Distribution
          </h3>
          {rateVarianceLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : rateVarianceError ? (
            <ErrorMessage
              message="Failed to load rate variance data"
              onRetry={() => window.location.reload()}
            />
          ) : (
            <BarChart
              data={rateVariance?.buckets || []}
              dataKey="count"
              xAxisKey="bucket"
              color="#8b5cf6"
            />
          )}
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

      {/* Conversion Funnel - Full width */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Conversion Funnel
        </h3>
        {conversionFunnelLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : conversionFunnelError ? (
          <ErrorMessage
            message="Failed to load conversion funnel data"
            onRetry={() => window.location.reload()}
          />
        ) : (
          <BarChart
            data={conversionFunnel?.stages || []}
            dataKey="count"
            xAxisKey="stage"
            color="#3b82f6"
          />
        )}
      </div>

      {/* Recent Calls */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Calls
        </h3>
        {recentCallsLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : recentCallsError ? (
          <ErrorMessage
            message="Failed to load recent calls"
            onRetry={() => window.location.reload()}
          />
        ) : (
          <DataTable data={recentCallsData} columns={recentCallsColumns} />
        )}
      </div>
    </div>
  );
};

export default Performance;
