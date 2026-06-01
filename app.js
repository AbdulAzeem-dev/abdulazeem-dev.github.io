/* ============================================================
   Portfolio behavior — router, decode, telemetry, interactions
   ============================================================ */
(function(){
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function(s,c){ return (c||document).querySelector(s); };
  var $$ = function(s,c){ return Array.prototype.slice.call((c||document).querySelectorAll(s)); };

  /* ---------- year ---------- */
  var yearEl = $("#year"); if(yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- live clock (PKT, UTC+5) ---------- */
  var clockEl = $("#clock-time");
  function tickClock(){
    if(!clockEl) return;
    var now = new Date();
    var utc = now.getTime() + now.getTimezoneOffset()*60000;
    var pk = new Date(utc + 5*3600000);
    var h = pk.getHours(), m = pk.getMinutes();
    clockEl.textContent = (h<10?"0":"")+h+":"+(m<10?"0":"")+m+" PKT";
  }
  tickClock(); setInterval(tickClock, 15000);

  /* ---------- mobile nav ---------- */
  var menuBtn = $("#menuBtn"), navLinks = $("#navLinks");
  if(menuBtn){
    menuBtn.addEventListener("click", function(){
      var open = navLinks.classList.toggle("show");
      menuBtn.setAttribute("aria-expanded", open?"true":"false");
    });
    navLinks.addEventListener("click", function(e){
      if(e.target.tagName==="A"){ navLinks.classList.remove("show"); menuBtn.setAttribute("aria-expanded","false"); }
    });
  }

  /* ---------- reveal on scroll ---------- */
  var reveals = $$(".reveal");
  if(reduceMotion || !("IntersectionObserver" in window)){
    reveals.forEach(function(el){ el.classList.add("in"); });
  } else {
    var ro = new IntersectionObserver(function(ents){
      ents.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add("in"); ro.unobserve(en.target); } });
    }, { threshold:.12, rootMargin:"0px 0px -8% 0px" });
    reveals.forEach(function(el){ ro.observe(el); });
  }

  /* ---------- decode / scramble text ---------- */
  var GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&/<>$";
  function decode(el, dur){
    var target = el.getAttribute("data-text") || el.textContent;
    if(reduceMotion){ el.textContent = target; return; }
    dur = dur || 900;
    var start = null, len = target.length;
    function frame(ts){
      if(!start) start = ts;
      var p = Math.min((ts-start)/dur, 1);
      var revealed = Math.floor(p*len);
      var out = "";
      for(var i=0;i<len;i++){
        var ch = target[i];
        if(ch===" "||ch==="\n"){ out+=ch; continue; }
        if(i<revealed) out+=ch;
        else out+=GLYPHS[(Math.random()*GLYPHS.length)|0];
      }
      el.textContent = out;
      if(p<1) requestAnimationFrame(frame); else el.textContent = target;
    }
    requestAnimationFrame(frame);
  }
  // hero decode on load
  var heroName = $("#heroName");
  if(heroName){ setTimeout(function(){ decode(heroName, 850); }, 120); }
  // section heading decode on first view
  var decoders = $$("[data-decode]");
  if(reduceMotion || !("IntersectionObserver" in window)){
    decoders.forEach(function(el){ el.textContent = el.getAttribute("data-text")||el.textContent; });
  } else {
    var dio = new IntersectionObserver(function(ents){
      ents.forEach(function(en){ if(en.isIntersecting){ decode(en.target, 700); dio.unobserve(en.target); } });
    }, { threshold:.6 });
    decoders.forEach(function(el){ if(!el.getAttribute("data-text")) el.setAttribute("data-text", el.textContent); dio.observe(el); });
  }

  /* ---------- count-up ---------- */
  function fmt(n){ return n>=1000 ? n.toLocaleString("en-US") : String(n); }
  function runCount(el){
    var target = parseFloat(el.getAttribute("data-count"));
    var pre = el.getAttribute("data-prefix")||"", suf = el.getAttribute("data-suffix")||"";
    if(reduceMotion){ el.textContent = pre+fmt(target)+suf; return; }
    var dur = 1400, start = null;
    function step(ts){
      if(!start) start = ts;
      var p = Math.min((ts-start)/dur,1), eased = 1-Math.pow(1-p,3);
      el.textContent = pre+fmt(Math.round(target*eased))+suf;
      if(p<1) requestAnimationFrame(step); else el.textContent = pre+fmt(target)+suf;
    }
    requestAnimationFrame(step);
  }
  var counters = $$("[data-count]");
  if(!("IntersectionObserver" in window)){ counters.forEach(runCount); }
  else {
    var co = new IntersectionObserver(function(ents){
      ents.forEach(function(en){ if(en.isIntersecting){ runCount(en.target); co.unobserve(en.target); } });
    }, { threshold:.5 });
    counters.forEach(function(el){ co.observe(el); });
  }

  /* ---------- hero telemetry ticker ---------- */
  (function telemetry(){
    var animals = $("#tel-animals");
    var spark = $("#tel-spark");
    if(spark){
      // build bars
      for(var i=0;i<24;i++){ var b=document.createElement("i"); b.style.height=(20+Math.random()*80)+"%"; spark.appendChild(b); }
    }
    if(reduceMotion){ if(animals) animals.textContent="10,000+"; return; }
    var n = 9847;
    if(animals){
      var t = setInterval(function(){
        n += Math.floor(Math.random()*3);
        animals.textContent = n.toLocaleString("en-US")+"+";
        if(n>10250){ animals.textContent="10,000+"; }
      }, 1600);
    }
    if(spark){
      setInterval(function(){
        var bars = spark.children;
        for(var i=0;i<bars.length-1;i++){ bars[i].style.height = bars[i+1].style.height; }
        bars[bars.length-1].style.height = (20+Math.random()*80)+"%";
      }, 900);
    }
  })();

  /* ---------- magnetic buttons ---------- */
  if(!reduceMotion && window.matchMedia("(pointer:fine)").matches){
    $$("[data-magnetic]").forEach(function(el){
      el.addEventListener("mousemove", function(e){
        var r = el.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width/2, my = e.clientY - r.top - r.height/2;
        el.style.transform = "translate("+(mx*.22)+"px,"+(my*.3)+"px)";
      });
      el.addEventListener("mouseleave", function(){ el.style.transform = ""; });
    });
  }

  /* ---------- spotlight on launch + foot cards ---------- */
  if(!reduceMotion){
    $$(".launch, .foot-link").forEach(function(card){
      card.addEventListener("mousemove", function(e){
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX-r.left)/r.width*100)+"%");
        card.style.setProperty("--my", ((e.clientY-r.top)/r.height*100)+"%");
      });
    });
  }

  /* ---------- 3D tilt on project + fyp cards ---------- */
  if(!reduceMotion && window.matchMedia("(pointer:fine)").matches){
    $$(".launch, .fyp").forEach(function(card){
      card.addEventListener("mousemove", function(e){
        var r = card.getBoundingClientRect();
        var px = (e.clientX-r.left)/r.width - .5, py = (e.clientY-r.top)/r.height - .5;
        card.style.transform = "translateY(-5px) rotateX("+(-py*5).toFixed(2)+"deg) rotateY("+(px*6).toFixed(2)+"deg)";
      });
      card.addEventListener("mouseleave", function(){ card.style.transform = ""; });
    });
  }

  /* ---------- live inference log (hero telemetry) ---------- */
  (function inferenceLog(){
    var box = $("#tel-log"); if(!box || reduceMotion) return;
    var frame = 10400 + ((Math.random()*400)|0);
    var branch = 1;
    function line(){
      var roll = Math.random();
      if(roll < .55){
        frame += 1 + ((Math.random()*4)|0);
        var ms = (10 + Math.random()*22).toFixed(1);
        var conf = (0.90 + Math.random()*0.094).toFixed(2);
        return '<span class="lg-tag">infer</span> frame '+frame+' · '+ms+'ms · conf '+conf;
      } else if(roll < .78){
        return '<span class="lg-tag">edge</span> cpu '+(28+((Math.random()*34)|0))+'% · mem '+(360+((Math.random()*120)|0))+'MB';
      } else if(roll < .92){
        branch = 1 + ((Math.random()*10)|0);
        return '<span class="lg-ok">sync</span> branch_'+(branch<10?'0':'')+branch+' ✓ uploaded';
      }
      return '<span class="lg-tag">model</span> '+['yolov11','rtmpose','efficientnet','orient'][((Math.random()*4)|0)]+' ok';
    }
    var lines = [];
    function push(){
      lines.push(line()); if(lines.length>4) lines.shift();
      box.innerHTML = lines.map(function(l,i){ return '<div class="lg-line" style="opacity:'+(0.35+i*0.18)+'">'+l+'</div>'; }).join("");
    }
    push(); push(); push();
    setInterval(push, 1500);
  })();

  /* ---------- hero avatar parallax + scan ---------- */
  (function avatarFx(){
    var frame = $("#avatarFrame");
    if(!frame) return;
    if(!reduceMotion && window.matchMedia("(pointer:fine)").matches){
      var hero = $(".hero");
      hero.addEventListener("mousemove", function(e){
        var r = hero.getBoundingClientRect();
        var px = (e.clientX - r.left)/r.width - .5;
        var py = (e.clientY - r.top)/r.height - .5;
        frame.style.transform = "rotateY("+(px*9).toFixed(2)+"deg) rotateX("+(-py*9).toFixed(2)+"deg)";
      });
      hero.addEventListener("mouseleave", function(){ frame.style.transform = ""; });
    }
  })();


  /* ============================================================
     ROUTER  —  #/  (home)   ·   #/p/<id>  (case page)
     ============================================================ */
  var ALLCASES = $$("#case-store > .case");
  var ORDER = ALLCASES.filter(function(c){ return !c.hasAttribute("data-standalone"); }).map(function(c){ return c.getAttribute("data-case"); });
  var TITLES = {};
  ALLCASES.forEach(function(c){ TITLES[c.getAttribute("data-case")] = c.getAttribute("data-title"); });
  var mount = $("#case-mount");
  var caseNo = $("#caseNo"), caseTotal = $("#caseTotal"), caseName = $("#caseName");
  var prevA = $("#prevCase"), nextA = $("#nextCase"), caseNav = $(".case-nav");
  var homeScroll = 0;

  if(caseTotal) caseTotal.textContent = (ORDER.length<10?"0":"")+ORDER.length;

  function pad(n){ return (n<10?"0":"")+n; }

  function openCase(id){
    var src = $('#case-store > .case[data-case="'+id+'"]');
    if(!src){ goHome(); return; }
    if(!document.body.classList.contains("route-project")){ homeScroll = window.scrollY; }
    // mount a fresh clone (restarts CSS animations cleanly)
    mount.innerHTML = "";
    mount.appendChild(src.cloneNode(true));
    var idx = ORDER.indexOf(id);
    var standalone = idx === -1;
    var caseCount = $("#caseCount");
    if(caseName) caseName.textContent = TITLES[id]||"";
    if(standalone){
      if(caseCount) caseCount.style.display = "none";
      if(caseNav) caseNav.style.display = "none";
    } else {
      if(caseCount) caseCount.style.display = "";
      if(caseNo) caseNo.textContent = pad(idx+1);
      if(caseNav) caseNav.style.display = "";
      setNav(prevA, ORDER[idx-1], "prev");
      setNav(nextA, ORDER[idx+1], "next");
    }
    document.body.classList.add("route-project");
    window.scrollTo({ top:0, behavior:"auto" });
    var back = $("#backBtn"); if(back) back.focus();
    document.title = (TITLES[id]||"Project")+" — Abdul Azeem";
    // re-init any image slots inside the mounted case
    initSlots(mount);
  }
  function setNav(a, id, dir){
    if(!a) return;
    if(!id){ a.setAttribute("aria-disabled","true"); a.removeAttribute("href"); a.querySelector(".nm").textContent="—"; return; }
    a.removeAttribute("aria-disabled");
    a.setAttribute("href","#/p/"+id);
    a.querySelector(".nm").textContent = TITLES[id];
  }
  function goHome(){
    var wasProject = document.body.classList.contains("route-project");
    document.body.classList.remove("route-project");
    document.title = "Abdul Azeem — AI / Machine Learning Engineer";
    // only force-scroll when we actually came back FROM a project view;
    // otherwise let native anchor (#about etc.) scrolling work on first click
    if(wasProject){ window.scrollTo({ top:homeScroll, behavior:"auto" }); }
  }
  function route(){
    var h = location.hash || "";
    var m = h.match(/^#\/p\/([\w-]+)$/);
    if(m && $('#case-store > .case[data-case="'+m[1]+'"]')){ openCase(m[1]); }
    else if(h === "" || h === "#/" || h === "#"){ goHome(); }
    else if(document.body.classList.contains("route-project")){
      // an in-page anchor was clicked from somewhere — return home without fighting the scroll
      goHome();
    }
    // plain section anchors (#about, #skills…) while already home: do nothing, let the browser scroll
  }
  window.addEventListener("hashchange", route);

  var backBtn = $("#backBtn");
  if(backBtn) backBtn.addEventListener("click", function(e){ e.preventDefault(); location.hash = "#/"; });

  // keyboard nav within case
  document.addEventListener("keydown", function(e){
    if(!document.body.classList.contains("route-project")) return;
    if(e.key==="Escape"){ location.hash="#/"; }
    else if(e.key==="ArrowLeft" && prevA && prevA.getAttribute("href")){ location.hash = prevA.getAttribute("href"); }
    else if(e.key==="ArrowRight" && nextA && nextA.getAttribute("href")){ location.hash = nextA.getAttribute("href"); }
  });

  /* ---------- image upload slots ---------- */
  function setSlotImage(slot, dataUrl){
    var ex = slot.querySelector("img"); if(ex) ex.remove();
    var img = document.createElement("img");
    img.src = dataUrl; img.alt = slot.getAttribute("aria-label")||"Uploaded image";
    slot.insertBefore(img, slot.firstChild); slot.classList.add("filled");
  }
  function initSlots(scope){
    $$(".img-slot", scope).forEach(function(slot){
      if(slot.dataset.bound) {
        // still restore saved image on a fresh clone
        var k0 = "portfolio_img_"+slot.getAttribute("data-slot");
        try{ var s0 = localStorage.getItem(k0); if(s0 && !slot.querySelector("img")) setSlotImage(slot, s0); }catch(e){}
        return;
      }
      slot.dataset.bound = "1";
      var key = "portfolio_img_"+slot.getAttribute("data-slot");
      try{ var saved = localStorage.getItem(key); if(saved) setSlotImage(slot, saved); }catch(e){}
      var input = document.createElement("input");
      input.type="file"; input.accept="image/*"; input.style.display="none"; slot.appendChild(input);
      function handle(file){
        if(!file||!/^image\//.test(file.type)) return;
        var rd = new FileReader();
        rd.onload = function(ev){ setSlotImage(slot, ev.target.result); try{ localStorage.setItem(key, ev.target.result); }catch(e){} };
        rd.readAsDataURL(file);
      }
      slot.addEventListener("click", function(e){ if(e.target.tagName!=="INPUT") input.click(); });
      slot.addEventListener("keydown", function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); input.click(); } });
      input.addEventListener("change", function(){ if(input.files[0]) handle(input.files[0]); });
      slot.addEventListener("dragover", function(e){ e.preventDefault(); slot.style.borderColor="var(--cyan)"; });
      slot.addEventListener("dragleave", function(){ slot.style.borderColor=""; });
      slot.addEventListener("drop", function(e){ e.preventDefault(); slot.style.borderColor=""; if(e.dataTransfer.files[0]) handle(e.dataTransfer.files[0]); });
    });
  }
  initSlots(document);

  // initial route
  route();

  /* ---------- hero constellation ---------- */
  var canvas = $("#constellation");
  if(canvas && !reduceMotion){
    var ctx = canvas.getContext("2d");
    var W,H, dpr = Math.min(window.devicePixelRatio||1,1.5), nodes=[], raf=null, running=false;
    var mouse = { x:-9999, y:-9999 };
    function resize(){
      var rect = canvas.parentElement.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = W*dpr; canvas.height = H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      var count = Math.max(26, Math.min(58, Math.round(W/28)));
      nodes = [];
      for(var i=0;i<count;i++) nodes.push({ x:Math.random()*W, y:Math.random()*H, vx:(Math.random()-.5)*.2, vy:(Math.random()-.5)*.2 });
    }
    function draw(){
      ctx.clearRect(0,0,W,H);
      for(var i=0;i<nodes.length;i++){
        var n=nodes[i]; n.x+=n.vx; n.y+=n.vy;
        if(n.x<0||n.x>W) n.vx*=-1; if(n.y<0||n.y>H) n.vy*=-1;
        var ddx=n.x-mouse.x, ddy=n.y-mouse.y, dm=ddx*ddx+ddy*ddy;
        if(dm<14000){ var f=(1-dm/14000)*.04; n.vx+=ddx*f*.02; n.vy+=ddy*f*.02; }
        n.vx=Math.max(-.5,Math.min(.5,n.vx)); n.vy=Math.max(-.5,Math.min(.5,n.vy));
      }
      for(var a=0;a<nodes.length;a++){
        for(var b=a+1;b<nodes.length;b++){
          var dx=nodes[a].x-nodes[b].x, dy=nodes[a].y-nodes[b].y, dist=dx*dx+dy*dy;
          if(dist<16500){
            var al=(1-dist/16500)*.5;
            var g=ctx.createLinearGradient(nodes[a].x,nodes[a].y,nodes[b].x,nodes[b].y);
            g.addColorStop(0,"rgba(34,211,238,"+al+")"); g.addColorStop(1,"rgba(155,123,245,"+al+")");
            ctx.strokeStyle=g; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(nodes[a].x,nodes[a].y); ctx.lineTo(nodes[b].x,nodes[b].y); ctx.stroke();
          }
        }
      }
      for(var k=0;k<nodes.length;k++){ ctx.beginPath(); ctx.arc(nodes[k].x,nodes[k].y,1.6,0,Math.PI*2); ctx.fillStyle="rgba(180,210,255,.55)"; ctx.fill(); }
      raf = requestAnimationFrame(draw);
    }
    function start(){ if(!running){ running=true; draw(); } }
    function stop(){ running=false; if(raf) cancelAnimationFrame(raf); }
    resize(); start();
    var rt; window.addEventListener("resize", function(){ clearTimeout(rt); rt=setTimeout(resize,200); });
    window.addEventListener("mousemove", function(e){
      var rect = canvas.getBoundingClientRect(); mouse.x = e.clientX-rect.left; mouse.y = e.clientY-rect.top;
    });
    window.addEventListener("mouseout", function(){ mouse.x=-9999; mouse.y=-9999; });
    if("IntersectionObserver" in window){
      new IntersectionObserver(function(ents){ ents.forEach(function(en){ en.isIntersecting?start():stop(); }); },{threshold:0}).observe(canvas);
    }
    document.addEventListener("visibilitychange", function(){ document.hidden?stop():start(); });
  }
})();
