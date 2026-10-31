(() => {
  const IDLE = 15000;
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
  @keyframes float-rumble {
    0%   { transform: translate(-50%,-50%) translate(0,0); }
    25%  { transform: translate(-50%,-50%) translate(-2px,1px); }
    50%  { transform: translate(-50%,-50%) translate(2px,-1px); }
    75%  { transform: translate(-50%,-50%) translate(-1px,-1px); }
    100% { transform: translate(-50%,-50%) translate(0,0); }
  }
  @keyframes shrink {
    0%   { transform: translate(-50%,-50%) scale(1); opacity: 1; }
    100% { transform: translate(-50%,-50%) scale(0); opacity: 0; }
  }
  @keyframes burst {
    0%   { transform: translate(-50%,-50%) scale(1); opacity: 1; filter: none; }
    100% { transform: translate(-50%,-50%) scale(1.6); opacity: 0; filter: blur(8px); }
  }
  @keyframes smoke {
    0%   { transform: translate(-50%,-50%) scale(1); opacity: 1; filter: none; }
    100% { transform: translate(-50%,-120%) scale(1.4); opacity: 0; filter: blur(12px); }
  }
  @keyframes dripfall {
    0%   { transform: translateY(0) scaleY(1); opacity: 1; }
    100% { transform: translateY(70vh) scaleY(2.2) scaleX(0.6); opacity: 0; }
  }
  @keyframes shardfall {
    0%   { opacity: 1; }
    100% { transform: translateY(60vh) rotate(220deg) scale(0.3); opacity: 0; }
  }
`;
  document.head.appendChild(style);

  let idleTimer, raf, floating = false;
  const badges = () => [...document.querySelectorAll(".badge:not(.sub)")];

  function makeDrips(b) {
    const r = b.getBoundingClientRect();
    const face = getComputedStyle(b).backgroundImage;
    for (let i = 0; i < 4; i++) {
      const d = document.createElement("div");
      d.style.cssText = `
        position:fixed; left:${r.left + (i * r.width) / 4}px; top:${r.top}px;
        width:${r.width / 4 - 2}px; height:${r.height}px;
        background:${face}; background-size:cover;
        border-radius:40%; pointer-events:none; z-index:21;
        animation: dripfall 1.4s ease-in forwards;
        animation-delay:${i * 0.08}s;
      `;
      document.body.appendChild(d);
      setTimeout(() => d.remove(), 1600);
    }
    b.style.opacity = "0";
  }

  function makeShards(b) {
    const r = b.getBoundingClientRect();
    const face = getComputedStyle(b).backgroundImage;
    for (let i = 0; i < 6; i++) {
      const s = document.createElement("div");
      const ang = (i / 6) * 360;
      s.style.cssText = `
        position:fixed; left:${r.left + r.width / 2 - 12}px; top:${r.top + r.height / 2 - 12}px;
        width:24px; height:24px;
        background:${face}; background-size:cover; background-position:center;
        border-radius:30%; pointer-events:none; z-index:21;
        animation: shardfall 1.3s ease-in forwards;
        transform: rotate(${ang}deg);
      `;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1500);
    }
    b.style.opacity = "0";
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
          const styles = ["drip", "shrink", "burst", "shatter", "smoke"];
          const pick = styles[Math.floor(Math.random() * styles.length)];
          if (pick === "drip") {
            makeDrips(b);
          } else if (pick === "shatter") {
            makeShards(b);
          } else {
            b.style.animation = `float-rumble 0.12s linear 4, ${pick} 1.6s ease-in 0.48s forwards`;
          }
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
    document.querySelectorAll(".drip-bit, .shard-bit").forEach(el => el.remove());
  }

  ["pointermove", "keydown", "wheel", "input"].forEach(ev =>
    addEventListener(ev, resetIdle, { passive: true })
  );
  resetIdle();
})();
