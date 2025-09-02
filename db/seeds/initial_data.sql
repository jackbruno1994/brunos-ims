-- Seed data for Bruno's IMS
-- This script populates the database with initial demo data

BEGIN;

-- Insert base UOM data
INSERT INTO uom (id, name, abbreviation, type, base_unit) VALUES
('uom_kg', 'Kilogram', 'kg', 'weight', TRUE),
('uom_g', 'Gram', 'g', 'weight', FALSE),
('uom_lb', 'Pound', 'lb', 'weight', FALSE),
('uom_oz', 'Ounce', 'oz', 'weight', FALSE),
('uom_l', 'Liter', 'L', 'volume', TRUE),
('uom_ml', 'Milliliter', 'mL', 'volume', FALSE),
('uom_gal', 'Gallon', 'gal', 'volume', FALSE),
('uom_qt', 'Quart', 'qt', 'volume', FALSE),
('uom_cup', 'Cup', 'cup', 'volume', FALSE),
('uom_tbsp', 'Tablespoon', 'tbsp', 'volume', FALSE),
('uom_tsp', 'Teaspoon', 'tsp', 'volume', FALSE),
('uom_each', 'Each', 'ea', 'count', TRUE),
('uom_dozen', 'Dozen', 'dz', 'count', FALSE),
('uom_case', 'Case', 'cs', 'count', FALSE);

-- Insert conversion factors
INSERT INTO conversions (from_uom_id, to_uom_id, factor) VALUES
-- Weight conversions
('uom_kg', 'uom_g', 1000),
('uom_g', 'uom_kg', 0.001),
('uom_lb', 'uom_kg', 0.453592),
('uom_kg', 'uom_lb', 2.20462),
('uom_oz', 'uom_g', 28.3495),
('uom_g', 'uom_oz', 0.035274),
-- Volume conversions
('uom_l', 'uom_ml', 1000),
('uom_ml', 'uom_l', 0.001),
('uom_gal', 'uom_l', 3.78541),
('uom_l', 'uom_gal', 0.264172),
('uom_qt', 'uom_l', 0.946353),
('uom_l', 'uom_qt', 1.05669),
('uom_cup', 'uom_ml', 236.588),
('uom_ml', 'uom_cup', 0.004227),
('uom_tbsp', 'uom_ml', 14.7868),
('uom_ml', 'uom_tbsp', 0.067628),
('uom_tsp', 'uom_ml', 4.92892),
('uom_ml', 'uom_tsp', 0.202884),
-- Count conversions
('uom_dozen', 'uom_each', 12),
('uom_each', 'uom_dozen', 0.083333),
('uom_case', 'uom_each', 24),
('uom_each', 'uom_case', 0.041667);

-- Insert demo suppliers
INSERT INTO suppliers (id, name, contact_email, contact_phone, address, country, active) VALUES
('supplier_sysco', 'Sysco Corporation', 'orders@sysco.com', '+1-800-796-7946', '1390 Enclave Pkwy, Houston, TX 77077', 'US', TRUE),
('supplier_usfoods', 'US Foods', 'customerservice@usfoods.com', '+1-847-720-8000', '9399 W Higgins Rd, Rosemont, IL 60018', 'US', TRUE),
('supplier_performance', 'Performance Food Group', 'info@pfgc.com', '+1-804-484-7700', '12500 W Creek Pkwy, Richmond, VA 23238', 'US', TRUE),
('supplier_local_farm', 'Local Organic Farm', 'sales@localfarm.com', '+1-555-0123', '123 Farm Road, Farmville, ST 12345', 'US', TRUE),
('supplier_specialty', 'Specialty Foods Inc', 'orders@specialtyfoods.com', '+1-555-0456', '456 Gourmet Ave, Food City, ST 67890', 'US', TRUE);

-- Insert demo locations
INSERT INTO locations (id, name, description, location_type, active) VALUES
('loc_main_kitchen', 'Main Kitchen', 'Primary cooking and prep area', 'kitchen', TRUE),
('loc_prep_room', 'Prep Room', 'Secondary preparation area', 'prep', TRUE),
('loc_walk_in_cooler', 'Walk-in Cooler', 'Main refrigerated storage', 'cooler', TRUE),
('loc_walk_in_freezer', 'Walk-in Freezer', 'Main frozen storage', 'freezer', TRUE),
('loc_dry_storage', 'Dry Storage', 'Ambient temperature storage', 'dry', TRUE),
('loc_wine_cellar', 'Wine Cellar', 'Climate controlled wine storage', 'storage', TRUE),
('loc_receiving', 'Receiving Area', 'Temporary holding for deliveries', 'warehouse', TRUE);

