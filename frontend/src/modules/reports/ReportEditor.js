import Quill from 'quill';
import 'quill/dist/quill.snow.css';

export class ReportEditor {
  constructor(container) {
    this.container = container;
    this.quill = null;
  }

  init() {
    if (!this.container) return;

    // Create editor container
    this.container.innerHTML = '<div id="quill-editor"></div>';
    const editorEl = document.getElementById('quill-editor');

    // Initialize Quill
    this.quill = new Quill(editorEl, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'align': [] }],
          ['link', 'image'],
          ['clean']
        ]
      },
      placeholder: 'Digite o conteúdo do relatório...'
    });

    // Load saved content if any
    const savedContent = localStorage.getItem('report-draft');
    if (savedContent) {
      this.quill.root.innerHTML = savedContent;
    }

    // Auto-save
    this.quill.on('text-change', () => {
      localStorage.setItem('report-draft', this.quill.root.innerHTML);
    });
  }

  getHTML() {
    return this.quill ? this.quill.root.innerHTML : '';
  }

  setHTML(html) {
    if (this.quill) {
      this.quill.root.innerHTML = html;
    }
  }

  destroy() {
    if (this.quill) {
      this.quill = null;
    }
  }
}



