// The board in the browser: places every paper and sticker from src/board/layout.json, scales the
// 1600 x 1000 board to the window, fades capped papers, lifts a paper to read it, opens essays as a
// sheet (each essay also has its own address, /writing/<slug>), fills the nightstand from the reading
// sync and opens the whole bookshelf. Add ?check to the address to see whether any text is hidden.

const DATA = JSON.parse(document.getElementById("board-data").textContent);
const stage = document.getElementById("stage"), fit = document.getElementById("fit"), decosEl = document.getElementById("decos");
const q = new URLSearchParams(location.search);

// ---------- stickers. Drawn ones are small SVGs; Alt Carbon's own are die-cut PNGs in /board/stickers.
const C = { gold: "#F5C518", red: "#E23A3A", blue: "#2F56D6", green: "#2BA84A", orange: "#F28C28", pink: "#D64BA0" };
const STICKERS = {
  star: (c = "gold") => `<svg viewBox="0 0 64 64"><path d="M32 4l8.6 18.4 20.1 2.4-14.8 13.8 3.9 19.9L32 48.6 14.2 58.5l3.9-19.9L3.3 24.8l20.1-2.4z" fill="${C[c] || C.gold}" stroke="#fff" stroke-width="4" stroke-linejoin="round"/></svg>`,
  heart: () => `<svg viewBox="0 0 64 64"><path d="M32 56S6 40 6 22a13 13 0 0 1 26-3 13 13 0 0 1 26 3c0 18-26 34-26 34z" fill="${C.red}" stroke="#fff" stroke-width="4"/></svg>`,
  cherry: () => `<svg viewBox="0 0 64 64"><path d="M26 34C28 20 36 12 50 6" fill="none" stroke="#2BA84A" stroke-width="3.5" stroke-linecap="round"/><path d="M42 36C40 24 44 14 50 6" fill="none" stroke="#2BA84A" stroke-width="3.5" stroke-linecap="round"/><path d="M50 6c8 2 10 10 6 14-5-2-8-7-6-14z" fill="#2BA84A"/><circle cx="22" cy="44" r="13" fill="#D7262C" stroke="#fff" stroke-width="3"/><circle cx="44" cy="46" r="13" fill="#B41E24" stroke="#fff" stroke-width="3"/><circle cx="17" cy="39" r="3" fill="#fff" opacity=".7"/><circle cx="39" cy="41" r="3" fill="#fff" opacity=".6"/></svg>`,
  smiley: () => `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="${C.gold}" stroke="#fff" stroke-width="4"/><circle cx="22" cy="26" r="3.5" fill="#1F1A15"/><circle cx="42" cy="26" r="3.5" fill="#1F1A15"/><path d="M18 38c6 9 22 9 28 0" fill="none" stroke="#1F1A15" stroke-width="3.5" stroke-linecap="round"/></svg>`,
  sparkle: () => `<svg viewBox="0 0 64 64"><path d="M32 2c2 18 10 26 30 30-20 4-28 12-30 30-2-18-10-26-30-30 20-4 28-12 30-30z" fill="${C.blue}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>`,
  arrow: () => `<svg viewBox="0 0 90 54"><path d="M4 44C20 10 50 6 80 22" fill="none" stroke="${C.red}" stroke-width="4" stroke-linecap="round"/><path d="M66 10l16 11-18 8" fill="none" stroke="${C.red}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  rock: () => `<svg viewBox="0 0 86 86"><circle cx="43" cy="43" r="40" fill="${C.orange}" stroke="#fff" stroke-width="4"/><circle cx="43" cy="43" r="30" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="3 3"/><path d="M30 50c-4-10 6-20 16-18 8 2 14 8 12 16-3 9-24 10-28 2z" fill="#4a3a30"/><text x="43" y="29" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="7.5" font-weight="700" fill="#fff" letter-spacing="1">BASALT</text><text x="43" y="71" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="7.5" font-weight="700" fill="#fff" letter-spacing="1">ROCK ON</text></svg>`,
  cap: () => `<svg viewBox="0 0 84 84"><circle cx="42" cy="42" r="38" fill="#B8252A" stroke="#fff" stroke-width="4" stroke-dasharray="6 3"/><circle cx="42" cy="42" r="30" fill="#D7262C" stroke="#fff" stroke-width="2"/><text x="42" y="38" text-anchor="middle" font-family="Caveat Variable,Caveat,cursive" font-size="17" font-weight="700" fill="#fff">chai</text><text x="42" y="54" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="7" font-weight="700" fill="#fff" letter-spacing="1.5">BREAK</text></svg>`,
  nice: () => `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="${C.green}" stroke="#fff" stroke-width="4"/><text x="32" y="38" text-anchor="middle" font-family="Caveat Variable,Caveat,cursive" font-size="22" font-weight="700" fill="#fff">nice!</text></svg>`,
  blob: () => `<svg viewBox="0 0 80 72"><path d="M18 10C34-4 62 2 72 18c8 14 4 34-10 44S20 72 10 58-2 24 18 10z" fill="#3919A2" stroke="#fff" stroke-width="4" stroke-linejoin="round"/><text x="40" y="44" text-anchor="middle" font-family="Caveat Variable,Caveat,cursive" font-size="26" font-weight="700" fill="#fff">yay</text></svg>`,
  seal: () => `<svg viewBox="0 0 80 80"><path d="M40 4l6 7 9-3 3 9 9 2-2 9 8 5-6 7 4 9-9 3-1 9-9-1-5 8-7-6-8 5-5-8-9 1-1-9-9-3 4-9-6-7 8-5-2-9 9-2 3-9 9 3z" fill="${C.gold}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><circle cx="40" cy="40" r="22" fill="none" stroke="#7a5200" stroke-width="1.5" stroke-dasharray="3 2"/><text x="40" y="37" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="9" font-weight="700" fill="#5a3c00" letter-spacing="1">100%</text><text x="40" y="49" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="7" font-weight="700" fill="#5a3c00" letter-spacing="1">BASALT</text></svg>`,
  bubble: () => `<svg viewBox="0 0 84 64"><path d="M14 6h56c6 0 10 4 10 10v22c0 6-4 10-10 10H40L22 60l3-12h-11C8 48 4 44 4 38V16C4 10 8 6 14 6z" fill="#fff" stroke="#1F1A15" stroke-width="3" stroke-linejoin="round"/><text x="42" y="36" text-anchor="middle" font-family="Caveat Variable,Caveat,cursive" font-size="26" font-weight="700" fill="#1F1A15">hi!!</text></svg>`,
  bolt: () => `<svg viewBox="0 0 48 72"><path d="M28 2L6 40h16l-6 30 26-44H26z" fill="${C.orange}" stroke="#fff" stroke-width="4" stroke-linejoin="round"/></svg>`,
  flower: () => `<svg viewBox="0 0 72 72"><g fill="${C.pink}" stroke="#fff" stroke-width="3"><ellipse cx="36" cy="14" rx="10" ry="13"/><ellipse cx="36" cy="58" rx="10" ry="13"/><ellipse cx="14" cy="36" rx="13" ry="10"/><ellipse cx="58" cy="36" rx="13" ry="10"/><ellipse cx="20" cy="20" rx="11" ry="11"/><ellipse cx="52" cy="20" rx="11" ry="11"/><ellipse cx="20" cy="52" rx="11" ry="11"/><ellipse cx="52" cy="52" rx="11" ry="11"/></g><circle cx="36" cy="36" r="11" fill="${C.gold}" stroke="#fff" stroke-width="3"/></svg>`,
};
const BRAND = { abundance: 136, "alter-cloud": 84, "alter-lettering": 92, darjeeling: 116, himalayan: 96, meee: 92, stamp: 100, seated: 124, icecream: 128, portrait: 112, "alter-cloud-b": 84 };
for (const [k, h] of Object.entries(BRAND)) STICKERS[k] = () => `<img src="/board/stickers/${k}.png" alt="" style="height:${h}px" draggable="false">`;

