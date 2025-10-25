import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Star,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Truck,
  MapPin,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { matchingApi } from "../api/client";

const LoadMatching = () => {
  const [formData, setFormData] = useState({
    lane: "",
    equipment_type: "",
    miles: "",
    commodity_type: "",
    weight: "",
    target_rate: "",
  });
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const request = {
        lane: formData.lane,
        equipment_type: formData.equipment_type,
        miles: parseInt(formData.miles) || 0,
        commodity_type: formData.commodity_type || null,
        weight: formData.weight ? parseInt(formData.weight) : null,
        target_rate: formData.target_rate
          ? parseFloat(formData.target_rate)
          : null,
      };

      const response = await matchingApi.findCarriers(request);
      setRecommendations(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case "High":
        return "text-green-600 bg-green-100";
      case "Medium":
        return "text-yellow-600 bg-yellow-100";
      case "Low":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getConfidenceIcon = (confidence) => {
    switch (confidence) {
      case "High":
        return <CheckCircle className="h-5 w-5" />;
      case "Medium":
        return <AlertCircle className="h-5 w-5" />;
      case "Low":
        return <Clock className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Load Matching Intelligence
        </h1>
        <p className="text-gray-600">
          Find the best carriers for your specific load requirements
        </p>
      </div>

      {/* Matching Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Load Requirements
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lane *
              </label>
              <input
                type="text"
                name="lane"
                value={formData.lane}
                onChange={handleInputChange}
                placeholder="e.g., Los Angeles, CA → Phoenix, AZ"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Type *
              </label>
              <select
                name="equipment_type"
                value={formData.equipment_type}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Equipment</option>
                <option value="Dry Van">Dry Van</option>
                <option value="Flatbed">Flatbed</option>
                <option value="Refrigerated">Refrigerated</option>
                <option value="Container">Container</option>
                <option value="Tanker">Tanker</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Miles *
              </label>
              <input
                type="number"
                name="miles"
                value={formData.miles}
                onChange={handleInputChange}
                placeholder="e.g., 350"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commodity Type
              </label>
              <select
                name="commodity_type"
                value={formData.commodity_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Commodity</option>
                <option value="General Freight">General Freight</option>
                <option value="Steel Coils">Steel Coils</option>
                <option value="Electronics">Electronics</option>
                <option value="Food Products">Food Products</option>
                <option value="Automotive Parts">Automotive Parts</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (lbs)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="e.g., 42000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Rate ($)
              </label>
              <input
                type="number"
                name="target_rate"
                value={formData.target_rate}
                onChange={handleInputChange}
                placeholder="e.g., 1400"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Finding Carriers...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Find Carriers
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage message={error} />}

      {/* Recommendations */}
      {recommendations && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recommended Carriers for {recommendations.lane}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Equipment: {recommendations.equipment_type} • Found{" "}
              {recommendations.recommendations.length} matching carriers
            </p>

            <div className="space-y-4">
              {recommendations.recommendations.map((rec, index) => (
                <div
                  key={rec.carrier_id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">
                        #{index + 1}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          {rec.carrier_name}
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            Match Score: {rec.match_score}%
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getConfidenceColor(
                              rec.confidence
                            )}`}
                          >
                            {getConfidenceIcon(rec.confidence)}
                            {rec.confidence} Confidence
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        ${rec.expected_rate_min} - ${rec.expected_rate_max}
                      </div>
                      <div className="text-sm text-gray-600">
                        Expected Rate Range
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Why Recommended:
                    </h5>
                    <ul className="space-y-1">
                      {rec.reasons.map((reason, reasonIndex) => (
                        <li
                          key={reasonIndex}
                          className="text-sm text-gray-600 flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      View Contact
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Full Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {recommendations && recommendations.recommendations.length === 0 && (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Carriers Found
          </h3>
          <p className="text-gray-600">
            No carriers match your current criteria. Try adjusting your search
            parameters.
          </p>
        </div>
      )}
    </div>
  );
};

export default LoadMatching;
