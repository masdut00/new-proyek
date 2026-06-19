import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import './style.css';
import { uploadFotoKain } from './assets/js/claudinary.js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// App State
let currentUser = null;
let currentTab = 'dashboard';
let tamuList = [];
let sumbanganList = [];
let pelangganList = [];
let selectedTamu = null;
let selectedPelanggan = null;

// DOM Elements
const authBtn = document.getElementById('auth-btn');
const authModal = document.getElementById('auth-modal');
const authForm = document.getElementById('auth-form');
const registerForm = document.getElementById('register-form');
const modalContainer = document.getElementById('modal-container');
const modalTitleEl = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalSubmit = document.getElementById('modal-submit');
const detailModal = document.getElementById('detail-modal');
const detailTitle = document.getElementById('detail-title');
const detailBody = document.getElementById('detail-body');
const detailActions = document.getElementById('detail-actions');
const toastContainer = document.getElementById('toast-container');

// Initialize App
document.addEventListener('DOMContentLoaded', init);

async function init() {
  // Check auth state
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    currentUser = session.user;
    updateAuthUI(true);
  }

  // Listen for auth changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      currentUser = session.user;
      updateAuthUI(true);
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
      updateAuthUI(false);
    }
  });

  // Setup event listeners
  setupEventListeners();

  // Load initial data
  await loadAllData();
  await loadDashboard();
}

function setupEventListeners() {
  // Bottom navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      switchTab(e.currentTarget.dataset.tab);
    });
  });

  // Auth button
  authBtn.addEventListener('click', () => {
    if (currentUser) {
      logout();
    } else {
      showModal(authModal);
    }
  });

  // Auth modal close
  authModal.querySelector('.modal-backdrop').addEventListener('click', () => {
    hideModal(authModal);
  });
  document.getElementById('auth-cancel').addEventListener('click', () => {
    hideModal(authModal);
  });
  document.getElementById('reg-cancel').addEventListener('click', () => {
    hideModal(authModal);
  });

  // Auth form
  authForm.addEventListener('submit', handleLogin);
  registerForm.addEventListener('submit', handleRegister);

  // Auth switch
  document.getElementById('show-register').addEventListener('click', () => {
    authForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
  });
  document.getElementById('show-login').addEventListener('click', () => {
    registerForm.classList.add('hidden');
    authForm.classList.remove('hidden');
  });

  // Modal close
  modalContainer.querySelector('.modal-close').addEventListener('click', () => {
    hideModal(modalContainer);
  });
  modalContainer.querySelector('.modal-backdrop').addEventListener('click', () => {
    hideModal(modalContainer);
  });
  modalContainer.querySelector('.modal-cancel').addEventListener('click', () => {
    hideModal(modalContainer);
  });

  // Detail modal close
  detailModal.querySelector('.modal-close').addEventListener('click', () => {
    hideModal(detailModal);
  });
  detailModal.querySelector('.modal-backdrop').addEventListener('click', () => {
    hideModal(detailModal);
  });

  // Add buttons
  document.getElementById('add-tamu-btn').addEventListener('click', () => showTamuForm());
  document.getElementById('add-sumbangan-btn').addEventListener('click', () => showSumbanganForm());
  document.getElementById('add-pelanggan-btn').addEventListener('click', () => showPelangganForm());

  // Search inputs
  document.getElementById('search-sumbangan').addEventListener('input', filterSumbanganList);
  document.getElementById('search-gorden').addEventListener('input', filterGordenList);
  document.getElementById('filter-desa').addEventListener('change', filterSumbanganList);
  document.getElementById('filter-status').addEventListener('change', filterSumbanganList);

  // Detail actions
  document.getElementById('detail-edit').addEventListener('click', handleDetailEdit);
  document.getElementById('detail-delete').addEventListener('click', handleDetailDelete);
}

// Modal helpers
function showModal(modalEl) {
  modalEl.classList.add('visible');
}

function hideModal(modalEl) {
  modalEl.classList.remove('visible');
}

// Auth Functions
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    showToast(error.message, 'error');
  } else {
    hideModal(authModal);
    authForm.reset();
    showToast('Login berhasil!', 'success');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    showToast(error.message, 'error');
  } else {
    hideModal(authModal);
    registerForm.reset();
    showToast('Registrasi berhasil! Silakan login.', 'success');
    registerForm.classList.add('hidden');
    authForm.classList.remove('hidden');
  }
}

