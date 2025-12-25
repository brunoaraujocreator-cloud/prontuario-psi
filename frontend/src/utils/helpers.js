// Debounce function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Generate unique ID
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Deep clone object
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Show loading indicator
export function showLoading(message = 'Carregando...') {
  const loadingEl = document.getElementById('loading');
  if (loadingEl) {
    loadingEl.textContent = message;
    loadingEl.classList.remove('hidden');
  }
}

// Hide loading indicator
export function hideLoading() {
  const loadingEl = document.getElementById('loading');
  if (loadingEl) {
    loadingEl.classList.add('hidden');
  }
}

// Format file size
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Sleep function
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get date range for current month
export function getCurrentMonthRange() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    start: firstDay.toISOString().split('T')[0],
    end: lastDay.toISOString().split('T')[0]
  };
}

// Get date range for current year
export function getCurrentYearRange() {
  const now = new Date();
  return {
    start: `${now.getFullYear()}-01-01`,
    end: `${now.getFullYear()}-12-31`
  };
}

// Get button icon from settings
export function getButtonIcon(type, settings = {}) {
  const defaultIcons = {
    edit: 'fa-pen',
    delete: 'fa-trash',
    revert: 'fa-undo',
    pay: 'fa-check-circle',
    cancel: 'fa-times'
  };
  
  if (!settings.buttonIcons) {
    return defaultIcons[type] || 'fa-circle';
  }
  return settings.buttonIcons[type] || (type === 'cancel' ? 'fa-times' : 'fa-circle');
}

// Get icon style from settings
export function getIconStyle(buttonType, settings = {}) {
  if (buttonType && settings.buttonIconColors && settings.buttonIconColors[buttonType]) {
    const color = settings.buttonIconColors[buttonType];
    const opacity = settings.buttonIconOpacities && settings.buttonIconOpacities[buttonType] !== undefined 
      ? settings.buttonIconOpacities[buttonType] : 1.0;
    return `color: ${color}; opacity: ${opacity};`;
  }
  // Fallback para configuração global
  const color = settings.iconColor || '#000000';
  const opacity = settings.iconOpacity !== undefined ? settings.iconOpacity : 1.0;
  return `color: ${color}; opacity: ${opacity};`;
}



