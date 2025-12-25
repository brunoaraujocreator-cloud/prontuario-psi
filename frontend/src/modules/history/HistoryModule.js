import { api } from '../../services/api.js';
import { loading } from '../../components/Loading.js';
import { dialog } from '../../components/Dialog.js';
import { formatDate } from '../../utils/formatters.js';

export class HistoryModule {
  constructor() {
    this.container = null;
    this.actions = [];
    this.trash = [];
    this.activeTab = 'actions'; // 'actions' or 'trash'
  }

  async init() {
    this.container = document.getElementById('app-container') || document.getElementById('app');
    await this.loadData();
    await this.render();
  }

  async loadData() {
    try {
      loading.show('Carregando histórico...');
      const [actions, trash] = await Promise.all([
        api.get('/api/history/recent-actions').catch(() => []),
        api.get('/api/trash').catch(() => [])
      ]);

      this.actions = actions;
      this.trash = trash;
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      loading.hide();
    }
  }

  async render() {
    this.container.innerHTML = `
      <div class="p-6 fade-in">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold flex items-center gap-2">
            <i class="fa-solid fa-clock-rotate-left text-[var(--color-primary)]"></i> Histórico e Auditoria
          </h2>
        </div>

        <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex gap-4">
            <button onclick="window.historyModule.setTab('actions')" class="px-4 py-2 font-bold border-b-2 transition-colors ${this.activeTab === 'actions' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500'}">
              Ações Recentes
            </button>
            <button onclick="window.historyModule.setTab('trash')" class="px-4 py-2 font-bold border-b-2 transition-colors ${this.activeTab === 'trash' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500'}">
              Lixeira (Recuperação)
            </button>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          ${this.activeTab === 'actions' ? this.renderActionsList() : this.renderTrashList()}
        </div>
      </div>
    `;

    window.historyModule = this;
  }

  renderActionsList() {
    if (this.actions.length === 0) return '<div class="p-8 text-center text-gray-500">Nenhuma ação registrada.</div>';

    return `
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Quando</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ação</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Entidade</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nome/Ref</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            ${this.actions.map(a => `
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap text-xs">${formatDate(a.timestamp)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 rounded text-[10px] font-bold uppercase ${this.getActionColor(a.type)}">
                    ${a.type}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${a.entity_type}</td>
                <td class="px-6 py-4 text-sm font-medium">${a.entity_name || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderTrashList() {
    if (this.trash.length === 0) return '<div class="p-8 text-center text-gray-500">Lixeira vazia.</div>';

    return `
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Excluído em</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tipo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Dados</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            ${this.trash.map(t => `
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap text-xs">${formatDate(t.deleted_at)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-bold uppercase">
                    ${t.entity_type}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm max-w-xs truncate">${JSON.stringify(t.entity_data)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <button onclick="window.historyModule.restoreItem('${t.id}')" class="text-green-600 hover:text-green-700 font-bold text-xs uppercase"><i class="fa-solid fa-undo mr-1"></i> Restaurar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  getActionColor(type) {
    switch (type) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'edit': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'restore': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  setTab(tab) {
    this.activeTab = tab;
    this.render();
  }

  async restoreItem(id) {
    dialog.show('Deseja restaurar este item?', 'confirm', async (yes) => {
      if (yes) {
        try {
          loading.show('Restaurando...');
          await api.post(`/api/trash/${id}/restore`);
          await this.loadData();
          this.render();
          dialog.show('Item restaurado com sucesso!', 'alert');
        } catch (error) {
          dialog.show('Erro ao restaurar item.', 'alert');
        } finally {
          loading.hide();
        }
      }
    });
  }

  destroy() {
    delete window.historyModule;
  }
}
