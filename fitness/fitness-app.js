// FITNESS / PILATES PAGE — JARRED CARTER

document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileLinks = mobileNav?.querySelectorAll('a');
  const navLinks = document.querySelectorAll('.site-nav a, .mobile-nav nav a[href^="#"]');
  const sections = document.querySelectorAll('section[id]');
  const backNav = document.querySelector('.back-nav');
  const siteHeader = document.querySelector('.site-header');

  // Mobile menu
  menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    mobileNav?.classList.toggle('open', !isOpen);
    mobileNav?.setAttribute('aria-hidden', String(isOpen));
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });

  mobileLinks?.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle?.setAttribute('aria-expanded', 'false');
      mobileNav?.classList.remove('open');
      mobileNav?.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      window.scrollTo({
        top: target.offsetTop - 72,
        behavior: 'smooth'
      });
    });
  });

  // Active nav
  function updateActiveNav() {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 120) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href')?.substring(1);
      link.classList.toggle('active', href === current);
    });
  }

  // Scroll reveal
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // Video autoplay on scroll
  const videoObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.35 });

  document.querySelectorAll('video[data-autoplay-on-scroll]').forEach(v => {
    videoObserver.observe(v);
  });

  // Marquee pause on hover
  const marqueeTrack = document.querySelector('.marquee-track');
  marqueeTrack?.addEventListener('mouseenter', () => {
    marqueeTrack.style.animationPlayState = 'paused';
  });
  marqueeTrack?.addEventListener('mouseleave', () => {
    marqueeTrack.style.animationPlayState = 'running';
  });

  // Header hide on scroll down
  let lastScrollY = window.scrollY;
  let headerHidden = false;

  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;

    if (currentY > lastScrollY && currentY > 120 && !headerHidden) {
      siteHeader?.style.setProperty('transform', 'translateY(-100%)');
      backNav?.style.setProperty('transform', 'translateY(-80px)');
      headerHidden = true;
    } else if (currentY < lastScrollY && headerHidden) {
      siteHeader?.style.removeProperty('transform');
      backNav?.style.removeProperty('transform');
      headerHidden = false;
    }

    lastScrollY = currentY;
    updateActiveNav();
  }, { passive: true });

  if (siteHeader) {
    siteHeader.style.transition = 'transform 0.35s cubic-bezier(0.76, 0, 0.24, 1)';
  }
  if (backNav) {
    backNav.style.transition = 'transform 0.35s cubic-bezier(0.76, 0, 0.24, 1), color 0.2s';
  }

  updateActiveNav();
});
