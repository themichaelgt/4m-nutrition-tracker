import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    // Profile
    age: '',
    weight_kg: '',
    height_cm: '',
    activity_level: 'moderate',
    
    // Goals
    calorie_goal: '',
    protein_goal: '',
    carbs_goal: '',
    fat_goal: '',
    fiber_goal: '',
    
    // Preferences
    theme: 'light',
    notifications: true,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.getUserSettings();
      setSettings({
        age: response.age || '',
        weight_kg: response.weight_kg || '',
        height_cm: response.height_cm || '',
        activity_level: response.activity_level || 'moderate',
        calorie_goal: response.calorie_goal || '',
        protein_goal: response.protein_goal || '',
        carbs_goal: response.carbs_goal || '',
        fat_goal: response.fat_goal || '',
        fiber_goal: response.fiber_goal || '30',
        theme: response.theme || 'light',
        notifications: response.notifications === 'true' || response.notifications === true,
      });
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const calculateBMR = () => {
    if (!settings.weight_kg || !settings.height_cm || !settings.age) return 0;
    
    // Mifflin-St Jeor Equation for men
    const bmr = (10 * parseFloat(settings.weight_kg)) + 
                (6.25 * parseFloat(settings.height_cm)) - 
                (5 * parseFloat(settings.age)) + 5;
    
    return Math.round(bmr);
  };

  const calculateTDEE = () => {
    const bmr = calculateBMR();
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    
    return Math.round(bmr * activityMultipliers[settings.activity_level]);
  };

  const autoCalculateGoals = () => {
    const tdee = calculateTDEE();
    
    if (tdee > 0) {
      setSettings({
        ...settings,
        calorie_goal: tdee.toString(),
        protein_goal: Math.round(parseFloat(settings.weight_kg) * 2).toString(), // 2g per kg
        carbs_goal: Math.round(tdee * 0.45 / 4).toString(), // 45% of calories from carbs
        fat_goal: Math.round(tdee * 0.25 / 9).toString(), // 25% of calories from fat
        fiber_goal: '35'
      });
      
      setMessage('Goals calculated based on your profile!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      await api.updateUserSettings(settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setMessage('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your profile and nutrition goals</p>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-md ${
          message.includes('Failed') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
        }`}>
          {message}
        </div>
      )}

      {/* Profile Settings */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              name="age"
              value={settings.age}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              name="weight_kg"
              value={settings.weight_kg}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
            <input
              type="number"
              name="height_cm"
              value={settings.height_cm}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
            <select
              name="activity_level"
              value={settings.activity_level}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="light">Light (exercise 1-3 days/week)</option>
              <option value="moderate">Moderate (exercise 3-5 days/week)</option>
              <option value="active">Active (exercise 6-7 days/week)</option>
              <option value="very_active">Very Active (hard exercise daily)</option>
            </select>
          </div>
        </div>

        {settings.weight_kg && settings.height_cm && settings.age && (
          <div className="mt-4 p-3 bg-primary-50 rounded-md">
            <p className="text-sm text-primary-900">
              <strong>BMR:</strong> {calculateBMR()} kcal/day | 
              <strong className="ml-2">TDEE:</strong> {calculateTDEE()} kcal/day
            </p>
          </div>
        )}
      </div>

      {/* Nutrition Goals */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Daily Nutrition Goals</h2>
          <button
            onClick={autoCalculateGoals}
            className="text-sm px-4 py-1 bg-primary-100 text-primary-700 rounded hover:bg-primary-200"
          >
            Auto-Calculate
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
            <input
              type="number"
              name="calorie_goal"
              value={settings.calorie_goal}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
            <input
              type="number"
              name="protein_goal"
              value={settings.protein_goal}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Carbohydrates (g)</label>
            <input
              type="number"
              name="carbs_goal"
              value={settings.carbs_goal}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fat (g)</label>
            <input
              type="number"
              name="fat_goal"
              value={settings.fat_goal}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fiber (g)</label>
            <input
              type="number"
              name="fiber_goal"
              value={settings.fiber_goal}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Preferences</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-700">Email Notifications</label>
              <p className="text-sm text-gray-500">Receive daily insights and reminders</p>
            </div>
            <input
              type="checkbox"
              name="notifications"
              checked={settings.notifications}
              onChange={handleChange}
              className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

export default SettingsPage;
