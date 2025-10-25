import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Phone, TrendingUp, Clock, DollarSign, Smile } from 'lucide-react';
import KPICard from '../components/KPICard';
import LineChart from '../components/LineChart';
import DataTable from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { metricsApi } from '../api/client';

const Performance = () => {
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['overview'],
    queryFn: () => metricsApi.getOverview().then(res => res.data),
  });

  const { data: trends, isLoading: trendsLoading, error: trendsError } = useQuery({
    queryKey: ['trends'],
    queryFn: () => metricsApi.getTrends().then(res => res.data),
  });

  if (overviewLoading || trendsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (overviewError || trendsError) {
    return (
      <ErrorMessage 
        message="Failed to load performance data"
        onRetry={() => window.location.reload()}
      />
    );
  }

  const formatCurrency = (value) => `$${value.toLocaleString()}`;
  const formatPercentage = (value) => `${value}%`;

  const recentCallsColumns = [
    { key: 'carrier_name', label: 'Carrier' },
    { key: 'route', label: 'Route' },
    { key: 'outcome', label: 'Outcome' },
    { key: 'negotiation_rounds', label: 'Rounds' },
    { key: 'rate_delta', label: 'Rate Delta' },
  ];

  // Mock recent calls data (in real app, this would come from API)
  const recentCalls = [
    { carrier_name: 'Acme Transport', route: 'Chicago → Dallas', outcome: 'Accepted', negotiation_rounds: 2, rate_delta: '-$150' },
    { carrier_name: 'Swift Logistics', route: 'LA → Phoenix', outcome: 'Rejected', negotiation_rounds: 3, rate_delta: '+$200' },
    { carrier_name: 'Eagle Freight', route: 'Atlanta → Miami', outcome: 'Accepted', negotiation_rounds: 1, rate_delta: '-$75' },
    { carrier_name: 'Prime Haulers', route: 'NY → Boston', outcome: 'Accepted', negotiation_rounds: 2, rate_delta: '-$100' },
    { carrier_name: 'Titan Carriers', route: 'Denver → SLC', outcome: 'No Answer', negotiation_rounds: 0, rate_delta: '$0' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Performance Metrics</h1>
        <p className="text-gray-600">Overview of carrier call performance and trends</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard
          title="Total Calls"
          value={overview?.total_calls || 0}
          icon={Phone}
          formatValue={(val) => val.toLocaleString()}
        />
        <KPICard
          title="Conversion Rate"
          value={overview?.conversion_rate || 0}
          icon={TrendingUp}
          formatValue={formatPercentage}
          changeType="positive"
        />
        <KPICard
          title="Avg Negotiation Rounds"
          value={overview?.avg_negotiation_rounds || 0}
          icon={Clock}
          formatValue={(val) => val.toFixed(1)}
        />
        <KPICard
          title="Avg Rate Delta"
          value={overview?.avg_rate_delta || 0}
          icon={DollarSign}
          formatValue={formatCurrency}
          changeType={overview?.avg_rate_delta < 0 ? 'positive' : 'negative'}
        />
        <KPICard
          title="Sentiment Score"
          value={overview?.sentiment_distribution?.positive || 0}
          icon={Smile}
          formatValue={(val) => `${val} positive`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rate Over Time</h3>
          <LineChart
            data={trends?.data || []}
            dataKey="conversion_rate"
            xAxisKey="date"
            color="#10b981"
          />
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Over Time</h3>
          <LineChart
            data={trends?.data || []}
            dataKey="avg_sentiment"
            xAxisKey="date"
            color="#f59e0b"
          />
        </div>
      </div>

      {/* Recent Calls Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Calls</h3>
        <DataTable
          data={recentCalls}
          columns={recentCallsColumns}
        />
      </div>
    </div>
  );
};

export default Performance;
