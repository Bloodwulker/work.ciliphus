(() => {
  const IDLE = 15000;          // 15s for testing
  const SPEED = 28;            // px per second, upward
  const style = document.createElement("style");
  style.textContent = `
    body.floating .grid { pointer-events: none; }
    body.floating .badge:not(.sub) {
      position: fixed !important;
      margin: 0 !important;
      transition: none !important;
      z-index: 20;
    }
    body.floating .badge.melting {
      animation: melt 1.4s ease-in forwards;
      pointer-events: none;
    }
    @keyframes melt {
      0%   { transform: translate(-50%,-50%) scaleY(1); opacity: 1; filter: none; }
      30%  { transform: translate(-50%,-50%) scaleY(1.15) scaleX(0.9); }
      100% { transform: translate(-50%, 40vh) scaleY(0.05) scaleX(1.4); opacity: 0; filter: blur(6px); }
    }
  `;
  document.head.appendChild(style);

  let idleTimer, raf, floating = false;
  const badges = () => [...document.querySelectorAll(".badge:not(.sub)")];

  function resetIdle() {
    clearTimeout(idleTimer);
    if (floating) stop();
    idleTimer = setTimeout(start, IDLE);
  }

  function start() {
  if (floating) return;
  floating = true;

  // measure while still in the grid
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
      let y = parseFloat(b.dataset.y) - SPEED * dt;
      b.dataset.y = y;
      b.style.top = y + "px";
      if (y < 40) {
        b.classList.add("melting");
        b.style.animation = "rumble 0.12s linear 4, melt 1.4s ease-in 0.5s forwards";
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
      b.style.left = b.style.top = b.style.transform = b.style.animation = "";
      delete b.dataset.x;
      delete b.dataset.y;
    });
  }

  ["pointermove", "keydown", "wheel", "input"].forEach(ev =>
    addEventListener(ev, resetIdle, { passive: true })
  );
  resetIdle();
})();
