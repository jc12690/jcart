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

  /* ---------- Save Contact ----------
     A contact card (a vCard, version 3.0, which iPhone and Android contacts
     both read) built here from the same three parts, so the number still never
     sits in the page or the repo as one string. On an iPhone the button opens
     the card with Create New Contact; on Android it downloads
     "Jarred Carter.vcf", which opens in Contacts. The links and the note come
     from this page, so editing them here updates the card too; the name, title,
     company, email, and city are set just below. The email is in two parts, the
     way the homepage keeps it, so it isn't one string a scraper could match
     either. The headshot joins as the contact photo once it has loaded. */
  var CARD = {
    first: "Jarred", last: "Carter",
    title: "Security Engineer \u00b7 Founder", org: "Retrac Labs",
    emailUser: "jc12690", emailDomain: "nyu.edu", emailLabel: "NYU",
    city: "New York", region: "NY", country: "United States",
    photo: "/assets/img/dot-headshot.jpg"
  };
  /* text values escape backslashes, commas, semicolons, and line breaks */
  function esc(s){ return String(s).replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/([,;])/g, "\\$1"); }
  /* lines longer than 75 bytes continue on the next line after a space */
  function fold(line){
    var out = "", n = 0;
    for(var i = 0; i < line.length; i++){
      var code = line.charCodeAt(i);
      var bytes = code < 0x80 ? 1 : code < 0x800 ? 2 : (code >= 0xD800 && code < 0xDC00) ? 4 : code >= 0xDC00 && code < 0xE000 ? 0 : 3;
      if(n + bytes > 75){ out += "\r\n "; n = 1; }
      out += line[i]; n += bytes;
    }
    return out;
  }
  function vcard(photo64){
    var L = [
      "BEGIN:VCARD", "VERSION:3.0",
      "N:" + esc(CARD.last) + ";" + esc(CARD.first) + ";;;",
      "FN:" + esc(CARD.first + " " + CARD.last),
      "ORG:" + esc(CARD.org),
      "TITLE:" + esc(CARD.title),
      "TEL;TYPE=CELL,VOICE:+1" + a + b + c,
      /* itemN groups a value with its label; iPhone shows the label, Android
         keeps the value */
      "item1.EMAIL;TYPE=INTERNET:" + CARD.emailUser + "@" + CARD.emailDomain,
      "item1.X-ABLabel:" + esc(CARD.emailLabel)
    ];
    /* the page's links, each labeled the way the page names it */
    var links = [].slice.call(document.querySelectorAll(".rows .item")).map(function(el){
      return [el.querySelector("h3").textContent, el.href];
    });
    var cv = document.querySelector(".win-body");
    if(cv) links.push(["R\u00e9sum\u00e9", cv.href]);
    links.forEach(function(l, i){
      L.push("item" + (i + 2) + ".URL:" + l[1], "item" + (i + 2) + ".X-ABLabel:" + esc(l[0]));
    });
    L.push("ADR;TYPE=WORK:;;;" + esc(CARD.city) + ";" + esc(CARD.region) + ";;" + esc(CARD.country));
    var seeking = document.querySelector(".seeking");
    if(seeking) L.push("NOTE:" + esc(seeking.textContent.replace(/\s+/g, " ").trim()));
    if(photo64) L.push("PHOTO;ENCODING=b;TYPE=JPEG:" + photo64);
    L.push("END:VCARD");
    return L.map(fold).join("\r\n") + "\r\n";
  }
  var save = $("saveBtn"), cardUrl = null;
  function offer(photo64){
    var next = URL.createObjectURL(new Blob([vcard(photo64)], { type: "text/vcard;charset=utf-8" }));
    if(cardUrl) URL.revokeObjectURL(cardUrl);
    cardUrl = next;
    save.href = cardUrl;
    save.download = CARD.first + " " + CARD.last + ".vcf";
    save.hidden = false;
  }
  if(window.Blob && window.URL && URL.createObjectURL){
    offer(null);
    if(window.fetch && window.FileReader){
      fetch(CARD.photo).then(function(r){ return r.ok ? r.blob() : null; }).then(function(img){
        if(!img) return;
        var fr = new FileReader();
        fr.onload = function(){ offer(String(fr.result).split(",")[1]); };
        fr.readAsDataURL(img);
      }).catch(function(){});
    }
  }

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
