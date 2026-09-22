/* Maggocare — site scripts */

// ------------------------------------------------------------------
// CONFIG: WhatsApp number in international format, digits only.
// +254 793 935665  ->  254793935665
// ------------------------------------------------------------------
const WHATSAPP_NUMBER = "254793935665";

function waLink(message) {
  return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
}

// ---------- Stylised larva (SVG). Head on the right, tail on the left ----------
function larvaSVG() {
  const n = 8;
  let s = '<svg class="larva" viewBox="0 0 64 18" aria-hidden="true" focusable="false">';
  for (let i = 0; i < n; i++) {
    const cx = 8 + i * 6.6;
    const r = 5.2 - i * 0.4;
    s += `<ellipse class="seg" style="--i:${i}" cx="${cx.toFixed(1)}" cy="9" rx="${(r * 1.18).toFixed(2)}" ry="${r.toFixed(2)}"/>`;
  }
  s += '<ellipse class="mouth" cx="58.6" cy="9" rx="1.1" ry=".9"/></svg>';
  return s;
}
function larvaWrap(extraClass, style) {
  const w = document.createElement("span");
  w.className = "lw" + (extraClass ? " " + extraClass : "");
  if (style) w.setAttribute("style", style);
  w.innerHTML = larvaSVG();
  return w;
}

// Crawl strips: <div class="crawl-strip" data-larvae="3">
document.querySelectorAll(".crawl-strip").forEach((strip) => {
  const count = parseInt(strip.dataset.larvae || "3", 10);
  for (let i = 0; i < count; i++) {
    const rev = i % 2 === 1;
    const dur = 24 + ((i * 7) % 13);
    const delay = -((i * 9.5) % dur);
    strip.appendChild(larvaWrap(rev ? "rev" : "", `--d:${dur}s;--delay:${delay}s`));
  }
});

// Larva that paces along a ledge (hero chip)
document.querySelectorAll(".walk").forEach((el) => el.appendChild(larvaWrap("")));

// ---------- Therapy timeline slider ----------
const bed = document.getElementById("bed");
if (bed) {
  const spots = [
    [10, 22, -8], [34, 12, 10], [58, 20, -4], [18, 44, 6],
    [46, 40, -12], [64, 52, 8], [24, 68, -6], [50, 70, 5],
  ];
  const larvae = spots.map(([x, y, r]) => {
    const w = larvaWrap("", `left:${x}%;top:${y}%;--rot:${r}deg;`);
    w.firstChild.style.animationDelay = "0s";
    bed.appendChild(w);
    return w;
  });

  const range = document.getElementById("hours");
  const stageTitle = document.getElementById("stage-title");
  const stageText = document.getElementById("stage-text");
  const outH = document.getElementById("out-hours");
  const outSize = document.getElementById("out-size");
  const outTissue = document.getElementById("out-tissue");

  const stages = [
    [0, "Larvae applied", "Sterile larvae about 2 mm long are placed on the wound and held in by a breathable cage dressing. Skin around the wound is protected first."],
    [18, "Feeding begins", "The larvae release digestive enzymes that liquefy dead tissue and slough, then take it in. They ignore healthy tissue. Secretions also start reducing bacteria in the wound bed."],
    [42, "Growing and cleaning", "The larvae grow quickly as they feed, and the dressing is kept moist. A nurse checks the dressing regularly through the cycle."],
    [66, "Ready for removal", "At 48 to 72 hours the larvae are full, around 10 mm long, and ready to leave. They are rinsed out with saline or lifted off with moist gauze, and the wound bed is reassessed."],
  ];

  function update() {
    const h = +range.value;
    const progress = h / 72;
    const size = 0.42 + 0.58 * progress;
    const t=performance.now()/500;
    const dead = Math.max(0, 1 - Math.max(0, h - 4) / 62);
    bed.style.setProperty("--dead", dead.toFixed(2));
    larvae.forEach((l,i)=>{l.style.setProperty("--size",size.toFixed(2));const dx=Math.sin(t+i)*6*progress;const dy=Math.cos(t*1.2+i)*4*progress;l.style.setProperty("--dx",dx.toFixed(1)+"px");l.style.setProperty("--dy",dy.toFixed(1)+"px");l.style.setProperty("--rot",(Math.sin(t+i)*10)+"deg");});
    let st = stages[0];
    stages.forEach((s) => { if (h >= s[0]) st = s; });
    stageTitle.textContent = st[1];
    stageText.textContent = st[2];
    outH.textContent = h + " h";
    outSize.textContent = (2 + 8 * progress).toFixed(0) + " mm";
    outTissue.textContent = Math.round(dead * 100) + "%";
    range.setAttribute("aria-valuetext", h + " hours: " + st[1]);
  }
  range.addEventListener("input", update);
  update();
  function loop(){update();requestAnimationFrame(loop)}
  requestAnimationFrame(loop);
}

// ---------- Mobile nav ----------
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");
if (toggle && links) {
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

// ---------- Generic WhatsApp buttons ----------
document.querySelectorAll("[data-wa]").forEach((a) => {
  a.href = waLink(a.dataset.wa || "Hello Maggocare, I'd like to make an enquiry.");
  a.target = "_blank";
  a.rel = "noopener";
});

// ---------- Order form -> WhatsApp ----------
const form = document.getElementById("order-form");
if (form) {
  const required = ["name", "phone", "type", "wound"];
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    required.forEach((id) => {
      const el = form.elements[id];
      const bad = !el.value.trim();
      el.classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) {
      form.querySelector(".invalid").focus();
      return;
    }
    const v = (id) => form.elements[id].value.trim();
    const lines = [
      "Hello Maggocare, I'd like to place a request.",
      "",
      "Request type: " + v("type"),
      "Name: " + v("name"),
      "Phone: " + v("phone"),
    ];
    if (v("org")) lines.push("Facility / organisation: " + v("org"));
    lines.push("Wound type: " + v("wound"));
    if (v("size")) lines.push("Approx. wound size: " + v("size"));
    if (v("town")) lines.push("Delivery town / area: " + v("town"));
    lines.push("Urgency: " + v("urgency"));
    if (v("notes")) lines.push("", "Notes: " + v("notes"));
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });
  form.addEventListener("input", (e) => e.target.classList.remove("invalid"));
}

// ---------- Year ----------
document.querySelectorAll(".year").forEach((el) => (el.textContent = new Date().getFullYear()));
