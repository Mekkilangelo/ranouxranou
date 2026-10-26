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
      label: "Mairie · Château Dodo (annexe derrière la mairie)", time: "13h30", n: 1, color: "#ee6a1a",
      lat: 45.203412, lng: 5.840019,
      query: "2 Rue Jules Ferry, 38420 Domène",
    },
    photo: {
      label: "Séance photo · Parc du Bachais", time: "14h30", n: 2, color: "#d6246e",
      lat: 45.2119025, lng: 5.7803586,
      query: "Parc du Bachais, 38240 Meylan",
    },
    domaine: {
      label: "Réception · Domaine de Vence", time: "19h00", n: 3, color: "#ae8fdb",
      lat: 45.2465785, lng: 5.7274329,
      query: "Domaine de Vence, 38950 Quaix-en-Chartreuse",
    },
  },
};

const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);

/* ---------- Liens et cartes Google Maps / Waze ---------- */
const mapsUrl = p => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.query)}`;
const wazeUrl = p => `https://waze.com/ul?ll=${p.lat},${p.lng}&navigate=yes`;
const embedUrl = p => `https://maps.google.com/maps?q=${encodeURIComponent(p.query)}&hl=fr&z=14&output=embed`;

document.querySelectorAll("[data-maps]").forEach(a => { a.href = mapsUrl(CONFIG.places[a.dataset.maps]); });
document.querySelectorAll("[data-waze]").forEach(a => { a.href = wazeUrl(CONFIG.places[a.dataset.waze]); });
document.querySelectorAll("[data-embed]").forEach(box => {
  const p = CONFIG.places[box.dataset.embed];
  box.innerHTML = `<iframe src="${embedUrl(p)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Carte : ${p.label}"></iframe>`;
});
{
  const { mairie, photo, domaine } = CONFIG.places;
  $("route-link").href =
    `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(mairie.query)}` +
    `&destination=${encodeURIComponent(domaine.query)}&waypoints=${encodeURIComponent(photo.query)}&travelmode=driving`;
}

/* ---------- Album & questions ---------- */
if (CONFIG.albumUrl) $("album-link").href = CONFIG.albumUrl;
else { $("album-link").hidden = true; $("album-soon").hidden = false; }

{
  const text = encodeURIComponent("Bonjour Rania & Rayane ! J'ai une question pour le mariage : ");
  $("ask").innerHTML = CONFIG.whatsapp
    ? `<p>Une autre question ? Écrivez-nous directement.</p>
       <a class="btn solid" href="https://wa.me/${CONFIG.whatsapp}?text=${text}" target="_blank" rel="noopener">Poser ma question sur WhatsApp</a>`
    : `<p class="muted">Une autre question ? Le contact WhatsApp des mariés sera ajouté très bientôt.</p>`;
}

/* ---------- Enveloppe ---------- */
const intro = $("intro");
const letter = $("letter");
let introStep = 0;

function zoomLetter() {
  const box = letter.parentElement.getBoundingClientRect();
  const ratio = letter.naturalHeight / letter.naturalWidth || 1.41;
  let h = innerHeight * 0.74, w = h / ratio;
  if (w > innerWidth * 0.88) { w = innerWidth * 0.88; h = w * ratio; }
  const left = (innerWidth - w) / 2;
  const top = Math.max(16, (innerHeight - h) / 2 - 34);
  letter.style.transform = `translate(${left - box.left}px, ${top - box.top}px) scale(${w / box.width})`;
}

function openEnvelope() {
  if (introStep) return;
  introStep = 1;
  intro.classList.add("open");
  setTimeout(() => intro.classList.add("out"), 750);
  setTimeout(() => { intro.classList.add("zoom"); zoomLetter(); }, 1900);
  setTimeout(() => intro.classList.add("done"), 2900);
}

function closeIntro() {
  intro.classList.add("gone");
  document.body.classList.remove("locked");
  try { sessionStorage.setItem("opened", "1"); } catch (e) {}
}

function resetIntro() {
  introStep = 0;
  letter.style.transform = "";
  intro.classList.remove("open", "out", "zoom", "done", "gone");
  document.body.classList.add("locked");
  window.scrollTo({ top: 0 });
}

$("env").addEventListener("click", openEnvelope);
$("intro-go").addEventListener("click", closeIntro);
$("replay").addEventListener("click", resetIntro);
addEventListener("resize", () => { if (intro.classList.contains("zoom")) zoomLetter(); });

let alreadyOpened = params.has("ouvert");
try { alreadyOpened = alreadyOpened || sessionStorage.getItem("opened") === "1"; } catch (e) {}
if (alreadyOpened) intro.classList.add("gone");
else document.body.classList.add("locked");

