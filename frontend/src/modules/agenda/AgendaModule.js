import { api } from '../../services/api.js';
import { loading } from '../../components/Loading.js';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters.js';

export class AgendaModule {
  constructor() {
    this.container = null;
    this.sessions = [];
    this.events = [];
    this.patients = [];
    this.groups = [];
    this.currentDate = new Date();
    this.showSaturdays = false;
    this.showSundays = false;
  }

  async init() {
    this.container = document.getElementById('app-container') || document.getElementById('app');
    await this.loadData();
    await this.render();
  }

  async loadData() {
    try {
      loading.show('Carregando agenda...');
      const [sessions, events, patients, groups] = await Promise.all([
        api.get('/api/sessions').catch(() => []),
        api.get('/api/events').catch(() => []),
        api.get('/api/patients').catch(() => []),
        api.get('/api/groups').catch(() => [])
      ]);

      this.sessions = sessions;
      this.events = events;
      this.patients = patients;
      this.groups = groups;
    } catch (error) {
      console.error('Error loading agenda data:', error);
    } finally {
      loading.hide();
    }
  }

  async render() {
    const weekDays = this.getWeekDays(this.currentDate);
    const visibleDays = weekDays.filter(day => {
      if (day.dayOfWeek === 0) return this.showSundays;
      if (day.dayOfWeek === 6) return this.showSaturdays;
      return true;
    });

    const gridCols = visibleDays.length + 1;

    this.container.innerHTML = `
      <div class="p-6 fade-in">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 class="text-2xl font-bold flex items-center gap-2">
            <i class="fa-solid fa-calendar-week text-[var(--color-primary)]"></i> Agenda Semanal
          </h1>
          
          <div class="flex flex-wrap items-center gap-2">
            <div class="flex bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-1">
              <button onclick="window.agendaModule.changeWeek(-1)" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><i class="fa-solid fa-chevron-left"></i></button>
              <button onclick="window.agendaModule.goToday()" class="px-4 py-2 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Hoje</button>
              <button onclick="window.agendaModule.changeWeek(1)" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><i class="fa-solid fa-chevron-right"></i></button>
            </div>

            <div class="flex gap-2">
              <label class="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 cursor-pointer text-sm font-medium">
                <input type="checkbox" ${this.showSaturdays ? 'checked' : ''} onchange="window.agendaModule.toggleWeekend('saturdays')"> Sáb
              </label>
              <label class="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 cursor-pointer text-sm font-medium">
                <input type="checkbox" ${this.showSundays ? 'checked' : ''} onchange="window.agendaModule.toggleWeekend('sundays')"> Dom
              </label>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div class="grid grid-cols-${gridCols} border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div class="p-4 border-r border-gray-200 dark:border-gray-700 text-center font-bold text-gray-500 text-xs uppercase tracking-wider">Hora</div>
            ${visibleDays.map(day => `
              <div class="p-4 border-r border-gray-200 dark:border-gray-700 last:border-r-0 text-center ${day.isToday ? 'bg-[var(--color-primary)] text-white' : ''}">
                <div class="text-xs uppercase font-bold opacity-80">${day.name}</div>
                <div class="text-lg font-black">${day.dayNum}</div>
              </div>
            `).join('')}
          </div>

          <div class="relative overflow-y-auto max-h-[calc(100vh-280px)]">
            ${this.renderTimeGrid(visibleDays)}
          </div>
        </div>
      </div>
    `;

    window.agendaModule = this;
  }

  getWeekDays(date) {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day; // Start from Sunday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const days = [];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        dateStr,
        name: dayNames[i],
        dayNum: d.getDate(),
        dayOfWeek: i,
        isToday: dateStr === today
      });
    }
    return days;
  }

  renderTimeGrid(visibleDays) {
    const hours = [];
    for (let i = 7; i <= 22; i++) {
      hours.push(i);
    }

    return hours.map(hour => `
      <div class="grid grid-cols-${visibleDays.length + 1} border-b border-gray-100 dark:border-gray-700/50 min-h-[80px]">
        <div class="p-2 border-r border-gray-200 dark:border-gray-700 text-center text-xs font-bold text-gray-400 bg-gray-50/50 dark:bg-gray-900/20">
          ${String(hour).padStart(2, '0')}:00
        </div>
        ${visibleDays.map(day => {
          const items = this.getItemsForTime(day.dateStr, hour);
          return `
            <div class="p-1 border-r border-gray-200 dark:border-gray-700 last:border-r-0 relative group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
              <div class="flex flex-col gap-1">
                ${items.map(item => this.renderAgendaItem(item)).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `).join('');
  }

  getItemsForTime(dateStr, hour) {
    const items = [];
    const hourStr = String(hour).padStart(2, '0');

    // Sessions
    this.sessions.filter(s => s.date === dateStr && s.time && s.time.startsWith(hourStr)).forEach(s => {
      const patient = this.patients.find(p => p.id === s.patient_id);
      const group = s.is_group ? this.groups.find(g => g.id === s.group_id) : null;
      items.push({
        type: 'session',
        data: s,
        title: s.is_group ? `G: ${group?.name || 'Grupo'}` : (patient?.name || 'Sessão'),
        color: s.status === 'Agendada' ? 'blue' : (s.status === 'Realizada' ? 'green' : 'red')
      });
    });

    // Events
    this.events.filter(e => e.date === dateStr && e.time && e.time.startsWith(hourStr)).forEach(e => {
      items.push({
        type: 'event',
        data: e,
        title: e.title,
        color: 'purple'
      });
    });

    return items;
  }

  renderAgendaItem(item) {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-800',
      green: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-200 dark:border-green-800',
      red: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-200 dark:border-red-800',
      purple: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-200 dark:border-purple-800',
      amber: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-800'
    };

    const colorClass = colors[item.color] || colors.blue;

    return `
      <div 
        onclick="window.agendaModule.handleItemClick('${item.type}', '${item.data.id}')"
        class="p-1.5 rounded border ${colorClass} text-[10px] font-bold cursor-pointer shadow-sm hover:scale-[1.02] transition-transform truncate"
        title="${item.title} (${item.data.time})"
      >
        <div class="flex items-center gap-1">
          <i class="fa-solid ${item.type === 'session' ? 'fa-user' : 'fa-star'} opacity-70"></i>
          <span class="truncate">${item.data.time} - ${item.title}</span>
        </div>
      </div>
    `;
  }

  handleItemClick(type, id) {
    if (type === 'session') {
      window.location.hash = `#/sessions?id=${id}`;
    } else {
      window.location.hash = `#/events?id=${id}`;
    }
  }

  changeWeek(weeks) {
    this.currentDate.setDate(this.currentDate.getDate() + (weeks * 7));
    this.render();
  }

  goToday() {
    this.currentDate = new Date();
    this.render();
  }

  toggleWeekend(type) {
    if (type === 'saturdays') this.showSaturdays = !this.showSaturdays;
    if (type === 'sundays') this.showSundays = !this.showSundays;
    this.render();
  }

  destroy() {
    delete window.agendaModule;
  }
}
