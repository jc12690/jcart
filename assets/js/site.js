(function(){
  var RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function(id){ return document.getElementById(id); };

  /* This page routes on the hash, so the browser restoring a previous scroll
     offset on reload fights the router (and poisons the saved index position
     when someone reloads straight into a detail view). We place the reader
     ourselves in route(). */
  if("scrollRestoration" in history) history.scrollRestoration = "manual";

  var NY = "America/New_York";
  function tick(){
    $("clock").textContent = new Date().toLocaleTimeString("en-US",
      {timeZone:NY,hour:"2-digit",minute:"2-digit",hour12:false}) + " NY";
  }
  tick(); setInterval(tick, 20000);

  /* the clock panel: full date + a live read-out down to the millisecond.
     the rAF loop only runs while the panel is actually open. */
  var cw = $("clockWrap"), cpOpen = false, cpRaf = 0;
  function offsetLabel(d){
    try{
      var parts = new Intl.DateTimeFormat("en-US",{timeZone:NY,timeZoneName:"shortOffset"})
        .formatToParts(d);
      for(var i=0;i<parts.length;i++) if(parts[i].type === "timeZoneName")
        return parts[i].value.replace("GMT","UTC");
    }catch(e){}
    return "UTC-05:00";
  }
  function paint(){
    var d = new Date();
    $("cpDate").textContent = d.toLocaleDateString("en-US",
      {timeZone:NY,weekday:"long",month:"long",day:"numeric",year:"numeric"});
    var hms = d.toLocaleTimeString("en-GB",
      {timeZone:NY,hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"});
    var ms = String(d.getMilliseconds()).padStart(3,"0");
    $("cpTime").innerHTML = hms + "<i>." + ms + "</i>";
    $("cpUtc").textContent = offsetLabel(d);
    $("cpEpoch").textContent = Math.floor(d.getTime()/1000);
    if(cpOpen) cpRaf = requestAnimationFrame(paint);
  }
  function cpStart(){ if(cpOpen) return; cpOpen = true; paint(); }
  function cpStop(){ cpOpen = false; cancelAnimationFrame(cpRaf); }
  cw.addEventListener("mouseenter", cpStart);
  cw.addEventListener("mouseleave", cpStop);
  cw.addEventListener("focusin", cpStart);
  cw.addEventListener("focusout", cpStop);
  cw.addEventListener("click", function(){ cpOpen ? cpStop() : cpStart(); });
  paint();   /* fill it once so it is never blank on first open */
  cpStop();

  /* start the write-on only once Pacifico is actually loaded, so it never
     wipes across a fallback face and then reflow-jumps */
  var hero = $("heroBlock");
  function begin(){ hero.classList.add("go"); setTimeout(function(){ $("cue").classList.add("on"); }, RM?0:1550); }
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(begin); else begin();

  /* ---------- router ---------- */
  var details = [].slice.call(document.querySelectorAll(".detail"));
  var indexScroll = 0;          /* where the reader was before opening a detail */
  var routed = false;           /* false until the first route() has run */

  /* html{scroll-behavior:smooth} is what we want for in-page nav links, but it
     turns every programmatic placement into a ~1s animation that the next one
     interrupts. Jump instantly inside here, then hand smooth scrolling back. */
  function place(fn){
    var el = document.documentElement, prev = el.style.scrollBehavior;
    el.style.scrollBehavior = "auto";
    fn();
    requestAnimationFrame(function(){ el.style.scrollBehavior = prev; });
  }
  function route(){
    var h = location.hash.replace(/^#/, "");
    var target = h.indexOf("/") === 0
      ? document.querySelector('.detail[data-slug="' + h.slice(1) + '"]') : null;
    var wasDetail = document.body.classList.contains("detail-open");
    details.forEach(function(d){ d.classList.toggle("active", d === target); });
    document.body.classList.toggle("detail-open", !!target);

    if(target){
      if(!routed) indexScroll = 0;   /* deep-linked in: nothing to restore */
      $("menubar").classList.add("on");
      place(function(){ window.scrollTo(0, 0); });
      routed = true;
      draw();
      return;
    }

    /* Leaving a detail view for a section anchor: the browser already tried to
       scroll there while .index was still display:none, so that scroll was lost.
       Now that the index is visible again, put the section back under the user. */
    var sec = h ? document.getElementById(h) : null;
    if(sec){
      $("menubar").classList.add("on");
      /* .index was display:none until a moment ago, so its images had not even
         begun loading. Flush layout before measuring anything. */
      void document.body.offsetHeight;

      if(wasDetail && indexScroll > 10){
        /* Came from a detail view: put the reader back exactly where they were
           in the list, which is what a back link should do. */
        place(function(){ window.scrollTo(0, indexScroll); });
      }else{
        /* Deep-linked straight into a detail, so there is no saved position.
           Aim at the section, then re-assert once the images that were hidden
           with .index have loaded and stopped changing the page height. */
        var aim = function(){
          place(function(){ sec.scrollIntoView({ behavior: "auto", block: "start" }); });
        };
        aim();
        setTimeout(aim, 250);
      }
      routed = true;
      draw();
      return;
    }
    if((window.scrollY || 0) < 10) $("menubar").classList.remove("on");
    routed = true;
    draw();
  }
  addEventListener("hashchange", route);

  /* ---------- scroll choreography ---------- */
  var wrap = $("wrap"), menubar = $("menubar"), gate = $("gate"),
      gateLead = $("gateLead"), cue = $("cue"),
      lis = [].slice.call(document.querySelectorAll("#roles li"));
  var frame = false;
  function c01(v){ return v<0?0:v>1?1:v; }
  function smooth(v){ return v*v*(3-2*v); }

  function draw(){
    frame = false;
    if(document.body.classList.contains("detail-open")) return;
    /* Remember where the reader is on the index. Capturing this inside route()
       is too late: a "#/slug" fragment matches no element, so the browser
       scrolls to the top of the document before hashchange even fires. */
    indexScroll = window.scrollY || window.pageYOffset || 0;
    var span = wrap.offsetHeight - innerHeight;
    var p = c01((window.scrollY || window.pageYOffset) / (span || 1));
    var h = c01(p / 0.40);
    hero.style.transform  = "scale(" + (1 + smooth(h)*2.1).toFixed(4) + ")";
    hero.style.opacity    = String(1 - c01((h - 0.18)/0.82));
    hero.style.filter     = h > 0.02 ? "blur(" + (h*h*4.2).toFixed(2) + "px)" : "none";
    hero.style.visibility = h >= 1 ? "hidden" : "visible";
    cue.style.opacity     = String(c01(1 - p*9));
    menubar.classList.toggle("on", p > 0.34);
    var live = p > 0.40;
    gate.classList.toggle("live", live);
    gate.setAttribute("aria-hidden", live ? "false" : "true");
    gateLead.classList.toggle("on", live);
    lis.forEach(function(li,i){ li.classList.toggle("on", p > 0.43 + i*0.05); });
  }
  addEventListener("scroll", function(){ if(!frame){ frame=true; requestAnimationFrame(draw); } }, {passive:true});
  addEventListener("resize", draw);

  /* ---------- lightbox ---------- */
  var lb = $("lb"), lbCol = $("lbCol"), lbDith = $("lbDith"),
      lbCap = $("lbCap"), lbState = $("lbState"), lastFocus = null, devTimer = 0;

  function lbOpen(fig){
    var dith = fig.querySelector(".dith"), col = fig.querySelector(".col");
    if(!dith || !col) return;
    lastFocus = document.activeElement;
    lbDith.src = dith.getAttribute("src");
    lbCol.src  = col.getAttribute("src");
    lbDith.alt = dith.getAttribute("alt") || "";
    var cap = fig.querySelector("figcaption span");
    lbCap.textContent = cap ? cap.textContent : "";
    lbState.textContent = "$ developing...";
    lb.classList.remove("dev");
    lb.classList.add("open");
    document.body.classList.add("lb-lock");
    $("lbX").focus();
    /* show the 1-bit frame first, then let the dots come together */
    clearTimeout(devTimer);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      lb.classList.add("dev");
      devTimer = setTimeout(function(){ lbState.textContent = "$ developed"; }, RM ? 0 : 2200);
    }); });
  }
  function lbClose(){
    lb.classList.remove("open"); lb.classList.remove("dev");
    document.body.classList.remove("lb-lock");
    clearTimeout(devTimer);
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener("click", function(e){
    if(!e.target.closest) return;
    if(e.target.closest("#lbX") || e.target === lb){ lbClose(); return; }
    if(e.target.closest("#lbFig")) return;
    var fig = e.target.closest(".plate");
    if(fig){ e.preventDefault(); lbOpen(fig); }
  });
  document.addEventListener("keydown", function(e){
    if(e.key === "Escape" && lb.classList.contains("open")){ lbClose(); return; }
    if(e.key !== "Enter" && e.key !== " ") return;
    var a = document.activeElement;
    var fig = a && a.closest && a.closest(".plate");
    if(fig){ e.preventDefault(); lbOpen(fig); }
  });

  /* ---------- address is assembled at runtime, not sitting in the markup ---------- */
  var mb = $("mailBtn");
  if(mb) mb.addEventListener("click", function(e){
    e.preventDefault();
    location.href = "mailto:" + mb.getAttribute("data-u") + "@" + mb.getAttribute("data-d");
  });

  /* ---------- the mark goes home ---------- */
  $("homeLink").addEventListener("click", function(e){
    e.preventDefault();
    if(location.hash) history.pushState(null, "", location.pathname + location.search);
    document.body.classList.remove("detail-open");
    details.forEach(function(d){ d.classList.remove("active"); });
    window.scrollTo({top:0, behavior: RM ? "auto" : "smooth"});
    draw();
  });

  /* ---------- command palette ---------- */
  var ITEMS = window.__PALETTE__ || [];
  var pal = $("pal"), pin = $("palInput"), plist = $("palList"), sel = 0, shown = ITEMS;
  function render(){
    var q = pin.value.trim().toLowerCase();
    shown = q ? ITEMS.filter(function(it){ return (it.t+" "+it.k).toLowerCase().indexOf(q) > -1; }) : ITEMS;
    if(sel >= shown.length) sel = 0;
    plist.innerHTML = shown.length
      ? shown.map(function(it,i){
          return '<li class="'+(i===sel?"sel":"")+'"><a href="'+it.h+'">'+
                 '<span class="sq" style="--c:'+it.c+'"></span>'+it.t+
                 '<span class="tag">'+it.tag+'</span></a></li>'; }).join("")
      : '<li><span class="norow">No matches</span></li>';
  }
  function open(){ pal.classList.add("open"); pin.value=""; sel=0; render(); pin.focus(); }
  function close(){ pal.classList.remove("open"); }
  $("palOpen").addEventListener("click", open);
  pin.addEventListener("input", function(){ sel=0; render(); });
  pal.addEventListener("click", function(e){ if(e.target === pal) close(); });
  plist.addEventListener("click", function(){ setTimeout(close, 0); });
  addEventListener("keydown", function(e){
    if((e.metaKey||e.ctrlKey) && e.key.toLowerCase() === "k"){
      e.preventDefault(); pal.classList.contains("open") ? close() : open(); return; }
    if(!pal.classList.contains("open")) return;
    if(e.key === "Escape") close();
    else if(e.key === "ArrowDown"){ e.preventDefault(); sel = Math.min(shown.length-1, sel+1); render(); }
    else if(e.key === "ArrowUp"){ e.preventDefault(); sel = Math.max(0, sel-1); render(); }
    else if(e.key === "Enter"){
      var a = plist.querySelector("li.sel a");
      if(a){ close(); location.hash = a.getAttribute("href").replace(/^#?/, "#"); }
    }
  });
  render();
  route();
})();
