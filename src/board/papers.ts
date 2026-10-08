// The papers on the board, one function per content type, each returning HTML. Every content
// type is always the same kind of paper, so the editor never asks about layout:
//   site          -> a "Hello, my name is" badge and the greeting as letter stickers
//   photo         -> a polaroid and a photobooth strip
//   about         -> a typed memo (paragraphs and work)
//   now           -> one big sticky note, and a calendar with the updated day circled
//   writing       -> a contents sheet; each title opens the essay as a sheet lifted off the board
//   reading links -> a till receipt;  books -> the nightstand card, which opens the whole shelf
//   research      -> a stapled stack
//   contact       -> a "call me" sticker, a sheet of stamps and a postcard
// The part of a paper that grows with content sits in a .fit block with a height cap (data-cap,
// board px). Past it the text fades and a tag counts what is hidden; lifting the paper shows it all.
import layout from "./layout.json";

export type Data = {
  site: { name: string; pronunciation: string; greeting: string; oneLiner: string; place: string; employer: string; employerUrl: string; photo: string; social: { label: string; url: string }[] };
  about: { paragraphs: string[]; experience: { role: string; org: string; orgUrl: string; start: string; end: string }[]; contact: string; facts: { label: string; value: string }[] };
  now: { updated: string; groups: { heading: string; items: string[] }[] } | null;
  reading: { intro: string; links: { title: string; by: string; note: string; url: string }[] } | null;
  research: { items: { title: string; authors: string; venue: string; year: number; kind: string; url: string }[] } | null;
  posts: { slug: string; title: string; date: string; blurb: string; link: string }[];
  books: boolean;
};
type H = { day: (d: string) => string; inline: (s: string) => string; years: (e: { start: string; end: string }) => string; markMe: (a: string) => string };

const CAPS = layout.caps as Record<string, number>;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pin = (c = "") => `<i class="pin ${c}" aria-hidden="true"></i>`;
const fact = (d: Data, label: string, fallback = "") => d.about.facts.find((f) => f.label === label)?.value || fallback;
const town = (d: Data) => fact(d, "Based in", d.site.place).split(",")[0]!.trim();
const first = (d: Data) => d.site.name.trim().split(/\s+/)[0]!;
const photo = (d: Data) => d.site.photo || "/board/placeholder.svg";
const email = (d: Data) => d.site.social.find((s) => s.url.startsWith("mailto:"))?.url.replace("mailto:", "") || "";

function badge(d: Data) {
  const name = first(d), size = Math.min(44, Math.floor(270 / (0.48 * Math.max(name.length, 1))));
  const place = fact(d, "Based in", d.site.place);
  const where = [d.site.employer && (d.site.employerUrl ? `<a href="${esc(d.site.employerUrl)}">${esc(d.site.employer)}</a>` : esc(d.site.employer)), esc(place)].filter(Boolean).join(" · ");
  return `<section class="item badge" data-id="card" aria-label="Who">
  <header><span>Hello</span><small>my name is</small></header>
  <h1 class="hand" style="font-size:${size}px">${esc(name)}<span class="vh"> ${esc(d.site.name.slice(name.length))}</span></h1>
  <p class="line clamp2">${esc(d.site.oneLiner)}</p>
  ${where ? `<p class="meta">${where}</p>` : ""}
</section>`;
}

function letters(d: Data) {
  const g = d.site.greeting || `Hi, I am ${first(d)}`;
  const palette = ["gold", "red", "blue", "green", "orange", "pink"];
  let i = 0;
  const tiles = [...g].map((ch) => {
    if (ch === " ") return '<i class="sp"></i>';
    if (!/[\p{L}\p{N}]/u.test(ch)) return `<i class="pt">${esc(ch)}</i>`;
    const t = `<b class="${palette[i % 6]}" style="--t:${((i * 7) % 11) - 5}deg">${esc(ch)}</b>`;
    i++;
    return t;
  }).join("");
  // tiles shrink to keep the greeting within ~450px; a very long one wraps onto a second row
  const n = [...g].filter((c) => /[\p{L}\p{N}]/u.test(c)).length + 0.4 * (g.split(" ").length - 1);
  let tile = Math.min(40, Math.floor(440 / Math.max(n, 1)) - 4);
  if (tile < 24) tile = Math.max(22, Math.min(32, Math.floor(880 / Math.max(n, 1)) - 4));
  return `<p class="item letters" data-id="letters" style="--tile:${tile}px" aria-label="${esc(g)}"><span aria-hidden="true">${tiles}</span></p>`;
}

