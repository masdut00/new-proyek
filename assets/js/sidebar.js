// Modular Sidebar Component for Admin Pages
const sidebarHtml = `
  <div class="sidebar-header">
    <a href="/dashboard.html" class="sidebar-brand">
      <div class="sidebar-brand-icon">
        <i class="bi bi-house-heart"></i>
      </div>
      <div class="sidebar-brand-text">
        Keluarga
        <small>Manajemen Data</small>
      </div>
    </a>
  </div>

  <nav class="sidebar-nav">
    <p class="nav-section-title">Menu Utama</p>
    <a href="/dashboard.html" class="sidebar-link" data-path="/dashboard.html">
      <i class="bi bi-grid-1x2"></i>
      <span>Dashboard</span>
    </a>
    <a href="/sumbangan/daftar-sumbangan.html" class="sidebar-link" data-path="/sumbangan/daftar-sumbangan.html">
      <i class="bi bi-people"></i>
      <span>Catatan Sumbangan</span>
    </a>
    <a href="/gorden/pelanggan.html" class="sidebar-link" data-path="/gorden/pelanggan.html">
      <i class="bi bi-window-split"></i>
      <span>Data Gorden</span>
    </a>
    <a href="/gorden/kalkulator-rab.html" class="sidebar-link" data-path="/gorden/kalkulator-rab.html">
      <i class="bi bi-calculator"></i>
      <span>Kalkulator RAB</span>
    </a>
    <a href="/gorden/katalog.html" class="sidebar-link" data-path="/gorden/katalog.html">
      <i class="bi bi-journal-richtext"></i>
      <span>Katalog Produk</span>
    </a>

    <p class="nav-section-title mt-4">Lainnya</p>
    <a href="/gorden/kelola-promosi.html" class="sidebar-link" data-path="/gorden/kelola-promosi.html">
      <i class="bi bi-images"></i>
      <span>Kelola Promosi</span>
    </a>
  </nav>
`;

document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.innerHTML = sidebarHtml;

    // Highlight active link
    const currentPath = window.location.pathname;
    const links = sidebar.querySelectorAll('.sidebar-link');
    links.forEach(link => {
      const path = link.getAttribute('data-path');
      let isActive = false;

      if (path === '/gorden/pelanggan.html') {
        // Active for pelanggan list, add-pelanggan, and detail-pelanggan
        isActive = currentPath.includes('/gorden/pelanggan.html') || 
                   currentPath.includes('/gorden/tambah-pelanggan.html') || 
                   currentPath.includes('/gorden/detail-pelanggan.html');
      } else {
        isActive = currentPath === path || currentPath.endsWith(path);
      }

      if (isActive) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Handle Overlay injection if not present
    let overlay = document.getElementById('sidebarOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      overlay.id = 'sidebarOverlay';
      document.body.prepend(overlay);
    }

    // Toggle menu logic for mobile
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('show');
        overlay.classList.toggle('show');
      });
    }

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('show');
      overlay.classList.remove('show');
    });
  }
});
