# AGENTS.md

This repository is one person's website, made from the Alt Pages **Cork board** template: one cork board with every page a piece of paper pinned to it; visitors can drag the papers around. It is an Astro site served by a Cloudflare Worker, and Cloudflare builds and publishes it about two minutes after anything is pushed to `main`.

The owner is probably not a developer. Explain what you are about to change in plain words, change one thing at a time, show them the result, and ask before anything on the "ask first" list below.

## The rule that matters most: updates replace the code

Once a week (and whenever the owner presses Site updates → Update now in the editor), the site's Worker copies the latest version of the template into this repository as one commit. That replaces every file **except**:

- `content/`: the words, settings and the owner's own styles
- `public/media/`: photos and files
- `.github/`

(`wrangler.jsonc`, `package.json` and `package-lock.json` are merged, so the site keeps its own name and storage.)

So a change anywhere else, such as `src/`, `public/` or `scripts/`, is undone at the next update.

## Where each kind of change goes

| The owner wants | Change | Survives updates |
|---|---|---|
| Colours, fonts, sizes, spacing, hiding something | `content/custom.css` | Yes |
| Words, links, photos, which pages show | `content/*.json`, `content/writing/*.md`, or the editor at `/admin` | Yes |
| A setting the template already has (accent colour, …) | `content/site.json`, or the editor | Yes |
| A different layout or new behaviour | `src/` | **No**, see below |

If what they ask for needs `src/`, tell them, before you change anything, that the weekly update will undo it. Their choice is to keep updates (and lose the change), or turn updates off and keep the change: `"advanced": { "autoUpdate": false }` in `content/site.json`, or Site settings → Advanced → "Get improvements automatically" in the editor. Updates off means no more fixes from the template. Never turn them off without asking.

## content/custom.css

Every page loads it after the template's own styles (it is the first thing in `<body>`), so a rule here wins over the template's rule with the same selector. Prefer changing the variables below over rewriting the template's rules: it is shorter, and it keeps working when the template changes. Keep the file small and add a short comment above each change, so the owner can read it. Emptying the file brings back the template's look.

Example:

```css
/* A sage wall and a darker cork */
:root { --wall: #c9d6c3; --tint-a: .4; }
```

## Cork board: what you can change

Files: `src/layouts/Board.astro` (the page), `src/board/board.css` (the board and papers), `src/board/papers.ts` (which paper shows what), `src/board/layout.json` (where each paper sits).

### Colours

| Variable | What it colours |
|---|---|
| `--wall` | the wall around the board (also Site settings) |
| `--tint-a` | how dark the cork is, 0 to 1 (also Site settings → Cork) |
| `--paper`, `--paper-2`, `--card` | the papers |
| `--ink`, `--mute` | text, and secondary text |
| `--rule`, `--red-rule`, `--blue-rule` | lines, and the notebook paper's margin and ruled lines |
| `--accent` | pushpins, link underlines, focus rings (Site settings → Accent colour) |
| `--yellow`, `--green`, `--pink` | sticky notes |
| `--gold`, `--red`, `--blue`, `--leaf`, `--orange`, `--magenta` | pins, tape and stickers |
| `--shadow`, `--shadow-lift` | a paper's shadow, and while it is lifted |

### Type

`--font-display` (headings; a serif), `--font-text`, `--font-ui`, `--hand` (the handwriting). Sizes are `--fs-*` steps.

### Parts of the page

`.sheet`, `.memo`, `.polaroid`, `.receipt`, `.cal`, `.letters`, `.post`, `.bignote` the kinds of paper · `.pin`, `.tape`, `.stamp`, `.deco` decorations · `.essay` a piece of writing on its own page (`/writing/<name>`)

## Ask first, or leave alone

- `wrangler.jsonc`: the Worker's name, storage ids and routes. Changing them breaks the site or loses the owner's data.
- `src/worker/`: sign-in for the editor, the reading and posts sync, the weekly update.
- `public/admin/` (the editor) and `scripts/prepare.mjs` (writes the editor's settings at build time).
- Never commit passwords, tokens or keys.
- Moving papers means `src/board/layout.json`, which is a template file: an update puts them back. Run `npm run check:fit` after changing papers or their sizes.


## Check your work

```sh
npm ci
npm run build   # runs scripts/prepare.mjs first; must succeed, or Cloudflare won't publish
npm test
npm run dev     # look at it; it prints the address
```

The shape of every content file is in `src/content.config.ts`. A build that fails on Cloudflare leaves the live site as it was, but tell the owner.

## Publishing

Pushing to `main` publishes. For anything bigger than a small style change, work on a branch, show the owner screenshots from `npm run dev`, and merge when they are happy. If Cloudflare is set to build other branches, it also gives each branch its own preview address.
