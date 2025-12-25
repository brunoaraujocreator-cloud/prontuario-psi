import { api } from '../../services/api.js';
import { loading } from '../../components/Loading.js';
import { dialog } from '../../components/Dialog.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export class ReceivablesModule {
  constructor() {
    this.container = null;
    this.receivables = [];
    this.patients = [];
    this.sessions = [];
    this.activeTab = 'manual'; // 'manual' or 'automatic'
    this.searchPending = '';
    this.searchPaid = '';
    this.csvData = [];
    this.csvMappings = {};
  }

  async init() {
    this.container = document.getElementById('app-container') || document.getElementById('app');
    await this.loadData();
    await this.render();
  }

  async loadData() {
    try {
      loading.show('Carregando recebíveis...');
      const [receivables, patients, sessions] = await Promise.all([
        api.get('/api/receivables').catch(() => []),
        api.get('/api/patients').catch(() => []),
        api.get('/api/sessions').catch(() => [])
      ]);

      this.receivables = receivables;
      this.patients = patients;
      this.sessions = sessions;
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
            <i class="fa-solid fa-hand-holding-dollar text-[var(--color-primary)]"></i> Gestão de Recebíveis
          </h2>
        </div>

        <!-- Abas -->
        <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex gap-4">
            <button onclick="window.receivablesModule.setTab('automatic')" class="px-4 py-2 font-bold border-b-2 transition-colors ${this.activeTab === 'automatic' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500'}">
              Automático
            </button>
            <button onclick="window.receivablesModule.setTab('manual')" class="px-4 py-2 font-bold border-b-2 transition-colors ${this.activeTab === 'manual' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500'}">
              Manual
            </button>
          </div>
        </div>

        <!-- Conteúdo -->
        <div id="receivables-content">
          ${this.activeTab === 'manual' ? this.renderManualView() : this.renderAutomaticView()}
        </div>
      </div>
    `;

    window.receivablesModule = this;
  }

  renderManualView() {
    const pendingItems = this.getPendingItems();
    const paidItems = this.getPaidItems();

    return `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- LEFT: PENDING -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col max-h-[calc(100vh-240px)]">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <i class="fa-solid fa-clock text-amber-500"></i> Pagamentos a Receber
          </h2>
          <div class="mb-3">
            <input type="text" placeholder="Filtrar por nome..." class="input-field text-sm" value="${this.searchPending}" oninput="window.receivablesModule.searchPending=this.value; window.receivablesModule.updateLists()">
          </div>
          <div id="pending-list" class="flex-1 overflow-y-auto space-y-2 mb-4 pr-1">
            ${this.renderPendingList(pendingItems)}
          </div>
          <button onclick="window.receivablesModule.confirmPayment()" class="bg-[var(--color-primary)] text-white py-3 rounded-lg font-bold hover:opacity-90">
            Confirmar Pagamento
          </button>
        </div>

        <!-- RIGHT: RECEIVED -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col max-h-[calc(100vh-240px)]">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <i class="fa-solid fa-check-circle text-green-500"></i> Recebidos
          </h2>
          <div class="mb-3">
            <input type="text" placeholder="Filtrar por nome..." class="input-field text-sm" value="${this.searchPaid}" oninput="window.receivablesModule.searchPaid=this.value; window.receivablesModule.updateLists()">
          </div>
          <div id="paid-list" class="flex-1 overflow-y-auto space-y-2 pr-1">
            ${this.renderPaidList(paidItems)}
          </div>
        </div>
      </div>
    `;
  }

  renderAutomaticView() {
    return `
      <div class="space-y-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
            <i class="fa-solid fa-file-csv text-[var(--color-primary)]"></i> Carregar Extrato Bancário (CSV)
          </h3>
          <div class="space-y-4">
            <div class="relative">
              <input type="file" id="csv-file-input" class="hidden" accept=".csv" onchange="window.receivablesModule.handleCSV(this)">
              <label for="csv-file-input" class="bg-[var(--color-primary)] text-white w-full py-3 rounded-lg font-bold text-center cursor-pointer block hover:opacity-90 transition-opacity">
                <i class="fa-solid fa-upload mr-2"></i> Selecionar Arquivo CSV
              </label>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              O arquivo CSV deve conter colunas para: Data, Descrição e Valor.
            </p>
          </div>
        </div>

        <div id="csv-entries-container" class="${this.csvData.length > 0 ? '' : 'hidden'}">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
              <i class="fa-solid fa-list text-[var(--color-primary)]"></i> Entradas do Extrato (${this.csvData.length})
            </h3>
            <div id="csv-entries-list" class="space-y-4 max-h-96 overflow-y-auto pr-2">
              ${this.renderCSVEntries()}
            </div>
            
            <div class="flex gap-3 mt-6">
              <button onclick="window.receivablesModule.executeReconciliation()" class="bg-[var(--color-primary)] text-white flex-1 py-3 rounded-lg font-bold hover:opacity-90">
                Confirmar Conciliação
              </button>
              <button onclick="window.receivablesModule.cancelReconciliation()" class="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 flex-1 py-3 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getPendingItems() {
    // Group sessions by patient and month for manual payment
    const groups = {};
    this.sessions.forEach(s => {
      if (!s.paid && (s.status === 'Realizada' || s.status === 'Falta Injustificada' || s.status === 'Agendada')) {
        const key = `${s.patient_id}_${s.date.substring(0, 7)}`;
        if (!groups[key]) {
          groups[key] = {
            patientId: s.patient_id,
            month: s.date.substring(0, 7),
            sessions: [],
            total: 0
          };
        }
        groups[key].sessions.push(s);
        groups[key].total += Number(s.value || 0);
      }
    });

    let items = Object.values(groups).sort((a, b) => a.month.localeCompare(b.month));
    
    if (this.searchPending) {
      items = items.filter(item => {
        const p = this.patients.find(x => x.id === item.patientId);
        return p?.name.toLowerCase().includes(this.searchPending.toLowerCase());
      });
    }
    return items;
  }

  getPaidItems() {
    let items = this.sessions.filter(s => s.paid).sort((a, b) => b.date.localeCompare(a.date));
    
    if (this.searchPaid) {
      items = items.filter(s => {
        const p = this.patients.find(x => x.id === s.patient_id);
        return p?.name.toLowerCase().includes(this.searchPaid.toLowerCase());
      });
    }
    return items;
  }

  renderPendingList(items) {
    if (items.length === 0) return '<p class="text-gray-400 text-center py-8">Nenhum pagamento pendente.</p>';
    
    return items.map(item => {
      const p = this.patients.find(x => x.id === item.patientId);
      return `
        <div class="flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          <input type="checkbox" class="w-5 h-5 text-[var(--color-primary)] rounded cursor-pointer" data-ids="${item.sessions.map(s => s.id).join(',')}">
          <div class="flex-1">
            <p class="font-bold text-sm">${p?.name || 'Paciente Excluído'}</p>
            <p class="text-xs text-gray-500">${item.month}</p>
          </div>
          <span class="font-bold text-gray-600 dark:text-gray-300">${formatCurrency(item.total)}</span>
        </div>
      `;
    }).join('');
  }

  renderPaidList(items) {
    if (items.length === 0) return '<p class="text-gray-400 text-center py-8">Nenhum pagamento recebido.</p>';

    return items.map(s => {
      const p = this.patients.find(x => x.id === s.patient_id);
      return `
        <div class="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded">
          <div>
            <p class="font-bold text-sm">${p?.name || 'Paciente Excluído'}</p>
            <p class="text-xs text-gray-500">${formatDate(s.date)}</p>
          </div>
          <div class="text-right">
            <p class="font-bold text-green-600 dark:text-green-400">${formatCurrency(s.value)}</p>
            <button onclick="window.receivablesModule.revertPayment('${s.id}')" class="text-red-500 hover:underline text-[10px] uppercase font-bold">Estornar</button>
          </div>
        </div>
      `;
    }).join('');
  }

  async confirmPayment() {
    const checkboxes = this.container.querySelectorAll('#pending-list input:checked');
    if (checkboxes.length === 0) return dialog.show('Selecione pelo menos um item.', 'alert');

    const sessionIds = Array.from(checkboxes).flatMap(cb => cb.dataset.ids.split(','));
    
    dialog.show('Confirmar recebimento selecionado?', 'confirm', async (yes) => {
      if (yes) {
        try {
          loading.show('Processando pagamento...');
          // Update sessions one by one or via batch if backend supports it
          await Promise.all(sessionIds.map(id => api.put(`/api/sessions/${id}`, { paid: true, payment_date: new Date().toISOString().split('T')[0] })));
          await this.loadData();
          this.render();
          dialog.show('Pagamento confirmado com sucesso!', 'alert');
        } catch (error) {
          dialog.show('Erro ao processar pagamento.', 'alert');
        } finally {
          loading.hide();
        }
      }
    });
  }

  async revertPayment(id) {
    dialog.show('Deseja estornar este pagamento?', 'confirm', async (yes) => {
      if (yes) {
        try {
          loading.show('Processando estorno...');
          await api.put(`/api/sessions/${id}`, { paid: false, payment_date: null });
          await this.loadData();
          this.render();
        } catch (error) {
          dialog.show('Erro ao processar estorno.', 'alert');
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
    const pendingList = document.getElementById('pending-list');
    const paidList = document.getElementById('paid-list');
    if (pendingList) pendingList.innerHTML = this.renderPendingList(this.getPendingItems());
    if (paidList) paidList.innerHTML = this.renderPaidList(this.getPaidItems());
  }

  handleCSV(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      this.parseCSV(text);
    };
    reader.readAsText(file, 'UTF-8');
  }

  parseCSV(text) {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return dialog.show('Arquivo inválido.', 'alert');

    const delimiter = text.includes(';') ? ';' : ',';
    const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
    
    let dateIdx = headers.findIndex(h => h.includes('data') || h.includes('date'));
    let descIdx = headers.findIndex(h => h.includes('desc'));
    let valIdx = headers.findIndex(h => h.includes('valor') || h.includes('credit'));

    if (dateIdx === -1 || valIdx === -1) return dialog.show('Colunas Data e Valor não encontradas.', 'alert');

    this.csvData = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));
      if (cols.length < 2) continue;

      const val = parseFloat(cols[valIdx]?.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
      if (val > 0) {
        this.csvData.push({
          id: Math.random().toString(36).substr(2, 9),
          date: cols[dateIdx],
          description: cols[descIdx] || '',
          value: val
        });
      }
    }

    if (this.csvData.length === 0) return dialog.show('Nenhum crédito encontrado.', 'alert');
    this.render();
  }

  renderCSVEntries() {
    return this.csvData.map(entry => `
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/20">
        <div class="flex justify-between mb-2">
          <div>
            <p class="font-bold text-[var(--color-primary)]">${formatCurrency(entry.value)}</p>
            <p class="text-xs text-gray-500">${entry.date} - ${entry.description}</p>
          </div>
          <button onclick="window.receivablesModule.removeCSVEntry('${entry.id}')" class="text-red-500"><i class="fa-solid fa-trash"></i></button>
        </div>
        <select onchange="window.receivablesModule.mapCSV('${entry.id}', this.value)" class="input-field text-xs">
          <option value="">Relacionar com paciente...</option>
          ${this.patients.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
        </select>
      </div>
    `).join('');
  }

  mapCSV(entryId, patientId) {
    this.csvMappings[entryId] = patientId;
  }

  removeCSVEntry(id) {
    this.csvData = this.csvData.filter(e => e.id !== id);
    delete this.csvMappings[id];
    this.render();
  }

  cancelReconciliation() {
    this.csvData = [];
    this.csvMappings = {};
    this.render();
  }

  async executeReconciliation() {
    const unmapped = this.csvData.filter(e => !this.csvMappings[e.id]);
    if (unmapped.length > 0) return dialog.show('Relacione todos os itens.', 'alert');

    dialog.show('Confirmar conciliação?', 'confirm', async (yes) => {
      if (yes) {
        try {
          loading.show('Conciliando...');
          // Logic to find matching sessions and mark as paid
          // This is a simplified version of the HTML's complex logic
          for (const entry of this.csvData) {
            const patientId = this.csvMappings[entry.id];
            const sessions = this.sessions.filter(s => s.patient_id === patientId && !s.paid && Math.abs(Number(s.value) - entry.value) < 0.01);
            if (sessions.length > 0) {
              await api.put(`/api/sessions/${sessions[0].id}`, { paid: true, payment_date: entry.date });
            }
          }
          await this.loadData();
          this.csvData = [];
          this.csvMappings = {};
          this.render();
          dialog.show('Conciliação concluída!', 'alert');
        } catch (error) {
          dialog.show('Erro na conciliação.', 'alert');
        } finally {
          loading.hide();
        }
      }
    });
  }

  destroy() {
    delete window.receivablesModule;
  }
}
