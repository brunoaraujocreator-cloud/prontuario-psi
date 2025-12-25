export class Card {
  static render(title, content, actions = '') {
    return `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        ${title ? `<h3 class="text-lg font-semibold mb-4">${title}</h3>` : ''}
        <div class="card-content">
          ${content}
        </div>
        ${actions ? `<div class="mt-4 flex gap-2">${actions}</div>` : ''}
      </div>
    `;
  }

  static create(title, content, actions = '') {
    const card = document.createElement('div');
    card.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md p-6';
    card.innerHTML = `
      ${title ? `<h3 class="text-lg font-semibold mb-4">${title}</h3>` : ''}
      <div class="card-content">
        ${content}
      </div>
      ${actions ? `<div class="mt-4 flex gap-2">${actions}</div>` : ''}
    `;
    return card;
  }
}



