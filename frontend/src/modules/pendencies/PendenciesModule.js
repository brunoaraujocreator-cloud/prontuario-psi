import { api } from '../../services/api.js';
import { loading } from '../../components/Loading.js';
import { dialog } from '../../components/Dialog.js';
import { formatDate, formatCurrency } from '../../utils/formatters.js';

export class PendenciesModule {
  constructor() {
    this.container = null;
    this.pendencies = [];
  }

  async init() {
    this.container = document.getElementById('app-container') || document.getElementById('app');
    await this.loadPendencies();
    await this.render();
  }

  async loadPendencies() {
    try {
      loading.show('Carregando pendências...');
      
      // Load receivables and sessions with pending status
      const [receivables, sessions] = await Promise.all([
        api.get('/api/receivables').catch(() => []),
        api.get('/api/sessions').catch(() => [])
      ]);

      // Filter pendencies
      const pendingReceivables = receivables.filter(r => 
        r.status === 'Pendente' || !r.payment_date
      ).map(r => ({
        ...r,
        type: 'receivable',
        title: r.description,
        dueDate: r.due_date,
        value: r.value
      }));

      const pendingSessions = sessions.filter(s => 
        s.status === 'Agendada' || s.status === 'Pendente'
      ).map(s => ({
        ...s,
        type: 'session',
        title: `Sessão - ${s.service_type || 'Consulta'}`,
        dueDate: s.date,
        value: s.value
      }));

      this.pendencies = [...pendingReceivables, ...pendingSessions]
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      
    } catch (error) {
      console.error('Error loading pendencies:', error);
      this.pendencies = [];
    } finally {
      loading.hide();
    }
  }

  async render() {
    this.container.innerHTML = `
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold">Pendências</h1>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Total: ${this.pendencies.length} pendência(s)
          </div>
        </div>
        
        <div class="space-y-4">
          ${this.pendencies.length === 0 ? `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <i class="fa-solid fa-check-circle text-4xl text-green-500 mb-4"></i>
              <p class="text-gray-600 dark:text-gray-400">Nenhuma pendência encontrada!</p>
            </div>
          ` : this.pendencies.map(p => this.renderPendencyCard(p)).join('')}
        </div>
      </div>
    `;

    this.attachEvents();
  }

  renderPendencyCard(pendency) {
    const isOverdue = new Date(pendency.dueDate) < new Date();
    const typeLabels = {
      receivable: 'Recebível',
      session: 'Sessão'
    };

    const typeColors = {
      receivable: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      session: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    };

    return `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${
        isOverdue ? 'border-l-4 border-red-500' : ''
      }">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span class="px-2 py-1 rounded text-xs ${typeColors[pendency.type] || 'bg-gray-100 text-gray-800'}">
                ${typeLabels[pendency.type] || pendency.type}
              </span>
              ${isOverdue ? `
                <span class="px-2 py-1 rounded text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  Atrasado
                </span>
              ` : ''}
            </div>
            <h3 class="text-lg font-semibold mb-2">${pendency.title || '-'}</h3>
            <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p><i class="fa-solid fa-calendar mr-2"></i>Vencimento: ${formatDate(pendency.dueDate)}</p>
              ${pendency.value ? `
                <p><i class="fa-solid fa-dollar-sign mr-2"></i>Valor: ${formatCurrency(pendency.value)}</p>
              ` : ''}
            </div>
          </div>
          <div class="flex gap-2">
            ${pendency.type === 'receivable' ? `
              <button 
                onclick="window.pendenciesModule.markAsPaid('${pendency.id}', 'receivable')"
                class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                title="Marcar como pago"
              >
                <i class="fa-solid fa-check"></i>
              </button>
            ` : ''}
            ${pendency.type === 'session' ? `
              <button 
                onclick="window.pendenciesModule.completeSession('${pendency.id}')"
                class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                title="Concluir sessão"
              >
                <i class="fa-solid fa-check"></i>
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  attachEvents() {
    window.pendenciesModule = this;
  }

  async markAsPaid(id, type) {
    try {
      loading.show('Atualizando...');
      
      if (type === 'receivable') {
        await api.put(`/api/receivables/${id}`, {
          status: 'Pago',
          payment_date: new Date().toISOString().split('T')[0]
        });
        dialog.show('Recebível marcado como pago!', 'success');
      }
      
      await this.loadPendencies();
      await this.render();
    } catch (error) {
      console.error('Error updating:', error);
      dialog.show('Erro ao atualizar: ' + error.message, 'alert');
    } finally {
      loading.hide();
    }
  }

  async completeSession(id) {
    try {
      loading.show('Atualizando...');
      
      await api.put(`/api/sessions/${id}`, {
        status: 'Concluída'
      });
      dialog.show('Sessão concluída!', 'success');
      
      await this.loadPendencies();
      await this.render();
    } catch (error) {
      console.error('Error updating session:', error);
      dialog.show('Erro ao atualizar sessão: ' + error.message, 'alert');
    } finally {
      loading.hide();
    }
  }

  destroy() {
    delete window.pendenciesModule;
  }
}
