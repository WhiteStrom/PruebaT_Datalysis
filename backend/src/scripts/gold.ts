/**
 * ETL Phase 3 - GOLD (Star Schema)
 *
 * Builds the analytical star schema in the `gold` schema:
 *   - dim_date
 *   - dim_customer
 *   - dim_product
 *   - dim_order
 *   - fact_sales (grain: 1 row per order_item)
 *
 * KEY RULE: payment_value is allocated proportionally to item_price
 * within each order so that SUM(fact_sales.payment_value) == order total.
 */
import '../loadEnv';
import { Client } from 'pg';

const GOLD_DDL = `
-- ─── DIMENSIONS ──────────────────────────────────────────────────────────────

-- dim_date: one row per calendar day present in the orders
DROP TABLE IF EXISTS gold.fact_sales;
DROP TABLE IF EXISTS gold.dim_date;
DROP TABLE IF EXISTS gold.dim_customer;
DROP TABLE IF EXISTS gold.dim_product;
DROP TABLE IF EXISTS gold.dim_order;

CREATE TABLE gold.dim_date AS
SELECT DISTINCT
  DATE_TRUNC('day', order_purchase_timestamp)::DATE AS date_id,
  EXTRACT(DAY   FROM order_purchase_timestamp)::INT  AS day,
  EXTRACT(MONTH FROM order_purchase_timestamp)::INT  AS month,
  EXTRACT(YEAR  FROM order_purchase_timestamp)::INT  AS year,
  EXTRACT(QUARTER FROM order_purchase_timestamp)::INT AS quarter,
  EXTRACT(ISODOW FROM order_purchase_timestamp) IN (6, 7) AS is_weekend
FROM clean.orders
WHERE order_purchase_timestamp IS NOT NULL;

ALTER TABLE gold.dim_date ADD PRIMARY KEY (date_id);

-- dim_customer
CREATE TABLE gold.dim_customer AS
SELECT
  customer_id,
  customer_unique_id,
  customer_zip_code,
  customer_city,
  customer_state
FROM clean.customers;

ALTER TABLE gold.dim_customer ADD PRIMARY KEY (customer_id);

-- dim_product
CREATE TABLE gold.dim_product AS
SELECT
  product_id,
  product_category_name,
  product_weight_g,
  product_length_cm,
  product_height_cm,
  product_width_cm
FROM clean.products;

ALTER TABLE gold.dim_product ADD PRIMARY KEY (product_id);

-- dim_order (SCD Type 0 — order attributes don't change analytically)
CREATE TABLE gold.dim_order AS
SELECT
  order_id,
  order_status,
  order_purchase_timestamp,
  order_approved_at,
  order_delivered_carrier_date,
  order_delivered_customer_date,
  order_estimated_delivery_date
FROM clean.orders;

ALTER TABLE gold.dim_order ADD PRIMARY KEY (order_id);

-- ─── FACT TABLE ──────────────────────────────────────────────────────────────
-- Grain: 1 row per order item
-- payment_value is distributed proportionally by price within each order
CREATE TABLE gold.fact_sales AS
WITH
  -- Filter to 'delivered' orders only (canonical definition of a sale)
  delivered_orders AS (
    SELECT order_id, customer_id, order_purchase_timestamp::DATE AS purchase_date
    FROM clean.orders
    WHERE order_status = 'delivered'
  ),

  -- Order-level totals for proportional allocation
  order_item_totals AS (
    SELECT order_id, SUM(price) AS total_price
    FROM clean.order_items
    GROUP BY order_id
  ),

  -- Join items with order payment value
  items_with_payment AS (
    SELECT
      oi.order_id,
      oi.order_item_id,
      oi.product_id,
      oi.price,
      oi.freight_value,
      COALESCE(op.total_payment_value, 0)               AS order_payment_value,
      COALESCE(oit.total_price, 1)                      AS order_total_price,
      -- Proportional payment: item_price / order_total_price * order_payment_value
      ROUND(
        (oi.price / NULLIF(oit.total_price, 0))
        * COALESCE(op.total_payment_value, oi.price + oi.freight_value),
        2
      )                                                 AS payment_value
    FROM clean.order_items oi
    LEFT JOIN order_item_totals oit ON oi.order_id = oit.order_id
    LEFT JOIN clean.order_payments op ON oi.order_id = op.order_id
  )

SELECT
  -- Synthetic unique ID: order_id + item_id
  do_.order_id || '_' || iwp.order_item_id::TEXT       AS order_item_id,
  do_.order_id,
  iwp.product_id,
  do_.customer_id,
  do_.purchase_date                                    AS date_id,
  iwp.price,
  iwp.freight_value,
  iwp.payment_value
FROM delivered_orders do_
JOIN items_with_payment iwp ON do_.order_id = iwp.order_id
-- Only include items whose product exists in dim_product
WHERE iwp.product_id IN (SELECT product_id FROM gold.dim_product);

ALTER TABLE gold.fact_sales ADD PRIMARY KEY (order_item_id);

-- Foreign Keys
ALTER TABLE gold.fact_sales
  ADD CONSTRAINT fk_fs_order    FOREIGN KEY (order_id)    REFERENCES gold.dim_order    (order_id),
  ADD CONSTRAINT fk_fs_product  FOREIGN KEY (product_id)  REFERENCES gold.dim_product  (product_id),
  ADD CONSTRAINT fk_fs_customer FOREIGN KEY (customer_id) REFERENCES gold.dim_customer (customer_id),
  ADD CONSTRAINT fk_fs_date     FOREIGN KEY (date_id)     REFERENCES gold.dim_date     (date_id);

-- Analytical indexes
CREATE INDEX IF NOT EXISTS idx_fs_date_id     ON gold.fact_sales (date_id);
CREATE INDEX IF NOT EXISTS idx_fs_product_id  ON gold.fact_sales (product_id);
CREATE INDEX IF NOT EXISTS idx_fs_customer_id ON gold.fact_sales (customer_id);
CREATE INDEX IF NOT EXISTS idx_fs_order_id    ON gold.fact_sales (order_id);
`;

