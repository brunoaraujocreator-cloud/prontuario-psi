export class Loading {
  constructor(id = 'loading') {
    this.id = id;
    this.init();
  }

  init() {
    if (!document.getElementById(this.id)) {
      const loading = document.createElement('div');
      loading.id = this.id;
      loading.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
      loading.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center gap-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
          <p id="${this.id}-message" class="text-gray-700 dark:text-gray-300">Carregando...</p>
        </div>
      `;
      document.body.appendChild(loading);
    }
  }

  show(message = 'Carregando...') {
    const loading = document.getElementById(this.id);
    const messageEl = document.getElementById(`${this.id}-message`);
    
    if (messageEl) {
      messageEl.textContent = message;
    }
    
    if (loading) {
      loading.classList.remove('hidden');
      loading.classList.add('flex');
    }
  }

  hide() {
    const loading = document.getElementById(this.id);
    if (loading) {
      loading.classList.add('hidden');
      loading.classList.remove('flex');
    }
  }
}

export const loading = new Loading();



