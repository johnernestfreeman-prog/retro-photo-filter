import sql from 'mssql';

const config: sql.config = {
  user: process.env.DB_USER || 'sqladmin',
  password: process.env.DB_PASSWORD || '',
  server: process.env.DB_SERVER || 'localhost',
  port: 1433,
  database: process.env.DB_NAME || 'RetroPhotoFilter',
  options: {
    encrypt: process.env.DB_ENCRYPT !== 'false',
    trustServerCertificate: process.env.DB_ENCRYPT === 'false',
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (pool) return pool;
  pool = await sql.connect(config);
  return pool;
}

export async function logFilterHistory(params: {
  originalFilename: string;
  fileSizeBytes: number;
  brightness: number;
  desaturation: number;
  resultFilename: string;
}): Promise<void> {
  const p = await getPool();
  await p.request()
    .input('originalFilename', sql.NVarChar(255), params.originalFilename)
    .input('fileSizeBytes', sql.Int, params.fileSizeBytes)
    .input('brightness', sql.Float, params.brightness)
    .input('desaturation', sql.Float, params.desaturation)
    .input('resultFilename', sql.NVarChar(255), params.resultFilename)
    .query(`
      INSERT INTO FilterHistory (OriginalFilename, FileSizeBytes, Brightness, Desaturation, ResultFilename)
      VALUES (@originalFilename, @fileSizeBytes, @brightness, @desaturation, @resultFilename)
    `);
}

export async function getFilterHistory(): Promise<any[]> {
  const p = await getPool();
  const result = await p.request().query(`
    SELECT TOP 50 Id, OriginalFilename, FileSizeBytes, Brightness, Desaturation, ProcessedAt, ResultFilename
    FROM FilterHistory
    ORDER BY ProcessedAt DESC
  `);
  return result.recordset;
}