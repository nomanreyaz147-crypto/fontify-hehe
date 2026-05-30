/**
 * FONTIFY – script.js
 * Real-time Unicode text style converter.
 * Supports 12 distinct Unicode font styles.
 * Zero dependencies. Optimised for instant load & SEO.
 */

'use strict';

/* ============================================================
   1. UNICODE CHARACTER MAPS
   Each map covers the 26 uppercase letters (A-Z),
   26 lowercase letters (a-z), and digits (0-9) where available.
   ============================================================ */

const CHAR_MAPS = {

  boldSerif: {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D400 + i); return acc;
    }, {}),
    lower: 'abcdefghijklmnopqrstuvwxyz'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D41A + i); return acc;
    }, {}),
    digit: '0123456789'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D7CE + i); return acc;
    }, {}),
  },

  italicSerif: {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D434 + i); return acc;
    }, {}),
    lower: (() => {
      const map = {};
      'abcdefghijklmnopqrstuvwxyz'.split('').forEach((c, i) => {
        // 'h' is a special case in italic serif (maps to planck constant ℎ)
        map[c] = c === 'h' ? '\u210E' : String.fromCodePoint(0x1D44E + i);
      });
      return map;
    })(),
    digit: {},
  },

  boldItalicSerif: {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D468 + i); return acc;
    }, {}),
    lower: 'abcdefghijklmnopqrstuvwxyz'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D482 + i); return acc;
    }, {}),
    digit: {},
  },

  monospace: {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D670 + i); return acc;
    }, {}),
    lower: 'abcdefghijklmnopqrstuvwxyz'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D68A + i); return acc;
    }, {}),
    digit: '0123456789'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D7F6 + i); return acc;
    }, {}),
  },

  scriptCursive: {
    upper: (() => {
      const base = 0x1D49C;
      const exceptions = { B: '\u212C', E: '\u2130', F: '\u2131', H: '\u210B', I: '\u2110', L: '\u2112', M: '\u2133', R: '\u211B' };
      const map = {};
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((c, i) => {
        map[c] = exceptions[c] || String.fromCodePoint(base + i);
      });
      return map;
    })(),
    lower: (() => {
      const base = 0x1D4B6;
      const exceptions = { e: '\u212F', g: '\u210A', o: '\u2134' };
      const map = {};
      'abcdefghijklmnopqrstuvwxyz'.split('').forEach((c, i) => {
        map[c] = exceptions[c] || String.fromCodePoint(base + i);
      });
      return map;
    })(),
    digit: {},
  },

  gothic: {
    upper: (() => {
      const base = 0x1D504;
      const exceptions = { C: '\u212D', H: '\u210C', I: '\u2111', R: '\u211C', Z: '\u2128' };
      const map = {};
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((c, i) => {
        map[c] = exceptions[c] || String.fromCodePoint(base + i);
      });
      return map;
    })(),
    lower: 'abcdefghijklmnopqrstuvwxyz'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D51E + i); return acc;
    }, {}),
    digit: {},
  },

  doubleStruck: {
    upper: (() => {
      const base = 0x1D538;
      const exceptions = { C: '\u2102', H: '\u210D', N: '\u2115', P: '\u2119', Q: '\u211A', R: '\u211D', Z: '\u2124' };
      const map = {};
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((c, i) => {
        map[c] = exceptions[c] || String.fromCodePoint(base + i);
      });
      return map;
    })(),
    lower: 'abcdefghijklmnopqrstuvwxyz'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D552 + i); return acc;
    }, {}),
    digit: '0123456789'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D7D8 + i); return acc;
    }, {}),
  },

  sansSerif: {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D5A0 + i); return acc;
    }, {}),
    lower: 'abcdefghijklmnopqrstuvwxyz'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D5BA + i); return acc;
    }, {}),
    digit: '0123456789'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D7E2 + i); return acc;
    }, {}),
  },

  boldSansSerif: {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D5D4 + i); return acc;
    }, {}),
    lower: 'abcdefghijklmnopqrstuvwxyz'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D5EE + i); return acc;
    }, {}),
    digit: '0123456789'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D7EC + i); return acc;
    }, {}),
  },

};

