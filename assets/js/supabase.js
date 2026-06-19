// Supabase Configuration
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper functions
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function logActivity(aksi, entitas, entitasId, deskripsi) {
  const user = await getCurrentUser();
  try {
    await supabase.from('aktivitas_log').insert({
      aksi,
      entitas,
      entitas_id: entitasId,
      deskripsi,
      created_by: user?.id
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
