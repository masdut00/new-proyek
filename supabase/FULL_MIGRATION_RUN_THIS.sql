-- ============================================================
-- FULL MIGRATION: Duta Interior Gorden
-- Jalankan file ini di Supabase SQL Editor
-- Aman dijalankan berulang kali (idempotent)
-- ============================================================

-- ============================================================
-- STEP 1: CREATE TABLES (if not exists)
-- ============================================================

-- 1. Hajatan (Events)
CREATE TABLE IF NOT EXISTS hajatan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_hajatan VARCHAR(255) NOT NULL,
  jenis_acara VARCHAR(100) NOT NULL,
  tanggal DATE NOT NULL,
  lokasi VARCHAR(255),
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- 2. Sumbangan (Donations)
CREATE TABLE IF NOT EXISTS sumbangan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_hajatan UUID REFERENCES hajatan(id) ON DELETE CASCADE,
  nama_penyumbang VARCHAR(255) NOT NULL,
  nominal INTEGER NOT NULL DEFAULT 0,
  tanggal DATE NOT NULL,
  catatan TEXT,
  status VARCHAR(50) DEFAULT 'tercatat',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- 3. Pelanggan Gorden (Curtain Customers)
CREATE TABLE IF NOT EXISTS pelanggan_gorden (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_pelanggan VARCHAR(255) NOT NULL,
  alamat TEXT,
  telepon VARCHAR(50),
  diskon INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- 4. Pesanan Jendela (Window Orders) - Full schema with all columns
CREATE TABLE IF NOT EXISTS pesanan_jendela (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_pelanggan UUID REFERENCES pelanggan_gorden(id) ON DELETE CASCADE,
  lokasi_jendela VARCHAR(255) NOT NULL,
  nama_jendela VARCHAR(100),
  komponen VARCHAR(50),
  produk_nama VARCHAR(255),
  window_group_id VARCHAR(100),
  tinggi_cm NUMERIC(10,2) NOT NULL,
  lebar_cm NUMERIC(10,2) NOT NULL,
  kebutuhan_kain_m NUMERIC(10,2),
  harga_per_m INTEGER NOT NULL DEFAULT 0,
  foto_kain_url TEXT,
  total_harga INTEGER,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Aktivitas Log
CREATE TABLE IF NOT EXISTS aktivitas_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aksi VARCHAR(50) NOT NULL,
  entitas VARCHAR(50) NOT NULL,
  entitas_id UUID,
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- 6. Produk Katalog
CREATE TABLE IF NOT EXISTS produk_katalog (
  id VARCHAR(100) PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  kategori VARCHAR(100) NOT NULL,
  kategori_id VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  harga INTEGER NOT NULL,
  satuan VARCHAR(20) NOT NULL,
  icon VARCHAR(100) NOT NULL,
  gambar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Promosi (Carousel/Banners)
CREATE TABLE IF NOT EXISTS promosi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul VARCHAR(255) NOT NULL,
  subjudul TEXT,
  gambar_url TEXT NOT NULL,
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Kategori Info (Public landing page)
CREATE TABLE IF NOT EXISTS kategori_info (
  id VARCHAR(100) PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  deskripsi TEXT NOT NULL,
  gambar_url TEXT,
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- STEP 2: ADD MISSING COLUMNS (idempotent with IF NOT EXISTS)
-- ============================================================

-- pelanggan_gorden: add diskon column if missing
ALTER TABLE pelanggan_gorden ADD COLUMN IF NOT EXISTS diskon INTEGER NOT NULL DEFAULT 0;

-- pesanan_jendela: add new grouping columns if missing
ALTER TABLE pesanan_jendela ADD COLUMN IF NOT EXISTS nama_jendela VARCHAR(100);
ALTER TABLE pesanan_jendela ADD COLUMN IF NOT EXISTS komponen VARCHAR(50);
ALTER TABLE pesanan_jendela ADD COLUMN IF NOT EXISTS produk_nama VARCHAR(255);
ALTER TABLE pesanan_jendela ADD COLUMN IF NOT EXISTS window_group_id VARCHAR(100);

-- produk_katalog: add gambar_url if missing
ALTER TABLE produk_katalog ADD COLUMN IF NOT EXISTS gambar_url TEXT;


-- ============================================================
-- STEP 3: ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE hajatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE sumbangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pelanggan_gorden ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesanan_jendela ENABLE ROW LEVEL SECURITY;
ALTER TABLE aktivitas_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE produk_katalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE promosi ENABLE ROW LEVEL SECURITY;
ALTER TABLE kategori_info ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- STEP 4: CREATE RLS POLICIES (DROP FIRST TO AVOID CONFLICTS)
-- ============================================================

-- Hajatan policies
DROP POLICY IF EXISTS "public_read_hajatan" ON hajatan;
DROP POLICY IF EXISTS "auth_write_hajatan" ON hajatan;
CREATE POLICY "public_read_hajatan" ON hajatan FOR SELECT TO public USING (true);
CREATE POLICY "auth_write_hajatan" ON hajatan FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Sumbangan policies
DROP POLICY IF EXISTS "public_read_sumbangan" ON sumbangan;
DROP POLICY IF EXISTS "auth_write_sumbangan" ON sumbangan;
CREATE POLICY "public_read_sumbangan" ON sumbangan FOR SELECT TO public USING (true);
CREATE POLICY "auth_write_sumbangan" ON sumbangan FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Pelanggan Gorden policies
DROP POLICY IF EXISTS "public_read_pelanggan_gorden" ON pelanggan_gorden;
DROP POLICY IF EXISTS "auth_write_pelanggan_gorden" ON pelanggan_gorden;
CREATE POLICY "public_read_pelanggan_gorden" ON pelanggan_gorden FOR SELECT TO public USING (true);
CREATE POLICY "auth_write_pelanggan_gorden" ON pelanggan_gorden FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Pesanan Jendela policies
DROP POLICY IF EXISTS "public_read_pesanan_jendela" ON pesanan_jendela;
DROP POLICY IF EXISTS "auth_write_pesanan_jendela" ON pesanan_jendela;
CREATE POLICY "public_read_pesanan_jendela" ON pesanan_jendela FOR SELECT TO public USING (true);
CREATE POLICY "auth_write_pesanan_jendela" ON pesanan_jendela FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Aktivitas Log policies
DROP POLICY IF EXISTS "public_read_aktivitas_log" ON aktivitas_log;
DROP POLICY IF EXISTS "auth_write_aktivitas_log" ON aktivitas_log;
CREATE POLICY "public_read_aktivitas_log" ON aktivitas_log FOR SELECT TO public USING (true);
CREATE POLICY "auth_write_aktivitas_log" ON aktivitas_log FOR INSERT TO authenticated WITH CHECK (true);

-- Produk Katalog policies
DROP POLICY IF EXISTS "public_read_produk_katalog" ON produk_katalog;
DROP POLICY IF EXISTS "auth_write_produk_katalog" ON produk_katalog;
CREATE POLICY "public_read_produk_katalog" ON produk_katalog FOR SELECT TO public USING (true);
CREATE POLICY "auth_write_produk_katalog" ON produk_katalog FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Promosi policies
DROP POLICY IF EXISTS "public_read_promosi" ON promosi;
DROP POLICY IF EXISTS "auth_write_promosi" ON promosi;
CREATE POLICY "public_read_promosi" ON promosi FOR SELECT TO public USING (true);
CREATE POLICY "auth_write_promosi" ON promosi FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Kategori Info policies
DROP POLICY IF EXISTS "public_read_kategori_info" ON kategori_info;
DROP POLICY IF EXISTS "auth_write_kategori_info" ON kategori_info;
CREATE POLICY "public_read_kategori_info" ON kategori_info FOR SELECT TO public USING (true);
CREATE POLICY "auth_write_kategori_info" ON kategori_info FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ============================================================
-- STEP 5: CREATE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_sumbangan_hajatan ON sumbangan(id_hajatan);
CREATE INDEX IF NOT EXISTS idx_pesanan_jendela_pelanggan ON pesanan_jendela(id_pelanggan);
CREATE INDEX IF NOT EXISTS idx_pesanan_jendela_group ON pesanan_jendela(window_group_id);
CREATE INDEX IF NOT EXISTS idx_hajatan_tanggal ON hajatan(tanggal);
CREATE INDEX IF NOT EXISTS idx_aktivitas_log_created ON aktivitas_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_produk_kategori ON produk_katalog(kategori_id);
CREATE INDEX IF NOT EXISTS idx_promosi_urutan ON promosi(urutan);


-- ============================================================
-- STEP 6: MIGRATE EXISTING DATA
-- ============================================================

-- Migrate old pesanan_jendela records that don't have nama_jendela yet
UPDATE pesanan_jendela 
SET 
  nama_jendela = COALESCE(split_part(lokasi_jendela, ' - ', 1), 'Jendela Utama'),
  komponen = LOWER(COALESCE(NULLIF(split_part(split_part(lokasi_jendela, ' - ', 2), ' (', 1), ''), 'gorden')),
  produk_nama = COALESCE(NULLIF(split_part(split_part(lokasi_jendela, ' (', 2), ')', 1), ''), 'Kustom')
WHERE nama_jendela IS NULL;

-- Assign window_group_id to existing records that don't have one
UPDATE pesanan_jendela
SET window_group_id = COALESCE(
  window_group_id,
  md5(id_pelanggan::text || '-' || COALESCE(nama_jendela, 'Jendela') || '-' || lebar_cm::text || '-' || tinggi_cm::text)
)
WHERE window_group_id IS NULL;


-- ============================================================
-- STEP 7: SEED DATA (INSERT OR UPDATE - safe to re-run)
-- ============================================================

-- Produk Katalog
INSERT INTO produk_katalog (id, nama, kategori, kategori_id, deskripsi, harga, satuan, icon) VALUES
('amani-blackout', 'Seri Amani Blackout', 'Gorden Blackout', 'gorden-blackout', 'Kain tebal premium dengan tingkat block cahaya matahari hingga 100%. Sangat cocok untuk kamar tidur utama.', 85000, 'm', 'bi-moon-stars'),
('luxury-silk-blackout', 'Seri Luxury Silk Blackout', 'Gorden Blackout', 'gorden-blackout', 'Perpaduan bahan sutra bertekstur mewah dengan penahan sinar 100%. Memberikan kesan megah pada ruang keluarga.', 120000, 'm', 'bi-gem'),
('minimalis-dimout', 'Seri Minimalis Dimout', 'Gorden Dimout', 'gorden-dimout', 'Meredam silau matahari hingga 80%, ruangan tetap mendapatkan cahaya alami lembut. Jatuhan kain sangat rapi.', 65000, 'm', 'bi-sun-fill'),
('heritage-linen-dimout', 'Seri Heritage Linen Dimout', 'Gorden Dimout', 'gorden-dimout', 'Bahan bertekstur serat linen alami dengan efisiensi penahan panas 80%. Sangat cocok untuk gaya Japandi.', 75000, 'm', 'bi-palette'),
('poliester-standard', 'Poliester Standard', 'Gorden Standar', 'gorden-standar', 'Kain gorden ekonomis dan tahan lama, pilihan warna solid beraneka ragam.', 35000, 'm', 'bi-box-seam'),
('katun-satin', 'Katun Satin Lembut', 'Gorden Standar', 'gorden-standar', 'Bahan katun satin halus berkilau, memberikan tampilan bersih, adem, dan minimalis.', 50000, 'm', 'bi-flower2'),
('voile-putih-polos', 'Vitrace Voile Putih Polos', 'Vitrace', 'vitrace', 'Kain vitrace putih bersih berpori halus transparan. Sebagai daleman gorden untuk menjaga privasi di siang hari.', 45000, 'm', 'bi-clouds'),
('renda-klasik', 'Vitrace Renda Klasik', 'Vitrace', 'vitrace', 'Vitrace motif brokat renda yang manis untuk menambah estetika elegan pada jendela rumah.', 60000, 'm', 'bi-flower1'),
('rell-bulat-alumunium', 'Rell Bulat/Batang Alumunium', 'Rell', 'rell', 'Rell tiang silinder berlapis chrome emas, perak, atau hitam. Kuat menyangga gorden jenis smokering.', 30000, 'm', 'bi-record-circle'),
('rell-kotak-standard', 'Rell Kotak/Plisket Standard', 'Rell', 'rell', 'Rell geser bentuk kotak aluminium lengkap dengan kawat roda. Sangat mulus dan ekonomis untuk gorden cubit.', 20000, 'm', 'bi-layout-sidebar-inset'),
('roller-blind-sunscreen', 'Roller Blind Sunscreen', 'Roller Blind', 'roller-blind', 'Sistem gulung modern penahan panas matahari, bahan fiber mudah dibersihkan. Sangat cocok untuk dapur atau kantor.', 220000, 'm²', 'bi-distribute-vertical'),
('roller-blind-blackout', 'Roller Blind Blackout', 'Roller Blind', 'roller-blind', 'Roller blind penahan sinar 100%. Desain praktis, bersih, dan hemat ruang.', 280000, 'm²', 'bi-layout-text-sidebar-reverse'),
('vertical-blind-standard', 'Vertical Blind Standard', 'Vertical Blind', 'vertical-blind', 'Tirai vertikal dengan celah kain lebar 127mm. Cocok untuk jendela lebar di area komersial.', 180000, 'm²', 'bi-grid-3x2-gap'),
('kaca-film-sandblast', 'Kaca Film Sandblast', 'Kaca Film', 'kaca-film', 'Stiker buram kaca untuk efek buram es es (frosted glass), meningkatkan estetika dan privasi interior.', 90000, 'm', 'bi-layers-half'),
('kaca-film-riben', 'Kaca Film Riben', 'Kaca Film', 'kaca-film', 'Stiker kaca gelap penolak panas matahari (solar window film) untuk jendela rumah adem dan teduh.', 110000, 'm', 'bi-shadows')
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  kategori = EXCLUDED.kategori,
  harga = EXCLUDED.harga;

-- Kategori Info
INSERT INTO kategori_info (id, nama, deskripsi, gambar_url, urutan) VALUES
('gorden', 'Gorden Premium', 'Pilihan gorden berkualitas tinggi dengan berbagai motif eksklusif, tebal penahan cahaya (blackout), serat alami (dimout), maupun standar kain lokal.', NULL, 1),
('vitrace', 'Vitrace Lembut', 'Kain vitrace tipis elegan transparan berwarna putih bersih atau renda klasik brokat untuk menyaring matahari secara lembut.', NULL, 2),
('roller-blind', 'Roller Blind Modern', 'Tirai gulung praktis minimalis dengan bahan fiber penahan sinar 100% atau tabir surya (sunscreen). Cocok untuk dapur, kantor, atau kafe.', NULL, 3),
('vertical-blind', 'Vertical Blind', 'Tirai vertikal dengan celah kain modern lebar 127mm. Sempurna untuk sirkulasi cahaya di kantor maupun ruangan komersial.', NULL, 4),
('kaca-film', 'Kaca Film Praktis', 'Lapisan stiker kaca es buram (sandblast) untuk privasi tinggi kamar mandi atau riben gelap tolak panas untuk jendela adem.', NULL, 5),
('rell', 'Rell & Aksesoris', 'Berbagai pilihan rell gorden berkualitas; rell bulat aluminium, rell kotak plisket, hingga rell silinder premium.', NULL, 6)
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  deskripsi = EXCLUDED.deskripsi,
  urutan = EXCLUDED.urutan;


-- ============================================================
-- DONE! Semua tabel, kolom, kebijakan, dan data awal sudah siap.
-- ============================================================
