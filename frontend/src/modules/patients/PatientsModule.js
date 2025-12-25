import { api } from '../../services/api.js';
import { loading } from '../../components/Loading.js';
import { dialog } from '../../components/Dialog.js';
import { formatCPF, formatPhone, formatDate, formatCurrency } from '../../utils/formatters.js';
import { validateCPF } from '../../utils/validators.js';
import { encryptionService } from '../../services/encryption.js';
import { authService } from '../../services/supabase.js';

export class PatientsModule {
  constructor() {
    this.container = null;
    this.patients = [];
    this.currentPatientId = null;
    this.view = 'list'; // 'list' or 'details'
    this.sessionTagSearch = '';
    this.patientRecordTab = 'evolutions';
    this.user = null;
  }

  async init(id = null) {
    this.container = document.getElementById('app-container') || document.getElementById('app');
    this.user = await authService.getUser();
    
    if (id) {
      this.currentPatientId = id;
      this.view = 'details';
    } else {
      this.currentPatientId = null;
      this.view = 'list';
    }

    await this.loadData();
    await this.render();
  }

  async loadData() {
    try {
      loading.show('Carregando dados...');
      const [patients, sessions, groups, serviceTypes] = await Promise.all([
        api.get('/api/patients'),
        api.get('/api/sessions'),
        api.get('/api/groups'),
        api.get('/api/settings').then(s => s.serviceTypes || [])
      ]);

      this.patients = patients;
      this.sessions = sessions;
      this.groups = groups;
      this.serviceTypes = serviceTypes;

      // Decrypt CPFs
      for (const p of this.patients) {
        if (p.encrypted_cpf) {
          try {
            p.cpf = encryptionService.decryptCPF(p.encrypted_cpf, null, this.user.id);
          } catch (e) {
            console.error('Error decrypting CPF for patient', p.id, e);
            p.cpf = 'Erro na descriptografia';
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      dialog.show('Erro ao carregar dados: ' + error.message, 'alert');
    } finally {
      loading.hide();
    }
  }

  async render() {
    if (this.view === 'details' && this.currentPatientId) {
      await this.renderDetails();
    } else {
      await this.renderList();
    }
    this.attachEvents();
  }

  async renderList() {
    this.container.innerHTML = `
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold flex items-center gap-2">
            <i class="fa-solid fa-users text-[var(--color-primary)]"></i> Pacientes
          </h1>
          <button 
            id="add-patient-btn"
            class="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 flex items-center gap-2"
          >
            <i class="fa-solid fa-plus"></i>Novo Paciente
          </button>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nome</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">CPF</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Telefone</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                ${this.renderPatientsListRows()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  renderPatientsListRows() {
    if (this.patients.length === 0) {
      return `
        <tr>
          <td colspan="5" class="px-6 py-8 text-center text-gray-500">
            Nenhum paciente cadastrado
          </td>
        </tr>
      `;
    }

    return this.patients.map(patient => {
      const statusColor = patient.status === 'Inativo' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
      return `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onclick="window.location.hash = '#/patients/${patient.id}'">
          <td class="px-6 py-4 whitespace-nowrap font-medium">${patient.name || '-'}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 py-1 rounded-full text-xs font-bold ${statusColor}">${patient.status || 'Ativo'}</span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">${patient.cpf ? formatCPF(patient.cpf) : '-'}</td>
          <td class="px-6 py-4 whitespace-nowrap">${patient.phone ? formatPhone(patient.phone) : '-'}</td>
          <td class="px-6 py-4 whitespace-nowrap" onclick="event.stopPropagation()">
            <button 
              onclick="window.patientsModule.editPatient('${patient.id}')"
              class="text-blue-500 hover:text-blue-700 mr-3"
              title="Editar"
            >
              <i class="fa-solid fa-edit"></i>
            </button>
            <button 
              onclick="window.patientsModule.deletePatient('${patient.id}')"
              class="text-red-500 hover:text-red-700"
              title="Excluir"
            >
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  async renderDetails() {
    const p = this.patients.find(x => x.id === this.currentPatientId);
    if (!p) {
      this.view = 'list';
      return this.render();
    }

    const allSessions = this.sessions.filter(s => s.patient_id === p.id);
    const futureSessions = allSessions.filter(s => s.status === 'Agendada').sort((a,b) => new Date(a.date) - new Date(b.date));
    let historySessions = allSessions.filter(s => s.status !== 'Agendada').sort((a,b) => new Date(b.date) - new Date(a.date));

    if (this.sessionTagSearch.trim() !== '') {
      // In Supabase version, tags might be part of metadata or separate table. 
      // For now, let's assume they are in notes if not implemented.
      historySessions = historySessions.filter(s => (s.notes || '').toLowerCase().includes(this.sessionTagSearch.toLowerCase()));
    }

    const pStatusColor = p.status === 'Inativo' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200';

    this.container.innerHTML = `
      <div class="p-6">
        <div class="mb-6">
          <a href="#/patients" class="text-[var(--color-primary)] hover:underline flex items-center gap-2 mb-4">
            <i class="fa-solid fa-arrow-left"></i> Voltar para Lista
          </a>
        </div>

        <div class="flex flex-col md:flex-row gap-6 items-start">
          <!-- Sidebar: Patient Info -->
          <div class="md:w-1/3 space-y-4 w-full">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center relative">
              <button onclick="window.patientsModule.editPatient('${p.id}')" class="absolute top-4 right-4 text-blue-500 hover:text-blue-700" title="Editar Paciente">
                <i class="fa-solid fa-pen"></i>
              </button>
              <div class="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-[var(--color-primary)]">
                ${p.name.charAt(0)}
              </div>
              <h2 class="text-xl font-bold">${p.name}</h2>
              <div class="mt-2 mb-4">
                <span class="px-3 py-1 rounded-full text-xs font-bold border ${pStatusColor}">${p.status || 'Ativo'}</span>
              </div>
              <div class="mt-6 text-left space-y-3">
                <p><strong>CPF:</strong> ${p.cpf ? formatCPF(p.cpf) : '-'}</p>
                <p class="flex items-center gap-2">
                  <strong>WhatsApp:</strong> 
                  <span>${p.phone ? formatPhone(p.phone) : '-'}</span>
                </p>
                <p><strong>Email:</strong> ${p.email || '-'}</p>
                <p><strong>Nascimento:</strong> ${p.birth_date ? formatDate(p.birth_date) : '-'}</p>
              </div>
              
              <div class="mt-6 flex justify-center">
                <button 
                  onclick="window.patientsModule.togglePatientStatus('${p.id}')" 
                  class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-[var(--color-primary)] hover:text-white transition-colors flex items-center gap-2 font-bold"
                >
                  <i class="fa-solid ${p.status === 'Inativo' ? 'fa-unlock' : 'fa-lock'}"></i>
                  ${p.status === 'Inativo' ? 'Reabrir' : 'Encerrar'}
                </button>
              </div>
            </div>

            <!-- Future Sessions -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h4 class="font-bold text-md mb-3 flex items-center gap-2 border-b pb-2 dark:border-gray-700">
                <i class="fa-solid fa-clock text-[var(--color-primary)]"></i> Próximas Sessões
              </h4>
              ${futureSessions.length === 0 ? '<p class="text-xs text-gray-400 italic">Nenhum agendamento futuro.</p>' : ''}
              <div class="space-y-3 max-h-60 overflow-y-auto">
                ${futureSessions.map(s => `
                  <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border-l-4 border-blue-500">
                    <div class="flex justify-between items-start mb-1">
                      <span class="font-bold text-sm">${formatDate(s.date)} às ${s.time || ''}</span>
                      <span class="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">${s.status}</span>
                    </div>
                    <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">${s.notes || 'Sem observações'}</p>
                    <div class="flex justify-between items-center mt-2 border-t border-gray-200 dark:border-gray-600 pt-1 text-xs">
                      <span class="font-bold text-[var(--color-primary)]">${formatCurrency(s.value)}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Main Content: Record (Evolutions/Documents) -->
          <div class="md:w-2/3 flex flex-col gap-4 w-full">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col">
              <div class="border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 py-2">
                <div class="flex gap-4">
                  <button 
                    onclick="window.patientsModule.setRecordTab('evolutions')" 
                    class="px-4 py-2 font-bold border-b-2 transition-colors ${this.patientRecordTab === 'evolutions' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500'}"
                  >
                    Evoluções
                  </button>
                  <button 
                    onclick="window.patientsModule.setRecordTab('documents')" 
                    class="px-4 py-2 font-bold border-b-2 transition-colors ${this.patientRecordTab === 'documents' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500'}"
                  >
                    Documentos
                  </button>
                </div>
                <div class="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-gray-200">
                  <i class="fa-solid fa-file-medical text-[var(--color-primary)]"></i>
                  <span>Prontuário</span>
                </div>
              </div>

              <div class="p-6">
                ${this.patientRecordTab === 'evolutions' ? this.renderEvolutions(p, historySessions) : this.renderDocuments(p)}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderEvolutions(p, historySessions) {
    const evolutions = p.evolution || [];
    const allItems = [
      ...historySessions.map(s => ({ type: 'session', date: s.date, time: s.time || '00:00', data: s })),
      ...evolutions.map(ev => ({ type: 'evolution', date: ev.date, time: '00:00', data: ev }))
    ].sort((a, b) => {
      const dateCompare = new Date(b.date) - new Date(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.time.localeCompare(a.time);
    });

    return `
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold">Histórico de Sessões e Evoluções</h3>
        <div class="flex gap-2">
          <div class="relative">
            <input 
              type="text" 
              placeholder="Filtrar..." 
              value="${this.sessionTagSearch}"
              class="pl-8 pr-4 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
              oninput="window.patientsModule.sessionTagSearch = this.value; window.patientsModule.render()"
            >
            <i class="fa-solid fa-search absolute left-2.5 top-2 text-gray-400"></i>
          </div>
          <button class="bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
            <i class="fa-solid fa-plus"></i> Nova Evolução
          </button>
        </div>
      </div>

      <div class="space-y-4">
        ${allItems.length === 0 ? '<p class="text-gray-500 italic text-center py-8">Nenhum registro encontrado.</p>' : ''}
        ${allItems.map(item => {
          if (item.type === 'session') {
            const s = item.data;
            const isPaid = s.status === 'Falta Justificada' ? true : s.paid;
            const badgeColor = s.status === 'Realizada' ? 'bg-green-100 text-green-800' : (s.status === 'Falta Justificada' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800');
            
            return `
              <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm border-l-4 ${s.status === 'Realizada' ? 'border-green-500' : (s.status === 'Falta Justificada' ? 'border-amber-500' : 'border-red-500')}">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <span class="font-bold">${formatDate(s.date)} às ${s.time || ''}</span>
                    ${s.is_group ? `<span class="ml-2 text-[10px] uppercase font-bold text-[var(--color-primary)]">Grupo</span>` : ''}
                  </div>
                  <span class="text-xs px-2 py-0.5 rounded-full font-bold ${badgeColor}">${s.status}</span>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">${s.notes || ''}</p>
                <div class="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700 text-xs">
                  <span class="font-bold text-[var(--color-primary)]">${formatCurrency(s.value)}</span>
                  <span class="${isPaid ? 'text-green-600' : 'text-red-600'} font-bold uppercase">${isPaid ? 'PAGO' : 'PAGAMENTO PENDENTE'}</span>
                </div>
              </div>
            `;
          } else {
            const ev = item.data;
            return `
              <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 shadow-sm border-l-4 border-[var(--color-primary)]">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <h4 class="font-bold text-blue-800 dark:text-blue-300">${ev.type || 'Evolução'}</h4>
                    <p class="text-[10px] text-gray-500">${formatDate(ev.date)}</p>
                  </div>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">${ev.content || ''}</p>
              </div>
            `;
          }
        }).join('')}
      </div>
    `;
  }

  renderDocuments(p) {
    return `<p class="text-gray-500 italic text-center py-8">Funcionalidade de documentos em breve.</p>`;
  }

  setRecordTab(tab) {
    this.patientRecordTab = tab;
    this.render();
  }

  attachEvents() {
    const addBtn = document.getElementById('add-patient-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showPatientForm());
    }

    // Make methods available globally
    window.patientsModule = this;
  }

  showPatientForm(patient = null) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 class="text-xl font-bold">${patient ? 'Editar' : 'Novo'} Paciente</h2>
          <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700"><i class="fa-solid fa-times"></i></button>
        </div>
        <form id="patient-form" class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-bold mb-1">Nome Completo *</label>
              <input type="text" id="patient-name" required value="${patient?.name || ''}" class="input-field">
            </div>
            
            <div>
              <label class="block text-sm font-bold mb-1">CPF *</label>
              <input type="text" id="patient-cpf" required value="${patient?.cpf || ''}" class="input-field" placeholder="000.000.000-00">
            </div>
            
            <div>
              <label class="block text-sm font-bold mb-1">WhatsApp / Telefone</label>
              <input type="text" id="patient-phone" value="${patient?.phone || ''}" class="input-field" placeholder="(00) 00000-0000">
            </div>
            
            <div>
              <label class="block text-sm font-bold mb-1">E-mail</label>
              <input type="email" id="patient-email" value="${patient?.email || ''}" class="input-field" placeholder="exemplo@email.com">
            </div>
            
            <div>
              <label class="block text-sm font-bold mb-1">Data de Nascimento</label>
              <input type="date" id="patient-birth-date" value="${patient?.birth_date || ''}" class="input-field">
            </div>

            <div>
              <label class="block text-sm font-bold mb-1">Tipo de Atendimento Padrão</label>
              <select id="patient-service-type" class="input-field">
                <option value="">Selecione...</option>
                ${this.serviceTypes.map(st => `<option value="${st.id}" ${patient?.service_type_id === st.id ? 'selected' : ''}>${st.name}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="block text-sm font-bold mb-1">Valor da Sessão (R$)</label>
              <input type="number" id="patient-default-value" step="0.01" value="${patient?.default_value || 0}" class="input-field">
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold mb-1">Endereço</label>
            <input type="text" id="patient-address" value="${patient?.address || ''}" class="input-field">
          </div>
          
          <div>
            <label class="block text-sm font-bold mb-1">Observações / Histórico Prévio</label>
            <textarea id="patient-notes" rows="4" class="input-field">${patient?.notes || ''}</textarea>
          </div>
          
          <div class="flex gap-3 justify-end mt-6">
            <button type="button" onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300">Cancelar</button>
            <button type="submit" class="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 font-bold">Salvar Paciente</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    const form = document.getElementById('patient-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.savePatient(patient?.id);
      modal.remove();
    });
  }

  async savePatient(id) {
    const rawCpf = document.getElementById('patient-cpf').value.replace(/\D/g, '');
    
    if (rawCpf && !validateCPF(rawCpf)) {
      dialog.show('CPF inválido', 'alert');
      return;
    }

    try {
      loading.show('Salvando paciente...');
      
      const encryptedCpf = rawCpf ? encryptionService.encryptCPF(rawCpf, null, this.user.id) : null;

      const data = {
        name: document.getElementById('patient-name').value,
        cpf: rawCpf, // Keep plain for search/filters if needed, or remove if strictly encrypted
        encrypted_cpf: encryptedCpf,
        phone: document.getElementById('patient-phone').value.replace(/\D/g, ''),
        email: document.getElementById('patient-email').value,
        birth_date: document.getElementById('patient-birth-date').value || null,
        address: document.getElementById('patient-address').value,
        notes: document.getElementById('patient-notes').value,
        service_type_id: document.getElementById('patient-service-type').value || null,
        default_value: parseFloat(document.getElementById('patient-default-value').value) || 0,
        status: id ? this.patients.find(p => p.id === id).status : 'Ativo'
      };

      if (id) {
        await api.put(`/api/patients/${id}`, data);
      } else {
        await api.post('/api/patients', data);
      }

      await this.loadData();
      await this.render();
      dialog.show('Paciente salvo com sucesso!', 'alert');
    } catch (error) {
      console.error('Error saving patient:', error);
      dialog.show('Erro ao salvar paciente: ' + error.message, 'alert');
    } finally {
      loading.hide();
    }
  }

  async togglePatientStatus(id) {
    const p = this.patients.find(x => x.id === id);
    if (!p) return;

    const newStatus = p.status === 'Inativo' ? 'Ativo' : 'Inativo';
    const actionLabel = newStatus === 'Ativo' ? 'reativar' : 'inativar';

    dialog.show(
      `Deseja realmente ${actionLabel} o paciente "${p.name}"?`,
      'confirm',
      async (confirmed) => {
        if (confirmed) {
          try {
            loading.show('Atualizando status...');
            await api.put(`/api/patients/${id}`, { status: newStatus });
            await this.loadData();
            await this.render();
          } catch (error) {
            console.error('Error updating status:', error);
            dialog.show('Erro ao atualizar status: ' + error.message, 'alert');
          } finally {
            loading.hide();
          }
        }
      }
    );
  }

  async editPatient(id) {
    const patient = this.patients.find(p => p.id === id);
    if (patient) {
      this.showPatientForm(patient);
    }
  }

  async deletePatient(id) {
    const patient = this.patients.find(p => p.id === id);
    if (!patient) return;

    dialog.show(
      `Deseja realmente excluir o paciente "${patient.name}"?`,
      'confirm',
      async (confirmed) => {
        if (confirmed) {
          try {
            loading.show('Excluindo paciente...');
            await api.delete(`/api/patients/${id}`);
            await this.loadData();
            await this.render();
            dialog.show('Paciente excluído com sucesso!', 'alert');
          } catch (error) {
            console.error('Error deleting patient:', error);
            dialog.show('Erro ao excluir paciente: ' + error.message, 'alert');
          } finally {
            loading.hide();
          }
        }
      }
    );
  }

  destroy() {
    delete window.patientsModule;
  }
}
