// 도시 기준 안전 — 도시에서 가까운 지진·재난을 거리로 계산.
import { quakes, disasters, BUILT_AT, countryAlarm, QUAKE_OK, GDACS_OK } from './load.js';
import { bySlug } from './countries.js';
import { CITIES } from './cities.js';

const R = 6371;
const rad = (d) => (d * Math.PI) / 180;
export function distKm(a, b) {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

export const QUAKE_KM = 300; // 지진: 반경 300km
// 재난 종류별 반경 — 태풍은 크고 빨리 움직여서 넓게 봄
export const DISASTER_KM = { TC: 800, EQ: 300, FL: 300, VO: 150, WF: 150, DR: 0 };

const DAY = 864e5;
const within = (t, days) => t && BUILT_AT - t <= days * DAY;

export function citySafety(city) {
  const qs = quakes
    .filter((q) => within(q.time, 30))
    .map((q) => ({ ...q, km: distKm(city, q) }))
    .filter((q) => q.km <= QUAKE_KM)
    .sort((a, b) => b.time - a.time);
  const ds = disasters
    .filter((d) => d.type !== 'DR' && within(d.to ?? d.from, 7) && d.lat != null)
    .map((d) => ({ ...d, km: distKm(city, d) }))
    .filter((d) => d.km <= (DISASTER_KM[d.type] ?? 300))
    .sort((a, b) => a.km - b.km);

  const q3 = qs.filter((q) => within(q.time, 3));
  const q7 = qs.filter((q) => within(q.time, 7));
  let level = 'calm';
  if (ds.some((d) => d.level === 'Red') || q3.some((q) => q.mag >= 6)) level = 'alert';
  else if (ds.length || q7.some((q) => q.mag >= 5.5) || q7.length >= 3) level = 'watch';

  const maxQ = qs.reduce((m, q) => (q.mag > (m?.mag ?? 0) ? q : m), null);
  const co = bySlug[city.country];
  return { level, quakes: qs, disasters: ds, maxQ, alarm: co ? countryAlarm(co) : null, ok: QUAKE_OK || GDACS_OK };
}

export const CITY_STATUS_NOTE = {
  alert: '도시 가까이에 큰 재난 소식이 있어요. 공식 안내를 꼭 확인하세요.',
  watch: '도시 가까이에서 최근 지진이나 재난 경보가 있었어요.',
  calm: '도시 가까이에 최근 큰 자연재난 소식이 없어요.',
};

// 나의 여행·비교 화면에서 쓰는 도시별 요약
export const cityLevels = Object.fromEntries(CITIES.map((c) => [c.slug, citySafety(c).level]));
