-- Sample industrial products
INSERT INTO products
    (product_code, product_name, category, unit, base_price)
VALUES
    ('MOT-001', 'Three Phase Industrial Motor', 'Motors', 'PCS', 18500.00),
    ('PMP-001', 'Centrifugal Water Pump', 'Pumps', 'PCS', 12500.00),
    ('VLV-001', 'Stainless Steel Ball Valve', 'Valves', 'PCS', 3200.00),
    ('CMP-001', 'Industrial Air Compressor', 'Compressors', 'PCS', 45000.00),
    ('BRG-001', 'Heavy Duty Ball Bearing', 'Bearings', 'PCS', 1850.00),
    ('CNV-001', 'Industrial Conveyor Belt', 'Conveyors', 'METER', 2750.00)
ON CONFLICT (product_code) DO NOTHING;

-- Create initial inventory for products without inventory records
INSERT INTO inventory
    (product_id, physical_quantity, reserved_quantity)
SELECT
    p.id,
    100,
    0
FROM products p
WHERE p.product_code IN (
    'MOT-001', 'PMP-001', 'VLV-001',
    'CMP-001', 'BRG-001', 'CNV-001'
)
ON CONFLICT (product_id) DO NOTHING;