-- ==========================================================================
-- NexusRad AI - PostgreSQL Medical PACS/RIS Database Schema
-- ==========================================================================

-- Create Database (Run if database does not exist)
-- CREATE DATABASE nexusrad_db;

-- Connect to nexusrad_db
\c nexusrad_db;

-- 1. Table: Pacientes (RIS Patient Registry)
CREATE TABLE IF NOT EXISTS pacientes (
    id SERIAL PRIMARY KEY,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    prontuario VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(150) NOT NULL,
    data_nascimento DATE NOT NULL,
    sexo CHAR(1) CHECK (sexo IN ('M', 'F', 'O')),
    telefone VARCHAR(20),
    email VARCHAR(100),
    convenio VARCHAR(50) DEFAULT 'PARTICULAR',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: Medicos (Radiologists & Referring Physicians)
CREATE TABLE IF NOT EXISTS medicos (
    id SERIAL PRIMARY KEY,
    crm VARCHAR(20) UNIQUE NOT NULL,
    rqe VARCHAR(20),
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    especialidade VARCHAR(100) DEFAULT 'Radiologia e Diagnóstico por Imagem',
    papel VARCHAR(30) CHECK (papel IN ('LAUDADOR', 'SOLICITANTE', 'ADMIN')) DEFAULT 'LAUDADOR',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: Exames PACS (DICOM Studies Registry)
CREATE TABLE IF NOT EXISTS exames_pacs (
    id SERIAL PRIMARY KEY,
    accession_number VARCHAR(30) UNIQUE NOT NULL,
    paciente_id INT REFERENCES pacientes(id) ON DELETE CASCADE,
    medico_solicitante_id INT REFERENCES medicos(id),
    modalidade VARCHAR(10) NOT NULL CHECK (modalidade IN ('CT', 'DX', 'CR', 'MR', 'US', 'MG')),
    descricao_estudo VARCHAR(255) NOT NULL,
    data_exame TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    series_count INT DEFAULT 1,
    instance_count INT DEFAULT 1,
    status VARCHAR(20) CHECK (status IN ('pronto', 'laudando', 'urgente', 'concluido')) DEFAULT 'pronto',
    urgencia VARCHAR(10) CHECK (urgencia IN ('normal', 'alta')) DEFAULT 'normal',
    aetitle_origem VARCHAR(50) DEFAULT 'NEXUS_PACS_SERVER',
    kvp VARCHAR(20),
    ma VARCHAR(20),
    espessura_corte VARCHAR(20),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table: Laudos Radiologicos (Reports & Digital Signatures)
CREATE TABLE IF NOT EXISTS laudos_radiologicos (
    id SERIAL PRIMARY KEY,
    exame_id INT UNIQUE REFERENCES exames_pacs(id) ON DELETE CASCADE,
    medico_laudador_id INT REFERENCES medicos(id),
    modelo_template VARCHAR(50),
    corpo_achados TEXT NOT NULL,
    impressao_diagnostica TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('rascunho', 'assinado', 'revisado')) DEFAULT 'rascunho',
    hash_icp_brasil VARCHAR(128),
    data_assinatura TIMESTAMP,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table: Tabela TUSS (Procedures & Billing)
CREATE TABLE IF NOT EXISTS tabela_tuss (
    id SERIAL PRIMARY KEY,
    codigo_tuss VARCHAR(20) UNIQUE NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    modalidade VARCHAR(10) NOT NULL,
    valor_padrao NUMERIC(10,2) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE
);

-- Create Indexes for High Performance DICOM Queries
CREATE INDEX IF NOT EXISTS idx_exames_modalidade ON exames_pacs(modalidade);
CREATE INDEX IF NOT EXISTS idx_exames_status ON exames_pacs(status);
CREATE INDEX IF NOT EXISTS idx_pacientes_cpf ON pacientes(cpf);
CREATE INDEX IF NOT EXISTS idx_exames_acc ON exames_pacs(accession_number);

-- Seed Sample Data into PostgreSQL
INSERT INTO pacientes (cpf, prontuario, nome, data_nascimento, sexo, telefone, convenio) VALUES
('389.201.448-02', 'PRONT-90412', 'ROBERTO SILVA ALMEIDA', '1972-04-12', 'M', '(11) 98877-6655', 'BRADESCO SAÚDE'),
('198.502.119-45', 'PRONT-90413', 'MARIA DAS GRAÇAS OLIVEIRA', '1964-08-25', 'F', '(11) 97766-5544', 'UNIMED'),
('088.441.229-30', 'PRONT-90416', 'ANTÔNIO RODRIGUES GOMES', '1955-11-03', 'M', '(11) 96655-4433', 'SULAMÉRICA')
ON CONFLICT (cpf) DO NOTHING;

INSERT INTO medicos (crm, rqe, nome, email, especialidade, papel) VALUES
('CRM/SP 142.890', 'RQE 88.102', 'Dr. Carlos Roberto de Mendonça', 'dr.radiologista@nexusrad.com.br', 'Radiologia e Diagnóstico por Imagem', 'LAUDADOR'),
('CRM/SP 189.430', 'RQE 90.112', 'Dra. Patricia Lima', 'dra.patricia@nexusrad.com.br', 'Ultrassonografia Geral e Doppler', 'LAUDADOR')
ON CONFLICT (crm) DO NOTHING;

INSERT INTO tabela_tuss (codigo_tuss, descricao, modalidade, valor_padrao) VALUES
('4.09.01.12-2', 'ULTRASONOGRAFIA DE ABDÔMEN TOTAL', 'US', 280.00),
('4.09.01.20-3', 'ULTRASONOGRAFIA OBSTÉTRICA COM DOPPLER', 'US', 390.00),
('4.10.01.01-0', 'TOMOGRAFIA COMPUTADORIZADA DE TÓRAX', 'CT', 750.00),
('4.11.01.08-1', 'RESSONÂNCIA MAGNÉTICA DE JOELHO', 'MR', 1120.00),
('4.08.08.04-1', 'RADIOGRAFIA DE TÓRAX PA E PERFIL', 'DX', 120.00)
ON CONFLICT (codigo_tuss) DO NOTHING;
