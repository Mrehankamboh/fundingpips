window.onerror = (m, s, l) => { document.documentElement.dataset.err = String(m) + " @" + l; };
document.getElementById("chat")?.remove();
document.getElementById("chat-box")?.remove();
if (!document.getElementById("ze-snippet")) {
  const ze = document.createElement("script");
  ze.id = "ze-snippet";
  ze.src = "https://static.zdassets.com/ekr/snippet.js?key=d5c44381-8faa-4c43-9539-b748d0268b75";
  document.body.appendChild(ze);
}
const PRICES = {
  zero: { sizes: ["$5K", "$10K", "$25K", "$50K", "$100K", "$200K"], price: { "$5K": [60], "$10K": [88], "$25K": [188], "$50K": [244], "$100K": [444], "$200K": [888] } },
  one: { sizes: ["$5K", "$10K", "$25K", "$50K", "$100K"], price: { "$5K": [74], "$10K": [111], "$25K": [255], "$50K": [353], "$100K": [666] } },
  two: { sizes: ["$5K", "$10K", "$25K", "$50K", "$100K"], price: {
    "$5K": [39, 35, 29], "$10K": [72, 64, 55], "$25K": [195, 175, 145], "$50K": [349, 299, 249], "$100K": [652, 555, 466]
  } }
};

const PLANS = {
  two: [
    { name: "Standard", badge: "Standard", pitch: "Biggest Daily Loss", target: "P1 8% | P2 5%", daily: ["3%", "5%"], dailyOn: 1, max: "10%", maxLabel: "Max Loss (Static)", days: "3 Days", split: "Up to 100%" },
    { name: "FLEX", badge: "FLEX", pitch: "Biggest Max Loss", target: "P1 10% | P2 8%", daily: ["4%"], max: "12%", maxLabel: "Max Loss (Static)", days: "1", split: "Up to 100%", featured: true },
    { name: "Pro", badge: "Pro", pitch: "Lowest Profit Target", target: "P1 6% | P2 6%", daily: ["3%"], max: "6%", maxLabel: "Max Loss (Static)", days: "0", split: "Up to 100%" }
  ],
  zero: [
    { name: "Zero", badge: "FundingPips", pitch: "No challenge required", target: "P1 —", daily: ["3%"], max: "5%", maxLabel: "Max Loss (Trailing)", days: "7 Profitable Days", split: "Up to 100%", featured: true }
  ],
  one: [
    { name: "Flex", badge: "Flex", pitch: "Single phase evaluation", target: "P1 12%", daily: ["2%", "3%"], dailyOn: 1, max: "12%", maxLabel: "Max Loss (Static)", days: "0", split: "Up to 100%", featured: true }
  ]
};

const state = { model: "two", size: "$5K", daily: {} };

const qs = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => [...r.querySelectorAll(s)];
const $ = qs;
const $$ = qsa;

function renderSizes() {
  const box = qs("#sizes");
  const sizes = PRICES[state.model].sizes;
  if (!sizes.includes(state.size)) state.size = sizes[0];
  box.innerHTML = sizes.map((s) => `<button class="size${s === state.size ? " on" : ""}" data-size="${s}">${s}</button>`).join("");
}