-- Insert demo items
INSERT INTO items (id, name, description, sku, category, uom_id, min_stock, max_stock, cost_per_base, active) VALUES
-- Proteins
('item_chicken_breast', 'Chicken Breast', 'Boneless skinless chicken breast', 'CHKN-BST-001', 'Protein', 'uom_kg', 10.0, 50.0, 8.50, TRUE),
('item_salmon_fillet', 'Salmon Fillet', 'Fresh Atlantic salmon fillet', 'SALMN-FIL-001', 'Protein', 'uom_kg', 5.0, 25.0, 22.00, TRUE),
('item_ground_beef', 'Ground Beef 80/20', 'Ground beef 80% lean', 'BEEF-GRD-001', 'Protein', 'uom_kg', 8.0, 40.0, 12.75, TRUE),
-- Vegetables
('item_onions_yellow', 'Yellow Onions', 'Large yellow cooking onions', 'ONION-YEL-001', 'Produce', 'uom_kg', 15.0, 75.0, 2.25, TRUE),
('item_carrots', 'Carrots', 'Fresh whole carrots', 'CARROT-001', 'Produce', 'uom_kg', 10.0, 50.0, 1.85, TRUE),
('item_tomatoes_roma', 'Roma Tomatoes', 'Roma tomatoes for cooking', 'TOM-ROMA-001', 'Produce', 'uom_kg', 12.0, 60.0, 3.50, TRUE),
-- Dairy
('item_butter_unsalted', 'Unsalted Butter', 'High quality unsalted butter', 'BUTTER-UNS-001', 'Dairy', 'uom_kg', 5.0, 25.0, 6.75, TRUE),
('item_heavy_cream', 'Heavy Cream', '35% heavy whipping cream', 'CREAM-HVY-001', 'Dairy', 'uom_l', 3.0, 15.0, 4.25, TRUE),
('item_parmesan', 'Parmigiano Reggiano', 'Aged 24 months Parmigiano Reggiano', 'PARM-REG-001', 'Dairy', 'uom_kg', 2.0, 10.0, 45.00, TRUE),
-- Pantry
('item_olive_oil', 'Extra Virgin Olive Oil', 'Premium extra virgin olive oil', 'OIL-EVOO-001', 'Pantry', 'uom_l', 2.0, 10.0, 15.50, TRUE),
('item_flour_ap', 'All Purpose Flour', 'Unbleached all purpose flour', 'FLOUR-AP-001', 'Pantry', 'uom_kg', 20.0, 100.0, 1.20, TRUE),
('item_salt_kosher', 'Kosher Salt', 'Diamond Crystal kosher salt', 'SALT-KOSHER-001', 'Pantry', 'uom_kg', 5.0, 25.0, 2.15, TRUE),
-- Beverages
('item_wine_chardonnay', 'Chardonnay Wine', 'Premium white wine for cooking', 'WINE-CHARD-001', 'Beverage', 'uom_l', 1.0, 5.0, 18.50, TRUE),
('item_stock_chicken', 'Chicken Stock', 'House-made chicken stock', 'STOCK-CHKN-001', 'Prepared', 'uom_l', 5.0, 25.0, 3.75, TRUE);

