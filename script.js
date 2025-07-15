// Header name visibility on scroll
function updateHeaderName() {
    const headerName = document.querySelector('.header-name');
    const logoSection = document.querySelector('.logo-section');
    const logoSectionBottom = logoSection.offsetTop + logoSection.offsetHeight;

    if (window.scrollY > logoSectionBottom - 100) {
        headerName.classList.add('visible');
    } else {
        headerName.classList.remove('visible');
    }
}

// Active navigation highlighting
function updateActiveNav() {
    const navLinks = document.querySelectorAll('.nav-container a');
    const sections = document.querySelectorAll('section');
    let current = '';
    const scrollOffset = 120;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - scrollOffset) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href').substring(1);
        if (href === current) {
            link.classList.add('active');
        }
    });
}

// Combined scroll handler
function handleScroll() {
    updateHeaderName();
    updateActiveNav();
}

// Enhanced smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = 50;
            const offset = navHeight + 20;
            const targetPosition = target.offsetTop - offset;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Toggle menu on mobile
const menuIcon = document.querySelector('.menu-icon');
const headerLinks = document.querySelector('.header-links');

menuIcon?.addEventListener('click', () => {
    headerLinks.classList.toggle('active');
});

// Enhanced theme toggle
const themeToggle = document.querySelector('.theme-toggle');

themeToggle?.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');

    if (document.body.classList.contains('light-mode')) {
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'light');
    } else {
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'dark');
    }
});

// Load saved theme preference
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.querySelector('.theme-toggle');

    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (themeToggle) themeToggle.textContent = '☀️';
    }

    // Initialize scroll handlers
    updateHeaderName();
    updateActiveNav();
});

// Add scroll event listener
window.addEventListener('scroll', handleScroll);