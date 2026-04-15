'use client';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import type { CategoryRanking } from '@/lib/types';

const COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#84cc16'];

// Se define la funcion formatCurrency (Se encarga de formatear el valor de la moneda)
function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `R$ ${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `R$ ${(val / 1_000).toFixed(0)}K`;
  return `R$ ${val.toFixed(0)}`;
}

interface CategoryChartProps {
  data: CategoryRanking[];
  loading: boolean;
}

// Se define la funcion CategoryChart (Se encarga de mostrar los ingresos por categoría)
export function CategoryChart({ data, loading }: CategoryChartProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 animate-pulse">
        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-48 mb-4" />
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto w-64" />
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.categoryName,
    value: d.totalRevenue,
    percentage: d.percentage,
  }));

  // Se retorna el gráfico de pastel
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">
        🥧 Ingresos por Categoría
      </h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(val: ValueType | undefined, name: NameType | undefined) => [
              formatCurrency(Number(val ?? 0)),
              String(name ?? ''),
            ]}
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              fontSize: '12px',
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(val) => <span className="text-xs text-gray-600 dark:text-gray-400">{val}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
