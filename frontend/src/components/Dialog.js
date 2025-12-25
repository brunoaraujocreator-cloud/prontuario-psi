export class Dialog {
  constructor(id = 'dialog-modal') {
    this.id = id;
    this.dialog = null;
    this.init();
  }

  init() {
    if (!document.getElementById(this.id)) {
      const dialog = document.createElement('div');
      dialog.id = this.id;
      dialog.className = 'fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50';
      dialog.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
          <div class="p-6">
            <h3 id="${this.id}-title" class="text-lg font-bold mb-4"></h3>
            <p id="${this.id}-message" class="mb-4"></p>
            <div id="${this.id}-input-container" class="hidden mb-4">
              <input type="text" id="${this.id}-input" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
            </div>
            <div class="flex gap-3 justify-end">
              <button id="${this.id}-cancel" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
                Cancelar
              </button>
              <button id="${this.id}-confirm" class="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90">
                OK
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(dialog);
    }
    this.dialog = document.getElementById(this.id);
  }

  show(message, type = 'alert', onConfirm = null) {
    const titleEl = document.getElementById(`${this.id}-title`);
    const messageEl = document.getElementById(`${this.id}-message`);
    const inputContainer = document.getElementById(`${this.id}-input-container`);
    const inputEl = document.getElementById(`${this.id}-input`);
    const confirmBtn = document.getElementById(`${this.id}-confirm`);
    const cancelBtn = document.getElementById(`${this.id}-cancel`);

    if (titleEl) titleEl.textContent = type === 'alert' ? 'Atenção' : 'Confirmação';
    if (messageEl) messageEl.textContent = message;

    if (type === 'prompt') {
      inputContainer.classList.remove('hidden');
      cancelBtn.classList.remove('hidden');
      confirmBtn.textContent = 'Salvar';
      
      confirmBtn.onclick = () => {
        const value = inputEl.value;
        this.close();
        if (onConfirm) onConfirm(value);
      };
      
      cancelBtn.onclick = () => {
        this.close();
        if (onConfirm) onConfirm(null);
      };
      
      setTimeout(() => inputEl.focus(), 100);
    } else {
      inputContainer.classList.add('hidden');
      cancelBtn.classList.add('hidden');
      confirmBtn.textContent = 'OK';
      
      confirmBtn.onclick = () => {
        this.close();
        if (onConfirm) onConfirm(true);
      };
    }

    this.dialog.classList.remove('hidden');
    this.dialog.classList.add('flex');
  }

  close() {
    this.dialog.classList.add('hidden');
    this.dialog.classList.remove('flex');
  }
}

export const dialog = new Dialog();



