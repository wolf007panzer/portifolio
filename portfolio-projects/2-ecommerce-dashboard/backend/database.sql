-- database.sql
-- Schema relacional de e-commerce
-- Demonstra: relacionamentos 1-N e N-N, integridade referencial, tipos numéricos corretos para dinheiro

CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE order_status AS ENUM ('pending', 'completed', 'cancelled');

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  status order_status DEFAULT 'pending',
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de junção: um pedido tem vários produtos, e um produto está em vários pedidos
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL -- preço no momento da compra (não referencia products.price diretamente)
);

-- Índices para as queries mais pesadas do dashboard
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_products_category ON products(category);

-- Trigger para manter total_amount do pedido sempre correto
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders
  SET total_amount = (
    SELECT COALESCE(SUM(quantity * unit_price), 0)
    FROM order_items
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
  )
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_order_total
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW EXECUTE FUNCTION update_order_total();

-- Dados de exemplo
INSERT INTO customers (name, email) VALUES
('Ana Souza', 'ana@email.com'),
('Bruno Lima', 'bruno@email.com'),
('Carla Reis', 'carla@email.com');

INSERT INTO products (name, category, price, stock_quantity) VALUES
('Teclado Mecânico', 'Periféricos', 350.00, 25),
('Mouse Gamer', 'Periféricos', 150.00, 40),
('Monitor 27"', 'Monitores', 1200.00, 8),
('Cadeira Ergonômica', 'Móveis', 890.00, 5),
('Headset', 'Periféricos', 220.00, 30);
