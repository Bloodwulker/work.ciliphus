/* builds the badge grid from a list. swap the placeholder entries for real ones later. */
const APPS = [
  { name: "ConnectWise", face: "cw.png", href: "https://example.com" },
  { name: "Automate",    face: "auto.png", href: "https://example.com" }
  /* add the rest here, up to 53 */
];
const grid = document.getElementById("apps");
APPS.forEach(a => {
  const el = document.createElement("a");
  el.className = "badge";
  el.href = a.href;
  el.target = "_blank";
  el.rel = "noopener";
  el.title = a.name;
  el.style.setProperty("--face", `url('${BLOB}${a.face}')`);
  grid.appendChild(el);
});
