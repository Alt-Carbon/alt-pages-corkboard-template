// Long content in every field, for the fit check: STRESS=1 npm run build, then open the board with ?check.
// Not real data and never published.
import type { Data } from "../board/papers";
import layout from "../board/layout.json";

const SLOTS = Object.keys(layout.items).filter((k) => /^page\d+$/.test(k)).length;

export function stress(d: Data): Data {
  const twice = <T>(a: T[]) => [...a, ...a];
  return {
    ...d,
    site: { ...d.site, name: "Annapurna Venkataraghavan", greeting: "Hi, I am Annapurna Venkataraghavan",
      oneLiner: "I lead soil carbon measurement, field sampling logistics and the lab data pipeline for enhanced rock weathering trials across three states.",
      social: [...d.site.social, { label: "Instagram", url: "https://example.com" }, { label: "Mastodon", url: "https://example.com" }] },
    about: d.about && { ...d.about, paragraphs: twice(d.about.paragraphs), experience: twice(d.about.experience), contact: `${d.about.contact} ${d.about.contact}` },
    now: d.now && { ...d.now, groups: d.now.groups.map((g) => ({ ...g, items: twice(g.items) })) },
    reading: d.reading && { ...d.reading, links: twice(d.reading.links) },
    research: d.research && { ...d.research, items: twice(d.research.items) },
    // every slot for your pages filled, each with a long title and more text than its cap
    pages: Array.from({ length: SLOTS }, (_, i) => d.pages[i] ? { ...d.pages[i]!, html: d.pages[i]!.html.repeat(4) } : {
      slug: `stress-${i + 1}`, title: `Field notes from the basalt trials, part ${i + 1}`, photo: i % 2 ? "" : "/board/placeholder.svg",
      html: "<p>Every season we spread crushed rock on a few hundred hectares and measure what the soil does with it. These notes are what I wish I had read before the first one.</p><ul><li>Sampling plans that survive the monsoon</li><li>Forms that work offline</li><li>What the lab needs from the field</li></ul>".repeat(2),
    }),
    posts: [...d.posts, ...d.posts.map((p) => ({ ...p, slug: p.slug + "-2", title: `${p.title}: a much longer second part about the same thing` }))],
  };
}
