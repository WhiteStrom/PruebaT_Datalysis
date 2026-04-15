/**
 * ETL Phase 2 - CLEAN
 * Transforms raw data into the clean schema:
 * - Type casting (TEXT → proper types)
 * - Deduplication
 * - NULL handling
 * - Basic data quality rules
 */
import '../loadEnv';
import { Client } from 'pg';

const CLEAN_DDL = `
CREATE SCHEMA IF NOT EXISTS clean;

DROP TABLE IF EXISTS clean.order_items;
DROP TABLE IF EXISTS clean.order_payments;
DROP TABLE IF EXISTS clean.orders;
DROP TABLE IF EXISTS clean.customers;
DROP TABLE IF EXISTS clean.products;

-- Clean orders
CREATE TABLE clean.orders AS
SELECT DISTINCT ON (order_id)
  order_id,
  customer_id,
  order_status,
  order_purchase_timestamp::TIMESTAMPTZ        AS order_purchase_timestamp,
  NULLIF(order_approved_at, '')::TIMESTAMPTZ   AS order_approved_at,
  NULLIF(order_delivered_carrier_date, '')::TIMESTAMPTZ  AS order_delivered_carrier_date,
  NULLIF(order_delivered_customer_date, '')::TIMESTAMPTZ AS order_delivered_customer_date,
  order_estimated_delivery_date::TIMESTAMPTZ   AS order_estimated_delivery_date
FROM raw.orders
WHERE order_id IS NOT NULL
  AND customer_id IS NOT NULL
  AND order_purchase_timestamp ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
ORDER BY order_id, order_purchase_timestamp;

ALTER TABLE clean.orders ADD PRIMARY KEY (order_id);

-- Clean order items
CREATE TABLE clean.order_items AS
SELECT DISTINCT ON (order_id, order_item_id)
  order_id,
  order_item_id::INT                  AS order_item_id,
  product_id,
  seller_id,
  NULLIF(shipping_limit_date, '')::TIMESTAMPTZ AS shipping_limit_date,
  price::NUMERIC(12,2)                AS price,
  freight_value::NUMERIC(12,2)        AS freight_value
FROM raw.order_items
WHERE order_id IS NOT NULL
  AND product_id IS NOT NULL
  AND price ~ '^[0-9]'
  AND freight_value ~ '^[0-9]'
ORDER BY order_id, order_item_id;

-- Clean customers
CREATE TABLE clean.customers AS
SELECT DISTINCT ON (customer_id)
  customer_id,
  customer_unique_id,
  customer_zip_code_prefix AS customer_zip_code,
  customer_city,
  UPPER(TRIM(customer_state)) AS customer_state
FROM raw.customers
WHERE customer_id IS NOT NULL
ORDER BY customer_id;

ALTER TABLE clean.customers ADD PRIMARY KEY (customer_id);

-- Clean products
CREATE TABLE clean.products AS
SELECT DISTINCT ON (product_id)
  product_id,
  NULLIF(TRIM(product_category_name), '') AS product_category_name,
  NULLIF(product_weight_g, '')::NUMERIC   AS product_weight_g,
  NULLIF(product_length_cm, '')::NUMERIC  AS product_length_cm,
  NULLIF(product_height_cm, '')::NUMERIC  AS product_height_cm,
  NULLIF(product_width_cm, '')::NUMERIC   AS product_width_cm
FROM raw.products
WHERE product_id IS NOT NULL
ORDER BY product_id;

ALTER TABLE clean.products ADD PRIMARY KEY (product_id);

-- Clean order payments (aggregate all payment types per order)
CREATE TABLE clean.order_payments AS
SELECT
  order_id,
  SUM(payment_value::NUMERIC(12,2)) AS total_payment_value,
  MAX(payment_installments::INT)    AS max_installments
FROM raw.order_payments
WHERE order_id IS NOT NULL
  AND payment_value ~ '^[0-9]'
GROUP BY order_id;

ALTER TABLE clean.order_payments ADD PRIMARY KEY (order_id);

-- Indexes for ETL joins
CREATE INDEX IF NOT EXISTS idx_clean_order_items_order_id ON clean.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_clean_orders_customer_id  ON clean.orders (customer_id);
`;

async function main() {
  // Se define la fase
  console.log('ETL Phase 2: CLEAN');

  // Se define el cliente
  const client = new Client({
    connectionString: process.env['DATABASE_URL']?.replace('?schema=gold', '') ?? '',
  });

  // Se conecta al cliente
  await client.connect();

  // Se ejecuta la transformacion
  console.log('\n Running clean transformations...');
  await client.query(CLEAN_DDL);

  // Validate counts
  const tables = ['clean.orders', 'clean.order_items', 'clean.customers', 'clean.products', 'clean.order_payments'];
  for (const t of tables) {
    const res = await client.query(`SELECT COUNT(*) AS cnt FROM ${t}`);
    console.log(`  ✅ ${t}: ${res.rows[0].cnt} rows`);
  }

  // Se desconecta del cliente
  await client.end();
  console.log('\n✅ Clean transformation complete!');
}

// Se ejecuta la funcion main
main().catch((err) => {
  console.error('❌ Clean failed:', err);
  process.exit(1);
});
