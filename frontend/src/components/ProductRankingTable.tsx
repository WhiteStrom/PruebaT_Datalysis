'use client';

import type { ProductRanking } from '@/lib/types';

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'BRL' }).format(val);
}

// Se define la interface ProductRankingTableProps (Se encarga de definir las propiedades de la tabla de ranking de productos)
interface ProductRankingTableProps {
  data: ProductRanking[];
  loading: boolean;
}

// Se define la funcion ProductRankingTable (Se encarga de mostrar la tabla de ranking de productos)
export function ProductRankingTable({ data, loading }: ProductRankingTableProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 animate-pulse">
        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-48 mb-4" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded mb-2" />
        ))}
      </div>
    );
  }

  // Se retorna la tabla de ranking de productos
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">
        🏆 Top 10 Productos por Ingresos
      </h2>
      <div className="overflow-auto max-h-80">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white dark:bg-gray-900">
            <tr className="text-left text-gray-400 border-b border-gray-100 dark:border-gray-800">
              <th className="pb-2 font-medium w-8">#</th>
              <th className="pb-2 font-medium">Producto</th>
              <th className="pb-2 font-medium">Categoría</th>
              <th className="pb-2 font-medium text-right">Ingresos</th>
              <th className="pb-2 font-medium text-right">Pedidos</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.productId}
                className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="py-2 text-gray-400 font-mono text-xs">{row.rank}</td>
                <td className="py-2 font-mono text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
                  {row.productId.slice(0, 8)}…
                </td>
                <td className="py-2 text-gray-700 dark:text-gray-300 text-xs">
                  <span className="bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded-full px-2 py-0.5 text-xs">
                    {row.categoryName}
                  </span>
                </td>
                <td className="py-2 text-right tabular-nums font-medium text-emerald-600 dark:text-emerald-400 text-xs">
                  {formatCurrency(row.totalRevenue)}
                </td>
                <td className="py-2 text-right tabular-nums text-gray-600 dark:text-gray-400 text-xs">
                  {row.totalOrders.toLocaleString('es-ES')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
