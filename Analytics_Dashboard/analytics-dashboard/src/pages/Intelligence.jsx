import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Truck, Star, TrendingUp } from 'lucide-react';
import DataTable from '../components/DataTable';
import BarChart from '../components/BarChart';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { breakdownsApi, intelligenceApi } from '../api/client';

const Intelligence = () => {
  const [searchOrigin, setSearchOrigin] = useState('');
  const [searchDestination, setSearchDestination] = useState('');

  const { data: carriers, isLoading: carriersLoading, error: carriersError } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => breakdownsApi.getByCarrier().then(res => res.data),
  });

  const { data: routes, isLoading: routesLoading, error: routesError } = useQuery({
    queryKey: ['routes'],
    queryFn: () => breakdownsApi.getByRoute().then(res => res.data),
  });

  const { data: equipment, isLoading: equipmentLoading, error: equipmentError } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => breakdownsApi.getByEquipment().then(res => res.data),
  });

  const { data: recommendations, isLoading: recLoading, error: recError } = useQuery({
    queryKey: ['recommendations', searchOrigin, searchDestination],
    queryFn: () => intelligenceApi.getRecommendations(searchOrigin, searchDestination).then(res => res.data),
    enabled: !!searchOrigin && !!searchDestination,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchOrigin && searchDestination) {
      // Query will automatically trigger due to enabled condition
    }
  };

  const carrierColumns = [
    { key: 'carrier_name', label: 'Carrier' },
    { key: 'total_calls', label: 'Total Calls' },
    { key: 'conversion_rate', label: 'Conversion %' },
    { key: 'avg_rate_per_mile', label: 'Rate/Mile' },
    { key: 'booking_frequency', label: 'Calls/Day' },
    { key: 'preferred_routes', label: 'Top Routes' },
  ];

  const routeColumns = [
    { key: 'route', label: 'Route' },
    { key: 'total_calls', label: 'Calls' },
    { key: 'conversion_rate', label: 'Conversion %' },
    { key: 'avg_rate', label: 'Avg Rate' },
    { key: 'avg_rate_per_mile', label: 'Rate/Mile' },
  ];

  const formatCurrency = (value) => `$${value.toLocaleString()}`;
  const formatPercentage = (value) => `${value}%`;

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
  const carrierData = carriers?.map(carrier => ({
    ...carrier,
    preferred_routes: carrier.preferred_routes?.join(', ') || 'N/A',
  })) || [];

  const routeData = routes?.map(route => ({
    ...route,
    route: `${route.origin} → ${route.destination}`,
  })) || [];

  const equipmentData = equipment?.map(eq => ({
    name: eq.equipment_type,
    calls: eq.total_calls,
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Carrier Intelligence</h1>
        <p className="text-gray-600">Deep insights into carrier behavior and performance</p>
      </div>

      {/* Recommendation Search */}
      <div className="card">
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

        {recLoading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        )}

        {recError && (
          <div className="text-red-600 text-sm">Failed to load recommendations</div>
        )}

        {recommendations && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">
              Top Recommendations for {searchOrigin} → {searchDestination}
            </h4>
            {recommendations.recommendations?.map((rec, index) => (
              <div key={rec.carrier_mc_number} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium">{rec.carrier_name}</div>
                    <div className="text-sm text-gray-600">{rec.reasons.join(', ')}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary-600">{rec.score}/100</div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Carrier Insights */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Carrier Performance</h3>
        <DataTable
          data={carrierData}
          columns={carrierColumns}
        />
      </div>

      {/* Route Performance */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Performance</h3>
        <DataTable
          data={routeData}
          columns={routeColumns}
        />
      </div>

      {/* Equipment Analysis */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Type Analysis</h3>
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
