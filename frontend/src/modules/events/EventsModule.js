import { api } from '../../services/api.js';
import { loading } from '../../components/Loading.js';
import { dialog } from '../../components/Dialog.js';
import { formatDate } from '../../utils/formatters.js';

export class EventsModule {
  constructor() {
    this.container = null;
    this.events = [];
  }

  async init() {
    this.container = document.getElementById('app-container') || document.getElementById('app');
    await this.loadEvents();
    await this.render();
  }

  async loadEvents() {
    try {
      loading.show('Carregando eventos...');
      // Note: events endpoint needs to be created in backend
      this.events = await api.get('/api/events').catch(() => []);
    } catch (error) {
      console.error('Error loading events:', error);
      this.events = [];
    } finally {
      loading.hide();
    }
  }

  async render() {
    this.container.innerHTML = `
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold">Eventos</h1>
          <button 
            id="add-event-btn"
            class="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90"
          >
            <i class="fa-solid fa-plus mr-2"></i>Novo Evento
          </button>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p class="text-gray-600 dark:text-gray-400">
            Módulo de eventos em desenvolvimento. A funcionalidade completa será implementada em breve.
          </p>
          ${this.events.length > 0 ? `
            <div class="mt-4 space-y-2">
              ${this.events.map(event => `
                <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 class="font-semibold">${event.title}</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">${formatDate(event.date)}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const addBtn = document.getElementById('add-event-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        dialog.show('Funcionalidade de criar eventos será implementada em breve.', 'alert');
      });
    }
  }

  destroy() {}
}