async function logout() {
  await supabase.auth.signOut();
  showToast('Logout berhasil!', 'info');
}

function updateAuthUI(isLoggedIn) {
  const btnContent = authBtn.querySelectorAll('span');
  if (isLoggedIn) {
    btnContent[0].textContent = '✓';
    btnContent[1].textContent = currentUser?.email?.split('@')[0] || 'User';
    authBtn.classList.add('logged-in');
    document.querySelectorAll('.add-btn').forEach(btn => btn.classList.remove('hidden'));
  } else {
    btnContent[0].textContent = '🔐';
    btnContent[1].textContent = 'Log In';
    authBtn.classList.remove('logged-in');
    document.querySelectorAll('.add-btn').forEach(btn => btn.classList.add('hidden'));
  }
}

// Tab Navigation
window.switchTab = function(tabName) {
  currentTab = tabName;

  // Update nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tabName);
  });

  // Update content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `${tabName}-tab`);
  });
};

// Data Loading Functions
async function loadAllData() {
  await Promise.all([
    loadTamuList(),
    loadSumbanganList(),
    loadPelangganList()
  ]);
}

async function loadDashboard() {
  // Load totals
  const { data: tamuData } = await supabase.from('buku_tamu').select('id');
  const { data: pelangganData } = await supabase.from('pelanggan_gorden').select('id');
  const { data: pesananData } = await supabase.from('pesanan_jendela').select('id, total_harga');

  document.getElementById('total-tamu').textContent = tamuData?.length || 0;
  document.getElementById('total-pelanggan').textContent = pelangganData?.length || 0;
  document.getElementById('total-pesanan-summary').textContent = pesananData?.length || 0;

  const totalNilai = pesananData?.reduce((a, b) => a + (b.total_harga || 0), 0) || 0;
  document.getElementById('total-nilai-summary').textContent = Math.round(totalNilai / 1000);

  // Calculate hutang/piutang
  const { data: sumbanganData } = await supabase.from('riwayat_sumbangan').select('*');

  let totalHutang = 0;
  let totalPiutang = 0;

  if (sumbanganData) {
    sumbanganData.forEach(item => {
      if (item.peran === 'Memberi' && !item.status_kembali) {
        totalHutang += item.nominal;
      } else if (item.peran === 'Menerima' && !item.status_kembali) {
        totalPiutang += item.nominal;
      }
    });
  }

  document.getElementById('total-hutang').textContent = formatCurrency(totalHutang);
  document.getElementById('total-piutang').textContent = formatCurrency(totalPiutang);

  // Load recent activity
  const recentList = document.getElementById('recent-activity');
  recentList.innerHTML = '<li class="loading-item">Memuat aktivitas...</li>';

  const { data: recentDonations } = await supabase
    .from('riwayat_sumbangan')
    .select('*, buku_tamu(nama_lengkap)')
    .order('created_at', { ascending: false })
    .limit(5);

  if (recentDonations && recentDonations.length > 0) {
    recentList.innerHTML = recentDonations.map(item => `
      <li class="list-item activity-item">
        <div class="activity-icon ${item.peran === 'Memberi' ? 'give' : 'receive'}">
          ${item.peran === 'Memberi' ? '💸' : '💵'}
        </div>
        <div class="activity-content">
          <div class="activity-title">${item.buku_tamu?.nama_lengkap || 'Unknown'}</div>
          <div class="activity-meta">${item.jenis_acara} • ${formatDate(item.tanggal)}</div>
        </div>
        <div class="activity-amount ${item.peran === 'Menerima' ? 'positive' : 'negative'}">
          ${item.peran === 'Menerima' ? '+' : '-'}${formatCurrencyShort(item.nominal)}
        </div>
      </li>
    `).join('');

    recentList.querySelectorAll('.activity-item').forEach(item => {
      item.addEventListener('click', () => switchTab('sumbangan'));
    });
  } else {
    recentList.innerHTML = '<li class="empty-state">Belum ada aktivitas</li>';
  }
}

async function loadTamuList() {
  const { data } = await supabase
    .from('buku_tamu')
    .select('*, riwayat_sumbangan(*)')
    .order('created_at', { ascending: false });

  tamuList = data || [];
  renderTamuList();

  // Update desa filter
  const desaSet = new Set(tamuList.map(t => t.alamat_desa).filter(Boolean));
  const filterDesa = document.getElementById('filter-desa');
  filterDesa.innerHTML = '<option value="">Semua Desa</option>' +
    Array.from(desaSet).map(d => `<option value="${d}">${d}</option>`).join('');
}

