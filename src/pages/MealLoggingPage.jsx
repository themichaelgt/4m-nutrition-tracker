import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function MealLoggingPage() {
  const navigate = useNavigate();
  const [mealType, setMealType] = useState('Breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSearch = async () => {
    if (!searchQuery) return;
    
    setLoading(true);
    try {
      const response = await api.searchFoods(searchQuery);
      setSearchResults(response.foods || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const addFoodToMeal = (food) => {
    setSelectedFoods([...selectedFoods, {
      ...food,
      amount: food.serving_size,
      unit: food.serving_unit,
      tempId: Date.now()
    }]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const updateFoodAmount = (tempId, amount) => {
    setSelectedFoods(selectedFoods.map(food => 
      food.tempId === tempId 
        ? { ...food, amount: parseFloat(amount) || 0 }
        : food
    ));
  };

  const removeFoodFromMeal = (tempId) => {
    setSelectedFoods(selectedFoods.filter(food => food.tempId !== tempId));
  };

  const calculateNutrition = (food) => {
    const multiplier = food.amount / food.serving_size;
    return {
      calories: (food.calories * multiplier).toFixed(0),
      protein_g: (food.protein_g * multiplier).toFixed(1),
      carbs_g: (food.carbs_g * multiplier).toFixed(1),
      fat_g: (food.fat_g * multiplier).toFixed(1),
      fiber_g: ((food.fiber_g || 0) * multiplier).toFixed(1)
    };
  };

  const getTotalNutrition = () => {
    return selectedFoods.reduce((total, food) => {
      const nutrition = calculateNutrition(food);
      return {
        calories: total.calories + parseFloat(nutrition.calories),
        protein_g: total.protein_g + parseFloat(nutrition.protein_g),
        carbs_g: total.carbs_g + parseFloat(nutrition.carbs_g),
        fat_g: total.fat_g + parseFloat(nutrition.fat_g),
        fiber_g: total.fiber_g + parseFloat(nutrition.fiber_g)
      };
    }, { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 });
  };

  const handleLogMeal = async () => {
    if (selectedFoods.length === 0) {
      alert('Please add at least one food to log');
      return;
    }

    setLoading(true);
    try {
      for (const food of selectedFoods) {
        const nutrition = calculateNutrition(food);
        await api.logMeal({
          date: date,
          meal_type: mealType,
          food_id: food.food_id,
          food_name: food.food_name,
          amount: food.amount,
          unit: food.unit,
          calories: parseFloat(nutrition.calories),
          protein_g: parseFloat(nutrition.protein_g),
          carbs_g: parseFloat(nutrition.carbs_g),
          fat_g: parseFloat(nutrition.fat_g),
          fiber_g: parseFloat(nutrition.fiber_g)
        });
      }
      
      alert('Meal logged successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to log meal:', err);
      alert('Failed to log meal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totals = getTotalNutrition();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Log Meal</h1>
        <p className="text-gray-600 mt-1">Track what you're eating with accurate nutrition data</p>
      </div>

      {/* Meal Configuration */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              onClick={() => alert('Voice input coming in Week 3!')}
            >
              🎤 Voice Input
            </button>
          </div>
        </div>
      </div>

      {/* Food Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Add Foods</h2>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search for food..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            Search
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="border border-gray-200 rounded-md max-h-60 overflow-y-auto">
            {searchResults.map((food) => (
              <button
                key={food.food_id}
                onClick={() => addFoodToMeal(food)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex justify-between">
                  <span className="font-medium">{food.food_name}</span>
                  <span className="text-sm text-gray-500">
                    {food.calories} kcal | {food.protein_g}g P
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  per {food.serving_size} {food.serving_unit}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Foods */}
      {selectedFoods.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Selected Foods</h2>
          
          <div className="space-y-3">
            {selectedFoods.map((food) => {
              const nutrition = calculateNutrition(food);
              return (
                <div key={food.tempId} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">{food.food_name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="number"
                          value={food.amount}
                          onChange={(e) => updateFoodAmount(food.tempId, e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-600">{food.unit}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm space-y-1">
                        <div>{nutrition.calories} kcal</div>
                        <div className="text-xs text-gray-500">
                          P: {nutrition.protein_g}g | C: {nutrition.carbs_g}g | F: {nutrition.fat_g}g
                        </div>
                      </div>
                      <button
                        onClick={() => removeFoodFromMeal(food.tempId)}
                        className="text-red-600 hover:text-red-700 text-sm mt-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Meal Totals */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold mb-3">Meal Totals</h3>
            <div className="grid grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-600">{totals.calories.toFixed(0)}</div>
                <div className="text-xs text-gray-500">Calories</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-red-600">{totals.protein_g.toFixed(1)}g</div>
                <div className="text-xs text-gray-500">Protein</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-blue-600">{totals.carbs_g.toFixed(1)}g</div>
                <div className="text-xs text-gray-500">Carbs</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-green-600">{totals.fat_g.toFixed(1)}g</div>
                <div className="text-xs text-gray-500">Fat</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-purple-600">{totals.fiber_g.toFixed(1)}g</div>
                <div className="text-xs text-gray-500">Fiber</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleLogMeal}
          disabled={loading || selectedFoods.length === 0}
          className="px-8 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging...' : 'Log Meal'}
        </button>
      </div>
    </div>
  );
}

export default MealLoggingPage;
