// 나라·도시 대표 사진 — Unsplash API (키: GitHub 비밀 칸 UNSPLASH_KEY)
// 규칙: 사진은 Unsplash 주소 그대로 불러 쓰고(hotlink), 고를 때 download 주소를 한 번 호출, 작가·Unsplash 표시.
// 처음 키는 시간당 50번 제한 → 한 번에 MAX 곳만 (사진 1곳 = 2번 호출).
import { COUNTRIES } from '../src/data/countries.js';
import { CITIES } from '../src/data/cities.js';
import { PHOTO_PICK } from '../src/data/photo-pick.js';
import { GUIDES } from '../src/data/guides.js';

const API = 'https://api.unsplash.com';
const MAX = 12; // 한 곳에 검색 최대 3번 + download 1번 → 12곳이면 시간당 50번 안
// 사람이 크게 나온 사진은 피함
const PEOPLE = /\b(man|men|woman|women|person|people|girl|boy|portrait|couple|child|kid|selfie|model|face)\b/i;

export function photoTargets() {
  // 순서 = 받는 순서: 나라 → 가이드 도시 → 가이드 관광지 → 나머지 도시
  const gset = new Set(GUIDES.map((g) => g.city));
  return [
    ...COUNTRIES.map((c) => ({ key: `country:${c.slug}`, q: c.photoQ })),
    ...CITIES.filter((c) => gset.has(c.slug)).map((c) => ({ key: `city:${c.slug}`, q: c.photoQ })),
    ...GUIDES.flatMap((g) => (g.spots || []).map((sp, i) => ({ key: `spot:${g.city}:${i}`, q: sp.q }))),
    ...CITIES.filter((c) => !gset.has(c.slug)).map((c) => ({ key: `city:${c.slug}`, q: c.photoQ })),
  ].filter((t) => t.q);
}

async function api(path, key) {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text().then((t) => t.slice(0, 120))}`);
  return res.json();
}

function slim(p) {
  return {
    id: p.id,
    raw: p.urls.raw,
    color: p.color || '#8aa',
    alt: (p.alt_description || p.description || '').slice(0, 140),
    name: p.user?.name || '',
    userUrl: p.user?.links?.html || 'https://unsplash.com',
    page: p.links?.html || 'https://unsplash.com',
  };
}

// 다시 찾을 말 — 원래 말 → 앞 두 낱말 → (관광지면) 그 도시 대표 사진 말
function fallbacks(t) {
  const out = [t.q];
  const w = t.q.split(/\s+/);
  if (w.length > 2) out.push(w.slice(0, 2).join(' '));
  const m = t.key.match(/^spot:([^:]+):/);
  const city = m && CITIES.find((c) => c.slug === m[1]);
  if (city?.photoQ) out.push(city.photoQ);
  else if (t.key.startsWith('city:')) out.push(w[0]);
  return [...new Set(out)];
}

// 하나 고르기: PHOTO_PICK 에 사진 id 가 있으면 그것, 숫자면 n번째 후보, 없으면 첫 후보
async function pickOne(t, key) {
  const want = PHOTO_PICK[t.key];
  let p;
  if (typeof want === 'string') {
    p = await api(`/photos/${encodeURIComponent(want)}`, key);
  } else {
    // 검색 결과가 없으면 더 짧은 말로 다시 (예: 'Fish Eye Marine Park Guam' → 'Fish Eye Marine' → 도시 이름)
    let list = [];
    for (const query of fallbacks(t)) {
      const q = new URLSearchParams({ query, orientation: 'landscape', per_page: '20', content_filter: 'high' });
      const j = await api(`/search/photos?${q}`, key);
      const ok = (j.results || []).filter((r) => !PEOPLE.test(`${r.alt_description || ''} ${r.description || ''}`));
      list = ok.length ? ok : j.results || [];
      if (list.length) break;
    }
    p = list[Math.max(0, Math.min(typeof want === 'number' ? want : 0, list.length - 1))];
    if (!p) throw new Error('사진 없음 (다시 찾은 말까지 결과 0개)');
  }
  // 고른 사진의 download 주소 호출 (Unsplash 규칙)
  await api(`/photos/${encodeURIComponent(p.id)}/download`, key).catch(() => {});
  return { ...slim(p), pick: want ?? 0 };
}

// miss: 실패한 곳 기록 { key: { n: 실패 횟수, at: 마지막 시각, e: 이유 } } — live/photo-miss.json (사이트를 다시 만들지 않는 폴더)
// 실패한 곳은 횟수만큼 하루씩 미뤄서(최대 7일), 같은 곳이 매번 자리를 차지해 다른 곳이 밀리지 않게.
export async function fetchPhotos(key, old, miss = {}) {
  const out = { ...old };
  const now = Date.now();
  // 아직 없거나, PHOTO_PICK 이 바뀐 곳만 (최근에 실패한 곳은 잠시 건너뜀)
  const todo = photoTargets().filter((t) => {
    const cur = out[t.key];
    const want = PHOTO_PICK[t.key] ?? 0;
    if (cur && cur.pick === want) return false;
    const f = miss[t.key];
    if (f && now - f.at < Math.min(f.n, 7) * 864e5) return false;
    return true;
  });
  if (!todo.length) return { out, done: 0, left: 0 };
  let done = 0;
  for (const t of todo.slice(0, MAX)) {
    try {
      out[t.key] = await pickOne(t, key);
      done++;
      delete miss[t.key];
      console.log(`  사진 ${t.key} → ${out[t.key].name}`);
    } catch (e) {
      console.warn(`  사진 ${t.key} 실패:`, e.message);
      if (/HTTP 403|HTTP 429/.test(e.message)) break; // 시간당 한도 — 실패로 세지 않음
      miss[t.key] = { n: (miss[t.key]?.n || 0) + 1, at: now, e: e.message.slice(0, 120) };
    }
  }
  return { out, done, left: todo.length - done, miss };
}