async function loadSumbanganList() {
  const { data } = await supabase
    .from('riwayat_sumbangan')
    .select('*, buku_tamu(nama_lengkap, alamat_desa)')
    .order('tanggal', { ascending: false });

  sumbanganList = data || [];
  renderSumbanganList();
}

async function loadPelangganList() {
  const { data } = await supabase.from('pelanggan_gorden')
    .select('*, pesanan_jendela(*)')
    .order('created_at', { ascending: false });

  pelangganList = data || [];
  renderPelangganList();
  updateGordenSummary();
}

// Render Functions
function renderTamuList() {
  filterSumbanganList();
}

function filterSumbanganList() {
  const searchTerm = document.getElementById('search-sumbangan').value.toLowerCase();
  const filterDesa = document.getElementById('filter-desa').value;
  const filterStatus = document.getElementById('filter-status').value;

  let filtered = tamuList;

  if (searchTerm) {
    filtered = filtered.filter(t => t.nama_lengkap?.toLowerCase().includes(searchTerm));
  }

  if (filterDesa) {
    filtered = filtered.filter(t => t.alamat_desa === filterDesa);
  }

  if (filterStatus) {
    filtered = filtered.filter(t => {
      const sumbangan = t.riwayat_sumbangan || [];
      const totalMemberi = sumbangan.filter(s => s.peran === 'Memberi').reduce((a, b) => a + b.nominal, 0);
      const totalMenerima = sumbangan.filter(s => s.peran === 'Menerima').reduce((a, b) => a + b.nominal, 0);
      const lunas = totalMenerima === totalMemberi;
      return filterStatus === 'lunas' ? lunas : !lunas;
    });
  }

  const container = document.getElementById('tamu-list');

  if (filtered.length === 0) {
    container.innerHTML = '<li class="empty-state">Tidak ada data tamu</li>';
    return;
  }

  container.innerHTML = filtered.map(tamu => {
    const sumbangan = tamu.riwayat_sumbangan || [];
    const totalMemberi = sumbangan.filter(s => s.peran === 'Memberi').reduce((a, b) => a + b.nominal, 0);
    const totalMenerima = sumbangan.filter(s => s.peran === 'Menerima').reduce((a, b) => a + b.nominal, 0);
    const saldo = totalMenerima - totalMemberi;
    const lunas = saldo === 0;

    return `
      <li class="list-item tamu-item" data-id="${tamu.id}">
        <div class="tamu-header">
          <span class="tamu-name">${tamu.nama_lengkap}</span>
          <span class="tamu-status ${lunas ? 'lunas' : 'belum'}">${lunas ? '✓ Lunas' : 'Belum Lunas'}</span>
        </div>
        <div class="tamu-meta">📍 ${tamu.alamat_desa || 'Tidak ada alamat'}</div>
        <div class="tamu-stats">
          <div class="tamu-stat">
            <span class="tamu-stat-label">Diberikan</span>
            <span class="tamu-stat-value negative">${formatCurrencyShort(totalMemberi)}</span>
          </div>
          <div class="tamu-stat">
            <span class="tamu-stat-label">Diterima</span>
            <span class="tamu-stat-value positive">${formatCurrencyShort(totalMenerima)}</span>
          </div>
        </div>
      </li>
    `;
  }).join('');

  container.querySelectorAll('.tamu-item').forEach(item => {
    item.addEventListener('click', () => showTamuDetail(item.dataset.id));
  });
}

