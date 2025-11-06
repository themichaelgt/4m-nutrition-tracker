import React from 'react';

function MacroProgress({ dailyStats, goals }) {
  const macros = [
    {
      name: 'Calories',
      current: dailyStats?.calories || 0,
      goal: parseFloat(goals?.calorie_goal) || 2500,
      unit: 'kcal',
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-100',
    },
    {
      name: 'Protein',
      current: dailyStats?.protein_g || 0,
      goal: parseFloat(goals?.protein_goal) || 150,
      unit: 'g',
      color: 'bg-red-500',
      lightColor: 'bg-red-100',
    },
    {
      name: 'Carbs',
      current: dailyStats?.carbs_g || 0,
      goal: parseFloat(goals?.carbs_goal) || 300,
      unit: 'g',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-100',
    },
    {
      name: 'Fat',
      current: dailyStats?.fat_g || 0,
      goal: parseFloat(goals?.fat_goal) || 80,
      unit: 'g',
      color: 'bg-green-500',
      lightColor: 'bg-green-100',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Macros</h2>
      
      <div className="space-y-4">
        {macros.map((macro) => {
          const percentage = Math.min((macro.current / macro.goal) * 100, 100);
          const remaining = Math.max(macro.goal - macro.current, 0);
          
          return (
            <div key={macro.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{macro.name}</span>
                <span className="text-gray-600">
                  {macro.current.toFixed(1)} / {macro.goal} {macro.unit}
                </span>
              </div>
              
              <div className="relative">
                <div className={`h-6 ${macro.lightColor} rounded-full overflow-hidden`}>
                  <div
                    className={`h-full ${macro.color} transition-all duration-300 ease-out rounded-full`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-700">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 text-right">
                {remaining > 0 ? `${remaining.toFixed(1)} ${macro.unit} remaining` : 'Goal reached!'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Calorie Distribution */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Calorie Distribution</h3>
        <div className="flex justify-between text-xs">
          <div className="text-center">
            <div className="text-red-600 font-semibold">
              {dailyStats?.protein_g ? (dailyStats.protein_g * 4).toFixed(0) : 0}
            </div>
            <div className="text-gray-500">Protein</div>
          </div>
          <div className="text-center">
            <div className="text-blue-600 font-semibold">
              {dailyStats?.carbs_g ? (dailyStats.carbs_g * 4).toFixed(0) : 0}
            </div>
            <div className="text-gray-500">Carbs</div>
          </div>
          <div className="text-center">
            <div className="text-green-600 font-semibold">
              {dailyStats?.fat_g ? (dailyStats.fat_g * 9).toFixed(0) : 0}
            </div>
            <div className="text-gray-500">Fat</div>
          </div>
          <div className="text-center">
            <div className="text-purple-600 font-semibold">
              {dailyStats?.fiber_g ? dailyStats.fiber_g.toFixed(0) : 0}g
            </div>
            <div className="text-gray-500">Fiber</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MacroProgress;
