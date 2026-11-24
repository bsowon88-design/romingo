// 인천공항 출발 여객편 — 날짜별로 목적지 도시마다 편수를 셈 (키: DATA_GO_KR_KEY, 활용신청 필요)
// 공공데이터포털 "인천국제공항공사_항공기 운항 현황 상세 조회" / 개발계정 하루 500번
import { cityKeyOf } from '../src/data/airports.js';

const URL_DEP = 'https://apis.data.go.kr/B551177/statusOfAllFltDeOdp/getFltDeparturesDeOdp';
const PER = 1000;

function findItems(j) {
  if (Array.isArray(j)) {
    if (j.length && j[0] && typeof j[0] === 'object' && !Array.isArray(j[0])) return j;
    for (const x of j) { const r = findItems(x); if (r) return r; }
    return null;
  }
  if (j && typeof j === 'object') {
    if (j.item) return Array.isArray(j.item) ? j.item : [j.item];
    for (const v of Object.values(j)) { const r = findItems(v); if (r) return r; }
  }
  return null;
}
const findTotal = (j) => {
  if (!j || typeof j !== 'object') return null;
  if (j.totalCount != null) return +j.totalCount;
  for (const v of Object.values(j)) { const r = findTotal(v); if (r != null) return r; }
  return null;
};
const pick = (o, re) => { for (const [k, v] of Object.entries(o)) if (re.test(k) && v != null && v !== '') return v; return null; };

async function fetchDay(key, ymd) {
  const rows = [];
  for (let page = 1; page <= 5; page++) {
    const u = new URL(URL_DEP);
    u.searchParams.set('serviceKey', key);
    u.searchParams.set('type', 'json');
    u.searchParams.set('numOfRows', String(PER));
    u.searchParams.set('pageNo', String(page));
    u.searchParams.set('searchDate', ymd);
    u.searchParams.set('searchFrom', '0000');
    u.searchParams.set('searchTo', '2400');
    u.searchParams.set('searchdtCode', 'S');
    u.searchParams.set('passengerOrCargo', 'P');
    const res = await fetch(u);
    const text = await res.text();
    let j;
    try { j = JSON.parse(text); } catch { throw new Error(`JSON 아님 (HTTP ${res.status}): ${text.slice(0, 160)}`); }
    const items = findItems(j) || [];
    if (page === 1 && items[0]) console.log(`  ${ymd} 항목 이름:`, Object.keys(items[0]).join(', '));
    rows.push(...items);
    const total = findTotal(j);
    if (items.length < PER || (total != null && rows.length >= total)) break;
  }
  return rows;
}

// 하루치: { 도시열쇠: 편수 } — 코드셰어(같은 비행기의 다른 편명)는 빼고 셈
function countDay(rows, meta) {
  const out = {};
  const seen = new Set();
  for (const r of rows) {
    const share = String(pick(r, /codeshare|codeShare|cdshr/i) || '');
    if (/slave|^s$|share/i.test(share) && !/master|^m$/i.test(share)) continue;
    const code = String(pick(r, /^airportCode$|arrAirportCode|destAirportCode|airport_?code/i) || '').toUpperCase();
    if (!code) continue;
    const fid = pick(r, /^fid$|masterFlightId|masterflightid|flightId/i) || JSON.stringify(r).slice(0, 80);
    if (seen.has(fid)) continue;
    seen.add(fid);
    const nameEn = String(pick(r, /^airport$|airportName|airportNm/i) || '');
    const c = cityKeyOf(code, nameEn);
    meta[c.key] = { ko: c.ko, city: c.city, iso: c.iso };
    out[c.key] = (out[c.key] || 0) + 1;
  }
  return out;
}

const kst = (d) => new Date(d.getTime() + 9 * 36e5).toISOString().slice(0, 10);

// 하루 한 번만: D-3 ~ D+6 날짜별 편수를 다시 세서 기록에 덮어씀
export async function updatePopular(key, old) {
  const today = kst(new Date());
  const base = old && !Array.isArray(old) ? old : {};
  if (base.checked === today) return { out: base, changed: false };
  const days = { ...(base.days || {}) };
  const meta = { ...(base.meta || {}) };
  let got = 0;
  for (let k = -3; k <= 6; k++) {
    const d = new Date(Date.now() + k * 864e5);
    const ymd = kst(d).replace(/-/g, '');
    try {
      const rows = await fetchDay(key, ymd);
      if (rows.length) { days[kst(d)] = countDay(rows, meta); got++; }
    } catch (e) {
      console.warn(`  ${ymd} 실패:`, e.message);
      if (k === -3) break; // 첫날부터 안 되면 (승인 전 등) 그만
    }
  }
  if (!got) return { out: base, changed: false };
  // 60일 넘은 기록은 지움
  const cut = kst(new Date(Date.now() - 60 * 864e5));
  for (const d of Object.keys(days)) if (d < cut) delete days[d];
  return { out: { checked: today, days, meta }, changed: true };
}
