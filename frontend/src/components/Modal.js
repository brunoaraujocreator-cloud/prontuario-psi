export class Modal {
  constructor(id = 'main-modal') {
    this.id = id;
    this.modal = null;
    this.init();
  }

  init() {
    // Create modal if it doesn't exist
    if (!document.getElementById(this.id)) {
      const modal = document.createElement('div');
      modal.id = this.id;
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 id="${this.id}-title" class="text-xl font-bold"></h2>
            <button onclick="document.getElementById('${this.id}').classList.add('hidden')" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>
          <div id="${this.id}-content" class="p-6"></div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    this.modal = document.getElementById(this.id);
  }

  open(title, content) {
    const titleEl = document.getElementById(`${this.id}-title`);
    const contentEl = document.getElementById(`${this.id}-content`);
    
    if (titleEl) titleEl.textContent = title;
    if (contentEl) {
      if (typeof content === 'string') {
        contentEl.innerHTML = content;
      } else {
        contentEl.innerHTML = '';
        contentEl.appendChild(content);
      }
    }
    
    this.modal.classList.remove('hidden');
    this.modal.classList.add('flex');
  }

  close() {
    this.modal.classList.add('hidden');
    this.modal.classList.remove('flex');
  }
}



