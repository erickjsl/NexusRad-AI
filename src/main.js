// ==========================================================================
// NexusRad AI - Complete Diagnostic Clinic System (Standard Brazilian PACS/RIS Menus)
// Benchmark: Pixeon NetPACS, Animati PACS, Carestream Vue, Soul MV RIS
// Persistent LocalStorage Storage Engine Integrated
// ==========================================================================

import './style.css';
import { createIcons, Activity, Search, ListFilter, Eye, FileText, UploadCloud, Sun, Ruler, CircleDot, ZoomIn, Move, Contrast, RotateCcw, RotateCw, Play, Pause, Sparkles, FileCheck2, Mic, Save, Printer, ShieldCheck, RadioReceiver, X, FolderOpen, Inbox, Columns, Loader, User, Lock, LogIn, LogOut, Calendar, CreditCard, Settings, UserPlus, Download, Building, Camera, Power, Video, Globe, ArrowLeft, ArrowRight, Share2, Send, Clock, Maximize2, Columns2, Keyboard, Edit, Trash2, DollarSign, LayoutDashboard, FilePlus, Triangle, ArrowUpRight, History, UserCheck, Key, BarChart2, ChevronUp, ChevronDown } from 'lucide';
import { MOCK_WORKLIST } from './data/mockData.js';
import { renderHeader } from './components/Header.js';
import { renderWorklist } from './components/Worklist.js';
import { renderDicomViewer, stopActiveVideoCapture } from './components/DicomViewer.js';
import { renderReportEditor } from './components/ReportEditor.js';
import { renderUploadModal } from './components/UploadModal.js';
import { renderLoginScreen, DEMO_USERS } from './components/LoginModal.js';
import { renderAppointments } from './components/Appointments.js';
import { renderBilling } from './components/Billing.js';
import { renderClinicSettings } from './components/ClinicSettings.js';
import { renderPatientPortalPage } from './components/PatientPortalPage.js';
import { renderCrudManagement } from './components/CrudManagement.js';
import { renderMedicalRecordPage } from './components/MedicalRecordPage.js';
import { renderDashboard } from './components/Dashboard.js';
import { loadPersistentState, saveStudiesToStorage } from './utils/storage.js';

// State
const state = {
  currentUser: DEMO_USERS[0],
  isAuthenticated: true,
  headerCollapsed: false,
  studies: [],
  filteredStudies: [],
  activeModality: 'TODOS',
  searchTerm: '',
  currentView: 'worklist',
  selectedStudyId: null,
  viewerState: {
    sliceIndex: 1,
    activeTool: 'windowing',
    windowWidth: 400,
    windowLevel: 40,
    inverted: false,
    showAiOverlay: true,
    zoom: 1,
    pan: { x: 0, y: 0 },
    measurements: []
  }
};