function polaroid(d: Data) {
  return `<figure class="item polaroid" data-id="photo">
  <i class="tape" aria-hidden="true"></i>
  <img src="${esc(photo(d))}" alt="Portrait of ${esc(d.site.name)}" width="228" height="228">
  ${town(d) ? `<figcaption>${esc(town(d))}</figcaption>` : ""}
</figure>`;
}

function strip(d: Data) {
  return `<figure class="item strip" data-id="strip" aria-hidden="true">
  ${[0, 1, 2, 3].map((i) => `<img src="${esc(photo(d))}" alt="" class="f${i}" width="100" height="100">`).join("")}
  <figcaption>photobooth</figcaption>
</figure>`;
}

function memo(d: Data, h: H) {
  const paras = d.about.paragraphs.map((p) => `<p>${h.inline(p)}</p>`).join("");
  const xp = d.about.experience.map((e) => `<li><span class="yrs">${esc(h.years(e))}</span> <b>${esc(e.role)}</b>, ${e.orgUrl ? `<a href="${esc(e.orgUrl)}">${esc(e.org)}</a>` : esc(e.org)}</li>`).join("");
  return `<section class="item memo" data-id="about" aria-label="About">
  ${pin("blue")}
  <header><span><b>From</b> ${esc(d.site.name)}</span><span><b>Re</b> about me</span></header>
  <div class="fit" data-cap="${CAPS.about}">
  ${paras}
  ${xp ? `<h3>Work</h3><ol class="xp">${xp}</ol>` : ""}
  </div>
</section>`;
}

function bigNote(d: Data, h: H) {
  const now = d.now!;
  const body = now.groups.map((g) => `<h3>${esc(g.heading)}</h3><ul>${g.items.map((x) => `<li>${h.inline(x)}</li>`).join("")}</ul>`).join("");
  return `<section class="item bignote" data-id="now" aria-label="Now">
  <h2>Now</h2>
  <div class="fit" data-cap="${CAPS.now}">${body}</div>
  <p class="when">updated ${esc(h.day(now.updated))}</p>
</section>`;
}

