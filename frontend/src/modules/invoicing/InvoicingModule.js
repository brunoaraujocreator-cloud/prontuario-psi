import { api } from '../../services/api.js';
import { loading } from '../../components/Loading.js';
import { dialog } from '../../components/Dialog.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export class InvoicingModule {
  constructor() {
    this.container = null;
    this.sessions = [];
    this.patients = [];
    this.activeTab = 'manual';
    this.searchPending = '';
    this.searchDone = '';
  }

  async init() {
    this.container = document.getElementById('app-container') || document.getElementById('app');
    await this.loadData();
    await this.render();
  }

  async loadData() {
    try {
      loading.show('Carregando dados de faturamento...');
      const [sessions, patients] = await Promise.all([
        api.get('/api/sessions').catch(() => []),
        api.get('/api/patients').catch(() => [])
      ]);

      this.sessions = sessions;
      this.patients = patients;
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      loading.hide();
    }
  }

  async render() {
    this.container.innerHTML = `
      <div class="p-6 fade-in">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold flex items-center gap-2">
            <i class="fa-solid fa-file-invoice text-[var(--color-primary)]"></i> Gestão de Faturamento
          </h2>
        </div>

        <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex gap-4">
            <button onclick="window.invoicingModule.setTab('manual')" class="px-4 py-2 font-bold border-b-2 transition-colors ${this.activeTab === 'manual' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500'}">
              Manual
            </button>
            <button onclick="window.invoicingModule.setTab('automatic')" class="px-4 py-2 font-bold border-b-2 transition-colors ${this.activeTab === 'automatic' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500'}">
              Automático (CSV)
            </button>
          </div>
        </div>

        <div id="invoicing-content">
          ${this.activeTab === 'manual' ? this.renderManualView() : this.renderAutomaticView()}
        </div>
      </div>
    `;

    window.invoicingModule = this;
  }

  renderManualView() {
    const pendingGroups = this.getPendingGroups();
    const doneInvoices = this.getDoneInvoices();

    return `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col max-h-[calc(100vh-240px)]">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <i class="fa-solid fa-clock text-amber-500"></i> Recebimentos a Faturar
          </h2>
          <div class="mb-3">
            <input type="text" placeholder="Filtrar por paciente..." class="input-field text-sm" value="${this.searchPending}" oninput="window.invoicingModule.searchPending=this.value; window.invoicingModule.updateLists()">
          </div>
          <div id="inv-pending-list" class="flex-1 overflow-y-auto space-y-2 mb-4 pr-1">
            ${this.renderPendingList(pendingGroups)}
          </div>
          <button onclick="window.invoicingModule.confirmInvoicing()" class="bg-[var(--color-primary)] text-white py-3 rounded-lg font-bold hover:opacity-90">
            Confirmar Faturamento
          </button>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col max-h-[calc(100vh-240px)]">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <i class="fa-solid fa-check-double text-green-500"></i> Faturados
          </h2>
          <div class="mb-3">
            <input type="text" placeholder="Filtrar por paciente..." class="input-field text-sm" value="${this.searchDone}" oninput="window.invoicingModule.searchDone=this.value; window.invoicingModule.updateLists()">
          </div>
          <div id="inv-done-list" class="flex-1 overflow-y-auto space-y-2 pr-1">
            ${this.renderDoneList(doneInvoices)}
          </div>
        </div>
      </div>
    `;
  }

  renderAutomaticView() {
    return `<div class="p-12 text-center bg-white dark:bg-gray-800 rounded-lg shadow-md"><p class="text-gray-500">Funcionalidade de faturamento automático via CSV em desenvolvimento.</p></div>`;
  }

  getPendingGroups() {
    const groups = {};
    this.sessions.forEach(s => {
      if (s.paid && !s.invoice_number && Number(s.value) > 0) {
        const key = `${s.patient_id}_${s.payment_date || s.date}`;
        if (!groups[key]) {
          groups[key] = {
            patientId: s.patient_id,
            date: s.payment_date || s.date,
            total: 0,
            sessionIds: []
          };
        }
        groups[key].total += Number(s.value);
        groups[key].sessionIds.push(s.id);
      }
    });

    let items = Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
    if (this.searchPending) {
      items = items.filter(item => {
        const p = this.patients.find(x => x.id === item.patientId);
        return p?.name.toLowerCase().includes(this.searchPending.toLowerCase());
      });
    }
    return items;
  }

  getDoneInvoices() {
    const invoices = {};
    this.sessions.forEach(s => {
      if (s.invoice_number) {
        if (!invoices[s.invoice_number]) {
          invoices[s.invoice_number] = {
            number: s.invoice_number,
            date: s.invoice_date,
            patientId: s.patient_id,
            total: 0,
            attachment: s.invoice_attachment
          };
        }
        invoices[s.invoice_number].total += Number(s.value);
      }
    });

    let items = Object.values(invoices).sort((a, b) => b.date.localeCompare(a.date));
    if (this.searchDone) {
      items = items.filter(item => {
        const p = this.patients.find(x => x.id === item.patientId);
        return p?.name.toLowerCase().includes(this.searchDone.toLowerCase());
      });
    }
    return items;
  }

  renderPendingList(items) {
    if (items.length === 0) return '<p class="text-gray-400 text-center py-8">Nenhum item a faturar.</p>';
    
    return items.map(item => {
      const p = this.patients.find(x => x.id === item.patientId);
      return `
        <div class="flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
          <input type="checkbox" class="w-5 h-5 text-[var(--color-primary)] rounded cursor-pointer" data-ids="${item.sessionIds.join(',')}">
          <div class="flex-1">
            <p class="font-bold text-sm">${p?.name || 'Paciente Excluído'}</p>
            <p class="text-xs text-gray-500">Pago em: ${formatDate(item.date)}</p>
          </div>
          <span class="font-bold text-gray-600 dark:text-gray-300">${formatCurrency(item.total)}</span>
        </div>
      `;
    }).join('');
  }

  renderDoneList(items) {
    if (items.length === 0) return '<p class="text-gray-400 text-center py-8">Nenhuma nota emitida.</p>';

    return items.map(inv => {
      const p = this.patients.find(x => x.id === inv.patientId);
      return `
        <div class="p-3 border border-green-100 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10 rounded">
          <div class="flex justify-between items-start mb-2">
            <div>
              <p class="font-bold text-sm">${p?.name || 'Paciente Excluído'}</p>
              <p class="text-xs text-gray-600 dark:text-gray-400">NF: <b>${inv.number}</b> em ${formatDate(inv.date)}</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-green-600 dark:text-green-400">${formatCurrency(inv.total)}</p>
            </div>
          </div>
          <div class="flex gap-3 mt-2 pt-2 border-t border-green-100 dark:border-green-900/30">
            <button onclick="window.invoicingModule.deleteInvoice('${inv.number}')" class="text-red-500 text-xs font-bold uppercase hover:underline">Excluir</button>
          </div>
        </div>
      `;
    }).join('');
  }

  async confirmInvoicing() {
    const checkboxes = this.container.querySelectorAll('#inv-pending-list input:checked');
    if (checkboxes.length === 0) return dialog.show('Selecione pelo menos um item.', 'alert');

    const sessionIds = Array.from(checkboxes).flatMap(cb => cb.dataset.ids.split(','));
    const total = Array.from(checkboxes).reduce((sum, cb) => sum + parseFloat(cb.closest('div').querySelector('span').textContent.replace('R$ ', '').replace('.', '').replace(',', '.')), 0);

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 class="text-xl font-bold mb-4">Emitir Faturamento</h2>
        <div class="p-4 bg-gray-100 dark:bg-gray-700 rounded text-center mb-4">
          <p class="text-sm text-gray-500">Valor Total Selecionado</p>
          <p class="text-2xl font-bold text-[var(--color-primary)]">${formatCurrency(total)}</p>
        </div>
        <form id="invoice-confirm-form" class="space-y-4">
          <div>
            <label class="block text-sm font-bold mb-1">Nota Fiscal *</label>
            <input type="text" id="inv-number" required class="input-field" placeholder="0000000">
          </div>
          <div>
            <label class="block text-sm font-bold mb-1">Data de Emissão *</label>
            <input type="date" id="inv-date" required class="input-field" value="${new Date().toISOString().split('T')[0]}">
          </div>
          <div class="flex gap-3 justify-end mt-6">
            <button type="button" onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">Cancelar</button>
            <button type="submit" class="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg font-bold">Salvar Nota</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('invoice-confirm-form').onsubmit = async (e) => {
      e.preventDefault();
      const number = document.getElementById('inv-number').value;
      const date = document.getElementById('inv-date').value;

      try {
        loading.show('Salvando faturamento...');
        await Promise.all(sessionIds.map(id => api.put(`/api/sessions/${id}`, { invoice_number: number, invoice_date: date })));
        await this.loadData();
        modal.remove();
        this.render();
        dialog.show('Faturamento salvo com sucesso!', 'alert');
      } catch (error) {
        dialog.show('Erro ao salvar faturamento.', 'alert');
      } finally {
        loading.hide();
      }
    };
  }

  async deleteInvoice(number) {
    dialog.show(`Deseja realmente excluir a nota ${number}?`, 'confirm', async (yes) => {
      if (yes) {
        try {
          loading.show('Excluindo nota...');
          const sessionsWithNf = this.sessions.filter(s => s.invoice_number === number);
          await Promise.all(sessionsWithNf.map(s => api.put(`/api/sessions/${s.id}`, { invoice_number: null, invoice_date: null, invoice_attachment: null })));
          await this.loadData();
          this.render();
        } catch (error) {
          dialog.show('Erro ao excluir nota.', 'alert');
        } finally {
          loading.hide();
        }
      }
    });
  }

  setTab(tab) {
    this.activeTab = tab;
    this.render();
  }

  updateLists() {
    const pendingList = document.getElementById('inv-pending-list');
    const doneList = document.getElementById('inv-done-list');
    if (pendingList) pendingList.innerHTML = this.renderPendingList(this.getPendingGroups());
    if (doneList) doneList.innerHTML = this.renderDoneList(this.getDoneInvoices());
  }

  destroy() {
    delete window.invoicingModule;
  }
}