async function main() {
  // Se define la fase
  console.log('ETL Phase 3: GOLD (Star Schema)');

  // Se define el cliente
  const client = new Client({
    connectionString: process.env['DATABASE_URL']?.replace('?schema=gold', '') ?? '',
  });
  // Se conecta al cliente
  await client.connect();

  // Se ejecuta la transformacion
  console.log('\n Building star schema...');
  await client.query(GOLD_DDL);

  // Se define el summary de la tabla gold
  const summary = await client.query(`
    SELECT
      (SELECT COUNT(*) FROM gold.dim_date)     AS dates,
      (SELECT COUNT(*) FROM gold.dim_customer) AS customers,
      (SELECT COUNT(*) FROM gold.dim_product)  AS products,
      (SELECT COUNT(*) FROM gold.dim_order)    AS orders,
      (SELECT COUNT(*) FROM gold.fact_sales)   AS fact_rows,
      (SELECT SUM(payment_value) FROM gold.fact_sales) AS total_gmv
  `);

  // Se define la fila
  const row = summary.rows[0];
  console.log('\n Gold Layer Summary:');
  console.log(`  dim_date:     ${row.dates} rows`);
  console.log(`  dim_customer: ${row.customers} rows`);
  console.log(`  dim_product:  ${row.products} rows`);
  console.log(`  dim_order:    ${row.orders} rows`);
  console.log(`  fact_sales:   ${row.fact_rows} rows`);
  console.log(`  Total GMV:    R$ ${Number(row.total_gmv).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`);
  
  // Se desconecta del cliente
  await client.end();
  console.log('\n✅ Gold ETL complete!');
}

// Se ejecuta la funcion main
main().catch((err) => {
  console.error('❌ Gold ETL failed:', err);
  process.exit(1);
});