function calendar(d: Data) {
  const [y, m, dd] = d.now!.updated.split("-").map(Number) as [number, number, number];
  const startDow = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7; // Monday first
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells = [...Array(startDow).fill(0), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(0);
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(`<tr>${cells.slice(i, i + 7).map((n) => `<td${n === dd ? ' class="hit"' : ""}>${n || ""}</td>`).join("")}</tr>`);
  return `<section class="item cal" data-id="cal" aria-label="Calendar">
  <h2>${MONTHS[m - 1]}<span>${y}</span></h2>
  <table><thead><tr><th>Mo</th><th>Tu</th><th>We</th><th>Th</th><th>Fr</th><th>Sa</th><th>Su</th></tr></thead><tbody>${rows.join("")}</tbody></table>
  <p class="note">↑ last updated the Now note</p>
</section>`;
}

function receipt(d: Data) {
  const r = d.reading!;
  const rows = r.links.map((l) => `<li><a href="${esc(l.url)}">${esc(l.title)}</a>${l.by ? `<span class="by">${esc(l.by)}</span>` : ""}${l.note ? `<span class="note">${esc(l.note)}</span>` : ""}</li>`).join("");
  return `<section class="item receipt" data-id="reading" aria-label="Reading list">
  ${pin("blue")}
  <h2>Reading list</h2>
  ${r.intro ? `<p class="sub">${esc(r.intro)}</p>` : ""}
  <p class="meta">No. ${String(r.links.length).padStart(3, "0")} · all items keep</p>
  <ol class="fit" data-cap="${CAPS.reading}">${rows}</ol>
  <p class="total"><span>Items</span><span>${r.links.length}</span></p>
  <p class="thanks">Thank you, come again</p>
  <i class="barcode" aria-hidden="true"></i>
</section>`;
}

// The covers are filled in the browser from /reading/view.json (the reading sync), so books change
// without a rebuild. The card and its link open the whole shelf.
function nightstand() {
  return `<section class="item nightstand" data-id="books" aria-label="Reading now">
  <h2>On the nightstand <span data-books-count></span></h2>
  <div class="row" data-books><span class="wait">Fetching the shelf…</span></div>
  <button type="button" class="more" data-shelf aria-haspopup="dialog">See all my books →</button>
</section>`;
}

function contents(d: Data, h: H) {
  const rows = d.posts.map((p) => `<li><a ${p.link ? `href="${esc(p.link)}"` : `href="/writing/${esc(p.slug)}" data-essay="${esc(p.slug)}"`}><span class="ttl">${esc(p.title)}</span><span class="dots"></span><span class="date">${p.date.slice(0, 4)}</span></a>${p.blurb ? `<span class="blurb">${esc(p.blurb)}</span>` : ""}</li>`).join("");
  return `<section class="item toc" data-id="writing" aria-label="Writing">
  ${pin()}
  <h2>Writing</h2>
  <ol class="fit" data-cap="${CAPS.writing}">${rows}</ol>
</section>`;
}

function stapled(d: Data, h: H) {
  const items = d.research!.items.map((r) => `<li><span class="kind">${esc([r.kind, [r.venue, r.year].filter(Boolean).join(" ")].filter(Boolean).join(" · "))}</span>${r.url ? `<a href="${esc(r.url)}">${esc(r.title)}</a>` : `<span class="t">${esc(r.title)}</span>`}${r.authors ? `<span class="auth">${h.markMe(r.authors)}</span>` : ""}</li>`).join("");
  return `<section class="item stack" data-id="research" aria-label="Research">
  <i class="staple" aria-hidden="true"></i>
  <h2>Research</h2>
  <ol class="fit" data-cap="${CAPS.research}">${items}</ol>
</section>`;
}

function stamps(d: Data) {
  const tones = ["red", "blue", "green", "orange"];
  const links = d.site.social.filter((s) => !s.url.startsWith("mailto:"));
  if (!links.length) return "";
  const out = links.map((s, i) => `<a class="stamp ${tones[i % 4]}" href="${esc(s.url)}"><span>${esc(s.label)}</span></a>`).join("");
  return `<nav class="item stamps" data-id="stamps" style="--cols:${links.length === 3 ? 3 : links.length <= 4 ? 2 : 3}" aria-label="Elsewhere">${out}</nav>`;
}

function call(d: Data) {
  const e = email(d);
  if (!e) return "";
  return `<a class="item call" data-id="call" href="mailto:${esc(e)}" aria-label="Email ${esc(first(d))}">
  <span class="big"><i aria-hidden="true">☎</i> Call ${esc(first(d))}</span>
  <span class="small">${esc(e)}</span>
</a>`;
}

function postcard(d: Data, h: H) {
  if (!d.about.contact) return "";
  const lines = d.site.social.map((s) => `<li><a href="${esc(s.url)}">${esc(s.label)}</a></li>`).join("");
  return `<section class="item post" data-id="post" aria-label="Contact">
  ${pin()}
  <div class="msg"><h2>Say hello</h2><p class="fit" data-cap="${CAPS.post}">${h.inline(d.about.contact)}</p></div>
  <div class="addr"><i class="stamp" aria-hidden="true"></i><ul>${lines}</ul></div>
</section>`;
}

// Everything on the board, in paint order (later papers sit on top of earlier ones).
export function papers(d: Data, h: H): string {
  return [
    badge(d), letters(d), polaroid(d), strip(d), memo(d, h),
    d.now && bigNote(d, h), d.now && calendar(d), d.books && nightstand(), d.reading?.links.length && receipt(d),
    d.research?.items.length && stapled(d, h), d.posts.length && contents(d, h), stamps(d), call(d), postcard(d, h),
  ].filter(Boolean).join("\n");
}
