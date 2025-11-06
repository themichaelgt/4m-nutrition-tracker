// Google OAuth service
// For development, we'll use simple email auth
// For production, implement proper Google OAuth 2.0

class GoogleAuthService {
  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    this.redirectUri = import.meta.env.VITE_REDIRECT_URI || 'http://localhost:5173/auth/callback';
  }

  async signIn() {
    // In production, this would initiate Google OAuth flow
    // For now, prompt for email
    const email = prompt('Enter your email for development login:');
    if (email && email.includes('@')) {
      return {
        email: email,
        token: email,
        name: email.split('@')[0]
      };
    }
    throw new Error('Invalid email');
  }

  async signOut() {
    // Clear any OAuth tokens
    return true;
  }

  async getUser() {
    const token = localStorage.getItem('auth_token');
    const email = localStorage.getItem('user_email');
    
    if (token && email) {
      return {
        email: email,
        token: token,
        name: email.split('@')[0]
      };
    }
    
    return null;
  }
}

export const googleAuthService = new GoogleAuthService();
export default googleAuthService;
