// Google Apps Script Backend for 4M Nutrition Tracker
// This code should be deployed as a Web App in Google Apps Script

// ========================================
// CONFIGURATION
// ========================================

const CONFIG = {
  TEMPLATE_SHEET_ID: 'YOUR_TEMPLATE_SHEET_ID', // Will be replaced with actual template ID
  ALLOWED_ORIGINS: ['https://4m-nutrition.vercel.app', 'http://localhost:5173'],
  VERSION: '1.0.0'
};

// ========================================
// MAIN ENTRY POINTS
// ========================================

function doGet(e) {
  return handleRequest('GET', e);
}

function doPost(e) {
  return handleRequest('POST', e);
}

function handleRequest(method, e) {
  try {
    // Enable CORS
    const origin = e.parameter.origin || e.headers?.origin || '';
    const response = {
      headers: {
        'Access-Control-Allow-Origin': CONFIG.ALLOWED_ORIGINS.includes(origin) ? origin : CONFIG.ALLOWED_ORIGINS[0],
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
      }
    };

    // Handle OPTIONS request
    if (method === 'OPTIONS') {
      return jsonResponse({ success: true }, response.headers);
    }

    // Parse request
    const action = e.parameter.action;
    const user = verifyAuth(e);
    
    if (!user) {
      return jsonResponse({ error: 'Unauthorized' }, response.headers, 401);
    }

    // Route request based on method and action
    let result;
    if (method === 'GET') {
      result = handleGetRequest(user, action, e.parameter);
    } else if (method === 'POST') {
      const data = JSON.parse(e.postData.contents);
      result = handlePostRequest(user, action, data);
    }

    return jsonResponse(result, response.headers);
  } catch (error) {
    console.error('Error handling request:', error);
    return jsonResponse({ 
      error: 'Internal server error', 
      message: error.toString() 
    }, {}, 500);
  }
}

// ========================================
// REQUEST HANDLERS
// ========================================

function handleGetRequest(user, action, params) {
  switch(action) {
    case 'getDailyStats':
      return getDailyStats(user, params.date || new Date().toISOString().split('T')[0]);
    
    case 'getFoodDatabase':
      return getFoodDatabase(user, params);
    
    case 'getMeals':
      return getMeals(user, params.date || new Date().toISOString().split('T')[0]);
    
    case 'searchFoods':
      return searchFoods(user, params.query);
    
    case 'getUserSettings':
      return getUserSettings(user);
    
    case 'getAIInsights':
      return getAIInsights(user, params.date);
    
    default:
      throw new Error('Invalid action: ' + action);
  }
}

function handlePostRequest(user, action, data) {
  switch(action) {
    case 'logMeal':
      return logMeal(user, data);
    
    case 'addFood':
      return addFood(user, data);
    
    case 'updateFood':
      return updateFood(user, data);
    
    case 'deleteFood':
      return deleteFood(user, data);
    
    case 'updateUserSettings':
      return updateUserSettings(user, data);
    
    case 'logWellness':
      return logWellness(user, data);
    
    case 'generateAIInsight':
      return generateAIInsight(user, data);
    
    default:
      throw new Error('Invalid action: ' + action);
  }
}

// ========================================
// AUTHENTICATION
// ========================================

function verifyAuth(e) {
  // For now, using a simple token-based auth
  // In production, implement proper OAuth 2.0
  const token = e.parameter.token || e.headers?.Authorization?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }
  
  // TODO: Verify token with Google OAuth
  // For development, accept any token that looks like an email
  if (token.includes('@')) {
    return {
      id: token,
      email: token,
      name: token.split('@')[0]
    };
  }
  
  return null;
}

// ========================================
// DATABASE OPERATIONS
// ========================================

function getUserSpreadsheet(userId) {
  const fileName = `4M_${userId.replace('@', '_')}`;
  const files = DriveApp.getFilesByName(fileName);
  
  if (files.hasNext()) {
    const file = files.next();
    return SpreadsheetApp.open(file);
  } else {
    // Create new spreadsheet from template
    return createUserSpreadsheet(userId);
  }
}

function createUserSpreadsheet(userId) {
  // Create a new spreadsheet
  const spreadsheet = SpreadsheetApp.create(`4M_${userId.replace('@', '_')}`);
  
  // Create all required sheets
  const sheets = [
    'Daily_Logs',
    'Food_Database', 
    'Meals_Log',
    'AI_Insights',
    'User_Settings',
    'Wellness_Log',
    'Correlations'
  ];
  
  // Remove default sheet
  const defaultSheet = spreadsheet.getSheets()[0];
  
  sheets.forEach(sheetName => {
    const sheet = spreadsheet.insertSheet(sheetName);
    setupSheetHeaders(sheet, sheetName);
  });
  
  spreadsheet.deleteSheet(defaultSheet);
  
  // Initialize with sample data
  initializeFoodDatabase(spreadsheet);
  initializeUserSettings(spreadsheet, userId);
  
  return spreadsheet;
}

