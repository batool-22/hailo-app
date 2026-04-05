(function () {
  'use strict';

  var html = document.documentElement;
  var GOLD = 'rgba(196,146,58,';

  // ===================== THEME =====================
  var toggle = document.getElementById('themeToggle');

  function applyTheme(t) {
    t === 'dark' ? html.classList.add('dark') : html.classList.remove('dark');
  }

  var saved = localStorage.getItem('hailo-theme');
  if (saved) {
    applyTheme(saved);
  } else {
    applyTheme('light'); // default light
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem('hailo-theme')) applyTheme(e.matches ? 'dark' : 'light');
  });

  toggle.addEventListener('click', function () {
    var next = html.classList.contains('dark') ? 'light' : 'dark';
    localStorage.setItem('hailo-theme', next);
    applyTheme(next);
    // Re-render orbital nodes for color update
    if (typeof buildNodes === 'function') buildNodes();
  });

  // ===================== NAVBAR =====================
  var nav = document.getElementById('nav');
  window.addEventListener('scroll', function () {
    var dark = html.classList.contains('dark');
    if (window.scrollY > 60) {
      nav.style.background = dark ? 'rgba(10,10,9,0.92)' : 'rgba(255,255,255,0.92)';
      nav.style.backdropFilter = 'blur(24px)';
      nav.style.borderBottom = dark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.05)';
    } else {
      nav.style.background = 'transparent';
      nav.style.backdropFilter = 'none';
      nav.style.borderBottom = '1px solid transparent';
    }
  }, { passive: true });

  // ===================== SCROLL REVEAL =====================
  var srElements = document.querySelectorAll('.sr, .sr-left, .sr-right, .sr-scale');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('v');
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

  srElements.forEach(function (el) { observer.observe(el); });

  // ===================== COUNTERS =====================
  var counted = false;
  var ctrObs = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting || counted) return;
    counted = true;
    document.querySelectorAll('.ctr[data-target]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-target'));
      var suffix = el.getAttribute('data-suffix') || '';
      var current = 0;
      var step = Math.max(1, Math.ceil(target / 40));
      var iv = setInterval(function () {
        current += step;
        if (current >= target) { current = target; clearInterval(iv); }
        el.textContent = current + suffix;
      }, 25);
    });
  }, { threshold: 0.25 });

  var firstCtr = document.querySelector('.ctr[data-target]');
  if (firstCtr) ctrObs.observe(firstCtr.closest('section'));

  // ===================== ORBITAL =====================
  var orbWrap = document.getElementById('orbWrap');
  var orbNodes = document.getElementById('orbNodes');
  var orbCanvas = document.getElementById('orbCanvas');

  if (orbWrap && orbNodes && orbCanvas) {
    var ctx = orbCanvas.getContext('2d');

    var nodes = [
      { l: 'Guests',     c: 'GU', a: 0 },
      { l: 'Hotel Ops',  c: 'HO', a: 51.4 },
      { l: 'Management', c: 'MG', a: 102.8 },
      { l: 'Corporate',  c: 'CO', a: 154.3 },
      { l: 'Airlines',   c: 'AL', a: 205.7 },
      { l: 'Card Prog.', c: 'CP', a: 257.1 },
      { l: 'Concierge',  c: 'CN', a: 308.6 }
    ];

    var layout = {};

    function buildNodes() {
      var w = orbWrap.offsetWidth;
      var h = orbWrap.offsetHeight;
      var dpr = window.devicePixelRatio || 1;
      orbCanvas.width = w * dpr;
      orbCanvas.height = h * dpr;
      orbCanvas.style.width = w + 'px';
      orbCanvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      layout.cx = w / 2;
      layout.cy = h / 2;
      layout.r = Math.min(layout.cx, layout.cy) - 30;
      layout.w = w;
      layout.h = h;

      orbNodes.innerHTML = '';
      var dark = html.classList.contains('dark');

      nodes.forEach(function (n) {
        var rad = n.a * Math.PI / 180;
        n.x = layout.cx + layout.r * Math.cos(rad);
        n.y = layout.cy + layout.r * Math.sin(rad);

        var wrap = document.createElement('div');
        wrap.style.cssText = 'position:absolute;left:' + (n.x - 24) + 'px;top:' + (n.y - 24) + 'px;display:flex;flex-direction:column;align-items:center;gap:5px;cursor:default;z-index:6;transition:transform 0.3s;';

        var circle = document.createElement('div');
        circle.textContent = n.c;
        circle.style.cssText = 'width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;letter-spacing:1px;transition:all 0.3s;'
          + 'background:' + (dark ? 'rgba(19,18,17,0.9)' : 'rgba(255,255,255,0.95)') + ';'
          + 'border:1px solid ' + (dark ? 'rgba(196,146,58,0.1)' : 'rgba(196,146,58,0.15)') + ';'
          + 'color:rgba(196,146,58,0.5);'
          + 'box-shadow:0 2px 8px ' + (dark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)') + ';';

        var label = document.createElement('span');
        label.textContent = n.l;
        label.style.cssText = 'font-size:9px;font-weight:600;text-align:center;max-width:65px;line-height:1.2;transition:color 0.3s;color:' + (dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)') + ';';

        wrap.appendChild(circle);
        wrap.appendChild(label);

        wrap.onmouseenter = function () {
          wrap.style.transform = 'scale(1.12)';
          circle.style.borderColor = 'rgba(196,146,58,0.4)';
          circle.style.color = '#c4923a';
          circle.style.boxShadow = '0 4px 20px rgba(196,146,58,0.12)';
          label.style.color = dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)';
        };
        wrap.onmouseleave = function () {
          wrap.style.transform = 'scale(1)';
          circle.style.borderColor = dark ? 'rgba(196,146,58,0.1)' : 'rgba(196,146,58,0.15)';
          circle.style.color = 'rgba(196,146,58,0.5)';
          circle.style.boxShadow = '0 2px 8px ' + (dark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)');
          label.style.color = dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';
        };

        orbNodes.appendChild(wrap);
      });
    }

    // Make it accessible for theme toggle
    window.buildNodes = buildNodes;
    buildNodes();

    var resizeT;
    window.addEventListener('resize', function () {
      clearTimeout(resizeT);
      resizeT = setTimeout(buildNodes, 200);
    });

    // Particles
    var particles = [];

    function spawn() {
      var n = nodes[Math.floor(Math.random() * nodes.length)];
      if (!n.x) return;
      // Randomly go from center-to-node or node-to-center
      var outward = Math.random() > 0.3;
      particles.push({
        sx: outward ? layout.cx : n.x,
        sy: outward ? layout.cy : n.y,
        ex: outward ? n.x : layout.cx,
        ey: outward ? n.y : layout.cy,
        t: 0,
        speed: 0.006 + Math.random() * 0.008,
        size: 1 + Math.random() * 1.2
      });
    }

    function draw() {
      var dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, layout.w, layout.h);
      var dark = html.classList.contains('dark');

      // Connection lines
      nodes.forEach(function (n) {
        if (!n.x) return;
        ctx.beginPath();
        ctx.moveTo(layout.cx, layout.cy);
        ctx.lineTo(n.x, n.y);
        ctx.strokeStyle = GOLD + (dark ? '0.03)' : '0.06)');
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw particles
      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.t += p.speed;
        if (p.t >= 1) { particles.splice(i, 1); continue; }

        var ease = p.t < 0.5 ? 2 * p.t * p.t : 1 - Math.pow(-2 * p.t + 2, 2) / 2;
        var px = p.sx + (p.ex - p.sx) * ease;
        var py = p.sy + (p.ey - p.sy) * ease;
        var alpha = p.t < 0.1 ? p.t * 10 : p.t > 0.85 ? (1 - p.t) * 6.67 : 0.7;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = GOLD + alpha + ')';
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }

    draw();
    setInterval(spawn, 350);
  }
})();
