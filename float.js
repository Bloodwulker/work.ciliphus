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
  100% { transform: translateY(65vh) scaleY(2.4) scaleX(0.5); opacity: 0; }
}
@keyframes shardfall {
  0%   { transform: translate(0,0) rotate(0); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) rotate(180deg) scale(0.2); opacity: 0; }
}
`;
  document.head.appendChild(style);

  let idleTimer, raf, floating = false;
  const badges = () => [...document.querySelectorAll(".badge:not(.sub)")];

  function makeDrips(b) {
  const r = b.getBoundingClientRect();
  const face = getComputedStyle(b).backgroundImage;
  for (let i = 0; i < 5; i++) {
    const d = document.createElement("div");
    const w = 14 + Math.random() * 18;
    const xOff = (Math.random() - 0.5) * r.width * 0.7;
    d.style.cssText = `
      position:fixed;
      left:${r.left + r.width / 2 + xOff - w / 2}px;
      top:${r.top + r.height * 0.6}px;
      width:${w}px; height:${w * 1.6}px;
      background:${face}; background-size:${r.width}px ${r.height}px;
      background-position:${-xOff}px 0;
      border-radius:40% 40% 50% 50%;
      pointer-events:none; z-index:21;
      animation: dripfall 1.5s ease-in forwards;
      animation-delay:${i * 0.06}s;
    `;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1700);
  }
  b.style.opacity = "0";
}

function makeShards(b) {
  const r = b.getBoundingClientRect();
  const face = getComputedStyle(b).backgroundImage;
  for (let i = 0; i < 8; i++) {
    const s = document.createElement("div");
    const ang = (i / 8) * Math.PI * 2;
    const dist = 40 + Math.random() * 80;
    const tx = Math.cos(ang) * dist;
    const ty = Math.sin(ang) * dist + 40;
    s.style.cssText = `
      position:fixed;
      left:${r.left + r.width / 2 - 10}px;
      top:${r.top + r.height / 2 - 10}px;
      width:20px; height:20px;
      background:${face}; background-size:${r.width}px ${r.height}px;
      background-position:center;
      border-radius:20%;
      pointer-events:none; z-index:21;
      animation: shardfall 1.2s ease-out forwards;
      --tx:${tx}px; --ty:${ty}px;
    `;
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1400);
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