// Initialize App & Load Persistent Data
function init() {
  loadPersistentState(state);

  const hash = window.location.hash;
  if (hash.startsWith('#/portal/')) {
    const studyId = hash.replace('#/portal/', '');
    const found = state.studies.find(s => s.id === studyId || s.accessionNumber === studyId);
    if (found) {
      state.selectedStudyId = found.id;
      state.currentView = 'portal';
    }
  }

  const appContainer = document.querySelector('#app');

  if (!state.isAuthenticated) {
    stopActiveVideoCapture();
    renderLoginScreen(appContainer, (user) => {
      state.currentUser = user;
      state.isAuthenticated = true;
      init();
    });
    refreshIcons();
    return;
  }

  appContainer.innerHTML = `
    <div id="headerContainer"></div>
    <div class="app-body">
      <!-- Standard Brazilian PACS/RIS Sidebar Navigation (Pixeon / Animati / Soul MV Style) -->
      <nav class="sidebar-nav">
        <div class="nav-item ${state.currentView === 'dashboard' ? 'active' : ''}" id="navDashboard" title="Painel Dashboard Executivo & KPIs Radiológicos">
          <i data-lucide="layout-dashboard"></i>
        </div>
        <div class="nav-item ${state.currentView === 'worklist' ? 'active' : ''}" id="navWorklist" title="Central de Laudos & Worklist RIS (Atalho: W)">
          <i data-lucide="list-filter"></i>
        </div>
        <div class="nav-item ${state.currentView === 'appointments' ? 'active' : ''}" id="navAppointments" title="Recepção, Agendamento & Painel TV">
          <i data-lucide="calendar"></i>
        </div>
        <div class="nav-item ${state.currentView === 'viewer' ? 'active' : ''}" id="navViewer" title="Visualizador Médico Diagnóstico DICOM 2D / US (Atalho: V)">
          <i data-lucide="eye"></i>
        </div>
        <div class="nav-item ${state.currentView === 'report' ? 'active' : ''}" id="navReport" title="Estação de Laudagem Estruturada & IA Copilot (Atalho: L)">
          <i data-lucide="file-text"></i>
        </div>
        <div class="nav-item ${state.currentView === 'split' ? 'active' : ''}" id="navSplit" title="Estação 2 Monitores / Visão Dividida (Atalho: S)">
          <i data-lucide="columns-2"></i>
        </div>
        <div class="nav-item ${state.currentView === 'record' ? 'active' : ''}" id="navRecord" title="Prontuário Médico Eletrônico & Central do Médico Solicitante">
          <i data-lucide="history"></i>
        </div>
        <div class="nav-item ${state.currentView === 'portal' ? 'active' : ''}" id="navPortal" title="Portal de Entrega de Exames ao Paciente & Médico">
          <i data-lucide="globe"></i>
        </div>
        <div class="nav-item ${state.currentView === 'crud' ? 'active' : ''}" id="navCrud" title="Central de Cadastros & Tabelas do Sistema (CRUD)">
          <i data-lucide="folder-open"></i>
        </div>
        <div class="nav-item ${state.currentView === 'billing' ? 'active' : ''}" id="navBilling" title="Faturamento TUSS, Guias TISS & Convênios">
          <i data-lucide="dollar-sign"></i>
        </div>
        <div class="nav-item ${state.currentView === 'settings' ? 'active' : ''}" id="navSettings" title="Configurações do Servidor DICOM & Clínica">
          <i data-lucide="settings"></i>
        </div>
      </nav>

      <main class="workspace-content" id="workspaceContainer"></main>
    </div>
  `;

  renderHeader(document.querySelector('#headerContainer'), state, {
    onSearch: handleSearch,
    onSelectModality: handleSelectModality,
    onOpenUpload: openUploadModal,
    onWizardComplete: (newStudy) => {
      state.selectedStudyId = newStudy.id;
      saveStudiesToStorage(state.studies);
      applyFilters();
      switchView('worklist');
    },
    onSelectUserRole: (user) => {
      state.currentUser = user;
      init();
    },
    onToggleCollapseHeader: (collapsed) => {
      state.headerCollapsed = collapsed;
      renderHeader(document.querySelector('#headerContainer'), state, {
        onSearch: handleSearch,
        onSelectModality: handleSelectModality,
        onOpenUpload: openUploadModal,
        onWizardComplete: (newStudy) => {
          state.selectedStudyId = newStudy.id;
          saveStudiesToStorage(state.studies);
          applyFilters();
          switchView('worklist');
        },
        onSelectUserRole: (user) => {
          state.currentUser = user;
          init();
        },
        onToggleCollapseHeader: (c) => {
          state.headerCollapsed = c;
          init();
        },
        onGoHome: () => switchView('worklist'),
        onLogout: handleLogout
      });
      refreshIcons();
    },
    onGoHome: () => switchView('worklist'),
    onLogout: handleLogout
  });

  renderWorkspace();
  renderUploadModal(document.querySelector('#modalContainer'), {
    onUploadComplete: handleNewUpload
  });

  setupKeyboardHotkeys();

  document.querySelector('#navDashboard')?.addEventListener('click', () => switchView('dashboard'));
  document.querySelector('#navWorklist')?.addEventListener('click', () => switchView('worklist'));
  document.querySelector('#navAppointments')?.addEventListener('click', () => switchView('appointments'));
  document.querySelector('#navViewer')?.addEventListener('click', () => {
    if (!state.selectedStudyId && state.studies.length > 0) state.selectedStudyId = state.studies[0].id;
    switchView('viewer');
  });
  document.querySelector('#navReport')?.addEventListener('click', () => {
    if (!state.selectedStudyId && state.studies.length > 0) state.selectedStudyId = state.studies[0].id;
    switchView('report');
  });
  document.querySelector('#navSplit')?.addEventListener('click', () => {
    if (!state.selectedStudyId && state.studies.length > 0) state.selectedStudyId = state.studies[0].id;
    switchView('split');
  });
  document.querySelector('#navRecord')?.addEventListener('click', () => switchView('record'));
  document.querySelector('#navPortal')?.addEventListener('click', () => switchView('portal'));
  document.querySelector('#navCrud')?.addEventListener('click', () => switchView('crud'));
  document.querySelector('#navBilling')?.addEventListener('click', () => switchView('billing'));
  document.querySelector('#navSettings')?.addEventListener('click', () => switchView('settings'));

  refreshIcons();
}

