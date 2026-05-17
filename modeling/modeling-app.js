// ========================================
// MODELING PAGE — JARRED CARTER
// ========================================

// ── BRAND DATA ────────────────────────────
// Add / remove images here. Collections display in order.
// All paths relative to modeling/modeling-index.html → ../images/modeling-media/

const BRANDS = {

  renacio: {
    name: 'Renacio Reyes',
    collections: [
      {
        label: 'Spring / Summer · 2024',
        images: [
          '../images/modeling-media/renacio-reyes-walk.mp4',
          '../images/modeling-media/renacio-1.jpg',
          '../images/modeling-media/renacio-2.jpg',
          '../images/modeling-media/renacio-3.jpg',
          '../images/modeling-media/renacio-7.jpg',
          '../images/modeling-media/renacio-8.jpg',
        ],
      },
    ],
  },

  leak: {
    name: 'LEAK NYC',
    collections: [
      {
        label: 'WESLAH × LEAK · 2026',
        images: [
          '../images/modeling-media/leak-weslah-bts.mp4',
          '../images/modeling-media/weslah-leak-2.jpeg',
          '../images/modeling-media/weslah-leak-3.jpeg',
          '../images/modeling-media/weslah-leak-4.jpeg',
          '../images/modeling-media/weslah-leak-5.jpeg',
          '../images/modeling-media/weslah-leak-6.jpeg',
          '../images/modeling-media/weslah-leak-7.jpeg',
        ],
      },
      {
        label: 'Willie Norris Workshop × LEAK · 2025',
        images: [
          '../images/modeling-media/leak-bts-1.mp4',
          '../images/modeling-media/leak-02.jpg',
          '../images/modeling-media/leak-03.jpg',
          '../images/modeling-media/leak-04.png',
          '../images/modeling-media/leak-05.png',
          '../images/modeling-media/leak-08.jpg',
        ],
      }, 
      {
        label: 'LEAK · FALL 2024',
          images: [
              '../images/modeling-media/leaknycjjchinatownapartment-6.jpg',
              '../images/modeling-media/leaknycjjchinatownapartment-1.jpg',
              '../images/modeling-media/leaknycjjchinatownapartment-2.jpg',
              '../images/modeling-media/leaknycjjchinatownapartment-3.jpg',
              '../images/modeling-media/leaknycjjchinatownapartment-4.jpg',
              '../images/modeling-media/leaknycjjchinatownapartment-5.jpg',
          ]
      }  
    ],
  },
  boysmells: {
    name: 'Boy Smells',
    collections: [
      {
        label: 'Spring / Summer · 2025',
        images: [
          '../images/modeling-media/boysmells-citrush-bts.mp4',
          '../images/modeling-media/boysmells-1.jpeg',
          '../images/modeling-media/boysmells-2.jpeg',
          '../images/modeling-media/boysmells-3.jpeg',
          '../images/modeling-media/boysmells-4.jpeg',
          '../images/modeling-media/boysmells-5.jpeg',
          '../images/modeling-media/boysmells-6.jpeg',
          '../images/modeling-media/boysmells-7.jpeg',
          '../images/modeling-media/boysmells-8.jpeg',
        ],
      },
    ],
  },
    seanandval: {
        name: 'Sean & Val',
        collections: [
            {
                label: 'Spring / Summer · 2026',
                images: [
                    '../images/modeling-media/sean-val-bts-1.mp4',
                    '../images/modeling-media/sean-val-bts-2.mp4',
                    '../images/modeling-media/sean-val-6.jpeg',
                    '../images/modeling-media/sean-val-2.jpeg',
                    '../images/modeling-media/sean-val-4.jpeg',
                    '../images/modeling-media/sean-val-1.jpeg',
                    '../images/modeling-media/sean-val-3.jpeg',
                    '../images/modeling-media/sean-val-5.jpeg',
                ],
            },
        ],
    },
};


// ── GALLERY PANEL ────────────────────────
const panel      = document.getElementById('gallery-panel');
const backdrop   = document.getElementById('gallery-backdrop');
const panelBrand = document.getElementById('gallery-panel-brand');
const panelBody  = document.getElementById('gallery-panel-body');
const panelClose = document.getElementById('gallery-panel-close');

// Renders an <img> or <video> depending on file extension
function mediaTag(src, alt) {
  if (/\.(mp4|mov|webm)$/i.test(src)) {
    return `<video
      class="collection-img collection-video"
      autoplay muted loop playsinline
    ><source src="${src}" type="video/mp4"></video>`;
  }
  return `<img src="${src}" alt="${alt}" class="collection-img" loading="lazy">`;
}

function buildCollectionHTML(brand) {
  return brand.collections
    .map((col) => {
      const tags = col.images
        .map((src) => mediaTag(src, `${brand.name} — ${col.label}`))
        .join('');

      return `
        <div class="collection-block">
          <p class="collection-label">${col.label}</p>
          <div class="collection-grid">
            ${tags}
          </div>
        </div>
      `;
    })
    .join('');
}

