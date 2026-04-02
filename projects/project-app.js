// ========================================
// PROJECT PAGE JAVASCRIPT
// ========================================

// Update current time in header
function updateTime() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/New_York'
  });
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York'
  });

  const timeElement = document.getElementById('current-time');
  if (timeElement) {
    timeElement.textContent = `${timeStr} [NY] ${dateStr}`;
  }
}

// Update time immediately and every second
updateTime();
setInterval(updateTime, 1000);

// ========================================
// SCROLL REVEAL ANIMATIONS
// Elements fade in as they scroll into view
// ========================================

// Check if IntersectionObserver is supported
if ('IntersectionObserver' in window) {
  const revealOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, revealOptions);

  // Observe elements that should reveal on scroll
  document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.content-section, .project-full-image, .project-image-grid');
    revealElements.forEach(el => {
      el.classList.add('reveal-element');
      revealObserver.observe(el);
    });
  });
} else {
  // Fallback for older browsers - show everything immediately
  document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.content-section, .project-full-image, .project-image-grid');
    revealElements.forEach(el => {
      el.classList.add('is-visible');
    });
  });
}

// ========================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ========================================

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (link) {
    e.preventDefault();
    const targetId = link.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
});

// ========================================
// PARALLAX EFFECT FOR BACKGROUND TEXT
// ========================================

let ticking = false;

function updateParallax() {
  const bgText = document.querySelector('.project-title-vertical');
  if (bgText) {
    const scrolled = window.pageYOffset;
    const rate = scrolled * 0.3;
    bgText.style.transform = `translateY(${rate}px)`;
  }
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(updateParallax);
    ticking = true;
  }
});

// ========================================
// NAVBAR VISIBILITY ON SCROLL
// Show/hide header based on scroll direction
// ========================================

let lastScrollY = window.scrollY;
let headerHidden = false;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  const header = document.querySelector('.header');
  
  if (!header) return;
  
  // Hide header when scrolling down, show when scrolling up
  if (currentScrollY > lastScrollY && currentScrollY > 100) {
    if (!headerHidden) {
      header.style.transform = 'translateY(-100%)';
      headerHidden = true;
    }
  } else {
    if (headerHidden) {
      header.style.transform = 'translateY(0)';
      headerHidden = false;
    }
  }
  
  lastScrollY = currentScrollY;
});

// Add transition for header
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  if (header) {
    header.style.transition = 'transform 0.3s ease';
  }
});