function setupSheetHeaders(sheet, sheetName) {
  const headers = {
    'Daily_Logs': [
      'date', 'day_of_week', 'week_number', 'calories', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g',
      'vitamin_a_mcg', 'vitamin_c_mg', 'vitamin_d_mcg', 'vitamin_e_mg', 'vitamin_k_mcg',
      'thiamin_mg', 'riboflavin_mg', 'niacin_mg', 'b5_mg', 'b6_mg', 'biotin_mcg', 'folate_mcg', 'b12_mcg',
      'calcium_mg', 'phosphorus_mg', 'magnesium_mg', 'sodium_mg', 'potassium_mg',
      'iron_mg', 'zinc_mg', 'copper_mg', 'manganese_mg', 'iodine_mcg', 'selenium_mcg', 'chromium_mcg',
      'omega3_g', 'omega6_g', 'water_l', 'weight_kg', 'sleep_hours', 'sleep_quality',
      'steps', 'workout_minutes', 'mood', 'energy', 'stress', 'notes'
    ],
    'Food_Database': [
      'food_id', 'food_name', 'brand', 'category', 'barcode', 'serving_size', 'serving_unit',
      'calories', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g',
      'vitamin_a_mcg', 'vitamin_c_mg', 'vitamin_d_mcg', 'vitamin_e_mg', 'vitamin_k_mcg',
      'thiamin_mg', 'riboflavin_mg', 'niacin_mg', 'b5_mg', 'b6_mg', 'biotin_mcg', 'folate_mcg', 'b12_mcg',
      'calcium_mg', 'phosphorus_mg', 'magnesium_mg', 'sodium_mg', 'potassium_mg',
      'iron_mg', 'zinc_mg', 'copper_mg', 'manganese_mg', 'iodine_mcg', 'selenium_mcg', 'chromium_mcg',
      'omega3_g', 'omega6_g', 'water_g', 'is_verified', 'source', 'date_added', 'last_updated'
    ],
    'Meals_Log': [
      'meal_id', 'date', 'timestamp', 'meal_type', 'food_id', 'food_name', 'amount', 'unit',
      'calories', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g',
      'vitamin_a_mcg', 'vitamin_c_mg', 'vitamin_d_mcg', 'vitamin_e_mg', 'vitamin_k_mcg',
      'thiamin_mg', 'riboflavin_mg', 'niacin_mg', 'b5_mg', 'b6_mg', 'biotin_mcg', 'folate_mcg', 'b12_mcg',
      'calcium_mg', 'phosphorus_mg', 'magnesium_mg', 'sodium_mg', 'potassium_mg',
      'iron_mg', 'zinc_mg', 'copper_mg', 'manganese_mg', 'iodine_mcg', 'selenium_mcg', 'chromium_mcg',
      'notes'
    ],
    'AI_Insights': [
      'insight_id', 'date_generated', 'period_start', 'period_end', 'type', 'priority',
      'category', 'title', 'summary', 'detailed_analysis', 'recommendations',
      'research_references', 'data_sources', 'confidence_score', 'is_read', 'is_applied', 'user_rating'
    ],
    'User_Settings': [
      'setting_key', 'setting_value', 'category', 'last_updated'
    ],
    'Wellness_Log': [
      'date', 'timestamp', 'sleep_start', 'sleep_end', 'sleep_hours', 'sleep_quality', 'sleep_notes',
      'weight_kg', 'body_fat_percent', 'muscle_mass_kg',
      'mood', 'energy', 'stress', 'focus', 'motivation',
      'steps', 'active_minutes', 'workout_type', 'workout_duration', 'workout_intensity',
      'hydration_l', 'caffeine_mg', 'alcohol_units',
      'notes', 'tags'
    ],
    'Correlations': [
      'correlation_id', 'date_calculated', 'variable_1', 'variable_2', 
      'correlation_coefficient', 'p_value', 'sample_size', 'period_days',
      'interpretation', 'is_significant'
    ]
  };
  
  if (headers[sheetName]) {
    sheet.getRange(1, 1, 1, headers[sheetName].length).setValues([headers[sheetName]]);
    sheet.getRange(1, 1, 1, headers[sheetName].length)
      .setFontWeight('bold')
      .setBackground('#f0f9ff');
  }
}

