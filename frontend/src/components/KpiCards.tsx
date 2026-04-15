'use client';

import type { KpiSnapshot } from '@/lib/types';

// Se define la funcion formatCurrency (Se encarga de formatear el valor de la moneda)
function formatCurrency(val: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'BRL' }).format(val);
}

// Se define la funcion formatNumber (Se encarga de formatear el valor de los números)
function formatNumber(val: number): string {
  return new Intl.NumberFormat('es-ES').format(val);
}

// Se define la interface KpiCardProps (Se encarga de definir las propiedades de la tarjeta de KPI)
interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  color: string;
}

// Se define la funcion KpiCard (Se encarga de mostrar las tarjetas de KPI)
function KpiCard({ title, value, subtitle, icon, color }: KpiCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

// Se define la interface KpiCardsProps (Se encarga de definir las propiedades de las tarjetas de KPI)
interface KpiCardsProps {
  data: KpiSnapshot | null;
  loading: boolean;
}

// Se define la funcion KpiCards (Se encarga de mostrar las tarjetas de KPI)
export function KpiCards({ data, loading }: KpiCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-6 animate-pulse h-28">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-2" />
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  // Se define la lista de tarjetas de KPI
  const cards: KpiCardProps[] = [
    {
      title: 'GMV (Valor Bruto)',
      value: formatCurrency(data.gmv),
      subtitle: 'Suma de precios de los ítems',
      icon: '💰',
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Ingresos (Pagos)',
      value: formatCurrency(data.revenue),
      subtitle: 'Valor efectivamente pagado',
      icon: '💳',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Total de Pedidos',
      value: formatNumber(data.totalOrders),
      subtitle: 'Pedidos entregados',
      icon: '📦',
      color: 'text-violet-600 dark:text-violet-400',
    },
    {
      title: 'Clientes Únicos',
      value: formatNumber(data.totalCustomers),
      subtitle: 'Compradores distintos',
      icon: '👥',
      color: 'text-orange-600 dark:text-orange-400',
    },
    {
      title: 'Ticket Medio (AOV)',
      value: formatCurrency(data.avgOrderValue),
      subtitle: 'Ingresos / pedidos',
      icon: '🎯',
      color: 'text-rose-600 dark:text-rose-400',
    },
  ];

  // Se retorna el grid de tarjetas de KPI
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c) => (
        <KpiCard key={c.title} {...c} />
      ))}
    </div>
  );
}