/* ============================================================
   2. SPECIAL TRANSFORMS (Bubbles, Upside Down, Strikethrough,
      Circled, Full Width)
   ============================================================ */

// Circled / Bubbles (A-Z, a-z, 0-9)
const BUBBLE_UPPER = 'ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ';
const BUBBLE_LOWER = 'ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ';
const BUBBLE_DIGIT = '⓪①②③④⑤⑥⑦⑧⑨';

// Upside Down character map
const UPSIDE_DOWN_MAP = {
  a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ',
  i: 'ᴉ', j: 'ɾ', k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd',
  q: 'b', r: 'ɹ', s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x',
  y: 'ʎ', z: 'z',
  A: '∀', B: 'ᗺ', C: 'Ɔ', D: 'ᗡ', E: 'Ǝ', F: 'Ⅎ', G: 'פ', H: 'H',
  I: 'I', J: 'ſ', K: 'ʞ', L: '˥', M: 'W', N: 'N', O: 'O', P: 'Ԁ',
  Q: 'Q', R: 'ᴚ', S: 'S', T: '┴', U: '∩', V: 'Λ', W: 'M', X: 'X',
  Y: '⅄', Z: 'Z',
  '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ',
  '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
  '.': '˙', ',': "'", "'": ',', '!': '¡', '?': '¿', '&': '⅋',
  '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{',
};

// Full Width
function toFullWidth(text) {
  return text.split('').map(c => {
    const code = c.charCodeAt(0);
    if (code >= 33 && code <= 126) return String.fromCharCode(code + 0xFF01 - 33);
    if (c === ' ') return '\u3000';
    return c;
  }).join('');
}

// Strikethrough (using combining character)
function toStrikethrough(text) {
  return text.split('').map(c => c === ' ' ? c : c + '\u0336').join('');
}

// Tiny Superscript
const SUPERSCRIPT_MAP = {
  a:'ᵃ', b:'ᵇ', c:'ᶜ', d:'ᵈ', e:'ᵉ', f:'ᶠ', g:'ᵍ', h:'ʰ', i:'ⁱ', j:'ʲ',
  k:'ᵏ', l:'ˡ', m:'ᵐ', n:'ⁿ', o:'ᵒ', p:'ᵖ', q:'ᑫ', r:'ʳ', s:'ˢ', t:'ᵗ',
  u:'ᵘ', v:'ᵛ', w:'ʷ', x:'ˣ', y:'ʸ', z:'ᶻ',
  A:'ᴬ', B:'ᴮ', C:'ᶜ', D:'ᴰ', E:'ᴱ', F:'ᶠ', G:'ᴳ', H:'ᴴ', I:'ᴵ', J:'ᴶ',
  K:'ᴷ', L:'ᴸ', M:'ᴹ', N:'ᴺ', O:'ᴼ', P:'ᴾ', Q:'Q', R:'ᴿ', S:'ˢ', T:'ᵀ',
  U:'ᵁ', V:'ⱽ', W:'ᵂ', X:'ˣ', Y:'ʸ', Z:'ᶻ',
  '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹',
};

/* ============================================================
   3. CORE CONVERSION FUNCTION
   ============================================================ */

function convertWithMap(text, map) {
  return text.split('').map(char => {
    if (map.upper && map.upper[char]) return map.upper[char];
    if (map.lower && map.lower[char]) return map.lower[char];
    if (map.digit && map.digit[char]) return map.digit[char];
    return char;
  }).join('');
}

function convertBubble(text) {
  return text.split('').map(char => {
    const uIdx = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(char);
    if (uIdx !== -1) return BUBBLE_UPPER[uIdx];
    const lIdx = 'abcdefghijklmnopqrstuvwxyz'.indexOf(char);
    if (lIdx !== -1) return BUBBLE_LOWER[lIdx];
    const dIdx = '0123456789'.indexOf(char);
    if (dIdx !== -1) return BUBBLE_DIGIT[dIdx];
    return char;
  }).join('');
}

