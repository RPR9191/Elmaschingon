-- ============================================================
-- Tacos Sinaloa — Supabase Schema
-- ============================================================

-- Categories (menu items types)
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'taco',
  base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Meats
CREATE TABLE IF NOT EXISTS meats (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Toppings
CREATE TABLE IF NOT EXISTS toppings (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  extra_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Salsas
CREATE TABLE IF NOT EXISTS salsas (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Extras
CREATE TABLE IF NOT EXISTS extras (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente', 'en preparación', 'listo', 'entregado')),
  payment_method TEXT DEFAULT 'efectivo',
  notes TEXT DEFAULT ''
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  meat_name TEXT,
  toppings JSONB DEFAULT '[]'::jsonb,
  salsa_name TEXT,
  extras JSONB DEFAULT '[]'::jsonb,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL DEFAULT 0
);

-- Menu items (optional, can be derived from categories)
CREATE TABLE IF NOT EXISTS menu_items (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category_id BIGINT REFERENCES categories(id),
  base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON menu_items(active);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Categories
INSERT INTO categories (name, icon, base_price, sort_order) VALUES
  ('Tacos', 'taco', 3.00, 1),
  ('Chorreadas', 'chorreada', 7.00, 2),
  ('Vampiros', 'vampiro', 6.50, 3),
  ('Gringas', 'gringa', 16.00, 4),
  ('Burritos', 'burrito', 13.00, 5),
  ('Quesadillas', 'quesadilla', 9.00, 6)
ON CONFLICT DO NOTHING;

-- Meats
INSERT INTO meats (name, description) VALUES
  ('Asada', 'Carne de res asada a la parrilla'),
  ('Pastor', 'Cerdo marinado al estilo tradicional'),
  ('Pollo', 'Pollo sazonado y asado'),
  ('Chorizo', 'Chorizo artesanal'),
  ('Cabeza', 'Carne de res cocida lentamente')
ON CONFLICT DO NOTHING;

-- Toppings
INSERT INTO toppings (name, extra_price) VALUES
  ('Cebolla', 0),
  ('Cilantro', 0),
  ('Lechuga', 0),
  ('Jitomate', 0),
  ('Frijoles', 1.00),
  ('Arroz', 1.00),
  ('Crema', 0),
  ('Aguacate', 1.50)
ON CONFLICT DO NOTHING;

-- Salsas
INSERT INTO salsas (name, description) VALUES
  ('Roja', 'Salsa de chile rojo tradicional'),
  ('Verde', 'Salsa de chile verde y tomatillo'),
  ('Guacamole', 'Guacamole fresco'),
  ('Habanero', 'Salsa picante de habanero')
ON CONFLICT DO NOTHING;

-- Extras
INSERT INTO extras (name, price) VALUES
  ('Queso extra', 1.00),
  ('Mas carne', 3.00),
  ('Totopos', 2.00)
ON CONFLICT DO NOTHING;

-- Menu items
INSERT INTO menu_items (name, category_id, base_price, active) VALUES
  ('Taco', 1, 3.00, true),
  ('Chorreada', 2, 7.00, true),
  ('Vampiro', 3, 6.50, true),
  ('Gringa', 4, 16.00, true),
  ('Burrito', 5, 13.00, true),
  ('Quesadilla', 6, 9.00, true)
ON CONFLICT DO NOTHING;