// ========================================
// CORE FUNCTIONS
// ========================================

function getDailyStats(user, date) {
  const spreadsheet = getUserSpreadsheet(user.id);
  const dailyLog = spreadsheet.getSheetByName('Daily_Logs');
  
  const data = dailyLog.getDataRange().getValues();
  const headers = data[0];
  const dateIndex = headers.indexOf('date');
  
  const dateRow = data.find(row => row[dateIndex] === date);
  
  if (!dateRow) {
    // Return empty stats for the date
    return {
      date: date,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      micronutrients: {},
      wellness: {}
    };
  }
  
  // Map row to object
  const stats = {};
  headers.forEach((header, index) => {
    stats[header] = dateRow[index];
  });
  
  return stats;
}

function getMeals(user, date) {
  const spreadsheet = getUserSpreadsheet(user.id);
  const mealsLog = spreadsheet.getSheetByName('Meals_Log');
  
  const data = mealsLog.getDataRange().getValues();
  const headers = data[0];
  const dateIndex = headers.indexOf('date');
  
  const meals = data
    .slice(1) // Skip header row
    .filter(row => row[dateIndex] === date)
    .map(row => {
      const meal = {};
      headers.forEach((header, index) => {
        meal[header] = row[index];
      });
      return meal;
    });
  
  return { meals };
}

function searchFoods(user, query) {
  const spreadsheet = getUserSpreadsheet(user.id);
  const foodDatabase = spreadsheet.getSheetByName('Food_Database');
  
  const data = foodDatabase.getDataRange().getValues();
  const headers = data[0];
  const nameIndex = headers.indexOf('food_name');
  
  const foods = data
    .slice(1) // Skip header row
    .filter(row => row[nameIndex].toLowerCase().includes(query.toLowerCase()))
    .map(row => {
      const food = {};
      headers.forEach((header, index) => {
        food[header] = row[index];
      });
      return food;
    })
    .slice(0, 20); // Limit to 20 results
  
  return { foods };
}

function logMeal(user, mealData) {
  const spreadsheet = getUserSpreadsheet(user.id);
  const mealsLog = spreadsheet.getSheetByName('Meals_Log');
  
  // Generate meal ID
  const mealId = `M${Date.now()}`;
  const timestamp = new Date().toISOString();
  
  // Get headers
  const headers = mealsLog.getRange(1, 1, 1, mealsLog.getLastColumn()).getValues()[0];
  
  // Create row data
  const rowData = headers.map(header => {
    if (header === 'meal_id') return mealId;
    if (header === 'timestamp') return timestamp;
    return mealData[header] || '';
  });
  
  // Append row
  mealsLog.appendRow(rowData);
  
  // Update daily totals
  updateDailyTotals(user, mealData.date);
  
  return {
    success: true,
    meal_id: mealId,
    message: 'Meal logged successfully'
  };
}

function addFood(user, foodData) {
  const spreadsheet = getUserSpreadsheet(user.id);
  const foodDatabase = spreadsheet.getSheetByName('Food_Database');
  
  // Generate food ID
  const foodId = `F${Date.now()}`;
  const dateAdded = new Date().toISOString().split('T')[0];
  
  // Get headers
  const headers = foodDatabase.getRange(1, 1, 1, foodDatabase.getLastColumn()).getValues()[0];
  
  // Create row data
  const rowData = headers.map(header => {
    if (header === 'food_id') return foodId;
    if (header === 'date_added') return dateAdded;
    if (header === 'last_updated') return dateAdded;
    if (header === 'is_verified') return false;
    return foodData[header] || '';
  });
  
  // Append row
  foodDatabase.appendRow(rowData);
  
  return {
    success: true,
    food_id: foodId,
    message: 'Food added to database'
  };
}