function renderSumbanganList() {
  const container = document.getElementById('sumbangan-list');
  const searchTerm = document.getElementById('search-sumbangan').value.toLowerCase();

  let filtered = sumbanganList;

  if (searchTerm) {
    filtered = filtered.filter(s => s.buku_tamu?.nama_lengkap?.toLowerCase().includes(searchTerm));
  }

  const filterDesa = document.getElementById('filter-desa').value;
  if (filterDesa) {
    filtered = filtered.filter(s => s.buku_tamu?.alamat_desa === filterDesa);
  }

  const filterStatus = document.getElementById('filter-status').value;
  if (filterStatus) {
    filtered = filtered.filter(s => {
      if (filterStatus === 'lunas') return s.status_kembali;
      return !s.status_kembali;
    });
  }

  if (filtered.length === 0) {
    container.innerHTML = '<li class="empty-state">Tidak ada riwayat sumbangan</li>';
    return;
  }

  container.innerHTML = filtered.map(item => `
    <li class="list-item sumbangan-item" data-id="${item.id}">
      <div class="sumbangan-info">
        <div class="sumbangan-title">${item.buku_tamu?.nama_lengkap || 'Unknown'}</div>
        <div class="sumbangan-meta">${item.jenis_acara} • ${formatDate(item.tanggal)}</div>
      </div>
      <div class="sumbangan-amount ${item.peran === 'Menerima' ? 'receive' : 'give'}">
        ${item.peran === 'Menerima' ? '+' : '-'}${formatCurrencyShort(item.nominal)}
      </div>
    </li>
  `).join('');

  container.querySelectorAll('.sumbangan-item').forEach(item => {
    item.addEventListener('click', () => showSumbanganDetail(item.dataset.id));
  });
}

function renderPelangganList() {
  filterGordenList();
}

function filterGordenList() {
  const container = document.getElementById('pelanggan-list');
  const searchTerm = document.getElementById('search-gorden').value.toLowerCase();

  let filtered = pelangganList;

  if (searchTerm) {
    filtered = filtered.filter(p => p.nama_pelanggan?.toLowerCase().includes(searchTerm));
  }

  if (filtered.length === 0) {
    container.innerHTML = '<li class="empty-state">Tidak ada data pelanggan</li>';
    return;
  }

  container.innerHTML = filtered.map(pelanggan => {
    const pesanan = pelanggan.pesanan_jendela || [];

    return `
      <li class="list-item pelanggan-item" data-id="${pelanggan.id}">
        <div class="pelanggan-info">
          <div class="pelanggan-name">${pelanggan.nama_pelanggan}</div>
          <div class="pelanggan-address">📍 ${pelanggan.alamat || 'Tidak ada alamat'}</div>
        </div>
        <div class="pelanggan-stats">
          <div class="pelanggan-count">${pesanan.length}</div>
          <div class="pelanggan-label">jendela</div>
        </div>
      </li>
    `;
  }).join('');

  container.querySelectorAll('.pelanggan-item').forEach(item => {
    item.addEventListener('click', () => showPelangganDetail(item.dataset.id));
  });
}

function updateGordenSummary() {
  const totalPesanan = pelangganList.reduce((a, p) => a + (p.pesanan_jendela?.length || 0), 0);
  const totalNilai = pelangganList.reduce((a, p) => {
    return a + (p.pesanan_jendela?.reduce((b, j) => b + (j.total_harga || 0), 0) || 0);
  }, 0);

  document.getElementById('total-pesanan').textContent = totalPesanan;
  document.getElementById('total-nilai-gorden').textContent = formatCurrencyShort(totalNilai);
}

// Detail Views
async function showTamuDetail(id) {
  selectedTamu = tamuList.find(t => t.id === id);
  if (!selectedTamu) return;

  detailTitle.textContent = selectedTamu.nama_lengkap;
  detailActions.classList.toggle('hidden', !currentUser);

  const sumbangan = selectedTamu.riwayat_sumbangan || [];
  const riwayatHTML = sumbangan.length > 0
    ? sumbangan.map(s => `
        <div class="detail-row">
          <span class="detail-label">${s.jenis_acara} • ${formatDate(s.tanggal)}</span>
          <span class="detail-value" style="color: ${s.peran === 'Menerima' ? 'var(--success)' : 'var(--danger)'}">
            ${s.peran === 'Menerima' ? '+' : '-'}${formatCurrencyShort(s.nominal)}
          </span>
        </div>
      `).join('')
    : '<p style="color: var(--text-muted); padding: var(--space-md)">Belum ada riwayat sumbangan</p>';

  detailBody.innerHTML = `
    <div class="detail-section">
      <div class="detail-section-title">Informasi Tamu</div>
      <div class="detail-row">
        <span class="detail-label">Nama</span>
        <span class="detail-value">${selectedTamu.nama_lengkap}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Alamat</span>
        <span class="detail-value">${selectedTamu.alamat_desa || '-'}</span>
      </div>
    </div>
    <div class="detail-section">
      <div class="detail-section-title">Riwayat Sumbangan</div>
      ${riwayatHTML}
    </div>
  `;

  showModal(detailModal);
}

