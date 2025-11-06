import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import MacroProgress from '../components/Dashboard/MacroProgress';
import DailyMeals from '../components/Dashboard/DailyMeals';
import QuickStats from '../components/Dashboard/QuickStats';
import { Link } from 'react-router-dom';

function DashboardPage() {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyStats, setDailyStats] = useState(null);
  const [meals, setMeals] = useState([]);
  const [userSettings, setUserSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [date]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [statsResponse, mealsResponse, settingsResponse] = await Promise.all([
        api.getDailyStats(date),
        api.getMeals(date),
        api.getUserSettings()
      ]);

      setDailyStats(statsResponse);
      setMeals(mealsResponse.meals || []);
      setUserSettings(settingsResponse);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const navigateDate = (days) => {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + days);
    setDate(currentDate.toISOString().split('T')[0]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">Track your nutrition scientifically</p>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow">
        <button
          onClick={() => navigateDate(-1)}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
        >
          ← Previous
        </button>
        
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
          />
          {date === new Date().toISOString().split('T')[0] && (
            <span className="text-sm text-primary-600 font-medium">Today</span>
          )}
        </div>
        
        <button
          onClick={() => navigateDate(1)}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
        >
          Next →
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          to="/log-meal"
          className="bg-primary-600 text-white p-4 rounded-lg hover:bg-primary-700 transition text-center"
        >
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="font-medium">Log Meal</span>
        </Link>
        
        <Link
          to="/foods"
          className="bg-white border border-gray-300 text-gray-700 p-4 rounded-lg hover:bg-gray-50 transition text-center"
        >
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="font-medium">Food Database</span>
        </Link>
        
        <button
          className="bg-white border border-gray-300 text-gray-700 p-4 rounded-lg hover:bg-gray-50 transition text-center"
          onClick={() => alert('Wellness tracking coming in Phase 2!')}
        >
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="font-medium">Track Wellness</span>
        </button>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Macros */}
        <div className="lg:col-span-2 space-y-6">
          <MacroProgress 
            dailyStats={dailyStats} 
            goals={userSettings}
          />
          
          <DailyMeals 
            meals={meals}
            onRefresh={fetchDashboardData}
          />
        </div>

        {/* Right Column - Quick Stats */}
        <div className="space-y-6">
          <QuickStats 
            dailyStats={dailyStats}
            date={date}
          />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
