// 도시별 월 평균 날씨 — NASA POWER 일별 자료(최근 10년)로 직접 계산. 한 번 만들면 거의 안 바뀜.
// NASA POWER: https://power.larc.nasa.gov (공개 자료, 키 필요 없음)
const YEARS = [2015, 2024];

export async function fetchClimate(city) {
  const u = new URL('https://power.larc.nasa.gov/api/temporal/daily/point');
  u.searchParams.set('parameters', 'T2M_MAX,T2M_MIN,PRECTOTCORR,RH2M');
  u.searchParams.set('community', 'RE');
  u.searchParams.set('latitude', String(city.lat));
  u.searchParams.set('longitude', String(city.lon));
  u.searchParams.set('start', `${YEARS[0]}0101`);
  u.searchParams.set('end', `${YEARS[1]}1231`);
  u.searchParams.set('format', 'JSON');
  const res = await fetch(u);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  const P = j?.properties?.parameter;
  if (!P?.T2M_MAX) throw new Error('자료 없음');

  // 달별로 모으기
  const acc = Array.from({ length: 12 }, () => ({ hi: [], lo: [], hum: [], rainByYm: {}, rdays: 0, days: 0 }));
  for (const [day, hi] of Object.entries(P.T2M_MAX)) {
    const m = +day.slice(4, 6) - 1;
    const ym = day.slice(0, 6);
    const lo = P.T2M_MIN?.[day];
    const pr = P.PRECTOTCORR?.[day];
    const hu = P.RH2M?.[day];
    const a = acc[m];
    if (hi > -900) a.hi.push(hi);
    if (lo > -900) a.lo.push(lo);
    if (hu > -900) a.hum.push(hu);
    if (pr > -900) {
      a.rainByYm[ym] = (a.rainByYm[ym] || 0) + pr;
      a.days++;
      if (pr >= 1) a.rdays++;
    }
  }
  const avg = (xs) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null);
  const r1 = (x) => (x == null ? null : Math.round(x * 10) / 10);
  const months = acc.map((a) => {
    const yearsN = Object.keys(a.rainByYm).length || 1;
    return {
      hi: r1(avg(a.hi)),
      lo: r1(avg(a.lo)),
      rain: Math.round(Object.values(a.rainByYm).reduce((s, x) => s + x, 0) / yearsN),
      rdays: Math.round(a.rdays / yearsN),
      hum: Math.round(avg(a.hum) ?? 0),
    };
  });
  return { years: YEARS.join('~'), m: months };
}
