// 어디서나 검색에 쓰는 목록 (사이트를 만들 때 한 번 만들어서 페이지에 넣음)
import { COUNTRIES, flagOf } from './countries.js';
import { CITIES } from './cities.js';
import { GUIDES } from './guides.js';
import { countryAlarm, ALARM_KO, countryRate } from './load.js';
import { HAS_CLIMATE } from './weather.js';

const guideSet = new Set(GUIDES.map((g) => g.city));

export const SEARCH_INDEX = COUNTRIES.map((c) => {
  const al = countryAlarm(c);
  const rate = countryRate(c);
  const cities = CITIES.filter((x) => x.country === c.slug).map((x) => ({
    s: x.slug,
    k: x.ko,
    e: (x.photoQ || '').toLowerCase(),
    g: guideSet.has(x.slug) ? 1 : 0,
    w: HAS_CLIMATE(x.slug) ? 1 : 0,
  }));
  return {
    s: c.slug,
    k: c.ko,
    f: flagOf(c),
    e: `${c.slug} ${(c.photoQ || '').toLowerCase()} ${c.cities.join(' ')}`,
    a: al && al.max ? `외교부 ${al.levels.every((l) => /일부/.test(l.region)) ? '일부 지역 ' : ''}${al.max}단계 ${ALARM_KO[al.max].label}` : '',
    r: rate ? rate.line1 : '',
    c: cities,
  };
});
