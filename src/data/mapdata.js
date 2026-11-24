// 재난 지도 — 사이트를 만들 때 SVG 로 그림 (바깥 지도 서비스 안 씀)
// 나라 모양: Natural Earth (퍼블릭 도메인) / world-atlas
import { geoMercator, geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import world110 from 'world-atlas/countries-110m.json';
import world50 from 'world-atlas/countries-50m.json';
import countries from 'i18n-iso-countries';
import alarmArchive from './archive/alarms.json';
import { quakes, activeDisasters, BUILT_AT } from './load.js';
import { CITIES } from './cities.js';
import { guideByCity } from './guides.js';

const DAY = 864e5;
const alarmOf = (numId) => {
  const a2 = countries.numericToAlpha2(String(numId).padStart(3, '0'));
  const a = a2 && alarmArchive?.[a2];
  return a && a.max ? a.max : 0;
};

function build(view) {
  const asia = view === 'asia';
  const W = 1000;
  const H = asia ? 640 : 520;
  const topo = asia ? world50 : world110;
  const geo = feature(topo, topo.objects.countries);
  const proj = asia
    ? geoMercator().clipExtent([[0, 0], [W, H]]).fitExtent([[0, 0], [W, H]], {
        type: 'MultiPoint',
        coordinates: [[68, 47], [158, -10]],
      })
    : geoNaturalEarth1().fitExtent([[4, 4], [W - 4, H - 4]], { type: 'Sphere' });
  const path = geoPath(proj).digits(0);

  const lands = geo.features
    .filter((f) => f.id !== '010') // 남극
    .map((f) => ({ d: path(f), lv: alarmOf(f.id) }))
    .filter((x) => x.d);

  const inView = ([x, y]) => x >= -5 && x <= W + 5 && y >= -5 && y <= H + 5;
  const qs = quakes
    .filter((q) => BUILT_AT - q.time <= 30 * DAY)
    .map((q) => {
      const p = proj([q.lon, q.lat]);
      return p && inView(p) ? { ...q, x: Math.round(p[0]), y: Math.round(p[1]), recent: BUILT_AT - q.time <= 7 * DAY } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.mag - b.mag);
  const ds = activeDisasters
    .map((d) => {
      const p = proj([d.lon, d.lat]);
      return p && inView(p) ? { ...d, x: Math.round(p[0]), y: Math.round(p[1]) } : null;
    })
    .filter(Boolean);
  const cities = asia
    ? CITIES.map((c) => {
        const p = proj([c.lon, c.lat]);
        return p && inView(p) ? { ...c, x: Math.round(p[0]), y: Math.round(p[1]), g: !!guideByCity[c.slug] } : null;
      }).filter(Boolean)
    : [];
  return { W, H, lands, qs, ds, cities };
}

export const MAP_ASIA = build('asia');
export const MAP_WORLD = build('world');
