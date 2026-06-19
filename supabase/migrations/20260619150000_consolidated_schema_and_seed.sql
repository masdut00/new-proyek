-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS aktivitas_log CASCADE;
DROP TABLE IF EXISTS pesanan_jendela CASCADE;
DROP TABLE IF EXISTS pelanggan_gorden CASCADE;
DROP TABLE IF EXISTS sumbangan CASCADE;
DROP TABLE IF EXISTS hajatan CASCADE;
DROP TABLE IF EXISTS produk_katalog CASCADE;
DROP TABLE IF EXISTS promosi CASCADE;

-- 1. Hajatan (Events) Table
CREATE TABLE hajatan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_hajatan VARCHAR(255) NOT NULL,
  jenis_acara VARCHAR(100) NOT NULL,
  tanggal DATE NOT NULL,
  lokasi VARCHAR(255),
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- 2. Sumbangan (Donations) Table
CREATE TABLE sumbangan (
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

-- 3. Pelanggan Gorden (Curtain Customers) Table
CREATE TABLE pelanggan_gorden (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_pelanggan VARCHAR(255) NOT NULL,
  alamat TEXT,
  telepon VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- 4. Pesanan Jendela (Window Orders) Table
CREATE TABLE pesanan_jendela (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_pelanggan UUID REFERENCES pelanggan_gorden(id) ON DELETE CASCADE,
  lokasi_jendela VARCHAR(100) NOT NULL,
  tinggi_cm NUMERIC(10,2) NOT NULL,
  lebar_cm NUMERIC(10,2) NOT NULL,
  kebutuhan_kain_m NUMERIC(10,2),
  harga_per_m INTEGER NOT NULL DEFAULT 0,
  foto_kain_url TEXT,
  total_harga INTEGER,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Aktivitas Log Table
CREATE TABLE aktivitas_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aksi VARCHAR(50) NOT NULL,
  entitas VARCHAR(50) NOT NULL,
  entitas_id UUID,
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- 6. Produk Katalog Table
CREATE TABLE produk_katalog (
  id VARCHAR(100) PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  kategori VARCHAR(100) NOT NULL,
  kategori_id VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  harga INTEGER NOT NULL,
  satuan VARCHAR(20) NOT NULL,
  icon VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Promosi (Carousel/Banners) Table
CREATE TABLE promosi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul VARCHAR(255) NOT NULL,
  subjudul TEXT,
  gambar_url TEXT NOT NULL,
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE hajatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE sumbangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pelanggan_gorden ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesanan_jendela ENABLE ROW LEVEL SECURITY;
ALTER TABLE aktivitas_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE produk_katalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE promosi ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies (Public Read, Authenticated Write)
CREATE POLICY "public_read_hajatan" ON hajatan FOR SELECT TO public USING (true);
CREATE POLICY "auth_write_hajatan" ON hajatan FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public_read_sumbangan" ON sumbangan FOR SELECT TO public USING (true);
CREATE POLICY "auth_write_sumbangan" ON sumbangan FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public_read_pelanggan_gorden" ON pelanggan_gorden FOR SELECT TO public USING (true);
CREATE POLICY "auth_write_pelanggan_gorden" ON pelanggan_gorden FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public_read_pesanan_jendela" ON pesanan_jendela FOR SELECT TO public USING (true);
CREATE POLICY "auth_write_pesanan_jendela" ON pesanan_jendela FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public_read_aktivitas_log" ON aktivitas_log FOR SELECT TO public USING (true);
CREATE POLICY "auth_write_aktivitas_log" ON aktivitas_log FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "public_read_produk_katalog" ON produk_katalog FOR SELECT TO public USING (true);
CREATE POLICY "auth_write_produk_katalog" ON produk_katalog FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public_read_promosi" ON promosi FOR SELECT TO public USING (true);
CREATE POLICY "auth_write_promosi" ON promosi FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create Indexes for optimization
CREATE INDEX idx_sumbangan_hajatan ON sumbangan(id_hajatan);
CREATE INDEX idx_pesanan_jendela_pelanggan ON pesanan_jendela(id_pelanggan);
CREATE INDEX idx_hajatan_tanggal ON hajatan(tanggal);
CREATE INDEX idx_aktivitas_log_created ON aktivitas_log(created_at DESC);
CREATE INDEX idx_produk_kategori ON produk_katalog(kategori_id);
CREATE INDEX idx_promosi_urutan ON promosi(urutan);

-- ============================================
-- SEED DATA
-- ============================================

-- Seed Data: Produk Katalog
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
('kaca-film-riben', 'Kaca Film Riben', 'Kaca Film', 'kaca-film', 'Stiker kaca gelap penolak panas matahari (solar window film) untuk jendela rumah adem dan teduh.', 110000, 'm', 'bi-shadows');

-- Seed Data: Promosi (Carousel Gambar Berjalan)
INSERT INTO promosi (judul, subjudul, gambar_url, urutan) VALUES
('Gorden Mewah Klasik', 'Koleksi gorden double-layer premium dengan jatuhan kain anggun untuk ruang tamu megah Anda.', '/assets/images/promo_luxury.png', 1),
('Desain Minimalis Japandi', 'Dapatkan keteduhan interior modern dengan gorden serat linen yang menahan panas hingga 80%.', '/assets/images/promo_minimalist.png', 2),
('Roller Blinds Fungsional', 'Pilihan tirai gulung modern yang praktis, minimalis, dan sangat mudah dibersihkan untuk kantor atau dapur.', '/assets/images/promo_blinds.png', 3);
