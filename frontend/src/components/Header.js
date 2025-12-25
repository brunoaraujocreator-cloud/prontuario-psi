import { toggleTheme } from '../config/theme.js';
import { authService } from '../services/supabase.js';

export class Header {
  constructor() {
    this.init();
  }

  init() {
    const header = document.getElementById('header');
    if (!header) {
      this.createHeader();
    } else {
      // Render content in existing element
      this.renderContent(header);
      this.attachEvents();
    }
  }

  renderContent(container) {
    container.className = 'fixed top-0 right-0 left-64 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 z-30';
    
    container.innerHTML = `
      <div class="flex items-center gap-4">
        <button id="mobile-menu-toggle" class="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400">
          <i class="fa-solid fa-bars"></i>
        </button>
        <h2 id="page-title" class="text-xl font-semibold">Dashboard</h2>
      </div>
      <div class="flex items-center gap-4">
        <button id="theme-toggle" class="text-gray-500 hover:text-gray-700 dark:text-gray-400" title="Alternar tema">
          <i class="fa-solid fa-moon dark:hidden"></i>
          <i class="fa-solid fa-sun hidden dark:inline"></i>
        </button>
        <button id="logout-btn" class="text-gray-500 hover:text-gray-700 dark:text-gray-400" title="Sair">
          <i class="fa-solid fa-sign-out-alt"></i>
        </button>
      </div>
    `;
  }

  createHeader() {
    const header = document.createElement('header');
    header.id = 'header';
    header.className = 'fixed top-0 right-0 left-64 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 z-30';
    
    header.innerHTML = `
      <div class="flex items-center gap-4">
        <button id="mobile-menu-toggle" class="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400">
          <i class="fa-solid fa-bars"></i>
        </button>
        <h2 id="page-title" class="text-xl font-semibold">Dashboard</h2>
      </div>
      <div class="flex items-center gap-4">
        <button id="theme-toggle" class="text-gray-500 hover:text-gray-700 dark:text-gray-400" title="Alternar tema">
          <i class="fa-solid fa-moon dark:hidden"></i>
          <i class="fa-solid fa-sun hidden dark:inline"></i>
        </button>
        <button id="logout-btn" class="text-gray-500 hover:text-gray-700 dark:text-gray-400" title="Sair">
          <i class="fa-solid fa-sign-out-alt"></i>
        </button>
      </div>
    `;
    
    document.body.appendChild(header);
    this.attachEvents();
  }

  attachEvents() {
    const themeToggle = document.getElementById('theme-toggle');
    const logoutBtn = document.getElementById('logout-btn');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');

    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        toggleTheme();
        // Update icon after a small delay to ensure DOM is updated
        setTimeout(() => this.updateThemeIcon(), 100);
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        if (confirm('Deseja realmente sair?')) {
          await authService.signOut();
          window.location.hash = '#/login';
        }
      });
    }

    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
          sidebar.classList.toggle('-translate-x-full');
        }
      });
    }

    this.updateThemeIcon();
  }

  updateThemeIcon() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      const isDark = document.documentElement.classList.contains('dark');
      const moonIcon = themeToggle.querySelector('.fa-moon');
      const sunIcon = themeToggle.querySelector('.fa-sun');
      
      if (moonIcon) moonIcon.classList.toggle('hidden', isDark);
      if (sunIcon) sunIcon.classList.toggle('hidden', !isDark);
    }
  }

  setTitle(title) {
    const titleEl = document.getElementById('page-title');
    if (titleEl) {
      titleEl.textContent = title;
    }
  }
}



