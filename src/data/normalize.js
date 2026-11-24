// 공식 데이터 주소와 정리 함수 — 사이트 빌드(src/data/load.js)와 자동 수집(scripts/collect.mjs)이 같이 씀.

// 미국 지질조사국(USGS): 최근 30일, 규모 4.5 이상
export const USGS_MONTH = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson';
// 화면에서 바로 불러오는 실시간 목록 (최근 7일)
export const USGS_WEEK = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson';

// 국제 재난경보(GDACS): 주황·빨강 경보만, 최근 60일
export function gdacsUrl(days = 60) {
  const from = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
  return `https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventlist=EQ;TC;FL;VO;WF;DR&alertlevel=Orange;Red&fromDate=${from}`;
}

// 보관함에 넣는 지진 기준 (페이지를 만드는 큰 지진)
export const ARCHIVE_MIN_MAG = 5;
// 보관 기간
export const KEEP_DAYS = 400;

const r1 = (n) => Math.round(n * 10) / 10;

export function normQuake(f) {
  const p = f.properties || {};
  const [lon, lat, depth] = f.geometry?.coordinates || [0, 0, 0];
  return {
    id: f.id,
    mag: r1(p.mag ?? 0),
    place: p.place || '',
    time: p.time,
    lat: r1(lat),
    lon: r1(lon),
    depth: Math.round(depth ?? 0),
    tsunami: p.tsunami ? 1 : 0,
    alert: p.alert || null,
    url: p.url || `https://earthquake.usgs.gov/earthquakes/eventpage/${f.id}`,
  };
}

const utc = (s) => (s ? Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : s + 'Z') : null);

export function normDisaster(f) {
  const p = f.properties || {};
  const [lon, lat] = f.geometry?.coordinates || [0, 0];
  return {
    id: `${p.eventtype}-${p.eventid}`,
    type: p.eventtype,
    name: p.eventname || p.name || '',
    country: p.country || '',
    iso3: (p.affectedcountries || []).map((c) => c.iso3).filter(Boolean),
    level: p.alertlevel,
    from: utc(p.fromdate),
    to: utc(p.todate),
    sev: p.severitydata?.severitytext || '',
    report: p.url?.report || 'https://www.gdacs.org/',
    lat: r1(lat),
    lon: r1(lon),
  };
}

// id 가 같으면 새 것으로 바꾸고, 최신순 정렬, 오래된 것 지움
export function mergeById(oldList, newList, timeKey = 'time') {
  const map = new Map();
  for (const x of oldList || []) map.set(x.id, x);
  for (const x of newList || []) map.set(x.id, x);
  const cut = Date.now() - KEEP_DAYS * 864e5;
  return [...map.values()]
    .filter((x) => (x[timeKey] ?? 0) >= cut)
    .sort((a, b) => (b[timeKey] ?? 0) - (a[timeKey] ?? 0));
}

export async function getJson(url, ms = 15000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctl.signal, headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

export const TYPE_KO = { EQ: '지진', TC: '태풍·사이클론', FL: '홍수', VO: '화산', WF: '산불', DR: '가뭄' };
export const TYPE_ICON = { EQ: '🌐', TC: '🌀', FL: '🌊', VO: '🌋', WF: '🔥', DR: '☀️' };
export const LEVEL_KO = { Red: '위험', Orange: '주의', Green: '낮음' };
