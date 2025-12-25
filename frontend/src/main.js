import { App } from './app.js';
import { initTheme } from './config/theme.js';

// Initialize theme
initTheme();

// Initialize app
const app = new App();
app.init();



