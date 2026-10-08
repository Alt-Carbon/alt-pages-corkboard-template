// npm run check:fit — after `npm run build`, opens the built board in Chrome at four window sizes and
// fails if any line of text is hidden: under another paper or a sticker, or off the screen. Papers
// whose content passes their height cap fade out on purpose ("+N more · tap to read all") and are
// listed, not failed. For long content everywhere: STRESS=1 npm run build && npm run check:fit
// Needs Google Chrome installed (playwright-core drives it; no browser is downloaded).
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";

const DIST = "dist";
const SIZES = [[1440, 900], [1280, 720], [1920, 1080], [1024, 768]];
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".xml": "application/xml" };

if (!existsSync(DIST)) { console.error("No dist/ yet: run npm run build first."); process.exit(2); }

// A static server that resolves /writing/x to writing/x.html, like the Worker's asset handling.
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const tries = [p, p + ".html", join(p, "index.html")].map((t) => join(DIST, t));
  const file = tries.find((t) => existsSync(t) && statSync(t).isFile());
  if (!file) { res.writeHead(404, { "content-type": "text/html" }); res.end(readFileSync(join(DIST, "404.html"))); return; }
  res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

const essays = [...readFileSync(join(DIST, "sitemap.xml"), "utf8").matchAll(/<loc>[^<]*?(\/writing\/[^<]+)<\/loc>/g)].map((m) => m[1]);
const paths = ["/", ...essays.slice(0, 1)]; // the board, and the board under an open essay

let failed = 0;
const browser = await chromium.launch({ channel: "chrome" });
try {
  for (const [w, h] of SIZES) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    for (const path of paths) {
      if (path !== "/") {
        // under an essay the board is meant to be covered: check the essay is open and nothing errored
        await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
        const open = await page.evaluate(() => { const s = document.getElementById("sheet"); return s.open && s.matches(":modal") && !!s.querySelector(".essay:not([hidden]) h1"); });
        failed += open ? errors.length : 1 + errors.length;
        console.log(`${open && !errors.length ? "✓" : "✗"} ${path} at ${w}×${h}: essay ${open ? "open" : "NOT open"}`);
        for (const e of errors.splice(0)) console.log(`    script error: ${e}`);
        continue;
      }
      await page.goto(`${base}${path}?check`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => window.__check, null, { timeout: 10000 });
      const r = await page.evaluate(() => window.__check);
      const bad = r.issues.length + errors.length;
      failed += bad;
      console.log(`${bad ? "✗" : "✓"} ${path} at ${w}×${h}: ${r.issues.length} lines hidden${r.clipped.length ? `, capped: ${r.clipped.join(", ")}` : ""}`);
      for (const i of r.issues) console.log(`    ${i.paper}: “${i.text}” under ${i.by}`);
      for (const e of errors.splice(0)) console.log(`    script error: ${e}`);
    }
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
process.exit(failed ? 1 : 0);
