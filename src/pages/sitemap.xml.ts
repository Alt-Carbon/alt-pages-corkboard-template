// The board, every essay and your pages on the board, for search engines. Pieces published elsewhere,
// and anything switched off, are left out.
import type { APIRoute } from "astro";
import { pagesOnBoard } from "../board/own";
import { freshness, origin, shown, writing } from "../lib/content";

export const GET: APIRoute = async ({ url }) => {
  const base = origin(url);
  const posts = (await shown()).has("writing") ? await writing() : [];
  const fresh = await freshness();
  const day = (d: Date) => d.toISOString().slice(0, 10);
  const urls: [string, string | undefined][] = [
    ["/", fresh.date],
    ...posts.filter((p) => !p.data.link).map((p): [string, string] => [`/writing/${p.id}`, day(p.data.date)]),
    ...(await pagesOnBoard()).map((p): [string, undefined] => [`/${p.id}`, undefined]),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([path, mod]) => `<url><loc>${base}${path}</loc>${mod ? `<lastmod>${mod}</lastmod>` : ""}</url>`).join("\n")}
</urlset>`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
};
