// 한국관광공사 국문 관광정보(TourAPI 4.0, KorService2) — 자동 수집에서만 씀.
// 키는 외교부와 같은 공공데이터포털 키(GitHub 비밀 칸 DATA_GO_KR_KEY).
// 축제: 6시간마다 / 관광지·문화시설(대표 사진 있는 곳만): 하루 한 번.
// 받기에 실패하거나 빈 응답이 오면 예전 자료를 그대로 둠 (절대 지우지 않음).
const BASE = 'https://apis.data.go.kr/B551011/KorService2';

export const kstDate = (ms = Date.now()) => new Date(ms + 9 * 36e5).toISOString().slice(0, 10);
const ymd = (d) => d.replace(/-/g, '');

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

async function all(op, key, params, per = 500, maxPages = 40) {
  const rows = [];
  let total = 0;
  for (let page = 1; page <= maxPages; page++) {
    const r = await call(op, { key, numOfRows: per, pageNo: page, ...params });
    if (page === 1) {
      total = r.total;
      if (r.items[0]) console.log(`  ${op} 항목 이름:`, Object.keys(r.items[0]).join(', '));
    }
    rows.push(...r.items);
    if (!r.items.length || rows.length >= total) break;
    await new Promise((res) => setTimeout(res, 300));
  }
  return { rows, total };
}

// 화면에 쓸 것만 짧은 이름으로
const slim = (x) => {
  const o = {
    id: String(x.contentid),
    ty: String(x.contenttypeid || ''),
    t: x.title || '',
    a: [x.addr1, x.addr2].filter(Boolean).join(' ').trim(),
    x: +x.mapx || 0,
    y: +x.mapy || 0,
    img: x.firstimage || '',
    img2: x.firstimage2 || '',
    tel: x.tel || '',
    rg: x.lDongRegnCd || '',
    sg: x.lDongSignguCd || '',
    c1: x.lclsSystm1 || '',
    c2: x.lclsSystm2 || '',
    c3: x.lclsSystm3 || '',
    cp: x.cpyrhtDivCd || '',
    m: x.modifiedtime || '',
  };
  if (x.eventstartdate) o.s = x.eventstartdate;
  if (x.eventenddate) o.e = x.eventenddate;
  for (const k of Object.keys(o)) if (o[k] === '' || o[k] === 0) delete o[k];
  return o;
};

// 축제·행사 — 반년 전부터 시작한 것까지 받아서 몇 달짜리 축제도 빠지지 않게
// clock: live/tour.json 의 마지막 수집 시각 (사이트를 다시 만들지 않는 폴더)
export async function fetchFestivals(key, old, clock = {}) {
  if (clock.fest && Date.now() - clock.fest < 5.5 * 36e5) return null; // 6시간에 한 번
  const today = kstDate();
  const from = kstDate(Date.now() - 180 * 864e5);
  const { rows, total } = await all('searchFestival2', key, { eventStartDate: ymd(from), arrange: 'A' });
  if (!rows.length) throw new Error('축제: 빈 응답 — 예전 자료 유지');
  const byId = Object.fromEntries((old?.list || []).map((f) => [f.id, f]));
  for (const r of rows) byId[String(r.contentid)] = slim(r);
  // 끝난 지 1년 넘은 행사만 정리 (페이지는 그 전까지 유지)
  const cut = ymd(kstDate(Date.now() - 365 * 864e5));
  const list = Object.values(byId).filter((f) => !f.e || f.e >= cut).sort((a, b) => (a.s || '').localeCompare(b.s || ''));
  console.log(`축제: 받은 것 ${rows.length}/${total}, 보관 ${list.length}개 (기준일 ${today})`);
  return { list };
}

// 관광지(12)·문화시설(14)·쇼핑(38, 시장 고르기용) — 대표 사진이 있는 곳만(arrange O). 하루 한 번.
export async function fetchPlaces(key, old, clock = {}) {
  const today = kstDate();
  if (clock.place === today) return null;
  const out = {};
  // 쇼핑(38)은 덜 받거나 실패해도 관광지까지 버리지 않고 예전 쇼핑 자료를 그대로 씀
  try {
    const { rows, total } = await all('areaBasedList2', key, { contentTypeId: 38, arrange: 'O' }, 1000);
    console.log(`관광 38: ${rows.length}/${total}`);
    if (!rows.length || (total && rows.length < total * 0.5)) throw new Error('덜 받음');
    for (const r of rows) out[String(r.contentid)] = slim(r);
  } catch (e) {
    const prev = (old?.list || []).filter((x) => x.ty === '38');
    console.warn(`관광 38(쇼핑): ${e.message} — 예전 ${prev.length}곳 유지`);
    for (const x of prev) out[x.id] = x;
  }
  for (const ty of [12, 14]) {
    const { rows, total } = await all('areaBasedList2', key, { contentTypeId: ty, arrange: 'O' }, 1000);
    console.log(`관광 ${ty}: ${rows.length}/${total}`);
    // 절반도 못 받았으면 실패로 보고 예전 것 유지
    if (!rows.length || (total && rows.length < total * 0.5)) throw new Error(`관광 ${ty}: 덜 받음 — 예전 자료 유지`);
    for (const r of rows) out[String(r.contentid)] = slim(r);
  }
  const list = Object.values(out).sort((a, b) => a.id.localeCompare(b.id));
  return { list };
}

