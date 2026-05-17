// ========================================
// PILATES PAGE — JARRED CARTER
// ========================================

// ── LIVE CLOCK ──────────────────────────
function updateTime() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
    hour12: false, timeZone: 'America/New_York'
  });
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    timeZone: 'America/New_York'
  });
  const el = document.getElementById('current-time');
  if (el) el.textContent = `${timeStr} [NY] ${dateStr}`;
}
updateTime();
setInterval(updateTime, 1000);

// ── CUSTOM CURSOR ────────────────────────
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');

let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (cursor) {
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  }
});

// Smooth follower with lerp
function animateCursor() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  if (follower) {
    follower.style.left = followerX + 'px';
    follower.style.top  = followerY + 'px';
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Hover state — enlarge on interactive elements
const hoverTargets = document.querySelectorAll(
  'a, button, .brand-img, .strip-img, .video-wrap, .marquee-img'
);
hoverTargets.forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ── SCROLL REVEAL ────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');

      // Stagger credit rows within a visible group
      if (entry.target.classList.contains('credit-row')) {
        // handled individually
      }
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  rootMargin: '0px 0px -80px 0px',
  threshold: 0.08
});

// Observe brand blocks
document.querySelectorAll('.brand-block').forEach(el => revealObserver.observe(el));

// Stagger credit rows
document.querySelectorAll('.credit-row').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.07}s`;
  revealObserver.observe(el);
});

// ── VIDEO AUTOPLAY ON SCROLL ─────────────
const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const video = entry.target;
    if (entry.isIntersecting) {
      video.play().catch(() => {}); // catch autoplay policy errors
    } else {
      video.pause();
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('video[data-autoplay-on-scroll]').forEach(v => {
  videoObserver.observe(v);
});

// ── PARALLAX — hero bg word ──────────────
const bgWord = document.querySelector('.hero-bg-word');

let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const scrolled = window.scrollY;
      if (bgWord) {
        bgWord.style.transform = `translateY(${scrolled * 0.18}px)`;
      }
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

// ── SMOOTH SCROLL (anchor links) ─────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── IMAGE HOVER — tilt effect ─────────────
// Subtle 3D tilt on brand image tiles
document.querySelectorAll('.brand-img').forEach(img => {
  img.addEventListener('mousemove', (e) => {
    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 10;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -10;
    img.style.transform = `scale(1.02) rotateY(${x}deg) rotateX(${y}deg)`;
    img.style.transition = 'transform 0.1s ease';
  });

  img.addEventListener('mouseleave', () => {
    img.style.transform = '';
    img.style.transition = 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
  });
});

// ── MARQUEE — pause on hover ──────────────
const marqueeTrack = document.querySelector('.marquee-track');
if (marqueeTrack) {
  marqueeTrack.addEventListener('mouseenter', () => {
    marqueeTrack.style.animationPlayState = 'paused';
  });
  marqueeTrack.addEventListener('mouseleave', () => {
    marqueeTrack.style.animationPlayState = 'running';
  });
}

// ── HEADER HIDE/SHOW ON SCROLL ───────────
let lastScrollY = window.scrollY;
let headerHidden = false;

const backNav = document.querySelector('.back-nav');
const igLink  = document.querySelector('.ig-link');

window.addEventListener('scroll', () => {
  const currentY = window.scrollY;

  if (currentY > lastScrollY && currentY > 120 && !headerHidden) {
    if (backNav) backNav.style.transform = 'translateY(-80px)';
    if (igLink)  igLink.style.transform  = 'translateY(-80px)';
    headerHidden = true;
  } else if (currentY < lastScrollY && headerHidden) {
    if (backNav) backNav.style.transform = '';
    if (igLink)  igLink.style.transform  = '';
    headerHidden = false;
  }

  lastScrollY = currentY;
}, { passive: true });

if (backNav) backNav.style.transition = 'transform 0.35s cubic-bezier(0.76, 0, 0.24, 1), color 0.2s';
if (igLink)  igLink.style.transition  = 'transform 0.35s cubic-bezier(0.76, 0, 0.24, 1), color 0.2s';
