-- Drop existing tables
DROP TABLE IF EXISTS pesanan_jendela CASCADE;
DROP TABLE IF EXISTS pelanggan_gorden CASCADE;
DROP TABLE IF EXISTS riwayat_sumbangan CASCADE;
DROP TABLE IF EXISTS buku_tamu CASCADE;

-- Hajatan (Events) Table
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

-- Sumbangan (Donations) Table
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

-- Pelanggan Gorden (Curtain Customers) Table
CREATE TABLE pelanggan_gorden (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_pelanggan VARCHAR(255) NOT NULL,
  alamat TEXT,
  telepon VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- Pesanan Jendela (Window Orders) Table
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

-- Aktivitas Log Table
CREATE TABLE aktivitas_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aksi VARCHAR(50) NOT NULL,
  entitas VARCHAR(50) NOT NULL,
  entitas_id UUID,
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- Enable RLS on all tables
ALTER TABLE hajatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE sumbangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pelanggan_gorden ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesanan_jendela ENABLE ROW LEVEL SECURITY;
ALTER TABLE aktivitas_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hajatan (Public Read, Authenticated Write)
CREATE POLICY "public_read_hajatan" ON hajatan FOR SELECT TO public USING (true);
CREATE POLICY "auth_insert_hajatan" ON hajatan FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_hajatan" ON hajatan FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_hajatan" ON hajatan FOR DELETE TO authenticated USING (true);

-- RLS Policies for sumbangan (Public Read, Authenticated Write)
CREATE POLICY "public_read_sumbangan" ON sumbangan FOR SELECT TO public USING (true);
CREATE POLICY "auth_insert_sumbangan" ON sumbangan FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_sumbangan" ON sumbangan FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_sumbangan" ON sumbangan FOR DELETE TO authenticated USING (true);

-- RLS Policies for pelanggan_gorden (Public Read, Authenticated Write)
CREATE POLICY "public_read_pelanggan_gorden" ON pelanggan_gorden FOR SELECT TO public USING (true);
CREATE POLICY "auth_insert_pelanggan_gorden" ON pelanggan_gorden FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_pelanggan_gorden" ON pelanggan_gorden FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_pelanggan_gorden" ON pelanggan_gorden FOR DELETE TO authenticated USING (true);

-- RLS Policies for pesanan_jendela (Public Read, Authenticated Write)
CREATE POLICY "public_read_pesanan_jendela" ON pesanan_jendela FOR SELECT TO public USING (true);
CREATE POLICY "auth_insert_pesanan_jendela" ON pesanan_jendela FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_pesanan_jendela" ON pesanan_jendela FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_pesanan_jendela" ON pesanan_jendela FOR DELETE TO authenticated USING (true);

-- RLS Policies for aktivitas_log (Public Read, Authenticated Write)
CREATE POLICY "public_read_aktivitas_log" ON aktivitas_log FOR SELECT TO public USING (true);
CREATE POLICY "auth_insert_aktivitas_log" ON aktivitas_log FOR INSERT TO authenticated WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_sumbangan_hajatan ON sumbangan(id_hajatan);
CREATE INDEX idx_sumbangan_nama ON sumbangan(nama_penyumbang);
CREATE INDEX idx_pesanan_jendela_pelanggan ON pesanan_jendela(id_pelanggan);
CREATE INDEX idx_hajatan_tanggal ON hajatan(tanggal);
CREATE INDEX idx_aktivitas_log_created ON aktivitas_log(created_at DESC);