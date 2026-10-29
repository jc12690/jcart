(function(){
  var RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function(id){ return document.getElementById(id); };

  /* ---------- theme: same key and behavior as the homepage (site.js) ---------- */
  var TK = "jc-theme", root = document.documentElement, tog = $("themeTog");
  function syncTog(){
    var light = root.getAttribute("data-theme") === "light";
    tog.setAttribute("aria-pressed", light ? "true" : "false");
    var label = light ? "Switch to dark mode" : "Switch to light mode";
    tog.setAttribute("aria-label", label);
    tog.setAttribute("title", label);
  }
  syncTog();
  tog.addEventListener("click", function(){
    var t = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    if(t === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
    try{ localStorage.setItem(TK, t); }catch(e){}
    syncTog();
  });

  function tick(){
    $("clock").textContent = new Date().toLocaleTimeString("en-US",
      {timeZone:"America/New_York",hour:"2-digit",minute:"2-digit",hour12:false}) + " NY";
  }
  tick(); setInterval(tick, 20000);

  /* ---------- the number is assembled here, not sitting in the markup ---------- */
  var num = $("phoneNum");
  var a = num.getAttribute("data-a"), b = num.getAttribute("data-b"), c = num.getAttribute("data-c");
  num.textContent = "(" + a + ") " + b + "-" + c;
  $("callBtn").href = "tel:+1" + a + b + c;
  $("textBtn").href = "sms:+1" + a + b + c;

  /* ---------- the hello writes itself, then the photo develops into colour ----------
     Started only once Pacifico is loaded, as on the homepage, so it never wipes
     across a fallback face and then jumps. If the font is still loading after
     1.5 seconds (a slow phone connection), start anyway, so the name shows. */
  var begun = false;
  function begin(){
    if(begun) return; begun = true;
    $("intro").classList.add("go");
    setTimeout(function(){ $("photo").classList.add("dev"); }, RM ? 0 : 1700);
  }
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(begin); else begin();
  setTimeout(begin, 1500);
})();