// ---------- place everything
const items = [...stage.querySelectorAll(".item[data-id]")];
const place = (el, p) => {
  el.style.setProperty("--x", p.x); el.style.setProperty("--y", p.y);
  el.style.setProperty("--r", (p.r || 0) + "deg"); el.style.setProperty("--sc", p.s || 1);
  if (p.z) el.style.zIndex = p.z;
};
for (const el of items) place(el, DATA.items[el.dataset.id] || { x: 40, y: 40 });
for (const d of DATA.decos) {
  const el = document.createElement("div");
  el.className = `deco ${d.kind === "tape" ? "washi" : d.kind} ${d.v || ""} ${d.c || ""}`;
  el.setAttribute("aria-hidden", "true");
  if (d.kind === "sticker") el.innerHTML = (STICKERS[d.v] || STICKERS.star)(d.c);
  else if (d.kind === "label") el.textContent = d.t || "";
  place(el, d); decosEl.appendChild(el);
}

// ---------- fit the board to the window, then let it rise in once, as one object
const fitStage = () => { const s = Math.min((innerWidth - 56) / 1600, (innerHeight - 64) / 1000); fit.style.setProperty("--s", s); fit.dataset.s = s; };
fitStage(); addEventListener("resize", fitStage);

// ---------- caps: each .fit block may grow to data-cap board px; past that it fades and counts what is hidden
const applyCaps = () => {
  if (q.has("nocap")) return;
  stage.querySelectorAll(".fit[data-cap]").forEach((f) => {
    const cap = +f.dataset.cap; f.style.maxHeight = cap + "px"; f.classList.add("capped");
    f.parentElement.querySelectorAll(":scope > .more-tag").forEach((t) => t.remove());
    const over = f.scrollHeight > cap + 2; f.classList.toggle("clipped", over);
    if (!over) return;
    const kids = f.matches("ol,ul") ? [...f.children] : [...f.querySelectorAll("p, li")];
    const hidden = kids.filter((k) => k.offsetTop + k.offsetHeight > cap + 2).length;
    const tag = document.createElement("span"); tag.className = "more-tag";
    tag.textContent = (hidden ? `+${hidden} more` : "more") + " · tap to read all";
    f.insertAdjacentElement("afterend", tag);
  });
};
applyCaps();
document.fonts?.ready.then(applyCaps); // the handwriting font arrives late and changes heights
requestAnimationFrame(() => requestAnimationFrame(() => { fit.classList.add("ready"); stage.classList.add("ready"); }));

