// ==========================================================================
// NexusRad AI - Login & User Authentication System with Role-Based Access Control (RBAC)
// ==========================================================================

export const DEMO_USERS = [
  {
    username: "dr_carlos",
    name: "Dr. Carlos Roberto de Mendonça",
    email: "dr.radiologista@nexusrad.com.br",
    role: "Médico Radiologista (Laudador)",
    crm: "CRM/SP 142.890 • RQE 88.102",
    badge: "LAUDADOR MASTER",
    avatar: "👨‍⚕️",
    allowedViews: ['dashboard', 'worklist', 'viewer', 'report', 'split', 'record', 'his', 'crud', 'billing', 'settings']
  },
  {
    username: "dra_patricia",
    name: "Dra. Patricia Lima",
    email: "dra.patricia@nexusrad.com.br",
    role: "Médica Radiologista / Ultrassonografista",
    crm: "CRM/SP 189.430 • RQE 90.112",
    badge: "ULTRASSONOGRAFISTA",
    avatar: "👩‍⚕️",
    allowedViews: ['worklist', 'viewer', 'report', 'split', 'his', 'record']
  },
  {
    username: "recepcao",
    name: "Patrícia Souza (Recepção)",
    email: "recepcao@nexusrad.com.br",
    role: "Recepção & Atendimento ao Paciente",
    crm: "MATRÍCULA 8804",
    badge: "RECEPÇÃO",
    avatar: "👩‍💼",
    allowedViews: ['appointments', 'worklist', 'record', 'portal', 'crud', 'his']
  },
  {
    username: "gestor",
    name: "Roberto Mendonça (Gestor)",
    email: "gestao@nexusrad.com.br",
    role: "Gestor da Clínica & Faturamento TUSS",
    crm: "CRA/SP 44091",
    badge: "GESTOR & FATURAMENTO",
    avatar: "👨‍💼",
    allowedViews: ['dashboard', 'billing', 'crud', 'settings', 'his', 'worklist', 'viewer', 'report']
  }
];

export function renderLoginScreen(container, onLoginSuccess) {
  container.innerHTML = `
    <div style="position: fixed; inset: 0; background: radial-gradient(circle at center, #0F172A 0%, #070A11 100%); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 1.5rem;">
      <div class="glass-card" style="width: 100%; max-width: 440px; padding: 2.25rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-glass); display: flex; flex-direction: column; gap: 1.5rem; border: 1px solid rgba(0, 229, 255, 0.2);">
        
        <!-- Brand Header -->
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <div class="brand-icon" style="width: 52px; height: 52px; font-size: 1.5rem;">
            <i data-lucide="activity"></i>
          </div>
          <div>
            <h1 style="font-size: 1.6rem; font-weight: 700; background: linear-gradient(90deg, #FFFFFF, var(--primary-cyan)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              NexusRad <span style="color: var(--primary-cyan)">AI</span>
            </h1>
            <p style="font-size: 0.8rem; color: var(--text-muted);">Acesso Restrito por Função de Operador (RBAC)</p>
          </div>
        </div>

        <!-- Form Login -->
        <form id="loginForm" style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="form-group">
            <label style="font-size: 0.75rem; font-weight: 600;">E-mail do Operador / Função:</label>
            <div style="position: relative;">
              <i data-lucide="user" style="position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--text-muted);"></i>
              <input type="email" id="loginEmail" class="form-select" style="padding-left: 2.5rem; width: 100%;" value="dr.radiologista@nexusrad.com.br" required>
            </div>
          </div>

          <div class="form-group">
            <label style="font-size: 0.75rem; font-weight: 600;">Senha de Acesso:</label>
            <div style="position: relative;">
              <i data-lucide="lock" style="position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--text-muted);"></i>
              <input type="password" id="loginPassword" class="form-select" style="padding-left: 2.5rem; width: 100%;" value="nexus123" required>
            </div>
          </div>

          <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 0.75rem; font-size: 0.9rem; margin-top: 0.5rem;">
            <i data-lucide="log-in" style="width: 18px; height: 18px;"></i>
            <span>Entrar no Sistema</span>
          </button>
        </form>

        <!-- Quick Access Demo Users -->
        <div style="border-top: 1px solid var(--border-light); padding-top: 1rem;">
          <div style="font-size: 0.7rem; font-weight: 700; color: var(--primary-cyan); text-transform: uppercase; margin-bottom: 0.6rem; text-align: center;">
            ⚡ Selecionar Perfil para Teste de Acesso (RBAC):
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            ${DEMO_USERS.map((user, idx) => `
              <button class="btn-secondary btn-demo-user" data-index="${idx}" style="justify-content: space-between; font-size: 0.75rem; padding: 0.4rem 0.75rem;">
                <span style="display: flex; align-items: center; gap: 0.4rem;">
                  <span>${user.avatar}</span>
                  <strong>${user.name.split(' ')[0]} ${user.name.split(' ')[1] || ''}</strong>
                </span>
                <span style="font-size: 0.65rem; color: var(--primary-cyan); font-family: monospace;">${user.badge}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div style="font-size: 0.65rem; color: var(--text-muted); text-align: center;">
          Conformidade com LGPD • Resolução CFM 2.314/2022 • Control de Acesso RBAC
        </div>
      </div>
    </div>
  `;

  // Submit Login
  const form = container.querySelector('#loginForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = container.querySelector('#loginEmail').value;
    const user = DEMO_USERS.find(u => u.email === email) || DEMO_USERS[0];
    onLoginSuccess(user);
  });

  // Demo User Fill
  container.querySelectorAll('.btn-demo-user').forEach(btn => {
    btn.addEventListener('click', () => {
      const u = DEMO_USERS[parseInt(btn.dataset.index, 10)];
      if (u) {
        onLoginSuccess(u);
      }
    });
  });
}