-- Insert demo purchase orders
INSERT INTO purchase_orders (id, order_number, supplier_id, status, order_date, expected_date, total_amount, notes) VALUES
('po_001', 'PO-2024-001', 'supplier_sysco', 'received', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days', 1250.75, 'Weekly protein order'),
('po_002', 'PO-2024-002', 'supplier_local_farm', 'received', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days', 385.50, 'Fresh produce delivery'),
('po_003', 'PO-2024-003', 'supplier_specialty', 'ordered', NOW() - INTERVAL '2 days', NOW() + INTERVAL '1 day', 890.25, 'Specialty ingredients for new menu'),
('po_004', 'PO-2024-004', 'supplier_usfoods', 'pending', NOW(), NOW() + INTERVAL '3 days', 675.00, 'Pantry staples restock');

-- Insert receipts for received orders
INSERT INTO receipts (id, purchase_order_id, receipt_number, received_date, received_by, notes) VALUES
('rcpt_001', 'po_001', 'RCP-2024-001', NOW() - INTERVAL '5 days', 'chef_john', 'All items received in good condition'),
('rcpt_002', 'po_002', 'RCP-2024-002', NOW() - INTERVAL '3 days', 'sous_chef_mary', 'Produce quality excellent');

-- Insert sample stock movements
INSERT INTO stock_moves (item_id, qty_base, cost_per_base, source, destination, reason, reference, location_id) VALUES
-- Receiving movements
('item_chicken_breast', 25.0, 8.50, 'Sysco Delivery', 'Walk-in Cooler', 'received', 'PO-2024-001', 'loc_walk_in_cooler'),
('item_salmon_fillet', 10.0, 22.00, 'Sysco Delivery', 'Walk-in Cooler', 'received', 'PO-2024-001', 'loc_walk_in_cooler'),
('item_onions_yellow', 20.0, 2.25, 'Local Farm Delivery', 'Dry Storage', 'received', 'PO-2024-002', 'loc_dry_storage'),
('item_carrots', 15.0, 1.85, 'Local Farm Delivery', 'Walk-in Cooler', 'received', 'PO-2024-002', 'loc_walk_in_cooler'),
('item_butter_unsalted', 8.0, 6.75, 'Sysco Delivery', 'Walk-in Cooler', 'received', 'PO-2024-001', 'loc_walk_in_cooler'),
-- Production movements
('item_chicken_breast', -5.0, 8.50, 'Walk-in Cooler', 'Production', 'consumed', 'BATCH-001', 'loc_walk_in_cooler'),
('item_onions_yellow', -2.0, 2.25, 'Dry Storage', 'Production', 'consumed', 'BATCH-001', 'loc_dry_storage'),
('item_carrots', -1.5, 1.85, 'Walk-in Cooler', 'Production', 'consumed', 'BATCH-001', 'loc_walk_in_cooler'),
-- Transfer movements
('item_olive_oil', 2.0, 15.50, 'Dry Storage', 'Main Kitchen', 'transferred', 'Daily Mise', 'loc_main_kitchen'),
('item_salt_kosher', 1.0, 2.15, 'Dry Storage', 'Prep Room', 'transferred', 'Prep Setup', 'loc_prep_room');

-- Insert sample recipes
INSERT INTO recipes (id, name, description, yield_uom, yield_qty_base, instructions, active) VALUES
('recipe_chicken_stir_fry', 'Chicken Stir Fry', 'Classic chicken and vegetable stir fry', 'portion', 4.0, 
'1. Cut chicken into strips and season
2. Heat oil in wok over high heat
3. Stir fry chicken until golden
4. Add vegetables and cook until tender-crisp
5. Serve immediately over rice', TRUE),
('recipe_salmon_teriyaki', 'Teriyaki Salmon', 'Glazed salmon with teriyaki sauce', 'portion', 2.0,
'1. Season salmon fillets with salt and pepper
2. Sear in hot pan skin-side down
3. Flip and brush with teriyaki glaze
4. Finish in oven at 400°F for 8-10 minutes
5. Garnish with sesame seeds and scallions', TRUE);

-- Insert recipe items (ingredients for recipes)
INSERT INTO recipe_items (recipe_id, item_id, qty_base, loss_pct) VALUES
-- Chicken Stir Fry ingredients
('recipe_chicken_stir_fry', 'item_chicken_breast', 0.6, 5.0),
('recipe_chicken_stir_fry', 'item_onions_yellow', 0.2, 10.0),
('recipe_chicken_stir_fry', 'item_carrots', 0.15, 15.0),
('recipe_chicken_stir_fry', 'item_olive_oil', 0.03, 0.0),
-- Teriyaki Salmon ingredients
('recipe_salmon_teriyaki', 'item_salmon_fillet', 0.35, 2.0),
('recipe_salmon_teriyaki', 'item_olive_oil', 0.02, 0.0);

-- Insert sample production batches
INSERT INTO batches (id, recipe_id, batch_number, produced_qty_base, production_date, notes) VALUES
('batch_001', 'recipe_chicken_stir_fry', 'BATCH-2024-001', 12.0, NOW() - INTERVAL '1 day', 'Lunch service preparation'),
('batch_002', 'recipe_salmon_teriyaki', 'BATCH-2024-002', 8.0, NOW() - INTERVAL '1 day', 'Dinner service preparation');

-- Insert sample inventory counts
INSERT INTO counts (location_id, item_id, qty_base, count_date, counted_by, variance, notes) VALUES
('loc_walk_in_cooler', 'item_chicken_breast', 18.5, NOW() - INTERVAL '1 day', 'inventory_manager', -1.5, 'Slight variance, within acceptable range'),
('loc_walk_in_cooler', 'item_salmon_fillet', 9.8, NOW() - INTERVAL '1 day', 'inventory_manager', -0.2, 'Good accuracy'),
('loc_dry_storage', 'item_onions_yellow', 17.0, NOW() - INTERVAL '1 day', 'inventory_manager', -1.0, 'Some spoilage removed'),
('loc_walk_in_cooler', 'item_carrots', 12.8, NOW() - INTERVAL '1 day', 'inventory_manager', -0.7, 'Expected variance from prep');

-- Insert sample wastage logs
INSERT INTO wastage_logs (item_id, qty_base, reason, cost, waste_date, notes) VALUES
('item_onions_yellow', 1.0, 'expired', 2.25, NOW() - INTERVAL '2 days', 'Onions starting to sprout'),
('item_carrots', 0.5, 'preparation_loss', 0.93, NOW() - INTERVAL '1 day', 'Peeling and trimming waste'),
('item_salmon_fillet', 0.2, 'damaged', 4.40, NOW() - INTERVAL '3 days', 'Bruised during delivery'),
('item_heavy_cream', 0.3, 'expired', 1.28, NOW() - INTERVAL '1 day', 'Past use-by date');

COMMIT;