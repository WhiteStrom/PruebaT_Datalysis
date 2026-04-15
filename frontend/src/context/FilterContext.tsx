'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { DashboardFilters } from '@/lib/types';

// Se define la interface FilterContextValue (Se encarga de definir las propiedades del contexto de filtros)
interface FilterContextValue {
  filters: DashboardFilters;
  setFilter: <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => void;
  resetFilters: () => void;
}

// Se define los filtros por defecto
const DEFAULT_FILTERS: DashboardFilters = {
  startDate: '2016-01-01',
  endDate: '2018-12-31',
  granularity: 'monthly',
};

// Se crea el contexto de filtros
const FilterContext = createContext<FilterContextValue | null>(null);

// Se define la funcion FilterProvider (Se encarga de proveer el contexto de filtros)
export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);

  // Se define la funcion setFilter (Se encarga de establecer los filtros)
  const setFilter = useCallback(
    <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value || undefined }));
    },
    []
  );

  // Se define la funcion resetFilters (Se encarga de resetear los filtros)
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Se retorna el proveedor de filtros
  return (
    <FilterContext.Provider value={{ filters, setFilter, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

// Se define la funcion useFilters (Se encarga de usar el contexto de filtros)
export function useFilters(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used within FilterProvider');
  return ctx;
}
