-- 1. Add columns to pesanan_jendela for window-based grouping
ALTER TABLE pesanan_jendela ADD COLUMN IF NOT EXISTS nama_jendela VARCHAR(100);
ALTER TABLE pesanan_jendela ADD COLUMN IF NOT EXISTS komponen VARCHAR(50);
ALTER TABLE pesanan_jendela ADD COLUMN IF NOT EXISTS produk_nama VARCHAR(255);

-- Migrate existing data in pesanan_jendela if any
-- (Parses "Kamar Utama - Gorden (Seri Amani Blackout)" -> nama_jendela = "Kamar Utama", komponen = "gorden", produk_nama = "Seri Amani Blackout")
UPDATE pesanan_jendela 
SET 
  nama_jendela = COALESCE(split_part(lokasi_jendela, ' - ', 1), 'Jendela Utama'),
  komponen = LOWER(COALESCE(split_part(split_part(lokasi_jendela, ' - ', 2), ' (', 1), 'gorden')),
  produk_nama = COALESCE(split_part(split_part(lokasi_jendela, ' (', 2), ')', 1), 'Kustom')
WHERE nama_jendela IS NULL;

-- 2. Add diskon to pelanggan_gorden
ALTER TABLE pelanggan_gorden ADD COLUMN IF NOT EXISTS diskon INTEGER NOT NULL DEFAULT 0;

-- 3. Add gambar_url to produk_katalog
ALTER TABLE produk_katalog ADD COLUMN IF NOT EXISTS gambar_url TEXT;

-- 4. Create kategori_info table
CREATE TABLE IF NOT EXISTS kategori_info (
  id VARCHAR(100) PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  deskripsi TEXT NOT NULL,
  gambar_url TEXT,
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE kategori_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_kategori_info" ON kategori_info FOR SELECT TO public USING (true);
CREATE POLICY "auth_write_kategori_info" ON kategori_info FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed kategori_info
INSERT INTO kategori_info (id, nama, deskripsi, gambar_url, urutan) VALUES
('gorden', 'Gorden Premium', 'Pilihan gorden berkualitas tinggi dengan berbagai motif eksklusif, tebal penahan cahaya (blackout), serat alami (dimout), maupun standar kain lokal.', '/assets/images/promo_luxury.png', 1)
ON CONFLICT (id) DO UPDATE 
SET nama = EXCLUDED.nama, deskripsi = EXCLUDED.deskripsi, gambar_url = EXCLUDED.gambar_url;

INSERT INTO kategori_info (id, nama, deskripsi, gambar_url, urutan) VALUES
('vitrace', 'Vitrace Lembut', 'Kain vitrace tipis elegan transparan berwarna putih bersih atau renda klasik brokat untuk menyaring matahari secara lembut.', '/assets/images/promo_minimalist.png', 2)
ON CONFLICT (id) DO UPDATE 
SET nama = EXCLUDED.nama, deskripsi = EXCLUDED.deskripsi, gambar_url = EXCLUDED.gambar_url;

INSERT INTO kategori_info (id, nama, deskripsi, gambar_url, urutan) VALUES
('roller-blind', 'Roller Blind Modern', 'Tirai gulung praktis minimalis dengan bahan fiber penahan sinar 100% atau tabir surya (sunscreen). Cocok untuk dapur, kantor, atau kafe.', '/assets/images/promo_blinds.png', 3)
ON CONFLICT (id) DO UPDATE 
SET nama = EXCLUDED.nama, deskripsi = EXCLUDED.deskripsi, gambar_url = EXCLUDED.gambar_url;

INSERT INTO kategori_info (id, nama, deskripsi, gambar_url, urutan) VALUES
('vertical-blind', 'Vertical Blind', 'Tirai vertikal dengan celah kain modern lebar 127mm. Sempurna untuk sirkulasi cahaya di kantor maupun ruangan komersial.', '/assets/images/promo_blinds.png', 4)
ON CONFLICT (id) DO UPDATE 
SET nama = EXCLUDED.nama, deskripsi = EXCLUDED.deskripsi, gambar_url = EXCLUDED.gambar_url;

INSERT INTO kategori_info (id, nama, deskripsi, gambar_url, urutan) VALUES
('kaca-film', 'Kaca Film Praktis', 'Lapisan stiker kaca es buram (sandblast) untuk privasi tinggi kamar mandi atau riben gelap tolak panas untuk jendela adem.', '/assets/images/promo_luxury.png', 5)
ON CONFLICT (id) DO UPDATE 
SET nama = EXCLUDED.nama, deskripsi = EXCLUDED.deskripsi, gambar_url = EXCLUDED.gambar_url;
