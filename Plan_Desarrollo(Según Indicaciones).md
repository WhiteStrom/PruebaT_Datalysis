# Plan de Implementación: Prueba Técnica

## 1. Estructura del Proyecto (Estructura del Proyecto - Ya implementada)

```text
/
├── docker-compose.yml
├── .env
├── backend/             # Node.js + Express (TypeScript)
├── │   ├── src/
├── │   │   ├── domain/      # Puertos y Entidades
├── │   │   ├── application/ # Casos de Uso
├── │   │   ├── infra/       # Adaptadores (Prisma, Repositorios)
├── │   │   └── web/         # Controladores y Rutas
├── │   ├── prisma/
├── │   └── scripts/         # Lógica ETL
├── frontend/            # Next.js (TypeScript)
└── data/                # Almacenamiento temporal CSV (ignorado por git)
```

## 2. Fase 1: Infraestructura y Base de Datos (Docker + PostgreSQL) (Docker Configurado Con Servicios - No modificar)

- [x] Inicializar `docker-compose.yml` con PostgreSQL, Backend y Frontend. (Servicios ya configurados)
- [x] Configurar `.env` para conexiones de base de datos.(Variables ya definidas - No modificar)
- [x] Configurar esquemas de PostgreSQL: `raw`, `clean`, `gold`.(Tres Esquemas Configurados - No modificar)
- [x] Configurar Prisma con soporte multi-esquema.(Prisma Configurado Segun Documentación - Ya Funcional)

## 3. Fase 2: Ingestión de Datos y ETL (Raw -> Clean -> Gold)

- [x] **Ingestión**: El script descarga CSVs desde el espejo de GitHub y los carga masivamente al esquema `raw`. (Completado)
- [x] **Limpieza**: Transformar `raw` a `clean` (tipado, deduplicación, manejo de nulos). (Completado)
- [x] **Gold (Esquema en Estrella)**:(Corregido - Listo para toda las consultas)
  - [x] `gold.dim_date`
  - [x] `gold.dim_customer`
  - [x] `gold.dim_product`
  - [x] `gold.dim_order`
  - [x] `gold.fact_sales` (Grano: 1 fila por ítem de pedido).
  - [x] *Regla*: `payment_value` asignado proporcionalmente: `item_price / sum_prices_order × total_payment`.

## 4. Fase 3: Backend (Arquitectura Hexagonal) (Creada - Revisada - Errores Corregidos - Verificacion Completa - Lista para el servicio de Docker )

- [x] Entidades de dominio: `KpiSnapshot`, `TrendPoint`, `ProductRanking`, `CategoryRanking`, `DashboardFilters`.(Entidades Listas)
- [x] Interfaz de puerto de repositorio (`DashboardRepository`).(Interfaces Completas)
- [x] Casos de Uso:
  - [x] `GetKpisUseCase`: GMV, Ingresos, AOV, Pedidos, Clientes.(KPIs Listos)
  - [x] `GetTrendUseCase`: Series diarias/semanales/mensuales.(Series Listas)
  - [x] `GetRankingsUseCase`: Top productos y categorías.(Rankings Listos)
  - [x] `GetFiltersUseCase`: Estados y categorías disponibles.(Filtros Listos)
- [x] Infraestructura: `PrismaDashboardRepository` (SQL puro contra el esquema `gold`). (Infraestructura Lista - Comprobada - Funcional)
- [x] Adaptadores web: `DashboardController` + rutas Express + raíz de composición.(Adaptadores Listos - Comprobados - Funcionales)

## 5. Fase 4: Frontend (Next.js + Dashboard) (Filtrado listo - Componentes del Dashboard listos - Conexion con Docker verificada servicio listo - Consumo de datos CORREGIDO(Se implemento automaticamente el puerto 3000 ya no hay conflicto con el puerto 3001) - Funcional)

- [x] Next.js 15 con TypeScript, TailwindCSS y Recharts.
- [x] `FilterContext` global (rango de fechas, estado, categoría, granularidad). (Corregido - Filtros correctamente establecidos)
- [x] Componentes del Dashboard:
  - [x] `KpiCards` — 5 KPIs con carga de esqueleto (skeleton). (KPIs (Creados segun documentacion) - Errores Corregidos - Funcional)
  - [x] `TrendChart` — Gráfico de área con ejes Y duales (Ingresos + Pedidos).(Grafico Funcional)
  - [x] `CategoryChart` — Gráfico de pastel (donut) por ingresos de categoría.(Donut ya se muestra sin ocultarse - Funcional)
  - [x] `ProductRankingTable` — Tabla desplazable de los 10 mejores productos. (Ranking de productos ya se muestra sin ocultarse - Funcional)
  - [x] `FilterBar` — Selectores de fecha, selección de estado/categoría, alternancia de granularidad. (Filtros ya se muestran sin ocultarse - Funcional)
- [x] Manejo de errores con botón de reintento y esqueletos de carga por sección. (Boton corregido ya recarga - Boton desaparecio - Se reimplemento el estilo - Se corrigio el error de que no se mostrara el boton - Se corrigio el error de que el boton no se mostrara al recargar - Funcional)

## 6. Fase 5: Finalización

- [x] Completar `README.md` con diagrama de arquitectura, inicio rápido y referencia de API. (Solo Falta agregarle el diagrama de arquitectura y la  dirección de mi GitHub - Listo)
- [x] Pruebas unitarias para todos los Casos de Uso (Jest + ts-jest, patrón de repositorio mock). (Patron Mock implementado segun Documentacion y ejemplos que encontre - Correxion de errores de sintaxis - Primera ejecucion fallida - Importaciones corregidas - Fechas corregidas - Listo)
- [x] `init-db.sql` de Docker montado para creación automática de esquemas en la primera ejecución.(Falta hacerlo - El archivo desaparecio lo borre  si querrer, Creado de nuevo - Falta montarlo en el docker-compose.yml - Listo)
- [x] `.gitignore` configurado (excluye node_modules, dist, data/, .env). (Agregar .env y data - Listo)

## 7. Ejecución (Listo)

```bash
# 1. Iniciar la base de datos (Ya se levanta en el puerto correcto. - Verificado)
docker compose up -d db

# 2. Ejecutar pipeline ETL (desde backend/) (Verificado)
npm install
npm run etl:all

# 3. Iniciar stack completo (Eliminado conflicto de puertos - Verificado - Ejecucion Correcta)
docker compose up --build

# Dashboard: http://localhost:3000
# API:       http://localhost:3001
```
