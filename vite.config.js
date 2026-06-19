import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        laporan: resolve(__dirname, 'laporan.html'),
        hajatanDaftar: resolve(__dirname, 'hajatan/daftar-hajatan.html'),
        hajatanTambah: resolve(__dirname, 'hajatan/tambah-hajatan.html'),
        sumbanganDaftar: resolve(__dirname, 'sumbangan/daftar-sumbangan.html'),
        sumbanganTambah: resolve(__dirname, 'sumbangan/tambah-sumbangan.html'),
        sumbanganDetail: resolve(__dirname, 'sumbangan/detail-sumbangan.html'),
        gordenPelanggan: resolve(__dirname, 'gorden/pelanggan.html'),
        gordenTambah: resolve(__dirname, 'gorden/tambah-pelanggan.html'),
        gordenDetail: resolve(__dirname, 'gorden/detail-pelanggan.html'),
        gordenKatalog: resolve(__dirname, 'gorden/katalog.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        gordenKalkulator: resolve(__dirname, 'gorden/kalkulator-rab.html'),
        gordenKelolaPromosi: resolve(__dirname, 'gorden/kelola-promosi.html'),
      },
    },
  },
});
