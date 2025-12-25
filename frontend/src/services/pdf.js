import { api } from './api.js';

export const pdfService = {
  async generatePDF(html, options = {}) {
    try {
      const response = await api.post('/api/generate-pdf', {
        html,
        options: {
          format: options.format || 'A4',
          marginTop: options.marginTop || '20mm',
          marginRight: options.marginRight || '20mm',
          marginBottom: options.marginBottom || '20mm',
          marginLeft: options.marginLeft || '20mm',
          ...options
        }
      });

      // Response should be PDF blob
      return response;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  },

  async openPDF(html, options = {}) {
    try {
      const pdfBlob = await this.generatePDF(html, options);
      
      // Convert base64 to blob if needed
      const blob = pdfBlob instanceof Blob 
        ? pdfBlob 
        : await fetch(`data:application/pdf;base64,${pdfBlob}`).then(r => r.blob());
      
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Clean up after a delay
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error opening PDF:', error);
      throw error;
    }
  }
};



