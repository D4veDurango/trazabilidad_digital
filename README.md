# NodeBean — Sistema de Trazabilidad Digital para Cacao

Plataforma móvil de trazabilidad end-to-end para productores de cacao de la región de Urabá, Antioquia, Colombia.

---

## Demo

La carta de trazabilidad pública se genera en:

```
http://localhost:5173?key=TU_CLAVE_DE_LOTE
```

---

## Funcionalidades

| Módulo | Descripción |
|---|---|
| Registro de cosecha | Registra lotes con fecha, peso, variedad y parcela de origen |
| Fermentación | Seguimiento diario de temperatura y giros del proceso |
| Secado | Control de humedad por día con gauge visual y evolución en gráfico |
| Almacenamiento | Registro de inventario, condiciones y generación de carta QR |
| Parcelas | Gestión de terrenos con hectáreas y número de árboles |
| Fotos del proceso | Registro fotográfico por etapa (fermentación y secado) |
| Carta de trazabilidad | Página pública con QR, datos completos del lote e historial de secado |

---

## Stack tecnológico

- **Frontend:** React 19 + Vite
- **Mobile:** Capacitor 8 (Android)
- **Backend / DB:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Autenticación:** Google OAuth via Supabase (flujo PKCE)
- **Camara:** @capacitor/camera
- **Estilos:** CSS-in-JS sin framework de UI externo

---

## Estructura de base de datos

```sql
-- Perfiles de usuario
profiles (id, full_name, avatar_url, producer_id)

-- Lotes de cacao
lots (id, farmer_id, lot_code, variety, parcel_name, parcel_id,
      harvest_date, weight_kg, status, quality_ripe, quality_cut)

-- Parcelas / terrenos
parcelas (id, farmer_id, nombre, hectareas, num_arboles)

-- Registros de fermentacion
fermentation_logs (id, lot_id, day_number, turns_count,
                   last_turn_at, temperature_c)

-- Registros de secado
drying_logs (id, lot_id, day_number, humidity_pct,
             temperature_c, method, recorded_at)

-- Inventario y carta de trazabilidad
inventory (id, lot_id, net_weight_kg, bag_count, entry_date,
           storage_on_pallets, away_from_walls, no_strong_odors,
           traceability_key, ready_to_sell, registered_at)

-- Fotos del proceso
lot_photos (id, lot_id, stage, url, file_path, created_at)
```

---

## Instalacion y desarrollo

### Prerrequisitos

- Node.js >= 22
- Android Studio para compilar APK
- Cuenta en Supabase
- Cuenta en Vercel

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/tu-usuario/nodebean.git
cd nodebean
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raiz del proyecto:

```env
VITE_SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

### 3. Crear tablas en Supabase

Ejecuta los siguientes scripts en el SQL Editor de Supabase:

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;

CREATE TABLE parcelas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  hectareas numeric(6,2) NOT NULL DEFAULT 1,
  num_arboles integer NOT NULL DEFAULT 100,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE parcelas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own" ON parcelas USING (farmer_id = auth.uid());

ALTER TABLE lots
  ADD COLUMN IF NOT EXISTS parcel_id uuid REFERENCES parcelas(id) ON DELETE SET NULL;

CREATE TABLE drying_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id uuid REFERENCES lots(id) ON DELETE CASCADE,
  day_number integer NOT NULL,
  humidity_pct numeric(4,1) NOT NULL,
  temperature_c numeric(4,1),
  method text DEFAULT 'solar',
  recorded_at timestamptz DEFAULT now(),
  UNIQUE(lot_id, day_number)
);
ALTER TABLE drying_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own" ON drying_logs
  USING (lot_id IN (SELECT id FROM lots WHERE farmer_id = auth.uid()));

CREATE TABLE lot_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id uuid REFERENCES lots(id) ON DELETE CASCADE,
  stage text NOT NULL,
  url text NOT NULL,
  file_path text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE lot_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own" ON lot_photos
  USING (lot_id IN (SELECT id FROM lots WHERE farmer_id = auth.uid()));

ALTER TABLE inventory ADD COLUMN IF NOT EXISTS entry_date date;
```

### 4. Crear bucket de almacenamiento

En Supabase > Storage, crea un bucket llamado `lot-photos` con acceso publico.

### 5. Correr en desarrollo

```bash
npm run dev
```

---

## Compilar APK para Android

```bash
# Build de produccion
npm run build

# Sincronizar con Capacitor
npx cap sync android

# Abrir en Android Studio
npx cap open android
```

En Android Studio conecta tu dispositivo y presiona Run, o genera el APK desde Build > Build Bundle(s) / APK(s) > Build APK(s).

---

## Carta de trazabilidad

La carta publica es accesible sin login desde:

```
http://tu-dominio.com?key=CLAVE_DEL_LOTE
```

Incluye datos del productor, parcela de origen, cronologia del proceso (cosecha, fermentacion, secado, almacenamiento), grafico de evolucion de humedad, condiciones de almacenamiento, fotos del proceso por etapa y boton para guardar como PDF via `window.print()`.

---

## Estructura del proyecto

```
NodeBean/
├── src/
│   ├── NodeBean.jsx        # Componente principal — toda la app
│   ├── App.tsx
│   ├── main.tsx
│   └── supabaseClient.js   # Configuracion de Supabase
├── android/                # Proyecto Android (Capacitor)
├── supabase/
│   └── functions/lote/     # Edge Function — carta publica
├── public/
└── vite.config.ts
```

---

## Contexto del proyecto

NodeBean es una herramienta de trazabilidad digital para pequeños productores de cacao en la region de Uraba, Colombia. Permite documentar cada etapa del proceso productivo desde la cosecha hasta el almacenamiento, y genera una carta de trazabilidad verificable con codigo QR, facilitando el acceso a mercados de exportacion con trazabilidad certificada.

---

## Licencia

Proyecto de grado. Todos los derechos reservados.

---

Desarrollado por Juan David Durango Giraldo — Uraba, Antioquia, Colombia
