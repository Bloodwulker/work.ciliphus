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
  @keyframes shardfall {
    0%   { transform: translate(0,0) rotate(0) scale(1); opacity: 1; }
    30%  { transform: translate(calc(var(--tx) * 1.4), calc(var(--ty) * 0.6)) rotate(calc(var(--spin) * 0.4)) scale(1); opacity: 1; }
    100% { transform: translate(var(--tx), calc(100vh - 140px)) rotate(var(--spin)) scale(0.9); opacity: 1; }
  }
  @keyframes minishatter {
    0%   { transform: translate(0,0) rotate(0) scale(1); opacity: 1; }
    100% { transform: translate(var(--mtx), var(--mty)) rotate(var(--mspin)) scale(0.15); opacity: 0; }
  }
`;
  document.head.appendChild(style);

  let idleTimer, raf, floating = false;
  const badges = () => [...document.querySelectorAll(".badge:not(.sub)")];

  function makeShards(b) {
    const r = b.getBoundingClientRect();
    const face = getComputedStyle(b).backgroundImage;
    for (let i = 0; i < 8; i++) {
      const s = document.createElement("div");
      const ang = (i / 8) * Math.PI * 2;
      const dist = 40 + Math.random() * 70;
      const tx = Math.cos(ang) * dist;
      const ty = Math.sin(ang) * dist * 0.4;
      const bgX = (Math.random() - 0.5) * r.width * 0.8;
      const bgY = (Math.random() - 0.5) * r.height * 0.8;
      const spin = (Math.random() > 0.5 ? 1 : -1) * (100 + Math.random() * 160);
      s.style.cssText = `
        position:fixed;
        left:${r.left + r.width / 2 - 16}px;
        top:${r.top + r.height / 2 - 16}px;
        width:32px; height:32px;
        background:${face};
        background-size:${r.width}px ${r.height}px;
        background-position:${bgX}px ${bgY}px;
        border-radius:18%;
        pointer-events:none; z-index:21;
        animation: shardfall 2.6s ease-in forwards;
        --tx:${tx}px; --ty:${ty}px; --spin:${spin}deg;
      `;
      document.body.appendChild(s);
      s.addEventListener("animationend", () => {
        for (let j = 0; j < 3; j++) {
          const mini = document.createElement("div");
          const mAng = Math.random() * Math.PI * 2;
          const mDist = 12 + Math.random() * 24;
          const mSpin = (Math.random() > 0.5 ? 1 : -1) * (60 + Math.random() * 140);
          mini.style.cssText = `
            position:fixed;
            left:${s.getBoundingClientRect().left}px;
            top:${s.getBoundingClientRect().top}px;
            width:14px; height:14px;
            background:${face};
            background-size:${r.width}px ${r.height}px;
            background-position:${bgX + (Math.random()-0.5)*20}px ${bgY + (Math.random()-0.5)*20}px;
            border-radius:30%;
            pointer-events:none; z-index:22;
            animation: minishatter 0.9s ease-out forwards;
            --mtx:${Math.cos(mAng)*mDist}px; --mty:${Math.sin(mAng)*mDist - 15}px; --mspin:${mSpin}deg;
          `;
          document.body.appendChild(mini);
          setTimeout(() => mini.remove(), 1000);
        }
        s.remove();
      });
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
    document.querySelectorAll("div[style*='shardfall'], div[style*='minishatter']").forEach(el => el.remove());
  }

  ["pointermove", "keydown", "wheel", "input"].forEach(ev =>
    addEventListener(ev, resetIdle, { passive: true })
  );
  resetIdle();
})();