function renderPlans() {
  const plans = PLANS[state.model];
  const prices = PRICES[state.model].price[state.size];
  const box = qs("#plans");
  box.classList.toggle("single", plans.length === 1);
  box.innerHTML = plans.map((p, i) => {
    const dailyKey = state.model + i;
    const on = state.daily[dailyKey] ?? p.dailyOn ?? 0;
    const daily = p.daily.length > 1
      ? `<span class="toggle">${p.daily.map((d, di) => `<button type="button" data-daily="${i}:${di}" class="${di === on ? "on" : ""}">${d}</button>`).join("")}</span>`
      : `<span class="row-val">${p.daily[0]}</span>`;
    return `<article class="plan${p.featured ? " featured" : ""}">
      <span class="badge">${p.badge}</span>
      <h3 class="plan-title">${p.pitch}</h3>
      <div class="plan-rows">
        <div class="row"><span class="row-label">Target</span><span class="row-val target-val">${p.target}</span></div>
        <div class="row"><span class="row-label">Daily Loss</span>${daily}</div>
        <div class="row"><span class="row-label">${p.maxLabel}</span><span class="row-val">${p.max}</span></div>
        <div class="row"><span class="row-label">Min Days</span><span class="row-val">${p.days}</span></div>
        <div class="row"><span class="row-label">Split</span><span class="row-val">${p.split}</span></div>
      </div>
      <a class="btn-plan" href="https://app.fundingpips.com/checkout">Buy for $${prices[i]}</a>
    </article>`;
  }).join("");

  const cmp = qs("#compare-table");
  if (state.model !== "two") {
    cmp.innerHTML = "<tr><td>Compare is available on the Classic 2 Phase model.</td></tr>";
    return;
  }
  cmp.innerHTML = `<tr><th></th>${plans.map((p) => `<th>${p.name}</th>`).join("")}</tr>` +
    ["pitch", "target", "max", "days", "split"].map((key) => {
      const label = { pitch: "Focus", target: "Target", max: "Max loss", days: "Min days", split: "Split" }[key];
      return `<tr><td>${label}</td>${plans.map((p) => `<td>${p[key]}</td>`).join("")}</tr>`;
    }).join("") +
    `<tr><td>Price</td>${prices.map((n) => `<td>$${n}</td>`).join("")}</tr>`;
}

qs("#types").addEventListener("click", (e) => {
  const b = e.target.closest("[data-model]");
  if (!b) return;
  state.model = b.dataset.model;
  qsa("#types .type").forEach((n) => n.classList.toggle("on", n === b));
  renderSizes();
  renderPlans();
});
qs("#sizes").addEventListener("click", (e) => {
  const b = e.target.closest("[data-size]");
  if (!b) return;
  state.size = b.dataset.size;
  renderSizes();
  renderPlans();
});
qs("#plans").addEventListener("click", (e) => {
  const b = e.target.closest("[data-daily]");
  if (!b) return;
  const [i, di] = b.dataset.daily.split(":");
  state.daily[state.model + i] = Number(di);
  renderPlans();
});
qsa(".plan-tabs button").forEach((b) => b.addEventListener("click", () => {
  qsa(".plan-tabs button").forEach((n) => n.classList.toggle("on", n === b));
  qs(".pricing").classList.toggle("show-compare", b.dataset.tab === "compare");
}));

const drop = qs(".nav-drop");
qs("#products-btn").addEventListener("click", (e) => {
  e.stopPropagation();
  drop.classList.toggle("open");
});
document.addEventListener("click", () => drop.classList.remove("open"));
const menuBtn = qs("#menu-btn");
const navDrawer = qs("#nav-drawer") || qs(".nav-right");
const navBackdrop = qs("#nav-backdrop");
function setNavOpen(open) {
  document.body.classList.toggle("nav-open", open);
  navDrawer?.classList.toggle("open", open);
  if (navBackdrop) navBackdrop.hidden = !open;
  if (menuBtn) {
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
}
menuBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  setNavOpen(!document.body.classList.contains("nav-open"));
});
navBackdrop?.addEventListener("click", () => setNavOpen(false));
navDrawer?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
  if (window.matchMedia("(max-width: 1023.98px)").matches) setNavOpen(false);
}));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setNavOpen(false);
});

const track = qs("#carousel");
const cards = [...track.children];
cards.forEach((c) => track.appendChild(c.cloneNode(true)));
let offset = 0;
let storiesInView = false;
const STORY_MS = 4200;
const progressCircle = qs(".arrow-progress circle");
let progressRaf = 0;
let progressStart = 0;
let storyTimer = 0;

