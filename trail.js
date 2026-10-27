(async () => {
  const res = await fetch("trail.svg");
  const text = await res.text();
  document.body.insertAdjacentHTML("beforeend", text);
  const svg = document.querySelector(".cursor-trail");
  const glow = svg.querySelector(".cursor-trail__glow");
  const line = svg.querySelector(".cursor-trail__line");
  const spark = svg.querySelector(".cursor-trail__spark");
  const ripple = svg.querySelector(".cursor-trail__ripple");
  const grad = svg.querySelector("#cursor-trail-gradient");
  const sparklers = svg.querySelector(".sparklers");
  const ns = "http://www.w3.org/2000/svg";
  const COLORS = ["#c41230", "#ffffff", "#0a3161", "#fff4c2"];
  const pts = [];
  const bits = [];
  const MAX = 28;
  let mx = 0, my = 0, moving = false, idle;

  addEventListener("pointermove", (e) => {
    mx = e.clientX; my = e.clientY;
    moving = true;
    svg.dataset.visible = "true";
    svg.dataset.moving = "true";
    clearTimeout(idle);
    idle = setTimeout(() => { moving = false; svg.dataset.moving = "false"; }, 80);
    if (Math.random() < 0.65) spawn(mx, my);
  });
  addEventListener("pointerdown", (e) => {
    ripple.setAttribute("cx", e.clientX);
    ripple.setAttribute("cy", e.clientY);
    ripple.animate(
      [{ r: 8, opacity: 0.8 }, { r: 46, opacity: 0 }],
      { duration: 450, easing: "ease-out" }
    );
    for (let i = 0; i < 10; i++) spawn(e.clientX, e.clientY, 2.4);
  });

  function spawn(x, y, kick = 1) {
    const use = document.createElementNS(ns, "use");
    use.setAttribute("href", "#sparkler-star");
    use.setAttribute("class", "star");
    const color = COLORS[(Math.random() * COLORS.length) | 0];
    use.setAttribute("fill", color);
    const ang = Math.random() * Math.PI * 2;
    const spd = (0.6 + Math.random() * 2.2) * kick;
    const bit = {
      el: use, x, y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd - 0.4,
      life: 1,
      rot: Math.random() * 360,
      spin: (Math.random() - 0.5) * 18,
      scale: 0.45 + Math.random() * 0.7
    };
    sparklers.appendChild(use);
    bits.push(bit);
  }

  function tick() {
    if (moving) pts.push({ x: mx, y: my });
    if (pts.length > MAX) pts.splice(0, pts.length - MAX);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      p.x += (i === pts.length - 1 ? 0 : (pts[i + 1].x - p.x) * 0.18);
      p.y += (i === pts.length - 1 ? 0 : (pts[i + 1].y - p.y) * 0.18);
    }
    if (!moving && pts.length) pts.shift();
    if (pts.length < 2) {
      glow.setAttribute("d", "");
      line.setAttribute("d", "");
    } else {
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1];
        d += ` Q ${a.x} ${a.y} ${(a.x + b.x) / 2} ${(a.y + b.y) / 2}`;
      }
      const last = pts[pts.length - 1];
      d += ` T ${last.x} ${last.y}`;
      glow.setAttribute("d", d);
      line.setAttribute("d", d);
      const head = pts[0], tail = last;
      grad.setAttribute("x1", head.x); grad.setAttribute("y1", head.y);
      grad.setAttribute("x2", tail.x); grad.setAttribute("y2", tail.y);
      spark.setAttribute("cx", tail.x); spark.setAttribute("cy", tail.y);
    }
    for (let i = bits.length - 1; i >= 0; i--) {
      const b = bits[i];
      b.x += b.vx;
      b.y += b.vy;
      b.vy += 0.04;
      b.vx *= 0.98;
      b.life -= 0.025;
      b.rot += b.spin;
      if (b.life <= 0) {
        b.el.remove();
        bits.splice(i, 1);
        continue;
      }
      b.el.setAttribute("transform", `translate(${b.x} ${b.y}) rotate(${b.rot}) scale(${b.scale * b.life})`);
      b.el.setAttribute("opacity", b.life);
    }
    if (!pts.length) svg.dataset.visible = "false";
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
