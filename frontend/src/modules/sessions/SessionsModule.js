import { api } from '../../services/api.js';
import { loading } from '../../components/Loading.js';
import { dialog } from '../../components/Dialog.js';
import { formatDate, formatCurrency } from '../../utils/formatters.js';

export class SessionsModule {
  constructor() {
    this.container = null;
    this.sessions = [];
    this.patients = [];
    this.groups = [];
    this.serviceTypes = [];
    this.view = 'list'; // 'list' or 'manage'
  }

  async init() {
    this.container = document.getElementById('app-container') || document.getElementById('app');
    await this.loadData();
    await this.render();
  }

  async loadData() {
    try {
      loading.show('Carregando sessões...');
      const [sessions, patients, groups, settings] = await Promise.all([
        api.get('/api/sessions'),
        api.get('/api/patients'),
        api.get('/api/groups'),
        api.get('/api/settings')
      ]);

      this.sessions = sessions;
      this.patients = patients;
      this.groups = groups;
      this.serviceTypes = settings.serviceTypes || [];
      
      // Auto update status logic (Agendada -> Realizada if past)
      // This should ideally happen on the backend, but we'll do it here too for parity
      this.autoUpdateStatus();
    } catch (error) {
      console.error('Error loading sessions:', error);
      this.sessions = [];
    } finally {
      loading.hide();
    }
  }

  autoUpdateStatus() {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

    this.sessions.forEach(async s => {
      if (s.status === 'Agendada' && (s.date < todayStr || (s.date === todayStr && s.time && s.time < timeStr))) {
        // In a real app, we'd send a batch update to backend
        // For now, we'll just show it as Realizada in UI and update if edited
        s.status = 'Realizada';
      }
    });
  }

  async render() {
    this.container.innerHTML = `
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold flex items-center gap-2">
            <i class="fa-solid fa-calendar-check text-[var(--color-primary)]"></i> Sessões
          </h1>
          <div class="flex gap-2">
            <button 
              onclick="window.sessionsModule.setView('${this.view === 'list' ? 'manage' : 'list'}')"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-bold"
            >
              <i class="fa-solid ${this.view === 'list' ? 'fa-tasks' : 'fa-list'} mr-2"></i>
              ${this.view === 'list' ? 'Gerenciar Sessões' : 'Ver Lista'}
            </button>
            <button 
              id="add-session-btn"
              class="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 font-bold flex items-center gap-2"
            >
              <i class="fa-solid fa-plus"></i>Nova Sessão
            </button>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          ${this.view === 'list' ? this.renderSessionsList() : this.renderManageView()}
        </div>
      </div>
    `;

    this.attachEvents();
  }

