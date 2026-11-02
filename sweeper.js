(() => {
  const style = document.createElement("style");
  style.textContent = `
  .sweeper {
    position: fixed;
    bottom: 18px;
    left: -160px;
    width: 100px;
    height: 160px;
    z-index: 60;
    pointer-events: none;
  }
  .sweeper .head {
    position: absolute; top: 0; left: 30px;
    width: 40px; height: 40px;
    background: #fff; border: 3px solid #111; border-radius: 50%;
  }
  .sweeper .body {
    position: absolute; top: 40px; left: 48px;
    width: 4px; height: 54px; background: #111;
  }
  .sweeper .arm {
    position: absolute; top: 52px; left: 50px;
    width: 4px; height: 44px; background: #111;
    transform-origin: top center;
  }
  .sweeper .arm.left  { transform: rotate(20deg); }
  .sweeper .arm.right { transform: rotate(-10deg); }
  .sweeper .leg {
    position: absolute; top: 92px; left: 48px;
    width: 4px; height: 52px; background: #111;
    transform-origin: top center;
  }
  .sweeper .leg.left  { transform: rotate(30deg); }
  .sweeper .leg.right { transform: rotate(-30deg); }
  .sweeper .broom {
    position: absolute; top: 138px; left: 6px;
    width: 78px; height: 7px; background: #8b5a2b;
    transform: rotate(-6deg); transform-origin: left center;
  }
  .sweeper .broom::after {
    content: "";
    position: absolute; right: -2px; top: -12px;
    width: 20px; height: 28px; background: #222; border-radius: 2px;
  }
  .sweeper.walking .leg.left  { animation: walkL 0.32s linear infinite; }
  .sweeper.walking .leg.right { animation: walkR 0.32s linear infinite; }
  .sweeper.sweeping .arm.right { animation: sweepArm 0.26s linear infinite; }
  .sweeper.sweeping .broom    { animation: sweepBroom 0.26s linear infinite; }
  @keyframes walkL { 0%,100%{transform:rotate(34deg)} 50%{transform:rotate(-34deg)} }
  @keyframes walkR { 0%,100%{transform:rotate(-34deg)} 50%{transform:rotate(34deg)} }
  @keyframes sweepArm { 0%,100%{transform:rotate(-12deg)} 50%{transform:rotate(8deg)} }
  @keyframes sweepBroom { 0%,100%{transform:rotate(-10deg)} 50%{transform:rotate(4deg)} }
  `;
  document.head.appendChild(style);

  function makeSweeper() {
    const el = document.createElement("div");
    el.className = "sweeper";
    el.innerHTML = `
      <div class="head"></div>
      <div class="body"></div>
      <div class="arm left"></div>
      <div class="arm right"></div>
      <div class="leg left"></div>
      <div class="leg right"></div>
      <div class="broom"></div>
    `;
    document.body.appendChild(el);
    return el;
  }

  async function run() {
    const float = window.ciliphusFloat;
    if (!float) return;
    float.pause();

    const guy = makeSweeper();
    guy.classList.add("walking");

    // Walk in to about 30% of the screen
    await move(guy, -160, innerWidth * 0.28, 1400);

    // Explode any still-visible badges while he's on screen
    float.badges().forEach(b => {
      if (parseFloat(b.style.opacity || "1") > 0.1) {
        float.makeShards(b);
      }
    });

    guy.classList.remove("walking");
    guy.classList.add("sweeping");

    // Continuously shove minishards that are near the broom while sweeping
    const sweepEnd = performance.now() + 1800;
    function pushNear() {
      if (performance.now() > sweepEnd) return;
      const broomX = guy.getBoundingClientRect().left + 70;
      float.rubble.forEach(m => {
        if (!m.el) return;
        const dx = m.x - broomX;
        if (Math.abs(dx) < 55 && m.y > innerHeight - 80) {
          m.vx = Math.max(m.vx, 280 + Math.random() * 80);
          m.vy = Math.min(m.vy, -10);
        }
      });
      requestAnimationFrame(pushNear);
    }
    pushNear();

    await sleep(1800);
    guy.classList.remove("sweeping");
    guy.classList.add("walking");

    // Walk off
    await move(guy, parseFloat(guy.style.left) || innerWidth * 0.28, innerWidth + 180, 1600);
    guy.remove();

    // Reset badges cleanly to the bottom then resume
    float.resetToBottom();
    float.resume();
  }

  function move(el, from, to, ms) {
    return new Promise(res => {
      const start = performance.now();
      function step(now) {
        const t = Math.min(1, (now - start) / ms);
        el.style.left = (from + (to - from) * t) + "px";
        if (t < 1) requestAnimationFrame(step);
        else res();
      }
      requestAnimationFrame(step);
    });
  }
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  addEventListener("keydown", e => {
    if (e.key === "c" && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      run();
    }
  });
})();