async function showSumbanganDetail(id) {
  const sumbangan = sumbanganList.find(s => s.id === id);
  if (!sumbangan) return;

  selectedTamu = tamuList.find(t => t.id === sumbangan.id_tamu);
  detailTitle.textContent = sumbangan.buku_tamu?.nama_lengkap || 'Sumbangan';
  detailActions.classList.toggle('hidden', !currentUser);

  detailBody.innerHTML = `
    <div class="detail-section">
      <div class="detail-section-title">Detail Sumbangan</div>
      <div class="detail-row">
        <span class="detail-label">Nama</span>
        <span class="detail-value">${sumbangan.buku_tamu?.nama_lengkap || '-'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Jenis Acara</span>
        <span class="detail-value">${sumbangan.jenis_acara}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Peran</span>
        <span class="detail-value">${sumbangan.peran === 'Menerima' ? '💵 Menerima (masuk)' : '💸 Memberi (keluar)'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Tanggal</span>
        <span class="detail-value">${formatDate(sumbangan.tanggal)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Nominal</span>
        <span class="detail-value" style="color: ${sumbangan.peran === 'Menerima' ? 'var(--success)' : 'var(--danger)'}; font-size: var(--font-size-md)">
          ${formatCurrency(sumbangan.nominal)}
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status</span>
        <span class="detail-value">${sumbangan.status_kembali ? '✓ Sudah Lunas' : '⏳ Belum Lunas'}</span>
      </div>
    </div>
  `;

  showModal(detailModal);
}

async function showPelangganDetail(id) {
  selectedPelanggan = pelangganList.find(p => p.id === id);
  if (!selectedPelanggan) return;

  detailTitle.textContent = selectedPelanggan.nama_pelanggan;
  detailActions.classList.toggle('hidden', !currentUser);

  const pesanan = selectedPelanggan.pesanan_jendela || [];
  const totalNilai = pesanan.reduce((a, b) => a + (b.total_harga || 0), 0);

  detailBody.innerHTML = `
    <div class="detail-section">
      <div class="detail-section-title">Informasi Pelanggan</div>
      <div class="detail-row">
        <span class="detail-label">Nama</span>
        <span class="detail-value">${selectedPelanggan.nama_pelanggan}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Alamat</span>
        <span class="detail-value">${selectedPelanggan.alamat || '-'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Total Jendela</span>
        <span class="detail-value">${pesanan.length} unit</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Total Nilai</span>
        <span class="detail-value" style="color: var(--primary); font-weight: 700">${formatCurrency(totalNilai)}</span>
      </div>
    </div>
    <div class="window-items">
      <div class="detail-section-title">Daftar Pesanan Jendela</div>
      ${pesanan.length > 0 ? pesanan.map(p => `
        <div class="window-item">
          <div class="window-header">
            <span class="window-location">${p.lokasi_jendela}</span>
          </div>
          <div class="window-size">📐 ${p.tinggi_cm} × ${p.lebar_cm} cm</div>
          <div class="window-calc">
            <div class="calc-row">
              <span class="calc-label">Kebutuhan Kain</span>
              <span class="calc-value">${p.kebutuhan_kain_m?.toFixed(2) || '-'} m</span>
            </div>
            <div class="calc-row">
              <span class="calc-label">Harga/m</span>
              <span class="calc-value">${formatCurrencyShort(p.harga_per_m)}</span>
            </div>
            <div class="calc-row">
              <span class="calc-label">Total</span>
              <span class="calc-value" style="font-weight: 700; color: var(--primary)">${formatCurrencyShort(p.total_harga || 0)}</span>
            </div>
          </div>
          ${p.foto_kain_url ? `<img src="${p.foto_kain_url}" alt="Foto kain" class="window-fabric">` : ''}
        </div>
      `).join('') : '<p style="color: var(--text-muted); padding: var(--space-md)">Belum ada pesanan jendela</p>'}
    </div>
  `;

  showModal(detailModal);
}