function setupKeyboardHotkeys() {
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const key = e.key.toUpperCase();
    if (key === 'V') {
      if (!state.selectedStudyId && state.studies.length > 0) state.selectedStudyId = state.studies[0].id;
      switchView('viewer');
    } else if (key === 'L') {
      if (!state.selectedStudyId && state.studies.length > 0) state.selectedStudyId = state.studies[0].id;
      switchView('report');
    } else if (key === 'S') {
      if (!state.selectedStudyId && state.studies.length > 0) state.selectedStudyId = state.studies[0].id;
      switchView('split');
    } else if (key === 'W') {
      switchView('worklist');
    }
  });
}

function handleLogout() {
  stopActiveVideoCapture();
  state.isAuthenticated = false;
  state.currentUser = null;
  init();
}

function refreshIcons() {
  createIcons({
    icons: {
      Activity, Search, ListFilter, Eye, FileText, UploadCloud, Sun, Ruler, CircleDot, ZoomIn, Move, Contrast, RotateCcw, RotateCw, Play, Pause, Sparkles, FileCheck2, Mic, Save, Printer, ShieldCheck, RadioReceiver, X, FolderOpen, Inbox, Columns, Loader, User, Lock, LogIn, LogOut, Calendar, CreditCard, Settings, UserPlus, Download, Building, Camera, Power, Video, Globe, ArrowLeft, ArrowRight, Share2, Send, Clock, Maximize2, Columns2, Keyboard, Edit, Trash2, DollarSign, LayoutDashboard, FilePlus, Triangle, ArrowUpRight, History, UserCheck, Key, BarChart2, ChevronUp, ChevronDown
    }
  });
}

function applyFilters() {
  state.filteredStudies = state.studies.filter(study => {
    const matchesModality = state.activeModality === 'TODOS' || study.modality === state.activeModality;
    const term = state.searchTerm.toLowerCase();
    const matchesSearch = !term || 
      study.patientName.toLowerCase().includes(term) ||
      study.patientId.toLowerCase().includes(term) ||
      study.accessionNumber.toLowerCase().includes(term) ||
      study.studyDescription.toLowerCase().includes(term);

    return matchesModality && matchesSearch;
  });

  renderWorkspace();
}

function handleSearch(term) {
  state.searchTerm = term;
  applyFilters();
}

function handleSelectModality(modality) {
  state.activeModality = modality;
  applyFilters();

  renderHeader(document.querySelector('#headerContainer'), state, {
    onSearch: handleSearch,
    onSelectModality: handleSelectModality,
    onOpenUpload: openUploadModal,
    onWizardComplete: (newStudy) => {
      state.selectedStudyId = newStudy.id;
      saveStudiesToStorage(state.studies);
      applyFilters();
      switchView('worklist');
    },
    onSelectUserRole: (user) => {
      state.currentUser = user;
      init();
    },
    onToggleCollapseHeader: (c) => {
      state.headerCollapsed = c;
      init();
    },
    onGoHome: () => switchView('worklist'),
    onLogout: handleLogout
  });
  refreshIcons();
}

function switchView(viewName, studyId = null) {
  if ((state.currentView === 'viewer' || state.currentView === 'split') && viewName !== 'viewer' && viewName !== 'split') {
    stopActiveVideoCapture();
  }

  state.currentView = viewName;
  if (studyId) {
    state.selectedStudyId = studyId;
    window.location.hash = `#/portal/${studyId}`;
  } else if (viewName !== 'portal') {
    window.location.hash = '';
  }
  
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  if (viewName === 'dashboard') document.querySelector('#navDashboard')?.classList.add('active');
  if (viewName === 'worklist') document.querySelector('#navWorklist')?.classList.add('active');
  if (viewName === 'appointments') document.querySelector('#navAppointments')?.classList.add('active');
  if (viewName === 'viewer') document.querySelector('#navViewer')?.classList.add('active');
  if (viewName === 'report') document.querySelector('#navReport')?.classList.add('active');
  if (viewName === 'split') document.querySelector('#navSplit')?.classList.add('active');
  if (viewName === 'record') document.querySelector('#navRecord')?.classList.add('active');
  if (viewName === 'portal') document.querySelector('#navPortal')?.classList.add('active');
  if (viewName === 'crud') document.querySelector('#navCrud')?.classList.add('active');
  if (viewName === 'billing') document.querySelector('#navBilling')?.classList.add('active');
  if (viewName === 'settings') document.querySelector('#navSettings')?.classList.add('active');

  renderWorkspace();
}

