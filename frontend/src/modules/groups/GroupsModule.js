import { api } from '../../services/api.js';
import { loading } from '../../components/Loading.js';
import { dialog } from '../../components/Dialog.js';
import { formatDate } from '../../utils/formatters.js';

export class GroupsModule {
  constructor() {
    this.container = null;
    this.groups = [];
    this.patients = [];
    this.serviceTypes = [];
  }

  async init() {
    this.container = document.getElementById('app-container') || document.getElementById('app');
    await this.loadData();
    await this.render();
  }

  async loadData() {
    try {
      loading.show('Carregando dados dos grupos...');
      const [groups, patients, settings] = await Promise.all([
        api.get('/api/groups'),
        api.get('/api/patients'),
        api.get('/api/settings')
      ]);

      this.groups = groups;
      this.patients = patients;
      this.serviceTypes = settings.serviceTypes || [];
    } catch (error) {
      console.error('Error loading groups:', error);
      this.groups = [];
    } finally {
      loading.hide();
    }
  }

  async render() {
    this.container.innerHTML = `
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold flex items-center gap-2">
            <i class="fa-solid fa-users-rectangle text-[var(--color-primary)]"></i> Grupos de Terapia
          </h1>
          <button 
            id="add-group-btn"
            class="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 font-bold flex items-center gap-2"
          >
            <i class="fa-solid fa-plus"></i>Novo Grupo
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${this.renderGroupsGrid()}
        </div>
      </div>
    `;

    this.attachEvents();
  }