// ---------- ?check: every line of text must be visible: not under another paper or sticker, not off-screen
const check = () => {
  document.querySelectorAll(".chk-bad").forEach((e) => e.classList.remove("chk-bad"));
  const issues = [];
  const leaves = [...stage.querySelectorAll(".item p:not(.letters), .item li, .item h1, .item h2, .item h3, .item figcaption, .item .ttl, .item .hand, .item a.stamp span, .item .big, .item .small, .letters b")]
    .filter((e) => e.offsetParent && !e.querySelector("p, li"));
  for (const el of leaves) {
    const item = el.closest(".item"), fitEl = el.closest(".fit.capped");
    const fr = fitEl && fitEl.getBoundingClientRect();
    // sample the words themselves: each line box of the text, at its start, middle and end
    // (text meant only for screen readers, in .vh, is skipped)
    const rects = [];
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let t = walk.nextNode(); t; t = walk.nextNode()) {
      if (t.parentElement.closest(".vh") || !t.textContent.trim()) continue;
      const range = document.createRange(); range.selectNodeContents(t); rects.push(...range.getClientRects());
    }
    const pts = [];
    for (const r of rects) {
      if (r.width < 3 || r.height < 3) continue;
      for (const fx of [0.08, 0.5, 0.92]) { const x = r.left + r.width * fx, y = r.top + r.height / 2; if (!(fr && y > fr.bottom - 6)) pts.push([x, y]); }
    }
    if (!pts.length) continue;
    const off = pts.some(([x, y]) => x < 0 || y < 0 || x > innerWidth || y > innerHeight);
    const cover = off ? null : pts.map(([x, y]) => document.elementFromPoint(x, y)).find((h) => h && !item.contains(h) && h !== item);
    if (off || cover) {
      el.classList.add("chk-bad");
      const by = off ? "off screen" : cover.closest(".item")?.dataset.id || (cover.closest(".deco") ? "sticker " + cover.closest(".deco").className.split(" ")[2] : cover.id || cover.tagName);
      issues.push({ paper: item.dataset.id, text: el.textContent.trim().slice(0, 48), by });
    }
  }
  const clipped = [...stage.querySelectorAll(".fit.clipped")].map((f) => f.closest(".item").dataset.id);
  let box = document.getElementById("chk");
  if (!box) { box = document.createElement("div"); box.id = "chk"; document.body.appendChild(box); }
  box.innerHTML = `<b class="${issues.length ? "bad" : ""}">${issues.length ? issues.length + " lines hidden" : "All text visible"}</b> at ${innerWidth}×${innerHeight}` +
    (clipped.length ? `<br>Capped, tap to read all: ${clipped.join(", ")}` : "") +
    (issues.length ? "<ul>" + issues.map((i) => `<li>${i.paper}: “${i.text}” under ${i.by}</li>`).join("") + "</ul>" : "");
  window.__check = { issues, clipped, size: [innerWidth, innerHeight] };
  return window.__check;
};
window.corkCheck = check;
if (q.has("check")) (document.fonts?.ready || Promise.resolve()).then(() => setTimeout(check, 700));

