import { DashboardModule } from './modules/dashboard/Dashboard.js';
import { PatientsModule } from './modules/patients/PatientsModule.js';
import { SessionsModule } from './modules/sessions/SessionsModule.js';
import { GroupsModule } from './modules/groups/GroupsModule.js';
import { EventsModule } from './modules/events/EventsModule.js';
import { CalendarModule } from './modules/calendar/CalendarModule.js';
import { AgendaModule } from './modules/agenda/AgendaModule.js';
import { ReceivablesModule } from './modules/receivables/ReceivablesModule.js';
import { InvoicingModule } from './modules/invoicing/InvoicingModule.js';
import { ExpensesModule } from './modules/expenses/ExpensesModule.js';
import { ReportsModule } from './modules/reports/ReportsModule.js';
import { HistoryModule } from './modules/history/HistoryModule.js';
import { PendenciesModule } from './modules/pendencies/PendenciesModule.js';
import { SettingsModule } from './modules/settings/SettingsModule.js';
import { LoginModule } from './modules/auth/Login.js';
import { RegisterModule } from './modules/auth/Register.js';
import { checkAuth } from './middleware/auth.js';

export class Router {
  constructor() {
    this.routes = {
      'login': () => new LoginModule(),
      'register': () => new RegisterModule(),
      'dashboard': () => new DashboardModule(),
      'patients': () => new PatientsModule(),
      'sessions': () => new SessionsModule(),
      'groups': () => new GroupsModule(),
      'events': () => new EventsModule(),
      'calendar': () => new CalendarModule(),
      'agenda': () => new AgendaModule(),
      'receivables': () => new ReceivablesModule(),
      'invoicing': () => new InvoicingModule(),
      'expenses': () => new ExpensesModule(),
      'reports': () => new ReportsModule(),
      'history': () => new HistoryModule(),
      'pendencies': () => new PendenciesModule(),
      'settings': () => new SettingsModule()
    };
    this.currentModule = null;
    this.container = document.getElementById('app-container');
    
    // If container doesn't exist, create it
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'app-container';
      this.container.className = 'ml-64 mt-16 p-6';
      const app = document.getElementById('app');
      if (app) {
        app.appendChild(this.container);
      } else {
        document.body.appendChild(this.container);
      }
    }
  }

  async navigate(route) {
    // Parse route and parameters
    let [path, ...params] = route.split('/');
    
    // Clean up previous module
    if (this.currentModule && typeof this.currentModule.destroy === 'function') {
      this.currentModule.destroy();
    }

    // Check authentication for protected routes
    if (path !== 'login' && path !== 'register') {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        window.location.hash = '#/login';
        path = 'login';
        params = [];
      }
    }

    // Get module factory
    const moduleFactory = this.routes[path];
    
    if (!moduleFactory) {
      console.warn(`Route "${path}" not found, redirecting to dashboard`);
      return this.navigate('dashboard');
    }

    // Clear container
    if (this.container) {
      this.container.innerHTML = '';
    }

    // Create and initialize new module
    try {
      this.currentModule = moduleFactory();
      
      if (typeof this.currentModule.init === 'function') {
        await this.currentModule.init(...params);
      } else if (typeof this.currentModule.render === 'function') {
        await this.currentModule.render(this.container, ...params);
      }
      
      // Update active nav item
      this.updateActiveNav(path);
      
      // Update page title in header
      const header = window.app?.header;
      if (header && typeof header.setTitle === 'function') {
        const titles = {
          'dashboard': 'Dashboard',
          'patients': 'Pacientes',
          'sessions': 'Sessões',
          'groups': 'Grupos',
          'events': 'Eventos',
          'calendar': 'Calendário',
          'agenda': 'Agenda',
          'receivables': 'Recebíveis',
          'invoicing': 'Faturamento',
          'expenses': 'Despesas',
          'reports': 'Relatórios',
          'history': 'Histórico',
          'pendencies': 'Pendências',
          'settings': 'Configurações'
        };
        header.setTitle(titles[path] || 'Prontuário PSI');
      }
    } catch (error) {
      console.error(`Error initializing module "${route}":`, error);
      if (this.container) {
        this.container.innerHTML = `
          <div class="p-6">
            <div class="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <h2 class="text-red-800 dark:text-red-200 font-semibold mb-2">Erro ao carregar módulo</h2>
              <p class="text-red-600 dark:text-red-300">${error.message || 'Erro desconhecido'}</p>
              <p class="text-red-500 dark:text-red-400 text-sm mt-2">Verifique o console (F12) para mais detalhes.</p>
            </div>
          </div>
        `;
      }
    }
  }

  updateActiveNav(route) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.remove('bg-gray-100', 'dark:bg-gray-700', 'border-l-4', 'border-[var(--color-primary)]');
    });

    // Add active class to current route
    const activeBtn = document.querySelector(`[data-route="${route}"]`);
    if (activeBtn) {
      activeBtn.classList.add('bg-gray-100', 'dark:bg-gray-700', 'border-l-4', 'border-[var(--color-primary)]');
    }
  }
}