function convertUpsideDown(text) {
  return text.split('').map(c => UPSIDE_DOWN_MAP[c] || c).reverse().join('');
}

function convertSuperscript(text) {
  return text.split('').map(c => SUPERSCRIPT_MAP[c] || c).join('');
}

/* ============================================================
   4. STYLE DEFINITIONS (name + converter)
   ============================================================ */

const FONT_STYLES = [
  {
    id: 'bold-serif',
    name: 'Bold Serif',
    convert: text => convertWithMap(text, CHAR_MAPS.boldSerif),
  },
  {
    id: 'italic-serif',
    name: 'Italic Serif',
    convert: text => convertWithMap(text, CHAR_MAPS.italicSerif),
  },
  {
    id: 'bold-italic',
    name: 'Bold Italic',
    convert: text => convertWithMap(text, CHAR_MAPS.boldItalicSerif),
  },
  {
    id: 'monospace',
    name: 'Monospace',
    convert: text => convertWithMap(text, CHAR_MAPS.monospace),
  },
  {
    id: 'cursive',
    name: 'Script / Cursive',
    convert: text => convertWithMap(text, CHAR_MAPS.scriptCursive),
  },
  {
    id: 'gothic',
    name: 'Gothic / Fraktur',
    convert: text => convertWithMap(text, CHAR_MAPS.gothic),
  },
  {
    id: 'double-struck',
    name: 'Double Struck',
    convert: text => convertWithMap(text, CHAR_MAPS.doubleStruck),
  },
  {
    id: 'sans',
    name: 'Sans Serif',
    convert: text => convertWithMap(text, CHAR_MAPS.sansSerif),
  },
  {
    id: 'bold-sans',
    name: 'Bold Sans',
    convert: text => convertWithMap(text, CHAR_MAPS.boldSansSerif),
  },
  {
    id: 'bubbles',
    name: 'Bubbles ⓐ',
    convert: convertBubble,
  },
  {
    id: 'upside-down',
    name: 'Upside Down',
    convert: convertUpsideDown,
  },
  {
    id: 'full-width',
    name: 'Full Width',
    convert: toFullWidth,
  },
  {
    id: 'strikethrough',
    name: 'Strikethrough',
    convert: toStrikethrough,
  },
  {
    id: 'superscript',
    name: 'Superscript',
    convert: convertSuperscript,
  },
];

/* ============================================================
   5. DOM REFERENCES
   ============================================================ */

const inputEl    = document.getElementById('userInput');
const fontGrid   = document.getElementById('fontGrid');
const emptyState = document.getElementById('emptyState');
const charCount  = document.getElementById('charCount');
const clearBtn   = document.getElementById('clearBtn');
const toast      = document.getElementById('toast');
const styleCount = document.getElementById('styleCount');
const footerYear = document.getElementById('footerYear');

/* ============================================================
   6. CARD RENDERING
   ============================================================ */

// SVG icons (inlined, no network request)
const COPY_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
</svg>`;

const CHECK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <polyline points="20 6 9 17 4 12"></polyline>
</svg>`;

function buildCard(style, convertedText) {
  const card = document.createElement('div');
  card.className = 'font-card';
  card.dataset.styleId = style.id;

  const top = document.createElement('div');
  top.className = 'card-top';

  const label = document.createElement('span');
  label.className = 'card-style-name';
  label.textContent = style.name;

  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-btn';
  copyBtn.setAttribute('aria-label', 'Copy ' + style.name + ' text');
  copyBtn.setAttribute('title', 'Copy to clipboard');
  copyBtn.innerHTML = COPY_ICON;
  copyBtn.addEventListener('click', () => handleCopy(copyBtn, convertedText));

  top.appendChild(label);
  top.appendChild(copyBtn);

  const textEl = document.createElement('div');
  textEl.className = 'card-text';
  textEl.textContent = convertedText;

  card.appendChild(top);
  card.appendChild(textEl);
  return card;
}

