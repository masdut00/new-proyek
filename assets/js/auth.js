// Authentication Module
import { supabase, getCurrentUser } from './supabase.js';

// Check authentication state
export async function checkAuth() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = '/login.html';
    return null;
  }
  return user;
}

// Check if user is logged in (without redirect)
export async function isLoggedIn() {
  const user = await getCurrentUser();
  return user !== null;
}

// Get user display name
export async function getUserDisplayName() {
  const user = await getCurrentUser();
  if (user) {
    return user.email?.split('@')[0] || 'User';
  }
  return null;
}

// Login function
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

// Register function
export async function register(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) throw error;
  return data;
}

// Logout function
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  window.location.href = '/login.html';
}

// Update UI based on auth state
export async function updateAuthUI() {
  const user = await getCurrentUser();
  const authButtons = document.querySelectorAll('.auth-button');
  const userButtons = document.querySelectorAll('.user-info');
  const addButtons = document.querySelectorAll('.add-data-btn');

  if (user) {
    authButtons.forEach(btn => {
      btn.innerHTML = `<i class="bi bi-box-arrow-right me-1"></i> Logout`;
      btn.onclick = logout;
    });

    userButtons.forEach(btn => {
      btn.textContent = user.email?.split('@')[0] || 'User';
    });

    addButtons.forEach(btn => {
      btn.classList.remove('d-none');
    });
  } else {
    authButtons.forEach(btn => {
      btn.innerHTML = `<i class="bi bi-box-arrow-in-right me-1"></i> Login`;
      btn.onclick = () => window.location.href = '/login.html';
    });

    addButtons.forEach(btn => {
      btn.classList.add('d-none');
    });
  }
}

// Initialize auth state listener
export function initAuthListener() {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      window.location.href = '/login.html';
    }
  });
}

// Export supabase for direct use
export { supabase };
