// 도시별 앞으로 약 9일 날씨 예보 — 노르웨이 기상청(MET Norway) Locationforecast 2.0
// 무료·상업적 이용 가능(CC BY 4.0, 출처 표시), 키 없음. 요청할 때 사이트 주소를 User-Agent 로 밝혀야 함.
import { bySlug } from '../src/data/countries.js';

const API = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';
const UA = 'romingo/1.0 (https://romingo.pages.dev; github.com/bsowon88-design/romingo)';
const r1 = (n) => Math.round(n * 10) / 10;

function localParts(iso, tz) {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false });
  const p = Object.fromEntries(f.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hour: +p.hour % 24 };
}

async function one(city, tz) {
  const u = `${API}?lat=${city.lat.toFixed(2)}&lon=${city.lon.toFixed(2)}`;
  const res = await fetch(u, { headers: { 'User-Agent': UA, accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  const days = new Map();
  for (const t of j.properties?.timeseries || []) {
    const { date, hour } = localParts(t.time, tz);
    const d = days.get(date) || { hi: -99, lo: 99, rain: 0, sym: null, symH: 99, n: 0 };
    const temp = t.data?.instant?.details?.air_temperature;
    if (temp != null) { d.hi = Math.max(d.hi, temp); d.lo = Math.min(d.lo, temp); d.n++; }
    const n1 = t.data?.next_1_hours;
    const n6 = t.data?.next_6_hours;
    if (n1) d.rain += n1.details?.precipitation_amount || 0;
    else if (n6) d.rain += n6.details?.precipitation_amount || 0;
    // 낮(정오 가까운 때) 날씨 모양을 그날 대표로
    const sym = (n6 || n1)?.summary?.symbol_code;
    if (sym && Math.abs(hour - 12) < Math.abs(d.symH - 12)) { d.sym = sym.replace(/_(day|night|polartwilight)$/, ''); d.symH = hour; }
    days.set(date, d);
  }
  return [...days.entries()]
    .filter(([, d]) => d.n >= 2 && d.sym)
    .slice(0, 10)
    .map(([date, d]) => [date, r1(d.hi), r1(d.lo), r1(d.rain), d.sym]);
}

export async function fetchForecasts(cities) {
  const c = {};
  for (const city of cities) {
    const tz = bySlug[city.country]?.tz || 'UTC';
    try {
      c[city.slug] = await one(city, tz);
    } catch (e) {
      console.warn(`  예보 ${city.ko} 실패:`, e.message);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  if (!Object.keys(c).length) return null;
  return { at: Date.now(), c };
}
