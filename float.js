(() => {
  const IDLE = 15000;
  const style = document.createElement("style");
  const rubble = [];
  const RUBBLE_CAP = 400;
  style.textContent = `
  body.floating .grid { pointer-events: none; }
  body.floating .badge:not(.sub) {
    position: fixed !important;
    margin: 0 !important;
    transition: none !important;
    z-index: 20;
  }
  body.floating .badge.melting { pointer-events: none; }
  @keyframes float-rumble {
    0%   { transform: translate(-50%,-50%) translate(0,0); }
    25%  { transform: translate(-50%,-50%) translate(-2px,1px); }
    50%  { transform: translate(-50%,-50%) translate(2px,-1px); }
    75%  { transform: translate(-50%,-50%) translate(-1px,-1px); }
    100% { transform: translate(-50%,-50%) translate(0,0); }
  }
`;
  document.head.appendChild(style);
  let idleTimer, raf, floating = false;
  const badges = () => [...document.querySelectorAll(".badge:not(.sub)")];

  function removePiece(mp) {
    const i = rubble.indexOf(mp);
    if (i > -1) rubble.splice(i, 1);
    if (mp.el) mp.el.remove();
    rubble.forEach(other => {
      if (other.settled && Math.abs(other.x - mp.x) < 16 && other.y < mp.y) {
        other.settled = false;
        other.bounces = 1;
        other.vy = 40;
      }
    });
  }

  function makeShards(b) {
    const r = b.getBoundingClientRect();
    const face = getComputedStyle(b).backgroundImage;
    const count = 6 + Math.floor(Math.random() * 5);
    const pieces = [];
    for (let i = 0; i < count; i++) {
      const s = document.createElement("div");
      const ang = Math.random() * Math.PI * 2;
      const power = 80 + Math.random() * 160;
      const size = 22 + Math.random() * 18;
      const bgX = (Math.random() - 0.5) * r.width * 0.9;
      const bgY = (Math.random() - 0.5) * r.height * 0.9;
      s.style.cssText = `
        position:fixed;
        left:${r.left + r.width / 2 - size / 2}px;
        top:${r.top + r.height / 2 - size / 2}px;
        width:${size}px; height:${size}px;
        background:${face};
        background-size:${r.width}px ${r.height}px;
        background-position:${bgX}px ${bgY}px;
        border-radius:${10 + Math.random() * 20}%;
        pointer-events:none; z-index:21;
      `;
      document.body.appendChild(s);
      pieces.push({
        el: s,
        x: r.left + r.width / 2 - size / 2,
        y: r.top + r.height / 2 - size / 2,
        vx: Math.cos(ang) * power,
        vy: Math.sin(ang) * power * 0.6 - 40,
        rot: 0,
        spin: (Math.random() > 0.5 ? 1 : -1) * (120 + Math.random() * 240),
        size, face, bgX, bgY,
        done: false
      });
    }
    b.style.opacity = "0";

    let last = performance.now();
    function tick(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      let alive = false;
      pieces.forEach(p => {
        if (p.done) return;
        alive = true;
        p.vy += 420 * dt;
        p.x += p.vx * dt;
        if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx) * 0.7; }
        if (p.x + p.size > innerWidth) { p.x = innerWidth - p.size; p.vx = -Math.abs(p.vx) * 0.7; }
        p.y += p.vy * dt;
        p.rot += p.spin * dt;
        p.el.style.left = p.x + "px";
        p.el.style.top = p.y + "px";
        p.el.style.transform = `rotate(${p.rot}deg)`;
        if (p.y > innerHeight - 60) {
          p.done = true;
          for (let j = 0; j < 3; j++) {
            const mini = document.createElement("div");
            const mAng = Math.random() * Math.PI * 2;
            mini.style.cssText = `
              position:fixed;
              left:${p.x}px;
              top:${p.y}px;
              width:14px; height:14px;
              background:${p.face};
              background-size:${r.width}px ${r.height}px;
              background-position:${p.bgX + (Math.random()-0.5)*20}px ${p.bgY + (Math.random()-0.5)*20}px;
              border-radius:30%;
              pointer-events:none; z-index:22;
            `;
            document.body.appendChild(mini);
            const mp = {
              el: mini,
              x: p.x,
              y: p.y,
              vx: Math.cos(mAng) * (40 + Math.random() * 60),
              vy: -180 - Math.random() * 100,
              life: 8,
              spin: (Math.random() > 0.5 ? 1 : -1) * (100 + Math.random() * 200),
              rot: 0,
              bounces: 0,
              settled: false
            };
            rubble.push(mp);
            while (rubble.length > RUBBLE_CAP) {
              const old = rubble.shift();
              if (old) removePiece(old);
            }
            let mLast = performance.now();
            function mTick(now) {
              const dt = Math.min((now - mLast) / 1000, 0.05);
              mLast = now;
              if (!mp.settled) {
  mp.vy += 900 * dt;
  mp.vx *= 0.995;
  mp.x += mp.vx * dt;
  mp.y += mp.vy * dt;
  mp.rot += mp.spin * dt;

  let ground = innerHeight - 50;
  for (const other of rubble) {
    if (other === mp || !other.settled) continue;
    if (Math.abs(other.x - mp.x) < 14) {
      ground = Math.min(ground, other.y - 13);
    }
  }

  if (mp.y > ground) {
    mp.y = ground;
    if (Math.abs(mp.vy) > 40) {
      mp.vy = -mp.vy * 0.35;
      mp.vx *= 0.8;
    } else {
      mp.vy = 0;
      mp.vx *= 0.2;
      mp.settled = true;
    }
  }
}
              mp.life -= dt * 0.12;
              mp.el.style.left = mp.x + "px";
              mp.el.style.top = mp.y + "px";
              mp.el.style.transform = `rotate(${mp.rot}deg)`;
              mp.el.style.opacity = Math.max(0, Math.min(1, mp.life));
              if (mp.life > 0) requestAnimationFrame(mTick);
              else {
                removePiece(mp);
              }
            }
            requestAnimationFrame(mTick);
          }
          p.el.remove();
        }
      });
      if (alive) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function resetIdle() {
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
      b.style.top  = y + "px";
      b.style.transform = "translate(-50%,-50%)";
    });
    let last = performance.now();
    function tick(now) {
      if (!floating) return;
      const dt = (now - last) / 1000;
      last = now;
      badges().forEach(b => {
        if (b.classList.contains("melting")) return;
        const speed = parseFloat(b.dataset.speed);
        const lean  = parseFloat(b.dataset.lean);
        let y = parseFloat(b.dataset.y) - speed * dt;
        let x = parseFloat(b.dataset.x) + lean * speed * dt;
        const halfW = b.offsetWidth / 2;
        if (x - halfW < 0) { x = halfW; b.dataset.lean = Math.abs(lean); }
        if (x + halfW > innerWidth) { x = innerWidth - halfW; b.dataset.lean = -Math.abs(lean); }
        b.dataset.x = x;
        b.dataset.y = y;
        b.style.left = x + "px";
        b.style.top  = y + "px";
        const half = b.offsetHeight / 2;
        if (y - half <= 4) {
          b.classList.add("melting");
          b.style.top = half + "px";
          makeShards(b);
          setTimeout(() => {
            if (!floating) return;
            b.classList.remove("melting");
            b.style.animation = "";
            b.style.opacity = "";
            const newY = innerHeight + b.offsetHeight;
            b.dataset.y = newY;
            b.style.top = newY + "px";
          }, 2000);
        }
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    floating = false;
    cancelAnimationFrame(raf);
    document.body.classList.remove("floating");
    badges().forEach(b => {
      b.classList.remove("melting");
      b.style.left = b.style.top = b.style.transform = b.style.animation = b.style.opacity = "";
      delete b.dataset.x;
      delete b.dataset.y;
      delete b.dataset.speed;
      delete b.dataset.lean;
    });
    while (rubble.length) {
      const old = rubble.shift();
      if (old && old.el) old.el.remove();
    }
  }

  ["pointermove", "keydown", "wheel", "input"].forEach(ev =>
    addEventListener(ev, resetIdle, { passive: true })
  );
  resetIdle();
})();
