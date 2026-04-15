'use client';

import { useEffect, useState } from 'react';
import { useFilters } from '@/context/FilterContext';
import { fetchStates, fetchCategories } from '@/lib/api';

export function FilterBar() {
  const { filters, setFilter, resetFilters } = useFilters();
  const [states, setStates] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    // Se encarga de obtener los estados y categorías
    fetchStates().then(setStates).catch(console.error);
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-wrap gap-3 items-center">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 shrink-0">🔍 Filtros:</span>

      {/* Filtros de fecha */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-400">De</label>
        <input
          type="date"
          value={filters.startDate ?? ''}
          onChange={(e) => setFilter('startDate', e.target.value || undefined)}
          className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label className="text-xs text-gray-400">Hasta</label>
        <input
          type="date"
          value={filters.endDate ?? ''}
          onChange={(e) => setFilter('endDate', e.target.value || undefined)}
          className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filtros de estado */}
      <select
        value={filters.state ?? ''}
        onChange={(e) => setFilter('state', e.target.value || undefined)}
        className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todos los Estados</option>
        {states.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Filtros de categoría */}
      <select
        value={filters.category ?? ''}
        onChange={(e) => setFilter('category', e.target.value || undefined)}
        className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todas las Categorías</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Filtros de granularidad */}
      <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {(['daily', 'weekly', 'monthly'] as const).map((g) => (
          <button
            key={g}
            onClick={() => setFilter('granularity', g)}
            className={`text-xs px-3 py-1.5 transition-colors ${
              filters.granularity === g
                ? 'bg-blue-600 text-white'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {g === 'daily' ? 'Diario' : g === 'weekly' ? 'Semanal' : 'Mensual'}
          </button>
        ))}
      </div>

      {/* Filtros de reset */}
      <button
        onClick={resetFilters}
        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors ml-auto"
      >
        ↩ Restablecer
      </button>
    </div>
  );
}
