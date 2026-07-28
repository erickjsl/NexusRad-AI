<div align="center">

  # 🏥 NexusRad AI — Sistema RIS / PACS & Diagnóstico por Imagem Padrão Brasil

  [![Vite](https://img.shields.io/badge/Vite-8.1.5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-REST_API-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

  <p align="center">
    <strong>Plataforma Completa de Diagnóstico Radiológico, Ultrassonografia ao Vivo, Laudagem Inteligente com Gemini IA e Gestão de Clínicas Médicas no Brasil.</strong>
  </p>

  <p align="center">
    <i>Alinhado com a arquitetura dos líderes de mercado brasileiros: Pixeon NetPACS, Animati PACS, Carestream Vue RIS e Soul MV.</i>
  </p>

  <a href="https://github.com/erickjsl/NexusRad-AI"><strong>Explorar Repositório »</strong></a>
  <br />
  <br />
  <a href="#-instalação--execução-rápida">Instalação</a>
  ·
  <a href="#-funcionalidades-principais">Funcionalidades</a>
  ·
  <a href="#-arquitetura-do-projeto">Arquitetura</a>
  ·
  <a href="#-banco-de-dados-postgresql">Banco de Dados</a>
</div>

---

## 📌 Sumário Interativo

- [✨ Visão Geral](#-visão-geral)
- [🚀 Funcionalidades Principais](#-funcionalidades-principais)
- [🖼️ Visualizador DICOM & Captura US 60fps](#️-visualizador-dicom--captura-us-60fps)
- [📝 Laudagem Estruturada & Biblioteca do Brasil](#-laudagem-estruturada--biblioteca-do-brasil)
- [🧙‍♂️ Wizard de Admissão & Validação de CPF](#️-wizard-de-admissão--validação-de-cpf)
- [📁 Central de Cadastros & Gestão CRUD](#-central-de-cadastros--gestão-crud)
- [🔊 Recepção, Painel TV & Chamada por Voz](#-recepção-painel-tv--chamada-por-voz)
- [🌐 Portal do Paciente LGPD](#-portal-do-paciente-lgpd)
- [🛠️ Instalação & Execução Rápida](#-instalação--execução-rápida)
- [🗄️ Banco de Dados PostgreSQL](#️-banco-de-dados-postgresql)
- [🤝 Contribuição & Licença](#-contribuição--licença)

---

## ✨ Visão Geral

O **NexusRad AI** foi projetado para transformar o fluxo de trabalho de clínicas de diagnóstico por imagem e centros radiológicos no Brasil. Ele combina em uma única interface web ultrarrápida:

1. **RIS (Radiology Information System)**: Gestão de recepção, agendamento, convocação em TV por voz sintetizada e faturamento TUSS.
2. **PACS (Picture Archiving and Communication System)**: Visualizador DICOM 2D em Canvas HTML5, suporte a WADO/QIDO e captura de ultrassom ao vivo em 60fps via Placa de Captura (UVC HDMI/USB).
3. **IA Copilot Multimodal**: Automação de laudos e diagnósticos diferenciais utilizando a API do Google Gemini AI.

---

## 🚀 Funcionalidades Principais

### 📋 Central de Laudos & Worklist RIS
- **Priorização Radiológica**: Identificação visual por cores de casos Urgentes (STAT), Prontos e Laudando.
- **Filtro Instantâneo por Modalidade**: `TODOS`, `US` (Ultrassom), `CT` (Tomografia), `DX` (Raio-X), `MR` (Ressonância), `MG` (Mamografia).
- **Busca Global**: Pesquisa por Nome do Paciente, CPF, Código de Prontuário ou Número de Acesso (Acc#).

---

### 🖼️ Visualizador DICOM & Captura US 60fps
- **Canvas HTML5 Interativo no Mouse**:
  - `☀️ Janelamento (WW/WL)`: Arraste com o mouse para alterar brilho e contraste em tempo real. Presets para Pulmão, Osso, Partes Moles e Cerebral.
  - `📏 Medição Linear (mm)`: Medição calibrated em milímetros sobre lesões.
  - `🎯 Área ROI & Densidade Hounsfield (HU)`: Cálculo de área em mm² e densidade média em HU.
  - `📐 Medição de Ângulo (°)`: Avaliação angular articular.
  - `📍 Anotação de Seta`: Marcação diagnóstica na imagem.
  - `🔍 Zoom & Pan`: Zoom contínuo na rodinha do mouse (`50% a 500%`) e arrasto com ferramenta Pan.
  - `🌓 Inverter Cores & 🔄 Girar 90°`: Inversão de negativo/positivo e rotação.
- **Transmissão de Ultrassom ao Vivo**: Suporte a WebRTC / MediaDevices para capturar vídeo de ultrassom em 60fps via placa HDMI/USB com encerramento automático da câmera.
- **Galeria de Miniaturas (Filmstrip Bar)**: Fotos capturadas ficam salvas na barra inferior do exame (`#1, #2, #3...`) para revisão imediata.

---

### 🧙‍♂️ Wizard de Admissão & Validação de CPF
- **Admissão Guiada em 3 Passos**:
  - **Passo 1**: Identificação do Paciente, Validação Oficial de CPF e Cálculo de Idade.
  - **Passo 2**: Seleção de Modalidade, Tipo de Exame e Lateralidade (*Direita D, Esquerda E, Bilateral, N/A*).
  - **Passo 3**: Convênio, Carteirinha, Médico Solicitante e Encaminhamento Automático ao Viewer.
- **Validação de CPF por Algoritmo Mód. 11**: Valida os dois dígitos verificadores em tempo real com indicador visual (`✅ CPF VÁLIDO` / `❌ CPF INVÁLIDO`).
- **Cálculo Automático de Idade**: Calcula a idade exata ao selecionar a Data de Nascimento (*ex: 15/05/1984 ➔ 42 anos*).
- **Busca & Autocadastro no Banco de Dados**: Seleciona pacientes já existentes ou cadastra novos pacientes automaticamente na criação do exame.

---

### 📝 Laudagem Estruturada & Biblioteca do Brasil
- **Seletor de Paciente no Topo (`PACIENTE: ▾`)**: Alterne de paciente direto na tela do laudo sem voltar à lista.
- **Biblioteca Completa de Máscaras Radiológicas do Brasil**:
  - **Ultrassonografia Obstétrica (Tabela Hadlock 2º/3º Trimestre & Doppler)**.
  - **Ultrassonografia Mamária (Classificação BI-RADS US 1 a 5)**.
  - **Ultrassonografia de Tireoide (Classificação TI-RADS 1 a 5)**.
  - **Ultrassonografia de Abdômen Total & Rins/Vias Urinárias**.
  - **Ultrassonografia Musculoesquelética (Ombro Manguito Rotador & Joelho)**.
  - **Doppler Vascular Carótidas e Venoso de Membros Inferiores**.
- **Assinatura Digital ICP-Brasil A1**: Validação de autenticidade do laudo médico.
- **Gerador de PDF de Laudo Timbrado**: Exportação em PDF com logotipo da clínica.

---

### 📁 Central de Cadastros & Gestão CRUD
- **CRUD de Pacientes**: Cadastro, edição e exclusão de prontuários com CPF, RG, Nome da Mãe e Convênio.
- **CRUD de Modelos de Laudo**: Criação de novas máscaras de laudo personalizadas pela clínica.
- **CRUD de Corpo Médico**: Cadastro de médicos radiologistas laudadores com CRM/UF.

---

### 🔊 Recepção, Painel TV & Chamada por Voz
- **Chamada por Áudio Sintetizado (pt-BR)**: Convocação de pacientes no painel de TV da recepção (*"Atenção paciente Antônio Rodrigues, por favor dirigir-se à Sala 1..."*).
- **Impressão de Comprovante Térmico (80mm)**: PDF de ticket de recepção com QR Code e Chave de Acesso ao Portal Online.

---

### 🌐 Portal do Paciente LGPD
- **Acesso Individual**: Login por CPF e Protocolo de Exame.
- **Visualização Web de Imagens & Laudo**: Visualizador responsivo para celular e download de PDF.
- **Compartilhamento por WhatsApp**: Envio em 1-clique do link de acesso para o WhatsApp do paciente ou médico solicitante.

---

## 🛠️ Instalação & Execução Rápida

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Git](https://git-scm.com/)

```bash
# 1. Clonar o repositório
git clone https://github.com/erickjsl/NexusRad-AI.git

# 2. Entrar no diretório do projeto
cd NexusRad-AI

# 3. Instalar as dependências do projeto
npm install

# 4. Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse o sistema no navegador através do endereço: `http://localhost:3000`

---

## 🗄️ Banco de Dados PostgreSQL

O projeto inclui o esquema SQL e scripts PowerShell automáticos para configurar o banco de dados PostgreSQL relacional na pasta `/database`:

```bash
# Executar o script de configuração do PostgreSQL no Windows (PowerShell)
.\database\setup_database.ps1
```

O backend REST API em Node.js (`server.js`) escuta na porta `4000` e gerencia a persistência de pacientes, exames, máscaras de laudos e usuários.

---

## 📂 Arquitetura do Projeto

```
NexusRad-AI/
├── database/                   # Esquema SQL e scripts do PostgreSQL
│   ├── schema.sql              # Tabelas de Pacientes, Exames, Laudos e TUSS
│   └── setup_database.ps1      # Script automatizado de criação do banco
├── public/                     # Ícones e favicons da aplicação
├── src/
│   ├── assets/                 # SVGs e imagens institucionais
│   ├── components/             # Módulos e interfaces da aplicação
│   │   ├── AppointmentModal.js # Modal de Agendamentos da Recepção
│   │   ├── Appointments.js     # Painel de Recepção & Chamada por Voz TV
│   │   ├── Billing.js          # Faturamento TUSS & Exportação TISS XML
│   │   ├── ClinicSettings.js   # Configurações do DICOM Gateway
│   │   ├── CrudManagement.js   # Central de Cadastros CRUD (Pacientes/Laudos)
│   │   ├── DicomViewer.js      # Visualizador DICOM 2D & Captura Vídeo US
│   │   ├── Header.js           # Barra Superior & Filtros de Modalidade
│   │   ├── LoginModal.js       # Tela de Autenticação do Usuário
│   │   ├── NewExamWizardModal.js # Wizard Passo a Passo de Admissão & CPF
│   │   ├── PatientPortalPage.js  # Portal do Paciente LGPD & QR Code
│   │   ├── ReportEditor.js     # Editor de Laudos Estruturados & Gemini IA
│   │   ├── TemplateLibraryModal.js # Modal de Pesquisa de Máscaras do Brasil
│   │   └── Worklist.js         # Fila Worklist Radiológica RIS
│   ├── data/
│   │   └── mockData.js         # Dados simulados e dicionário de laudos
│   ├── utils/
│   │   ├── cpfValidator.js     # Validação de CPF e cálculo de idade
│   │   ├── dicomGenerator.js   # Gerador de matrizes de pixels DICOM 2D
│   │   └── dicomParser.js      # Leitor de arquivos binários .dcm
│   ├── main.js                 # Orquestrador de rotas e estado da aplicação
│   └── style.css               # Design System Medical Dark Mode
├── index.html                  # HTML Principal
├── server.js                   # Backend Node.js Express REST API
└── package.json                # Gerenciador de dependências Vite
```

---

## 👤 Autor

Desenvolvido por **Erick**  
- **GitHub**: [@erickjsl](https://github.com/erickjsl)
- **Repositório**: [https://github.com/erickjsl/NexusRad-AI](https://github.com/erickjsl/NexusRad-AI)

---

<div align="center">
  <sub>NexusRad AI © 2026 — Desenvolvido para a Radiologia & Diagnóstico por Imagem do Brasil.</sub>
</div>
