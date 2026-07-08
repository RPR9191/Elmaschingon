# Tacos Sinaloa — App de Pedidos

Aplicación web de pedidos para **Tacos Sinaloa** — taquería sinaloense en Highland Park, Los Ángeles.

**Dirección:** 5479 N Figueroa St, Highland Park, LA 90042  
**Teléfono:** (323) 303-2084  
**WhatsApp:** [wa.me/13233032084](https://wa.me/13233032084)

---

## Tecnologías

- **Next.js 14+** (App Router) — Framework React
- **TypeScript** — Tipado seguro
- **Tailwind CSS v4** — Estilos utilitarios
- **Supabase** — Base de datos PostgreSQL
- **Netlify** — Hosting

## Estructura del proyecto

```
src/
  app/
    page.tsx              # Página principal — flujo de pedidos
    layout.tsx            # Layout raíz
    globals.css           # Estilos globales + tema oscuro/dorado
    admin/
      page.tsx            # Panel de administración
    api/
      orders/
        route.ts          # POST / GET orders
        [id]/
          route.ts        # PATCH order status
      menu/
        route.ts          # GET menu completo
  components/
    Header.tsx            # Encabezado con logo y teléfono
    CartBar.tsx           # Barra de carrito fija inferior
    OrderModal.tsx        # Modal de revisión de pedido
  lib/
    types.ts              # Tipos TypeScript
    menu-data.ts          # Datos del menú (categorías, carnes, toppings, etc.)
    icons.tsx             # Componentes SVG iconos
    supabase.ts           # Cliente Supabase
supabase-schema.sql       # Esquema SQL + datos semilla
netlify.toml              # Configuración de build Netlify
```

## Requisitos previos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Netlify](https://netlify.com)

## Configuración local

### 1. Instalar dependencias

```bash
cd /Users/efrainsilvarojo/Desktop/tacos-sinaloa-next
npm install
```

### 2. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a **SQL Editor** y pega el contenido de `supabase-schema.sql`
3. Ejecuta el script para crear las tablas y los datos semilla
4. Ve a **Settings > API** y copia tu URL y anon key

### 3. Variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### 4. Iniciar servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### 5. Panel de administración

Visita [http://localhost:3000/admin](http://localhost:3000/admin)

**Contraseña por defecto:** `tacos2024`

## Rutas disponibles

| Ruta | Descripción |
|------|-------------|
| `/` | Flujo de pedidos paso a paso |
| `/admin` | Panel de administración con login |
| `/api/orders` | API: crear y listar pedidos |
| `/api/orders/[id]` | API: actualizar estado de pedido |
| `/api/menu` | API: obtener menú completo |

## Flujo del pedido

1. Cliente selecciona categoría (Tacos, Chorreadas, Vampiros, Gringas, Burritos, Quesadillas)
2. Selecciona carne (Asada, Pastor, Pollo, Chorizo, Cabeza)
3. Selecciona toppings (multi-select: Cebolla, Cilantro, Lechuga, Jitomate, Frijoles, Arroz, Crema, Aguacate)
4. Selecciona salsa (Roja, Verde, Guacamole, Habanero)
5. Selecciona extras (Queso extra, Más carne, Totopos)
6. Confirma cantidad y agrega al carrito
7. Puede seguir agregando más items
8. Revisa el carrito y envia por WhatsApp

## Deploy a Netlify

### Opción 1: Conectar con GitHub (recomendado)

1. Sube el proyecto a GitHub
2. En Netlify, click "Add new site" > "Import an existing project"
3. Conecta tu repositorio de GitHub
4. Netlify detectará automáticamente la configuración de `netlify.toml`
5. Agrega las variables de entorno en Netlify:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. Click "Deploy site"

### Opción 2: Deploy manual

```bash
npm run build
npx netlify-cli deploy --prod
```

## Precios

| Item | Precio base |
|------|-------------|
| Taco | $3.00 |
| Chorreada | $7.00 |
| Vampiro | $6.50 |
| Gringa | $16.00 |
| Burrito | $13.00 |
| Quesadilla | $9.00 |

**Extras:** Queso extra +$1.00, Más carne +$3.00, Totopos +$2.00  
**Toppings con costo extra:** Frijoles +$1.00, Arroz +$1.00, Aguacate +$1.50