# alt-pages-corkboard-template

A personal website that is one cork board. Everything you'd put on a personal site is pinned to it as a kind of paper: a name badge, a polaroid, a typed memo, a Now note, a reading receipt, a contents sheet of your writing, a stapled stack of research, a postcard. Click any paper and it lifts off the board to read. Edited at `/admin` with Sveltia CMS, built with Astro, hosted as a Cloudflare Worker. MIT licensed.

It reads the same `content/` files as the Sidebar template (`alt-pages-minimal-template`), so a site can switch between the two without retyping anything.

## Run it locally

```
npm install
npm run dev        # http://localhost:4321
npm run build      # writes dist/
npm run preview    # serves dist/ the way Cloudflare will, at http://localhost:8787
npm test           # parser tests, no network
npm run check:fit  # after a build: is any text on the board hidden? (needs Google Chrome)
```

`npm run dev` and `npm run build` first run `scripts/prepare.mjs`, which reads the repository name from git, writes the editor's configuration to `public/admin/config.yml`, and writes the Goodreads profile id to `public/reading/config.json`. None of these are committed.

## Deploy

`wrangler.jsonc` describes the Worker: the built pages as static assets, the reading sync script, a KV namespace, a Durable Object and a 12-hour cron. `npm run deploy` builds and deploys to whichever Cloudflare account wrangler is logged into.

## The board

The board is 1600 × 1000 and scaled to fit the window, so nothing scrolls. The cork hangs on a wall; papers may hang over its edges and overlap a little at their corners, but never over each other's words. On phones it becomes one column of the same papers, without stickers.

Every content type is always the same kind of paper, so the editor never asks about layout:

| Content | On the board |
| --- | --- |
| Name, one-liner, employer, place (`site.json`, `about.json` facts) | A "Hello, my name is" badge |
| Greeting (`site.json`) | Letter stickers along the top |
| Photo (`site.json`) | A polaroid and a photobooth strip |
| About (`about.json`) | A typed memo: paragraphs, then work |
| Now (`now.json`) | One big sticky note, and a calendar with the updated day circled |
| Writing (`content/writing/*.md`) | A contents sheet. A title opens the essay as a sheet over the board; pieces published elsewhere link out |
| Reading links (`reading.json`) | A till receipt. Notes show when it's lifted |
| Books (Goodreads, through the reading sync) | The nightstand card: four books being read. It opens the whole shelf |
| Research (`research.json`) | A stapled stack; your own name in bold |
| Contact and social links (`about.json`, `site.json`) | A "Call me" sticker for email, a sheet of stamps, and a postcard |

A section that is off or empty (Now off, no research, Reading off) is simply not pinned.

Site settings has three board controls: **Wall colour**, **Cork** (natural, warm or dark) and **Accent colour**, which colours the pushpins.

Where each paper sits, the stickers and tapes, and how tall each paper may grow are in `src/board/layout.json`, edited by hand for now. There is no visual editor yet; an earlier prototype had one, and it will come back when it can save to the repository.

## Fitting any content

Papers whose content grows (the memo, Now note, receipt, contents sheet, research stack and postcard) have a height cap in `layout.json` → `caps`. Past it the text fades out with a "+N more · tap to read all" tag, and lifting the paper shows all of it. The name badge's one-liner stops at two lines, a long greeting shrinks and then wraps, and more than four social links become a three-wide sheet of stamps.

`npm run check:fit` proves it. It serves `dist/`, opens the board in Chrome at 1440×900, 1280×720, 1920×1080 and 1024×768, tests every line of text for whether anything covers it or it is off the screen, and exits non-zero if so. `STRESS=1 npm run build` builds the same board with long content everywhere (doubled paragraphs and lists, long titles, a long name, six social links) to run the check against. In a browser, add `?check` to the address to see the same report on the page, with problems outlined in red.

## Search and link previews

Nothing to fill in: the build makes all of it from the content.

- Every essay has its own address, `/writing/<slug>`: the board with that essay open. Titles, descriptions (an essay without a blurb gets the opening of its first paragraph), canonical links, Open Graph tags and structured data come from the content.
- A 1200×630 preview card for the board and each essay under `/og/`, a favicon and an Apple touch icon (`src/lib/cards.ts`).
- `/rss.xml` (full text), `/sitemap.xml` and `/robots.txt`.

The site's address isn't known at build time, so these carry `https://__origin__` and the Worker replaces it with the address the visitor used. Set Advanced → Site address in the editor only if previews show the wrong address.

## Reading sync

`src/worker/` is the site's Worker, unchanged from the Sidebar template. It reads the public Goodreads shelves named in `content/site.json` on a schedule, keeps them in KV, and serves them at `/reading/view.json` with covers under `/reading/covers/`. With no profile set, the sample shelf in `public/reading/view.json` is served. The nightstand card and the shelf that opens from it are drawn in the browser from that JSON, so books change without a rebuild. The shelf uses the style picked under Site settings → Bookshelf style.

## Layout

| Path | What |
| --- | --- |
| `src/pages/` | `/` (the board), `/writing/<slug>` (the board with an essay open), 404, and the generated `/rss.xml`, `/sitemap.xml`, `/robots.txt`, `/favicon.svg`, `/apple-touch-icon.png`, `/og/*.png` |
| `src/layouts/Board.astro` | The page: head, the board, the essay sheet, the shelf dialog |
| `src/board/papers.ts` | One function per kind of paper, returning its HTML |
| `src/board/layout.json` | Positions, stickers and height caps |
| `src/board/board.css` | The board's whole stylesheet |
| `src/board/board.js` | Places papers and stickers, fits the board to the window, caps, lifting, essays, the nightstand, the `?check` report |
| `src/components/Shelf.astro`, `src/scripts/shelf/`, `src/styles/shelf/` | The bookshelf, shared with the Sidebar template |
| `src/lib/` | Content schemas, the loader, accent colours, the preview-card renderer, the stress content |
| `src/worker/` | The reading sync and the address stamping for pages and feeds |
| `public/board/` | The cork (ambientCG Cork002, CC0) and Alt Carbon's stickers |
| `scripts/check-fit.mjs` | The fit check |
| `test/` | Parser and sync tests |

## Not yet

- **Arranging the board yourself.** Positions and stickers live in `layout.json`. A drag-and-drop mode existed in the prototype; it returns once it can commit the result to your repository.
- **Your own stickers** beyond the built-in set.
- **Crisper brand stickers.** The Alt Carbon stickers were taken from an animated GIF in the brand guidelines and have a 256-colour palette; the original files would replace them.

## Credits

Cork texture: [ambientCG](https://ambientcg.com) Cork002, CC0. Stickers: Alt Carbon's merch designs, from the brand guidelines. Fonts: Geist and EB Garamond (OFL) for text, Caveat (OFL) for handwriting.
