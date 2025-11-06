import React from 'react';

function QuickStats({ dailyStats, date }) {
  const stats = [
    {
      label: 'Weight',
      value: dailyStats?.weight_kg ? `${dailyStats.weight_kg} kg` : '--',
      icon: '⚖️',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Sleep',
      value: dailyStats?.sleep_hours ? `${dailyStats.sleep_hours} hrs` : '--',
      icon: '😴',
      color: 'bg-purple-50 text-purple-700',
    },
    {
      label: 'Steps',
      value: dailyStats?.steps ? dailyStats.steps.toLocaleString() : '--',
      icon: '👟',
      color: 'bg-green-50 text-green-700',
    },
    {
      label: 'Water',
      value: dailyStats?.water_l ? `${dailyStats.water_l} L` : '--',
      icon: '💧',
      color: 'bg-cyan-50 text-cyan-700',
    },
  ];

  const micronutrientStatus = [
    { name: 'Vitamin D', status: 'low', color: 'text-yellow-600' },
    { name: 'Iron', status: 'optimal', color: 'text-green-600' },
    { name: 'B12', status: 'deficient', color: 'text-red-600' },
    { name: 'Magnesium', status: 'sufficient', color: 'text-blue-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className={`${stat.color} rounded-lg p-3`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium opacity-75">{stat.label}</p>
                  <p className="text-lg font-semibold">{stat.value}</p>
                </div>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Micronutrient Status Preview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Micronutrient Status</h2>
        <div className="space-y-2">
          {micronutrientStatus.map((nutrient) => (
            <div key={nutrient.name} className="flex justify-between items-center">
              <span className="text-sm text-gray-700">{nutrient.name}</span>
              <span className={`text-sm font-medium ${nutrient.color}`}>
                {nutrient.status}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Complete tracking coming in Week 4
        </p>
      </div>

      {/* Recent Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h2>
        <div className="bg-primary-50 border-l-4 border-primary-400 p-4">
          <p className="text-sm text-primary-900">
            Your protein intake has been consistently below target for the past 3 days.
          </p>
          <p className="text-xs text-primary-700 mt-2">
            Consider adding lean meats or protein supplements.
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          AI analysis coming in Week 5
        </p>
      </div>
    </div>
  );
}

export default QuickStats;
