import { api } from '../../services/api.js';
import { loading } from '../../components/Loading.js';
import { dialog } from '../../components/Dialog.js';
import { pdfService } from '../../services/pdf.js';
import { formatDate } from '../../utils/formatters.js';

export class ReportsModule {
  constructor() {
    this.container = null;
    this.reports = [];
    this.templates = {};
    this.activeType = 'receipt'; // 'receipt', 'followUp', 'demonstrativo'
    this.editor = null;
  }

  async init() {
    this.container = document.getElementById('app-container') || document.getElementById('app');
    await this.loadData();
    await this.render();
  }

  async loadData() {
    try {
      loading.show('Carregando relatórios...');
      const [reports, settings] = await Promise.all([
        api.get('/api/reports').catch(() => []),
        api.get('/api/settings')
      ]);

      this.reports = reports;
      this.templates = settings.reportTemplates || {
        receipt: 'Recibo de Pagamento...',
        followUp: 'Relatório de Acompanhamento...',
        demonstrativo: 'Demonstrativo Anual...'
      };
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      loading.hide();
    }
  }

  async render() {
    this.container.innerHTML = `
      <div class="p-6 fade-in">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold flex items-center gap-2">
            <i class="fa-solid fa-file-contract text-[var(--color-primary)]"></i> Gerador de Documentos
          </h2>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Editor Section -->
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div class="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/20">
                <div class="flex flex-wrap gap-2">
                  <button onclick="window.reportsModule.setType('receipt')" class="px-4 py-2 rounded-lg font-bold text-sm transition-colors ${this.activeType === 'receipt' ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600'}">Recibo Fiscal</button>
                  <button onclick="window.reportsModule.setType('followUp')" class="px-4 py-2 rounded-lg font-bold text-sm transition-colors ${this.activeType === 'followUp' ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600'}">Acompanhamento</button>
                  <button onclick="window.reportsModule.setType('demonstrativo')" class="px-4 py-2 rounded-lg font-bold text-sm transition-colors ${this.activeType === 'demonstrativo' ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600'}">Demonstrativo</button>
                </div>
              </div>
              
              <div class="p-6">
                <div id="editor-toolbar" class="mb-4"></div>
                <div id="report-editor" class="min-h-[400px] border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-900 text-black dark:text-white" contenteditable="true">
                  ${this.templates[this.activeType] || ''}
                </div>
                
                <div class="mt-6 flex gap-3">
                  <button onclick="window.reportsModule.generatePDF()" class="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 flex-1 flex items-center justify-center gap-2">
                    <i class="fa-solid fa-file-pdf"></i> Gerar PDF e Abrir
                  </button>
                  <button onclick="window.reportsModule.saveReport()" class="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 flex-1 flex items-center justify-center gap-2">
                    <i class="fa-solid fa-save"></i> Salvar no Histórico
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- History Section -->
          <div class="space-y-6">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col max-h-[calc(100vh-120px)]">
              <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
                <i class="fa-solid fa-history text-[var(--color-primary)]"></i> Documentos Recentes
              </h3>
              <div class="flex-1 overflow-y-auto space-y-3 pr-2">
                ${this.renderHistoryList()}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    window.reportsModule = this;
  }

  renderHistoryList() {
    if (this.reports.length === 0) return '<p class="text-gray-400 text-center py-8">Nenhum documento salvo.</p>';

    return this.reports.map(r => `
      <div class="p-3 border border-gray-100 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
        <div class="flex justify-between items-start">
          <div>
            <p class="font-bold text-sm">${r.document_number || 'S/N'}</p>
            <p class="text-[10px] uppercase font-bold text-gray-500">${r.report_type}</p>
            <p class="text-[10px] text-gray-400">${formatDate(r.created_at)}</p>
          </div>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onclick="window.reportsModule.viewReport('${r.id}')" class="text-blue-500 p-1"><i class="fa-solid fa-eye"></i></button>
            <button onclick="window.reportsModule.deleteReport('${r.id}')" class="text-red-500 p-1"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      </div>
    `).join('');
  }

  setType(type) {
    this.activeType = type;
    const editor = document.getElementById('report-editor');
    if (editor) editor.innerHTML = this.templates[type] || '';
    this.render();
  }

  async generatePDF() {
    const content = document.getElementById('report-editor').innerHTML;
    const fullHTML = `
      <html>
        <head>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Inter', sans-serif; font-size: 12pt; line-height: 1.6; color: #000; }
            .variable { font-weight: bold; color: #3b82f6; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `;

    try {
      loading.show('Gerando PDF...');
      await pdfService.openPDF(fullHTML);
    } catch (error) {
      dialog.show('Erro ao gerar PDF.', 'alert');
    } finally {
      loading.hide();
    }
  }

  async saveReport() {
    const content = document.getElementById('report-editor').innerHTML;
    const data = {
      report_type: this.activeType,
      content: content,
      report_date: new Date().toISOString().split('T')[0],
      status: 'Vigente'
    };

    try {
      loading.show('Salvando documento...');
      await api.post('/api/reports', data);
      await this.loadData();
      this.render();
      dialog.show('Documento salvo com sucesso!', 'alert');
    } catch (error) {
      dialog.show('Erro ao salvar documento.', 'alert');
    } finally {
      loading.hide();
    }
  }

  async deleteReport(id) {
    dialog.show('Deseja excluir este documento?', 'confirm', async (yes) => {
      if (yes) {
        try {
          loading.show('Excluindo...');
          await api.delete(`/api/reports/${id}`);
          await this.loadData();
          this.render();
        } catch (error) {
          dialog.show('Erro ao excluir.', 'alert');
        } finally {
          loading.hide();
        }
      }
    });
  }

  destroy() {
    delete window.reportsModule;
  }
}
