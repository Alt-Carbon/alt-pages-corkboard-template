// Long content in every field, for the fit check: STRESS=1 npm run build, then open the board with ?check.
// Not real data and never published.
import type { Data } from "../board/papers";

export function stress(d: Data): Data {
  const twice = <T>(a: T[]) => [...a, ...a];
  return {
    ...d,
    site: { ...d.site, name: "Annapurna Venkataraghavan", greeting: "Hi, I am Annapurna Venkataraghavan",
      oneLiner: "I lead soil carbon measurement, field sampling logistics and the lab data pipeline for enhanced rock weathering trials across three states.",
      social: [...d.site.social, { label: "Instagram", url: "https://example.com" }, { label: "Mastodon", url: "https://example.com" }] },
    about: { ...d.about, paragraphs: twice(d.about.paragraphs), experience: twice(d.about.experience), contact: `${d.about.contact} ${d.about.contact}` },
    now: d.now && { ...d.now, groups: d.now.groups.map((g) => ({ ...g, items: twice(g.items) })) },
    reading: d.reading && { ...d.reading, links: twice(d.reading.links) },
    research: d.research && { ...d.research, items: twice(d.research.items) },
    posts: [...d.posts, ...d.posts.map((p) => ({ ...p, slug: p.slug + "-2", title: `${p.title}: a much longer second part about the same thing` }))],
  };
}
