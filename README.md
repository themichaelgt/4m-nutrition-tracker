# 4M - Micros, Macros & More

A science-first, web-based personal health tracking platform that provides comprehensive nutrition tracking with all 27 essential micronutrients, AI-powered insights backed by peer-reviewed research, and sophisticated data analysis.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Google Account (for authentication and Google Sheets database)
- Google Apps Script project (for backend API)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/4m-nutrition-tracker.git
cd 4m-nutrition-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your configuration:
```env
VITE_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_REDIRECT_URI=http://localhost:5173/auth/callback
```

4. Start the development server:
```bash
npm run dev
```

5. Open http://localhost:5173 in your browser

## 🏗️ Google Apps Script Setup

1. Go to [Google Apps Script](https://script.google.com)
2. Create a new project
3. Copy the contents of `google-apps-script-backend.js` to the script editor
4. Deploy as Web App:
   - Execute as: Me
   - Who has access: Anyone
5. Copy the Web App URL to your `.env` file

## 🚀 Deployment to Vercel

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

## 📋 Features Implemented (Phase 1)

### ✅ Completed
- [x] React app with Vite and Tailwind CSS
- [x] Google Apps Script backend API
- [x] Authentication system (development mode)
- [x] Dashboard with macro tracking
- [x] Food database management
- [x] Meal logging interface
- [x] User settings and goals
- [x] Mobile-responsive design
- [x] Database schema with all sheets

### 🔄 In Progress
- [ ] Google OAuth 2.0 integration
- [ ] Deploy Apps Script to production
- [ ] Connect to real Google Sheets

## 🔧 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **Charts**: Plotly.js (coming Week 2)
- **AI**: Gemini API (coming Week 3)
- **Hosting**: Vercel (free tier)
- **Cost**: $0-5/month total

## 📊 Current Status

**Phase 1 Complete** ✅

**Next Steps**: 
1. Deploy Google Apps Script backend
2. Set up Google OAuth 2.0
3. Deploy to Vercel
4. Begin Phase 2 (Charts & Visualization)

## 👨‍💻 Author

Michael - ITE 485 Senior Demonstration Project
University of South Alabama
