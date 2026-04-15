import { PrismaClient } from '@prisma/client';
import type { DashboardRepository } from '../../domain/ports';
import type {
  KpiSnapshot,
  TrendPoint,
  ProductRanking,
  CategoryRanking,
  DashboardFilters,
} from '../../domain/entities'; // Importacion de Interfaces de Entidades (Completos)

//  Manekjo de Filtros para las consultas SQL
function buildWhereClause(filters: DashboardFilters): {
  dateFilter: string;
  stateFilter: string;
  categoryFilter: string;
  params: (string | Date)[];
  paramIndex: number;
} {
  const conditions: string[] = [];
  const params: (string | Date)[] = [];
  let paramIndex = 1;
  // Filtros de fecha
  if (filters.startDate) {
    conditions.push(`fs.date_id >= $${paramIndex++}`);
    params.push(new Date(filters.startDate));
  }
  if (filters.endDate) {
    conditions.push(`fs.date_id <= $${paramIndex++}`);
    params.push(new Date(filters.endDate));
  }
  const whereStr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  // Filtros de estado
  let stateFilter = '';
  let stateParamIndex = paramIndex;
  if (filters.state) {
    stateFilter = `AND dc.customer_state = $${paramIndex++}`;
    params.push(filters.state);
  }
  // Filtros de categoria
  let categoryFilter = '';
  if (filters.category) {
    categoryFilter = `AND dp.product_category_name = $${paramIndex++}`;
    params.push(filters.category);
  }
  // Retorno de los filtros
  return {
    dateFilter: whereStr,
    stateFilter,
    categoryFilter,
    params,
    paramIndex,
  };
}