/* ---------- Compte à rebours ---------- */
const pad = n => String(n).padStart(2, "0");
const dayNumber = d => Math.round(new Date(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
let fireworksStarted = false;

function tick() {
  const now = new Date();
  const daysLeft = dayNumber(CONFIG.wedding) - dayNumber(now);
  const isDay = daysLeft === 0 || params.has("jourj");

  $("countdown").classList.toggle("is-day", isDay);
  if (isDay) {
    $("jdays").textContent = "Jour J";
    $("jlabel").textContent = "C'est aujourd'hui !";
    if (!fireworksStarted) { fireworksStarted = true; startFireworks(); }
  } else if (daysLeft > 0) {
    $("jdays").textContent = "J-" + daysLeft;
  } else {
    $("jdays").textContent = "Mariés !";
    $("jlabel").textContent = "Merci d'avoir partagé ce jour avec nous";
  }

  const diff = Math.max(0, CONFIG.wedding - now);
  $("clock").hidden = isDay || diff === 0;
  $("cd-d").textContent = Math.floor(diff / 864e5);
  $("cd-h").textContent = pad(Math.floor(diff / 36e5) % 24);
  $("cd-m").textContent = pad(Math.floor(diff / 6e4) % 60);
  $("cd-s").textContent = pad(Math.floor(diff / 1e3) % 60);
}
tick();
setInterval(tick, 1000);

/* ---------- Feux d'artifice (le jour J uniquement) ---------- */
function startFireworks() {
  const colors = ["#ee6a1a", "#ffc94a", "#d6246e", "#ef6fa0", "#ae8fdb", "#ffe3a3"];
  const cv = $("fireworks");
  const ctx = cv.getContext("2d");
  cv.style.display = "block";
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let W, H;
  const resize = () => { W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr; };
  resize();
  addEventListener("resize", resize);

  const rockets = [], sparks = [];
  const end = performance.now() + 30000;
  let last = 0;

  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    if (t < end && t - last > 700) {
      last = t;
      rockets.push({ x: W * (0.15 + Math.random() * 0.7), y: H, vy: -H / 70, ty: H * (0.12 + Math.random() * 0.3), c: colors[Math.floor(Math.random() * colors.length)] });
    }
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.y += r.vy;
      ctx.fillStyle = r.c;
      ctx.fillRect(r.x - dpr, r.y, 2 * dpr, 6 * dpr);
      if (r.y <= r.ty) {
        for (let k = 0; k < 60; k++) {
          const a = Math.random() * Math.PI * 2, v = (1 + Math.random() * 4) * dpr;
          sparks.push({ x: r.x, y: r.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, c: r.c });
        }
        rockets.splice(i, 1);
      }
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.04 * dpr; p.vx *= 0.98; p.vy *= 0.98; p.life -= 0.014;
      if (p.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x, p.y, 2.5 * dpr, 2.5 * dpr);
    }
    ctx.globalAlpha = 1;
    if (t < end || rockets.length || sparks.length) requestAnimationFrame(frame);
    else cv.style.display = "none";
  }
  requestAnimationFrame(frame);
}

/* ---------- Apparition au scroll + nav active ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

const navLinks = [...document.querySelectorAll(".nav a")];
const navIo = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
["accueil", "dresscode", "programme", "infos"].forEach(id => navIo.observe($(id)));

/* ---------- Carte de l'itinéraire ---------- */
if (window.L) {
  const pts = Object.values(CONFIG.places);
  const line = pts.map(p => [p.lat, p.lng]);
  const map = L.map("map", { scrollWheelZoom: false, dragging: !L.Browser.mobile, tap: false });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, attribution: "&copy; OpenStreetMap",
  }).addTo(map);
  L.polyline(line, { color: "#d6246e", weight: 3, dashArray: "6 8", opacity: 0.85 }).addTo(map);
  pts.forEach(p => {
    const icon = L.divIcon({ className: "pin", html: `<span style="background:${p.color}">${p.n}</span>`, iconSize: [30, 30], iconAnchor: [15, 15] });
    L.marker([p.lat, p.lng], { icon }).addTo(map)
      .bindPopup(`<b>${p.time}</b> · ${p.label}<br><a href="${mapsUrl(p)}" target="_blank" rel="noopener">Google Maps</a> · <a href="${wazeUrl(p)}" target="_blank" rel="noopener">Waze</a>`);
  });
  map.fitBounds(line, { padding: [36, 36] });
}

/* ---------- Faire-part en grand ---------- */
$("footer-invit").addEventListener("click", () => { $("lightbox").hidden = false; });
$("lightbox").addEventListener("click", () => { $("lightbox").hidden = true; });
