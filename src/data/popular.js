// 인기 도시 순위 — 인천·김포·김해·제주 출발 국제선 여객편 수 (앞으로 7일) + 지난주와 비교
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
// 아직 다 모이지 않은 날(앞으로 7일의 마지막 날 등)은 비교에서 뺌 — 그날 전체 편수가 보통 날의 60% 미만이면 덜 모인 날
const DAY_TOTAL = Object.fromEntries(Object.entries(pop?.days || {}).map(([d, c]) => [d, Object.entries(c).reduce((s, [k, v]) => (k.startsWith('k:') ? s : s + v), 0)]));
const MED = (() => { const v = Object.values(DAY_TOTAL).sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : 0; })();
const fullDay = (d) => MED > 0 && DAY_TOTAL[d] >= MED * 0.6;

function sumRange(from, to, onlyFull = false) {
  const out = {};
  let n = 0;
  for (const [d, counts] of Object.entries(pop?.days || {})) {
    if (d < from || d > to) continue;
    if (onlyFull && !fullDay(d)) continue;
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
  // 증감 % 는 하루 평균끼리 비교 — 지난주 7일이 다 모였을 때만 보여 줌 (날 수가 다르면 숫자가 부풀려짐)
  const curF = sumRange(from, to, true);
  const prev = sumRange(pFrom, pTo, true);
  const total = Object.values(cur.out).reduce((a, b) => a + b, 0);
  const list = Object.entries(cur.out)
    .map(([key, flights]) => {
      const m = metaExtra[key] || pop.meta?.[key] || {};
      const before = prev.n >= 7 && curF.n >= 3 ? (prev.out[key] || 0) / prev.n : null;
      const after = curF.n ? (curF.out[key] || 0) / curF.n : 0;
      const change = before ? Math.round(((after - before) / before) * 100) : null;
      return { key, flights, ko: m.ko || key, city: m.city || null, iso: m.iso || '', change, share: total ? flights / total : 0 };
    })
    .sort((a, b) => b.flights - a.flights)
    .slice(0, limit);
  return { list, range: { from, to }, total };
}

// ── 공항별 직항 여행지 — 출발 공항별로 앞으로 7일 국제선 편수 ──
export const DEP_AIRPORTS = [
  { code: 'ICN', slug: 'icn', ko: '인천공항', area: '서울·수도권', lat: 37.46, lon: 126.44 },
  { code: 'GMP', slug: 'gmp', ko: '김포공항', area: '서울', lat: 37.56, lon: 126.8 },
  { code: 'PUS', slug: 'pus', ko: '김해공항', area: '부산·경남', lat: 35.18, lon: 128.94 },
  { code: 'CJU', slug: 'cju', ko: '제주공항', area: '제주', lat: 33.51, lon: 126.49 },
];
export const AP_READY = !!(pop && pop.apdays && Object.keys(pop.apdays).length);

export function airportCities(code) {
  if (!AP_READY) return { list: [], range: null, total: 0 };
  const now = Date.now();
  const from = kst(now), to = kst(now + 6 * 864e5);
  const out = {};
  let n = 0;
  for (const [d, byAp] of Object.entries(pop.apdays)) {
    if (d < from || d > to || !byAp[code]) continue;
    n++;
    for (const [k0, v] of Object.entries(byAp[code])) {
      if (k0.startsWith('k:')) continue;
      const c = norm(k0);
      if (c && c.domestic) continue;
      const k = c ? c.key : k0;
      if (c) metaExtra[k] = { ko: c.ko, city: c.city, iso: c.iso };
      out[k] = (out[k] || 0) + v;
    }
  }
  if (!n) return { list: [], range: null, total: 0 };
  const list = Object.entries(out)
    .map(([key, flights]) => {
      const m = metaExtra[key] || pop.meta?.[key] || {};
      return { key, flights, ko: m.ko || key, city: m.city || null, iso: m.iso || '' };
    })
    .sort((a, b) => b.flights - a.flights);
  return { list, range: { from, to }, total: list.reduce((a, b) => a + b.flights, 0) };
}
