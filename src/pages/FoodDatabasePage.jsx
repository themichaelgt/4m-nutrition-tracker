import React, { useState, useEffect } from 'react';
import api from '../services/api';

function FoodDatabasePage() {
  const [foods, setFoods] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const response = await api.getFoodDatabase({ limit: 100 });
      setFoods(response.foods || []);
    } catch (err) {
      console.error('Failed to fetch foods:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      fetchFoods();
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.searchFoods(searchQuery);
      setFoods(response.foods || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Food Database</h1>
        <p className="text-gray-600 mt-1">Manage your food library with verified nutrition data</p>
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search foods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Search
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add Food
          </button>
        </div>
      </div>

      {/* Food List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading foods...</p>
        </div>
      ) : foods.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">No foods found. Add your first food to get started!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Food Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calories
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Protein
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Carbs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verified
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {foods.map((food) => (
                <tr 
                  key={food.food_id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedFood(food)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {food.food_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {food.category || 'Uncategorized'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {food.calories} kcal
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {food.protein_g}g
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {food.carbs_g}g
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {food.fat_g}g
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {food.is_verified ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Unverified
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Food Modal */}
      {showAddModal && <AddFoodModal onClose={() => setShowAddModal(false)} onSave={fetchFoods} />}
      
      {/* Food Detail Modal */}
      {selectedFood && (
        <FoodDetailModal 
          food={selectedFood} 
          onClose={() => setSelectedFood(null)} 
          onUpdate={fetchFoods}
        />
      )}
    </div>
  );
}

// Add Food Modal Component
function AddFoodModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    food_name: '',
    category: '',
    serving_size: 100,
    serving_unit: 'g',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
    fiber_g: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.addFood(formData);
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to add food:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Add New Food</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Food Name</label>
            <input
              type="text"
              name="food_name"
              required
              value={formData.food_name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">Select Category</option>
              <option value="Protein">Protein</option>
              <option value="Grains">Grains</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Dairy">Dairy</option>
              <option value="Fats">Fats</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Serving Size</label>
              <input
                type="number"
                name="serving_size"
                required
                value={formData.serving_size}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Unit</label>
              <select
                name="serving_unit"
                value={formData.serving_unit}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="g">g</option>
                <option value="oz">oz</option>
                <option value="cup">cup</option>
                <option value="tbsp">tbsp</option>
                <option value="tsp">tsp</option>
                <option value="piece">piece</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Calories</label>
            <input
              type="number"
              name="calories"
              required
              value={formData.calories}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Protein (g)</label>
              <input
                type="number"
                step="0.1"
                name="protein_g"
                required
                value={formData.protein_g}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Carbs (g)</label>
              <input
                type="number"
                step="0.1"
                name="carbs_g"
                required
                value={formData.carbs_g}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fat (g)</label>
              <input
                type="number"
                step="0.1"
                name="fat_g"
                required
                value={formData.fat_g}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fiber (g)</label>
              <input
                type="number"
                step="0.1"
                name="fiber_g"
                value={formData.fiber_g}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Add Food
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Food Detail Modal Component
function FoodDetailModal({ food, onClose, onUpdate }) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">{food.food_name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Category:</span>
                <span className="ml-2">{food.category || 'Uncategorized'}</span>
              </div>
              <div>
                <span className="text-gray-500">Serving:</span>
                <span className="ml-2">{food.serving_size} {food.serving_unit}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Macronutrients</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-500">Calories</div>
                <div className="font-semibold">{food.calories}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-500">Protein</div>
                <div className="font-semibold">{food.protein_g}g</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-500">Carbs</div>
                <div className="font-semibold">{food.carbs_g}g</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-500">Fat</div>
                <div className="font-semibold">{food.fat_g}g</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Micronutrients</h3>
            <p className="text-sm text-gray-500">Complete micronutrient tracking coming in Week 4</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodDatabasePage;
