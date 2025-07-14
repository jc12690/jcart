// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 100; // Adjust this value as needed
            const targetPosition = target.offsetTop - offset;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

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

// Toggle menu on mobile
const menuIcon = document.querySelector('.menu-icon');
const headerLinks = document.querySelector('.header-links');

menuIcon.addEventListener('click', () => {
    headerLinks.classList.toggle('active');
});

const toggleThemeBtn = document.querySelector('.header-right div'); // 🌙 icon

toggleThemeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');

    // Optionally change the icon
    if (document.body.classList.contains('light-mode')) {
        toggleThemeBtn.textContent = '☀️'; // sun emoji for light mode
    } else {
        toggleThemeBtn.textContent = '🌙'; // moon emoji for dark mode
    }
});