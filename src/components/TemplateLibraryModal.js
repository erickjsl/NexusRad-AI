// ==========================================================================
// NexusRad AI - Template Library & Search Modal Component
// ==========================================================================

import { MOCK_TEMPLATES } from '../data/mockData.js';

export function renderTemplateLibraryModal(container, callbacks) {
  let selectedCategory = 'TODAS';
  let searchTerm = '';

  const categories = ['TODAS', ...new Set(Object.values(MOCK_TEMPLATES).map(t => t.category))];

  function render() {
    const filteredTemplates = Object.entries(MOCK_TEMPLATES).filter(([key, tpl]) => {
      const matchCategory = selectedCategory === 'TODAS' || tpl.category === selectedCategory;
      const matchSearch = !searchTerm || 
        tpl.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        tpl.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        key.toLowerCase().includes(searchTerm.toLowerCase());

      return matchCategory && matchSearch;
    });

    container.innerHTML = `
      <div class="modal-backdrop open" id="templateModalBackdrop">
        <div class="modal-card" style="max-width: 720px; width: 90%; max-height: 85vh; display: flex; flex-direction: column;">
          
          <!-- Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem;">
            <h2 style="font-size: 1.1rem; font-weight: 700; color: var(--primary-cyan); display: flex; align-items: center; gap: 0.5rem;">
              <i data-lucide="file-check-2"></i>
              Biblioteca Completa de Máscaras e Laudos do Brasil
            </h2>
            <button class="btn-icon" id="btnCloseTemplateModal" style="width: 28px; height: 28px;">
              <i data-lucide="x" style="width: 16px; height: 16px;"></i>
            </button>
          </div>

          <!-- Search & Filter Controls -->
          <div style="display: flex; gap: 0.75rem; padding: 1rem 0; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 240px; position: relative;">
              <input type="text" id="templateSearchInput" class="form-select" placeholder="🔍 Buscar modelo (ex: Obstétrico, TI-RADS, Ombro, Doppler...)" value="${searchTerm}" style="font-size: 0.85rem; width: 100%;">
            </div>

            <select id="categoryFilterSelect" class="form-select" style="font-size: 0.85rem; width: auto; max-width: 220px;">
              ${categories.map(c => `
                <option value="${c}" ${c === selectedCategory ? 'selected' : ''}>
                  ${c === 'TODAS' ? 'Todas as Categorias' : c}
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Template Cards List -->
          <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem; padding-right: 0.25rem;">
            ${filteredTemplates.length === 0 ? `
              <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                Nenhum modelo encontrado para a busca "${searchTerm}".
              </div>
            ` : filteredTemplates.map(([key, tpl]) => `
              <div class="glass-card" style="padding: 1rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; border-color: var(--border-light); hover: border-color: var(--primary-cyan);">
                <div>
                  <div style="font-size: 0.9rem; font-weight: 700; color: #FFF;">${tpl.name}</div>
                  <div style="display: flex; gap: 0.5rem; margin-top: 0.25rem;">
                    <span style="font-size: 0.7rem; background: var(--primary-cyan-soft); color: var(--primary-cyan); padding: 2px 6px; border-radius: 4px;">
                      ${tpl.category}
                    </span>
                    <span style="font-size: 0.7rem; background: rgba(255,255,255,0.05); color: var(--text-muted); padding: 2px 6px; border-radius: 4px;">
                      ${tpl.modality}
                    </span>
                  </div>
                </div>

                <button class="btn-primary btn-insert-template" data-key="${key}" style="font-size: 0.75rem; padding: 0.4rem 0.85rem; white-space: nowrap;">
                  <span>Inserir no Laudo</span>
                </button>
              </div>
            `).join('')}
          </div>

        </div>
      </div>
    `;

    const backdrop = container.querySelector('#templateModalBackdrop');
    const closeModal = () => backdrop.remove();

    container.querySelector('#btnCloseTemplateModal').addEventListener('click', closeModal);

    container.querySelector('#templateSearchInput').addEventListener('input', (e) => {
      searchTerm = e.target.value;
      render();
      container.querySelector('#templateSearchInput').focus();
    });

    container.querySelector('#categoryFilterSelect').addEventListener('change', (e) => {
      selectedCategory = e.target.value;
      render();
    });

    container.querySelectorAll('.btn-insert-template').forEach(btn => {
      btn.addEventListener('click', () => {
        const tplKey = btn.dataset.key;
        const selectedTpl = MOCK_TEMPLATES[tplKey];
        if (selectedTpl && callbacks.onSelectTemplate) {
          callbacks.onSelectTemplate(selectedTpl);
        }
        closeModal();
      });
    });
  }

  render();
}
