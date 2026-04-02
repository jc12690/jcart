/* ═══ SCRIPTS ════════════════════════════════════════════════════ -->

  ANIMATION SCRIPTS PLACEHOLDER
When you have the JS animations, add these before your animation code:

    <!-- GSAP + ScrollTrigger -->
    <!-- <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script> -->
<!-- <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script> -->

<!-- SplitType (for text char animations) -->
<!-- <script src="https://unpkg.com/split-type"></script> -->

<!-- Lenis (smooth scroll) -->
<!-- <script src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.23/bundled/lenis.min.js"></script> -->
*/

<script>
/* ─── LIVE CLOCK (NYC time) ──────────────────────────────── */
function updateClock() {
    const now = new Date();
    const opts = { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hour12: true };
    const timeStr = now.toLocaleTimeString('en-US', opts).toUpperCase();
    const dateStr = now.toLocaleDateString('en-US', {
        timeZone: 'America/New_York', day: '2-digit', month: 'long', year: 'numeric'
    });
    const el = document.getElementById('navTime');
    const de = document.getElementById('navDate');
    if (el) el.textContent = timeStr;
    if (de) de.textContent = dateStr.toUpperCase();
}
updateClock();
setInterval(updateClock, 10000);

// ─── NAV THEME SWITCHING ─────────────────────────────────────────
// Switch nav appearance based on what section is visible
const navEl = document.querySelector('.nav_wrap');
const sections = document.querySelectorAll('[data-theme]');

function updateNavTheme() {
    // find which theme section is most visible in top half of viewport
    let current = document.documentElement.getAttribute('data-theme') || 'light';
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 80 && rect.bottom > 80) {
            const t = section.getAttribute('data-theme');
            if (t && t !== 'inherit') current = t;
        }
    });
    // set nav colors
    if (current === 'dark') {
        navEl.style.setProperty('--theme--background', 'var(--swatch--dark)');
        navEl.style.setProperty('--theme--text', 'var(--swatch--light)');
        navEl.style.color = 'var(--swatch--light)';
    } else {
        navEl.style.setProperty('--theme--background', 'var(--swatch--light)');
        navEl.style.setProperty('--theme--text', 'var(--swatch--dark)');
        navEl.style.color = 'var(--swatch--dark)';
    }
}
window.addEventListener('scroll', updateNavTheme, { passive: true });
updateNavTheme();

/* ─── WORK SECTION: simple scroll-driven panel reveal ────────────
This is a simplified version. Replace with your GSAP animation when ready. */
(function() {
    const triggers = document.querySelectorAll('.work_trigger');
    const panels = document.querySelectorAll('.work_item');
    if (!triggers.length || !panels.length) return;

    function syncWork() {
        const wrapTop = document.querySelector('.work_wrap').getBoundingClientRect().top;
        const wrapH = document.querySelector('.work_wrap').offsetHeight;
        const progress = Math.max(0, Math.min(1, -wrapTop / (wrapH - window.innerHeight)));
        const count = panels.length;
        const step = 1 / count;

        panels.forEach((panel, i) => {
            const start = i * step;
            const end = (i + 1) * step;
            const p = Math.max(0, Math.min(1, (progress - start) / step));

            if (i === 0) {
                // first panel always shows
                panel.style.clipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
                panel.style.pointerEvents = 'auto';
            } else {
                // panels slide up from bottom
                const pct = Math.min(100, Math.round(p * 100));
                panel.style.clipPath = `polygon(0% ${100 - pct}%, 100% ${100 - pct}%, 100% 100%, 0% 100%)`;
                panel.style.pointerEvents = p >= 0.5 ? 'auto' : 'none';
            }
        });
    }
    window.addEventListener('scroll', syncWork, { passive: true });
    syncWork();
})();

// ─── MOBILE MENU TOGGLE ──────────────────────────────────────────
document.querySelector('.menu_btn').addEventListener('click', function() {
    const menu = document.querySelector('.mobile_menu');
    if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
});

// ─── SMOOTH SCROLL ───────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
</script>