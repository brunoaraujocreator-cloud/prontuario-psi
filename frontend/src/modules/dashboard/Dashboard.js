import { api } from '../../services/api.js';
import { formatCurrency } from '../../utils/formatters.js';
import { loading } from '../../components/Loading.js';

export class DashboardModule {
  constructor() {
    this.container = null;
    this.data = {
      patients: [],
      sessions: [],
      groups: [],
      expenses: [],
      serviceTypes: [],
      categories: []
    };
    this.dashboardActiveTab = 'charts';
    this.balancesActiveTab = 'patients';
    this.dashboardChartsYear = new Date().getFullYear();
    this.balancesPatientsYear = new Date().getFullYear();
    this.balancesExpensesYear = new Date().getFullYear();
  }

  async init() {
    this.container = document.getElementById('app-container') || document.getElementById('app');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'app-container';
      document.body.appendChild(this.container);
    }
    
    await this.loadData();
    await this.render();
  }

  async loadData() {
    try {
      loading.show('Carregando dados do dashboard...');
      
      // Load all data in parallel
      const [patients, sessions, groups, expenses, settings] = await Promise.all([
        api.get('/api/patients').catch(() => []),
        api.get('/api/sessions').catch(() => []),
        api.get('/api/groups').catch(() => []),
        api.get('/api/expenses').catch(() => []),
        api.get('/api/settings').catch(() => {})
      ]);

      // Load service types and categories from settings
      let serviceTypes = [];
      let categories = [];
      
      if (settings && settings.serviceTypes) {
        serviceTypes = settings.serviceTypes;
      } else {
        // Default service types if not in settings
        serviceTypes = [
          { id: 'st_1', name: 'Psicoterapia Individual', duration: 50 },
          { id: 'st_2', name: 'Psicoterapia em Grupo', duration: 90 },
          { id: 'st_3', name: 'Supervisão', duration: 60 },
          { id: 'st_4', name: 'Consultoria', duration: 60 }
        ];
      }

      if (settings && settings.categories) {
        categories = settings.categories;
      } else {
        // Default categories
        categories = ['Aluguel', 'Internet', 'Material', 'Impostos', 'Outros'];
      }

      this.data = { 
        patients, 
        sessions, 
        groups: groups || [], 
        expenses, 
        serviceTypes,
        categories
      };
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      loading.hide();
    }
  }

  async render() {
    const wasChartsTab = this.dashboardActiveTab === 'charts';
    
    this.container.innerHTML = `
      <div class="flex justify-between items-center mb-6 fade-in">
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <i class="fa-solid fa-chart-pie text-[var(--color-primary)]"></i> Dashboard
        </h2>
      </div>

      <!-- Abas -->
      <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex gap-4">
          <button id="dashboard-tab-charts" class="px-4 py-2 font-bold border-b-2 transition-colors ${this.dashboardActiveTab === 'charts' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}">
            Gráficos
          </button>
          <button id="dashboard-tab-balances" class="px-4 py-2 font-bold border-b-2 transition-colors ${this.dashboardActiveTab === 'balances' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}">
            Balanços
          </button>
        </div>
      </div>

      <!-- Conteúdo da Aba Gráficos -->
      <div id="dashboard-charts-content" class="${this.dashboardActiveTab === 'charts' ? '' : 'hidden'}">
        ${this.renderDashboardCharts()}
      </div>

      <!-- Conteúdo da Aba Balanços -->
      <div id="dashboard-balances-content" class="${this.dashboardActiveTab === 'balances' ? '' : 'hidden'}">
        <!-- Sub-abas dentro de Balanços -->
        <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex gap-4">
            <button id="balances-tab-patients" class="px-4 py-2 font-bold border-b-2 transition-colors ${this.balancesActiveTab === 'patients' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}">
              Pacientes
            </button>
            <button id="balances-tab-expenses" class="px-4 py-2 font-bold border-b-2 transition-colors ${this.balancesActiveTab === 'expenses' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}">
              Despesas
            </button>
          </div>
        </div>

        <!-- Conteúdo da Sub-aba Pacientes -->
        <div id="balances-patients-content" class="${this.balancesActiveTab === 'patients' ? '' : 'hidden'}">
          ${this.renderBalancesPatients()}
        </div>

        <!-- Conteúdo da Sub-aba Despesas -->
        <div id="balances-expenses-content" class="${this.balancesActiveTab === 'expenses' ? '' : 'hidden'}">
          ${this.renderBalancesExpenses()}
        </div>
      </div>
    `;

    this.attachEvents();
    
    // Renderizar gráficos após mudar de aba
    if (this.dashboardActiveTab === 'charts') {
      setTimeout(() => {
        this.renderDashboardChartsGraphs();
      }, 200);
    }
  }

  attachEvents() {
    // Dashboard tabs
    const chartsTab = document.getElementById('dashboard-tab-charts');
    const balancesTab = document.getElementById('dashboard-tab-balances');
    
    if (chartsTab) {
      chartsTab.onclick = () => {
        this.dashboardActiveTab = 'charts';
        this.render();
      };
    }
    
    if (balancesTab) {
      balancesTab.onclick = () => {
        this.dashboardActiveTab = 'balances';
        this.render();
      };
    }

    // Balances tabs
    const patientsTab = document.getElementById('balances-tab-patients');
    const expensesTab = document.getElementById('balances-tab-expenses');
    
    if (patientsTab) {
      patientsTab.onclick = () => {
        this.balancesActiveTab = 'patients';
        this.render();
      };
    }
    
    if (expensesTab) {
      expensesTab.onclick = () => {
        this.balancesActiveTab = 'expenses';
        this.render();
      };
    }

    // Year selectors
    const chartsYearSelect = document.getElementById('dashboard-charts-year');
    if (chartsYearSelect) {
      chartsYearSelect.onchange = (e) => {
        this.dashboardChartsYear = parseInt(e.target.value);
        this.render();
      };
    }

    const patientsYearSelect = document.getElementById('balances-patients-year');
    if (patientsYearSelect) {
      patientsYearSelect.onchange = (e) => {
        this.balancesPatientsYear = parseInt(e.target.value);
        this.render();
      };
    }

    const expensesYearSelect = document.getElementById('balances-expenses-year');
    if (expensesYearSelect) {
      expensesYearSelect.onchange = (e) => {
        this.balancesExpensesYear = parseInt(e.target.value);
        this.render();
      };
    }
  }

  renderDashboardCharts() {
    const currentYear = new Date().getFullYear();
    const selectedYear = this.dashboardChartsYear || currentYear;
    
    // Gerar opções de ano (de 2023 até o ano atual)
    const yearOptions = [];
    for(let year = 2023; year <= currentYear; year++) {
      yearOptions.push(`<option value="${year}" ${selectedYear === year ? 'selected' : ''}>${year}</option>`);
    }

    // Calcular dados do ano selecionado
    const yearStart = `${selectedYear}-01-01`;
    const yearEnd = `${selectedYear}-12-31`;

    // === CÁLCULOS PARA CARDS ===
    // Total Recebido no Ano
    const totalReceived = this.data.sessions
      .filter(s => {
        if(!s.paid) return false;
        const paymentDate = s.payment_date || s.date;
        return paymentDate >= yearStart && paymentDate <= yearEnd && s.status !== 'Falta Justificada';
      })
      .reduce((sum, s) => sum + Number(s.value || 0), 0);

    // Total a Receber
    const totalReceivable = this.data.sessions
      .filter(s => {
        if(s.paid) return false;
        const sessionDate = s.date;
        return sessionDate >= yearStart && sessionDate <= yearEnd && 
               (s.status === 'Realizada' || s.status === 'Falta Injustificada');
      })
      .reduce((sum, s) => sum + Number(s.value || 0), 0);

    // Total de Despesas no Ano
    const totalExpenses = this.data.expenses
      .filter(e => {
        if(e.status !== 'Pago') return false;
        const paymentDate = e.payment_date || e.date;
        return paymentDate >= yearStart && paymentDate <= yearEnd;
      })
      .reduce((sum, e) => sum + Number(e.value || 0), 0);

    // Lucro Líquido
    const lucroLiquido = totalReceived - totalExpenses;

    // Calcular horas trabalhadas no ano
    const countedGroupSessions = new Set();
    let totalHours = 0;
    
    this.data.sessions
      .filter(s => {
        const sessionDate = s.date;
        return sessionDate >= yearStart && sessionDate <= yearEnd && 
               (s.status === 'Realizada' || s.status === 'Falta Justificada');
      })
      .forEach(s => {
        if(s.is_group && s.group_id) {
          // Para grupos, contar apenas uma vez por grupo/data/horário
          const groupKey = `${s.group_id}_${s.date}_${s.time || ''}_${s.end_time || ''}`;
          if(!countedGroupSessions.has(groupKey)) {
            countedGroupSessions.add(groupKey);
            // Buscar tipo de atendimento do grupo
            const group = (this.data.groups || []).find(g => g.id === s.group_id);
            if(group && group.service_type_id) {
              const serviceType = this.data.serviceTypes.find(st => st.id === group.service_type_id);
              if(serviceType && serviceType.duration) {
                totalHours += serviceType.duration / 60; // Converter minutos para horas
              }
            }
          }
        } else {
          // Para sessões individuais, buscar tipo de atendimento do paciente
          const patient = this.data.patients.find(p => p.id === s.patient_id);
          if(patient && patient.service_type_id) {
            const serviceType = this.data.serviceTypes.find(st => st.id === patient.service_type_id);
            if(serviceType && serviceType.duration) {
              totalHours += serviceType.duration / 60; // Converter minutos para horas
            }
          }
        }
      });

    // Valor da Hora Trabalhada
    const valorHoraTrabalhada = totalHours > 0 ? totalReceived / totalHours : 0;

    // Obter cor primária do sistema
    function hexToRgba(hex, alpha) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#3b82f6';
    const primaryColorSoft = hexToRgba(primaryColor, 0.55);
    
    // Função para gerar variações da cor primária (hex)
    function adjustColor(color, amount) {
      const usePound = color[0] === '#';
      const col = usePound ? color.slice(1) : color;
      const num = parseInt(col, 16);
      if(isNaN(num)) return color;
      let r = (num >> 16) + amount;
      let g = ((num >> 8) & 0x00FF) + amount;
      let b = (num & 0x0000FF) + amount;
      r = r > 255 ? 255 : r < 0 ? 0 : r;
      g = g > 255 ? 255 : g < 0 ? 0 : g;
      b = b > 255 ? 255 : b < 0 ? 0 : b;
      const result = (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
      return (usePound ? '#' : '') + result;
    }

    const lightColor = adjustColor(primaryColor, 40);

    return `
      <div class="mb-4">
        <label class="text-sm font-bold block mb-2">Ano</label>
        <select id="dashboard-charts-year" class="input-field" style="max-width: 200px;">
          ${yearOptions.join('')}
        </select>
      </div>

      <!-- Cards Superiores -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 fade-in">
        <div class="card border-l-4 border-green-500 relative">
          <div class="absolute top-2 right-2">
            <div class="relative group">
              <button class="cursor-help" title="Informações" style="color: ${primaryColorSoft};">
                <i class="fa-solid fa-circle-info text-sm"></i>
              </button>
              <div class="absolute right-0 top-6 w-64 p-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                Soma de todas as sessões pagas no ano selecionado, excluindo faltas justificadas. Considera a data de pagamento ou a data da sessão se não houver data de pagamento.
              </div>
            </div>
          </div>
          <p class="text-base font-bold text-gray-700 dark:text-gray-300">Total Recebido</p>
          <h3 class="text-2xl font-bold text-green-600 dark:text-green-400">${formatCurrency(totalReceived)}</h3>
        </div>
        <div class="card border-l-4 border-yellow-500 relative">
          <div class="absolute top-2 right-2">
            <div class="relative group">
              <button class="cursor-help" title="Informações" style="color: ${primaryColorSoft};">
                <i class="fa-solid fa-circle-info text-sm"></i>
              </button>
              <div class="absolute right-0 top-6 w-64 p-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                Soma de todas as sessões realizadas ou faltas injustificadas não pagas no ano selecionado. Considera apenas sessões com data dentro do ano.
              </div>
            </div>
          </div>
          <p class="text-base font-bold text-gray-700 dark:text-gray-300">A Receber</p>
          <h3 class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">${formatCurrency(totalReceivable)}</h3>
        </div>
        <div class="card border-l-4 border-red-500 relative">
          <div class="absolute top-2 right-2">
            <div class="relative group">
              <button class="cursor-help" title="Informações" style="color: ${primaryColorSoft};">
                <i class="fa-solid fa-circle-info text-sm"></i>
              </button>
              <div class="absolute right-0 top-6 w-64 p-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                Soma de todas as despesas com status "Pago" no ano selecionado. Considera a data de pagamento ou a data da despesa se não houver data de pagamento.
              </div>
            </div>
          </div>
          <p class="text-base font-bold text-gray-700 dark:text-gray-300">Despesas Pagas</p>
          <h3 class="text-2xl font-bold text-red-600 dark:text-red-400">${formatCurrency(totalExpenses)}</h3>
        </div>
        <div class="card border-l-4 border-[var(--color-primary)] relative">
          <div class="absolute top-2 right-2">
            <div class="relative group">
              <button class="cursor-help" title="Informações" style="color: ${primaryColorSoft};">
                <i class="fa-solid fa-circle-info text-sm"></i>
              </button>
              <div class="absolute right-0 top-6 w-64 p-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                Lucro líquido calculado como: Total Recebido - Despesas Pagas. Representa o lucro efetivo no caixa no ano selecionado.
              </div>
            </div>
          </div>
          <p class="text-base font-bold text-gray-700 dark:text-gray-300">Lucro (Caixa)</p>
          <h3 class="text-2xl font-bold ${lucroLiquido >= 0 ? 'text-[var(--color-primary)]' : 'text-red-600 dark:text-red-400'}">${formatCurrency(lucroLiquido)}</h3>
        </div>
        <div class="card border-l-4 relative" style="border-left-color: ${lightColor};">
          <div class="absolute top-2 right-2">
            <div class="relative group">
              <button class="cursor-help" title="Informações" style="color: ${primaryColorSoft};">
                <i class="fa-solid fa-circle-info text-sm"></i>
              </button>
              <div class="absolute right-0 top-6 w-64 p-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                Valor médio da hora trabalhada no ano: Total Recebido ÷ Total de Horas Trabalhadas. Considera apenas sessões realizadas ou faltas justificadas.
              </div>
            </div>
          </div>
          <p class="text-base font-bold text-gray-700 dark:text-gray-300">Valor da Hora Trabalhada</p>
          <h3 class="text-2xl font-bold" style="color: ${primaryColor};">${formatCurrency(valorHoraTrabalhada)}</h3>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Gráfico 1: Evolução Mensal Receitas vs Despesas -->
        <div class="card relative" style="min-height: 400px;">
          <h3 class="font-bold mb-4 text-lg">Evolução Mensal (Receitas vs Despesas)</h3>
          <div style="height: 320px; position: relative;">
            <canvas id="chart-evolution"></canvas>
          </div>
        </div>

        <!-- Gráfico 2: Horas Trabalhadas vs Valor da Hora -->
        <div class="card relative" style="min-height: 400px;">
          <h3 class="font-bold mb-4 text-lg">Horas Trabalhadas vs Valor da Hora</h3>
          <div style="height: 320px; position: relative;">
            <canvas id="chart-hours"></canvas>
          </div>
        </div>

        <!-- Gráfico 3: Individual vs Grupo -->
        <div class="card relative" style="min-height: 400px;">
          <h3 class="font-bold mb-4 text-lg">Individual vs Grupo</h3>
          <div style="height: 280px; position: relative;">
            <canvas id="chart-individual-group"></canvas>
          </div>
        </div>

        <!-- Gráfico 4: Análise de Faltas -->
        <div class="card relative" style="min-height: 400px;">
          <h3 class="font-bold mb-4 text-lg">Análise de Faltas</h3>
          <div style="height: 280px; position: relative;">
            <canvas id="chart-faltas"></canvas>
          </div>
        </div>

        <!-- Gráfico 5: Presencial vs Online -->
        <div class="card relative" style="min-height: 400px;">
          <h3 class="font-bold mb-4 text-lg">Presencial vs Online</h3>
          <div style="height: 280px; position: relative;">
            <canvas id="chart-modality"></canvas>
          </div>
        </div>

        <!-- Gráfico 6: Distribuição de Gênero -->
        <div class="card relative" style="min-height: 400px;">
          <h3 class="font-bold mb-4 text-lg">Distribuição de Gênero dos Pacientes</h3>
          <div style="height: 280px; position: relative;">
            <canvas id="chart-gender"></canvas>
          </div>
        </div>

        <!-- Gráfico 7: Despesas por Categoria -->
        <div class="card relative" style="min-height: 400px;">
          <h3 class="font-bold mb-4 text-lg">Despesas por Categoria</h3>
          <div style="height: 280px; position: relative;">
            <canvas id="chart-expenses-category"></canvas>
          </div>
        </div>

        <!-- Gráfico 8: Comparação de Crescimento -->
        <div class="card relative" style="min-height: 400px;">
          <h3 class="font-bold mb-4 text-lg">Comparação de Crescimento (Lucro)</h3>
          <div style="height: 320px; position: relative;">
            <canvas id="chart-growth"></canvas>
          </div>
        </div>
      </div>
    `;
  }

  renderDashboardChartsGraphs() {
    // Esta função será chamada após o HTML ser inserido
    if (!window.Chart) {
      console.error('Chart.js não está carregado');
      return;
    }

    const currentYear = new Date().getFullYear();
    const selectedYear = this.dashboardChartsYear || currentYear;
    
    // Calcular dados do ano selecionado
    const yearStart = `${selectedYear}-01-01`;
    const yearEnd = `${selectedYear}-12-31`;
    const prevYearStart = `${selectedYear - 1}-01-01`;
    const prevYearEnd = `${selectedYear - 1}-12-31`;

    // Meses do ano
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // Gráfico 1: Evolução Mensal Receitas vs Despesas
    const monthlyRevenue = [];
    const monthlyExpenses = [];
    
    for(let i = 1; i <= 12; i++) {
      const monthStart = `${selectedYear}-${String(i).padStart(2, '0')}-01`;
      const lastDay = new Date(selectedYear, i, 0).getDate();
      const monthEnd = `${selectedYear}-${String(i).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      
      const monthRevenue = this.data.sessions
        .filter(s => {
          if(!s.paid) return false;
          const paymentDate = s.payment_date || s.date;
          return paymentDate >= monthStart && paymentDate <= monthEnd && s.status !== 'Falta Justificada';
        })
        .reduce((sum, s) => sum + Number(s.value || 0), 0);
      
      const monthExpense = this.data.expenses
        .filter(e => {
          if(e.status !== 'Pago') return false;
          const paymentDate = e.payment_date || e.date;
          return paymentDate >= monthStart && paymentDate <= monthEnd;
        })
        .reduce((sum, e) => sum + Number(e.value || 0), 0);
      
      monthlyRevenue.push(monthRevenue);
      monthlyExpenses.push(monthExpense);
    }

    // Gráfico 2: Horas Trabalhadas vs Valor da Hora
    const monthlyHours = [];
    const monthlyValuePerHour = [];
    for(let i = 1; i <= 12; i++) {
      const monthStart = `${selectedYear}-${String(i).padStart(2, '0')}-01`;
      const lastDay = new Date(selectedYear, i, 0).getDate();
      const monthEnd = `${selectedYear}-${String(i).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      
      const monthGroupSessions = new Set();
      let monthHours = 0;
      
      // Calcular horas trabalhadas
      this.data.sessions
        .filter(s => {
          const sessionDate = s.date;
          return sessionDate >= monthStart && sessionDate <= monthEnd && 
                 (s.status === 'Realizada' || s.status === 'Falta Justificada');
        })
        .forEach(s => {
          if(s.is_group && s.group_id) {
            const groupKey = `${s.group_id}_${s.date}_${s.time || ''}_${s.end_time || ''}`;
            if(!monthGroupSessions.has(groupKey)) {
              monthGroupSessions.add(groupKey);
              const group = (this.data.groups || []).find(g => g.id === s.group_id);
              if(group && group.service_type_id) {
                const serviceType = this.data.serviceTypes.find(st => st.id === group.service_type_id);
                if(serviceType && serviceType.duration) {
                  monthHours += serviceType.duration / 60;
                }
              }
            }
          } else {
            const patient = this.data.patients.find(p => p.id === s.patient_id);
            if(patient && patient.service_type_id) {
              const serviceType = this.data.serviceTypes.find(st => st.id === patient.service_type_id);
              if(serviceType && serviceType.duration) {
                monthHours += serviceType.duration / 60;
              }
            }
          }
        });
      
      // Calcular receitas pagas do mês
      const monthRevenue = this.data.sessions
        .filter(s => {
          if(!s.paid) return false;
          const paymentDate = s.payment_date || s.date;
          return paymentDate >= monthStart && paymentDate <= monthEnd && s.status !== 'Falta Justificada';
        })
        .reduce((sum, s) => sum + Number(s.value || 0), 0);
      
      // Calcular valor da hora (receitas / horas trabalhadas)
      const valuePerHour = monthHours > 0 ? monthRevenue / monthHours : 0;
      
      monthlyHours.push(Number(monthHours.toFixed(2)));
      monthlyValuePerHour.push(Number(valuePerHour.toFixed(2)));
    }
    const avgHours = monthlyHours.reduce((sum, h) => sum + h, 0) / 12;
    const avgValuePerHour = monthlyValuePerHour.reduce((sum, v) => sum + v, 0) / 12;

    // Gráfico 3: Individual vs Grupo
    const individualSessions = this.data.sessions.filter(s => {
      const sessionDate = s.date;
      return sessionDate >= yearStart && sessionDate <= yearEnd && 
             (s.status === 'Realizada' || s.status === 'Falta Justificada') && 
             !s.is_group;
    }).length;
    
    const groupSessionsCounted = new Set();
    this.data.sessions
      .filter(s => {
        const sessionDate = s.date;
        return sessionDate >= yearStart && sessionDate <= yearEnd && 
               (s.status === 'Realizada' || s.status === 'Falta Justificada') && 
               s.is_group && s.group_id;
      })
      .forEach(s => {
        const groupKey = `${s.group_id}_${s.date}_${s.time || ''}_${s.end_time || ''}`;
        groupSessionsCounted.add(groupKey);
      });
    const groupSessions = groupSessionsCounted.size;

    // Gráfico 4: Análise de Faltas
    const statusCounts = {
      'Realizada': this.data.sessions.filter(s => {
        const sessionDate = s.date;
        return sessionDate >= yearStart && sessionDate <= yearEnd && s.status === 'Realizada';
      }).length,
      'Falta Justificada': this.data.sessions.filter(s => {
        const sessionDate = s.date;
        return sessionDate >= yearStart && sessionDate <= yearEnd && s.status === 'Falta Justificada';
      }).length,
      'Falta Injustificada': this.data.sessions.filter(s => {
        const sessionDate = s.date;
        return sessionDate >= yearStart && sessionDate <= yearEnd && s.status === 'Falta Injustificada';
      }).length
    };

    // Gráfico 5: Presencial vs Online
    const presencialCount = this.data.sessions.filter(s => {
      const sessionDate = s.date;
      return sessionDate >= yearStart && sessionDate <= yearEnd && 
             (s.status === 'Realizada' || s.status === 'Falta Justificada') && 
             s.modality === 'Presencial';
    }).length;
    
    const onlineCount = this.data.sessions.filter(s => {
      const sessionDate = s.date;
      return sessionDate >= yearStart && sessionDate <= yearEnd && 
             (s.status === 'Realizada' || s.status === 'Falta Justificada') && 
             s.modality === 'Online';
    }).length;

    // Gráfico 6: Distribuição de Gênero dos Pacientes
    const genderCounts = {
      'Feminino': this.data.patients.filter(p => p.gender === 'Feminino').length,
      'Masculino': this.data.patients.filter(p => p.gender === 'Masculino').length,
      'Neutro / Não Binário': this.data.patients.filter(p => p.gender === 'Neutro / Não Binário').length,
      'Outros': this.data.patients.filter(p => p.gender === 'Outros').length,
      'Não Informado': this.data.patients.filter(p => !p.gender || p.gender === '').length
    };
    const totalPatients = this.data.patients.length;

    // Gráfico 7: Despesas por Categoria
    const expensesByCategory = {};
    this.data.categories.forEach(cat => {
      expensesByCategory[cat] = this.data.expenses
        .filter(e => {
          if(e.status !== 'Pago') return false;
          const paymentDate = e.payment_date || e.date;
          return e.category === cat && paymentDate >= yearStart && paymentDate <= yearEnd;
        })
        .reduce((sum, e) => sum + Number(e.value || 0), 0);
    });

    // Gráfico 8: Comparação de Crescimento (Lucro Ano Anterior vs Ano Atual)
    const monthlyProfitCurrent = [];
    const monthlyProfitPrevious = [];
    
    for(let i = 1; i <= 12; i++) {
      const monthStart = `${selectedYear}-${String(i).padStart(2, '0')}-01`;
      const lastDay = new Date(selectedYear, i, 0).getDate();
      const monthEnd = `${selectedYear}-${String(i).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      
      const prevMonthStart = `${selectedYear - 1}-${String(i).padStart(2, '0')}-01`;
      const prevLastDay = new Date(selectedYear - 1, i, 0).getDate();
      const prevMonthEnd = `${selectedYear - 1}-${String(i).padStart(2, '0')}-${String(prevLastDay).padStart(2, '0')}`;
      
      // Ano atual
      const monthRevenue = this.data.sessions
        .filter(s => {
          if(!s.paid) return false;
          const paymentDate = s.payment_date || s.date;
          return paymentDate >= monthStart && paymentDate <= monthEnd && s.status !== 'Falta Justificada';
        })
        .reduce((sum, s) => sum + Number(s.value || 0), 0);
      
      const monthExpense = this.data.expenses
        .filter(e => {
          if(e.status !== 'Pago') return false;
          const paymentDate = e.payment_date || e.date;
          return paymentDate >= monthStart && paymentDate <= monthEnd;
        })
        .reduce((sum, e) => sum + Number(e.value || 0), 0);
      
      monthlyProfitCurrent.push(monthRevenue - monthExpense);
      
      // Ano anterior
      const prevMonthRevenue = this.data.sessions
        .filter(s => {
          if(!s.paid) return false;
          const paymentDate = s.payment_date || s.date;
          return paymentDate >= prevMonthStart && paymentDate <= prevMonthEnd && s.status !== 'Falta Justificada';
        })
        .reduce((sum, s) => sum + Number(s.value || 0), 0);
      
      const prevMonthExpense = this.data.expenses
        .filter(e => {
          if(e.status !== 'Pago') return false;
          const paymentDate = e.payment_date || e.date;
          return paymentDate >= prevMonthStart && paymentDate <= prevMonthEnd;
        })
        .reduce((sum, e) => sum + Number(e.value || 0), 0);
      
      monthlyProfitPrevious.push(prevMonthRevenue - prevMonthExpense);
    }
    
    const avgProfitCurrent = monthlyProfitCurrent.reduce((sum, p) => sum + p, 0) / 12;
    const avgProfitPrevious = monthlyProfitPrevious.reduce((sum, p) => sum + p, 0) / 12;

    // Obter cor primária do sistema
    function hexToRgba(hex, alpha) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#3b82f6';
    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-secondary').trim();
    const primaryColorLight = hexToRgba(primaryColor, 0.15);
    const primaryColorSoft = hexToRgba(primaryColor, 0.55);
    const secondaryColorSoft = secondaryColor ? hexToRgba(secondaryColor, 0.55) : hexToRgba(primaryColor, 0.35);
    
    // Função para gerar variações da cor primária (hex)
    function adjustColor(color, amount) {
      const usePound = color[0] === '#';
      const col = usePound ? color.slice(1) : color;
      const num = parseInt(col, 16);
      if(isNaN(num)) return color;
      let r = (num >> 16) + amount;
      let g = ((num >> 8) & 0x00FF) + amount;
      let b = (num & 0x0000FF) + amount;
      r = r > 255 ? 255 : r < 0 ? 0 : r;
      g = g > 255 ? 255 : g < 0 ? 0 : g;
      b = b > 255 ? 255 : b < 0 ? 0 : b;
      const result = (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
      return (usePound ? '#' : '') + result;
    }

    const lightColor = adjustColor(primaryColor, 40);
    const darkColor = adjustColor(primaryColor, -40);
    const veryLightColor = adjustColor(primaryColor, 80);

    // Aguardar um pouco para garantir que o DOM está pronto
    setTimeout(() => {
      const isDark = document.documentElement.classList.contains('dark');
      const textColor = isDark ? '#e5e7eb' : '#374151';
      const gridColor = isDark ? '#374151' : '#e5e7eb';
      Chart.defaults.color = textColor;
      Chart.defaults.borderColor = gridColor;

      // Gráfico 1: Evolução Mensal
      const ctx1 = document.getElementById('chart-evolution');
      if(ctx1) {
        new Chart(ctx1, {
          type: 'line',
          data: {
            labels: months,
            datasets: [{
              label: 'Receitas',
              data: monthlyRevenue,
              borderColor: primaryColor,
              backgroundColor: veryLightColor + '40',
              tension: 0.4,
              fill: true
            }, {
              label: 'Despesas',
              data: monthlyExpenses,
              borderColor: secondaryColorSoft || primaryColorSoft,
              backgroundColor: hexToRgba(primaryColor, 0.2),
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { 
                labels: { 
                  color: textColor,
                  font: { size: 15 }
                } 
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                  }
                }
              }
            },
            scales: {
              y: {
                ticks: { 
                  color: textColor,
                  callback: function(value) {
                    return 'R$ ' + (value / 1000).toFixed(1) + 'k';
                  }
                },
                grid: { color: gridColor }
              },
              x: { ticks: { color: textColor }, grid: { color: gridColor } }
            }
          }
        });
      }

      // Gráfico 2: Horas Trabalhadas vs Valor da Hora
      const ctx2 = document.getElementById('chart-hours');
      if(ctx2) {
        const hoursData = [...monthlyHours, avgHours];
        const valuePerHourData = [...monthlyValuePerHour, avgValuePerHour];
        const hoursLabels = [...months, 'Média'];
        new Chart(ctx2, {
          type: 'bar',
          data: {
            labels: hoursLabels,
            datasets: [{
              type: 'bar',
              label: 'Horas Trabalhadas',
              data: hoursData,
              backgroundColor: primaryColor,
              borderColor: darkColor,
              borderWidth: 1,
              yAxisID: 'y'
            }, {
              type: 'line',
              label: 'Valor da Hora',
              data: valuePerHourData,
              borderColor: secondaryColorSoft || primaryColorSoft,
              backgroundColor: hexToRgba(primaryColor, 0.2),
              tension: 0.4,
              fill: false,
              yAxisID: 'y1'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false
            },
            plugins: {
              legend: { 
                labels: { 
                  color: textColor,
                  font: { size: 15 }
                } 
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    if(context.datasetIndex === 0) {
                      return 'Horas: ' + context.parsed.y.toFixed(2) + 'h';
                    } else {
                      return 'Valor da Hora: ' + formatCurrency(context.parsed.y);
                    }
                  }
                }
              }
            },
            scales: {
              y: {
                type: 'linear',
                position: 'left',
                title: {
                  display: true,
                  text: 'Horas',
                  color: textColor,
                  font: { size: 13 }
                },
                ticks: { 
                  color: textColor,
                  callback: function(value) {
                    return value.toFixed(1) + 'h';
                  }
                },
                grid: { color: gridColor }
              },
              y1: {
                type: 'linear',
                position: 'right',
                title: {
                  display: true,
                  text: 'Valor da Hora (R$)',
                  color: textColor,
                  font: { size: 13 }
                },
                ticks: { 
                  color: textColor,
                  callback: function(value) {
                    return 'R$ ' + (value / 1000).toFixed(1) + 'k';
                  }
                },
                grid: { 
                  drawOnChartArea: false,
                  color: gridColor 
                }
              },
              x: { 
                ticks: { color: textColor }, 
                grid: { color: gridColor } 
              }
            }
          },
          plugins: [{
            id: 'valuePerHourLabels',
            afterDatasetsDraw: (chart) => {
              const ctx = chart.ctx;
              const lineDataset = chart.data.datasets.find(d => d.type === 'line');
              if(lineDataset) {
                const meta = chart.getDatasetMeta(chart.data.datasets.indexOf(lineDataset));
                meta.data.forEach((point, index) => {
                  const value = lineDataset.data[index];
                  if(value > 0) {
                    ctx.fillStyle = textColor;
                    ctx.font = 'bold 11px Inter';
                    ctx.textAlign = 'center';
                    ctx.fillText(formatCurrency(value), point.x, point.y - 10);
                  }
                });
              }
            }
          }]
        });
      }

      // Gráfico 3: Individual vs Grupo
      const ctx3 = document.getElementById('chart-individual-group');
      if(ctx3) {
        const totalSessions = individualSessions + groupSessions;
        new Chart(ctx3, {
          type: 'doughnut',
          data: {
            labels: ['Individual', 'Grupo'],
            datasets: [{
              data: [individualSessions, groupSessions],
              backgroundColor: [primaryColor, secondaryColorSoft || primaryColorSoft],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: textColor,
                  font: { size: 15 },
                  padding: 10,
                  generateLabels: function(chart) {
                    const data = chart.data;
                    if (data.labels.length && data.datasets.length) {
                      return data.labels.map((label, i) => {
                        const value = data.datasets[0].data[i];
                        const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                        return {
                          text: `${label}: ${value} (${percentage}%)`,
                          fillStyle: data.datasets[0].backgroundColor[i],
                          strokeStyle: data.datasets[0].backgroundColor[i],
                          lineWidth: 0,
                          hidden: false,
                          index: i,
                          fontColor: textColor,
                          color: textColor
                        };
                      });
                    }
                    return [];
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                    return label + ': ' + value + ' (' + percentage + '%)';
                  }
                }
              }
            }
          }
        });
      }

      // Gráfico 4: Análise de Faltas
      const ctx4 = document.getElementById('chart-faltas');
      if(ctx4) {
        const totalStatus = Object.values(statusCounts).reduce((a, b) => a + b, 0);
        const statusLabels = Object.keys(statusCounts);
        const statusColors = [primaryColor, primaryColorSoft, secondaryColorSoft || hexToRgba(primaryColor, 0.4)];
        new Chart(ctx4, {
          type: 'doughnut',
          data: {
            labels: statusLabels,
            datasets: [{
              data: Object.values(statusCounts),
              backgroundColor: statusColors.slice(0, statusLabels.length),
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: textColor,
                  font: { size: 15 },
                  padding: 10,
                  generateLabels: function(chart) {
                    const data = chart.data;
                    if (data.labels.length && data.datasets.length) {
                      return data.labels.map((label, i) => {
                        const value = data.datasets[0].data[i];
                        const percentage = totalStatus > 0 ? ((value / totalStatus) * 100).toFixed(1) : '0.0';
                        return {
                          text: `${label}: ${value} (${percentage}%)`,
                          fillStyle: data.datasets[0].backgroundColor[i],
                          strokeStyle: data.datasets[0].backgroundColor[i],
                          lineWidth: 0,
                          hidden: false,
                          index: i,
                          fontColor: textColor,
                          color: textColor
                        };
                      });
                    }
                    return [];
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const percentage = totalStatus > 0 ? ((value / totalStatus) * 100).toFixed(1) : '0.0';
                    return label + ': ' + value + ' (' + percentage + '%)';
                  }
                }
              }
            }
          }
        });
      }

      // Gráfico 5: Presencial vs Online
      const ctx5 = document.getElementById('chart-modality');
      if(ctx5) {
        const totalModality = presencialCount + onlineCount;
        new Chart(ctx5, {
          type: 'doughnut',
          data: {
            labels: ['Presencial', 'Online'],
            datasets: [{
              data: [presencialCount, onlineCount],
              backgroundColor: [primaryColor, secondaryColorSoft || primaryColorSoft],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: textColor,
                  font: { size: 15 },
                  padding: 10,
                  generateLabels: function(chart) {
                    const data = chart.data;
                    if (data.labels.length && data.datasets.length) {
                      return data.labels.map((label, i) => {
                        const value = data.datasets[0].data[i];
                        const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                        return {
                          text: `${label}: ${value} (${percentage}%)`,
                          fillStyle: data.datasets[0].backgroundColor[i],
                          strokeStyle: data.datasets[0].backgroundColor[i],
                          lineWidth: 0,
                          hidden: false,
                          index: i,
                          fontColor: textColor,
                          color: textColor
                        };
                      });
                    }
                    return [];
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const percentage = totalModality > 0 ? ((value / totalModality) * 100).toFixed(1) : '0.0';
                    return label + ': ' + value + ' (' + percentage + '%)';
                  }
                }
              }
            }
          }
        });
      }

      // Gráfico 6: Distribuição de Gênero
      const ctx6 = document.getElementById('chart-gender');
      if(ctx6) {
        const genderLabels = Object.keys(genderCounts).filter(g => genderCounts[g] > 0);
        const genderData = genderLabels.map(g => genderCounts[g]);
        const genderColors = [
          primaryColor,
          secondaryColorSoft || primaryColorSoft,
          hexToRgba(primaryColor, 0.7),
          hexToRgba(secondaryColor || primaryColor, 0.7),
          hexToRgba(primaryColor, 0.5)
        ];
        new Chart(ctx6, {
          type: 'doughnut',
          data: {
            labels: genderLabels,
            datasets: [{
              data: genderData,
              backgroundColor: genderColors.slice(0, genderLabels.length),
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: textColor,
                  font: { size: 15 },
                  padding: 10,
                  generateLabels: function(chart) {
                    const data = chart.data;
                    if (data.labels.length && data.datasets.length) {
                      return data.labels.map((label, i) => {
                        const value = data.datasets[0].data[i];
                        const percentage = totalPatients > 0 ? ((value / totalPatients) * 100).toFixed(1) : '0.0';
                        return {
                          text: `${label}: ${value} (${percentage}%)`,
                          fillStyle: data.datasets[0].backgroundColor[i],
                          strokeStyle: data.datasets[0].backgroundColor[i],
                          lineWidth: 0,
                          hidden: false,
                          index: i,
                          fontColor: textColor,
                          color: textColor
                        };
                      });
                    }
                    return [];
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const percentage = totalPatients > 0 ? ((value / totalPatients) * 100).toFixed(1) : '0.0';
                    return label + ': ' + value + ' (' + percentage + '%)';
                  }
                }
              }
            }
          }
        });
      }

      // Gráfico 7: Despesas por Categoria
      const ctx7 = document.getElementById('chart-expenses-category');
      if(ctx7) {
        const categoryLabels = Object.keys(expensesByCategory).filter(cat => expensesByCategory[cat] > 0);
        const categoryData = categoryLabels.map(cat => expensesByCategory[cat]);
        const totalCategoryExpenses = categoryData.reduce((a, b) => a + b, 0);
        const generateCategoryColors = (count) => {
          if (count === 0) return [];
          const colors = [
            primaryColor,
            secondaryColorSoft || primaryColorSoft,
            hexToRgba(primaryColor, 0.7),
            hexToRgba(secondaryColor || primaryColor, 0.7),
            hexToRgba(primaryColor, 0.5),
            hexToRgba(secondaryColor || primaryColor, 0.5),
            hexToRgba(primaryColor, 0.4),
            hexToRgba(secondaryColor || primaryColor, 0.4)
          ];
          const result = [];
          for (let i = 0; i < count; i++) {
            result.push(colors[i % colors.length]);
          }
          return result;
        };
        const categoryColors = generateCategoryColors(categoryLabels.length);
        new Chart(ctx7, {
          type: 'doughnut',
          data: {
            labels: categoryLabels,
            datasets: [{
              data: categoryData,
              backgroundColor: categoryColors,
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: textColor,
                  font: { size: 15 },
                  padding: 10,
                  generateLabels: function(chart) {
                    const data = chart.data;
                    if (data.labels.length && data.datasets.length) {
                      return data.labels.map((label, i) => {
                        const value = data.datasets[0].data[i];
                        const percentage = totalCategoryExpenses > 0 ? ((value / totalCategoryExpenses) * 100).toFixed(1) : '0.0';
                        return {
                          text: `${label}: ${formatCurrency(value)} (${percentage}%)`,
                          fillStyle: data.datasets[0].backgroundColor[i],
                          strokeStyle: data.datasets[0].backgroundColor[i],
                          lineWidth: 0,
                          hidden: false,
                          index: i,
                          fontColor: textColor,
                          color: textColor
                        };
                      });
                    }
                    return [];
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const percentage = totalCategoryExpenses > 0 ? ((value / totalCategoryExpenses) * 100).toFixed(1) : '0.0';
                    return label + ': ' + formatCurrency(value) + ' (' + percentage + '%)';
                  }
                }
              }
            }
          }
        });
      }

      // Gráfico 8: Comparação de Crescimento
      const ctx8 = document.getElementById('chart-growth');
      if(ctx8) {
        const growthLabels = [...months, 'Média'];
        const currentData = [...monthlyProfitCurrent, avgProfitCurrent];
        const previousData = [...monthlyProfitPrevious, avgProfitPrevious];
        new Chart(ctx8, {
          type: 'line',
          data: {
            labels: growthLabels,
            datasets: [{
              label: selectedYear - 1,
              data: previousData,
              borderColor: secondaryColorSoft || primaryColorSoft,
              backgroundColor: hexToRgba(primaryColor, 0.2),
              tension: 0.4,
              fill: true
            }, {
              label: selectedYear,
              data: currentData,
              borderColor: primaryColor,
              backgroundColor: hexToRgba(primaryColor, 0.15),
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { 
                labels: { 
                  color: textColor,
                  font: { size: 15 }
                } 
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                  }
                }
              }
            },
            scales: {
              y: {
                ticks: { 
                  color: textColor,
                  callback: function(value) {
                    return 'R$ ' + (value / 1000).toFixed(1) + 'k';
                  }
                },
                grid: { color: gridColor }
              },
              x: { ticks: { color: textColor }, grid: { color: gridColor } }
            }
          }
        });
      }
    }, 100);
  }

  renderBalancesPatients() {
    const currentYear = new Date().getFullYear();
    const selectedYear = this.balancesPatientsYear || currentYear;
    
    // Gerar opções de ano (de 2023 até o ano atual)
    const yearOptions = [];
    for(let year = 2023; year <= currentYear; year++) {
      yearOptions.push(`<option value="${year}" ${selectedYear === year ? 'selected' : ''}>${year}</option>`);
    }

    // Meses do ano
    const months = [
      { num: 1, name: 'Jan' },
      { num: 2, name: 'Fev' },
      { num: 3, name: 'Mar' },
      { num: 4, name: 'Abr' },
      { num: 5, name: 'Mai' },
      { num: 6, name: 'Jun' },
      { num: 7, name: 'Jul' },
      { num: 8, name: 'Ago' },
      { num: 9, name: 'Set' },
      { num: 10, name: 'Out' },
      { num: 11, name: 'Nov' },
      { num: 12, name: 'Dez' }
    ];

    // Calcular recebimentos por paciente e por mês
    const patientMonthlyData = {};
    
    // Processar sessões pagas no ano
    this.data.sessions.forEach(s => {
      if(!s.paid) return;
      
      // Usar payment_date se existir, senão usar date
      const paymentDate = s.payment_date || s.date;
      const paymentYear = paymentDate.substring(0, 4);
      if(paymentYear !== String(selectedYear)) return;
      
      // Ignorar sessões de falta justificada (valor 0 e já pago)
      if(s.status === 'Falta Justificada') return;
      
      const patientId = s.patient_id;
      if(!patientId) return;
      
      const monthNum = parseInt(paymentDate.substring(5, 7));
      
      if(!patientMonthlyData[patientId]) {
        patientMonthlyData[patientId] = {
          name: '',
          months: {},
          total: 0
        };
      }
      
      if(!patientMonthlyData[patientId].months[monthNum]) {
        patientMonthlyData[patientId].months[monthNum] = 0;
      }
      
      const value = Number(s.value || 0);
      patientMonthlyData[patientId].months[monthNum] += value;
      patientMonthlyData[patientId].total += value;
    });

    // Preencher nomes dos pacientes
    Object.keys(patientMonthlyData).forEach(patientId => {
      const patient = this.data.patients.find(p => p.id === patientId);
      patientMonthlyData[patientId].name = patient ? patient.name : 'Paciente Desconhecido';
    });

    // Criar array de pacientes com recebimento (ordenado alfabeticamente)
    const patientsWithReceipt = Object.keys(patientMonthlyData)
      .filter(patientId => patientMonthlyData[patientId].total > 0)
      .map(patientId => ({
        id: patientId,
        ...patientMonthlyData[patientId]
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

    // Calcular totais gerais por mês
    const totalByMonth = {};
    const totalGeral = patientsWithReceipt.reduce((sum, p) => {
      months.forEach(m => {
        if(!totalByMonth[m.num]) totalByMonth[m.num] = 0;
        totalByMonth[m.num] += p.months[m.num] || 0;
      });
      return sum + p.total;
    }, 0);

    return `
      <div class="mb-4">
        <label class="text-sm font-bold block mb-2">Ano</label>
        <select id="balances-patients-year" class="input-field" style="max-width: 200px;">
          ${yearOptions.join('')}
        </select>
      </div>

      <div class="card overflow-x-auto">
        <table class="w-full border-collapse text-sm" style="table-layout: fixed; min-width: 1000px;">
          <colgroup>
            <col style="width: 200px;">
            ${months.map(() => '<col style="width: 90px;">').join('')}
            <col style="width: 120px;">
          </colgroup>
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="text-left p-3 font-bold">Paciente</th>
              ${months.map(m => `<th class="text-center p-3 font-bold">${m.name}</th>`).join('')}
              <th class="text-center p-3 font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            ${patientsWithReceipt.length === 0 ? `
              <tr>
                <td colspan="${months.length + 2}" class="text-center p-4 text-gray-500 dark:text-gray-400">Nenhum recebimento encontrado para o ano ${selectedYear}</td>
              </tr>
            ` : patientsWithReceipt.map(p => `
              <tr class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="p-3">${p.name}</td>
                ${months.map(m => `<td class="p-3 text-center">${formatCurrency(p.months[m.num] || 0)}</td>`).join('')}
                <td class="p-3 text-center font-bold">${formatCurrency(p.total)}</td>
              </tr>
            `).join('')}
            ${patientsWithReceipt.length > 0 ? `
              <tr class="border-t-2 border-[var(--color-primary)] bg-gray-50 dark:bg-gray-800 font-bold">
                <td class="p-3">Total Geral</td>
                ${months.map(m => `<td class="p-3 text-center">${formatCurrency(totalByMonth[m.num] || 0)}</td>`).join('')}
                <td class="p-3 text-center">${formatCurrency(totalGeral)}</td>
              </tr>
            ` : ''}
          </tbody>
        </table>
      </div>
    `;
  }

  renderBalancesExpenses() {
    const currentYear = new Date().getFullYear();
    const selectedYear = this.balancesExpensesYear || currentYear;
    
    // Gerar opções de ano (de 2023 até o ano atual)
    const yearOptions = [];
    for(let year = 2023; year <= currentYear; year++) {
      yearOptions.push(`<option value="${year}" ${selectedYear === year ? 'selected' : ''}>${year}</option>`);
    }

    // Obter todas as categorias de despesas
    const categories = [...(this.data.categories || [])].sort();
    
    // Calcular dados por mês
    const months = [
      { num: 1, name: 'Janeiro' },
      { num: 2, name: 'Fevereiro' },
      { num: 3, name: 'Março' },
      { num: 4, name: 'Abril' },
      { num: 5, name: 'Maio' },
      { num: 6, name: 'Junho' },
      { num: 7, name: 'Julho' },
      { num: 8, name: 'Agosto' },
      { num: 9, name: 'Setembro' },
      { num: 10, name: 'Outubro' },
      { num: 11, name: 'Novembro' },
      { num: 12, name: 'Dezembro' }
    ];

    const monthlyData = months.map(month => {
      const monthStart = `${selectedYear}-${String(month.num).padStart(2, '0')}-01`;
      const lastDay = new Date(selectedYear, month.num, 0).getDate();
      const monthEnd = `${selectedYear}-${String(month.num).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      // Calcular faturamento (sessões pagas no mês)
      const faturamento = this.data.sessions
        .filter(s => {
          if(!s.paid) return false;
          const paymentDate = s.payment_date || s.date;
          return paymentDate >= monthStart && paymentDate <= monthEnd && s.status !== 'Falta Justificada';
        })
        .reduce((sum, s) => sum + Number(s.value || 0), 0);

      // Calcular despesas por categoria no mês
      const expensesByCategory = {};
      categories.forEach(cat => {
        expensesByCategory[cat] = this.data.expenses
          .filter(e => {
            if(e.status !== 'Pago') return false;
            const paymentDate = e.payment_date || e.date;
            return e.category === cat && paymentDate >= monthStart && paymentDate <= monthEnd;
          })
          .reduce((sum, e) => sum + Number(e.value || 0), 0);
      });

      // Calcular total de despesas
      const totalDespesas = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0);

      // Calcular percentual e lucro
      const percentual = faturamento > 0 ? ((totalDespesas / faturamento) * 100).toFixed(2) : '0.00';
      const lucro = faturamento - totalDespesas;

      return {
        month: month.name,
        faturamento,
        expensesByCategory,
        totalDespesas,
        percentual,
        lucro
      };
    });

    // Calcular totais gerais
    const totalFaturamento = monthlyData.reduce((sum, m) => sum + m.faturamento, 0);
    const totalDespesasByCategory = {};
    categories.forEach(cat => {
      totalDespesasByCategory[cat] = monthlyData.reduce((sum, m) => sum + (m.expensesByCategory[cat] || 0), 0);
    });
    const totalDespesas = monthlyData.reduce((sum, m) => sum + m.totalDespesas, 0);
    const totalPercentual = totalFaturamento > 0 ? ((totalDespesas / totalFaturamento) * 100).toFixed(2) : '0.00';
    const totalLucro = totalFaturamento - totalDespesas;

    return `
      <div class="mb-4">
        <label class="text-sm font-bold block mb-2">Ano</label>
        <select id="balances-expenses-year" class="input-field" style="max-width: 200px;">
          ${yearOptions.join('')}
        </select>
      </div>

      <div class="card overflow-x-auto">
        <table class="w-full border-collapse text-sm" style="table-layout: fixed; min-width: 1000px;">
          <colgroup>
            <col style="width: 200px;">
            <col style="width: 120px;">
            ${categories.map(() => '<col style="width: 90px;">').join('')}
            <col style="width: 120px;">
            <col style="width: 90px;">
            <col style="width: 120px;">
          </colgroup>
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="text-left p-3 font-bold">Mês</th>
              <th class="text-center p-3 font-bold">Faturamento</th>
              ${categories.map(cat => `<th class="text-center p-3 font-bold">${cat}</th>`).join('')}
              <th class="text-center p-3 font-bold">Total Despesas</th>
              <th class="text-center p-3 font-bold">% Despesas</th>
              <th class="text-center p-3 font-bold">Lucro</th>
            </tr>
          </thead>
          <tbody>
            ${monthlyData.map(m => `
              <tr class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="p-3 font-medium">${m.month}</td>
                <td class="p-3 text-center">${formatCurrency(m.faturamento)}</td>
                ${categories.map(cat => `<td class="p-3 text-center">${formatCurrency(m.expensesByCategory[cat] || 0)}</td>`).join('')}
                <td class="p-3 text-center font-bold">${formatCurrency(m.totalDespesas)}</td>
                <td class="p-3 text-center">${m.percentual}%</td>
                <td class="p-3 text-center font-bold ${m.lucro >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">${formatCurrency(m.lucro)}</td>
              </tr>
            `).join('')}
            <tr class="border-t-2 border-[var(--color-primary)] bg-gray-50 dark:bg-gray-800 font-bold">
              <td class="p-3">Total Geral</td>
              <td class="p-3 text-center">${formatCurrency(totalFaturamento)}</td>
              ${categories.map(cat => `<td class="p-3 text-center">${formatCurrency(totalDespesasByCategory[cat] || 0)}</td>`).join('')}
              <td class="p-3 text-center">${formatCurrency(totalDespesas)}</td>
              <td class="p-3 text-center">${totalPercentual}%</td>
              <td class="p-3 text-center ${totalLucro >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">${formatCurrency(totalLucro)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  destroy() {
    // Cleanup charts if needed
    if (window.Chart && window.Chart.instances) {
      Object.keys(window.Chart.instances).forEach(id => {
        window.Chart.instances[id].destroy();
      });
    }
  }
}
