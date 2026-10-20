import { TYPES } from './game-logic.js';

export const TYPE_ICON_FILES = Object.freeze(Object.fromEntries(TYPES.map(type => [type, type + '.svg'])));
const VALID_SIZES = new Set(['small', 'normal', 'large']);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

export function typeIconMarkup(type, { size = 'normal', decorative = true } = {}) {
  const key = String(type ?? '').trim().toLowerCase();
  const valid = Object.hasOwn(TYPE_ICON_FILES, key);
  const label = valid ? key.charAt(0).toUpperCase() + key.slice(1) : (key || 'Unknown');
  const sizeClass = VALID_SIZES.has(size) ? size : 'normal';
  const accessible = decorative ? 'aria-hidden="true"' : 'role="img" aria-label="' + escapeHtml(label + ' type') + '"';

  if (!valid) {
    return '<span class="type-icon type-icon--' + sizeClass + ' type-icon--fallback" ' + accessible + '><span class="type-icon-fallback" aria-hidden="true">?</span></span>';
  }

  const src = new URL('./assets/type-icons/' + TYPE_ICON_FILES[key], import.meta.url).href;
  return '<span class="type-icon type-icon--' + sizeClass + '" ' + accessible + '><img src="' + escapeHtml(src) + '" alt="" decoding="async" onerror="this.hidden=true;this.parentElement.classList.add(\'is-fallback\')"><span class="type-icon-fallback" aria-hidden="true">?</span></span>';
}
