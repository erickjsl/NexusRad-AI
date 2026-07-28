// ==========================================================================
// NexusRad AI - Template Library Search & Selector Modal
// High-Visibility Close Button (✕) & Automatic Icon Render
// ==========================================================================

import { MOCK_TEMPLATES } from '../data/mockData.js';
import { createIcons, X, Search, FileText } from 'lucide';

export function renderTemplateLibraryModal(container, callbacks) {
  let searchCategory = 'TODAS';
  let searchTerm = '';

  const templates = MOCK_TEMPLATES || {};
  const templateArray = Object.entries(templates).map(([key, tpl]) => ({
    key,
    ...tpl
  }));

  const categories = ['TODAS', ...new Set(templateArray.map(t => t.category))];

  function render() {
    const filtered = templateArray.filter(t => {
      const matchCat = searchCategory === 'TODAS' || t.category === searchCategory;
      const matchTerm = !searchTerm || t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.impression.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchTerm;
    });

    container.innerHTML = `
      <div class="modal-backdrop open" id="templateModalBackdrop">
        <div class="modal-card" style="max-width: 750px; width: 92%; display: flex; flex-direction: column; gap: 1rem; max-height: 85vh; background: #0A0F1D; border: 1px solid var(--primary-cyan); box-shadow: 0 0 30px rgba(0, 229, 255, 0.25);">
          
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem;">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--primary-cyan);">
                📚 Biblioteca de Máscaras & Modelos de Laudo (${templateArray.length})
              </h3>
              <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
                Pesquise e selecione um modelo de laudo pré-formatado para importar na estação de laudagem.
              </p>
            </div>

            <!-- Crisp Visible Close Button (✕) -->
            <button class="btn-icon modal-close-btn" id="btnCloseTemplateModal" title="Fechar Janela" style="background: rgba(255, 255, 255, 0.08); border: 1px solid var(--border-light); color: #FFF; font-size: 1.2rem; font-weight: 700; width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;">
              ✕
            </button>
          </div>

          <!-- Search & Filter Controls -->
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <div class="search-box" style="flex: 1; min-width: 200px;">
              <i data-lucide="search" class="search-icon"></i>
              <input type="text" id="tplSearchInput" placeholder="Pesquisar por título ou termos do laudo..." value="${searchTerm}">
            </div>

            <select id="tplCategorySelect" class="form-select" style="width: auto; min-width: 180px;">
              ${categories.map(c => `
                <option value="${c}" ${c === searchCategory ? 'selected' : ''}>${c}</option>
              `).join('')}
            </select>
          </div>

          <!-- Template Cards List -->
          <div style="flex: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 0.75rem; padding-right: 0.25rem;">
            ${filtered.length === 0 ? `
              <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 2rem;">
                Nenhum modelo de laudo encontrado com os filtros selecionados.
              </div>
            ` : filtered.map(t => `
              <div class="glass-card tpl-card" data-key="${t.key}" style="padding: 1rem; border-radius: 8px; cursor: pointer; display: flex; flex-direction: column; gap: 0.5rem; transition: all 0.2s; border: 1px solid var(--border-light);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <strong style="font-size: 0.9rem; color: #FFF;">${t.name}</strong>
                  <span class="badge-modality ${t.modality}">${t.modality}</span>
                </div>

                <span style="font-size: 0.72rem; color: var(--primary-cyan); font-weight: 600;">${t.category}</span>
                <p style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                  ${t.impression}
                </p>

                <button class="btn-secondary" style="font-size: 0.75rem; padding: 0.35rem; font-weight: 700; margin-top: auto; border-color: var(--primary-cyan); color: var(--primary-cyan);">
                  Importar esta Máscara ➔
                </button>
              </div>
            `).join('')}
          </div>

        </div>
      </div>
    `;

    container.querySelector('#btnCloseTemplateModal')?.addEventListener('click', closeModal);

    const searchInput = container.querySelector('#tplSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        render();
      });
    }

    const catSelect = container.querySelector('#tplCategorySelect');
    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        searchCategory = e.target.value;
        render();
      });
    }

    container.querySelectorAll('.tpl-card').forEach(card => {
      card.addEventListener('click', () => {
        const selectedKey = card.dataset.key;
        const selectedTpl = templates[selectedKey];
        if (selectedTpl && callbacks.onSelectTemplate) {
          callbacks.onSelectTemplate(selectedTpl);
        }
        closeModal();
      });
    });

    createIcons({
      icons: { X, Search, FileText }
    });
  }

  function closeModal() {
    const backdrop = container.querySelector('#templateModalBackdrop');
    if (backdrop) backdrop.remove();
  }

  render();
}