  renderSessionsList() {
    if (this.sessions.length === 0) {
      return `
        <div class="px-6 py-8 text-center text-gray-500">
          Nenhuma sessão cadastrada
        </div>
      `;
    }

    return `
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Data/Hora</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Paciente / Grupo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Valor</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            ${this.sessions.map(session => {
              const patient = this.patients.find(p => p.id === session.patient_id);
              const group = session.is_group ? this.groups.find(g => g.id === session.group_id) : null;
              const name = session.is_group ? `Grupo: ${group?.name || 'Excluído'}` : (patient?.name || 'Paciente Excluído');
              
              const statusColors = {
                'Agendada': 'bg-blue-100 text-blue-800',
                'Realizada': 'bg-green-100 text-green-800',
                'Cancelada': 'bg-red-100 text-red-800',
                'Falta Justificada': 'bg-amber-100 text-amber-800',
                'Falta Injustificada': 'bg-red-100 text-red-800'
              };

              return `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="font-bold">${formatDate(session.date)}</div>
                    <div class="text-xs text-gray-500">${session.time || '--:--'} às ${session.end_time || '--:--'}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="${session.is_group ? 'text-[var(--color-primary)] font-bold' : ''}">${name}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 rounded-full text-xs font-bold ${statusColors[session.status] || 'bg-gray-100 text-gray-800'}">
                      ${session.status}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap font-bold">${formatCurrency(session.value)}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <button onclick="window.sessionsModule.editSession('${session.id}')" class="text-blue-500 hover:text-blue-700 mr-3"><i class="fa-solid fa-edit"></i></button>
                    <button onclick="window.sessionsModule.deleteSession('${session.id}')" class="text-red-500 hover:text-red-700"><i class="fa-solid fa-trash"></i></button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderManageView() {
    // Similar to HTML's renderManageSessionsList
    return `<div class="p-6 text-center text-gray-500">Gerenciamento avançado de sessões em desenvolvimento.</div>`;
  }

  setView(view) {
    this.view = view;
    this.render();
  }

  attachEvents() {
    const addBtn = document.getElementById('add-session-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showSessionForm());
    }
    window.sessionsModule = this;
  }

  showSessionForm(session = null) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 class="text-xl font-bold">${session ? 'Editar' : 'Nova'} Sessão</h2>
          <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700"><i class="fa-solid fa-times"></i></button>
        </div>
        <form id="session-form" class="p-6 space-y-4">
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-sm font-bold mb-1">Tipo de Sessão</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="is_group" value="false" ${!session?.is_group ? 'checked' : ''} onchange="window.sessionsModule.toggleFormType(false)">
                  Individual
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="is_group" value="true" ${session?.is_group ? 'checked' : ''} onchange="window.sessionsModule.toggleFormType(true)">
                  Grupo
                </label>
              </div>
            </div>

            <div id="patient-select-container" class="${session?.is_group ? 'hidden' : ''}">
              <label class="block text-sm font-bold mb-1">Paciente *</label>
              <select id="session-patient" class="input-field" ${!session?.is_group ? 'required' : ''}>
                <option value="">Selecione...</option>
                ${this.patients.map(p => `<option value="${p.id}" ${session?.patient_id === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
              </select>
            </div>

            <div id="group-select-container" class="${!session?.is_group ? 'hidden' : ''}">
              <label class="block text-sm font-bold mb-1">Grupo *</label>
              <select id="session-group" class="input-field" ${session?.is_group ? 'required' : ''}>
                <option value="">Selecione...</option>
                ${this.groups.map(g => `<option value="${g.id}" ${session?.group_id === g.id ? 'selected' : ''}>${g.name}</option>`).join('')}
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold mb-1">Data *</label>
                <input type="date" id="session-date" required value="${session?.date || new Date().toISOString().split('T')[0]}" class="input-field">
              </div>
              <div>
                <label class="block text-sm font-bold mb-1">Hora Início *</label>
                <input type="time" id="session-time" required value="${session?.time || '08:00'}" class="input-field">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold mb-1">Duração (min)</label>
                <input type="number" id="session-duration" value="50" class="input-field">
              </div>
              <div>
                <label class="block text-sm font-bold mb-1">Status</label>
                <select id="session-status" class="input-field">
                  <option value="Agendada" ${session?.status === 'Agendada' ? 'selected' : ''}>Agendada</option>
                  <option value="Realizada" ${session?.status === 'Realizada' ? 'selected' : ''}>Realizada</option>
                  <option value="Falta Justificada" ${session?.status === 'Falta Justificada' ? 'selected' : ''}>Falta Justificada</option>
                  <option value="Falta Injustificada" ${session?.status === 'Falta Injustificada' ? 'selected' : ''}>Falta Injustificada</option>
                  <option value="Cancelada" ${session?.status === 'Cancelada' ? 'selected' : ''}>Cancelada</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold mb-1">Valor (R$)</label>
              <input type="number" id="session-value" step="0.01" value="${session?.value || 0}" class="input-field">
            </div>

            <div>
              <label class="block text-sm font-bold mb-1">Observações</label>
              <textarea id="session-notes" rows="3" class="input-field">${session?.notes || ''}</textarea>
            </div>
          </div>
          
          <div class="flex gap-3 justify-end mt-6">
            <button type="button" onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300">Cancelar</button>
            <button type="submit" class="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 font-bold">Salvar Sessão</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    const form = document.getElementById('session-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveSession(session?.id);
      modal.remove();
    });
  }

  toggleFormType(isGroup) {
    const pContainer = document.getElementById('patient-select-container');
    const gContainer = document.getElementById('group-select-container');
    const pSelect = document.getElementById('session-patient');
    const gSelect = document.getElementById('session-group');

    if (isGroup) {
      pContainer.classList.add('hidden');
      gContainer.classList.remove('hidden');
      pSelect.required = false;
      gSelect.required = true;
    } else {
      pContainer.classList.remove('hidden');
      gContainer.classList.add('hidden');
      pSelect.required = true;
      gSelect.required = false;
    }
  }

  async saveSession(id) {
    const isGroup = document.querySelector('input[name="is_group"]:checked').value === 'true';
    const date = document.getElementById('session-date').value;
    const time = document.getElementById('session-time').value;
    const duration = parseInt(document.getElementById('session-duration').value) || 50;

    // Calculate end time
    const [h, m] = time.split(':').map(Number);
    const dateObj = new Date();
    dateObj.setHours(h, m + duration);
    const endTime = dateObj.toTimeString().split(' ')[0].substring(0, 5);

    const data = {
      is_group: isGroup,
      patient_id: isGroup ? null : document.getElementById('session-patient').value,
      group_id: isGroup ? document.getElementById('session-group').value : null,
      date,
      time,
      end_time: endTime,
      status: document.getElementById('session-status').value,
      value: parseFloat(document.getElementById('session-value').value) || 0,
      notes: document.getElementById('session-notes').value || null
    };

    try {
      loading.show('Salvando sessão...');
      
      if (id) {
        await api.put(`/api/sessions/${id}`, data);
      } else {
        // If it's a group session, we might need to create multiple records if the backend expects one per patient
        // But our migration has a group_id in sessions table, so it might be one record for the group
        // In the HTML, group sessions are aggregated. Let's stick to one record per session.
        await api.post('/api/sessions', data);
      }

      await this.loadData();
      await this.render();
      dialog.show('Sessão salva com sucesso!', 'alert');
    } catch (error) {
      console.error('Error saving session:', error);
      dialog.show('Erro ao salvar sessão: ' + error.message, 'alert');
    } finally {
      loading.hide();
    }
  }

  async editSession(id) {
    const session = this.sessions.find(s => s.id === id);
    if (session) {
      this.showSessionForm(session);
    }
  }

  async deleteSession(id) {
    dialog.show(
      'Deseja realmente excluir esta sessão?',
      'confirm',
      async (confirmed) => {
        if (confirmed) {
          try {
            loading.show('Excluindo sessão...');
            await api.delete(`/api/sessions/${id}`);
            await this.loadData();
            await this.render();
          } catch (error) {
            dialog.show('Erro ao excluir sessão: ' + error.message, 'alert');
          } finally {
            loading.hide();
          }
        }
      }
    );
  }

  destroy() {
    delete window.sessionsModule;
  }
}
