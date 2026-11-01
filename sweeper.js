(() => {
  const style = document.createElement("style");
  style.textContent = `
  .sweeper {
    position: fixed;
    bottom: 40px;
    left: -120px;
    width: 80px;
    height: 140px;
    z-index: 50;
    pointer-events: none;
    transition: left 0.1s linear;
  }
  .sweeper .head {
    position: absolute;
    top: 0; left: 22px;
    width: 36px; height: 36px;
    background: #fff;
    border: 3px solid #111;
    border-radius: 50%;
  }
  .sweeper .body {
    position: absolute;
    top: 36px; left: 38px;
    width: 4px; height: 50px;
    background: #111;
  }
  .sweeper .arm {
    position: absolute;
    top: 48px; left: 40px;
    width: 4px; height: 40px;
    background: #111;
    transform-origin: top center;
  }
  .sweeper .arm.left  { transform: rotate(20deg); }
  .sweeper .arm.right { transform: rotate(-10deg); }
  .sweeper .leg {
    position: absolute;
    top: 84px; left: 38px;
    width: 4px; height: 48px;
    background: #111;
    transform-origin: top center;
  }
  .sweeper .leg.left  { transform: rotate(25deg); }
  .sweeper .leg.right { transform: rotate(-25deg); }
  .sweeper .broom {
    position: absolute;
    top: 70px; left: 10px;
    width: 60px; height: 8px;
    background: #8b5a2b;
    transform: rotate(-50deg);
    transform-origin: left center;
  }
  .sweeper .broom::after {
    content: "";
    position: absolute;
    right: -8px; top: -6px;
    width: 16px; height: 20px;
    background: #333;
    border-radius: 2px;
  }
  .sweeper.walking .leg.left  { animation: walkL 0.4s linear infinite; }
  .sweeper.walking .leg.right { animation: walkR 0.4s linear infinite; }
  .sweeper.sweeping .arm.right { animation: sweep 0.3s linear infinite; }
  .sweeper.sweeping .broom    { animation: broom 0.3s linear infinite; }
  @keyframes walkL {
    0%,100% { transform: rotate(30deg); }
    50%     { transform: rotate(-30deg); }
  }
  @keyframes walkR {
    0%,100% { transform: rotate(-30deg); }
    50%     { transform: rotate(30deg); }
  }
  @keyframes sweep {
    0%,100% { transform: rotate(-15deg); }
    50%     { transform: rotate(10deg); }
  }
  @keyframes broom {
    0%,100% { transform: rotate(-55deg); }
    50%     { transform: rotate(-35deg); }
  }
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
    if (float && float.stop) float.stop();

    // force remaining badges to explode
    document.querySelectorAll(".badge:not(.sub)").forEach(b => {
      if (b.style.opacity !== "0") {
        b.style.opacity = "0";
        // if makeShards is available via a global we could call it;
        // otherwise the existing float melt will have already handled most
      }
    });

    const guy = makeSweeper();
    guy.classList.add("walking");

    // walk in
    await move(guy, -120, 200, 1800);
    guy.classList.remove("walking");
    guy.classList.add("sweeping");

    // sweep minishards off to the right
    document.querySelectorAll("div[style*='z-index:22'], div[style*='z-index: 22']").forEach(m => {
      m.style.transition = "left 1.2s ease-in";
      m.style.left = (innerWidth + 40) + "px";
    });

    await sleep(1400);
    guy.classList.remove("sweeping");
    guy.classList.add("walking");

    // walk off
    await move(guy, 200, innerWidth + 120, 1800);
    guy.remove();

    if (float && float.start) float.start();
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

  // test trigger: press "c"
  addEventListener("keydown", e => {
    if (e.key === "c" && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      run();
    }
  });
})();
