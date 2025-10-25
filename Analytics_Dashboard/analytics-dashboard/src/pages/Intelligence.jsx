import React from "react";
import { useQuery } from "@tanstack/react-query";
import DataTable from "../components/DataTable";
import BarChart from "../components/BarChart";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { breakdownsApi } from "../api/client";

const Intelligence = () => {
  // const [searchOrigin, setSearchOrigin] = useState('');
  // const [searchDestination, setSearchDestination] = useState('');

  const {
    data: carriers,
    isLoading: carriersLoading,
    error: carriersError,
  } = useQuery({
    queryKey: ["carriers"],
    queryFn: () => breakdownsApi.getByCarrier().then((res) => res.data),
  });

  const {
    data: routes,
    isLoading: routesLoading,
    error: routesError,
  } = useQuery({
    queryKey: ["routes"],
    queryFn: () => breakdownsApi.getByLane().then((res) => res.data),
  });

  const {
    data: equipment,
    isLoading: equipmentLoading,
    error: equipmentError,
  } = useQuery({
    queryKey: ["equipment"],
    queryFn: () => breakdownsApi.getByEquipment().then((res) => res.data),
  });

  // Disable recommendations for now - endpoint doesn't exist
  // const { data: recommendations, isLoading: recLoading, error: recError } = useQuery({
  //   queryKey: ['recommendations', searchOrigin, searchDestination],
  //   queryFn: () => intelligenceApi.getRecommendations(searchOrigin, searchDestination).then(res => res.data),
  //   enabled: !!searchOrigin && !!searchDestination,
  // });

  // const handleSearch = (e) => {
  //   e.preventDefault();
  //   if (searchOrigin && searchDestination) {
  //     // Query will automatically trigger due to enabled condition
  //   }
  // };

  const carrierColumns = [
    { key: "carrier_name", label: "Carrier" },
    { key: "total_calls", label: "Total Calls" },
    { key: "success_rate", label: "Success %" },
    { key: "avg_rpm", label: "Rate/Mile" },
    { key: "avg_loads_per_call", label: "Avg Loads/Call" },
    { key: "preferred_lanes", label: "Top Lanes" },
  ];

  const routeColumns = [
    { key: "lane", label: "Lane" },
    { key: "total_calls", label: "Calls" },
    { key: "success_rate", label: "Success %" },
    { key: "avg_loadboard_rate", label: "Loadboard Rate" },
    { key: "avg_rpm", label: "Rate/Mile" },
  ];

  const formatCurrency = (value) => `$${Number(value || 0).toLocaleString()}`;
  const formatPercentage = (value) => `${Number(value || 0)}%`;

  if (carriersLoading || routesLoading || equipmentLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (carriersError || routesError || equipmentError) {
    return (
      <ErrorMessage
        message="Failed to load intelligence data"
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Transform data for tables
  const carrierData =
    carriers?.map((carrier) => ({
      ...carrier,
      success_rate: Number(carrier.success_rate || 0).toFixed(1),
      avg_rpm: Number(carrier.avg_rpm || 0).toFixed(2),
      avg_loads_per_call: Number(carrier.avg_loads_per_call || 0).toFixed(1),
      preferred_lanes: carrier.preferred_lanes?.join(", ") || "N/A",
    })) || [];

  const routeData =
    routes?.map((route) => ({
      ...route,
      success_rate: Number(route.success_rate || 0).toFixed(1),
      avg_rpm: Number(route.avg_rpm || 0).toFixed(2),
      avg_loadboard_rate: Number(route.avg_loadboard_rate || 0).toFixed(2),
    })) || [];

  const equipmentData =
    equipment?.map((eq) => ({
      name: eq.equipment_type,
      calls: eq.total_calls,
    })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Carrier Intelligence
        </h1>
        <p className="text-gray-600">
          Deep insights into carrier behavior and performance
        </p>
      </div>

      {/* Recommendation Search - Disabled for now */}
      {/* <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Carrier Recommendations</h3>
        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
            <input
              type="text"
              value={searchOrigin}
              onChange={(e) => setSearchOrigin(e.target.value)}
              placeholder="e.g., Chicago, IL"
              className="input w-full"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
            <input
              type="text"
              value={searchDestination}
              onChange={(e) => setSearchDestination(e.target.value)}
              placeholder="e.g., Dallas, TX"
              className="input w-full"
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </form>
      </div> */}

      {/* Carrier Insights */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Carrier Performance
        </h3>
        <DataTable data={carrierData} columns={carrierColumns} />
      </div>

      {/* Route Performance */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Route Performance
        </h3>
        <DataTable data={routeData} columns={routeColumns} />
      </div>

      {/* Equipment Analysis */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Equipment Type Analysis
        </h3>
        <BarChart
          data={equipmentData}
          dataKey="calls"
          xAxisKey="name"
          color="#8b5cf6"
        />
      </div>
    </div>
  );
};

export default Intelligence;