// Form Functions
function showTamuForm(editData = null) {
  document.getElementById('modal-title').textContent = editData ? 'Edit Tamu' : 'Tambah Tamu Baru';

  modalBody.innerHTML = `
    <form id="tamu-form">
      <div class="form-group">
        <label for="tamu-nama">Nama Lengkap</label>
        <input type="text" id="tamu-nama" required placeholder="Masukkan nama lengkap" value="${editData?.nama_lengkap || ''}">
      </div>
      <div class="form-group">
        <label for="tamu-desa">Alamat Desa</label>
        <input type="text" id="tamu-desa" placeholder="Nama desa/alamat" value="${editData?.alamat_desa || ''}">
      </div>
    </form>
  `;

  modalSubmit.onclick = async () => {
    const nama = document.getElementById('tamu-nama').value.trim();
    const desa = document.getElementById('tamu-desa').value.trim();

    if (!nama) {
      showToast('Nama harus diisi', 'error');
      return;
    }

    try {
      if (editData) {
        const { error } = await supabase
          .from('buku_tamu')
          .update({ nama_lengkap: nama, alamat_desa: desa })
          .eq('id', editData.id);
        if (error) throw error;
        showToast('Data berhasil diperbarui', 'success');
      } else {
        const { error } = await supabase
          .from('buku_tamu')
          .insert({ nama_lengkap: nama, alamat_desa: desa });
        if (error) throw error;
        showToast('Tamu berhasil ditambahkan', 'success');
      }

      hideModal(modalContainer);
      await loadTamuList();
      await loadDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  showModal(modalContainer);
}

function showSumbanganForm(editData = null) {
  document.getElementById('modal-title').textContent = editData ? 'Edit Sumbangan' : 'Tambah Sumbangan';

  const tamuOptions = tamuList.map(t =>
    `<option value="${t.id}" ${editData?.id_tamu === t.id ? 'selected' : ''}>${t.nama_lengkap}</option>`
  ).join('');

  modalBody.innerHTML = `
    <form id="sumbangan-form">
      <div class="form-group">
        <label for="sumbangan-tamu">Tamu</label>
        <select id="sumbangan-tamu" required>
          <option value="">Pilih Tamu</option>
          ${tamuOptions}
        </select>
      </div>
      <div class="form-group">
        <label for="sumbangan-acara">Jenis Acara</label>
        <input type="text" id="sumbangan-acara" required placeholder="Sunatan, Nikahan, dll" value="${editData?.jenis_acara || ''}">
      </div>
      <div class="form-group">
        <label for="sumbangan-peran">Peran</label>
        <select id="sumbangan-peran" required>
          <option value="Menerima" ${editData?.peran === 'Menerima' ? 'selected' : ''}>💵 Menerima (orang lain kasih ke kita)</option>
          <option value="Memberi" ${editData?.peran === 'Memberi' ? 'selected' : ''}>💸 Memberi (kita kasih ke orang lain)</option>
        </select>
      </div>
      <div class="form-group">
        <label for="sumbangan-nominal">Nominal (Rp)</label>
        <input type="number" id="sumbangan-nominal" required min="0" placeholder="Masukkan nominal" value="${editData?.nominal || ''}">
      </div>
      <div class="form-group">
        <label for="sumbangan-tanggal">Tanggal</label>
        <input type="date" id="sumbangan-tanggal" required value="${editData?.tanggal || new Date().toISOString().split('T')[0]}">
      </div>
      <div class="form-group">
        <label style="display: flex; align-items: center; gap: var(--space-sm); cursor: pointer;">
          <input type="checkbox" id="sumbangan-status" ${editData?.status_kembali ? 'checked' : ''} style="width: 20px; height: 20px;">
          <span>Sudah Lunas / Dikembalikan</span>
        </label>
      </div>
    </form>
  `;

  modalSubmit.onclick = async () => {
    const idTamu = document.getElementById('sumbangan-tamu').value;
    const acara = document.getElementById('sumbangan-acara').value.trim();
    const peran = document.getElementById('sumbangan-peran').value;
    const nominal = parseInt(document.getElementById('sumbangan-nominal').value);
    const tanggal = document.getElementById('sumbangan-tanggal').value;
    const statusKembali = document.getElementById('sumbangan-status').checked;

    if (!idTamu || !acara || !nominal || !tanggal) {
      showToast('Semua field harus diisi', 'error');
      return;
    }

    try {
      const payload = {
        id_tamu: idTamu,
        jenis_acara: acara,
        peran: peran,
        nominal: nominal,
        tanggal: tanggal,
        status_kembali: statusKembali
      };

      if (editData) {
        const { error } = await supabase
          .from('riwayat_sumbangan')
          .update(payload)
          .eq('id', editData.id);
        if (error) throw error;
        showToast('Data berhasil diperbarui', 'success');
      } else {
        const { error } = await supabase.from('riwayat_sumbangan').insert(payload);
        if (error) throw error;
        showToast('Sumbangan berhasil ditambahkan', 'success');
      }

      hideModal(modalContainer);
      await loadSumbanganList();
      await loadTamuList();
      await loadDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  showModal(modalContainer);
}

function showPelangganForm(editData = null) {
  document.getElementById('modal-title').textContent = editData ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru';

  let windowForms = editData?.pesanan_jendela || [null];
  let windowFormsHTML = renderWindowForms(windowForms);

  modalBody.innerHTML = `
    <form id="pelanggan-form">
      <div class="form-group">
        <label for="pelanggan-nama">Nama Pelanggan</label>
        <input type="text" id="pelanggan-nama" required placeholder="Nama pemilik rumah" value="${editData?.nama_pelanggan || ''}">
      </div>
      <div class="form-group">
        <label for="pelanggan-alamat">Alamat</label>
        <textarea id="pelanggan-alamat" rows="2" placeholder="Alamat lengkap pemasangan">${editData?.alamat || ''}</textarea>
      </div>
      <div class="detail-section-title" style="margin-top: var(--space-md)">Pesanan Jendela</div>
      <div id="window-forms-container">
        ${windowFormsHTML}
      </div>
      <button type="button" class="add-window-btn" id="add-window-form">+ Tambah Jendela</button>
    </form>
  `;

  document.getElementById('add-window-form').addEventListener('click', () => {
    const container = document.getElementById('window-forms-container');
    const newForm = createWindowFormHTML(windowForms.length);
    container.insertAdjacentHTML('beforeend', newForm);
    windowForms.push(null);
  });

  modalSubmit.onclick = async () => {
    const nama = document.getElementById('pelanggan-nama').value.trim();
    const alamat = document.getElementById('pelanggan-alamat').value.trim();

    if (!nama) {
      showToast('Nama pelanggan harus diisi', 'error');
      return;
    }

    const windowCards = document.querySelectorAll('.window-form-card');
    const windowsData = [];

    windowCards.forEach((card) => {
      const lokasi = card.querySelector('.window-lokasi')?.value;
      const tinggi = parseFloat(card.querySelector('.window-tinggi')?.value) || 0;
      const lebar = parseFloat(card.querySelector('.window-lebar')?.value) || 0;
      const hargaM = parseInt(card.querySelector('.window-harga')?.value) || 0;
      const fotoUrl = card.querySelector('.window-foto-url')?.value || '';

      if (lokasi && tinggi > 0 && lebar > 0) {
        const kebutuhanKain = Math.ceil((tinggi / 100 + lebar / 100) * 1.2 * 10) / 10;
        const totalHarga = Math.ceil(kebutuhanKain * hargaM);

        windowsData.push({
          lokasi_jendela: lokasi,
          tinggi_cm: tinggi,
          lebar_cm: lebar,
          kebutuhan_kain_m: kebutuhanKain,
          harga_per_m: hargaM,
          foto_kain_url: fotoUrl,
          total_harga: totalHarga
        });
      }
    });

    try {
      let pelangganId = editData?.id;

      if (editData) {
        const { error } = await supabase
          .from('pelanggan_gorden')
          .update({ nama_pelanggan: nama, alamat: alamat })
          .eq('id', editData.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('pelanggan_gorden')
          .insert({ nama_pelanggan: nama, alamat: alamat })
          .select('id')
          .single();
        if (error) throw error;
        pelangganId = data.id;
      }

      if (windowsData.length > 0) {
        if (editData) {
          await supabase.from('pesanan_jendela').delete().eq('id_pelanggan', pelangganId);
        }

        const windowsWithId = windowsData.map(w => ({ ...w, id_pelanggan: pelangganId }));
        const { error: winError } = await supabase.from('pesanan_jendela').insert(windowsWithId);
        if (winError) throw winError;
      }

      showToast('Pelanggan berhasil disimpan', 'success');
      hideModal(modalContainer);
      await loadPelangganList();
      await loadDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  showModal(modalContainer);
}

function renderWindowForms(windows) {
  return windows.map((w, i) => createWindowFormHTML(i, w)).join('');
}

function createWindowFormHTML(index, data = null) {
  return `
    <div class="window-form-card" data-index="${index}">
      <div class="window-form-header">
        <span class="window-form-title">Jendela ${index + 1}</span>
        <button type="button" class="remove-window-btn" onclick="this.closest('.window-form-card').remove()">Hapus</button>
      </div>
      <div class="form-group">
        <label>Lokasi Jendela</label>
        <input type="text" class="window-lokasi" placeholder="Kamar Utama, Ruang Tamu, dll" value="${data?.lokasi_jendela || ''}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Tinggi (cm)</label>
          <input type="number" class="window-tinggi" min="0" placeholder="150" value="${data?.tinggi_cm || ''}">
        </div>
        <div class="form-group">
          <label>Lebar (cm)</label>
          <input type="number" class="window-lebar" min="0" placeholder="120" value="${data?.lebar_cm || ''}">
        </div>
      </div>
      <div class="form-group">
        <label>Harga per Meter (Rp)</label>
        <input type="number" class="window-harga" min="0" placeholder="50000" value="${data?.harga_per_m || ''}">
      </div>
      <div class="form-group">
        <div class="image-upload" onclick="this.querySelector('input[type=file]').click()">
          <input type="file" accept="image/*" style="display: none" onchange="handleImageUpload(this)">
          <input type="hidden" class="window-foto-url" value="${data?.foto_kain_url || ''}">
          ${data?.foto_kain_url
            ? `<img src="${data.foto_kain_url}" class="upload-preview" style="display: block">
               <p class="upload-text">Klik untuk ganti foto</p>`
            : `<div class="upload-icon">📷</div>
               <p class="upload-text">Klik untuk upload foto kain</p>`
          }
        </div>
      </div>
    </div>
  `;
}

window.handleImageUpload = async function(input) {
  const file = input.files[0];
  if (!file) return;

  const container = input.closest('.image-upload');

  container.innerHTML = `
    <input type="file" accept="image/*" style="display: none" onchange="handleImageUpload(this)">
    <input type="hidden" class="window-foto-url" value="">
    <div class="upload-icon">⏳</div>
    <p class="upload-text">Mengupload ke server...</p>
  `;

  try {
    const imageUrl = await uploadFotoKain(file);

    if (imageUrl) {
      container.innerHTML = `
        <input type="file" accept="image/*" style="display: none" onchange="handleImageUpload(this)">
        <input type="hidden" class="window-foto-url" value="${imageUrl}">
        <img src="${imageUrl}" class="upload-preview" style="display: block; width: 100%; border-radius: 8px; object-fit: cover;">
        <p class="upload-text">Klik untuk ganti foto</p>
      `;
      showToast('Foto berhasil diupload', 'success');
    } else {
      throw new Error('Gagal mendapatkan URL gambar');
    }
    
  } catch (err) {
    console.error(err);
    showToast('Gagal upload foto', 'error');
    
    container.innerHTML = `
      <input type="file" accept="image/*" style="display: none" onchange="handleImageUpload(this)">
      <input type="hidden" class="window-foto-url" value="">
      <div class="upload-icon">📷</div>
      <p class="upload-text">Klik untuk upload foto kain</p>
    `;
  }
};

// Detail Actions
function handleDetailEdit() {
  hideModal(detailModal);

  if (currentTab === 'sumbangan') {
    if (selectedTamu) {
      showTamuForm(selectedTamu);
    }
  } else if (currentTab === 'gorden') {
    if (selectedPelanggan) {
      showPelangganForm(selectedPelanggan);
    }
  }
}

async function handleDetailDelete() {
  if (!confirm('Yakin ingin menghapus data ini?')) return;

  hideModal(detailModal);

  try {
    if (currentTab === 'sumbangan' && selectedTamu) {
      const { error } = await supabase.from('buku_tamu').delete().eq('id', selectedTamu.id);
      if (error) throw error;
      await loadTamuList();
      await loadSumbanganList();
    } else if (currentTab === 'gorden' && selectedPelanggan) {
      const { error } = await supabase.from('pelanggan_gorden').delete().eq('id', selectedPelanggan.id);
      if (error) throw error;
      await loadPelangganList();
    }
    await loadDashboard();
    showToast('Data berhasil dihapus', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Utility Functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function formatCurrencyShort(amount) {
  if (amount >= 1000000) {
    return 'Rp ' + (amount / 1000000).toFixed(1) + 'jt';
  } else if (amount >= 1000) {
    return 'Rp ' + (amount / 1000).toFixed(0) + 'rb';
  }
  return 'Rp ' + amount;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(16px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
