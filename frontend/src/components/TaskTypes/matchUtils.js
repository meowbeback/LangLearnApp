export function parseMatchPairsFromQuestionText(text) {
  if (!text || typeof text !== 'string') return null;
  const paren = text.match(/\(\s*([^)]+)\)/);
  if (!paren) return null;
  let inner = paren[1].replace(/^\s*формат\s+ответа\s*:\s*/i, '').trim();
  const parts = inner.split(',').map((s) => s.trim()).filter(Boolean);
  const pairs = [];
  for (const p of parts) {
    const bits = p.split('|').map((x) => x.trim());
    if (bits.length === 2 && bits[0] && bits[1]) pairs.push(bits);
  }
  if (!pairs.length) return null;
  const left = pairs.map((x) => x[0]);
  const right = pairs.map((x) => x[1]).sort((a, b) => a.localeCompare(b, 'ru'));
  return { left, right };
}