// ---------- essays: a sheet lifted off the board. /writing/<slug> is the same board with that sheet open.
const sheet = document.getElementById("sheet");
const essayPath = (p) => /^\/writing\/([^/]+)\/?$/.exec(p)?.[1];
let opener = null;
const showEssay = (slug) => {
  const art = document.getElementById("essay-" + slug); if (!art) return false;
  sheet.querySelectorAll(".essay").forEach((e) => (e.hidden = e !== art));
  document.title = `${art.dataset.title} · ${DATA.name}`;
  if (sheet.open && !sheet.matches(":modal")) sheet.close(); // opened by the server for /writing/<slug>
  if (!sheet.open) sheet.showModal();
  const box = sheet.querySelector(".sheet"); box.scrollTop = 0; box.focus({ preventScroll: true });
  return true;
};
const hideEssay = () => { if (sheet.open) sheet.close(); document.title = DATA.name; };
stage.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-essay]");
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
  e.preventDefault(); e.stopPropagation();
  opener = a;
  if (showEssay(a.dataset.essay)) history.pushState({ essay: a.dataset.essay }, "", a.getAttribute("href"));
});
const pinBack = () => { if (history.state?.essay) history.back(); else { hideEssay(); history.replaceState(null, "", "/"); } };
document.getElementById("unpin").addEventListener("click", (e) => { e.preventDefault(); pinBack(); });
sheet.addEventListener("cancel", (e) => { e.preventDefault(); pinBack(); });
sheet.addEventListener("click", (e) => { if (e.target === sheet) pinBack(); });
sheet.addEventListener("close", () => opener?.focus?.());
addEventListener("popstate", () => { const s = essayPath(location.pathname); s ? showEssay(s) : hideEssay(); });
{ const s = essayPath(location.pathname); if (s) showEssay(s); }