function renderWorkspace() {
  const container = document.querySelector('#workspaceContainer');
  if (!container) return;

  const study = state.selectedStudyId ? state.studies.find(s => s.id === state.selectedStudyId) : state.studies[0];

  if (state.currentView === 'dashboard') {
    renderDashboard(container, state, {});
  } else if (state.currentView === 'worklist') {
    renderWorklist(container, state.filteredStudies, {
      onOpenViewer: (id) => switchView('viewer', id),
      onOpenReport: (id) => switchView('report', id)
    });
  } else if (state.currentView === 'appointments') {
    renderAppointments(container, state, {});
  } else if (state.currentView === 'billing') {
    renderBilling(container, state, {});
  } else if (state.currentView === 'settings') {
    renderClinicSettings(container, state, {});
  } else if (state.currentView === 'crud') {
    renderCrudManagement(container, state, {});
  } else if (state.currentView === 'record') {
    renderMedicalRecordPage(container, study, state.studies, {
      onBack: () => switchView('worklist'),
      onOpenViewer: (id) => switchView('viewer', id),
      onOpenPortal: (id) => switchView('portal', id)
    });
  } else if (state.currentView === 'portal') {
    renderPatientPortalPage(container, study, state.studies, {
      onBack: () => switchView('worklist')
    });
  } else if (state.currentView === 'viewer') {
    container.innerHTML = `<div id="dicomPane" style="flex: 1; height: 100%;"></div>`;
    renderDicomViewer(container.querySelector('#dicomPane'), study, state, {
      onToggleViewMode: (mode) => switchView(mode)
    });
  } else if (state.currentView === 'report') {
    container.innerHTML = `<div id="reportPane" style="flex: 1; height: 100%;"></div>`;
    renderReportEditor(container.querySelector('#reportPane'), study, state.studies, {
      onSelectPatient: (id) => {
        state.selectedStudyId = id;
      },
      onReportSigned: () => {
        saveStudiesToStorage(state.studies);
        switchView('worklist');
      },
      onToggleViewMode: (mode) => switchView(mode)
    });
  } else if (state.currentView === 'split') {
    container.innerHTML = `
      <div class="viewer-layout">
        <div id="dicomPane" style="flex: 1.2;"></div>
        <div id="reportPane" style="flex: 0.9;"></div>
      </div>
    `;

    renderDicomViewer(container.querySelector('#dicomPane'), study, state, {
      onToggleViewMode: (mode) => switchView(mode)
    });
    renderReportEditor(container.querySelector('#reportPane'), study, state.studies, {
      onSelectPatient: (id) => {
        state.selectedStudyId = id;
        renderWorkspace();
      },
      onReportSigned: () => {
        saveStudiesToStorage(state.studies);
        switchView('worklist');
      },
      onToggleViewMode: (mode) => switchView(mode)
    });
  }

  refreshIcons();
}

function openUploadModal() {
  const backdrop = document.querySelector('#modalBackdrop');
  if (backdrop) backdrop.classList.add('open');
}

function handleNewUpload(fileName, rawDicomObject = null) {
  const newStudy = {
    id: `EX-${Math.floor(10000 + Math.random() * 90000)}`,
    patientName: rawDicomObject ? rawDicomObject.patientName : "ERICK LIMA",
    patientId: rawDicomObject ? rawDicomObject.patientId : `CPF: 123.456.789-00`,
    age: "38a",
    gender: "M",
    modality: rawDicomObject ? rawDicomObject.modality : "US",
    studyDescription: rawDicomObject ? rawDicomObject.studyDescription : `ULTRASSOM DE ABDÔMEN TOTAL: ${fileName.toUpperCase()}`,
    date: new Date().toISOString().slice(0, 16).replace('T', ' '),
    modalitiesInStudy: [rawDicomObject ? rawDicomObject.modality : "US"],
    seriesCount: 1,
    instanceCount: 1,
    status: "pronto",
    urgency: "alta",
    physician: state.currentUser ? state.currentUser.name : "Dr. Plantonista Radiologia",
    institution: "NEXUSRAD DIAGNÓSTICO POR IMAGEM",
    accessionNumber: `ACC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    kvp: "120 kV",
    ma: "240 mA",
    sliceThickness: "1.0 mm",
    rawDicomObject: rawDicomObject,
    aiFinding: {
      type: "Estudo Binário Lido",
      confidence: "99.0%",
      box: { x: 25, y: 25, width: 40, height: 40 },
      description: "Arquivo DICOM importado com sucesso para o paciente."
    }
  };

  state.studies.unshift(newStudy);
  state.selectedStudyId = newStudy.id;
  saveStudiesToStorage(state.studies);
  applyFilters();
  switchView('worklist');
}

document.addEventListener('DOMContentLoaded', init);
