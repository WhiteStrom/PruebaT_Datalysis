# Dashboard Comercial — E-Commerce Brasil (Datalysis L1)

Solución completa de analytics para el dataset **Olist Brazilian E-Commerce**, implementada con arquitectura hexagonal, star schema y dashboard interactivo.

---

## Arquitectura Hexagonal (Funcionamiento Verificado en Docker interconexion ya funcional)

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend  (Next.js 15 + Recharts)       :3000              │
│  ├── FilterContext (estado global de filtros)               │
│  ├── KpiCards / TrendChart / CategoryChart / RankingTable   │
│  └── API Client (fetch → backend)                           │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST /api/*
┌──────────────────────────▼──────────────────────────────────┐
│  Backend  (Node.js + Express + TypeScript)   :3001          │
│                                                             │
│  ╔═══════════════════════════════════════╗                  │
│  ║       Hexagonal Architecture          ║                  │
│  ║                                       ║                  │
│  ║  [Web]  Controllers & Routes          ║                  │
│  ║    │                                  ║                  │
│  ║  [Application]  Use Cases             ║                  │
│  ║    │  GetKpis / GetTrend / GetRankings║                  │
│  ║    │                                  ║                  │
│  ║  [Domain]  Entities & Ports           ║                  │
│  ║    │                                  ║                  │
│  ║  [Infra]  PrismaDashboardRepository   ║                  │
│  ║    │                                  ║                  │
│  ║  [ETL]  Ingest / Clean / Gold         ║                  │
│  ╚═══════════════════════════════════════╝                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ Prisma (multiSchema)
┌──────────────────────────▼──────────────────────────────────┐
│  PostgreSQL 15                           :5432              │
│                                                             │
│  raw.*         ← CSVs (TEXT bruto)                          │
│  clean.*       ← Tipos correctos, deduplicado, sin nulos    │
│  gold.*        ← Star Schema (dim_* + fact_sales)           │
│                                                             │
│  ┌────────────┐    ┌──────────────┐    ┌─────────────────┐  │
│  │  dim_date  │    │ dim_customer │    │   dim_product   │  │
│  └─────┬──────┘    └──────┬───────┘    └────────┬────────┘  │
│        │                  │                     │           │
│        └──────────────────┼─────────────────────┘           │
│                           ▼                                 │
│                    ┌─────────────┐    ┌──────────────┐      │
│                    │  fact_sales │────│  dim_order   │      │
│                    └─────────────┘    └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Inicio Rápido (Docker — "One Shot")

### Requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Clonar y configurar
```bash
git clone https://github.com/WhiteStrom/PruebaT_Datalysis.git?
cd Prueba_Técnica_Datalysis

# Copiar variables de entorno
cp .env.example .env
```
 
### 2. Subir infraestructura
```bash
docker compose up -d db
```

### 3. Ejecutar ETL completo
```bash
# Instalar dependencias del backend localmente para ejecutar el ETL
cd backend && npm install

# Ingerir CSVs → raw (Comando para subir los datos a la base de datos)
npm run etl:ingest

# Transformar → clean (Comando para limpiar los datos)
npm run etl:clean

# Construir star schema → gold (Comando para construir el star schema)
npm run etl:gold
```

### 4. Subir stack completo
```bash
# Importante: Volver a la raíz (Comando para crear el Stack completo)
cd ..
docker compose up --build
```

### 5. Acceso 
| Servicio      | URL                           |
|---------------|-------------------------------|
| **Dashboard** | http://localhost:3000         |
| **API**       | http://localhost:3001         |
| **Health**    | http://localhost:3001/health  |

---

## KPIs Solicitados (Completos)

| KPI                   | Definición                                     |
|-----------------------|------------------------------------------------|
| **GMV**               | Suma de `price` de todos los ítems vendidos    |
| **Ingresos**          | Suma de `payment_value` (pagos reales)         |
| **Total de Pedidos**  | `COUNT DISTINCT order_id` (status = delivered) |
| **Clientes Únicos**   | `COUNT DISTINCT customer_id`                   |
| **Ticket Promedio (AOV)** | Ingresos / Total de Pedidos                |

> **Regla de asignación de pago:** El `payment_value` por ítem es calculado proporcionalmente al precio del ítem en relación al total del pedido: `payment_value_item = price_item / sum_prices_order × total_payment_order` ya corregido.

---

## API Endpoints (Completos - Funcionamiento Verificado)

| Método | Endpoint | Descripción |
|--------|----------|-----------|
| GET | `/health` | Health check |
| GET | `/api/kpis` | KPI snapshot |
| GET | `/api/trend` | Serie temporal (diaria/semanal/mensual) |
| GET | `/api/rankings/products` | Top N productos por ingresos |
| GET | `/api/rankings/categories` | Top N categorías por ingresos |
| GET | `/api/filters/states` | Estados disponibles |
| GET | `/api/filters/categories` | Categorías disponibles |

### Parámetros de Consulta (todos los endpoints)
| Parámetro   | Tipo         | Ejemplo      |
|-------------|--------------|------------- |
| `startDate` | `YYYY-MM-DD` | `2017-01-01` |
| `endDate`   | `YYYY-MM-DD` | `2018-12-31` |
| `state`     | string       | `SP`         |
| `category`  | string       | `cama_mesa_banho` |
| `granularity` | `daily\|weekly\|monthly` | `monthly` |
| `limit`     | number       | `10`         |

---

## Pruebas Unitarias (Completas - Funcionamiento Verificado)


```bash
cd backend
npm test
```

Las pruebas unitarias cubren los **Casos de Uso** en aislamiento total con un repositorio mock.

---

## Estructura de Archivos

```
/
├── docker-compose.yml
├── .env
├── backend/
│   ├── src/
│   │   ├── domain/          # Entidades y Puertos (interfaces)
│   │   ├── application/     # Casos de Uso (lógica del Backend)
│   │   ├── infra/           # Repositorio Prisma (adaptador)
│   │   ├── web/             # Controladores y rutas Express
│   │   └── scripts/         # ETL: ingest.ts, clean.ts, gold.ts
│   ├── prisma/schema.prisma
│   └── Dockerfile
└── frontend/
    ├── src/
    │   ├── app/             # Next.js App Router
    │   ├── components/      # KpiCards, TrendChart, etc.
    │   ├── context/         # FilterContext (estado global)
    │   └── lib/             # Cliente API y tipos
    └── Dockerfile
```

---

## Stack Tecnológica

| Capa     | Tecnología                                     |
|----------|------------------------------------------------|
| Frontend | Next.js 15, TypeScript, TailwindCSS, Recharts  |
| Backend  | Node.js, Express 4, TypeScript, Prisma 5       | 
| Database | PostgreSQL 15                                  |
| ORM      | Prisma (multiSchema: raw, clean, gold)         |
| Infra    | Docker Compose                                 |
| Tests    | Jest + ts-jest                                 |
| ETL      | Node.js + csv-parse + pg                       |
