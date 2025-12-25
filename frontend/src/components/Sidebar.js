export class Sidebar {
  constructor() {
    this.isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    this.init();
  }

  init() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) {
      this.createSidebar();
    } else {
      // Render content in existing element
      this.renderContent(sidebar);
      this.attachEvents();
    }
  }

  renderContent(container) {
    container.className = `fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 ${
      this.isCollapsed ? 'w-20' : 'w-64'
    }`;
    
    container.innerHTML = `
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3 ${this.isCollapsed ? 'justify-center' : ''}">
            <i class="fa-solid fa-brain text-3xl text-[var(--color-primary)]"></i>
            ${this.isCollapsed ? '' : '<h1 class="font-bold text-xl">Prontuário PSI</h1>'}
          </div>
          <button id="sidebar-toggle" class="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <i class="fa-solid fa-${this.isCollapsed ? 'chevron-right' : 'chevron-left'}"></i>
          </button>
        </div>
      </div>
      <nav class="p-4 space-y-2">
        ${this.renderNavItems()}
      </nav>
    `;
  }

  createSidebar() {
    const sidebar = document.createElement('aside');
    sidebar.id = 'sidebar';
    sidebar.className = `fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 ${
      this.isCollapsed ? 'w-20' : 'w-64'
    }`;
    
    sidebar.innerHTML = `
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3 ${this.isCollapsed ? 'justify-center' : ''}">
            <i class="fa-solid fa-brain text-3xl text-[var(--color-primary)]"></i>
            ${this.isCollapsed ? '' : '<h1 class="font-bold text-xl">Prontuário PSI</h1>'}
          </div>
          <button id="sidebar-toggle" class="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <i class="fa-solid fa-${this.isCollapsed ? 'chevron-right' : 'chevron-left'}"></i>
          </button>
        </div>
      </div>
      <nav class="p-4 space-y-2">
        ${this.renderNavItems()}
      </nav>
    `;
    
    document.body.appendChild(sidebar);
    this.attachEvents();
  }

  renderNavItems() {
    const items = [
      { route: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
      { route: 'patients', icon: 'fa-users', label: 'Pacientes' },
      { route: 'sessions', icon: 'fa-calendar-check', label: 'Sessões' },
      { route: 'groups', icon: 'fa-user-group', label: 'Grupos' },
      { route: 'events', icon: 'fa-calendar-days', label: 'Eventos' },
      { route: 'calendar', icon: 'fa-calendar', label: 'Calendário' },
      { route: 'agenda', icon: 'fa-clock', label: 'Agenda' },
      { route: 'receivables', icon: 'fa-money-bill-wave', label: 'Recebíveis' },
      { route: 'invoicing', icon: 'fa-file-invoice', label: 'Faturamento' },
      { route: 'expenses', icon: 'fa-credit-card', label: 'Despesas' },
      { route: 'reports', icon: 'fa-file-pdf', label: 'Relatórios' },
      { route: 'history', icon: 'fa-history', label: 'Histórico' },
      { route: 'pendencies', icon: 'fa-exclamation-circle', label: 'Pendências' },
      { route: 'settings', icon: 'fa-cog', label: 'Configurações' }
    ];

    return items.map(item => `
      <button 
        data-route="${item.route}"
        onclick="window.location.hash = '#/${item.route}'"
        class="nav-item w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left transition-colors ${this.isCollapsed ? 'justify-center' : ''}"
        title="${item.label}"
      >
        <i class="fa-solid ${item.icon}"></i>
        ${this.isCollapsed ? '' : `<span>${item.label}</span>`}
      </button>
    `).join('');
  }

  attachEvents() {
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggle());
    }
  }

  toggle() {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('sidebarCollapsed', this.isCollapsed.toString());
    
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.className = `fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 ${
        this.isCollapsed ? 'w-20' : 'w-64'
      }`;
      
      // Re-render nav items
      const nav = sidebar.querySelector('nav');
      if (nav) {
        nav.innerHTML = this.renderNavItems();
      }
    }
  }
}



