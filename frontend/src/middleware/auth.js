import { authService } from '../services/supabase.js';

export async function checkAuth() {
  try {
    const session = await authService.getSession();
    return !!session;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}

export function requireAuth() {
  return async (req, res, next) => {
    const isAuthenticated = await checkAuth();
    
    if (!isAuthenticated) {
      window.location.hash = '#/login';
      return;
    }
    
    next();
  };
}



