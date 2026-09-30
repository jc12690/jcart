/* The Pilates site. The two lists you edit each week, playlists and Mega Move
   Monday, live in weekly.js, which loads just before this file. */
(function(){
  "use strict";
  var RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  var $ = function(id){ return document.getElementById(id); };

  /* ---------- theme (same key as jcart: one preference across the family) ---------- */
  var tog = $("themeTog");
  function syncTog(){
    var light = root.getAttribute("data-theme") === "light";
    var label = light ? "Switch to dark mode" : "Switch to light mode";
    tog.setAttribute("aria-pressed", light ? "true" : "false");
    tog.setAttribute("aria-label", label); tog.title = label;
  }
  tog.addEventListener("click", function(){
    var light = root.getAttribute("data-theme") === "light";
    if(light) root.removeAttribute("data-theme"); else root.setAttribute("data-theme","light");
    try{ localStorage.setItem("jc-theme", light ? "dark" : "light"); }catch(e){}
    syncTog(); readColors(); dirty = true;
  });
  syncTog();

  /* ---------- clock ---------- */
  function tick(){
    $("clock").textContent = new Date().toLocaleTimeString("en-US",
      {timeZone:"America/New_York", hour:"2-digit", minute:"2-digit", hour12:false}) + " NY";
  }
  tick(); setInterval(tick, 15000);

  /* ---------- the quiver: hover on desktop, tap on touch ---------- */
  var q = $("quiver"), qt = 0;
  q.addEventListener("click", function(){ q.classList.add("on"); clearTimeout(qt);
    qt = setTimeout(function(){ q.classList.remove("on"); }, 1600); });

  /* ---------- mosaic monitor ----------------------------------------------
     The class plays through a coarse mosaic that sharpens one step per beat on
     a slow four-count, then clears to the video itself. "One More Rep" runs it
     back down over four counts, holds, and brings it up again: a rep. */
  var vid = $("vid"), cv = $("mosaic");
  var tiny = document.createElement("canvas");
  var poster = new Image(); poster.src = "media/hero-poster.jpg";
  var LEVELS = [6, 11, 20, 36];          /* columns per step; step 4 is the clear video */
  var level = RM ? 4 : 0, queue = [], drawing = false;
  function sizeCanvas(){
    var r = cv.getBoundingClientRect();
    cv.width = Math.max(1, Math.round(r.width)); cv.height = Math.max(1, Math.round(r.height));
  }
  function setLevel(l){
    level = l;
    cv.classList.toggle("clear", l >= 4);
    if(l < 4 && !drawing){ drawing = true; }
  }
  /* Paints src into canvas c as a mosaic `cols` blocks wide, cropped to cover it
     the way object-fit does, using t as scratch. The monitor and the viewer share it. */
  function paintMosaic(c, t, src, cols, seams){
    var sw = src.videoWidth || src.naturalWidth, sh = src.videoHeight || src.naturalHeight;
    if(!sw || !sh) return;
    var x = c.getContext("2d"), W = c.width, H = c.height;
    var rows = Math.max(1, Math.round(cols * H / W));
    if(t.width !== cols || t.height !== rows){ t.width = cols; t.height = rows; }
    var ta = W / H, sa = sw / sh, cx, cy, cw, ch;
    if(sa > ta){ ch = sh; cw = sh * ta; cx = (sw - cw) / 2; cy = 0; }
    else { cw = sw; ch = sw / ta; cx = 0; cy = (sh - ch) / 2; }
    t.getContext("2d").drawImage(src, cx, cy, cw, ch, 0, 0, cols, rows);
    x.imageSmoothingEnabled = false;
    x.drawImage(t, 0, 0, cols, rows, 0, 0, W, H);
    /* LED-panel seams on the coarse steps, like the timers on the studio wall */
    if(seams){
      x.fillStyle = "rgba(0,0,0,.38)";
      for(var i = 1; i < cols; i++) x.fillRect(Math.round(i * W / cols), 0, 1, H);
      for(var j = 1; j < rows; j++) x.fillRect(0, Math.round(j * H / rows), W, 1);
    }
  }
  function drawMosaic(){
    if(level >= 4 && cv.classList.contains("clear") && getComputedStyle(cv).opacity === "0"){ drawing = false; return; }
    paintMosaic(cv, tiny, vid.readyState >= 2 ? vid : poster, LEVELS[Math.min(level, 3)], level < 2);
  }
  $("rep").addEventListener("click", function(){
    if(RM) return;
    queue = [3, 2, 1, 0, 0, 1, 2, 3, 4];
  });
  /* ---------- videos: autoplay, muted, looping, like the old modeling page,
     but each one plays only while it is on screen and pauses when it leaves,
     so a phone is never decoding clips nobody can see. Reduced motion: none
     play, and each shows its first frame instead. */
  var onScreen = "IntersectionObserver" in window ? new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      var v = e.target;
      if(e.isIntersecting){
        if(v.preload === "none") v.preload = "auto";
        var p = v.play(); if(p && p.catch) p.catch(function(){});
      } else { v.pause(); }
    });
  }, {threshold:0.15}) : null;
  function watchVideo(v){
    if(RM){ v.autoplay = false; v.removeAttribute("autoplay"); v.pause(); return; }
    if(onScreen){ onScreen.observe(v); }
    else { var p = v.play(); if(p && p.catch) p.catch(function(){}); }
  }
  [].forEach.call(document.querySelectorAll("video"), watchVideo);

  /* ---------- the count ---------- */
  var countNum = $("countNum"), pips = [].slice.call(document.querySelectorAll(".pip"));
  var BEAT = 1000, t0 = performance.now() + 650, lastBeat = -1;
  function hit(el){ el.classList.remove("hit"); void el.offsetWidth; el.classList.add("hit"); }
  function onBeat(n){
    var c = n % 4;
    countNum.textContent = c + 1;
    if(pdot){ pdot.classList.remove("tick"); void pdot.offsetWidth; pdot.classList.add("tick"); }
    pips.forEach(function(p, i){ p.classList.toggle("on", i === c); });
    if(n < 4){
      [].forEach.call(document.querySelectorAll('[data-beat="' + (n + 1) + '"]'), hit);
      setLevel(n + 1);
    } else if(queue.length){
      setLevel(queue.shift());
    }
  }
  if(RM){ countNum.textContent = "4"; pips[3].classList.add("on"); }

  /* ---------- giant type: slow drift plus scroll ---------- */
  var r1 = $("r1"), r2 = $("r2"), half1 = 0, half2 = 0;
  function measureRows(){ half1 = r1.scrollWidth / 2; half2 = r2.scrollWidth / 2; }
  function marquee(now, y){
    var d = now / 1000 * 16 + y * 0.35;
    r1.style.transform = "translate3d(" + (-(d % half1)) + "px,0,0)";
    r2.style.transform = "translate3d(" + (-(half2 - (d % half2))) + "px,0,0)";
  }

  /* ---------- collage depth ---------- */
  var tiles = [].slice.call(document.querySelectorAll(".tile[data-depth]"));
  var collage = $("collage"), stacked = matchMedia("(max-width:820px)");
  function depth(){
    var r = collage.getBoundingClientRect();
    if(r.bottom < -200 || r.top > innerHeight + 200) return;
    var off = (r.top + r.height / 2) - innerHeight / 2;
    tiles.forEach(function(t){
      /* stacked on a phone, drift would only make the gaps uneven and let tiles overlap */
      t.style.transform = stacked.matches ? "" : "translate3d(0," + (off * +t.dataset.depth).toFixed(1) + "px,0)";
    });
  }

  /* ---------- color shift onto the floor ---------- */
  var backdrop = $("backdrop"), floor = $("book"), cGround, cFloor;
  function hexRgb(h){ h = h.trim().replace("#", ""); if(h.length === 3) h = h.replace(/(.)/g, "$1$1");
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)]; }
  function readColors(){
    var cs = getComputedStyle(root);
    cGround = hexRgb(cs.getPropertyValue("--ground")); cFloor = hexRgb(cs.getPropertyValue("--floor-ground"));
  }
  function shift(){
    var r = floor.getBoundingClientRect();
    var t = (innerHeight * 0.72 - r.top) / (innerHeight * 0.5);
    t = t < 0 ? 0 : t > 1 ? 1 : t; t = t * t * (3 - 2 * t);
    var c = cGround.map(function(v, i){ return Math.round(v + (cFloor[i] - v) * t); });
    backdrop.style.backgroundColor = "rgb(" + c.join(",") + ")";
  }

  /* ---------- playlist rail ---------- */
  var WEEKS = JC_PLAYLISTS;
  var latest = 0;
  WEEKS.forEach(function(x, i){ if(x.latest) latest = i; });
  if(!WEEKS.some(function(x){ return x.latest; })) latest = WEEKS.length - 1;
  var MIN = WEEKS[0].w, MAX = WEEKS[WEEKS.length - 1].w, sel = latest;
  var rail = $("rail"), stopsEl = $("stops"), knob = $("knob"), fillLine = $("fillLine"), card = $("plCard");
  function pct(w){ return MAX === MIN ? 0 : (w - MIN) / (MAX - MIN) * 100; }
  /* Week 15 = Monday 07/13/26, one week per number, unless an entry says otherwise */
  var W1 = JC_PLAYLIST_WEEK_ONE;
  function mondayOf(x){
    if(x.date) return new Date(x.date + "T00:00:00Z");
    return new Date(Date.parse(W1.monday + "T00:00:00Z") + (x.w - W1.week) * 7 * 864e5);
  }
  function mmddyy(d){
    var p = function(n){ return (n < 10 ? "0" : "") + n; };
    return p(d.getUTCMonth() + 1) + "/" + p(d.getUTCDate()) + "/" + p(d.getUTCFullYear() % 100);
  }
  function longDate(d){
    return d.toLocaleDateString("en-US", {timeZone:"UTC", month:"long", day:"numeric", year:"numeric"});
  }
  var have = {}; WEEKS.forEach(function(x, i){ have[x.w] = i; });
  for(var w = MIN; w <= MAX; w++){
    var li = document.createElement("li");
    if(w in have){
      var x = WEEKS[have[w]];
      var at = pct(w);
      li.className = "stop" + (x.fav ? " fav" : "") + (at === 0 ? " edge-l" : at === 100 ? " edge-r" : "");
      li.style.left = at + "%";
      li.setAttribute("data-i", have[w]);
      li.innerHTML = '<span class="tk"></span><span class="lbl">' + mmddyy(mondayOf(x)) + "</span>";
    } else {
      li.className = "gap"; li.style.left = pct(w) + "%"; li.setAttribute("aria-hidden", "true");
    }
    stopsEl.appendChild(li);
  }
  var stopEls = [].slice.call(stopsEl.querySelectorAll(".stop"));
  function select(i){
    sel = Math.max(0, Math.min(WEEKS.length - 1, i));
    var x = WEEKS[sel], p = pct(x.w);
    knob.style.left = p + "%"; fillLine.style.width = p + "%";
    stopEls.forEach(function(s){ s.classList.toggle("sel", +s.getAttribute("data-i") === sel); });
    var tags = (x.latest ? '<span class="tag hot">Latest</span>' : "") +
               (x.fav ? '<span class="tag hot">Clients&rsquo; Favorite</span>' : "") +
               '<span class="tag">Apple Music</span>';
    card.innerHTML = '<div class="pl-num"><small>WEEK</small>' + x.w + "</div>" +
      '<div class="pl-mid"><p class="pl-title">' + esc(x.name) + '</p>' +
        '<p class="pl-when">Week of ' + mmddyy(mondayOf(x)) + '</p><div class="tags">' + tags + "</div></div>" +
      '<a class="btn fill sm" href="' + x.url + '" target="_blank" rel="noopener">Open in Apple Music <span aria-hidden="true">&#8599;</span></a>';
    rail.setAttribute("aria-valuenow", x.w);
    rail.setAttribute("aria-valuetext", "Week " + x.w + ", week of " + longDate(mondayOf(x)) +
      (x.latest ? ", latest" : "") + (x.fav ? ", clients' favorite" : ""));
    layoutLabels();
    /* while dragging, wait for the rail to settle before swapping a live player */
    clearTimeout(embedTimer);
    if(dragging) embedTimer = setTimeout(function(){ showEmbed(WEEKS[sel]); }, 380);
    else showEmbed(x);
  }

  /* Labels are MM/DD/YY, about 60px each, and on a phone consecutive weeks sit
     about 49px apart. Keep the selected date, then the first and last, then
     whichever others fit, nearest the selection first. */
  function layoutLabels(){
    var labs = stopEls.map(function(s){ return s.querySelector(".lbl"); });
    labs.forEach(function(l){ l.style.visibility = "visible"; });
    var order = [sel, 0, labs.length - 1].filter(function(v, i, a){ return a.indexOf(v) === i; });
    labs.forEach(function(_, i){ if(order.indexOf(i) < 0) order.push(i); });
    order = order.slice(0, 3).concat(order.slice(3).sort(function(a, b){ return Math.abs(a - sel) - Math.abs(b - sel); }));
    var placed = [];
    order.forEach(function(i){
      var r = labs[i].getBoundingClientRect();
      if(placed.some(function(p){ return r.left < p.right + 10 && r.right > p.left - 10; })) labs[i].style.visibility = "hidden";
      else placed.push(r);
    });
  }

  /* ---------- this week's player: Apple's embed, themed to match ----------
     Apple's player takes a theme, so it follows the site: dark in dark mode,
     light in light mode, and it swaps when THEME is flipped. It loads lazily,
     as the section comes near. Note for the privacy page: Apple sets a geo
     cookie and stores an analytics client ID (mtClientId) when it loads. */
  var embedBox = $("plEmbed"), playerMeta = $("playerMeta"), pdot = $("pdot"), embedTimer = 0;
  function mode(){ return root.getAttribute("data-theme") === "light" ? "light" : "dark"; }
  function embedUrl(u){
    return String(u).replace("https://music.apple.com/", "https://embed.music.apple.com/") + "?theme=" + mode();
  }
  function showEmbed(x){
    playerMeta.textContent = x.name + " \u00B7 " + mmddyy(mondayOf(x));
    var f = embedBox.querySelector("iframe");
    if(!f){
      f = document.createElement("iframe");
      f.className = "pl-frame";
      f.setAttribute("loading", "lazy");
      f.setAttribute("allow", "autoplay *; encrypted-media *;");
      f.setAttribute("frameborder", "0");
      f.setAttribute("height", "450");
      f.setAttribute("sandbox", "allow-forms allow-popups allow-same-origin allow-scripts " +
        "allow-storage-access-by-user-activation allow-top-navigation-by-user-activation");
      embedBox.appendChild(f);
    }
    f.title = "Apple Music player: " + x.name;
    var src = embedUrl(x.url);
    if(f.getAttribute("src") !== src) f.setAttribute("src", src);
  }
  if("MutationObserver" in window) new MutationObserver(function(){ showEmbed(WEEKS[sel]); })
    .observe(root, {attributes:true, attributeFilter:["data-theme"]});
  function nearest(clientX){
    var r = stopsEl.getBoundingClientRect(), f = (clientX - r.left) / r.width, wk = MIN + f * (MAX - MIN), best = 0, bd = 1e9;
    WEEKS.forEach(function(x, i){ var dd = Math.abs(x.w - wk); if(dd < bd){ bd = dd; best = i; } });
    return best;
  }
  var dragging = false;
  rail.addEventListener("pointerdown", function(e){ dragging = true; rail.setPointerCapture(e.pointerId); select(nearest(e.clientX)); });
  rail.addEventListener("pointermove", function(e){ if(dragging) select(nearest(e.clientX)); });
  rail.addEventListener("pointerup", function(){ dragging = false; clearTimeout(embedTimer); showEmbed(WEEKS[sel]); });
  rail.addEventListener("pointercancel", function(){ dragging = false; });
  rail.addEventListener("keydown", function(e){
    var k = e.key;
    if(k === "ArrowLeft" || k === "ArrowDown"){ e.preventDefault(); select(sel - 1); }
    else if(k === "ArrowRight" || k === "ArrowUp"){ e.preventDefault(); select(sel + 1); }
    else if(k === "Home"){ e.preventDefault(); select(0); }
    else if(k === "End"){ e.preventDefault(); select(WEEKS.length - 1); }
  });
  rail.setAttribute("aria-valuemin", MIN); rail.setAttribute("aria-valuemax", MAX);
  select(sel);

  /* the hero's Latest Playlist button follows the list, so you only ever edit the list */
  var lb = $("latestBtn"), lw = WEEKS[latest];
  lb.href = lw.url;
  lb.firstChild.nodeValue = "Latest Playlist \u00B7 Week " + lw.w + " ";

  /* ---------- Mega Move Monday ----------
     Links out to Instagram rather than embedding it: an embedded post loads
     Meta's tracking scripts, which would put a consent banner back on the site. */
  var mmm = $("mmm");
  function nyToday(){
    var s = new Intl.DateTimeFormat("en-CA", {timeZone:"America/New_York",
      year:"numeric", month:"2-digit", day:"2-digit"}).format(new Date());
    return new Date(s + "T00:00:00Z");
  }
  function parseDay(s){ var d = new Date(String(s) + "T00:00:00Z"); return isNaN(d) ? null : d; }
  function addDays(d, n){ return new Date(d.getTime() + n * 864e5); }
  function mondayOnOrAfter(d){ return addDays(d, (8 - d.getUTCDay()) % 7); }
  function label(d){
    return d.toLocaleDateString("en-US", {timeZone:"UTC", weekday:"short", month:"short", day:"numeric"});
  }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function renderMoves(){
    var today = nyToday(), cursor = mondayOnOrAfter(today), html = "", count = 0, soon = 0, lastLive = -1;
    (Array.isArray(JC_MEGA_MOVES) ? JC_MEGA_MOVES : []).forEach(function(m){
      if(!m) return;
      var d = m.date ? parseDay(m.date) : null;
      if(d && d >= cursor) cursor = addDays(mondayOnOrAfter(d), 7);
      if(m.url){
        lastLive = count;
        html += '<li class="mm live"><a class="mm-card" href="' + esc(m.url) + '" target="_blank" rel="noopener">' +
          /* the poster is a same-named .jpg beside the clip, so a card still shows you
             when autoplay is blocked (an iPhone in Low Power Mode blocks it) */
          (m.clip ? '<video class="mm-img" src="' + esc(m.clip) + '" poster="' +
            esc(m.img || String(m.clip).replace(/\.mp4$/i, ".jpg")) + '"' +
            ' autoplay muted loop playsinline preload="none" aria-hidden="true"></video>'
          : m.img ? '<img class="mm-img" src="' + esc(m.img) + '" alt="" loading="lazy">' : "") +
          '<span class="mm-date">' + (d ? label(d) : "Mega Move Monday") + "</span>" +
          '<span class="mm-move">' + esc(m.move || "This Week\u2019s Move") + "</span>" +
          '<span class="mm-cta">Watch on Instagram <span aria-hidden="true">&#8599;</span></span></a></li>';
      } else {
        var pd = d || cursor; if(!d) cursor = addDays(cursor, 7);
        html += placeholder(pd, m.move, today); soon++;
      }
      count++;
    });
    /* at least four cards, and always one upcoming Monday: a named teaser counts */
    var need = Math.max(4 - count, soon ? 0 : 1);
    for(var i = 0; i < need; i++){ html += placeholder(cursor, null, today); cursor = addDays(cursor, 7); }
    mmm.innerHTML = html;
    [].forEach.call(mmm.querySelectorAll("video"), watchVideo);
    if(lastLive > 0){
      var el = mmm.children[lastLive];
      mmm.scrollLeft = el.offsetLeft - mmm.offsetLeft;
    }
  }
  function placeholder(d, move, today){
    var isToday = d.getTime() === today.getTime();
    return '<li class="mm soon"><div class="mm-card">' +
      '<span class="mm-date">' + label(d) + "</span>" +
      '<span class="mm-move">' + (move ? esc(move) : (isToday ? "Dropping Today" : "Coming Monday")) + "</span>" +
      '<span class="mm-cta">' + (move ? "Coming Monday" : "On Instagram") + "</span></div></li>";
  }
  function nudge(dir){
    var card = mmm.querySelector(".mm"); if(!card) return;
    mmm.scrollBy({left: dir * (card.getBoundingClientRect().width + 14), behavior: RM ? "auto" : "smooth"});
  }
  $("mmmPrev").addEventListener("click", function(){ nudge(-1); });
  $("mmmNext").addEventListener("click", function(){ nudge(1); });
  renderMoves();

  /* ---------- the viewer ----------
     Every photo and clip opens large: the monitor and each In Motion tile. It
     opens on a coarse mosaic of the picture already on the page, sharpens a step
     at a time, and clears once the full-size file has arrived, so there is never
     an empty box while it loads. Arrows, swipes, and the keyboard step through
     everything in page order. Without JavaScript, each tile is a plain link to
     its file. */
  var lb = $("lb"), lbScreen = $("lbScreen"), lbCv = $("lbMosaic"), lbTiny = document.createElement("canvas");
  var lbCap = $("lbCap"), lbCount = $("lbCount"), lbPlay = $("lbPlay");
  var lbTriggers = [].slice.call(document.querySelectorAll("[data-lb]"));
  var lbAt = 0, lbMedia = null, lbThumb = null, lbDims = [1, 1], lbLevel = 4, lbTimer = 0, lbFrom = null, lbHeld = [];
  function two(n){ return (n < 10 ? "0" : "") + n; }
  function isReady(m){ return m.tagName === "VIDEO" ? m.readyState >= 2 : m.complete && m.naturalWidth > 0; }
  function sizeLb(){
    var phone = innerWidth <= 700;
    var maxW = Math.min(innerWidth - (phone ? 46 : 190), 1400), maxH = innerHeight - (phone ? 210 : 150);
    var s = Math.min(maxW / lbDims[0], maxH / lbDims[1]);
    var w = Math.max(1, Math.round(lbDims[0] * s)), h = Math.max(1, Math.round(lbDims[1] * s));
    lbScreen.style.width = w + "px"; lbScreen.style.height = h + "px";
    lbCv.width = w; lbCv.height = h;
  }
  function syncPlay(){ if(lbMedia && lbMedia.tagName === "VIDEO") lbPlay.textContent = lbMedia.paused ? "Play" : "Pause"; }
  function dropMedia(){
    if(!lbMedia) return;
    if(lbMedia.tagName === "VIDEO"){ lbMedia.pause(); lbMedia.removeAttribute("src"); lbMedia.load(); }
    lbMedia.remove(); lbMedia = null;
  }
  function lbShow(i){
    lbAt = (i + lbTriggers.length) % lbTriggers.length;
    var t = lbTriggers[lbAt], fig = t.closest("figure"), cap = fig && fig.querySelector("figcaption");
    var thumb = fig && fig.querySelector("img, video"), size = (t.getAttribute("data-size") || "1x1").split("x");
    var video = t.getAttribute("data-lb") === "video";
    dropMedia();
    var m = document.createElement(video ? "video" : "img");
    m.className = "lb-media";
    if(video){
      m.muted = true; m.loop = true; m.playsInline = true; m.setAttribute("playsinline", ""); m.preload = "auto";
      if(t.getAttribute("data-poster")) m.poster = t.getAttribute("data-poster");
      m.setAttribute("aria-label", thumb && thumb.getAttribute("aria-label") || "");
      m.addEventListener("play", syncPlay); m.addEventListener("pause", syncPlay);
    } else {
      m.decoding = "async"; m.alt = thumb && thumb.getAttribute("alt") || "";
    }
    m.src = t.getAttribute("href") || t.getAttribute("data-src");
    lbScreen.insertBefore(m, lbCv);
    lbMedia = m; lbThumb = thumb; lbDims = [+size[0] || 1, +size[1] || 1];
    sizeLb();
    lbCap.textContent = cap ? (cap.querySelector("span") || cap).textContent : "";
    lbCount.textContent = two(lbAt + 1) + " / " + two(lbTriggers.length);
    lbPlay.hidden = !video; syncPlay();
    if(video && !RM){ var p = m.play(); if(p && p.catch) p.catch(function(){}); }
    /* the quick four-count: coarse to fine, then clear once the full file is in */
    clearTimeout(lbTimer);
    lbLevel = RM ? 4 : 0;
    lbCv.classList.toggle("clear", RM);
    if(!RM) lbStep();
  }
  function lbStep(){
    lbTimer = setTimeout(function(){
      if(lbLevel < 3){ lbLevel++; lbStep(); }
      else if(lbMedia && isReady(lbMedia)){ lbLevel = 4; lbCv.classList.add("clear"); }
      else lbStep();   /* hold on the finest step until the full-size file arrives */
    }, 170);
  }
  function drawLb(){
    var src = lbMedia && isReady(lbMedia) ? lbMedia : lbThumb;
    if(src && isReady(src)) paintMosaic(lbCv, lbTiny, src, LEVELS[Math.min(lbLevel, 3)], lbLevel < 2);
  }
  function lbOpen(i){
    lbFrom = lbTriggers[i] || document.activeElement;   /* focus goes back to the tile that opened it */
    /* the page's own clips rest while the viewer is up, so a phone decodes one video, not three */
    lbHeld = [].filter.call(document.querySelectorAll("main video"), function(v){ return !v.paused; });
    lbHeld.forEach(function(v){ v.pause(); });
    lb.hidden = false;
    document.body.classList.add("lb-lock");
    lbShow(i);
    $("lbX").focus();
  }
  function lbClose(){
    clearTimeout(lbTimer); lbLevel = 4;
    lb.hidden = true;
    document.body.classList.remove("lb-lock");
    dropMedia();
    lbHeld.forEach(function(v){ var p = v.play(); if(p && p.catch) p.catch(function(){}); });
    lbHeld = [];
    if(lbFrom && lbFrom.focus) lbFrom.focus();
  }
  document.addEventListener("click", function(e){
    /* a modified click (new tab, download) keeps the link's own behavior */
    if(e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var t = e.target.closest && e.target.closest("[data-lb]");
    if(!t) return;
    e.preventDefault();
    lbOpen(lbTriggers.indexOf(t));
  });
  $("lbX").addEventListener("click", lbClose);
  $("lbPrev").addEventListener("click", function(){ lbShow(lbAt - 1); });
  $("lbNext").addEventListener("click", function(){ lbShow(lbAt + 1); });
  lbPlay.addEventListener("click", function(){
    if(!lbMedia) return;
    if(lbMedia.paused){ var p = lbMedia.play(); if(p && p.catch) p.catch(function(){}); } else lbMedia.pause();
  });
  lb.addEventListener("click", function(e){ if(e.target === lb) lbClose(); });
  document.addEventListener("keydown", function(e){
    if(lb.hidden) return;
    if(e.key === "Escape"){ e.preventDefault(); lbClose(); }
    else if(e.key === "ArrowLeft"){ e.preventDefault(); lbShow(lbAt - 1); }
    else if(e.key === "ArrowRight"){ e.preventDefault(); lbShow(lbAt + 1); }
    else if(e.key === "Tab"){
      /* focus stays inside the viewer while it is open */
      var f = [].filter.call(lb.querySelectorAll("button"), function(b){ return !b.hidden; });
      var k = f.indexOf(document.activeElement);
      if(e.shiftKey && k <= 0){ e.preventDefault(); f[f.length - 1].focus(); }
      else if(!e.shiftKey && k === f.length - 1){ e.preventDefault(); f[0].focus(); }
    }
  });
  var swipeX = null, swipeY = 0;
  lbScreen.addEventListener("pointerdown", function(e){ swipeX = e.clientX; swipeY = e.clientY; });
  lbScreen.addEventListener("pointerup", function(e){
    if(swipeX === null) return;
    var dx = e.clientX - swipeX, dy = e.clientY - swipeY; swipeX = null;
    if(Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4) lbShow(lbAt + (dx < 0 ? 1 : -1));
  });
  lbScreen.addEventListener("pointercancel", function(){ swipeX = null; });

  /* ---------- private-session address: shown as text, copy as a convenience ---------- */
  $("copy").addEventListener("click", function(){
    var b = this, addr = $("priv").textContent;
    function done(){ b.textContent = "Copied"; setTimeout(function(){ b.textContent = "Copy"; }, 1600); }
    function fallback(){ var s = getSelection(), r = document.createRange(); r.selectNodeContents($("priv")); s.removeAllRanges(); s.addRange(r); b.textContent = "Selected"; }
    try{ navigator.clipboard.writeText(addr).then(done, fallback); }catch(e){ fallback(); }
  });

  /* ---------- one loop drives everything ---------- */
  var dirty = true, lastY = -1;
  function frame(now){
    if(!RM){
      var n = Math.floor((now - t0) / BEAT);
      if(n >= 0 && n !== lastBeat){ lastBeat = n; onBeat(n); }
      marquee(now, scrollY);
    }
    if(level < 4 || drawing) drawMosaic();
    if(!lb.hidden && lbLevel < 4) drawLb();
    if(scrollY !== lastY || dirty){ lastY = scrollY; dirty = false; if(!RM) depth(); shift(); }
    requestAnimationFrame(frame);
  }
  function relayout(){ sizeCanvas(); measureRows(); layoutLabels(); if(!lb.hidden) sizeLb(); dirty = true; }
  addEventListener("resize", relayout);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  readColors(); relayout();
  if(RM){ cv.classList.add("clear"); }
  requestAnimationFrame(frame);
})();
