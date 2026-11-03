/* sweep.js — replaces float-sweep.js + sweeper.js
   Idle still floats the badges. Press C to burst what's on screen,
   then a sweeper walks the floor and bulldozes the pieces off the right.
   Load ONLY this file:
     <!-- <script src="float.js"></script> -->
     <!-- <script src="float-sweep.js"></script> -->
     <!-- <script src="sweeper.js"></script> -->
     <script src="sweep.js"></script>
*/
(() => {
  const IDLE = 15000;
  const VW = 170, VH = 210;
  const SW = 200, SH = 248;
  const SX = SW / VW, SY = SH / VH;

  const style = document.createElement("style");
  style.textContent = `
    body.floating .grid { pointer-events: none; }
    body.floating .badge:not(.sub) {
      position: fixed !important;
      margin: 0 !important;
      transition: none !important;
      z-index: 20;
    }
    body.floating .badge.melting { pointer-events: none; }
    .sweeper-fig {
      position: fixed;
      bottom: 0;
      width: ${SW}px;
      height: ${SH}px;
      z-index: 80;
      pointer-events: none;
      overflow: visible;
    }
  `;
  document.head.appendChild(style);

  const debris = [];
  const DEBRIS_CAP = 420;
  let idleTimer, raf, floating = false, sweeping = false;
  let sweepT0 = 0, guy = null, guyX = -SW;
  let last = 0;

  const badges = () => [...document.querySelectorAll(".badge:not(.sub)")];

  function ns(name, attrs) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", name);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function makeGuy() {
    const svg = ns("svg", {
      class: "sweeper-fig",
      viewBox: `0 0 ${VW} ${VH}`,
      width: SW,
      height: SH
    });
    svg.style.left = "-300px";
    const parts = {
      legL: ns("line", { "stroke": "#111", "stroke-width": "4", "stroke-linecap": "round" }),
      legR: ns("line", { "stroke": "#111", "stroke-width": "4", "stroke-linecap": "round" }),
      body: ns("line", { "stroke": "#111", "stroke-width": "5", "stroke-linecap": "round" }),
      armU: ns("line", { "stroke": "#111", "stroke-width": "4", "stroke-linecap": "round" }),
      armL: ns("line", { "stroke": "#111", "stroke-width": "4", "stroke-linecap": "round" }),
      handle: ns("line", { "stroke": "#8b5a2b", "stroke-width": "6", "stroke-linecap": "round" }),
      brush: ns("rect", { fill: "#1c1c1c", rx: "2" }),
      bristles: ns("rect", { fill: "#3a3a3a", rx: "1" }),
      head: ns("circle", { fill: "#fff", stroke: "#111", "stroke-width": "3" })
    };
    Object.values(parts).forEach(p => svg.appendChild(p));
    document.body.appendChild(svg);
    return { svg, parts };
  }

  // Brush stays on the floor and scrubs sideways. Hands stay on the handle.
  function pose(now) {
    const scrub = Math.sin(now / 150) * 18;
    const brush = { x: 118 + scrub, y: 200 };
    const hand = { x: 72, y: 48 };
    const lower = {
      x: hand.x + (brush.x - hand.x) * 0.48,
      y: hand.y + (brush.y - hand.y) * 0.48
    };
    const step = Math.sin(now / 120);
    const hip = { x: 58, y: 108 };
    return {
      brush, hand, lower, hip,
      footL: { x: hip.x - 6 + step * 16, y: 204 },
      footR: { x: hip.x + 6 - step * 16, y: 204 },
      shU: { x: 48, y: 58 },
      shL: { x: 60, y: 64 },
      head: { x: 46, y: 30, r: 15 }
    };
  }

  function drawGuy(now) {
    if (!guy) return null;
    const p = pose(now);
    const { parts, svg } = guy;
    const set = (el, o) => { for (const k in o) el.setAttribute(k, o[k]); };
    set(parts.legL, { x1: p.hip.x, y1: p.hip.y, x2: p.footL.x, y2: p.footL.y });
    set(parts.legR, { x1: p.hip.x, y1: p.hip.y, x2: p.footR.x, y2: p.footR.y });
    set(parts.body, { x1: 50, y1: 46, x2: p.hip.x, y2: p.hip.y });
    set(parts.handle, { x1: p.hand.x, y1: p.hand.y, x2: p.brush.x, y2: p.brush.y });
    set(parts.armU, { x1: p.shU.x, y1: p.shU.y, x2: p.hand.x, y2: p.hand.y });
    set(parts.armL, { x1: p.shL.x, y1: p.shL.y, x2: p.lower.x, y2: p.lower.y });
    set(parts.head, { cx: p.head.x, cy: p.head.y, r: p.head.r });
    const bw = 46, bh = 11;
    set(parts.brush, {
      x: p.brush.x - bw / 2, y: p.brush.y - bh / 2, width: bw, height: bh
    });
    set(parts.bristles, {
      x: p.brush.x - bw / 2, y: p.brush.y + bh / 2 - 1, width: bw, height: 8
    });
    svg.style.left = guyX + "px";
    return {
      // world-space bulldozer box sitting on the floor, just wider than the brush
      left: guyX + (p.brush.x - bw / 2) * SX - 8,
      right: guyX + (p.brush.x + bw / 2) * SX + 10,
      top: innerHeight - 56
    };
  }

  function trimDebris() {
    while (debris.length > DEBRIS_CAP) {
      const old = debris.shift();
      if (old && old.el) old.el.remove();
    }
  }

  function makeBit(o) {
    const el = document.createElement("div");
    el.style.cssText = `
      position:fixed; left:${o.x}px; top:${o.y}px;
      width:${o.w}px; height:${o.h}px;
      border-radius:${o.big ? 18 : 30}%;
      pointer-events:none; z-index:40;
      background-repeat:no-repeat;
    `;
    if (o.face && o.face !== "none") {
      el.style.backgroundImage = o.face;
      el.style.backgroundSize = `${o.bgW}px ${o.bgH}px`;
      el.style.backgroundPosition = `${o.bgX}px ${o.bgY}px`;
    } else {
      el.style.background = "#888";
    }
    document.body.appendChild(el);
    const bit = {
      el,
      x: o.x, y: o.y,
      vx: o.vx, vy: o.vy,
      rot: Math.random() * 360,
      spin: (Math.random() > 0.5 ? 1 : -1) * (o.big ? 180 : 320),
      w: o.w, h: o.h,
      face: o.face, bgW: o.bgW, bgH: o.bgH, bgX: o.bgX, bgY: o.bgY,
      big: !!o.big,
      life: o.life || 36,
      settled: false
    };
    debris.push(bit);
    trimDebris();
    return bit;
  }

  function shatter(parent) {
    for (let i = 0; i < 3; i++) {
      makeBit({
        x: parent.x + Math.random() * 8,
        y: parent.y,
        vx: (Math.random() - 0.35) * 180,
        vy: -140 - Math.random() * 90,
        w: 14, h: 14,
        face: parent.face,
        bgW: parent.bgW, bgH: parent.bgH,
        bgX: parent.bgX + (Math.random() - 0.5) * 20,
        bgY: parent.bgY + (Math.random() - 0.5) * 20,
        big: false,
        life: 36
      });
    }
  }

  function explode(b) {
    const r = b.getBoundingClientRect();
    const face = getComputedStyle(b).backgroundImage;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    b.classList.add("melting");
    b.style.opacity = "0";
    const n = 6 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2;
      const power = 90 + Math.random() * 150;
      const size = 20 + Math.random() * 16;
      makeBit({
        x: cx - size / 2,
        y: cy - size / 2,
        vx: Math.cos(ang) * power,
        vy: Math.sin(ang) * power * 0.55 - 50,
        w: size, h: size,
        face,
        bgW: r.width, bgH: r.height,
        bgX: (Math.random() - 0.5) * r.width * 0.8,
        bgY: (Math.random() - 0.5) * r.height * 0.8,
        big: true,
        life: 12
      });
    }
  }

  function killBit(m) {
    const i = debris.indexOf(m);
    if (i > -1) debris.splice(i, 1);
    if (m.el) m.el.remove();
  }

  function parkBelow(b) {
    b.classList.remove("melting");
    b.style.opacity = "";
    b.style.animation = "";
    b.style.transform = "translate(-50%,-50%)";
    const y = innerHeight + (b.offsetHeight || 84) + 30 + Math.random() * 90;
    b.dataset.y = String(y);
    b.style.top = y + "px";
    if (!b.dataset.x) {
      const x = 80 + Math.random() * Math.max(100, innerWidth - 160);
      b.dataset.x = String(x);
      b.style.left = x + "px";
    }
  }

  function clearDebris() {
    while (debris.length) {
      const d = debris.pop();
      if (d && d.el) d.el.remove();
    }
  }

  function resetIdle() {
    if (sweeping) return;
    clearTimeout(idleTimer);
    if (floating) stop();
    idleTimer = setTimeout(start, IDLE);
  }

  function start() {
    if (floating) return;
    floating = true;
    const spots = badges().map(b => {
      const r = b.getBoundingClientRect();
      return { b, x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    document.body.classList.add("floating");
    document.querySelectorAll(".fan").forEach(f => f.classList.remove("open"));
    document.querySelectorAll(".badge.lit").forEach(b => b.classList.remove("lit"));
    spots.forEach(({ b, x, y }) => {
      b.dataset.x = x;
      b.dataset.y = y;
      b.dataset.speed = 14 + Math.random() * 28;
      b.dataset.lean = (Math.random() * 2 - 1) * 0.6;
      b.style.left = x + "px";
      b.style.top = y + "px";
      b.style.transform = "translate(-50%,-50%)";
      b.style.opacity = "";
      b.classList.remove("melting");
    });
    last = performance.now();
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function stop() {
    floating = false;
    sweeping = false;
    cancelAnimationFrame(raf);
    raf = 0;
    document.body.classList.remove("floating");
    badges().forEach(b => {
      b.classList.remove("melting");
      b.style.left = b.style.top = b.style.transform = b.style.animation = b.style.opacity = "";
      delete b.dataset.x;
      delete b.dataset.y;
      delete b.dataset.speed;
      delete b.dataset.lean;
    });
    clearDebris();
    if (guy) { guy.svg.remove(); guy = null; }
  }

  function beginSweep() {
    if (sweeping) return;
    if (!floating) start();
    sweeping = true;
    clearTimeout(idleTimer);
    sweepT0 = performance.now();
    guyX = -SW - 40;
    if (!guy) guy = makeGuy();
    badges().forEach(b => {
      if (b.classList.contains("melting")) return;
      if (b.style.opacity === "0") return;
      const r = b.getBoundingClientRect();
      if (r.width < 2 || r.bottom < 0 || r.top > innerHeight) return;
      explode(b);
    });
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function finishSweep() {
    sweeping = false;
    if (guy) { guy.svg.remove(); guy = null; }
    badges().forEach(parkBelow);
    idleTimer = setTimeout(() => { if (!sweeping) stop(); }, IDLE);
  }

  function moveBadges(dt) {
    badges().forEach(b => {
      if (b.classList.contains("melting")) return;
      const speed = parseFloat(b.dataset.speed) || 20;
      const lean = parseFloat(b.dataset.lean) || 0;
      let y = parseFloat(b.dataset.y);
      let x = parseFloat(b.dataset.x);
      if (Number.isNaN(y) || Number.isNaN(x)) return;
      y -= speed * dt;
      x += lean * speed * dt;
      const halfW = (b.offsetWidth || 80) / 2;
      if (x - halfW < 0) { x = halfW; b.dataset.lean = Math.abs(lean) || 0.3; }
      if (x + halfW > innerWidth) { x = innerWidth - halfW; b.dataset.lean = -Math.abs(lean) || -0.3; }
      b.dataset.x = x;
      b.dataset.y = y;
      b.style.left = x + "px";
      b.style.top = y + "px";
      const half = (b.offsetHeight || 80) / 2;
      if (y - half <= 4) {
        explode(b);
        const who = b;
        setTimeout(() => {
          if (!floating || sweeping) return;
          parkBelow(who);
        }, 1800);
      }
    });
  }

  function moveDebris(dt, brush) {
    const floorPad = 8;
    for (let i = debris.length - 1; i >= 0; i--) {
      const m = debris[i];
      m.vy += 1100 * dt;
      m.vx *= 0.992;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.rot += m.spin * dt;
      m.life -= dt * 0.12;

      const floor = innerHeight - m.h - floorPad;
      if (m.y >= floor) {
        m.y = floor;
        m.settled = true;
        if (m.big) {
          shatter(m);
          killBit(m);
          continue;
        }
        m.vy *= -0.32;
        m.vx *= 0.72;
        if (Math.abs(m.vy) < 50) m.vy = 0;
      }

      if (brush && m.y > brush.top) {
        const overlaps = m.x + m.w > brush.left && m.x < brush.right;
        if (overlaps) {
          if (m.big) {
            shatter(m);
            killBit(m);
            continue;
          }
          // Sit the piece on the front lip of the brush and kick it along.
          m.x = brush.right + 1;
          m.vx = Math.max(m.vx, 260);
          if (m.vy > -10) m.vy = -90 - Math.random() * 50;
          m.spin = (Math.random() > 0.5 ? 1 : -1) * 500;
          m.settled = false;
        }
      }

      if (m.x < -40) { m.x = -40; m.vx = Math.abs(m.vx); }
      if (m.x > innerWidth + 30 || m.life <= 0) {
        killBit(m);
        continue;
      }

      m.el.style.left = m.x + "px";
      m.el.style.top = m.y + "px";
      m.el.style.transform = `rotate(${m.rot}deg)`;
    }
  }

  function tick(now) {
    if (!floating && !sweeping) { raf = 0; return; }
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    let brush = null;
    if (sweeping) {
      const elapsed = now - sweepT0;
      const fallFor = 1300;
      const walkFor = 5600;
      if (elapsed < fallFor) {
        guyX = -SW - 40;
        if (guy) guy.svg.style.left = guyX + "px";
      } else if (elapsed < fallFor + walkFor) {
        const t = (elapsed - fallFor) / walkFor;
        guyX = (-SW - 40) + (innerWidth + SW + 80) * t;
        brush = drawGuy(now);
      } else {
        finishSweep();
      }
    } else {
      moveBadges(dt);
    }

    moveDebris(dt, brush);
    raf = requestAnimationFrame(tick);
  }

  ["pointermove", "keydown", "wheel", "input"].forEach(ev => {
    addEventListener(ev, e => {
      if (sweeping) return;
      if (ev === "keydown" && e.key && e.key.toLowerCase() === "c") return;
      resetIdle();
    }, { passive: true });
  });

  addEventListener("keydown", e => {
    if (e.repeat) return;
    if (e.key.toLowerCase() !== "c" || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    e.preventDefault();
    beginSweep();
  });

  resetIdle();
})();
