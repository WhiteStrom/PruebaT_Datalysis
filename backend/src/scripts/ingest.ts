/**
 * ETL Phase 1 - INGEST
 * Downloads Olist dataset CSVs from a GitHub mirror and loads them
 * into the PostgreSQL `raw` schema using COPY-like bulk inserts.
 *
 * Dataset mirror: https://github.com/olist/work-at-olist-data/releases
 * (We use the Kaggle archive re-hosted on GitHub for reliability)
 */
import '../loadEnv';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { Client } from 'pg';
import { parse } from 'csv-parse';

const DATA_DIR = path.resolve(__dirname, '../../data');

// Se define el array de archivos
const FILES: { name: string; url: string; table: string }[] = [
  {
    name: 'olist_orders_dataset.csv',
    table: 'raw.orders',
    url: 'https://raw.githubusercontent.com/Abdullah321Umar/ElevvoPathways-DataAnalytics_Internship-TASK4/main/olist_orders_dataset.csv',
  },
  {
    name: 'olist_order_items_dataset.csv',
    table: 'raw.order_items',
    url: 'https://raw.githubusercontent.com/Abdullah321Umar/ElevvoPathways-DataAnalytics_Internship-TASK4/main/olist_order_items_dataset.csv',
  },
  {
    name: 'olist_customers_dataset.csv',
    table: 'raw.customers',
    url: 'https://raw.githubusercontent.com/Abdullah321Umar/ElevvoPathways-DataAnalytics_Internship-TASK4/main/olist_customers_dataset.csv',
  },
  {
    name: 'olist_products_dataset.csv',
    table: 'raw.products',
    url: 'https://raw.githubusercontent.com/Abdullah321Umar/ElevvoPathways-DataAnalytics_Internship-TASK4/main/olist_products_dataset.csv',
  },
  {
    name: 'olist_order_payments_dataset.csv',
    table: 'raw.order_payments',
    url: 'https://raw.githubusercontent.com/Abdullah321Umar/ElevvoPathways-DataAnalytics_Internship-TASK4/main/olist_order_payments_dataset.csv',
  },
];

// DDL para las tablas raw
const RAW_DDL = `
CREATE SCHEMA IF NOT EXISTS raw;

DROP TABLE IF EXISTS raw.order_items;
DROP TABLE IF EXISTS raw.order_payments;
DROP TABLE IF EXISTS raw.orders;
DROP TABLE IF EXISTS raw.customers;
DROP TABLE IF EXISTS raw.products;

CREATE TABLE raw.orders (
  order_id                       TEXT,
  customer_id                    TEXT,
  order_status                   TEXT,
  order_purchase_timestamp       TEXT,
  order_approved_at              TEXT,
  order_delivered_carrier_date   TEXT,
  order_delivered_customer_date  TEXT,
  order_estimated_delivery_date  TEXT
);

CREATE TABLE raw.order_items (
  order_id            TEXT,
  order_item_id       TEXT,
  product_id          TEXT,
  seller_id           TEXT,
  shipping_limit_date TEXT,
  price               TEXT,
  freight_value       TEXT
);

CREATE TABLE raw.customers (
  customer_id          TEXT,
  customer_unique_id   TEXT,
  customer_zip_code_prefix TEXT,
  customer_city        TEXT,
  customer_state       TEXT
);

CREATE TABLE raw.products (
  product_id                TEXT,
  product_category_name     TEXT,
  product_name_lenght       TEXT,
  product_description_lenght TEXT,
  product_photos_qty        TEXT,
  product_weight_g          TEXT,
  product_length_cm         TEXT,
  product_height_cm         TEXT,
  product_width_cm          TEXT
);

CREATE TABLE raw.order_payments (
  order_id              TEXT,
  payment_sequential    TEXT,
  payment_type          TEXT,
  payment_installments  TEXT,
  payment_value         TEXT
);
`;

// Se define la funcion downloadFile
function downloadFile(url: string, dest: string): Promise<void> {
  // Se define la promesa
  return new Promise((resolve, reject) => {
    // Se define el archivo (Corregido)
    if (fs.existsSync(dest)) {
      const preview = fs.readFileSync(dest, 'utf8').slice(0, 64);
      if (!preview.startsWith('404: Not Found')) {
        console.log(`  ↩ Cached: ${path.basename(dest)}`);
        return resolve(); 
      }
      fs.unlinkSync(dest);
    }
    // Se define el archivo (Corregido)
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          file.close();
          fs.unlinkSync(dest);
          downloadFile(response.headers.location!, dest).then(resolve).catch(reject);
          return;
        }

        // Se define el error
        if ((response.statusCode ?? 500) >= 400) {
          file.close();
          fs.unlinkSync(dest);
          reject(new Error(`Failed to download ${path.basename(dest)}: HTTP ${response.statusCode}`));
          return;
        }

        // Se define el pipe (flujo de datos)
        response.pipe(file);
        file.on('finish', () => file.close(() => resolve()));
      })
      .on('error', (err) => {
        fs.unlinkSync(dest);
        reject(err);
      });
  });
}

// Se define la funcion loadCsvToTable
async function loadCsvToTable(
  client: Client,
  csvPath: string,
  table: string
): Promise<void> {
  const records: Record<string, string>[] = [];
  
  // Se define la promesa
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(parse({ columns: true, skip_empty_lines: true, trim: true }))
      .on('data', (row: Record<string, string>) => records.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  if (records.length === 0) return;

  const columns = Object.keys(records[0]!);
  const colList = columns.map((c) => `"${c}"`).join(', ');

  // Insertar en lotes de 500 (por si acaso)
  const BATCH = 500;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    const values: string[] = [];
    const params: string[] = [];
    let pi = 1;
    for (const row of batch) {
      const placeholders = columns.map(() => `$${pi++}`).join(', ');
      values.push(`(${placeholders})`);
      params.push(...columns.map((c) => row[c] ?? ''));
    }
    await client.query(
      `INSERT INTO ${table} (${colList}) VALUES ${values.join(', ')}`,
      params
    );
  }

  // Se define el log de exito
  console.log(`  ✅ Loaded ${records.length} rows into ${table}`);
}

// Se define la funcion main
async function main() {
  // Se define la fase
  console.log('ETL Phase 1: INGEST');
  // Se define el directorio
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  // Se define el cliente
  const client = new Client({
    connectionString: process.env['DATABASE_URL']?.replace('?schema=gold', '') ?? '',
  });
  // Se conecta al cliente
  await client.connect();

  // Se define el log
  console.log('\n📦 Creating raw schema and tables...');
  // Se ejecuta la transformacion
  await client.query(RAW_DDL);

  // Se recorre el array de archivos
  for (const file of FILES) {
    const dest = path.join(DATA_DIR, file.name);
    console.log(`\n📥 Downloading: ${file.name}`);
    await downloadFile(file.url, dest);
    console.log(`📂 Loading to ${file.table}...`);
    await loadCsvToTable(client, dest, file.table);
  }
  // Se desconecta del cliente
  await client.end();
  // Se define el log de exito
  console.log('\n✅ Ingest complete!');
}

// Se define el catch
main().catch((err) => {
  console.error('❌ Ingest failed:', err);
  process.exit(1);
});
