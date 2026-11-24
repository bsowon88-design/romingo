// 나라·도시 대표 사진 — Unsplash API (키: GitHub 비밀 칸 UNSPLASH_KEY)
// 규칙: 사진은 Unsplash 주소 그대로 불러 쓰고(hotlink), 고를 때 download 주소를 한 번 호출, 작가·Unsplash 표시.
// 처음 키는 시간당 50번 제한 → 한 번에 MAX 곳만 (사진 1곳 = 2번 호출).
import { COUNTRIES } from '../src/data/countries.js';
import { CITIES } from '../src/data/cities.js';
import { PHOTO_PICK } from '../src/data/photo-pick.js';
import { GUIDES } from '../src/data/guides.js';

const API = 'https://api.unsplash.com';
const MAX = 20;
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

// 하나 고르기: PHOTO_PICK 에 사진 id 가 있으면 그것, 숫자면 n번째 후보, 없으면 첫 후보
async function pickOne(t, key) {
  const want = PHOTO_PICK[t.key];
  let p;
  if (typeof want === 'string') {
    p = await api(`/photos/${encodeURIComponent(want)}`, key);
  } else {
    const q = new URLSearchParams({ query: t.q, orientation: 'landscape', per_page: '20', content_filter: 'high' });
    const j = await api(`/search/photos?${q}`, key);
    const ok = (j.results || []).filter((r) => !PEOPLE.test(`${r.alt_description || ''} ${r.description || ''}`));
    const list = ok.length ? ok : j.results || [];
    p = list[Math.min(typeof want === 'number' ? want : 0, list.length - 1)];
    if (!p) throw new Error('사진 없음');
  }
  // 고른 사진의 download 주소 호출 (Unsplash 규칙)
  await api(`/photos/${encodeURIComponent(p.id)}/download`, key).catch(() => {});
  return { ...slim(p), pick: want ?? 0 };
}

export async function fetchPhotos(key, old) {
  const out = { ...old };
  // 아직 없거나, PHOTO_PICK 이 바뀐 곳만
  const todo = photoTargets().filter((t) => {
    const cur = out[t.key];
    const want = PHOTO_PICK[t.key] ?? 0;
    return !cur || cur.pick !== want;
  });
  if (!todo.length) return { out, done: 0, left: 0 };
  let done = 0;
  for (const t of todo.slice(0, MAX)) {
    try {
      out[t.key] = await pickOne(t, key);
      done++;
      console.log(`  사진 ${t.key} → ${out[t.key].name}`);
    } catch (e) {
      console.warn(`  사진 ${t.key} 실패:`, e.message);
      if (/HTTP 403|HTTP 429/.test(e.message)) break; // 시간당 한도
    }
  }
  return { out, done, left: todo.length - done };
}
