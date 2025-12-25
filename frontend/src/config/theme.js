// Theme configuration and initialization

export function initTheme() {
  // Check for saved theme preference or default to light mode
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);
}

export function applyTheme(theme) {
  const html = document.documentElement;
  
  if (theme === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
  
  localStorage.setItem('theme', theme);
}

export function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  
  // Force update all components that might need theme refresh
  const event = new CustomEvent('themechange', { detail: { theme: newTheme } });
  document.dispatchEvent(event);
}

export function applyPrimaryColor(color) {
  document.documentElement.style.setProperty('--color-primary', color);
  localStorage.setItem('primaryColor', color);
}

export function getPrimaryColor() {
  return localStorage.getItem('primaryColor') || '#3b82f6';
}



