import { authService } from '../../services/supabase.js';
import { loading } from '../../components/Loading.js';
import { dialog } from '../../components/Dialog.js';
import { validateEmail, validateMinLength } from '../../utils/validators.js';

export class RegisterModule {
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
    // Hide sidebar and header for register
    const sidebar = document.getElementById('sidebar');
    const header = document.getElementById('header');
    if (sidebar) sidebar.style.display = 'none';
    if (header) header.style.display = 'none';

    this.container.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
          <div class="text-center mb-8">
            <i class="fa-solid fa-brain text-5xl text-[var(--color-primary)] mb-4"></i>
            <h1 class="text-2xl font-bold">Criar Conta</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">Preencha os dados para criar sua conta</p>
          </div>
          
          <form id="register-form" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Nome Completo *</label>
              <input 
                type="text" 
                id="register-name" 
                required
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="Seu nome completo"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">Email *</label>
              <input 
                type="email" 
                id="register-email" 
                required
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="seu@email.com"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">Senha *</label>
              <input 
                type="password" 
                id="register-password" 
                required
                minlength="6"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="Mínimo 6 caracteres"
              >
              <p class="text-xs text-gray-500 mt-1">A senha deve ter no mínimo 6 caracteres</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">Confirmar Senha *</label>
              <input 
                type="password" 
                id="register-confirm-password" 
                required
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="Digite a senha novamente"
              >
            </div>
            
            <div id="register-error" class="text-red-500 text-sm hidden"></div>
            
            <button 
              type="submit"
              class="w-full bg-[var(--color-primary)] text-white py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Criar Conta
            </button>
            
            <div class="text-center mt-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Já tem uma conta? 
                <a href="#/login" class="text-[var(--color-primary)] hover:underline">Fazer login</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const form = document.getElementById('register-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleRegister();
      });
    }
  }

  async handleRegister() {
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const errorEl = document.getElementById('register-error');

    // Reset error
    errorEl.classList.add('hidden');
    errorEl.textContent = '';

    // Validation
    if (!name) {
      errorEl.textContent = 'Nome é obrigatório';
      errorEl.classList.remove('hidden');
      return;
    }

    if (!validateEmail(email)) {
      errorEl.textContent = 'Email inválido';
      errorEl.classList.remove('hidden');
      return;
    }

    if (!validateMinLength(password, 6)) {
      errorEl.textContent = 'A senha deve ter no mínimo 6 caracteres';
      errorEl.classList.remove('hidden');
      return;
    }

    if (password !== confirmPassword) {
      errorEl.textContent = 'As senhas não coincidem';
      errorEl.classList.remove('hidden');
      return;
    }

    try {
      loading.show('Criando conta...');

      // Register user with metadata and auto-confirm option
      const { data, error } = await authService.signUp(email, password, {
        userMetadata: {
          name: name
        },
        emailRedirectTo: window.location.origin
      });

      if (error) throw error;

      // Create user profile in database
      if (data.user) {
        try {
          const { supabase } = await import('../../services/supabase.js');
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              name: name
            });

          if (profileError && !profileError.message.includes('duplicate')) {
            console.error('Error creating profile:', profileError);
            // Don't throw - registration succeeded, profile can be created later
          }
        } catch (profileError) {
          console.error('Error creating user profile:', profileError);
          // Continue anyway - profile can be created later
        }
      }

      // Check if email confirmation is required
      if (data.user && !data.user.email_confirmed_at) {
        dialog.show(
          'Conta criada! Se o email de confirmação não chegar, você pode confirmar manualmente no Supabase ou desabilitar a verificação de email nas configurações.',
          'alert',
          () => {
            window.location.hash = '#/login';
          }
        );
      } else {
        dialog.show(
          'Conta criada com sucesso! Você já pode fazer login.',
          'alert',
          () => {
            window.location.hash = '#/login';
          }
        );
      }
    } catch (error) {
      console.error('Register error:', error);
      let errorMessage = 'Erro ao criar conta';
      
      if (error.message.includes('already registered')) {
        errorMessage = 'Este email já está cadastrado';
      } else if (error.message.includes('Password')) {
        errorMessage = 'A senha deve ter no mínimo 6 caracteres';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      errorEl.textContent = errorMessage;
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