  renderGroupsGrid() {
    if (this.groups.length === 0) {
      return `
        <div class="col-span-full px-6 py-8 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          Nenhum grupo cadastrado
        </div>
      `;
    }

    return this.groups.map(group => {
      const activeColor = group.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
      return `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col">
          <div class="p-6 border-b border-gray-100 dark:border-gray-700 relative">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-lg font-bold truncate pr-8">${group.name}</h3>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${activeColor}">
                ${group.active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">${group.description || 'Sem descrição'}</p>
            
            <div class="flex flex-col gap-2 text-xs">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-clock text-gray-400"></i>
                <span>${group.start_time || '--:--'} às ${group.end_time || '--:--'}</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-location-dot text-gray-400"></i>
                <span>${group.modality || 'Presencial'}</span>
              </div>
            </div>

            <div class="absolute top-4 right-4 flex gap-2">
              <button onclick="window.groupsModule.editGroup('${group.id}')" class="text-blue-500 hover:text-blue-700"><i class="fa-solid fa-edit"></i></button>
            </div>
          </div>
          
          <div class="p-4 bg-gray-50 dark:bg-gray-700/50 flex-1">
            <h4 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Participantes</h4>
            <div class="flex flex-wrap gap-2">
              ${(group.participants || []).length === 0 ? '<span class="text-xs text-gray-400 italic">Nenhum participante</span>' : 
                group.participants.map(pId => {
                  const p = this.patients.find(x => x.id === pId);
                  return `<span class="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 text-xs">${p?.name || 'Excluído'}</span>`;
                }).join('')
              }
            </div>
          </div>

          <div class="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <button onclick="window.groupsModule.manageParticipants('${group.id}')" class="text-[var(--color-primary)] text-sm font-bold hover:underline">
              <i class="fa-solid fa-user-plus mr-1"></i> Participantes
            </button>
            <button onclick="window.groupsModule.deleteGroup('${group.id}')" class="text-red-500 hover:text-red-700 text-sm">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  attachEvents() {
    const addBtn = document.getElementById('add-group-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showGroupForm());
    }
    window.groupsModule = this;
  }

  showGroupForm(group = null) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 class="text-xl font-bold">${group ? 'Editar' : 'Novo'} Grupo</h2>
          <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700"><i class="fa-solid fa-times"></i></button>
        </div>
        <form id="group-form" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-bold mb-1">Nome do Grupo *</label>
            <input type="text" id="group-name" required value="${group?.name || ''}" class="input-field">
          </div>

          <div>
            <label class="block text-sm font-bold mb-1">Descrição</label>
            <textarea id="group-description" rows="3" class="input-field">${group?.description || ''}</textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold mb-1">Tipo de Atendimento</label>
              <select id="group-service-type" class="input-field">
                <option value="">Selecione...</option>
                ${this.serviceTypes.map(st => `<option value="${st.id}" ${group?.service_type_id === st.id ? 'selected' : ''}>${st.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-sm font-bold mb-1">Modalidade</label>
              <select id="group-modality" class="input-field">
                <option value="Presencial" ${group?.modality === 'Presencial' ? 'selected' : ''}>Presencial</option>
                <option value="Online" ${group?.modality === 'Online' ? 'selected' : ''}>Online</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold mb-1">Hora Início</label>
              <input type="time" id="group-start-time" value="${group?.start_time || '08:00'}" class="input-field">
            </div>
            <div>
              <label class="block text-sm font-bold mb-1">Duração (min)</label>
              <input type="number" id="group-duration" value="90" class="input-field">
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold mb-1">Valor Padrão por Participante (R$)</label>
            <input type="number" id="group-value" step="0.01" value="${group?.default_participant_value || 0}" class="input-field">
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" id="group-active" ${group?.active !== false ? 'checked' : ''} class="w-4 h-4">
            <label for="group-active" class="text-sm font-bold">Grupo Ativo</label>
          </div>
          
          <div class="flex gap-3 justify-end mt-6">
            <button type="button" onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300">Cancelar</button>
            <button type="submit" class="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 font-bold">Salvar Grupo</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    const form = document.getElementById('group-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveGroup(group?.id);
      modal.remove();
    });
  }

  async saveGroup(id) {
    const startTime = document.getElementById('group-start-time').value;
    const duration = parseInt(document.getElementById('group-duration').value) || 90;

    // Calculate end time
    const [h, m] = startTime.split(':').map(Number);
    const dateObj = new Date();
    dateObj.setHours(h, m + duration);
    const endTime = dateObj.toTimeString().split(' ')[0].substring(0, 5);

    const data = {
      name: document.getElementById('group-name').value,
      description: document.getElementById('group-description').value,
      service_type_id: document.getElementById('group-service-type').value || null,
      modality: document.getElementById('group-modality').value,
      start_time: startTime,
      end_time: endTime,
      default_participant_value: parseFloat(document.getElementById('group-value').value) || 0,
      active: document.getElementById('group-active').checked
    };

    try {
      loading.show('Salvando grupo...');
      
      if (id) {
        await api.put(`/api/groups/${id}`, data);
      } else {
        await api.post('/api/groups', data);
      }

      await this.loadData();
      await this.render();
      dialog.show('Grupo salvo com sucesso!', 'alert');
    } catch (error) {
      console.error('Error saving group:', error);
      dialog.show('Erro ao salvar grupo: ' + error.message, 'alert');
    } finally {
      loading.hide();
    }
  }

  async deleteGroup(id) {
    dialog.show(
      'Deseja realmente excluir este grupo? Todas as sessões vinculadas serão afetadas.',
      'confirm',
      async (confirmed) => {
        if (confirmed) {
          try {
            loading.show('Excluindo grupo...');
            await api.delete(`/api/groups/${id}`);
            await this.loadData();
            await this.render();
          } catch (error) {
            dialog.show('Erro ao excluir grupo: ' + error.message, 'alert');
          } finally {
            loading.hide();
          }
        }
      }
    );
  }

  async manageParticipants(id) {
    const group = this.groups.find(g => g.id === id);
    if (!group) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    const participants = group.participants || [];
    const availablePatients = this.patients.filter(p => !participants.includes(p.id));

    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] flex flex-col">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 class="text-xl font-bold">Participantes: ${group.name}</h2>
          <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700"><i class="fa-solid fa-times"></i></button>
        </div>
        
        <div class="p-6 flex-1 overflow-y-auto space-y-6">
          <!-- Add Participant -->
          <div>
            <label class="block text-sm font-bold mb-2">Adicionar Novo Participante</label>
            <div class="flex gap-2">
              <select id="add-participant-select" class="input-field flex-1">
                <option value="">Selecione um paciente...</option>
                ${availablePatients.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
              </select>
              <button onclick="window.groupsModule.addParticipant('${group.id}')" class="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-bold">
                Adicionar
              </button>
            </div>
          </div>

          <!-- Current Participants -->
          <div>
            <h4 class="text-sm font-bold mb-3 border-b pb-1 dark:border-gray-700">Participantes Atuais</h4>
            <div class="space-y-2">
              ${participants.length === 0 ? '<p class="text-sm text-gray-400 italic">Nenhum participante no grupo.</p>' : 
                participants.map(pId => {
                  const p = this.patients.find(x => x.id === pId);
                  return `
                    <div class="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span class="font-medium">${p?.name || 'Paciente Excluído'}</span>
                      <button onclick="window.groupsModule.removeParticipant('${group.id}', '${pId}')" class="text-red-500 hover:text-red-700 p-1">
                        <i class="fa-solid fa-user-minus"></i>
                      </button>
                    </div>
                  `;
                }).join('')
              }
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  async addParticipant(groupId) {
    const patientId = document.getElementById('add-participant-select').value;
    if (!patientId) return;

    try {
      loading.show('Adicionando participante...');
      const group = this.groups.find(g => g.id === groupId);
      const participants = [...(group.participants || []), patientId];
      
      await api.put(`/api/groups/${groupId}`, { participants });
      await this.loadData();
      
      // Refresh modal
      document.querySelector('.fixed').remove();
      this.manageParticipants(groupId);
      this.render();
    } catch (error) {
      dialog.show('Erro ao adicionar participante: ' + error.message, 'alert');
    } finally {
      loading.hide();
    }
  }

  async removeParticipant(groupId, patientId) {
    if (!confirm('Deseja realmente remover este participante do grupo?')) return;

    try {
      loading.show('Removendo participante...');
      const group = this.groups.find(g => g.id === groupId);
      const participants = (group.participants || []).filter(id => id !== patientId);
      
      await api.put(`/api/groups/${groupId}`, { participants });
      await this.loadData();
      
      // Refresh modal
      document.querySelector('.fixed').remove();
      this.manageParticipants(groupId);
      this.render();
    } catch (error) {
      dialog.show('Erro ao remover participante: ' + error.message, 'alert');
    } finally {
      loading.hide();
    }
  }

  destroy() {
    delete window.groupsModule;
  }
}