function updateDailyTotals(user, date) {
  const spreadsheet = getUserSpreadsheet(user.id);
  const mealsLog = spreadsheet.getSheetByName('Meals_Log');
  const dailyLog = spreadsheet.getSheetByName('Daily_Logs');
  
  // Get all meals for the date
  const mealsData = mealsLog.getDataRange().getValues();
  const mealsHeaders = mealsData[0];
  const dateIndex = mealsHeaders.indexOf('date');
  
  const dayMeals = mealsData
    .slice(1)
    .filter(row => row[dateIndex] === date);
  
  // Calculate totals
  const totals = {
    date: date,
    day_of_week: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
    week_number: getWeekNumber(new Date(date)),
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    fiber_g: 0
    // Add all micronutrients...
  };
  
  // Sum up nutrition from meals
  dayMeals.forEach(meal => {
    mealsHeaders.forEach((header, index) => {
      if (header in totals && typeof meal[index] === 'number') {
        totals[header] += meal[index];
      }
    });
  });
  
  // Update or insert daily log
  const dailyData = dailyLog.getDataRange().getValues();
  const dailyHeaders = dailyData[0];
  const dailyDateIndex = dailyHeaders.indexOf('date');
  
  const existingRowIndex = dailyData.findIndex(row => row[dailyDateIndex] === date);
  
  const rowData = dailyHeaders.map(header => totals[header] || '');
  
  if (existingRowIndex > 0) {
    // Update existing row
    dailyLog.getRange(existingRowIndex + 1, 1, 1, rowData.length).setValues([rowData]);
  } else {
    // Add new row
    dailyLog.appendRow(rowData);
  }
}

function getUserSettings(user) {
  const spreadsheet = getUserSpreadsheet(user.id);
  const settingsSheet = spreadsheet.getSheetByName('User_Settings');
  
  const data = settingsSheet.getDataRange().getValues();
  const settings = {};
  
  data.slice(1).forEach(row => {
    settings[row[0]] = row[1];
  });
  
  return settings;
}

function updateUserSettings(user, settings) {
  const spreadsheet = getUserSpreadsheet(user.id);
  const settingsSheet = spreadsheet.getSheetByName('User_Settings');
  
  Object.entries(settings).forEach(([key, value]) => {
    updateOrAddSetting(settingsSheet, key, value);
  });
  
  return {
    success: true,
    message: 'Settings updated'
  };
}

