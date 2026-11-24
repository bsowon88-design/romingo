// 외교부 여행경보 (공공데이터포털) — 자동 수집에서만 씀. 키는 GitHub 비밀 칸 DATA_GO_KR_KEY.
const BASE = 'https://apis.data.go.kr/1262000';
const ALARM_URL = `${BASE}/TravelAlarmService2/getTravelAlarmList2`;
const ADJUST_URL = `${BASE}/CountryHistoryService2/getCountryHistoryList2`;

// 응답 모양이 조금 달라도 country_nm 이 든 목록을 찾아냄
function findRows(j) {
  if (Array.isArray(j)) {
    if (j.length && typeof j[0] === 'object' && j[0] && 'country_nm' in j[0]) return j;
    for (const x of j) {
      const r = findRows(x);
      if (r) return r;
    }
    return null;
  }
  if (j && typeof j === 'object') {
    if ('country_nm' in j && 'country_iso_alp2' in j) return [j];
    for (const v of Object.values(j)) {
      const r = findRows(v);
      if (r) return r;
    }
  }
  return null;
}

function findTotal(j) {
  if (!j || typeof j !== 'object') return null;
  if (typeof j.totalCount !== 'undefined') return +j.totalCount;
  for (const v of Object.values(j)) {
    const r = findTotal(v);
    if (r != null) return r;
  }
  return null;
}

async function fetchAll(url, key, maxPages = 10, per = 300) {
  const rows = [];
  for (let page = 1; page <= maxPages; page++) {
    const u = new URL(url);
    u.searchParams.set('ServiceKey', key);
    u.searchParams.set('returnType', 'JSON');
    u.searchParams.set('numOfRows', String(per));
    u.searchParams.set('pageNo', String(page));
    const res = await fetch(u, { headers: { accept: 'application/json' } });
    const text = await res.text();
    let j;
    try {
      j = JSON.parse(text);
    } catch {
      throw new Error(`JSON 아님 (HTTP ${res.status}): ${text.slice(0, 200)}`);
    }
    const got = findRows(j) || [];
    if (page === 1 && got[0]) console.log('  항목 이름:', Object.keys(got[0]).join(', '));
    rows.push(...got);
    const total = findTotal(j);
    if (!got.length || got.length < per || (total != null && rows.length >= total)) break;
  }
  return rows;
}

const LEVEL = (v) => {
  const n = parseInt(String(v ?? '').replace(/[^0-9]/g, ''), 10);
  return n >= 1 && n <= 4 ? n : 0;
};

// 나라(ISO 2자리)별로 묶음: { KR이름, 단계 목록, 가장 높은 단계 }
export async function fetchAlarms(key) {
  const rows = await fetchAll(ALARM_URL, key);
  const by = {};
  for (const r of rows) {
    const iso = (r.country_iso_alp2 || '').toUpperCase();
    if (!iso) continue;
    const c = (by[iso] ||= { iso, name: r.country_nm, en: r.country_eng_nm, levels: [], max: 0, date: null });
    const lvl = LEVEL(r.alarm_lvl);
    const region = (r.region_ty || '').trim();
    const note = (r.remark || r.region_nm || '').toString().trim().slice(0, 300);
    if (lvl && !c.levels.some((x) => x.lvl === lvl && x.region === region && x.note === note)) {
      c.levels.push({ lvl, region, note });
    }
    c.max = Math.max(c.max, lvl);
    if (r.written_dt && (!c.date || r.written_dt > c.date)) c.date = r.written_dt;
  }
  for (const c of Object.values(by)) c.levels.sort((a, b) => b.lvl - a.lvl);
  return Object.fromEntries(Object.entries(by).sort(([a], [b]) => a.localeCompare(b)));
}

// 여행경보 조정 소식 (최신 100개)
export async function fetchAdjusts(key) {
  const rows = await fetchAll(ADJUST_URL, key, 3, 300);
  const list = rows
    .map((r) => ({
      id: `${r.country_iso_alp2}-${r.wrt_dt}-${(r.title || '').slice(0, 40)}`,
      iso: (r.country_iso_alp2 || '').toUpperCase(),
      country: r.country_nm,
      title: (r.title || '').trim(),
      date: r.wrt_dt || '',
      text: (r.txt_origin_cn || '').replace(/\s+/g, ' ').trim().slice(0, 400),
    }))
    .filter((x) => x.title);
  const seen = new Set();
  return list
    .filter((x) => (seen.has(x.id) ? false : seen.add(x.id)))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 100);
}
