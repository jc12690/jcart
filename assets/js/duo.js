/* ============================================================================
   iPhone Duo, folded: three fixes for Safari. Every page loads this in <head>.
   Seen on the iOS 27.1 simulator, November 2026.

   1. The top of the screen belongs to iOS. Folded, Safari's toolbar is a rail
      down one side, so pages run right up to the top edge, but a tap in the
      top 17px or so (21px with the phone sideways) scrolls the page to the top
      instead of pressing what's there. On the folded Duo this sets --duo-top
      to 20px, and every page's top bar adds that much space above its buttons
      (and the photo viewer moves its close button down by the same amount).
      Everywhere else --duo-top is 0.

   2. Turn the folded Duo sideways and the rail moves from the right edge to the
      left, and Safari leaves the page slid sideways by the rail's width (84px),
      so the left edge of everything is cut off, even though nothing on the
      page is wider than the screen. This scrolls it back, unless someone has
      pinch-zoomed in on purpose.

   3. Safari colors the rail (and the strip under the address bar) to match the
      page, but on a page with a full-screen overlay on top (the scanlines,
      .crt, and the vignette, .vig) it didn't notice a theme switch: tap THEME
      and the page went light beside a dark rail. Hiding the overlays for two
      frames right after the switch makes Safari look again. That's invisible
      mid-switch, so it runs everywhere. (The Pilates site never showed this:
      its moving background makes Safari look again anyway.)

   Once Safari fixes any of these, delete that part; once it fixes all three,
   delete this file and the <script> tags that load it (tools/build.py,
   404.html, quickbio, dot-quickbio, fitness, and modeling).
   ============================================================================ */
(function(){
  var de = document.documentElement;

  /* The folded Duo's screen is 466px across, wider than any other iPhone's
     (the widest is 440px), and its rail takes about 84px of the page's width.
     An ordinary iPhone held sideways also gives the page less than the full
     screen, which is why the 440px check matters. */
  function folded(){
    var short = Math.min(screen.width, screen.height);
    var long  = Math.max(screen.width, screen.height);
    var across = innerWidth > innerHeight ? long : short;
    return short > 440 && short <= 520 && across - innerWidth >= 60;
  }
  function mark(){ de.style.setProperty("--duo-top", folded() ? "20px" : "0px"); }

  function settle(){
    var vv = window.visualViewport;
    if(vv && vv.scale > 1.01) return;
    /* not just > 0: turning back upright has also left it at -51px */
    if(window.scrollX !== 0 && de.scrollWidth <= de.clientWidth){
      /* jump, don't glide: these pages set scroll-behavior:smooth */
      var prev = de.style.scrollBehavior;
      de.style.scrollBehavior = "auto";
      window.scrollTo(0, window.scrollY);
      de.style.scrollBehavior = prev;
    }
  }

  mark();
  /* Safari sets the sideways offset as the turn finishes, sometimes just after
     the resize event, so look again a moment later. Turning, it widens the
     page in two steps (382, 510, then 594px) and only the visual viewport
     reports the last one, so listen to both. */
  function turned(){ mark(); settle(); setTimeout(settle, 400); }
  addEventListener("resize", turned);
  if(window.visualViewport) visualViewport.addEventListener("resize", turned);

  /* every page's THEME switch sets or clears data-theme on <html> */
  if(window.MutationObserver){
    new MutationObserver(function(){
      var layers = document.querySelectorAll(".crt, .vig");
      layers.forEach(function(el){ el.style.display = "none"; });
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        layers.forEach(function(el){ el.style.display = ""; });
      }); });
    }).observe(de, { attributes: true, attributeFilter: ["data-theme"] });
  }
})();