function clearStoryTimer() {
  if (storyTimer) clearTimeout(storyTimer);
  storyTimer = 0;
}

function armStoryTimer() {
  clearStoryTimer();
  if (!storiesInView) return;
  storyTimer = setTimeout(() => {
    if (storiesInView) slide(1);
  }, STORY_MS);
}

function resetProgress() {
  if (progressRaf) cancelAnimationFrame(progressRaf);
  progressStart = performance.now();
  if (progressCircle) progressCircle.style.strokeDashoffset = "100";
  if (!storiesInView) return;
  const tick = (now) => {
    const t = Math.min(1, (now - progressStart) / STORY_MS);
    if (progressCircle) progressCircle.style.strokeDashoffset = String(100 - t * 100);
    if (t < 1) progressRaf = requestAnimationFrame(tick);
  };
  progressRaf = requestAnimationFrame(tick);
  armStoryTimer();
}

function slide(dir) {
  const first = track.children[0];
  if (!first) return;
  const w = first.getBoundingClientRect().width + 13;
  offset += dir * w;
  const max = cards.length * w;
  if (offset < 0) offset = max - w;
  if (offset >= max) offset = 0;
  track.style.transform = `translateX(${-offset}px)`;
  resetProgress();
}
qs("#prev").addEventListener("click", () => slide(-1));
qs("#next").addEventListener("click", () => slide(1));
track.style.transition = "transform .45s ease";
const storiesObs = new IntersectionObserver((entries) => {
  storiesInView = entries.some((e) => e.isIntersecting);
  if (storiesInView) resetProgress();
  else {
    clearStoryTimer();
    if (progressRaf) cancelAnimationFrame(progressRaf);
  }
}, { threshold: 0.25 });
storiesObs.observe(qs(".carousel-wrap") || track);

