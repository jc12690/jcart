/* ============================================================================
   iPhone Duo: undo Safari's sideways nudge after the phone turns.

   Folded, the Duo's Safari keeps its toolbar in a rail down one side of the
   screen. Turn the phone sideways and the rail moves from the right edge to the
   left, and Safari leaves the page scrolled sideways by the rail's width (84px),
   so the left edge of everything is cut off, even though nothing on the page is
   wider than the screen. This scrolls it back.

   It only acts when the page is scrolled sideways with nothing to scroll to,
   and never when someone has pinch-zoomed in on purpose. Every page loads it;
   once Safari stops doing this, delete this file and the <script> tags that
   load it (tools/build.py, 404.html, quickbio, dot-quickbio, fitness, and
   modeling). Seen on the iOS 27.1 simulator, 2026-11-06.
   ============================================================================ */
(function(){
  var de = document.documentElement;
  function settle(){
    var vv = window.visualViewport;
    if(vv && vv.scale > 1.01) return;
    if(window.scrollX > 0 && de.scrollWidth <= de.clientWidth){
      /* jump, don't glide: these pages set scroll-behavior:smooth */
      var prev = de.style.scrollBehavior;
      de.style.scrollBehavior = "auto";
      window.scrollTo(0, window.scrollY);
      de.style.scrollBehavior = prev;
    }
  }
  /* Safari sets the offset as the turn finishes, sometimes just after the
     resize event, so look again a moment later */
  addEventListener("resize", function(){ settle(); setTimeout(settle, 400); });
})();
