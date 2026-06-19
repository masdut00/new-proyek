-- Migration: Add window_group_id to pesanan_jendela for robust grouping
ALTER TABLE pesanan_jendela ADD COLUMN IF NOT EXISTS window_group_id VARCHAR(100);

-- Migrate existing rows to have a deterministic window_group_id if not present
UPDATE pesanan_jendela
SET window_group_id = COALESCE(
  window_group_id, 
  md5(id_pelanggan::text || '-' || COALESCE(nama_jendela, 'Jendela') || '-' || lebar_cm::text || '-' || tinggi_cm::text)
)
WHERE window_group_id IS NULL;
