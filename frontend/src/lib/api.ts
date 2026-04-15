import type { KpiSnapshot, TrendPoint, ProductRanking, CategoryRanking, DashboardFilters } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// Se define la funcion apiFetch (Se encarga de hacer las peticiones a la API)
async function apiFetch<T>(path: string, filters?: DashboardFilters): Promise<T> {
  const params = new URLSearchParams();
  if (filters?.startDate) params.set('startDate', filters.startDate);
  if (filters?.endDate) params.set('endDate', filters.endDate);
  if (filters?.state) params.set('state', filters.state);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.granularity) params.set('granularity', filters.granularity);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${BASE_URL}/api${path}${query}`, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  const json = await res.json() as { success: boolean; data: T };
  return json.data;
}

// Se define la funcion fetchKpis (Se encarga de obtener los KPIs)
export async function fetchKpis(filters: DashboardFilters): Promise<KpiSnapshot> {
  return apiFetch<KpiSnapshot>('/kpis', filters);
}

// Se define la funcion fetchTrend (Se encarga de obtener la tendencia)
export async function fetchTrend(filters: DashboardFilters): Promise<TrendPoint[]> {
  return apiFetch<TrendPoint[]>('/trend', filters);
}

// Se define la funcion fetchTopProducts (Se encarga de obtener el top de productos)
export async function fetchTopProducts(filters: DashboardFilters, limit = 10): Promise<ProductRanking[]> {
  const p = new URLSearchParams();
  if (filters.startDate) p.set('startDate', filters.startDate);
  if (filters.endDate) p.set('endDate', filters.endDate);
  if (filters.state) p.set('state', filters.state);
  if (filters.category) p.set('category', filters.category);
  p.set('limit', String(limit));
  const res = await fetch(`${BASE_URL}/api/rankings/products?${p}`, { cache: 'no-store' });
  const json = await res.json() as { success: boolean; data: ProductRanking[] };
  return json.data;
}

// Se define la funcion fetchTopCategories (Se encarga de obtener el top de categorías)
export async function fetchTopCategories(filters: DashboardFilters, limit = 8): Promise<CategoryRanking[]> {
  const p = new URLSearchParams();
  if (filters.startDate) p.set('startDate', filters.startDate);
  if (filters.endDate) p.set('endDate', filters.endDate);
  if (filters.state) p.set('state', filters.state);
  p.set('limit', String(limit));
  const res = await fetch(`${BASE_URL}/api/rankings/categories?${p}`, { cache: 'no-store' });
  const json = await res.json() as { success: boolean; data: CategoryRanking[] };
  return json.data;
}

// Se define la funcion fetchStates (Se encarga de obtener los estados)
export async function fetchStates(): Promise<string[]> {
  return apiFetch<string[]>('/filters/states');
}

// Se define la funcion fetchCategories (Se encarga de obtener las categorías)
export async function fetchCategories(): Promise<string[]> {
  return apiFetch<string[]>('/filters/categories');
}
