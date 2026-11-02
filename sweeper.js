(() => {
  const style = document.createElement("style");
  style.textContent = `
  .sweeper {
    position: fixed;
    bottom: 28px;
    left: -140px;
    width: 90px;
    height: 150px;
    z-index: 60;
    pointer-events: none;
  }
  .sweeper .head {
    position: absolute; top: 0; left: 26px;
    width: 38px; height: 38px;
    background: #fff; border: 3px solid #111; border-radius: 50%;
  }
  .sweeper .body {
    position: absolute; top: 38px; left: 43px;
    width: 4px; height: 52px; background: #111;
  }
  .sweeper .arm {
    position: absolute; top: 50px; left: 45px;
    width: 4px; height: 42px; background: #111;
    transform-origin: top center;
  }
  .sweeper .arm.left  { transform: rotate(15deg); }
  .sweeper .arm.right { transform: rotate(-5deg); }
  .sweeper .leg {
    position: absolute; top: 88px; left: 43px;
    width: 4px; height: 50px; background: #111;
    transform-origin: top center;
  }
  .sweeper .leg.left  { transform: rotate(28deg); }
  .sweeper .leg.right { transform: rotate(-28deg); }
  .sweeper .broom {
    position: absolute; top: 78px; left: 8px;
    width: 70px; height: 6px; background: #8b5a2b;
    transform: rotate(-62deg); transform-origin: left center;
  }
  .sweeper .broom::after {
    content: "";
    position: absolute; right: -4px; top: -10px;
    width: 18px; height: 26px; background: #333; border-radius: 2px;
  }
  .sweeper.walking .leg.left  { animation: walkL 0.35s linear infinite; }
  .sweeper.walking .leg.right { animation: walkR 0.35s linear infinite; }
  .sweeper.sweeping .arm.right { animation: sweepArm 0.28s linear infinite; }
  .sweeper.sweeping .broom    { animation: sweepBroom 0.28s linear infinite; }
  @keyframes walkL { 0%,100%{transform:rotate(32deg)} 50%{transform:rotate(-32deg)} }
  @keyframes walkR { 0%,100%{transform:rotate(-32deg)} 50%{transform:rotate(32deg)} }
  @keyframes sweepArm { 0%,100%{transform:rotate(-8deg)} 50%{transform:rotate(12deg)} }
  @keyframes sweepBroom { 0%,100%{transform:rotate(-68deg)} 50%{transform:rotate(-48deg)} }
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

    // explode any badges still visible
    float.badges().forEach(b => {
      if (b.style.opacity !== "0") float.makeShards(b);
    });

    const guy = makeSweeper();
    guy.classList.add("walking");
    await move(guy, -140, 180, 1600);
    guy.classList.remove("walking");
    guy.classList.add("sweeping");

    // push minishards right
    float.rubble.forEach(m => {
      if (m.el) {
        m.vx = 180 + Math.random() * 80;
        m.vy = -40;
      }
    });

    await sleep(1600);
    guy.classList.remove("sweeping");
    guy.classList.add("walking");
    await move(guy, 180, innerWidth + 160, 1800);
    guy.remove();

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
