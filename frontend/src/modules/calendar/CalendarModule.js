import { api } from '../../services/api.js';
import { loading } from '../../components/Loading.js';
import { formatDate } from '../../utils/formatters.js';

export class CalendarModule {
  constructor() {
    this.container = null;
    this.events = [];
    this.sessions = [];
    this.currentDate = new Date();
  }

  async init() {
    this.container = document.getElementById('app-container') || document.getElementById('app');
    await Promise.all([this.loadEvents(), this.loadSessions()]);
    await this.render();
  }

  async loadEvents() {
    try {
      this.events = await api.get('/api/events').catch(() => []);
    } catch (error) {
      console.error('Error loading events:', error);
      this.events = [];
    }
  }

  async loadSessions() {
    try {
      this.sessions = await api.get('/api/sessions').catch(() => []);
    } catch (error) {
      console.error('Error loading sessions:', error);
      this.sessions = [];
    }
  }

  async render() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const monthName = this.currentDate.toLocaleString('pt-BR', { month: 'long' });
    
    this.container.innerHTML = `
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold capitalize">${monthName} ${year}</h1>
          <div class="flex gap-2">
            <button 
              id="prev-month-btn"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <i class="fa-solid fa-chevron-left"></i>
            </button>
            <button 
              id="today-btn"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Hoje
            </button>
            <button 
              id="next-month-btn"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          ${this.renderCalendar()}
        </div>
      </div>
    `;

    this.attachEvents();
  }

  renderCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    let calendarHTML = '<div class="grid grid-cols-7 gap-2">';
    
    // Week day headers
    weekDays.forEach(day => {
      calendarHTML += `<div class="text-center font-semibold py-2">${day}</div>`;
    });
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarHTML += '<div class="aspect-square"></div>';
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayEvents = this.getEventsForDate(dateStr);
      const daySessions = this.getSessionsForDate(dateStr);
      const hasItems = dayEvents.length > 0 || daySessions.length > 0;
      
      calendarHTML += `
        <div class="aspect-square border border-gray-200 dark:border-gray-700 rounded-lg p-2 ${
          hasItems ? 'bg-blue-50 dark:bg-blue-900/20' : ''
        }">
          <div class="text-sm font-medium mb-1">${day}</div>
          ${dayEvents.length > 0 ? `
            <div class="text-xs text-blue-600 dark:text-blue-400">
              <i class="fa-solid fa-calendar-check mr-1"></i>${dayEvents.length}
            </div>
          ` : ''}
          ${daySessions.length > 0 ? `
            <div class="text-xs text-green-600 dark:text-green-400">
              <i class="fa-solid fa-clock mr-1"></i>${daySessions.length}
            </div>
          ` : ''}
        </div>
      `;
    }
    
    calendarHTML += '</div>';
    return calendarHTML;
  }

  getEventsForDate(dateStr) {
    return this.events.filter(event => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  }

  getSessionsForDate(dateStr) {
    return this.sessions.filter(session => {
      const sessionDate = new Date(session.date).toISOString().split('T')[0];
      return sessionDate === dateStr;
    });
  }

  attachEvents() {
    const prevBtn = document.getElementById('prev-month-btn');
    const nextBtn = document.getElementById('next-month-btn');
    const todayBtn = document.getElementById('today-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        this.currentDate = new Date();
        this.render();
      });
    }
  }

  destroy() {}
}
