// Active navigation highlighting
const navLinks = document.querySelectorAll('.nav-container a');
const sections = document.querySelectorAll('section, .section-header');

function updateActiveNav() {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 200) {
            // Get the section ID or create one from the text content
            current = section.getAttribute('id') || section.textContent.toLowerCase().replace(/\s+/g, '');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href').substring(1); // Remove the #
        if (href === current) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveNav);
updateActiveNav();

// Shrink and center main logo on scroll
window.addEventListener('scroll', () => {
    const logo = document.querySelector('.logo-section');
    const mainLogo = document.querySelector('.main-logo');
    const subLogo = document.querySelector('.sub-logo');

    if (window.scrollY > 100) {
        logo.classList.add('scrolled');
        mainLogo.classList.add('scrolled');
        subLogo.classList.add('scrolled');
    } else {
        logo.classList.remove('scrolled');
        mainLogo.classList.remove('scrolled');
        subLogo.classList.remove('scrolled');
    }
});

// Enhanced smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const logoHeight = document.querySelector('.logo-section.scrolled') ? 60 : 0;
            const navHeight = 50;
            const offset = logoHeight + navHeight + 20;
            const targetPosition = target.offsetTop - offset;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Enhanced smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const logoHeight = document.querySelector('.logo-section.scrolled') ? 60 : 0;
            const navHeight = 50;
            const offset = logoHeight + navHeight + 20;
            const targetPosition = target.offsetTop - offset;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Enhanced scroll handler with smooth logo transition
let isScrolling = false;

function handleScroll() {
    if (!isScrolling) {
        requestAnimationFrame(() => {
            const logo = document.querySelector('.logo-section');
            const logoContainer = document.querySelector('.logo-container');
            const mainLogo = document.querySelector('.main-logo');
            const subLogo = document.querySelector('.sub-logo');
            const mainNav = document.querySelector('.main-nav');

            const scrollY = window.scrollY;
            const threshold = 100;

            if (scrollY > threshold) {
                // Scrolled state - fade to center
                logo.classList.add('scrolled');
                logoContainer.classList.add('scrolled');
                mainLogo.classList.add('scrolled');
                subLogo.classList.add('scrolled');
                mainNav.classList.add('logo-visible');
            } else {
                // Normal state - fade back to original position
                logo.classList.remove('scrolled');
                logoContainer.classList.remove('scrolled');
                mainLogo.classList.remove('scrolled');
                subLogo.classList.remove('scrolled');
                mainNav.classList.remove('logo-visible');
            }

            isScrolling = false;
        });
    }
    isScrolling = true;
}

window.addEventListener('scroll', handleScroll);

// Active navigation highlighting with scroll offset
const navLinks = document.querySelectorAll('.nav-container a');
const sections = document.querySelectorAll('section');

function updateActiveNav() {
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

window.addEventListener('scroll', updateActiveNav);
updateActiveNav();

// Toggle menu on mobile
const menuIcon = document.querySelector('.menu-icon');
const headerLinks = document.querySelector('.header-links');

menuIcon?.addEventListener('click', () => {
    headerLinks.classList.toggle('active');
});

// Enhanced theme toggle
const toggleThemeBtn = document.querySelector('.header-right div');

toggleThemeBtn?.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');

    if (document.body.classList.contains('light-mode')) {
        toggleThemeBtn.textContent = '☀️';
        localStorage.setItem('theme', 'light');
    } else {
        toggleThemeBtn.textContent = '🌙';
        localStorage.setItem('theme', 'dark');
    }
});

// Load saved theme preference
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const themeBtn = document.querySelector('.header-right div');

    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (themeBtn) themeBtn.textContent = '☀️';
    }
});