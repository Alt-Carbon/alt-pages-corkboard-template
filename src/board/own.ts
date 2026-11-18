// Your pages on the board: the ones switched on, in title order, one per slot in layout.json
// (page1, page2, ...). The board has room for four; the rest are left out, with a note in the build log.
import layout from "./layout.json";
import { ownPages } from "../lib/content";

export const SLOTS = Object.keys(layout.items).filter((k) => /^page\d+$/.test(k)).length;

// Worked out once per build (the board is built once per address), so each note is said once.
let found: ReturnType<typeof pick> | undefined;
async function pick() {
  const on = (await ownPages()).filter((p) => p.data.show);
  for (const p of on.slice(SLOTS)) console.warn(`content/pages/${p.id}.md: the cork board has room for ${SLOTS} of your pages; this one is left out.`);
  return on.slice(0, SLOTS);
}
export const pagesOnBoard = () => (found ??= pick());
