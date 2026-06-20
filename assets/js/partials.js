/**
 * partials.js — Shared Header & Footer loader
 * Usage: import { loadHeader, loadFooter } from '/assets/js/partials.js';
 *        await loadHeader();
 *        await loadFooter();
 */

const BASE = '/assets/partials/';

/**
 * Fetch an HTML partial and inject it into a target mount element.
 * @param {string} name  — 'header' | 'footer'
 * @param {string} mountId — ID of the mount div
 */
async function loadPartial(name, mountId) {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  try {
    const res = await fetch(`${BASE}${name}.html`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // Parse HTML to allow inline <script> tags to execute
    const template = document.createElement('template');
    template.innerHTML = html;

    // Inject all nodes
    mount.appendChild(template.content.cloneNode(true));

    // Re-execute any <script> tags (cloneNode doesn't run them)
    mount.querySelectorAll('script').forEach(oldScript => {
      const newScript = document.createElement('script');
      [...oldScript.attributes].forEach(attr => newScript.setAttribute(attr.name, attr.value));
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });

    // Re-inject <style> tags (ensure they're applied)
    mount.querySelectorAll('style').forEach(style => {
      if (!document.getElementById(style.id)) {
        document.head.appendChild(style.cloneNode(true));
      }
    });

  } catch (err) {
    console.warn(`[partials.js] Gagal memuat ${name}.html:`, err);
  }
}

export async function loadHeader() {
  await loadPartial('header', 'header-mount');
}

export async function loadFooter() {
  await loadPartial('footer', 'footer-mount');
}
