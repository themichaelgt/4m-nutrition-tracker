import axios from 'axios';

// For development, use local Apps Script URL
// For production, use deployed Web App URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add auth interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.params = {
            ...config.params,
            token: token
          };
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_email');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Daily Stats
  async getDailyStats(date) {
    return this.client.get('', {
      params: {
        action: 'getDailyStats',
        date: date
      }
    });
  }

  // Food Database
  async getFoodDatabase(filters = {}) {
    return this.client.get('', {
      params: {
        action: 'getFoodDatabase',
        ...filters
      }
    });
  }

  async searchFoods(query) {
    return this.client.get('', {
      params: {
        action: 'searchFoods',
        query: query
      }
    });
  }

  async addFood(foodData) {
    return this.client.post('', {
      action: 'addFood',
      ...foodData
    });
  }

  async updateFood(foodData) {
    return this.client.post('', {
      action: 'updateFood',
      ...foodData
    });
  }

  async deleteFood(foodId) {
    return this.client.post('', {
      action: 'deleteFood',
      food_id: foodId
    });
  }

  // Meal Logging
  async getMeals(date) {
    return this.client.get('', {
      params: {
        action: 'getMeals',
        date: date
      }
    });
  }

  async logMeal(mealData) {
    return this.client.post('', {
      action: 'logMeal',
      ...mealData
    });
  }

  // User Settings
  async getUserSettings() {
    return this.client.get('', {
      params: {
        action: 'getUserSettings'
      }
    });
  }

  async updateUserSettings(settings) {
    return this.client.post('', {
      action: 'updateUserSettings',
      ...settings
    });
  }

  // Wellness
  async logWellness(wellnessData) {
    return this.client.post('', {
      action: 'logWellness',
      ...wellnessData
    });
  }

  // AI Insights
  async getAIInsights(date) {
    return this.client.get('', {
      params: {
        action: 'getAIInsights',
        date: date
      }
    });
  }

  async generateAIInsight(data) {
    return this.client.post('', {
      action: 'generateAIInsight',
      ...data
    });
  }
}

export const api = new ApiService();
export default api;
