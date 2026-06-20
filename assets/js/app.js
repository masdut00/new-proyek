// Main Application Module
import { supabase, logActivity, getCurrentUser } from './supabase.js';

// ============================================
// HAJATAN (Events) Functions
// ============================================

export async function getHajatanList(limit = 10, offset = 0) {
  const { data, error, count } = await supabase
    .from('hajatan')
    .select('*, sumbangan(count)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { data, count };
}

export async function getHajatanById(id) {
  const { data, error } = await supabase
    .from('hajatan')
    .select('*, sumbangan(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createHajatan(hajatanData) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from('hajatan')
    .insert({ ...hajatanData, created_by: user?.id })
    .select()
    .single();

  if (error) throw error;
  await logActivity('create', 'hajatan', data.id, `Membuat hajatan: ${hajatanData.nama_hajatan}`);
  return data;
}

export async function updateHajatan(id, hajatanData) {
  const { data, error } = await supabase
    .from('hajatan')
    .update(hajatanData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  await logActivity('update', 'hajatan', id, `Mengubah hajatan: ${hajatanData.nama_hajatan}`);
  return data;
}

export async function deleteHajatan(id) {
  const { error } = await supabase
    .from('hajatan')
    .delete()
    .eq('id', id);

  if (error) throw error;
  await logActivity('delete', 'hajatan', id, 'Menghapus hajatan');
}

// ============================================
// SUMBANGAN (Donations) Functions
// ============================================

export async function getSumbanganList(filters = {}, limit = 20, offset = 0) {
  let query = supabase
    .from('sumbangan')
    .select('*, hajatan(nama_hajatan, jenis_acara)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filters.id_hajatan) {
    query = query.eq('id_hajatan', filters.id_hajatan);
  }

  if (filters.search) {
    query = query.ilike('nama_penyumbang', `%${filters.search}%`);
  }

  if (filters.tanggal_dari) {
    query = query.gte('tanggal', filters.tanggal_dari);
  }

  if (filters.tanggal_sampai) {
    query = query.lte('tanggal', filters.tanggal_sampai);
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) throw error;
  return { data, count };
}

export async function getSumbanganById(id) {
  const { data, error } = await supabase
    .from('sumbangan')
    .select('*, hajatan(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createSumbangan(sumbanganData) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from('sumbangan')
    .insert({ ...sumbanganData, created_by: user?.id })
    .select()
    .single();

  if (error) throw error;
  await logActivity('create', 'sumbangan', data.id, `Menambah sumbangan dari: ${sumbanganData.nama_penyumbang}`);
  return data;
}

export async function updateSumbangan(id, sumbanganData) {
  const { data, error } = await supabase
    .from('sumbangan')
    .update(sumbanganData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  await logActivity('update', 'sumbangan', id, `Mengubah sumbangan: ${sumbanganData.nama_penyumbang}`);
  return data;
}

export async function deleteSumbangan(id) {
  const { error } = await supabase
    .from('sumbangan')
    .delete()
    .eq('id', id);

  if (error) throw error;
  await logActivity('delete', 'sumbangan', id, 'Menghapus sumbangan');
}

// ============================================
// PELANGGAN GORDEN (Curtain Customers) Functions
// ============================================

export async function getPelangganList(limit = 20, offset = 0) {
  const { data, error, count } = await supabase
    .from('pelanggan_gorden')
    .select('*, pesanan_jendela(id, total_harga, kebutuhan_kain_m, created_at)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { data, count };
}

export async function getPelangganById(id) {
  const { data, error } = await supabase
    .from('pelanggan_gorden')
    .select('*, pesanan_jendela(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createPelanggan(pelangganData) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from('pelanggan_gorden')
    .insert({ ...pelangganData, created_by: user?.id })
    .select()
    .single();

  if (error) throw error;
  await logActivity('create', 'pelanggan_gorden', data.id, `Menambah pelanggan: ${pelangganData.nama_pelanggan}`);
  return data;
}

export async function updatePelanggan(id, pelangganData) {
  const { data, error } = await supabase
    .from('pelanggan_gorden')
    .update(pelangganData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  await logActivity('update', 'pelanggan_gorden', id, `Mengubah pelanggan: ${pelangganData.nama_pelanggan}`);
  return data;
}

export async function deletePelanggan(id) {
  const { error } = await supabase
    .from('pelanggan_gorden')
    .delete()
    .eq('id', id);

  if (error) throw error;
  await logActivity('delete', 'pelanggan_gorden', id, 'Menghapus pelanggan');
}

// ============================================
// PESANAN JENDELA (Window Orders) Functions
// ============================================

export async function createPesananJendela(pesananData) {
  const { data, error } = await supabase
    .from('pesanan_jendela')
    .insert(pesananData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePesananJendela(id, pesananData) {
  const { data, error } = await supabase
    .from('pesanan_jendela')
    .update(pesananData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePesananJendela(id) {
  const { error } = await supabase
    .from('pesanan_jendela')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// AKTIVITAS LOG Functions
// ============================================

export async function getAktivitasList(limit = 10) {
  const { data, error } = await supabase
    .from('aktivitas_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// ============================================
// DASHBOARD Statistics
// ============================================

export async function getDashboardStats() {
  // Get hajatan count
  const { count: hajatanCount } = await supabase
    .from('hajatan')
    .select('*', { count: 'exact', head: true });

  // Get sumbangan count
  const { count: sumbanganCount } = await supabase
    .from('sumbangan')
    .select('*', { count: 'exact', head: true });

  // Get pelanggan count
  const { count: pelangganCount } = await supabase
    .from('pelanggan_gorden')
    .select('*', { count: 'exact', head: true });

  return {
    hajatanCount: hajatanCount || 0,
    sumbanganCount: sumbanganCount || 0,
    pelangganCount: pelangganCount || 0
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatCurrencyShort(amount) {
  if (amount >= 1000000) {
    return 'Rp' + (amount / 1000000).toFixed(1) + ' jt';
  } else if (amount >= 1000) {
    return 'Rp' + (amount / 1000).toFixed(0) + ' rb';
  }
  return 'Rp' + amount;
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function timeAgo(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
  return formatDate(dateStr);
}

// Toast notification
export function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${type === 'error' ? 'danger' : type} border-0 show`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'toast-container position-fixed top-0 end-0 p-3';
  container.style.zIndex = '1100';
  document.body.appendChild(container);
  return container;
}

// Calculate fabric requirement
export function calculateFabricNeed(heightCm, widthCm) {
  const heightM = heightCm / 100;
  const widthM = widthCm / 100;
  const fabricNeeded = Math.ceil((heightM + widthM) * 1.2 * 10) / 10;
  return fabricNeeded;
}

// Calculate total price
export function calculateTotalPrice(fabricM, pricePerM) {
  return Math.ceil(fabricM * pricePerM);
}

// Database Katalog Produk Duta Interior Gorden (Fetched dynamically from Supabase)
export async function getProdukKatalog() {
  const { data, error } = await supabase
    .from('produk_katalog')
    .select('*')
    .order('kategori', { ascending: true });
  if (error) {
    console.error("Gagal mengambil produk katalog dari Supabase:", error);
    return [];
  }
  return data;
}

export async function createProdukKatalog(produkData) {
  const { data, error } = await supabase
    .from('produk_katalog')
    .insert(produkData)
    .select()
    .single();

  if (error) throw error;
  await logActivity('create', 'produk_katalog', data.id, `Menambah produk katalog: ${produkData.nama}`);
  return data;
}

export async function updateProdukKatalog(id, produkData) {
  const { data, error } = await supabase
    .from('produk_katalog')
    .update(produkData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  await logActivity('update', 'produk_katalog', id, `Mengubah produk katalog: ${produkData.nama}`);
  return data;
}

export async function deleteProdukKatalog(id) {
  const { error } = await supabase
    .from('produk_katalog')
    .delete()
    .eq('id', id);

  if (error) throw error;
  await logActivity('delete', 'produk_katalog', id, `Menghapus produk katalog: ${id}`);
}

// Database Promosi/Carousel (Fetched dynamically from Supabase)
export async function getPromosiList() {
  const { data, error } = await supabase
    .from('promosi')
    .select('*')
    .order('urutan', { ascending: true });
  if (error) {
    console.error("Gagal mengambil data promosi dari Supabase:", error);
    return [];
  }
  return data;
}

export async function updatePromosi(id, promosiData) {
  const { data, error } = await supabase
    .from('promosi')
    .update(promosiData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  await logActivity('update', 'promosi', id, `Mengubah slide promosi: ${promosiData.judul}`);
  return data;
}

// Database Kategori Info (Penjelasan Layanan Publik)
export async function getKategoriInfo() {
  const { data, error } = await supabase
    .from('kategori_info')
    .select('*')
    .order('urutan', { ascending: true });
  if (error) {
    console.error("Gagal mengambil data kategori_info dari Supabase:", error);
    return [];
  }
  return data;
}

export async function updateKategoriInfo(id, kategoriData) {
  const { data, error } = await supabase
    .from('kategori_info')
    .update(kategoriData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  await logActivity('update', 'kategori_info', id, `Mengubah info kategori: ${kategoriData.nama}`);
  return data;
}

// Update Pelanggan Discount
export async function updatePelangganDiscount(id, diskon) {
  const { data, error } = await supabase
    .from('pelanggan_gorden')
    .update({ diskon })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  await logActivity('update', 'pelanggan_gorden', id, `Memperbarui diskon pelanggan menjadi: Rp ${diskon.toLocaleString('id-ID')}`);
  return data;
}
