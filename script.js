/* =====================================================
   CONFIG : tout ce qu'on peut modifier facilement
   ===================================================== */
const CONFIG = {
  // Date et heure de la cérémonie (mois de 0 à 11 : 4 = mai)
  wedding: new Date(2027, 4, 15, 13, 30),

  // Lien de l'album Google Photos partagé (laisser vide tant qu'il n'existe pas)
  albumUrl: "",

  // Numéro WhatsApp pour les questions, format international sans + ni espaces (ex. "33612345678")
  whatsapp: "",

  places: {
    mairie: {
      label: "Mairie · Château Dodo", time: "13h30", color: "#e5157a", n: 1,
      lat: 45.201657, lng: 5.839071,
      query: "Mairie de Domène, Place Stalingrad, 38420 Domène",
    },
    photo: {
      label: "Séance photo · Parc du Bachais", time: "14h30", color: "#ff7a00", n: 2,
      lat: 45.2119025, lng: 5.7803586,
      query: "Parc du Bachais, 38240 Meylan",
    },
    domaine: {
      label: "Réception · Domaine de Vence", time: "19h00", color: "#9b3fd6", n: 3,
      lat: 45.2465785, lng: 5.7274329,
      query: "Domaine de Vence, 38950 Quaix-en-Chartreuse",
    },
  },
};

const PALETTE = ["#ff7a00", "#ff9a2e", "#ffc21a", "#e5157a", "#ff4fa3", "#c49bf0", "#9b3fd6", "#ffd36b"];
const params = new URLSearchParams(location.search);

/* ---------- Liens Google Maps / Waze ---------- */
const mapsUrl = p => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.query)}`;
const wazeUrl = p => `https://waze.com/ul?ll=${p.lat},${p.lng}&navigate=yes`;

document.querySelectorAll("[data-maps]").forEach(a => { a.href = mapsUrl(CONFIG.places[a.dataset.maps]); });
document.querySelectorAll("[data-waze]").forEach(a => { a.href = wazeUrl(CONFIG.places[a.dataset.waze]); });
{
  const { mairie, photo, domaine } = CONFIG.places;
  document.getElementById("route-link").href =
    `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(mairie.query)}` +
    `&destination=${encodeURIComponent(domaine.query)}&waypoints=${encodeURIComponent(photo.query)}&travelmode=driving`;
}

/* ---------- Album ---------- */
{
  const link = document.getElementById("album-link");
  if (CONFIG.albumUrl) link.href = CONFIG.albumUrl;
  else { link.hidden = true; document.getElementById("album-soon").hidden = false; }
}

/* ---------- Enveloppe d'intro ---------- */
const intro = document.getElementById("intro");
const envelope = document.getElementById("envelope");

function openIntro() {
  if (envelope.classList.contains("open")) return;
  envelope.classList.add("open");
  setTimeout(() => {
    intro.classList.add("gone");
    document.body.classList.remove("locked");
    burstPetals();
  }, 1700);
  try { sessionStorage.setItem("opened", "1"); } catch (e) {}
}

let alreadyOpened = false;
try { alreadyOpened = sessionStorage.getItem("opened") === "1"; } catch (e) {}
if (params.has("ouvert")) alreadyOpened = true;
if (alreadyOpened) intro.classList.add("gone");
else document.body.classList.add("locked");

intro.addEventListener("click", openIntro);
document.getElementById("replay").addEventListener("click", () => {
  envelope.classList.remove("open");
  intro.classList.remove("gone");
  document.body.classList.add("locked");
  window.scrollTo({ top: 0 });
});

