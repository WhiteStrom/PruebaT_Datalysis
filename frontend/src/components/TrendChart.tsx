'use client';

import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import type { TrendPoint } from '@/lib/types';

// Se define la funcion formatDate (Se encarga de formatear la fecha)
function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
}

// Se define la funcion formatCurrency (Se encarga de formatear el valor de la moneda)
function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `R$ ${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `R$ ${(val / 1_000).toFixed(0)}K`;
  return `R$ ${val.toFixed(0)}`;
}

// Se define la interface TrendChartProps (Se encarga de definir las propiedades del gráfico de tendencia)
interface TrendChartProps {
  data: TrendPoint[];
  loading: boolean;
}

// Se define la funcion TrendChart (Se encarga de mostrar el gráfico de tendencia)
export function TrendChart({ data, loading }: TrendChartProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 animate-pulse">
        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-48 mb-4" />
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl" />
      </div>
    );
  }

  // Se define la lista de datos del gráfico
  const chartData = data.map((d) => ({ ...d, dateLabel: formatDate(d.date) }));

  // Se retorna el gráfico de tendencia
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">
        📈 Tendencia: Ingresos y Pedidos
      </h2>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={formatCurrency}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            width={70}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value: ValueType | undefined, name: NameType | undefined) => [
              String(name ?? '') === 'revenue'
                ? formatCurrency(Number(value ?? 0))
                : Number(value ?? 0).toLocaleString('es-ES'),
              String(name ?? '') === 'revenue' ? 'Ingresos' : 'Pedidos',
            ]}
            labelFormatter={(label) => `Período: ${label}`}
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              fontSize: '12px',
            }}
          />
          <Legend
            formatter={(val) => (val === 'revenue' ? 'Ingresos' : 'Pedidos')}
            iconType="circle"
            iconSize={8}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#gradRevenue)"
            dot={false}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#gradOrders)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