const marketDefs = [
  { name: "FX", svg: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13.5 21.25C17.78 21.25 21.25 17.11 21.25 12S17.78 2.75 13.5 2.75m0 18.5C9.22 21.25 5.75 17.11 5.75 12s3.47-9.25 7.75-9.25m0 18.5h-3C6.22 21.25 2.75 17.11 2.75 12s3.47-9.25 7.75-9.25h3" stroke="currentColor" stroke-width="1.5"/></svg>' },
  { name: "Metals", svg: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.75 3.75v14.5a2 2 0 0 0 2 2h15M4.25 11l3.53-2.72a2 2 0 0 1 1.67-.37l3.17.73a2 2 0 0 0 1.37-.17L19.75 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.75 12.75v4.5m5-3.5v3.5m5-5.5v5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
  { name: "Energies", svg: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9.25" stroke="currentColor" stroke-width="1.5"/><path d="M11.25 7.53a1.5 1.5 0 0 1 1.5 0l2.75 1.58a1.5 1.5 0 0 1 .75 1.3v3.18a1.5 1.5 0 0 1-.75 1.3l-2.75 1.58a1.5 1.5 0 0 1-1.5 0L8.5 14.89a1.5 1.5 0 0 1-.75-1.3v-3.18a1.5 1.5 0 0 1 .75-1.3l2.75-1.58Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>' },
  { name: "Crypto", svg: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9.25" stroke="currentColor" stroke-width="1.5"/><path d="m13.27 10.85-2.03-1.36a1 1 0 0 0-1.32.2l-3.48 4.11c-.35.41.1 1 .59.78l3.22-1.46a.5.5 0 0 1 .48.03l2.03 1.36a1 1 0 0 0 1.32-.2l3.48-4.11c.35-.41-.1-1-.59-.78l-3.22 1.46a.5.5 0 0 1-.48-.03Z" fill="currentColor"/></svg>' },
  { name: "Indices", svg: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="14.25" cy="10" r="2.25" stroke="currentColor" stroke-width="1.5"/><path d="M14.25 12.25v8H5.75a2 2 0 0 1-2-2V5.75a2 2 0 0 1 2-2h8.5v4m-1.71 3.71L9 15l-2-2-3 3m10.25-12.25h4a2 2 0 0 1 2 2v12.5a2 2 0 0 1-2 2h-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' }
];
const marketTrack = qs("#market-track");
const marketChip = qs("#market-chip");
let mi = 3;
if (marketTrack) {
  marketDefs.forEach((m, i) => {
    const tile = document.createElement("div");
    tile.className = "market-tile" + (i === mi ? " on" : "");
    tile.innerHTML = m.svg;
    marketTrack.appendChild(tile);
  });
  const placeMarkets = () => {
    const tiles = qsa(".market-tile");
    const tileW = 66;
    const gap = 6;
    const step = tileW + gap;
    const center = mi * step + tileW / 2;
    marketTrack.style.transform = `translateX(${-center}px)`;
    tiles.forEach((t, i) => t.classList.toggle("on", i === mi));
    if (marketChip) marketChip.textContent = marketDefs[mi].name;
  };
  placeMarkets();
  setInterval(() => {
    mi = (mi + 1) % marketDefs.length;
    placeMarkets();
  }, 2200);
}
const pays = qsa("#pay-picks span");
const payRail = qs("#pay-picks");
let pi = 2;
const payStep = 84;
const placePays = () => {
  if (!pays.length) return;
  pays.forEach((el, i) => {
    const offset = (i - pi) * payStep;
    const dist = Math.abs(i - pi);
    const active = i === pi;
    el.classList.toggle("on", active);
    el.style.transform = `translateX(calc(-50% + ${offset}px)) scale(${active ? 1 : 0.96})`;
    el.style.opacity = dist === 0 ? "1" : dist === 1 ? "0.58" : "0";
    el.style.borderColor = active ? "#CFD3E7" : "rgba(207, 211, 231, 0.3)";
    el.style.color = active ? "#6A7280" : "rgba(106, 114, 128, 0.45)";
    el.setAttribute("aria-hidden", active ? "false" : "true");
  });
  if (payRail) payRail.setAttribute("data-active-payout-frequency", pays[pi].textContent.trim());
};
placePays();
setInterval(() => {
  if (!pays.length) return;
  pi = (pi + 1) % pays.length;
  placePays();
}, 1600);

const plats = qsa(".plats .plat");
let pli = 1;
const placePlats = () => {
  plats.forEach((el, i) => el.classList.toggle("on", i === pli));
};
placePlats();
setInterval(() => {
  if (!plats.length) return;
  pli = (pli + 1) % plats.length;
  placePlats();
}, 2200);

const shows = [
  { title: "Trading Psychology", line: "Master the habits & mindset behind performance", src: "https://fundingpips.com/videos/trading-psychology-web-960-av1.webm", still: "https://fundingpips.com/_next/static/immutable/media/trading-psychology-poster.3qdd89l84p8rw.webp" },
  { title: "Beyond the Charts", line: "Understand what truly moves the market", src: "https://fundingpips.com/videos/fundingpips-web-av1.webm", still: "https://fundingpips.com/_next/image?url=%2F_next%2Fstatic%2Fimmutable%2Fmedia%2Fshow-beyond-the-charts.16dr_uxntqdnt.webp&w=1200&q=75" },
  { title: "TradinTV", line: "Watch real traders execute live", src: "https://fundingpips.com/videos/fp-animated-avatar.mp4", still: "https://fundingpips.com/_next/image?url=%2F_next%2Fstatic%2Fimmutable%2Fmedia%2Fshow-tradin-tv.34wow1nred-u1.webp&w=1200&q=75" }
];
let showIndex = 0;
let showTimer = null;
function setShow(i, fromUser) {
  showIndex = ((i % shows.length) + shows.length) % shows.length;
  const s = shows[showIndex];
  const kicker = qs("#show-kicker");
  const line = qs("#show-line");
  if (kicker) kicker.textContent = s.title;
  if (line) line.textContent = s.line;
  const v = qs("#show-video");
  if (v) {
    v.poster = s.still;
    if (v.getAttribute("src") !== s.src) {
      v.src = s.src;
      v.play().catch(() => {});
    }
  }
  qsa(".thumbs button").forEach((b, n) => {
    const on = n === showIndex;
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
  });
  qsa(".show-pills button").forEach((b, n) => {
    const on = n === showIndex;
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
  });
  if (fromUser) restartShowTimer();
}
function restartShowTimer() {
  if (showTimer) clearInterval(showTimer);
  showTimer = setInterval(() => setShow(showIndex + 1), 5200);
}
qsa(".thumbs button, .show-pills button").forEach((b) => {
  b.addEventListener("click", () => setShow(Number(b.dataset.show), true));
});
setShow(0);
restartShowTimer();

const feedLines = [
  "An FP Trader from Germany just secured a $2,387.89 reward.",
  "An FP Trader from Kenya just secured a $6,422.37 reward.",
  "An FP Trader from Turkey just secured a $6,447.46 reward.",
  "An FP Trader from Venezuela just secured a $648.46 reward.",
  "An FP Trader from Saudi Arabia just secured a $1,204.10 reward."
];
let fi = 0;
setInterval(() => {
  const feed = qs("#feed");
  if (!feed) return;
  const msg = document.createElement("div");
  msg.className = "msg";
  msg.innerHTML = `<div class="avatar"></div><div><div class="meta">FundingPips <span>Just now</span></div><p></p></div>`;
  msg.querySelector("p").textContent = feedLines[fi % feedLines.length];
  fi++;
  feed.prepend(msg);
  while (feed.children.length > 5) feed.lastElementChild.remove();
}, 2200);

let bal = 12840;
const balBase = 10000;
setInterval(() => {
  bal += Math.round((Math.random() - 0.35) * 40);
  const el = qs("#balance");
  const up = qs("#balance-up");
  if (el) el.textContent = "$" + bal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (up) {
    const pct = ((bal - balBase) / balBase) * 100;
    up.textContent = (pct >= 0 ? "+" : "") + pct.toFixed(2) + "% all time";
  }
}, 1400);

const roi = qs("#roi");
const roiObs = new IntersectionObserver((entries) => {
  if (!entries[0].isIntersecting) return;
  roiObs.disconnect();
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / 1400);
    const eased = 1 - Math.pow(1 - t, 3);
    roi.textContent = Math.round(5531 * eased).toLocaleString() + "%";
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}, { threshold: 0.4 });
roiObs.observe(roi);

const chatBtn = qs("#chat");
const chatBox = qs("#chat-box");
const toggleChat = (force) => {
  const open = typeof force === "boolean" ? force : !chatBox.classList.contains("open");
  chatBox.classList.toggle("open", open);
  chatBtn.classList.toggle("open", open);
  chatBtn.setAttribute("aria-expanded", open ? "true" : "false");
};
if (chatBtn && chatBox) {
  chatBtn.addEventListener("click", () => toggleChat());
  const chatClose = qs("#chat-close");
  if (chatClose) chatClose.addEventListener("click", () => toggleChat(false));
}

const cashCard = qs("#cash-card");
if (cashCard) {
  const stage = cashCard.closest(".cash-stage") || cashCard.parentElement;
  stage.addEventListener("pointermove", (e) => {
    const r = stage.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    cashCard.style.transform = `rotateX(${10 - ny * 8}deg) rotateY(${6 + nx * 10}deg)`;
    cashCard.style.setProperty("--rewards-shine-x", `${50 + nx * 30}%`);
    cashCard.style.setProperty("--rewards-shine-y", `${50 + ny * 30}%`);
  });
  stage.addEventListener("pointerleave", () => {
    cashCard.style.transform = "rotateX(10deg) rotateY(6deg)";
  });
}

renderSizes();
renderPlans();
setShow(0);
document.documentElement.dataset.booted = "1";
