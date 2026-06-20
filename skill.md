# Aturan Ketat Penghematan Token & Efisiensi Coding (System Rules)

Dokumen ini mendefinisikan instruksi wajib untuk AI Agent (Antigravity/Gemini) dalam berinteraksi dengan proyek ini untuk menghemat penggunaan token secara maksimal dan menghindari looping pengerjaan logic.

## 1. Pembatasan Output & Transmisi Token
- **DILARANG KERAS mencetak ulang seluruh isi file** (terutama file CSS, JS, atau HTML berukuran besar seperti `main.js` atau `style.css`).
- **Format Modifikasi**: Gunakan format **diff** (`diff` code block) atau sebutkan nomor baris spesifik beserta baris kode yang diubah (contoh: `// Baris 45-50 di main.js`).
- **Gaya Komunikasi**:
  - Sangat ringkas, langsung ke intinya (*to the point*), dan tanpa basa-basi.
  - Hindari intro percakapan berulang seperti "Tentu, saya akan membantu Anda...", "Berikut langkah-langkahnya...", dsb.
  - Tunjukkan rencana tindakan singkat, eksekusi, lalu laporkan hasilnya secara minimalis.
- **Selektivitas Pembacaan**: Gunakan parameter `StartLine` dan `EndLine` pada tool `view_file` untuk membaca baris kode spesifik, jangan membaca seluruh isi file jika tidak diperlukan.

## 2. Aturan Pencegahan Loop Error & Debugging (Two-Strike Rule)
- **Batas Kegagalan**: Jika sebuah command, skrip pengujian, build, atau integrasi mengalami error yang sama **2 kali berturut-turut**, **JANGAN** mencoba melakukan perbaikan otomatis (*auto-fix*) secara berulang-ulang yang menghabiskan token.
- **Tindakan**: Hentikan proses secara langsung, laporkan potongan log error secara singkat, berikan analisis singkat penyebabnya, dan tanyakan konfirmasi/instruksi selanjutnya kepada USER.

## 3. Karakteristik & Tools Proyek (Vite MPA + Supabase)
- **Teknologi**: Multi-Page Application (MPA) berbasis Vite + Supabase menggunakan Vanilla HTML, JavaScript, dan CSS.
- **Entry Points HTML**: Seluruh file HTML di root (`index.html`, `dashboard.html`, `laporan.html`, `login.html`) dan subfolder (`gorden/`, `hajatan/`, `sumbangan/`) adalah file kode sumber penting. Jangan mengabaikan atau menghapusnya.
- **Database**: Skema dan migrasi database dikelola via folder `supabase/`. Lakukan pemeriksaan terarah pada file migrasi `.sql` jika ada masalah sinkronisasi database, jangan men-query seluruh skema database jika tidak diperlukan.
- **Efisiensi Pencarian**: Gunakan tool `grep_search` untuk menemukan referensi fungsi/kelas secara cepat sebelum memutuskan membaca file secara keseluruhan.
