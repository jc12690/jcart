// ========================================
// JARRED CARTER PORTFOLIO - JAVASCRIPT
// ========================================

// Update current time
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
    timeElement.textContent = `${timeStr} [NYC] ${dateStr}`;
  }
}

// Update time every second
updateTime();
setInterval(updateTime, 1000);

// ========================================
// PASSWORD MODAL
// ========================================

const PASSWORD = 'mod3lportfol!o2026';
let isUnlocked = false;

function openPasswordModal() {
  const modal = document.getElementById('password-modal');
  const passwordForm = document.getElementById('password-form');
  const portfolioContent = document.getElementById('portfolio-content');
  const passwordInput = document.getElementById('password-input');
  const errorElement = document.getElementById('password-error');
  
  // Reset
  if (passwordInput) passwordInput.value = '';
  if (errorElement) errorElement.classList.remove('show');
  
  // Show appropriate content
  if (isUnlocked) {
    passwordForm.style.display = 'none';
    portfolioContent.style.display = 'block';
  } else {
    passwordForm.style.display = 'block';
    portfolioContent.style.display = 'none';
  }
  
  modal.classList.add('active');
}

function closePasswordModal() {
  const modal = document.getElementById('password-modal');
  modal.classList.remove('active');
}

function checkPassword() {
  const input = document.getElementById('password-input');
  const errorElement = document.getElementById('password-error');
  const passwordForm = document.getElementById('password-form');
  const portfolioContent = document.getElementById('portfolio-content');
  
  if (input.value === PASSWORD) {
    isUnlocked = true;
    errorElement.classList.remove('show');
    passwordForm.style.display = 'none';
    portfolioContent.style.display = 'block';
  } else {
    errorElement.classList.add('show');
  }
}

// Allow Enter key to submit password
document.addEventListener('DOMContentLoaded', function() {
  const passwordInput = document.getElementById('password-input');
  if (passwordInput) {
    passwordInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        checkPassword();
      }
    });
  }
});

// ========================================
// NAVIGATION HIGHLIGHTING
// ========================================

// Update active nav link based on scroll position
function updateActiveNav() {
  const sections = ['info', 'work', 'archive', 'contact'];
  const scrollPosition = window.scrollY + window.innerHeight / 3;
  
  sections.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    const navLink = document.querySelector(`[data-section="${sectionId}"]`);
    
    if (section && navLink) {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        navLink.classList.add('active');
      } else {
        navLink.classList.remove('active');
      }
    }
  });
}

// Throttled scroll listener
let ticking = false;
window.addEventListener('scroll', function() {
  if (!ticking) {
    window.requestAnimationFrame(function() {
      updateActiveNav();
      ticking = false;
    });
    ticking = true;
  }
});

// Initial call
updateActiveNav();

// ========================================
// REVEAL ON SCROLL ANIMATION
// ========================================

// Simple fade-in animation for elements as they scroll into view
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe all service rows, experience rows, and pub cards
document.addEventListener('DOMContentLoaded', function() {
  const revealElements = document.querySelectorAll('.service-row, .experience-row, .pub-card');
  revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    revealObserver.observe(el);
  });
});

// Add revealed class styles dynamically
const style = document.createElement('style');
style.textContent = `
  .revealed {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(style);
