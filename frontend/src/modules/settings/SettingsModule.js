import { applyPrimaryColor, toggleTheme, getPrimaryColor } from '../../config/theme.js';
import { dialog } from '../../components/Dialog.js';
import { api } from '../../services/api.js';

export class SettingsModule {
  constructor() {
    this.container = null;
    this.settings = {};
  }

  async init() {
    this.container = document.getElementById('app-container') || document.getElementById('app');
    await this.loadSettings();
    await this.render();
  }

  async loadSettings() {
    try {
      // Load settings from API or use defaults
      this.settings = {
        primaryColor: getPrimaryColor(),
        theme: localStorage.getItem('theme') || 'light'
      };
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async render() {
    this.container.innerHTML = `
      <div class="p-6">
        <h1 class="text-2xl font-bold mb-6">Configurações</h1>
        
        <div class="space-y-6">
          <!-- Theme Settings -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 class="text-lg font-semibold mb-4">Aparência</h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">Tema</label>
                <button 
                  id="toggle-theme-btn"
                  class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  <i class="fa-solid fa-moon dark:hidden mr-2"></i>
                  <i class="fa-solid fa-sun hidden dark:inline mr-2"></i>
                  <span id="theme-text">${this.settings.theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}</span>
                </button>
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-2">Cor Primária</label>
                <div class="flex items-center gap-4">
                  <input 
                    type="color" 
                    id="primary-color-input" 
                    value="${this.settings.primaryColor}"
                    class="w-20 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  >
                  <input 
                    type="text" 
                    id="primary-color-text" 
                    value="${this.settings.primaryColor}"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="#3b82f6"
                  >
                  <button 
                    id="apply-color-btn"
                    class="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- System Info -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 class="text-lg font-semibold mb-4">Informações do Sistema</h2>
            <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Versão:</strong> 1.0.0</p>
              <p><strong>Ambiente:</strong> ${import.meta.env.MODE || 'development'}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const themeBtn = document.getElementById('toggle-theme-btn');
    const colorInput = document.getElementById('primary-color-input');
    const colorText = document.getElementById('primary-color-text');
    const applyBtn = document.getElementById('apply-color-btn');

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        toggleTheme();
        const themeText = document.getElementById('theme-text');
        if (themeText) {
          const isDark = document.documentElement.classList.contains('dark');
          themeText.textContent = isDark ? 'Modo Escuro' : 'Modo Claro';
        }
      });
    }

    if (colorInput && colorText) {
      colorInput.addEventListener('input', (e) => {
        colorText.value = e.target.value;
      });

      colorText.addEventListener('input', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
          colorInput.value = e.target.value;
        }
      });
    }

    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const color = colorText.value || colorInput.value;
        if (/^#[0-9A-F]{6}$/i.test(color)) {
          applyPrimaryColor(color);
          dialog.show('Cor primária atualizada! Recarregue a página para ver todas as mudanças.', 'alert');
        } else {
          dialog.show('Cor inválida. Use o formato hexadecimal (ex: #3b82f6)', 'alert');
        }
      });
    }
  }

  destroy() {}
}
