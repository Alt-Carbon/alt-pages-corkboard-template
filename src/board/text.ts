// Text the board draws in two places: at build time (papers.ts) and in the browser (board.js), when
// the editor's preview types a new name or greeting into the board while the owner edits.

// The first name on the name tag: as large as fits the badge.
export const nameSize = (first: string) => Math.min(44, Math.floor(270 / (0.48 * Math.max(first.length, 1))));

// The greeting as letter stickers. Tiles shrink to keep it within ~450px; a very long one wraps onto a second row.
export function greetingTiles(g: string, esc: (s: string) => string) {
  const palette = ["gold", "red", "blue", "green", "orange", "pink"];
  let i = 0;
  const html = [...g].map((ch) => {
    if (ch === " ") return '<i class="sp"></i>';
    if (!/[\p{L}\p{N}]/u.test(ch)) return `<i class="pt">${esc(ch)}</i>`;
    const t = `<b class="${palette[i % 6]}" style="--t:${((i * 7) % 11) - 5}deg">${esc(ch)}</b>`;
    i++;
    return t;
  }).join("");
  const n = [...g].filter((c) => /[\p{L}\p{N}]/u.test(c)).length + 0.4 * (g.split(" ").length - 1);
  let tile = Math.min(40, Math.floor(440 / Math.max(n, 1)) - 4);
  if (tile < 24) tile = Math.max(22, Math.min(32, Math.floor(880 / Math.max(n, 1)) - 4));
  return { html, tile };
}