function updateOrAddSetting(sheet, key, value) {
  const data = sheet.getDataRange().getValues();
  const keyIndex = 0;
  const valueIndex = 1;
  const updatedIndex = 3;
  
  const rowIndex = data.findIndex(row => row[keyIndex] === key);
  
  if (rowIndex > 0) {
    sheet.getRange(rowIndex + 1, valueIndex + 1).setValue(value);
    sheet.getRange(rowIndex + 1, updatedIndex + 1).setValue(new Date().toISOString());
  } else {
    sheet.appendRow([key, value, '', new Date().toISOString()]);
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function jsonResponse(data, headers = {}, code = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// ========================================
// INITIAL DATA
// ========================================

function initializeFoodDatabase(spreadsheet) {
  const foodDatabase = spreadsheet.getSheetByName('Food_Database');
  
  // Add some common foods as examples
  const sampleFoods = [
    ['F001', 'Chicken Breast (cooked)', '', 'Protein', '', 100, 'g', 165, 31, 0, 3.6, 0, 9, 0, 0.3, 0.4, 6, 0.07, 0.11, 11.5, 0.86, 0.56, 0, 7, 0.31, 11, 220, 27, 85, 370, 0.9, 1, 0.04, 0.017, 0, 27.8, 0, 0.03, 0.8, 65.3, true, 'USDA', '2024-01-01', '2024-01-01'],
    ['F002', 'White Rice (cooked)', '', 'Grains', '', 100, 'g', 130, 2.7, 28.2, 0.3, 0.4, 0, 0, 0, 0.02, 0, 0.16, 0.013, 1.6, 0.38, 0.093, 0, 58, 0, 10, 43, 12, 1, 35, 0.2, 0.4, 0.049, 0.472, 0, 7.1, 0, 0, 0.02, 68.4, true, 'USDA', '2024-01-01', '2024-01-01'],
    ['F003', 'Banana', '', 'Fruit', '', 100, 'g', 89, 1.1, 22.8, 0.3, 2.6, 3, 8.7, 0, 0.1, 0.5, 0.031, 0.073, 0.665, 0.334, 0.367, 0, 20, 0, 5, 22, 27, 1, 358, 0.26, 0.15, 0.078, 0.27, 0, 1, 0, 0, 0.05, 74.9, true, 'USDA', '2024-01-01', '2024-01-01']
  ];
  
  sampleFoods.forEach(food => {
    foodDatabase.appendRow(food);
  });
}

function initializeUserSettings(spreadsheet, userId) {
  const settingsSheet = spreadsheet.getSheetByName('User_Settings');
  
  const defaultSettings = [
    ['user_id', userId, 'account', new Date().toISOString()],
    ['calorie_goal', 2500, 'goals', new Date().toISOString()],
    ['protein_goal', 150, 'goals', new Date().toISOString()],
    ['carbs_goal', 300, 'goals', new Date().toISOString()],
    ['fat_goal', 80, 'goals', new Date().toISOString()],
    ['weight_kg', 75, 'profile', new Date().toISOString()],
    ['height_cm', 180, 'profile', new Date().toISOString()],
    ['age', 22, 'profile', new Date().toISOString()],
    ['activity_level', 'moderate', 'profile', new Date().toISOString()],
    ['theme', 'light', 'preferences', new Date().toISOString()],
    ['notifications', true, 'preferences', new Date().toISOString()]
  ];
  
  defaultSettings.forEach(setting => {
    settingsSheet.appendRow(setting);
  });
}

// ========================================
// AI INTEGRATION
// ========================================

function getAIInsights(user, date) {
  const spreadsheet = getUserSpreadsheet(user.id);
  const insightsSheet = spreadsheet.getSheetByName('AI_Insights');
  
  const data = insightsSheet.getDataRange().getValues();
  const headers = data[0];
  
  const insights = data
    .slice(1)
    .filter(row => row[headers.indexOf('date_generated')] === date)
    .map(row => {
      const insight = {};
      headers.forEach((header, index) => {
        insight[header] = row[index];
      });
      return insight;
    });
  
  return { insights };
}

function generateAIInsight(user, data) {
  // This would integrate with Gemini API
  // For now, return a placeholder
  return {
    success: true,
    message: 'AI analysis scheduled',
    insight_id: `I${Date.now()}`
  };
}

function logWellness(user, wellnessData) {
  const spreadsheet = getUserSpreadsheet(user.id);
  const wellnessLog = spreadsheet.getSheetByName('Wellness_Log');
  
  const timestamp = new Date().toISOString();
  
  // Get headers
  const headers = wellnessLog.getRange(1, 1, 1, wellnessLog.getLastColumn()).getValues()[0];
  
  // Create row data
  const rowData = headers.map(header => {
    if (header === 'timestamp') return timestamp;
    return wellnessData[header] || '';
  });
  
  // Append row
  wellnessLog.appendRow(rowData);
  
  return {
    success: true,
    message: 'Wellness data logged'
  };
}

function getFoodDatabase(user, params) {
  const spreadsheet = getUserSpreadsheet(user.id);
  const foodDatabase = spreadsheet.getSheetByName('Food_Database');
  
  const data = foodDatabase.getDataRange().getValues();
  const headers = data[0];
  
  let foods = data.slice(1).map(row => {
    const food = {};
    headers.forEach((header, index) => {
      food[header] = row[index];
    });
    return food;
  });
  
  // Apply filters if provided
  if (params.category) {
    foods = foods.filter(f => f.category === params.category);
  }
  if (params.verified === 'true') {
    foods = foods.filter(f => f.is_verified === true);
  }
  
  // Limit results
  const limit = parseInt(params.limit) || 100;
  foods = foods.slice(0, limit);
  
  return { foods };
}

function updateFood(user, data) {
  const spreadsheet = getUserSpreadsheet(user.id);
  const foodDatabase = spreadsheet.getSheetByName('Food_Database');
  
  const allData = foodDatabase.getDataRange().getValues();
  const headers = allData[0];
  const foodIdIndex = headers.indexOf('food_id');
  
  const rowIndex = allData.findIndex(row => row[foodIdIndex] === data.food_id);
  
  if (rowIndex === -1) {
    throw new Error('Food not found');
  }
  
  // Update the row
  const updatedRow = headers.map((header, index) => {
    if (header === 'last_updated') return new Date().toISOString().split('T')[0];
    if (data[header] !== undefined) return data[header];
    return allData[rowIndex][index];
  });
  
  foodDatabase.getRange(rowIndex + 1, 1, 1, updatedRow.length).setValues([updatedRow]);
  
  return {
    success: true,
    message: 'Food updated'
  };
}

function deleteFood(user, data) {
  const spreadsheet = getUserSpreadsheet(user.id);
  const foodDatabase = spreadsheet.getSheetByName('Food_Database');
  
  const allData = foodDatabase.getDataRange().getValues();
  const foodIdIndex = allData[0].indexOf('food_id');
  
  const rowIndex = allData.findIndex(row => row[foodIdIndex] === data.food_id);
  
  if (rowIndex === -1) {
    throw new Error('Food not found');
  }
  
  foodDatabase.deleteRow(rowIndex + 1);
  
  return {
    success: true,
    message: 'Food deleted'
  };
}
