// 사이트를 만들 때(빌드) 한 번 불러오는 자료.
// 보관함(src/data/archive/*.json) + 지금 공식 데이터를 합침. 불러오기 실패하면 보관함만 씀.
import quakeArchive from './archive/quakes.json';
import disasterArchive from './archive/disasters.json';
import { USGS_MONTH, gdacsUrl, normQuake, normDisaster, mergeById, getJson } from './normalize.js';
import { COUNTRIES, slugFromIso3 } from './countries.js';
import { countryOf } from './place.js';

let fresh = [];
try {
  const j = await getJson(USGS_MONTH);
  fresh = (j.features || []).map(normQuake);
} catch (e) {
  console.warn('[로밍고] USGS 불러오기 실패, 보관함만 씀:', e.message);
}

let freshD = [];
try {
  const j = await getJson(gdacsUrl());
  freshD = (j.features || []).map(normDisaster);
} catch (e) {
  console.warn('[로밍고] GDACS 불러오기 실패, 보관함만 씀:', e.message);
}

export const BUILT_AT = Date.now();

// 규모 4.5 이상 전부 (최근 30일 + 보관함의 큰 지진)
export const quakes = mergeById(quakeArchive, fresh).map((q) => ({
  ...q,
  country: countryOf(q.place)?.slug || null,
}));

// 페이지를 따로 만드는 큰 지진 (규모 5 이상)
export const bigQuakes = quakes.filter((q) => q.mag >= 5);

export const disasters = mergeById(disasterArchive, freshD, 'from').map((d) => ({
  ...d,
  countries: [...new Set(d.iso3.map(slugFromIso3).filter(Boolean))],
}));

const DAY = 864e5;
const within = (t, days) => t && BUILT_AT - t <= days * DAY;

// 지금 진행 중이거나 7일 안에 끝난 경보
export const activeDisasters = disasters.filter((d) => within(d.to ?? d.from, 7));

// 나라별 상태 — 자연재난 기준
export function countryStatus(slug) {
  const qs = quakes.filter((q) => q.country === slug);
  const ds = disasters.filter((d) => d.countries.includes(slug));
  const act = ds.filter((d) => within(d.to ?? d.from, 7));
  const q3 = qs.filter((q) => within(q.time, 3));
  const q7 = qs.filter((q) => within(q.time, 7));
  const q30 = qs.filter((q) => within(q.time, 30) && q.mag >= 5);

  let level = 'calm';
  if (act.some((d) => d.level === 'Red') || q3.some((q) => q.mag >= 6.5)) level = 'alert';
  else if (act.length || q7.some((q) => q.mag >= 6) || q7.filter((q) => q.mag >= 5).length >= 3) level = 'watch';

  const maxQ = q30.reduce((m, q) => (q.mag > (m?.mag ?? 0) ? q : m), null);
  return { level, quakes: qs, disasters: ds, active: act, count30: q30.length, maxQ, latest: qs[0] || null };
}

export const STATUS_KO = {
  alert: { label: '재난 경보', note: '큰 재난 소식이 있어요. 아래 내용과 공식 안내를 꼭 확인하세요.' },
  watch: { label: '주의', note: '최근 지진이나 재난 경보가 있었어요. 여행 지역과 가까운지 확인하세요.' },
  calm: { label: '큰 재난 없음', note: '최근 7일 동안 큰 자연재난 소식이 없어요.' },
};

export const countryCards = COUNTRIES.map((c) => ({ ...c, st: countryStatus(c.slug) }));
