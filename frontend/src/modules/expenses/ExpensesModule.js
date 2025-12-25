import { api } from '../../services/api.js';
import { loading } from '../../components/Loading.js';
import { dialog } from '../../components/Dialog.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export class ExpensesModule {
  constructor() {
    this.container = null;
    this.expenses = [];
  }

  async init() {
    this.container = document.getElementById('app-container') || document.getElementById('app');
    await this.loadExpenses();
    await this.render();
  }

  async loadExpenses() {
    try {
      loading.show('Carregando despesas...');
      this.expenses = await api.get('/api/expenses').catch(() => []);
    } catch (error) {
      console.error('Error loading expenses:', error);
      this.expenses = [];
    } finally {
      loading.hide();
    }
  }

  async render() {
    this.container.innerHTML = `
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold">Despesas</h1>
          <button 
            id="add-expense-btn"
            class="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90"
          >
            <i class="fa-solid fa-plus mr-2"></i>Nova Despesa
          </button>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Descrição</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Valor</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Data</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Categoria</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                ${this.renderExpensesList()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  renderExpensesList() {
    if (this.expenses.length === 0) {
      return `
        <tr>
          <td colspan="6" class="px-6 py-8 text-center text-gray-500">
            Nenhuma despesa cadastrada
          </td>
        </tr>
      `;
    }

    return this.expenses.map(expense => `
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
        <td class="px-6 py-4 whitespace-nowrap">${expense.description || '-'}</td>
        <td class="px-6 py-4 whitespace-nowrap">${formatCurrency(expense.value)}</td>
        <td class="px-6 py-4 whitespace-nowrap">${formatDate(expense.date)}</td>
        <td class="px-6 py-4 whitespace-nowrap">${expense.category || '-'}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 py-1 rounded text-xs ${
            expense.status === 'Pago' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }">
            ${expense.status || 'Pendente'}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <button 
            onclick="window.expensesModule.editExpense('${expense.id}')"
            class="text-blue-500 hover:text-blue-700 mr-3"
            title="Editar"
          >
            <i class="fa-solid fa-edit"></i>
          </button>
          <button 
            onclick="window.expensesModule.deleteExpense('${expense.id}')"
            class="text-red-500 hover:text-red-700"
            title="Excluir"
          >
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  attachEvents() {
    const addBtn = document.getElementById('add-expense-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showExpenseForm());
    }
    window.expensesModule = this;
  }

  showExpenseForm(expense = null) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-bold">${expense ? 'Editar' : 'Nova'} Despesa</h2>
        </div>
        <form id="expense-form" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Descrição *</label>
            <input 
              type="text" 
              id="expense-description" 
              required
              value="${expense?.description || ''}"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Valor *</label>
            <input 
              type="number" 
              id="expense-value" 
              required
              step="0.01"
              value="${expense?.value || ''}"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Data *</label>
            <input 
              type="date" 
              id="expense-date" 
              required
              value="${expense?.date || ''}"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Categoria</label>
            <input 
              type="text" 
              id="expense-category" 
              value="${expense?.category || ''}"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Status</label>
            <select 
              id="expense-status" 
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="Pago" ${expense?.status === 'Pago' ? 'selected' : ''}>Pago</option>
              <option value="Pendente" ${expense?.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
            </select>
          </div>
          
          <div class="flex gap-3 justify-end">
            <button 
              type="button"
              onclick="this.closest('.fixed').remove()"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              class="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    const form = document.getElementById('expense-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveExpense(expense?.id);
      modal.remove();
    });
  }

  async saveExpense(id) {
    const data = {
      description: document.getElementById('expense-description').value,
      value: parseFloat(document.getElementById('expense-value').value),
      date: document.getElementById('expense-date').value,
      category: document.getElementById('expense-category').value || null,
      status: document.getElementById('expense-status').value
    };

    try {
      loading.show('Salvando despesa...');
      
      if (id) {
        await api.put(`/api/expenses/${id}`, data);
      } else {
        await api.post('/api/expenses', data);
      }

      await this.loadExpenses();
      await this.render();
      dialog.show('Despesa salva com sucesso!', 'alert');
    } catch (error) {
      console.error('Error saving expense:', error);
      dialog.show('Erro ao salvar despesa: ' + error.message, 'alert');
    } finally {
      loading.hide();
    }
  }

  async editExpense(id) {
    const expense = this.expenses.find(e => e.id === id);
    if (expense) {
      this.showExpenseForm(expense);
    }
  }

  async deleteExpense(id) {
    const expense = this.expenses.find(e => e.id === id);
    if (!expense) return;

    dialog.show(
      `Deseja realmente excluir a despesa "${expense.description}"?`,
      'confirm',
      async (confirmed) => {
        if (confirmed) {
          try {
            loading.show('Excluindo despesa...');
            await api.delete(`/api/expenses/${id}`);
            await this.loadExpenses();
            await this.render();
            dialog.show('Despesa excluída com sucesso!', 'alert');
          } catch (error) {
            dialog.show('Erro ao excluir despesa: ' + error.message, 'alert');
          } finally {
            loading.hide();
          }
        }
      }
    );
  }

  destroy() {
    delete window.expensesModule;
  }
}
