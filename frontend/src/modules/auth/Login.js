import { authService } from '../../services/supabase.js';
import { loading } from '../../components/Loading.js';
import { dialog } from '../../components/Dialog.js';

export class LoginModule {
  constructor() {
    this.container = null;
  }

  async init() {
    this.container = document.getElementById('app');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'app';
      document.body.appendChild(this.container);
    }
    await this.render();
  }

  async render() {
    // Hide sidebar and header for login
    const sidebar = document.getElementById('sidebar');
    const header = document.getElementById('header');
    if (sidebar) sidebar.style.display = 'none';
    if (header) header.style.display = 'none';

    this.container.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
          <div class="text-center mb-8">
            <i class="fa-solid fa-brain text-5xl text-[var(--color-primary)] mb-4"></i>
            <h1 class="text-2xl font-bold">Prontuário PSI</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">Entre com suas credenciais</p>
          </div>
          
          <form id="login-form" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Email</label>
              <input 
                type="email" 
                id="login-email" 
                required
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="seu@email.com"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">Senha</label>
              <input 
                type="password" 
                id="login-password" 
                required
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="••••••••"
              >
            </div>
            
            <div id="login-error" class="text-red-500 text-sm hidden"></div>
            
            <button 
              type="submit"
              class="w-full bg-[var(--color-primary)] text-white py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Entrar
            </button>
            
            <div class="text-center mt-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Não tem uma conta? 
                <a href="#/register" class="text-[var(--color-primary)] hover:underline">Criar conta</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleLogin();
      });
    }
  }

  async handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    try {
      loading.show('Entrando...');
      errorEl.classList.add('hidden');

      await authService.signIn(email, password);

      // Store password in sessionStorage for encryption (it will be cleared on tab close)
      sessionStorage.setItem('encryption_password', password);

      // Redirect to dashboard
      window.location.hash = '#/dashboard';
      window.location.reload();
    } catch (error) {
      console.error('Login error:', error);
      errorEl.textContent = error.message || 'Erro ao fazer login';
      errorEl.classList.remove('hidden');
    } finally {
      loading.hide();
    }
  }

  destroy() {
    const sidebar = document.getElementById('sidebar');
    const header = document.getElementById('header');
    if (sidebar) sidebar.style.display = '';
    if (header) header.style.display = '';
  }
}

