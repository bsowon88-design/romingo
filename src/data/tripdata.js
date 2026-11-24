// 나의 여행·도시 비교 화면이 쓰는 도시별 요약 (화면에 JSON 으로 넣음)
import { CITIES, SEOUL } from './cities.js';
import { bySlug, flagOf } from './countries.js';
import { countryAlarm, countryRate } from './load.js';
import { citySafety, distKm } from './near.js';
import { guideByCity } from './guides.js';
import { climateOf, travelScore, scoreLabel, rainInfo } from './weather.js';

// 서울에서 직선거리로 어림한 비행시간 (분)
export const flightMin = (c) => Math.round((distKm(SEOUL, c) / 780) * 60 + 30);

export const TRIP_DATA = Object.fromEntries(
  CITIES.map((c) => {
    const co = bySlug[c.country];
    const s = citySafety(c);
    const al = countryAlarm(co);
    const cl = climateOf(c.slug);
    const rate = countryRate(co);
    return [
      c.slug,
      {
        ko: c.ko,
        co: co.ko,
        cs: co.slug,
        f: flagOf(co),
        tz: co.tz,
        g: !!guideByCity[c.slug],
        lv: s.level,
        q: s.quakes.length,
        d: s.disasters.length,
        al: al && al.max ? [al.max, al.levels.every((l) => /일부/.test(l.region))] : null,
        rate: rate ? [rate.line1, rate.line2, rate.date] : null,
        fm: flightMin(c),
        volt: co.volt,
        plug: co.plug,
        m: cl
          ? cl.m.map((d) => {
              const sc = scoreLabel(travelScore(d));
              return [Math.round(d.hi), Math.round(d.lo), Math.round(d.rain), sc.cls, sc.label, rainInfo(d).label];
            })
          : null,
      },
    ];
  }),
);

// 고르기 쉬운 순서: 나라별로 묶음
export const CITY_GROUPS = (() => {
  const g = new Map();
  for (const c of CITIES) {
    const co = bySlug[c.country];
    if (!g.has(co.slug)) g.set(co.slug, { ko: co.ko, cities: [] });
    g.get(co.slug).cities.push({ slug: c.slug, ko: c.ko });
  }
  return [...g.values()];
})();