// ---------- the nightstand: four books being read, from the reading sync, and the whole shelf on demand
const shelfdlg = document.getElementById("shelfdlg");
const nightstand = stage.querySelector(".nightstand");
if (nightstand) {
  fetch("/reading/view.json", { headers: { accept: "application/json" } }).then((r) => (r.ok ? r.json() : null)).then((view) => {
    const row = nightstand.querySelector("[data-books]");
    const books = (view?.reading || []).filter((b) => b.cover).slice(0, 4);
    if (!books.length) { row.innerHTML = '<span class="wait">Nothing on the go right now.</span>'; return; }
    const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    row.innerHTML = books.map((b) => `<figure><img src="${esc(b.cover)}" alt="" width="62" height="93" loading="lazy"><figcaption>${esc(b.title.split(":")[0])}</figcaption></figure>`).join("");
    const n = view.counts || {};
    if (n.reading) nightstand.querySelector("[data-books-count]").textContent = `${n.reading} on the go`;
    if (n.read) nightstand.querySelector("[data-shelf]").textContent = `See all ${n.read.toLocaleString()} books I've read →`;
    applyCaps();
  }).catch(() => {});
}
let shelfReady = false;
// ---------- the contents sheet: posts on Medium and Substack join the list from the posts sync, newest
// first, each with a chip saying where it lives. The sheet's cap does the rest (applyCaps).
const toc = stage.querySelector(".toc ol");
if (toc) {
  fetch("/writing/elsewhere.json", { headers: { accept: "application/json" } }).then((r) => (r.ok ? r.json() : null)).then((v) => {
    if (!v?.posts?.length) return;
    const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    const norm = (u) => String(u || "").trim().replace(/^https?:\/\/(www\.)?/, "").replace(/[?#].*$/, "").replace(/\/+$/, "").toLowerCase();
    const out = new Set((DATA.hide || []).map(norm));
    const WHERE = { medium: "Medium", substack: "Substack" };
    for (const p of v.posts) {
      if (!p.date || out.has(norm(p.url))) continue;
      const li = document.createElement("li"); li.dataset.date = p.date;
      li.innerHTML = `<a href="${esc(p.url)}"><span class="ttl">${esc(p.title)}</span><span class="where">${esc(WHERE[p.source] || p.source)}</span><span class="dots"></span><span class="date">${p.date.slice(0, 4)}</span></a>${p.blurb ? `<span class="blurb">${esc(p.blurb)}</span>` : ""}`;
      const older = [...toc.children].find((row) => (row.dataset.date || "") < p.date);
      toc.insertBefore(li, older ?? null);
    }
    applyCaps();
  }).catch(() => {});
}

const openShelf = () => {
  if (!shelfReady) { shelfReady = true; document.dispatchEvent(new Event("astro:page-load")); } // Shelf.astro renders on this event
  shelfdlg.showModal();
};
if (shelfdlg) {
  stage.addEventListener("click", (e) => { if (e.target.closest("[data-shelf], .nightstand figure")) { e.stopPropagation(); openShelf(); } }, true);
  document.getElementById("shelfclose").addEventListener("click", () => shelfdlg.close());
  shelfdlg.addEventListener("click", (e) => { if (e.target === shelfdlg) shelfdlg.close(); });
}

// ---------- lift a paper off the board to read it; click again, the dim, or Esc puts it back
const dim = document.getElementById("dim");
let lifted = null;
const unlift = () => {
  if (!lifted) return;
  lifted.classList.remove("lifted");
  Object.assign(lifted.style, { transform: "", maxHeight: "", overflow: "", overscrollBehavior: "" });
  lifted.removeAttribute("aria-modal"); lifted = null; dim.classList.remove("on");
};
const liftPaper = (el) => {
  if (lifted === el) return unlift();
  unlift(); lifted = el; el.classList.add("lifted"); dim.classList.add("on");
  if (matchMedia("(max-width:760px), (max-height:460px)").matches) return; // phones: the CSS lays it out
  // full content first (caps off), then scale up to fill most of the board; very tall papers scroll inside
  const w = el.offsetWidth, h = el.offsetHeight;
  const sc = Math.min(1.75, 1440 / w, Math.max(1.45, 900 / h));
  if (h * sc > 940) Object.assign(el.style, { maxHeight: Math.round(920 / sc) + "px", overflow: "auto", overscrollBehavior: "contain" });
  const hh = Math.min(h * sc, 940) / sc;
  el.style.transform = `translate(${Math.round(800 - w / 2)}px,${Math.round(500 - hh / 2)}px) rotate(0deg) scale(${sc})`;
};
stage.addEventListener("click", (e) => {
  if (e.target.closest("a, button, [data-shelf], .nightstand figure")) return;
  const el = e.target.closest(".item"); if (el) liftPaper(el);
});
// papers can be lifted from the keyboard too
for (const el of items) {
  if (el.matches("a")) continue;
  el.tabIndex = 0;
  el.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target === el) { e.preventDefault(); liftPaper(el); } });
}
dim.addEventListener("click", unlift);
addEventListener("keydown", (e) => { if (e.key === "Escape" && lifted && !sheet.open && !shelfdlg?.open) unlift(); });
