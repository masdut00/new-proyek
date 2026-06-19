-- Buku Tamu (Guest Book) Table
CREATE TABLE buku_tamu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_lengkap VARCHAR(255) NOT NULL,
  alamat_desa VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Riwayat Sumbangan (Donation History) Table
CREATE TABLE riwayat_sumbangan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tamu UUID REFERENCES buku_tamu(id) ON DELETE CASCADE,
  jenis_acara VARCHAR(100) NOT NULL,
  peran VARCHAR(50) NOT NULL CHECK (peran IN ('Menerima', 'Memberi')),
  nominal INTEGER NOT NULL DEFAULT 0,
  status_kembali BOOLEAN DEFAULT FALSE,
  tanggal DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pelanggan Gorden (Curtain Customers) Table
CREATE TABLE pelanggan_gorden (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_pelanggan VARCHAR(255) NOT NULL,
  alamat TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE buku_tamu ENABLE ROW LEVEL SECURITY;
ALTER TABLE riwayat_sumbangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pelanggan_gorden ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesanan_jendela ENABLE ROW LEVEL SECURITY;

-- RLS Policies for buku_tamu (Public Read, Authenticated Write)
CREATE POLICY "public_read_buku_tamu" ON buku_tamu FOR SELECT
  TO public USING (true);
CREATE POLICY "auth_insert_buku_tamu" ON buku_tamu FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_buku_tamu" ON buku_tamu FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_buku_tamu" ON buku_tamu FOR DELETE
  TO authenticated USING (true);

-- RLS Policies for riwayat_sumbangan (Public Read, Authenticated Write)
CREATE POLICY "public_read_riwayat_sumbangan" ON riwayat_sumbangan FOR SELECT
  TO public USING (true);
CREATE POLICY "auth_insert_riwayat_sumbangan" ON riwayat_sumbangan FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_riwayat_sumbangan" ON riwayat_sumbangan FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_riwayat_sumbangan" ON riwayat_sumbangan FOR DELETE
  TO authenticated USING (true);

-- RLS Policies for pelanggan_gorden (Public Read, Authenticated Write)
CREATE POLICY "public_read_pelanggan_gorden" ON pelanggan_gorden FOR SELECT
  TO public USING (true);
CREATE POLICY "auth_insert_pelanggan_gorden" ON pelanggan_gorden FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_pelanggan_gorden" ON pelanggan_gorden FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_pelanggan_gorden" ON pelanggan_gorden FOR DELETE
  TO authenticated USING (true);

-- RLS Policies for pesanan_jendela (Public Read, Authenticated Write)
CREATE POLICY "public_read_pesanan_jendela" ON pesanan_jendela FOR SELECT
  TO public USING (true);
CREATE POLICY "auth_insert_pesanan_jendela" ON pesanan_jendela FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_pesanan_jendela" ON pesanan_jendela FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_pesanan_jendela" ON pesanan_jendela FOR DELETE
  TO authenticated USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_riwayat_sumbangan_tamu ON riwayat_sumbangan(id_tamu);
CREATE INDEX idx_pesanan_jendela_pelanggan ON pesanan_jendela(id_pelanggan);
CREATE INDEX idx_buku_tamu_nama ON buku_tamu(nama_lengkap);
CREATE INDEX idx_pelanggan_gorden_nama ON pelanggan_gorden(nama_pelanggan);