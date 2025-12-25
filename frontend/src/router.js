import { checkAuth } from './middleware/auth.js';

export class Router {
  constructor(routes, container) {
    this.routes = routes;
    this.container = container;
    this.currentModule = null;

    window.addEventListener('hashchange', () => {
      this.navigate(window.location.hash.substring(2) || 'dashboard');
    });
  }

  async init() {
    const initialRoute = window.location.hash.substring(2) || 'dashboard';
    await this.navigate(initialRoute);
  }

  async navigate(route) {
    // Parse route and parameters
    let [path, ...params] = route.split('/');
    
    // Clean up previous module
    if (this.currentModule && typeof this.currentModule.destroy === 'function') {
      this.currentModule.destroy();
    }

    // BYPASS LOGIN PARA DEBUG: Comentamos a verificação de auth
    /*
    if (path !== 'login' && path !== 'register') {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        window.location.hash = '#/login';
        return;
      }
    }
    */

    // Se o caminho for login ou vazio, vai pro dashboard
    if (!path || path === 'login') {
      path = 'dashboard';
    }

    const moduleFactory = this.routes[path];
    
    if (!moduleFactory) {
      console.warn(`Route "${path}" not found, redirecting to dashboard`);
      return this.navigate('dashboard');
    }

    if (this.container) {
      this.container.innerHTML = '';
    }

    try {
      this.currentModule = moduleFactory();
      
      if (typeof this.currentModule.init === 'function') {
        await this.currentModule.init(...params);
      } else if (typeof this.currentModule.render === 'function') {
        await this.currentModule.render(this.container, ...params);
      }
      
      this.updateActiveNav(path);
      
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
      console.error('Error loading module:', error);
      if (this.container) {
        this.container.innerHTML = `
          <div class="p-4 bg-red-50 text-red-600 rounded-lg">
            <h2 class="font-bold">Erro ao carregar módulo</h2>
            <p>${error.message}</p>
            <button onclick="window.location.reload()" class="mt-2 text-sm underline">Tentar novamente</button>
          </div>
        `;
      }
    }
  }

  updateActiveNav(path) {
    document.querySelectorAll('nav a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#/${path}`) {
        link.classList.add('bg-blue-50', 'text-blue-600');
        link.classList.remove('text-gray-600');
      } else {
        link.classList.remove('bg-blue-50', 'text-blue-600');
        link.classList.add('text-gray-600');
      }
    });
  }
}