// ── 상세 설명 (소개 글·이용 시간·요금·장소 등) — 하루 한 번, 정해 둔 횟수만큼 조금씩 ──
// 축제(끝나지 않은 것) 먼저, 그다음 사이트에 싣는 관광지(src/data/kr-pick.js 로 고른 곳).
// 개발 계정 하루 한도(1,000회)를 넘지 않게 하루 최대 DETAIL_CALLS 회만 부름. 한도에 걸리면 그때까지 받은 것만 저장.
const DETAIL_CALLS = 500;
const clean = (v) =>
  String(v || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
const firstUrl = (h) => (String(h || '').match(/https?:\/\/[^\s"'<>]+/) || [''])[0];
const INTRO = {
  15: { eventplace: 'pl', playtime: 'tm', usetimefestival: 'fee', sponsor1: 'org', sponsor1tel: 'otel', agelimit: 'age' },
  12: { infocenter: 'info', restdate: 'rest', usetime: 'tm', parking: 'park' },
  14: { infocenterculture: 'info', usefee: 'fee', usetimeculture: 'tm', restdateculture: 'rest', parkingculture: 'park' },
  38: { infocentershopping: 'info', opentime: 'tm', restdateshopping: 'rest', parkingshopping: 'park', fairday: 'fair', saleitem: 'item' },
};

export async function fetchDetails(key, old, clock, festList, placeIds) {
  const today = kstDate();
  if (clock.detail === today) return null;
  const d = { ...(old?.d || {}) };
  const now = Date.now();
  const todayY = today.replace(/-/g, '');
  const want = [];
  for (const f of festList) {
    if (!f.e || f.e < todayY) continue;
    const have = d[f.id];
    if (!have || now - (have.at || 0) > 10 * 864e5) want.push({ id: f.id, ty: 15 });
  }
  for (const id of placeIds) if (!d[id]) want.push({ id, ty: null });
  let calls = 0;
  let got = 0;
  let fails = 0;
  outer: for (const w of want) {
    if (calls + 2 > DETAIL_CALLS) break;
    try {
      calls++;
      const c = (await call('detailCommon2', { key, contentId: w.id })).items[0];
      if (!c) continue;
      const ty = w.ty || +c.contenttypeid || 12;
      const o = { at: now };
      const ov = clean(c.overview);
      if (ov) o.o = ov.slice(0, 1500);
      const hp = firstUrl(c.homepage);
      if (hp) o.hp = hp;
      if (INTRO[ty]) {
        calls++;
        const it = (await call('detailIntro2', { key, contentId: w.id, contentTypeId: ty })).items[0] || {};
        for (const [src, dst] of Object.entries(INTRO[ty])) {
          const v = clean(it[src]);
          if (v) o[dst] = v.slice(0, 300);
        }
      }
      d[w.id] = o;
      got++;
      fails = 0;
    } catch (e) {
      console.warn(`  상세 ${w.id} 실패:`, e.message);
      // 하루 한도에 걸렸거나 계속 실패하면 오늘은 멈춤 (받은 것까지만 저장)
      if (/LIMITED|SERVICE_KEY|한도|초과/.test(e.message) || ++fails >= 5) break outer;
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  // 더 이상 쓰지 않는 것 정리 (끝난 지 1년 지난 축제·목록에서 빠진 관광지)
  const keep = new Set([...festList.map((f) => f.id), ...placeIds]);
  for (const id of Object.keys(d)) if (!keep.has(id)) delete d[id];
  console.log(`상세: 이번에 ${got}곳 (호출 ${calls}회), 남은 곳 ${Math.max(0, want.length - got)}, 보관 ${Object.keys(d).length}곳`);
  return { d, done: got, left: want.length - got };
}
