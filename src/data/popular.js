// 인기 도시 순위 — 인천공항 출발 여객편 수 (앞으로 7일) + 지난주와 비교
import pop from './archive/popular.json';
import { cityKeyOf, AIRPORTS } from './airports.js';
const BY_NAME = {};
for (const [code, a] of Object.entries(AIRPORTS)) if (a[0] && !BY_NAME[a[1]]) BY_NAME[a[1]] = code;

// 예전에 모르는 공항(x:코드)으로 저장된 것은 지금 목록으로 다시 묶음, 국내선은 뺌
function norm(key) {
  if (key.startsWith('k:')) return null;
  if (key.startsWith('x:')) return cityKeyOf(key.slice(2));
  if (key.startsWith('n:') && BY_NAME[key.slice(2)]) return cityKeyOf(BY_NAME[key.slice(2)]);
  return null;
}

const kst = (t) => new Date(t + 9 * 36e5).toISOString().slice(0, 10);

export const POP_READY = !!(pop && pop.days && Object.keys(pop.days).length);
export const POP_CHECKED = pop?.checked || null;

const metaExtra = {};
function sumRange(from, to) {
  const out = {};
  let n = 0;
  for (const [d, counts] of Object.entries(pop?.days || {})) {
    if (d < from || d > to) continue;
    n++;
    for (const [k0, v] of Object.entries(counts)) {
      if (k0.startsWith('k:')) continue;
      const c = norm(k0);
      if (c && c.domestic) continue;
      const k = c ? c.key : k0;
      if (c) metaExtra[k] = { ko: c.ko, city: c.city, iso: c.iso };
      out[k] = (out[k] || 0) + v;
    }
  }
  return { out, n };
}

export function popularCities(limit = 30) {
  if (!POP_READY) return { list: [], range: null };
  const now = Date.now();
  const from = kst(now), to = kst(now + 6 * 864e5);
  const pFrom = kst(now - 7 * 864e5), pTo = kst(now - 1 * 864e5);
  const cur = sumRange(from, to);
  const prev = sumRange(pFrom, pTo);
  const total = Object.values(cur.out).reduce((a, b) => a + b, 0);
  const list = Object.entries(cur.out)
    .map(([key, flights]) => {
      const m = metaExtra[key] || pop.meta?.[key] || {};
      const before = prev.n >= 5 ? prev.out[key] || 0 : null;
      const change = before ? Math.round(((flights - before) / before) * 100) : null;
      return { key, flights, ko: m.ko || key, city: m.city || null, iso: m.iso || '', change, share: total ? flights / total : 0 };
    })
    .sort((a, b) => b.flights - a.flights)
    .slice(0, limit);
  return { list, range: { from, to }, total };
}
