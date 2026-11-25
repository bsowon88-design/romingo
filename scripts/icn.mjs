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

// ── 김포·김해·제주 출발 국제선 (한국공항공사_실시간 항공기 운항정보 조회_GW, 같은 DATA_GO_KR_KEY) ──
const URL_KAC = 'https://apis.data.go.kr/B551178/flight-status/depart';
export const KAC_AIRPORTS = ['GMP', 'PUS', 'CJU'];
let kacLogged = false;
const pickKey = (o, re) => { for (const k of Object.keys(o)) if (re.test(k) && o[k] != null && o[k] !== '') return k; return null; };
const withDate = (ymd, v) => { const t = String(v || '').replace(/\D/g, ''); return t.length === 4 ? ymd + t : t.length >= 12 ? t : ''; };

function normKac(r, ap, ymd) {
  // 도착 공항 코드 — 이름이 확실치 않아 여러 후보를 봄. 기준 공항(ap)과 같으면 다른 칸을 씀
  let code = pick(r, /^arr_?airport_?code$|arrAirportCode|^arrv?_?city_?code$|^arr_?code$|arrivedCode/i);
  if (!code) {
    for (const [k, v] of Object.entries(r)) if (/airport_?code|city_?code/i.test(k) && String(v).toUpperCase() !== ap) { code = v; break; }
  }
  const name = pick(r, /^arr_?airport$|arrAirport(?!Code)|^arrv?_?city$|boardingEng|arr_?airport_?eng/i) || '';
  const fl = pick(r, /^flight_?id$|flightId|^flt_?no$/i) || '';
  const master = pick(r, /masterflightid|master_?flight/i) || '';
  const cs = String(pick(r, /codeshare|code_?share/i) || '');
  const slave = /^y$/i.test(cs) && master && master !== fl;
  return {
    airportCode: String(code || '').toUpperCase(),
    airport: name,
    _ap: ap,
    fid: pick(r, /^f_?id$/i) || `${ap}-${master || fl}-${ymd}`,
    codeshare: slave ? 'Slave' : 'Master',
    remark: pick(r, /status|remark|rmk/i) || '',
    scheduleDateTime: withDate(ymd, pick(r, /^std$|^sch(edule)?_?(time|date_?time)?$|plan_?time|^schTime$|scheduled/i)),
    estimatedDateTime: withDate(ymd, pick(r, /^etd$|^est(imated)?_?(time|date_?time)?$|chg_?time|change_?time|^etdTime$|estimated/i)),
  };
}

export async function fetchKacDay(key, ymd) {
  const all = [];
  for (const ap of KAC_AIRPORTS) {
    for (let page = 1; page <= 10; page++) {
      const u = new URL(URL_KAC);
      u.searchParams.set('serviceKey', key);
      u.searchParams.set('type', 'json');
      u.searchParams.set('numOfRows', '100');
      u.searchParams.set('pageNo', String(page));
      u.searchParams.set('searchday', ymd);
      u.searchParams.set('airport_code', ap);
      u.searchParams.set('line', 'I');
      const res = await fetch(u);
      const text = await res.text();
      let j;
      try { j = JSON.parse(text); } catch { throw new Error(`${ap} JSON 아님 (HTTP ${res.status}): ${text.slice(0, 160)}`); }
      const items = findItems(j) || [];
      // 받은 게 없으면 응답 앞부분을 기록 (원인 확인용 — 키는 응답에 없음)
      if (page === 1 && !items.length) console.log(`  공항공사 ${ap} ${ymd} 빈 응답 (HTTP ${res.status}):`, text.slice(0, 300));
      if (!kacLogged && items[0]) { kacLogged = true; console.log(`  공항공사 ${ap} 항목 이름:`, Object.keys(items[0]).join(', ')); console.log('  예시:', JSON.stringify(items[0]).slice(0, 400)); }
      all.push(...items.filter((r) => { const l = pick(r, /^line$|line_?type|^io_?line$/i); return !l || /^i$|국제/i.test(String(l)); }).map((r) => normKac(r, ap, ymd)));
      const total = findTotal(j);
      if (items.length < 100 || (total != null && page * 100 >= total)) break;
    }
  }
  return all;
}

// 하루치: { 도시열쇠: 편수 } — 코드셰어(같은 비행기의 다른 편명)는 빼고 셈
function countDay(rows, meta, byAp) {
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
    // 출발 공항별로도 셈 (공항별 직항 여행지 페이지용)
    if (byAp) { const a = (byAp[r._ap || 'ICN'] ||= {}); a[c.key] = (a[c.key] || 0) + 1; }
  }
  return out;
}