// Efficiently update existing cards or rebuild grid
let cardEls = []; // cache of rendered card elements

function renderCards(text) {
  const trimmed = text.trim();

  if (!trimmed) {
    fontGrid.innerHTML = '';
    cardEls = [];
    emptyState.classList.add('visible');
    return;
  }

  emptyState.classList.remove('visible');

  // Build or update cards
  if (cardEls.length === 0) {
    // First render: build all cards
    const fragment = document.createDocumentFragment();
    FONT_STYLES.forEach((style, i) => {
      const converted = style.convert(trimmed);
      const card = buildCard(style, converted);
      card.style.animationDelay = (i * 0.03) + 's';
      cardEls.push(card);
      fragment.appendChild(card);
    });
    fontGrid.appendChild(fragment);
  } else {
    // Subsequent renders: update text in existing cards only
    FONT_STYLES.forEach((style, i) => {
      const converted = style.convert(trimmed);
      const textEl = cardEls[i].querySelector('.card-text');
      if (textEl) textEl.textContent = converted;
      // Also update the copy button's closure
      const copyBtn = cardEls[i].querySelector('.copy-btn');
      if (copyBtn) {
        // Replace listener by cloning node
        const newBtn = copyBtn.cloneNode(true);
        newBtn.addEventListener('click', () => handleCopy(newBtn, converted));
        copyBtn.replaceWith(newBtn);
      }
    });
  }
}

/* ============================================================
   7. COPY HANDLER
   ============================================================ */

let toastTimer = null;

function handleCopy(btnEl, text) {
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    // Button feedback
    btnEl.innerHTML = CHECK_ICON;
    btnEl.classList.add('copied');
    btnEl.setAttribute('aria-label', 'Copied!');

    setTimeout(() => {
      btnEl.innerHTML = COPY_ICON;
      btnEl.classList.remove('copied');
      btnEl.setAttribute('aria-label', 'Copy to clipboard');
    }, 1800);

    // Toast
    showToast();
  }).catch(() => {
    // Fallback for older browsers
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast();
    } catch (e) {
      console.warn('Fontify: clipboard write failed', e);
    }
  });
}

function showToast() {
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ============================================================
   8. INPUT EVENTS
   ============================================================ */

// Debounce wrapper — keeps typing smooth on low-end devices
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const debouncedRender = debounce((val) => {
  // Reset card cache if input was cleared
  if (!val.trim() && cardEls.length > 0) {
    cardEls = [];
  }
  renderCards(val);
}, 80);

inputEl.addEventListener('input', () => {
  const val = inputEl.value;
  const len = val.length;

  // Char counter
  charCount.textContent = len;

  // Clear button visibility
  if (len > 0) {
    clearBtn.classList.add('visible');
  } else {
    clearBtn.classList.remove('visible');
    cardEls = []; // reset cache
  }

  debouncedRender(val);
});

clearBtn.addEventListener('click', () => {
  inputEl.value = '';
  charCount.textContent = '0';
  clearBtn.classList.remove('visible');
  cardEls = [];
  renderCards('');
  inputEl.focus();
});

/* ============================================================
   9. INIT
   ============================================================ */

function init() {
  // Show style count
  styleCount.textContent = FONT_STYLES.length + ' styles';

  // Footer year
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  // Show empty state on load
  emptyState.classList.add('visible');

  // Autofocus input (after paint to avoid layout shift)
  requestAnimationFrame(() => inputEl.focus());
}

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/* ============================================================
   10. THEME TOGGLE
   ============================================================ */
const themeToggle = document.getElementById('themeToggle');

if (themeToggle) {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀️';
  }

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      document.body.removeAttribute('data-theme');
      themeToggle.textContent = '🌙';
      localStorage.setItem('theme', 'light');
    } else {
      document.body.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '☀️';
      localStorage.setItem('theme', 'dark');
    }
  });
}