/* ---------- Arbre fleuri lumineux (SVG généré) ---------- */
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildTree() {
  const rand = rng(15052027);
  const W = 1000, H = 820;
  const branches = [], blossoms = [];

  function grow(x, y, angle, len, width, depth) {
    const x2 = x + Math.cos(angle) * len;
    const y2 = y + Math.sin(angle) * len;
    const bend = (rand() - 0.5) * len * 0.35;
    const cx = (x + x2) / 2 + Math.cos(angle + Math.PI / 2) * bend;
    const cy = (y + y2) / 2 + Math.sin(angle + Math.PI / 2) * bend;
    branches.push(`<path d="M${x.toFixed(1)} ${y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke-width="${width.toFixed(1)}"/>`);

    if (depth >= 3) {
      const count = depth >= 6 ? 6 : 2;
      for (let i = 0; i < count; i++) {
        const t = rand();
        blossoms.push([x + (x2 - x) * t + (rand() - 0.5) * 34, y + (y2 - y) * t + (rand() - 0.5) * 34, depth]);
      }
    }
    if (depth >= 7 || len < 14) {
      for (let i = 0; i < 7; i++) blossoms.push([x2 + (rand() - 0.5) * 60, y2 + (rand() - 0.5) * 50, depth]);
      return;
    }
    const kids = depth < 2 ? 2 : 2 + (rand() < 0.35 ? 1 : 0);
    for (let i = 0; i < kids; i++) {
      const spread = 0.42 + rand() * 0.35;
      const a = angle + (i - (kids - 1) / 2) * spread * 1.4 + (rand() - 0.5) * 0.25;
      grow(x2, y2, a, len * (0.72 + rand() * 0.12), width * 0.68, depth + 1);
    }
  }

  grow(W / 2, H + 10, -Math.PI / 2, 190, 38, 0);

  const flowers = blossoms.map(([x, y], i) => {
    const color = PALETTE[Math.floor(rand() * PALETTE.length)];
    const r = 5 + rand() * 9;
    const animated = i % 4 === 0;
    const style = animated ? ` class="blossom" style="--d:${(rand() * 5).toFixed(2)}s;--t:${(3 + rand() * 3).toFixed(2)}s"` : "";
    // petite fleur à 5 pétales
    if (rand() < 0.35) {
      const petals = Array.from({ length: 5 }, (_, k) => {
        const a = (k / 5) * Math.PI * 2;
        return `<circle cx="${(x + Math.cos(a) * r * 0.8).toFixed(1)}" cy="${(y + Math.sin(a) * r * 0.8).toFixed(1)}" r="${(r * 0.62).toFixed(1)}"/>`;
      }).join("");
      return `<g fill="${color}"${style}>${petals}<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r * 0.38).toFixed(1)}" fill="#ffe9a8"/></g>`;
    }
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${color}"${style}/>`;
  });

  // lucioles / points de lumière
  const lights = Array.from({ length: 45 }, () =>
    `<circle class="blossom" cx="${(rand() * W).toFixed(0)}" cy="${(rand() * H * 0.85).toFixed(0)}" r="${(1.5 + rand() * 2.5).toFixed(1)}" fill="#fff6c9" style="--d:${(rand() * 6).toFixed(2)}s;--t:${(2 + rand() * 4).toFixed(2)}s"/>`
  ).join("");

  document.getElementById("tree").innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id="halo" cx="50%" cy="45%" r="55%">
          <stop offset="0" stop-color="#ffd36b" stop-opacity=".55"/>
          <stop offset=".45" stop-color="#ff4fa3" stop-opacity=".22"/>
          <stop offset="1" stop-color="#ff4fa3" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="bark" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stop-color="#3a0b3d"/><stop offset="1" stop-color="#7a2a6a"/>
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <ellipse cx="${W / 2}" cy="${H * 0.42}" rx="${W * 0.52}" ry="${H * 0.45}" fill="url(#halo)"/>
      <g fill="none" stroke="url(#bark)" stroke-linecap="round">${branches.join("")}</g>
      <g filter="url(#glow)" opacity=".95">${flowers.join("")}</g>
      <g filter="url(#glow)">${lights}</g>
    </svg>`;
}
buildTree();

/* ---------- Pétales qui tombent ---------- */
const petalsBox = document.getElementById("petals");
function addPetal(burst) {
  const p = document.createElement("span");
  p.className = "petal";
  p.style.left = Math.random() * 100 + "vw";
  p.style.setProperty("--c", PALETTE[Math.floor(Math.random() * PALETTE.length)]);
  p.style.setProperty("--dx", (Math.random() * 160 - 80) + "px");
  const dur = 9 + Math.random() * 10;
  p.style.animationDuration = dur + "s";
  p.style.animationDelay = (burst ? Math.random() * 1.5 : Math.random() * dur) + "s";
  p.style.transform = `scale(${0.6 + Math.random() * 0.8})`;
  petalsBox.appendChild(p);
  if (burst) setTimeout(() => p.remove(), (dur + 2) * 1000);
}
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reducedMotion) for (let i = 0; i < 18; i++) addPetal(false);
function burstPetals() { if (!reducedMotion) for (let i = 0; i < 40; i++) addPetal(true); }

/* ---------- Compte à rebours ---------- */
const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2, "0");

let fwStarted = false;

function dayNumber(d) { return Math.round(new Date(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); }

function tick() {
  const now = new Date();
  const target = CONFIG.wedding;
  const daysLeft = dayNumber(target) - dayNumber(now);
  const isDay = daysLeft === 0 || params.has("jourj");

  $("countdown").classList.toggle("is-day", isDay);
  if (isDay) {
    $("jdays").textContent = "Jour J";
    $("jlabel").textContent = "C'est aujourd'hui ! 🎉";
    startFireworks();
  } else if (daysLeft > 0) {
    $("jdays").textContent = "J-" + daysLeft;
  } else {
    $("jdays").textContent = "Mariés !";
    $("jlabel").textContent = "Merci d'avoir partagé ce jour avec nous ❤️";
  }

  const diff = Math.max(0, target - now);
  $("clock").hidden = diff === 0 || isDay;
  $("cd-d").textContent = Math.floor(diff / 864e5);
  $("cd-h").textContent = pad(Math.floor(diff / 36e5) % 24);
  $("cd-m").textContent = pad(Math.floor(diff / 6e4) % 60);
  $("cd-s").textContent = pad(Math.floor(diff / 1e3) % 60);
}
tick();
setInterval(tick, 1000);

/* ---------- Feux d'artifice (le jour J) ---------- */
function startFireworks() {
  if (fwStarted) return;
  fwStarted = true;
  const cv = $("fireworks");
  const ctx = cv.getContext("2d");
  cv.style.display = "block";
  let W, H;
  const resize = () => { W = cv.width = innerWidth * devicePixelRatio; H = cv.height = innerHeight * devicePixelRatio; };
  resize(); addEventListener("resize", resize);
  const rockets = [], sparks = [];
  const s = devicePixelRatio;

  function launch() {
    rockets.push({ x: W * (0.15 + Math.random() * 0.7), y: H, vy: -(H / 75) * (0.85 + Math.random() * 0.3), ty: H * (0.15 + Math.random() * 0.3), c: PALETTE[Math.floor(Math.random() * PALETTE.length)] });
  }
  function explode(r) {
    const n = 70 + Math.random() * 50;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = (1 + Math.random() * 4.5) * s;
      sparks.push({ x: r.x, y: r.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, c: Math.random() < 0.2 ? "#fff6c9" : r.c });
    }
  }
  let last = 0;
  function frame(t) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,.22)";
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    if (t - last > 650) { launch(); if (Math.random() < 0.4) launch(); last = t; }
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.y += r.vy;
      ctx.fillStyle = r.c; ctx.beginPath(); ctx.arc(r.x, r.y, 2.5 * s, 0, 7); ctx.fill();
      if (r.y <= r.ty) { explode(r); rockets.splice(i, 1); }
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.05 * s; p.vx *= 0.985; p.vy *= 0.985; p.life -= 0.012;
      if (p.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.globalAlpha = p.life; ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2 * s, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------- Apparition au scroll + nav active ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

const navLinks = [...document.querySelectorAll(".nav a")];
const navIo = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
["accueil", "dresscode", "programme", "carte", "questions"].forEach(id => navIo.observe($(id)));

/* ---------- Carte de l'itinéraire ---------- */
if (window.L) {
  const pts = Object.values(CONFIG.places);
  const map = L.map("map", { scrollWheelZoom: false, dragging: !L.Browser.mobile, tap: false });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18, attribution: "&copy; OpenStreetMap",
  }).addTo(map);
  const line = pts.map(p => [p.lat, p.lng]);
  L.polyline(line, { color: "#ffffff", weight: 9, opacity: 0.9 }).addTo(map);
  L.polyline(line, { color: "#e5157a", weight: 5, dashArray: "10 10" }).addTo(map);
  pts.forEach(p => {
    const icon = L.divIcon({ className: "pin", html: `<span style="background:${p.color}">${p.n}</span>`, iconSize: [34, 34], iconAnchor: [17, 17] });
    L.marker([p.lat, p.lng], { icon }).addTo(map)
      .bindPopup(`<b>${p.time}</b><br>${p.label}<br><a href="${mapsUrl(p)}" target="_blank" rel="noopener">Google Maps</a> · <a href="${wazeUrl(p)}" target="_blank" rel="noopener">Waze</a>`);
  });
  map.fitBounds(line, { padding: [40, 40] });
}

/* ---------- Lightbox faire-part ---------- */
$("footer-invit").addEventListener("click", () => { $("lightbox").hidden = false; });
$("lightbox").addEventListener("click", () => { $("lightbox").hidden = true; });

/* ---------- Questions des invités (WhatsApp) ---------- */
{
  const forum = $("forum");
  const text = encodeURIComponent("Coucou Rania & Rayane ! J'ai une question pour le mariage : ");
  forum.innerHTML = CONFIG.whatsapp
    ? `<h3>Une autre question ?</h3>
       <p>Écrivez-nous directement sur WhatsApp, on vous répond avec plaisir !</p>
       <p class="center"><a class="btn big-btn wa" href="https://wa.me/${CONFIG.whatsapp}?text=${text}" target="_blank" rel="noopener">💬 Poser ma question sur WhatsApp</a></p>`
    : `<h3>Une autre question ?</h3><p>Le contact WhatsApp des mariés arrive très bientôt 🌸</p>`;
}