// Implementacion de PrismaDashboardRepository
export class PrismaDashboardRepository implements DashboardRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
  // Implementacion de getKpis (Completos)
  async getKpis(filters: DashboardFilters): Promise<KpiSnapshot> {
    const conditions: string[] = ['1=1'];
    const params: unknown[] = [];
    let pi = 1;
    // Filtros de fecha
    if (filters.startDate) {
      conditions.push(`fs.date_id >= $${pi++}`);
      params.push(new Date(filters.startDate));
    }
    if (filters.endDate) {
      conditions.push(`fs.date_id <= $${pi++}`);
      params.push(new Date(filters.endDate));
    }
    // Filtros de estado
    if (filters.state) {
      conditions.push(`dc.customer_state = $${pi++}`);
      params.push(filters.state);
    }
    // Filtros de categoria
    if (filters.category) {
      conditions.push(`dp.product_category_name = $${pi++}`);
      params.push(filters.category);
    }
    // Construccion de la clausula WHERE
    const whereClause = conditions.join(' AND ');

    const result = await this.prisma.$queryRawUnsafe<
      Array<{
        gmv: string;
        revenue: string;
        total_orders: string;
        total_customers: string;
      }>
    >(
      `
      SELECT
        SUM(fs.price)           AS gmv,
        SUM(fs.payment_value)   AS revenue,
        COUNT(DISTINCT fs.order_id)     AS total_orders,
        COUNT(DISTINCT fs.customer_id)  AS total_customers
      FROM gold.fact_sales fs
      JOIN gold.dim_customer dc ON fs.customer_id = dc.customer_id
      JOIN gold.dim_product  dp ON fs.product_id  = dp.product_id
      WHERE ${whereClause}
      `,
      ...params
    );// Ejecucion de la consulta

    const row = result[0];
    const gmv = Number(row?.gmv ?? 0);
    const revenue = Number(row?.revenue ?? 0);
    const totalOrders = Number(row?.total_orders ?? 0);
    const totalCustomers = Number(row?.total_customers ?? 0);
    // Retorno de los KPIs
    return {
      gmv,
      revenue,
      totalOrders,
      totalCustomers,
      avgOrderValue: totalOrders > 0 ? revenue / totalOrders : 0,
      avgFreight: 0, // Computed separately if needed
    };
  }
  // Implementacion de getTrend (Completos)
  async getTrend(filters: DashboardFilters): Promise<TrendPoint[]> {
    const conditions: string[] = ['1=1'];
    const params: unknown[] = [];
    let pi = 1;
    // Filtros de granularidad
    const granularity = filters.granularity ?? 'daily';
    let truncFn = 'day';
    if (granularity === 'weekly') truncFn = 'week';
    if (granularity === 'monthly') truncFn = 'month';
    // Filtros de fecha
    if (filters.startDate) {
      conditions.push(`fs.date_id >= $${pi++}`);
      params.push(new Date(filters.startDate));
    }
    if (filters.endDate) {
      conditions.push(`fs.date_id <= $${pi++}`);
      params.push(new Date(filters.endDate));
    }
    // Filtros de estado
    if (filters.state) {
      conditions.push(`dc.customer_state = $${pi++}`);
      params.push(filters.state);
    }
    // Filtros de categoria
    if (filters.category) {
      conditions.push(`dp.product_category_name = $${pi++}`);
      params.push(filters.category);
    }

    const whereClause = conditions.join(' AND ');

    const rows = await this.prisma.$queryRawUnsafe<
      Array<{ period: Date; orders: string; revenue: string }>
    >(
      `
      SELECT
        DATE_TRUNC('${truncFn}', fs.date_id) AS period,
        COUNT(DISTINCT fs.order_id)           AS orders,
        SUM(fs.payment_value)                 AS revenue
      FROM gold.fact_sales fs
      JOIN gold.dim_customer dc ON fs.customer_id = dc.customer_id
      JOIN gold.dim_product  dp ON fs.product_id  = dp.product_id
      WHERE ${whereClause}
      GROUP BY period
      ORDER BY period ASC
      `,
      ...params
    );// Ejecucion de la consulta

    return rows.map((r) => ({
      date: r.period.toISOString().slice(0, 10),
      orders: Number(r.orders),
      revenue: Number(r.revenue),
    })); // Retorno de los KPIs
  }
  // Implementacion de getTopProducts (Completos)
  async getTopProducts(filters: DashboardFilters, limit = 10): Promise<ProductRanking[]> {
    const conditions: string[] = ['1=1'];
    const params: unknown[] = [];
    let pi = 1;
    // Filtros de fecha
    if (filters.startDate) {
      conditions.push(`fs.date_id >= $${pi++}`);
      params.push(new Date(filters.startDate));
    }
    if (filters.endDate) {
      conditions.push(`fs.date_id <= $${pi++}`);
      params.push(new Date(filters.endDate));
    }
    // Filtros de estado
    if (filters.state) {
      conditions.push(`dc.customer_state = $${pi++}`);
      params.push(filters.state);
    }
    // Filtros de categoria
    if (filters.category) {
      conditions.push(`dp.product_category_name = $${pi++}`);
      params.push(filters.category);
    }
    // Filtros de limite
    params.push(limit);
    const limitParam = pi++;
    const whereClause = conditions.join(' AND ');
    // Ejecucion de la consulta
    const rows = await this.prisma.$queryRawUnsafe<
      Array<{
        product_id: string;
        category_name: string;
        total_revenue: string;
        total_orders: string;
      }>
    >(
      `
      SELECT
        dp.product_id,
        COALESCE(dp.product_category_name, 'Unknown') AS category_name,
        SUM(fs.payment_value)                          AS total_revenue,
        COUNT(DISTINCT fs.order_id)                    AS total_orders
      FROM gold.fact_sales fs
      JOIN gold.dim_customer dc ON fs.customer_id = dc.customer_id
      JOIN gold.dim_product  dp ON fs.product_id  = dp.product_id
      WHERE ${whereClause}
      GROUP BY dp.product_id, dp.product_category_name
      ORDER BY total_revenue DESC
      LIMIT $${limitParam}
      `,
      ...params
    );// Ejecucion de la consulta
    // Retorno de los KPIs
    return rows.map((r, idx) => ({
      productId: r.product_id,
      categoryName: r.category_name,
      totalRevenue: Number(r.total_revenue),
      totalOrders: Number(r.total_orders),
      rank: idx + 1,
    }));
  }

  // Implementacion de getTopCategories (Completos)
  async getTopCategories(filters: DashboardFilters, limit = 10): Promise<CategoryRanking[]> {
    const conditions: string[] = ['1=1'];
    const params: unknown[] = [];
    let pi = 1;
    // Filtros de fecha
    if (filters.startDate) {
      conditions.push(`fs.date_id >= $${pi++}`);
      params.push(new Date(filters.startDate));
    }
    // Filtros de fecha
    if (filters.endDate) {
      conditions.push(`fs.date_id <= $${pi++}`);
      params.push(new Date(filters.endDate));
    }
    if (filters.state) {
      conditions.push(`dc.customer_state = $${pi++}`);
      params.push(filters.state);
    }
    // Filtros de limite  
    params.push(limit);
    const limitParam = pi++;
    const whereClause = conditions.join(' AND ');

    const rows = await this.prisma.$queryRawUnsafe<
      Array<{
        category_name: string;
        total_revenue: string;
        total_orders: string;
      }>
    >(
      `
      SELECT
        COALESCE(dp.product_category_name, 'Unknown') AS category_name,
        SUM(fs.payment_value)                          AS total_revenue,
        COUNT(DISTINCT fs.order_id)                    AS total_orders
      FROM gold.fact_sales fs
      JOIN gold.dim_customer dc ON fs.customer_id = dc.customer_id
      JOIN gold.dim_product  dp ON fs.product_id  = dp.product_id
      WHERE ${whereClause}
      GROUP BY dp.product_category_name
      ORDER BY total_revenue DESC
      LIMIT $${limitParam}
      `,
      ...params
    );// Ejecucion de la consulta
    // Calculo del total de ingresos
    const grandTotal = rows.reduce((s, r) => s + Number(r.total_revenue), 0);
    // Retorno de los KPIs
    return rows.map((r) => ({
      categoryName: r.category_name,
      totalRevenue: Number(r.total_revenue),
      totalOrders: Number(r.total_orders),
      percentage: grandTotal > 0 ? (Number(r.total_revenue) / grandTotal) * 100 : 0,
    }));
  }

  // Implementacion de getAvailableStates (Completos)
  async getAvailableStates(): Promise<string[]> {
    const rows = await this.prisma.$queryRaw<Array<{ customer_state: string }>>`
      SELECT DISTINCT customer_state FROM gold.dim_customer ORDER BY customer_state
    `;
    return rows.map((r) => r.customer_state);// Retorno de los estados
  }

  // Implementacion de getAvailableCategories (Completos)
  async getAvailableCategories(): Promise<string[]> {
    const rows = await this.prisma.$queryRaw<Array<{ product_category_name: string }>>`
      SELECT DISTINCT product_category_name
      FROM gold.dim_product
      WHERE product_category_name IS NOT NULL
      ORDER BY product_category_name
    `;
    return rows.map((r) => r.product_category_name);// Retorno de las categorias
  }
}
