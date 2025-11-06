import React from 'react';

function DailyMeals({ meals, onRefresh }) {
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  
  const groupedMeals = mealTypes.reduce((acc, type) => {
    acc[type] = meals.filter(meal => meal.meal_type === type);
    return acc;
  }, {});

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Today's Meals</h2>
        <button
          onClick={onRefresh}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          Refresh
        </button>
      </div>

      {meals.length === 0 ? (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">No meals logged yet today</p>
          <p className="text-xs text-gray-500 mt-1">Start by logging your first meal!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mealTypes.map(type => {
            const typeMeals = groupedMeals[type];
            if (typeMeals.length === 0) return null;

            const totalCalories = typeMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
            const totalProtein = typeMeals.reduce((sum, meal) => sum + (meal.protein_g || 0), 0);

            return (
              <div key={type} className="border-l-4 border-primary-200 pl-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-800">{type}</h3>
                  <div className="text-sm text-gray-600">
                    {totalCalories.toFixed(0)} kcal | {totalProtein.toFixed(1)}g protein
                  </div>
                </div>
                
                <div className="space-y-2">
                  {typeMeals.map(meal => (
                    <div key={meal.meal_id} className="flex justify-between items-center text-sm">
                      <div className="flex-1">
                        <span className="text-gray-700">{meal.food_name}</span>
                        <span className="text-gray-500 ml-2">
                          ({meal.amount} {meal.unit})
                        </span>
                        {meal.timestamp && (
                          <span className="text-gray-400 ml-2 text-xs">
                            {formatTime(meal.timestamp)}
                          </span>
                        )}
                      </div>
                      <div className="text-gray-600 text-xs">
                        <span>{meal.calories?.toFixed(0) || 0} kcal</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DailyMeals;
