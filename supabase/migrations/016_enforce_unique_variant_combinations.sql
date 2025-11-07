-- =====================================================
-- Garantizar combinaciones únicas de talla y color por producto
-- =====================================================

create unique index if not exists idx_product_variants_unique_combo
  on product_variants (product_id, coalesce(size, ''), coalesce(color, ''));


