import { Router } from './router.js';
import { Sidebar } from './components/Sidebar.js';
import { Header } from './components/Header.js';
import { checkAuth } from './middleware/auth.js';

export class App {
  constructor() {
    this.router = new Router();
    this.sidebar = null;
    this.header = null;
    // Make app instance globally available
    window.app = this;
  }

  async init() {
    // Check authentication
    const isAuthenticated = await checkAuth();
    
    if (!isAuthenticated) {
      // Redirect to login
      window.location.hash = '#/login';
      await this.router.navigate('login');
      return;
    }

    // Initialize components first
    this.sidebar = new Sidebar();
    this.header = new Header();

    // Wait a bit for components to render
    await new Promise(resolve => setTimeout(resolve, 100));

    // Initialize router
    const hash = window.location.hash;
    const initialRoute = hash ? hash.slice(2) : 'dashboard';
    await this.router.navigate(initialRoute);

    // Listen for route changes
    window.addEventListener('hashchange', () => {
      const route = window.location.hash.slice(2);
      this.router.navigate(route);
    });
  }
}

