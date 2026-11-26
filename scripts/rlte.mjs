// 한국관광공사 관광지별 연관 관광지 정보 (TarRlteTarService1) — 티맵 내비 이동 자료로 만든 지역별 인기 관광지
// 시·군·구마다 "이 관광지를 간 차가 다음에 많이 간 곳" 순위(최대 50위)를 줌.
// 여기서는 시·군·구마다 관광지가 '연관 관광지'로 몇 번, 몇 위로 나오는지 점수로 모아 "많이 찾는 곳" 순위를 만듦.
// 한 달에 한 번 새로 셈. 하루 한도(1,000회) 안에서 하루 최대 RLTE_CALLS 회씩, 며칠에 걸쳐 전국을 채움.
// 키는 다른 공공데이터와 같은 DATA_GO_KR_KEY (공공데이터포털에서 이 API 활용신청 필요 — 2026-11-26 신청함).
import { kstDate } from './tour.mjs';
import { popKey as norm } from '../src/data/kr-pick.js';

const BASE = 'https://apis.data.go.kr/B551011/TarRlteTarService1';
const RLTE_CALLS = 700;

async function call(op, params) {
  const u = new URL(`${BASE}/${op}`);
  u.searchParams.set('serviceKey', params.key);
  u.searchParams.set('MobileOS', 'ETC');
  u.searchParams.set('MobileApp', 'Tripberry');
  u.searchParams.set('_type', 'json');
  for (const [k, v] of Object.entries(params)) if (k !== 'key') u.searchParams.set(k, String(v));
  const res = await fetch(u, { signal: AbortSignal.timeout(30000) });
  const text = await res.text();
  let j;
  try {
    j = JSON.parse(text);
  } catch {
    throw new Error(`${op} JSON 아님 (HTTP ${res.status}): ${text.slice(0, 200)}`);
  }
  const head = j?.response?.header;
  if (head && head.resultCode && head.resultCode !== '0000') throw new Error(`${op} ${head.resultCode} ${head.resultMsg}`);
  const body = j?.response?.body || {};
  let items = body.items?.item || [];
  if (!Array.isArray(items)) items = [items];
  return { items, total: +body.totalCount || 0 };
}

// 항목 이름이 조금 달라도 찾게 (첫 수집 때 실제 이름을 기록에 남김)
const pick = (o, re) => {
  for (const [k, v] of Object.entries(o)) if (re.test(k)) return v;
  return undefined;
};

// 우리 자료(관광공사 TourAPI)의 지역 번호 → 이 API 의 시·군·구 코드(5자리 행정 코드)
// 2026년 광주·전남 통합(12)은 옛 코드로: 광주 구 → 29xxx, 전남 시·군 → 46xxx
const GJ = { '210': '29110', '240': '29140', '270': '29155', '300': '29170', '330': '29200' };
export function signguCodes(places) {
  const set = new Map();
  for (const p of places) {
    if (!p.rg || !p.sg) continue;
    let cd;
    if (p.rg === '36110') cd = '36110';
    else if (p.rg === '12') cd = GJ[p.sg] || `46${p.sg}`;
    else cd = `${p.rg}${p.sg}`;
    set.set(`${p.rg}-${p.sg}`, cd);
  }
  return [...set.entries()]; // [ [우리 키, 5자리 코드], ... ]
}

// old: { ym, s: { '11-110': { 이름정규화: 점수 } }, done: [우리 키...], fields }
export async function fetchRlte(key, old, clock, places) {
  const today = kstDate();
  if (clock.rlte === today) return null; // 하루 한 번
  const areas = signguCodes(places);
  let out = { ym: old?.ym || '', s: { ...(old?.s || {}) }, done: [...(old?.done || [])], fields: old?.fields || '' };
  let calls = 0;

  // 기준 달 정하기 — 지난달부터 거꾸로, 자료가 있는 가장 최근 달
  const months = [1, 2, 3, 4].map((k) => {
    const d = new Date(Date.now() + 9 * 36e5);
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() - k);
    return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  });
  // 이번 달 기준이 이미 끝까지 셌으면 쉼. 새 달 자료가 나왔는지는 한 달에 한 번(1일 이후 첫 실행)만 확인.
  const [s0, c0] = areas[0] || [];
  if (!c0) return null;
  let ym = out.ym;
  if (!ym || (out.done.length >= areas.length && ym < months[0])) {
    for (const m of months) {
      calls++;
      try {
        const r = await call('areaBasedList1', { key, baseYm: m, areaCd: c0.slice(0, 2), signguCd: c0, numOfRows: 5, pageNo: 1 });
        if (r.items.length) {
          ym = m;
          out.fields = Object.keys(r.items[0]).join(',');
          console.log(`연관 관광지: 기준 달 ${m}, 항목 이름: ${out.fields}`);
          break;
        }
      } catch (e) {
        console.warn(`  연관 관광지 ${m} 확인 실패:`, e.message);
        if (/SERVICE_KEY|등록되지|Forbidden|LIMITED/.test(e.message)) return { out: old || out, done: 0, left: areas.length, stop: true };
      }
    }
    if (!ym) { console.warn('연관 관광지: 자료 있는 달을 못 찾음'); return { out: old || out, done: 0, left: areas.length }; }
    if (ym !== out.ym) out = { ym, s: {}, done: [], fields: out.fields };
  }

  let got = 0;
  let fails = 0;
  for (const [ours, cd] of areas) {
    if (out.done.includes(ours)) continue;
    if (calls >= RLTE_CALLS) break;
    const score = {};
    let page = 1;
    let ok = true;
    for (; page <= 15; page++) {
      if (calls >= RLTE_CALLS) { ok = false; break; }
      calls++;
      let r;
      try {
        r = await call('areaBasedList1', { key, baseYm: ym, areaCd: cd.slice(0, 2), signguCd: cd, numOfRows: 1000, pageNo: page });
      } catch (e) {
        console.warn(`  연관 관광지 ${ours}(${cd}) 실패:`, e.message);
        ok = false;
        if (/LIMITED|SERVICE_KEY/.test(e.message) || ++fails >= 5) { page = 99; }
        break;
      }
      for (const it of r.items) {
        // 음식·숙박은 빼고 관광지만
        const cat = String(pick(it, /^rlteCtgryLclsNm$|Lcls.*Nm/i) || '');
        if (/음식|숙박/.test(cat)) continue;
        const name = pick(it, /^rlteTatsNm$|rlte.*(Tats|Ats)Nm/i);
        const rank = +pick(it, /^rlteRank$|rank/i) || 50;
        // 같은 시·군·구 안의 곳만 (다른 지역으로 이어진 곳은 그 지역 몫)
        const rs = String(pick(it, /^rlteSignguCd$|rlte.*Signgu.*Cd/i) || '');
        if (rs && rs !== cd) continue;
        const k = norm(name);
        if (!k) continue;
        score[k] = (score[k] || 0) + (51 - Math.min(rank, 50));
      }
      if (!r.items.length || page * 1000 >= r.total) break;
      await new Promise((res) => setTimeout(res, 120));
    }
    if (page === 99) break;
    if (!ok) continue;
    fails = 0;
    // 점수 높은 60곳만 보관
    out.s[ours] = Object.fromEntries(Object.entries(score).sort((a, b) => b[1] - a[1]).slice(0, 60));
    out.done.push(ours);
    got++;
  }
  console.log(`연관 관광지(${ym}): 이번에 ${got}곳, 끝난 곳 ${out.done.length}/${areas.length}, 호출 ${calls}회`);
  return { out, done: got, left: areas.length - out.done.length };
}
