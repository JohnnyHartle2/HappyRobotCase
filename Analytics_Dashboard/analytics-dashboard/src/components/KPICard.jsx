import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const KPICard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  formatValue = (val) => val,
  className = '' 
}) => {
  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatValue(value)}
          </p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 ${getChangeColor()}`}>
              {getChangeIcon()}
              <span className="text-sm font-medium ml-1">
                {change > 0 ? '+' : ''}{change}%
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-primary-50 rounded-lg">
            <Icon className="w-6 h-6 text-primary-600" />
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
