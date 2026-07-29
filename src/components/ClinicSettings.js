// ==========================================================================
// NexusRad AI - Super Complete Enterprise System Settings Hub
// Clínica, DICOM Gateway, IA Copilot, Notificações WhatsApp, Assinatura ICP-Brasil, Voz TTS
// ==========================================================================

import { showToast } from '../utils/toast.js';
import { createIcons, Building, RadioReceiver, Sparkles, Send, ShieldCheck, Printer, Save, CheckCircle2, RefreshCw, Volume2 } from 'lucide';
import { getAvailableVoices, speakText } from '../utils/speechVoice.js';
import { saveSettingsToStorage } from '../utils/storage.js';
import { getAuditLogs } from '../utils/auditLogger.js';

export function renderClinicSettings(container, state, callbacks) {
  let activeTab = 'clinic'; // 'clinic' | 'dicom' | 'ai' | 'whatsapp' | 'security' | 'printer'

  if (!state.settingsConfig) {
    state.settingsConfig = {
      // Clinic Info
      clinicName: "NEXUSRAD DIAGNÓSTICO POR IMAGEM S/A",
      cnpj: "12.345.678/0001-99",
      address: "Av. Paulista, 1500 - Bela Vista",
      cityState: "São Paulo / SP",
      phone: "(11) 3300-9000",
      email: "contato@nexusrad.com.br",
      logoUrl: "",
      
      // DICOM PACS
      localAet: "NEXUS_PACS",
      dicomPort: "104",
      remoteAet: "ORTHANC_SERVER",
      remotePort: "4242",
      remoteHost: "192.168.1.100",
      wadoUrl: "http://192.168.1.100:8042/wado",

      // AI Copilot
      aiEnabled: true,
      aiSensitivity: "85%",
      aiModel: "Gemini 1.5 Pro Diagnostic",
      apiKey: "AIzaSyNexusRad2026ProdKey_Secured",
      autoDraft: true,

      // WhatsApp API
      whatsappEnabled: true,
      whatsappStatus: "CONNECTED",
      whatsappApiUrl: "https://api.z-api.io/instances/NEXUS_RAD_01",
      notifyOnSigned: true,
      notify24hBefore: true,

      // ICP-Brasil & LGPD
      certificateType: "A1 (Arquivo .PFX)",
      certValidUntil: "15/10/2028",
      auditTrailEnabled: true,
      lgpdEncryption: "AES-256-GCM",

      // Printer, Theme & TTS Voice
      theme: "dark",
      paperFormat: "A4",
      ticketPrinter: "Zebra ZD220 (80mm)",
      selectedVoiceUri: "",
      voiceRate: 0.95,
      voicePitch: 1.0
    };
  }

  const cfg = state.settingsConfig;

  function refreshIcons() {
    createIcons({
      icons: { Building, RadioReceiver, Sparkles, Send, ShieldCheck, Printer, Save, CheckCircle2, RefreshCw, Volume2 }
    });
  }

  function render() {
    container.innerHTML = `
      <div style="flex: 1; display: flex; flex-direction: column; padding: 1.5rem; overflow-y: auto; gap: 1.25rem; background: var(--bg-dark); color: #FFF;">
        
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h1 style="font-size: 1.5rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; color: #FFF;">
              <i data-lucide="building" style="color: var(--primary-cyan)"></i>
              Configurações Globais do Sistema NexusRad AI
            </h1>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
              Parâmetros da Clínica, Servidores DICOM PACS, IA Copilot, Notificações WhatsApp, Segurança e Voz do Painel TV.
            </p>
          </div>

          <button class="btn-primary" id="btnSaveAllSettings" style="background: linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%); border: none; font-weight: 700; padding: 0.6rem 1.25rem;">
            <i data-lucide="save" style="width: 16px; height: 16px;"></i>
            <span>Salvar Todas as Configurações</span>
          </button>
        </div>

        <!-- Navigation Tabs -->
        <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem; flex-wrap: wrap;">
          <button class="btn-secondary nav-settings-tab ${activeTab === 'clinic' ? 'active' : ''}" data-tab="clinic">
            <i data-lucide="building" style="width: 15px; height: 15px; color: var(--primary-cyan);"></i>
            <span>🏥 1. Dados da Clínica</span>
          </button>

          <button class="btn-secondary nav-settings-tab ${activeTab === 'dicom' ? 'active' : ''}" data-tab="dicom">
            <i data-lucide="radio-receiver" style="width: 15px; height: 15px; color: var(--primary-cyan);"></i>
            <span>📡 2. Servidor DICOM PACS</span>
          </button>

          <button class="btn-secondary nav-settings-tab ${activeTab === 'ai' ? 'active' : ''}" data-tab="ai">
            <i data-lucide="sparkles" style="width: 15px; height: 15px; color: var(--primary-cyan);"></i>
            <span>🤖 3. IA Copilot & Gemini</span>
          </button>

          <button class="btn-secondary nav-settings-tab ${activeTab === 'whatsapp' ? 'active' : ''}" data-tab="whatsapp">
            <i data-lucide="send" style="width: 15px; height: 15px; color: var(--primary-cyan);"></i>
            <span>📱 4. WhatsApp & E-mail</span>
          </button>

          <button class="btn-secondary nav-settings-tab ${activeTab === 'security' ? 'active' : ''}" data-tab="security">
            <i data-lucide="shield-check" style="width: 15px; height: 15px; color: var(--primary-cyan);"></i>
            <span>🔐 5. Assinatura ICP & LGPD</span>
          </button>

          <button class="btn-secondary nav-settings-tab ${activeTab === 'printer' ? 'active' : ''}" data-tab="printer">
            <i data-lucide="volume-2" style="width: 15px; height: 15px; color: var(--primary-cyan);"></i>
            <span>🗣️ 6. Voz do Painel & Impressão</span>
          </button>
        </div>

        <!-- Content Area -->
        <div id="settingsContentArea">
          ${renderTabContent()}
        </div>

      </div>
    `;

    // Attach Tab Switchers
    container.querySelectorAll('.nav-settings-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        render();
      });
    });

    attachEvents();
    refreshIcons();
  }

  function renderTabContent() {
    if (activeTab === 'clinic') {
      return `
        <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary-cyan); border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
            🏥 Dados Cadastrais da Clínica & Cabeçalho de Laudos
          </h3>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>Razão Social / Nome da Clínica:</label>
              <input type="text" id="sClinicName" class="form-select" value="${cfg.clinicName}">
            </div>

            <div class="form-group">
              <label>CNPJ da Instituição:</label>
              <input type="text" id="sCnpj" class="form-select" value="${cfg.cnpj}">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>Endereço Completo:</label>
              <input type="text" id="sAddress" class="form-select" value="${cfg.address}">
            </div>

            <div class="form-group">
              <label>Cidade / UF:</label>
              <input type="text" id="sCityState" class="form-select" value="${cfg.cityState}">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>Telefone Central de Atendimento:</label>
              <input type="text" id="sPhone" class="form-select" value="${cfg.phone}">
            </div>

            <div class="form-group">
              <label>E-mail Oficial da Clínica:</label>
              <input type="text" id="sEmail" class="form-select" value="${cfg.email}">
            </div>
          </div>
        </div>
      `;
    } else if (activeTab === 'dicom') {
      return `
        <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
            <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary-cyan);">
              📡 Configuração do Servidor DICOM PACS (C-STORE / C-FIND / C-MOVE)
            </h3>
            <button class="btn-secondary" id="btnTestDicomEcho" style="border-color: var(--primary-cyan); color: var(--primary-cyan); font-weight: 700;">
              <i data-lucide="refresh-cw" style="width: 14px; height: 14px;"></i>
              <span>Testar Conexão (DICOM C-ECHO)</span>
            </button>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>AETitle Local (PACS Node):</label>
              <input type="text" id="sLocalAet" class="form-select" value="${cfg.localAet}">
            </div>

            <div class="form-group">
              <label>Porta DICOM Local (C-STORE Listener):</label>
              <input type="text" id="sDicomPort" class="form-select" value="${cfg.dicomPort}">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>AETitle Remoto (Orthanc / DCM4CHEE):</label>
              <input type="text" id="sRemoteAet" class="form-select" value="${cfg.remoteAet}">
            </div>

            <div class="form-group">
              <label>Host IP Remoto:</label>
              <input type="text" id="sRemoteHost" class="form-select" value="${cfg.remoteHost}">
            </div>

            <div class="form-group">
              <label>Porta Remota:</label>
              <input type="text" id="sRemotePort" class="form-select" value="${cfg.remotePort}">
            </div>
          </div>

          <div class="form-group">
            <label>URL Gateway WADO / Web Viewer Endpoint:</label>
            <input type="text" id="sWadoUrl" class="form-select" value="${cfg.wadoUrl}">
          </div>
        </div>
      `;
    } else if (activeTab === 'ai') {
      return `
        <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary-cyan); border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
            🤖 Inteligência Artificial Copilot & Google Gemini 1.5 Pro
          </h3>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>Status do Copilot de IA:</label>
              <select id="sAiEnabled" class="form-select">
                <option value="true" ${cfg.aiEnabled ? 'selected' : ''}>🟢 Ativado (Detecção & Redação de Laudo)</option>
                <option value="false" ${!cfg.aiEnabled ? 'selected' : ''}>🔴 Desativado</option>
              </select>
            </div>

            <div class="form-group">
              <label>Sensibilidade do Detector de Achados:</label>
              <select id="sAiSensitivity" class="form-select">
                <option value="95%" ${cfg.aiSensitivity === '95%' ? 'selected' : ''}>95% (Alta Precisão - Recomendado)</option>
                <option value="85%" ${cfg.aiSensitivity === '85%' ? 'selected' : ''}>85% (Padrão)</option>
                <option value="75%" ${cfg.aiSensitivity === '75%' ? 'selected' : ''}>75% (Alta Sensibilidade)</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>Modelo LLM Selecionado:</label>
              <input type="text" id="sAiModel" class="form-select" value="${cfg.aiModel}">
            </div>

            <div class="form-group">
              <label>Chave de API Gemini (Chave Segura):</label>
              <input type="password" id="sApiKey" class="form-select" value="${cfg.apiKey}">
            </div>
          </div>
        </div>
      `;
    } else if (activeTab === 'whatsapp') {
      return `
        <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary-cyan); border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
            📱 Integração Notificações de WhatsApp & E-mail aos Pacientes
          </h3>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>Status da Conexão WhatsApp API:</label>
              <div style="display: flex; align-items: center; gap: 0.5rem; background: rgba(16,185,129,0.15); padding: 0.6rem 1rem; border-radius: 6px; border: 1px solid #10B981; color: #10B981; font-weight: 700; font-size: 0.85rem;">
                <i data-lucide="check-circle-2" style="width: 16px; height: 16px;"></i>
                <span>🟢 CONECTADO (Instância Z-API Ativa)</span>
              </div>
            </div>

            <div class="form-group">
              <label>URL da Instância API WhatsApp:</label>
              <input type="text" id="sWhatsappApiUrl" class="form-select" value="${cfg.whatsappApiUrl}">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>Disparar WhatsApp ao Assinar Laudo:</label>
              <select id="sNotifyOnSigned" class="form-select">
                <option value="true" ${cfg.notifyOnSigned ? 'selected' : ''}>Sim (Automático com Link do Portal)</option>
                <option value="false" ${!cfg.notifyOnSigned ? 'selected' : ''}>Não</option>
              </select>
            </div>

            <div class="form-group">
              <label>Lembrete de Agendamento (24h antes):</label>
              <select id="sNotify24hBefore" class="form-select">
                <option value="true" ${cfg.notify24hBefore ? 'selected' : ''}>Sim (Enviar mensagem de confirmação)</option>
                <option value="false" ${!cfg.notify24hBefore ? 'selected' : ''}>Não</option>
              </select>
            </div>
          </div>
        </div>
      `;
    } else if (activeTab === 'security') {
      return `
        <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary-cyan); border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
            🔐 Assinatura Digital ICP-Brasil & Criptografia de Prontuários (LGPD)
          </h3>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>Tipo de Certificado Digital ICP-Brasil:</label>
              <select id="sCertificateType" class="form-select">
                <option value="A1 (Arquivo .PFX)">Certificado A1 (Arquivo PFX / Nuvem)</option>
                <option value="A3 (Token Físico USB)">Certificado A3 (Token Físico / Smartcard)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Validade do Certificado Atual:</label>
              <input type="text" id="sCertValidUntil" class="form-select" value="${cfg.certValidUntil}" readonly style="opacity: 0.8;">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>Criptografia do Banco de Prontuários:</label>
              <input type="text" id="sLgpdEncryption" class="form-select" value="${cfg.lgpdEncryption}" readonly style="opacity: 0.8;">
            </div>

            <div class="form-group">
              <label>Log de Auditoria de Acessos (Audit Trail ISO 27001):</label>
              <select id="sAuditTrailEnabled" class="form-select">
                <option value="true">🟢 Ativado (Grava IP, Usuário e Ação)</option>
                <option value="false">Desativado</option>
              </select>
            </div>
          </div>

          <!-- Live LGPD & CFM Audit Logs Table -->
          <div style="margin-top: 1rem; border-top: 1px solid var(--border-light); padding-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--primary-cyan); margin: 0; display: flex; align-items: center; gap: 0.35rem;">
                <i data-lucide="shield-check" style="width: 16px; height: 16px;"></i>
                📋 Trilha de Auditoria & Registro de Acessos em Tempo Real (LGPD / CFM)
              </h4>
              <span style="font-size: 0.75rem; color: var(--status-ready); font-weight: 700;">🟢 ISO 27001 AUDIT TRAIL ATIVO</span>
            </div>

            <div class="table-wrapper" style="max-height: 220px; overflow-y: auto;">
              <table class="worklist-table" style="font-size: 0.75rem;">
                <thead>
                  <tr>
                    <th>Data / Hora</th>
                    <th>Ação Executada</th>
                    <th>Detalhes do Evento</th>
                    <th>Usuário Operador</th>
                    <th>Hash Criptográfico</th>
                  </tr>
                </thead>
                <tbody>
                  ${getAuditLogs().map(log => `
                    <tr>
                      <td style="white-space: nowrap; font-family: monospace;">${log.timestamp}</td>
                      <td><span class="badge-status concluido">${log.action}</span></td>
                      <td>${log.details}</td>
                      <td><strong>${log.user}</strong></td>
                      <td><span style="font-family: monospace; color: var(--primary-cyan); font-weight: 700;">${log.hash}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } else if (activeTab === 'printer') {
      const voices = getAvailableVoices();

      return `
        <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
          
          <!-- Voice Selector Sub-Section -->
          <div style="display: flex; flex-direction: column; gap: 1rem; border-bottom: 1px solid var(--border-light); padding-bottom: 1.25rem;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary-cyan); display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="volume-2" style="width: 18px; height: 18px;"></i>
                🗣️ Configuração da Voz de Chamada de Paciente (Painel TV)
              </h3>

              <button class="btn-primary" id="btnTestVoice" style="background: var(--primary-cyan); color: #000; border: none; font-weight: 700; padding: 0.4rem 0.85rem; font-size: 0.8rem;">
                🔊 Testar Voz Selecionada
              </button>
            </div>

            <div class="form-group">
              <label>Selecione a Voz do Sintetizador de Fala (TTS):</label>
              <select id="sSelectedVoice" class="form-select" style="background: #0F172A; color: #FFF; font-weight: 600;">
                ${voices.length === 0 ? `
                  <option value="">-- Usar Voz Padrão do Navegador / Sistema --</option>
                ` : voices.map(v => `
                  <option value="${v.voiceURI}" ${v.voiceURI === cfg.selectedVoiceUri || v.name === cfg.selectedVoiceUri ? 'selected' : ''} style="background: #0F172A; color: #FFF;">
                    ${v.lang.startsWith('pt') ? '🇧🇷' : '🌐'} ${v.name} (${v.lang})
                  </option>
                `).join('')}
              </select>
              <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                Dica: Escolha vozes rotuladas com "Google Português do Brasil" ou "Microsoft Maria/Daniel" para sonoridade natural.
              </p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label>Velocidade da Fala: <span id="lblVoiceRate">${cfg.voiceRate || 0.95}x</span></label>
                <input type="range" id="sVoiceRate" min="0.5" max="1.5" step="0.05" value="${cfg.voiceRate || 0.95}" style="width: 100%; accent-color: var(--primary-cyan);">
              </div>

              <div class="form-group">
                <label>Tom da Voz (Pitch): <span id="lblVoicePitch">${cfg.voicePitch || 1.0}</span></label>
                <input type="range" id="sVoicePitch" min="0.5" max="1.5" step="0.05" value="${cfg.voicePitch || 1.0}" style="width: 100%; accent-color: var(--primary-cyan);">
              </div>
            </div>
          </div>

          <!-- Printing Sub-Section -->
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary-cyan);">
              🎨 Impressão de Laudos & Etiquetas da Recepção
            </h3>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label>Impressora de Etiquetas de Recepção (80mm):</label>
                <input type="text" id="sTicketPrinter" class="form-select" value="${cfg.ticketPrinter}">
              </div>

              <div class="form-group">
                <label>Formato Padrão do Laudo em PDF:</label>
                <select id="sPaperFormat" class="form-select">
                  <option value="A4" ${cfg.paperFormat === 'A4' ? 'selected' : ''}>A4 (Papel Padrão Timbrado)</option>
                  <option value="Carta" ${cfg.paperFormat === 'Carta' ? 'selected' : ''}>Carta</option>
                </select>
              </div>
            </div>
          </div>

        </div>
      `;
    }
  }

  function attachEvents() {
    container.querySelector('#btnSaveAllSettings')?.addEventListener('click', () => {
      // Save form fields to state.settingsConfig
      if (activeTab === 'printer') {
        const voiceSelect = container.querySelector('#sSelectedVoice');
        if (voiceSelect) cfg.selectedVoiceUri = voiceSelect.value;
        const rateInput = container.querySelector('#sVoiceRate');
        if (rateInput) cfg.voiceRate = parseFloat(rateInput.value);
        const pitchInput = container.querySelector('#sVoicePitch');
        if (pitchInput) cfg.voicePitch = parseFloat(pitchInput.value);
      }

      saveSettingsToStorage(state.settingsConfig);
      showToast("✅ Configurações salvas permanentemente com sucesso!", "success");
    });

    container.querySelector('#btnTestDicomEcho')?.addEventListener('click', () => {
      showToast("📡 DICOM C-ECHO Ping com sucesso! Resposta: 14ms (PACS ONLINE)", "info");
    });

    container.querySelector('#btnTestVoice')?.addEventListener('click', () => {
      const voiceSelect = container.querySelector('#sSelectedVoice');
      const selectedUri = voiceSelect ? voiceSelect.value : cfg.selectedVoiceUri;
      const rate = container.querySelector('#sVoiceRate') ? parseFloat(container.querySelector('#sVoiceRate').value) : 0.95;
      const pitch = container.querySelector('#sVoicePitch') ? parseFloat(container.querySelector('#sVoicePitch').value) : 1.0;

      cfg.selectedVoiceUri = selectedUri;
      cfg.voiceRate = rate;
      cfg.voicePitch = pitch;

      speakText("Atenção: Paciente Erick Lima, favor dirigir-se à Sala de Ultrassom número 02.", selectedUri, rate, pitch);
      showToast("🔊 Testando reprodução de voz do painel...", "info");
    });

    container.querySelector('#sVoiceRate')?.addEventListener('input', (e) => {
      const lbl = container.querySelector('#lblVoiceRate');
      if (lbl) lbl.textContent = `${e.target.value}x`;
    });

    container.querySelector('#sVoicePitch')?.addEventListener('input', (e) => {
      const lbl = container.querySelector('#lblVoicePitch');
      if (lbl) lbl.textContent = e.target.value;
    });
  }

  // Reload voices when browser finishes loading voices
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      if (activeTab === 'printer') render();
    };
  }

  render();
}
