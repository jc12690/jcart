/* Quickbio: the theme switch, the NY clock, the playlists (read from the
   Pilates site's weekly.js), and the headshot's four-count. */
(function(){
  "use strict";
  var RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  var $ = function(id){ return document.getElementById(id); };

  /* ---------- theme: the same jc-theme preference as the rest of the site ---------- */
  var tog = $("themeTog");
  function syncTog(){
    var light = root.getAttribute("data-theme") === "light";
    var label = light ? "Switch to dark mode" : "Switch to light mode";
    tog.setAttribute("aria-pressed", light ? "true" : "false");
    tog.setAttribute("aria-label", label); tog.title = label;
  }
  tog.addEventListener("click", function(){
    var light = root.getAttribute("data-theme") === "light";
    if(light) root.removeAttribute("data-theme"); else root.setAttribute("data-theme", "light");
    try{ localStorage.setItem("jc-theme", light ? "dark" : "light"); }catch(e){}
    syncTog();
  });
  syncTog();

  /* ---------- clock ---------- */
  function tick(){
    $("clock").textContent = new Date().toLocaleTimeString("en-US",
      {timeZone:"America/New_York", hour:"2-digit", minute:"2-digit", hour12:false}) + " NY";
  }
  tick(); setInterval(tick, 15000);

  /* ---------- playlists, from the same list as the Pilates site ----------
     Recent is the four newest weeks, newest first; Favorites is every week
     marked fav: true. Dates are worked out exactly as the rail does it. If
     weekly.js is missing or has a typo, both lists stay empty and the rest of
     the page carries on. */
  var PL = window.JC_PLAYLISTS, W1 = window.JC_PLAYLIST_WEEK_ONE;
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function mondayOf(x){
    if(x.date) return new Date(x.date + "T00:00:00Z");
    return new Date(Date.parse(W1.monday + "T00:00:00Z") + (x.w - W1.week) * 7 * 864e5);
  }
  function mmddyy(d){
    var p = function(n){ return (n < 10 ? "0" : "") + n; };
    return p(d.getUTCMonth() + 1) + "/" + p(d.getUTCDate()) + "/" + p(d.getUTCFullYear() % 100);
  }
  if(Array.isArray(PL) && PL.length && W1){
    /* same rule as the rail: the week marked latest, or else the last one listed */
    var latest = PL.filter(function(x){ return x.latest; })[0] || PL[PL.length - 1];
    var row = function(x){
      return '<a class="row" href="' + esc(x.url) + '" target="_blank" rel="noopener">' +
        '<span class="num">' + esc(x.w) + '</span>' +
        '<span class="txt"><span class="t">' + esc(x.name) + (x === latest ? '<span class="tag">Latest</span>' : "") + '</span>' +
        '<span class="s">Week of ' + mmddyy(mondayOf(x)) + ' &#183; Apple Music</span></span>' +
        '<span class="go" aria-hidden="true">&#8599;</span></a>';
    };
    $("recent").innerHTML = PL.slice().sort(function(a, b){ return b.w - a.w; }).slice(0, 4).map(row).join("");
    var favs = PL.filter(function(x){ return x.fav; }).sort(function(a, b){ return a.w - b.w; });
    if(favs.length){ $("favs").innerHTML = favs.map(row).join(""); $("favSec").hidden = false; }
  }

  /* ---------- the headshot comes into focus on a four-count ----------
     The Pilates site's monitor move, played quicker: a coarse mosaic that
     sharpens one step per count, then clears to the photo. Without JavaScript,
     or with reduced motion, the photo simply shows. */
  var shot = $("shot"), cv = $("mosaic"), tiny = document.createElement("canvas");
  var pips = [].slice.call(document.querySelectorAll(".pip")), countNum = $("countNum");
  var LEVELS = [6, 11, 20, 36];
  function count(n){
    countNum.textContent = n + 1;
    pips.forEach(function(p, i){ p.classList.toggle("on", i === n); });
  }
  if(RM){ cv.remove(); count(3); return; }
  cv.classList.add("on");   /* the screen stays dark until the first count */
  function paint(cols){
    var r = cv.getBoundingClientRect(), W = Math.max(1, Math.round(r.width)), H = Math.max(1, Math.round(r.height));
    if(cv.width !== W || cv.height !== H){ cv.width = W; cv.height = H; }
    var rows = Math.max(1, Math.round(cols * H / W));
    tiny.width = cols; tiny.height = rows;
    var sw = shot.naturalWidth, sh = shot.naturalHeight, ta = W / H, sa = sw / sh, cx, cy, cw, ch;
    if(sa > ta){ ch = sh; cw = sh * ta; cx = (sw - cw) / 2; cy = 0; }
    else { cw = sw; ch = sw / ta; cx = 0; cy = (sh - ch) / 2; }
    tiny.getContext("2d").drawImage(shot, cx, cy, cw, ch, 0, 0, cols, rows);
    var x = cv.getContext("2d");
    x.imageSmoothingEnabled = false;
    x.drawImage(tiny, 0, 0, cols, rows, 0, 0, W, H);
    /* LED-panel seams on the coarse steps, like the timers on the studio wall */
    if(cols < 20){
      x.fillStyle = "rgba(0,0,0,.38)";
      for(var i = 1; i < cols; i++) x.fillRect(Math.round(i * W / cols), 0, 1, H);
      for(var j = 1; j < rows; j++) x.fillRect(0, Math.round(j * H / rows), W, 1);
    }
  }
  function start(){
    var n = 0;
    paint(LEVELS[0]); count(0);
    var t = setInterval(function(){
      n++;
      if(n < LEVELS.length){ paint(LEVELS[n]); count(n); }
      else { clearInterval(t); cv.classList.add("clear"); }
    }, 420);
  }
  if(shot.complete && shot.naturalWidth) start();
  else {
    shot.addEventListener("load", start);
    shot.addEventListener("error", function(){ cv.remove(); });
  }
})();
