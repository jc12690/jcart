// Add this to your script.js file
// Active navigation highlighting
const navLinks = document.querySelectorAll('.nav-menu a');
const sections = document.querySelectorAll('section');

function updateActiveNav() {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Listen for scroll events
window.addEventListener('scroll', updateActiveNav);

// Set initial active state
updateActiveNav();

// Update your existing smooth scrolling code
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navHeight - 20; // 20px extra padding

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});