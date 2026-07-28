// ==========================================================================
// NexusRad AI - Express + PostgreSQL REST API Server & DICOM Gateway
// ==========================================================================

import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// PostgreSQL Connection Pool Config
const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'nexusrad_db',
  password: process.env.PGPASSWORD || 'postgres',
  port: parseInt(process.env.PGPORT || '5432', 10),
});

// Enable CORS for Frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as db_time');
    res.json({
      status: 'ONLINE',
      postgres: 'CONNECTED',
      dbTime: result.rows[0].db_time
    });
  } catch (err) {
    res.status(500).json({
      status: 'ONLINE',
      postgres: 'DISCONNECTED',
      error: 'PostgreSQL connection failed. Ensure PostgreSQL service is running on port 5432.'
    });
  }
});

// GET /api/worklist -> Fetch RIS Worklist from PostgreSQL
app.get('/api/worklist', async (req, res) => {
  try {
    const query = `
      SELECT 
        e.id, 
        e.accession_number AS "accessionNumber",
        p.nome AS "patientName",
        p.cpf AS "patientId",
        p.convenio,
        e.modalidade,
        e.descricao_estudo AS "studyDescription",
        e.data_exame AS "date",
        e.series_count AS "seriesCount",
        e.instance_count AS "instanceCount",
        e.status,
        e.urgencia,
        m.nome AS "physician"
      FROM exames_pacs e
      JOIN pacientes p ON e.paciente_id = p.id
      LEFT JOIN medicos m ON e.medico_solicitante_id = m.id
      ORDER BY e.data_exame DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/worklist -> Insert DICOM Study into PostgreSQL
app.post('/api/worklist', async (req, res) => {
  const { accessionNumber, patientName, patientId, modality, studyDescription } = req.body;
  try {
    // 1. Ensure Patient exists
    const patResult = await pool.query(
      `INSERT INTO pacientes (cpf, prontuario, nome, data_nascimento, sexo) 
       VALUES ($1, $2, $3, '1980-01-01', 'M')
       ON CONFLICT (cpf) DO UPDATE SET nome = EXCLUDED.nome
       RETURNING id`,
      [patientId || '000.000.000-00', `PRONT-${Math.floor(10000 + Math.random() * 90000)}`, patientName || 'PACIENTE DICOM']
    );
    const pacienteId = patResult.rows[0].id;

    // 2. Insert Exam
    const examResult = await pool.query(
      `INSERT INTO exames_pacs (accession_number, paciente_id, modalidade, descricao_estudo, status)
       VALUES ($1, $2, $3, $4, 'pronto')
       RETURNING *`,
      [accessionNumber || `ACC-2026-${Math.floor(10000 + Math.random() * 90000)}`, pacienteId, modality || 'CT', studyDescription || 'EXAME DICOM']
    );

    res.status(201).json(examResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tuss -> Fetch TUSS Procedures
app.get('/api/tuss', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tabela_tuss ORDER BY codigo_tuss ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`⚡ Servidor Node.js + PostgreSQL rodando na porta ${PORT}`);
});
