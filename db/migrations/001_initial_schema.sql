-- Initial schema creation for Bruno's IMS
-- Migration: 001_initial_schema.sql
-- Created: 2024-01-01
-- Description: Creates all core tables for inventory management system

BEGIN;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create UOM table first (referenced by items)
CREATE TABLE uom (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(255) NOT NULL UNIQUE,
    abbreviation VARCHAR(10) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('weight', 'volume', 'count', 'length', 'area', 'time')),
    base_unit BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create conversions table
CREATE TABLE conversions (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    from_uom_id VARCHAR(50) NOT NULL REFERENCES uom(id) ON DELETE CASCADE,
    to_uom_id VARCHAR(50) NOT NULL REFERENCES uom(id) ON DELETE CASCADE,
    factor DECIMAL(10, 6) NOT NULL CHECK (factor > 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(from_uom_id, to_uom_id)
);

-- Create suppliers table
CREATE TABLE suppliers (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    country VARCHAR(100),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create locations table
CREATE TABLE locations (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location_type VARCHAR(50) NOT NULL CHECK (location_type IN ('warehouse', 'kitchen', 'prep', 'storage', 'freezer', 'cooler', 'dry')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create items table
CREATE TABLE items (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(50) UNIQUE,
    category VARCHAR(100),
    uom_id VARCHAR(50) NOT NULL REFERENCES uom(id),
    min_stock DECIMAL(10, 3) CHECK (min_stock >= 0),
    max_stock DECIMAL(10, 3) CHECK (max_stock >= 0),
    cost_per_base DECIMAL(10, 2) CHECK (cost_per_base >= 0),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CHECK (max_stock IS NULL OR min_stock IS NULL OR max_stock >= min_stock)
);

-- Create purchase_orders table
CREATE TABLE purchase_orders (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    order_number VARCHAR(100) NOT NULL UNIQUE,
    supplier_id VARCHAR(50) NOT NULL REFERENCES suppliers(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'received', 'cancelled')),
    order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expected_date TIMESTAMP WITH TIME ZONE,
    total_amount DECIMAL(10, 2) CHECK (total_amount >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create receipts table
CREATE TABLE receipts (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    purchase_order_id VARCHAR(50) NOT NULL REFERENCES purchase_orders(id),
    receipt_number VARCHAR(100) NOT NULL UNIQUE,
    received_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    received_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create stock_moves table
CREATE TABLE stock_moves (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    item_id VARCHAR(50) NOT NULL REFERENCES items(id),
    qty_base DECIMAL(10, 3) NOT NULL,
    cost_per_base DECIMAL(10, 2) CHECK (cost_per_base >= 0),
    source VARCHAR(100),
    destination VARCHAR(100),
    reason VARCHAR(50) NOT NULL CHECK (reason IN ('received', 'transferred', 'consumed', 'adjustment', 'waste', 'production', 'sale')),
    reference VARCHAR(100),
    location_id VARCHAR(50) REFERENCES locations(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create recipes table
CREATE TABLE recipes (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    yield_uom VARCHAR(50) NOT NULL,
    yield_qty_base DECIMAL(10, 3) NOT NULL CHECK (yield_qty_base > 0),
    instructions TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create recipe_items table
CREATE TABLE recipe_items (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    recipe_id VARCHAR(50) NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    item_id VARCHAR(50) NOT NULL REFERENCES items(id),
    qty_base DECIMAL(10, 3) NOT NULL CHECK (qty_base > 0),
    loss_pct DECIMAL(5, 2) NOT NULL DEFAULT 0 CHECK (loss_pct >= 0 AND loss_pct <= 100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(recipe_id, item_id)
);

-- Create batches table
CREATE TABLE batches (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    recipe_id VARCHAR(50) NOT NULL REFERENCES recipes(id),
    batch_number VARCHAR(100) NOT NULL UNIQUE,
    produced_qty_base DECIMAL(10, 3) NOT NULL CHECK (produced_qty_base > 0),
    production_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create counts table
CREATE TABLE counts (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    location_id VARCHAR(50) NOT NULL REFERENCES locations(id),
    item_id VARCHAR(50) NOT NULL REFERENCES items(id),
    qty_base DECIMAL(10, 3) NOT NULL CHECK (qty_base >= 0),
    count_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    counted_by VARCHAR(100),
    variance DECIMAL(10, 3),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create wastage_logs table
CREATE TABLE wastage_logs (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    item_id VARCHAR(50) NOT NULL REFERENCES items(id),
    qty_base DECIMAL(10, 3) NOT NULL CHECK (qty_base > 0),
    reason VARCHAR(50) NOT NULL CHECK (reason IN ('expired', 'damaged', 'contaminated', 'overproduction', 'preparation_loss', 'spillage', 'other')),
    cost DECIMAL(10, 2) CHECK (cost >= 0),
    waste_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_items_active ON items(active);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_uom_id ON items(uom_id);
CREATE INDEX idx_suppliers_active ON suppliers(active);
CREATE INDEX idx_locations_active ON locations(active);
CREATE INDEX idx_locations_type ON locations(location_type);
CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_order_date ON purchase_orders(order_date);
CREATE INDEX idx_receipts_purchase_order_id ON receipts(purchase_order_id);
CREATE INDEX idx_receipts_received_date ON receipts(received_date);
CREATE INDEX idx_stock_moves_item_id ON stock_moves(item_id);
CREATE INDEX idx_stock_moves_location_id ON stock_moves(location_id);
CREATE INDEX idx_stock_moves_created_at ON stock_moves(created_at);
CREATE INDEX idx_stock_moves_reason ON stock_moves(reason);
CREATE INDEX idx_recipes_active ON recipes(active);
CREATE INDEX idx_recipe_items_recipe_id ON recipe_items(recipe_id);
CREATE INDEX idx_recipe_items_item_id ON recipe_items(item_id);
CREATE INDEX idx_batches_recipe_id ON batches(recipe_id);
CREATE INDEX idx_batches_production_date ON batches(production_date);
CREATE INDEX idx_counts_location_id ON counts(location_id);
CREATE INDEX idx_counts_item_id ON counts(item_id);
CREATE INDEX idx_counts_count_date ON counts(count_date);
CREATE INDEX idx_wastage_logs_item_id ON wastage_logs(item_id);
CREATE INDEX idx_wastage_logs_waste_date ON wastage_logs(waste_date);
CREATE INDEX idx_wastage_logs_reason ON wastage_logs(reason);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to tables that have updated_at column
CREATE TRIGGER update_uom_updated_at BEFORE UPDATE ON uom FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversions_updated_at BEFORE UPDATE ON conversions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON receipts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipe_items_updated_at BEFORE UPDATE ON recipe_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;