const kst = (d) => new Date(d.getTime() + 9 * 36e5).toISOString().slice(0, 10);

// 하루 한 번만: D-3 ~ D+6 날짜별 편수를 다시 세서 기록에 덮어씀
export async function updatePopular(key, old) {
  const today = kst(new Date());
  const base = old && !Array.isArray(old) ? old : {};
  if (base.checked === today && base.v === 4) return { out: base, changed: false };
  const days = { ...(base.days || {}) };
  const apdays = { ...(base.apdays || {}) }; // { 날짜: { ICN: {도시열쇠: 편수}, GMP: …, PUS: …, CJU: … } }
  const meta = { ...(base.meta || {}) };
  let got = 0;
  for (let k = -3; k <= 6; k++) {
    const d = new Date(Date.now() + k * 864e5);
    const ymd = kst(d).replace(/-/g, '');
    try {
      const rows = (await fetchDay(key, ymd)).map((r) => ({ ...r, _ap: 'ICN' }));
      // 김포·김해·제주 국제선도 같이 셈 (실패해도 인천은 그대로)
      try { rows.push(...(await fetchKacDay(key, ymd))); } catch (e) { if (k === -3) console.warn('  공항공사 실패:', e.message); }
      if (rows.length) { const byAp = {}; days[kst(d)] = countDay(rows, meta, byAp); apdays[kst(d)] = byAp; got++; }
    } catch (e) {
      console.warn(`  ${ymd} 실패:`, e.message);
      if (k === -3) break; // 첫날부터 안 되면 (승인 전 등) 그만
    }
  }
  if (!got) return { out: base, changed: false };
  // 60일 넘은 기록은 지움
  const cut = kst(new Date(Date.now() - 60 * 864e5));
  for (const d of Object.keys(days)) if (d < cut) delete days[d];
  const cut2 = kst(new Date(Date.now() - 14 * 864e5)); // 공항별은 2주치만
  for (const d of Object.keys(apdays)) if (d < cut2) delete apdays[d];
  return { out: { v: 4, checked: today, days, apdays, meta }, changed: true };
}

// ── 오늘 운항 현황 (1시간마다) — 도시별 [편수, 결항, 지연] ──
// 결항·지연은 비고(remark) 글자 또는 예정 시각보다 30분 넘게 늦어진 것으로 셈
const hhmm = (s) => {
  const t = String(s || '').replace(/\D/g, '');
  if (t.length < 12) return null;
  return Date.UTC(+t.slice(0, 4), +t.slice(4, 6) - 1, +t.slice(6, 8), +t.slice(8, 10), +t.slice(10, 12));
};
export async function fetchTodayFlights(key) {
  const now = new Date();
  const ymd = kst(now).replace(/-/g, '');
  const rows = await fetchDay(key, ymd);
  try { rows.push(...(await fetchKacDay(key, ymd))); } catch (e) { console.warn('  공항공사 실패:', e.message); }
  if (!rows.length) return null;
  const c = {};
  const seen = new Set();
  for (const r of rows) {
    const share = String(pick(r, /codeshare|codeShare|cdshr/i) || '');
    if (/slave|^s$|share/i.test(share) && !/master|^m$/i.test(share)) continue;
    const code = String(pick(r, /^airportCode$|arrAirportCode|destAirportCode|airport_?code/i) || '').toUpperCase();
    if (!code) continue;
    const fid = pick(r, /^fid$|masterFlightId|masterflightid|flightId/i) || JSON.stringify(r).slice(0, 80);
    if (seen.has(fid)) continue;
    seen.add(fid);
    const k = cityKeyOf(code, String(pick(r, /^airport$|airportName|airportNm/i) || ''));
    if (!k.key.startsWith('c:')) continue;
    const remark = String(pick(r, /^remark$|remark|rmk/i) || '');
    const sch = hhmm(pick(r, /^scheduleDateTime$|scheduleDatetime|schedule/i));
    const est = hhmm(pick(r, /^estimatedDateTime$|estimatedDatetime|estimated|changed/i));
    const cancel = /결항|cancel/i.test(remark);
    const delay = !cancel && (/지연|delay/i.test(remark) || (sch && est && est - sch >= 30 * 60000));
    const v = (c[k.key] ||= [0, 0, 0]);
    v[0]++;
    if (cancel) v[1]++;
    if (delay) v[2]++;
  }
  return { at: now.getTime(), date: kst(now), c };
}
