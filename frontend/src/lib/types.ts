// Tipos compartidos de TypeScript para el frontend (refleja las entidades de dominio del backend)

// Se define la interface KpiSnapshot (Se encarga de definir los KPIs)
export interface KpiSnapshot {
  gmv: number;
  revenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
  avgFreight: number;
}

// Se define la interface TrendPoint (Se encarga de definir la tendencia)
export interface TrendPoint {
  date: string;
  orders: number;
  revenue: number;
}

// Se define la interface ProductRanking (Se encarga de definir el ranking de productos)
export interface ProductRanking {
  productId: string;
  categoryName: string;
  totalRevenue: number;
  totalOrders: number;
  rank: number;
}

// Se define la interface CategoryRanking (Se encarga de definir el ranking de categorías)
export interface CategoryRanking {
  categoryName: string;
  totalRevenue: number;
  totalOrders: number;
  percentage: number;
}

// Se define la interface DashboardFilters (Se encarga de definir los filtros del dashboard)
export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  state?: string;
  category?: string;
  granularity?: 'daily' | 'weekly' | 'monthly';
}
