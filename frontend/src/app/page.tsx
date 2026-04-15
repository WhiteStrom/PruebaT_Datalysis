'use client';

import { useEffect, useState, useCallback } from 'react';
import { useFilters } from '@/context/FilterContext';
import { fetchKpis, fetchTrend, fetchTopProducts, fetchTopCategories } from '@/lib/api';
import type { KpiSnapshot, TrendPoint, ProductRanking, CategoryRanking } from '@/lib/types';
import { KpiCards } from '@/components/KpiCards';
import { TrendChart } from '@/components/TrendChart';
import { ProductRankingTable } from '@/components/ProductRankingTable';
import { CategoryChart } from '@/components/CategoryChart';
import { FilterBar } from '@/components/FilterBar';

export default function DashboardPage() {
  const { filters } = useFilters();

  const [kpis, setKpis] = useState<KpiSnapshot | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [products, setProducts] = useState<ProductRanking[]>([]);
  const [categories, setCategories] = useState<CategoryRanking[]>([]);

  const [loadingKpis, setLoadingKpis] = useState(true);
  const [loadingTrend, setLoadingTrend] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoadingKpis(true);
    setLoadingTrend(true);
    setLoadingProducts(true);
    setLoadingCategories(true);
    setError(null);

    try {
      const [k, t, p, c] = await Promise.all([
        fetchKpis(filters),
        fetchTrend(filters),
        fetchTopProducts(filters, 10),
        fetchTopCategories(filters, 8),
      ]);
      setKpis(k);
      setTrend(t);
      setProducts(p);
      setCategories(c);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
    } finally {
      setLoadingKpis(false);
      setLoadingTrend(false);
      setLoadingProducts(false);
      setLoadingCategories(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          🇧🇷 Dashboard Comercial — E-Commerce Brasil
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Análisis basado en el dataset Olist · Arquitectura hexagonal + Star Schema
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-2">
          <span className="text-red-500">⚠️</span>
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={loadData}
            className="ml-auto text-xs text-red-600 dark:text-red-400 hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        <FilterBar />
      </div>

      {/* KPI Row */}
      <div className="mb-6">
        <KpiCards data={kpis} loading={loadingKpis} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <TrendChart data={trend} loading={loadingTrend} />
        </div>
        <div>
          <CategoryChart data={categories} loading={loadingCategories} />
        </div>
      </div>

      {/* Products Table */}
      <ProductRankingTable data={products} loading={loadingProducts} />

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-8">
        Datalysis · Prueba Técnica L1 · {new Date().getFullYear()}
      </p>
    </main>
  );
}
