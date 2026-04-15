//Interfaces de Entidades (Completos)

// KPIs (Ya Estaban Completos)
export interface KpiSnapshot {
  gmv: number;           // Valor Bruto de Mercancia (suma del precio)
  revenue: number;       // Ingresos (suma del valor del pago)
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number; // AOV = revenue / totalOrders
  avgFreight: number;
}

// Punto de Tendencia (Ya Estaba Completo)
export interface TrendPoint {
  date: string;         // YYYY-MM-DD
  orders: number;
  revenue: number;
}

// Ranking de Productos (Completo)
export interface ProductRanking {
  productId: string;
  categoryName: string;
  totalRevenue: number;
  totalOrders: number;
  rank: number;
}

// Ranking de Categorias (Completo)
export interface CategoryRanking {
  categoryName: string;
  totalRevenue: number;
  totalOrders: number;
  percentage: number;
}

// Filtros utilizados en los casos de uso (Corregido)
export interface DashboardFilters {
  startDate?: string;   // YYYY-MM-DD
  endDate?: string;     // YYYY-MM-DD
  state?: string;       // Abreviatura del estado
  category?: string;    // Nombre de la categoria
  granularity?: 'daily' | 'weekly' | 'monthly';
}