function openPanel(brandKey) {
  const brand = BRANDS[brandKey];
  if (!brand) return;

  panelBrand.textContent = brand.name;
  panelBody.innerHTML = buildCollectionHTML(brand);
  panelBody.scrollTop = 0;

  panel.classList.add('is-open');
  backdrop.classList.add('is-open');
  panel.removeAttribute('aria-hidden');
  document.body.style.overflow = 'hidden';
}

function closePanel() {
  panel.classList.remove('is-open');
  backdrop.classList.remove('is-open');
  panel.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Open on brand button click
document.querySelectorAll('.brand-btn').forEach((btn) => {
  btn.addEventListener('click', () => openPanel(btn.dataset.brand));
});

// Close triggers
panelClose.addEventListener('click', closePanel);
backdrop.addEventListener('click', closePanel);


// ── LIGHTBOX ──────────────────────────────
const lightbox         = document.getElementById('lightbox');
const lightboxBackdrop = document.getElementById('lightbox-backdrop');
const lightboxImg      = document.getElementById('lightbox-img');
const lightboxClose    = document.getElementById('lightbox-close');
const lightboxPrev     = document.getElementById('lightbox-prev');
const lightboxNext     = document.getElementById('lightbox-next');

let lightboxImages = [];  // srcs for the current collection
let lightboxIndex  = 0;

function openLightbox(src, images, index) {
  lightboxImages = images;
  lightboxIndex  = index;
  lightboxImg.src = src;
  lightboxImg.alt = '';
  updateLightboxNav();
  lightbox.classList.add('is-open');
  lightbox.removeAttribute('aria-hidden');
}

function closeLightbox() {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
}

function lightboxStep(dir) {
  const next = lightboxIndex + dir;
  if (next < 0 || next >= lightboxImages.length) return;
  lightboxIndex = next;

  // Quick cross-fade on navigation
  lightboxImg.style.opacity = '0';
  setTimeout(() => {
    lightboxImg.src = lightboxImages[lightboxIndex];
    lightboxImg.style.opacity = '';   // CSS transition fades back in
    updateLightboxNav();
  }, 180);
}

function updateLightboxNav() {
  lightboxPrev.classList.toggle('is-hidden', lightboxIndex === 0);
  lightboxNext.classList.toggle('is-hidden', lightboxIndex === lightboxImages.length - 1);
}

// Close triggers
lightboxClose.addEventListener('click', closeLightbox);
lightboxBackdrop.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => lightboxStep(-1));
lightboxNext.addEventListener('click', () => lightboxStep(1));

// Click delegation — images inside the gallery body (videos are excluded)
document.getElementById('gallery-panel-body').addEventListener('click', (e) => {
  const img = e.target.closest('.collection-img');
  if (!img || img.tagName === 'VIDEO') return;

  // Collect all images in this collection block for prev/next
  const block  = img.closest('.collection-block');
  const images = [...block.querySelectorAll('.collection-img')].map((i) => i.src);
  const index  = images.indexOf(img.src);

  openLightbox(img.src, images, index);
});

// Keyboard: Escape closes lightbox first, then gallery; arrows navigate
document.addEventListener('keydown', (e) => {
  if (lightbox.classList.contains('is-open')) {
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  lightboxStep(-1);
    if (e.key === 'ArrowRight') lightboxStep(1);
    return;
  }
  if (e.key === 'Escape') closePanel();
});


// ── HERO FADE ON SCROLL ───────────────────
const heroIdentity = document.getElementById('hero-identity');
const heroScroll   = document.getElementById('hero-scroll');

function updateHeroFade() {
  const progress = Math.min(window.scrollY / (window.innerHeight * 0.38), 1);
  if (heroIdentity) heroIdentity.style.opacity = String(1 - progress);
  if (heroScroll)   heroScroll.style.opacity   = String(1 - progress * 2);
}

window.addEventListener('scroll', updateHeroFade, { passive: true });


// ── HIDE NAV ON SCROLL DOWN ───────────────
let lastScrollY = window.scrollY;
let navHidden   = false;

window.addEventListener('scroll', () => {
  const y = window.scrollY;

  if (y > lastScrollY && y > 80 && !navHidden) {
    document.body.classList.add('nav-hidden');
    navHidden = true;
  } else if (y < lastScrollY && navHidden) {
    document.body.classList.remove('nav-hidden');
    navHidden = false;
  }

  lastScrollY = y;
}, { passive: true });


// ── SCROLL REVEAL — CREDIT ROWS ───────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { rootMargin: '0px 0px -40px 0px', threshold: 0.1 },
);

document.querySelectorAll('.credit-row').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.07}s`;
  revealObserver.observe(el);
});
