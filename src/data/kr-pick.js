// 국내 관광지 고르기 — 한국관광공사 관광지·문화시설 1만 5천여 곳 중
// "주말에 일부러 찾아갈 만한 곳"만 시·군마다 추려서 전국 1~2천 곳으로.
// 사이트(Astro)와 자동 수집(scripts/tour.mjs, 상세 설명 받을 곳 고르기) 양쪽에서 씀 — 다른 파일을 불러오지 않는 순수 함수만.

// 분류(lclsSystm3)별 기본 점수. 없는 분류는 아예 뺌 (근린공원·동상·비석·묘·약수터·도서관·문화원 등)
const W = {
  // 자연
  NA040100: 12, // 국립공원
  NA020900: 11, // 해수욕장·해변
  NA010400: 10, // 계곡
  NA010300: 10, // 폭포
  NA040700: 10, // 수목원·정원
  NA040600: 9, // 자연휴양림
  NA020800: 10, // 해안 절경
  NA020500: 9, // 섬
  NA030100: 10, // 동굴
  NA030300: 9, // 기암·주상절리
  NA030400: 9, // 습지
  NA030500: 8, // 협곡
  NA040200: 9, // 도립공원
  NA040300: 7, // 군립공원
  NA040400: 8, // 지질공원
  NA050100: 9, // 명승·경관
  NA020200: 8, // 호수
  NA010200: 7, // 숲
  NA010100: 6, // 산
  NA020400: 6, // 연못·늪
  NA020700: 5, // 항구·포구
  NA020100: 4, // 강
  // 역사
  HS010100: 7, // 궁·관아
  HS010200: 7, // 성
  HS010600: 9, // 민속마을·한옥마을
  HS010400: 5, // 고택
  HS011000: 5, // 유적지
  HS030100: 5, // 사찰
  HS030200: 5, // 성당·성지
  HS040100: 6, // 안보관광 (전망대·땅굴)
  // 볼거리·놀거리
  VE010200: 9, // 전망대
  VE010300: 8, // 다리 (출렁다리 등)
  VE010600: 6, // 터널
  VE010800: 7, // 등대
  VE020100: 9, // 테마파크
  VE020200: 9, // 워터파크
  VE020300: 7, // 동물원
  VE020400: 9, // 아쿠아리움
  VE020500: 7, // 천문대
  VE040100: 6, // 거리
  VE040200: 6, // 마을
  VE040300: 7, // 길 (둘레길·숲길)
  VE050100: 7, // 관광단지
  VE030100: 4, // 도시공원 (한강공원 등)
  VE030500: 4, // 테마공원
  VE070100: 6, // 박물관
  VE070500: 6, // 과학관
  VE070600: 5, // 미술관
  // 체험
  EX030200: 8, // 목장
  EX050100: 7, // 온천
  EX050600: 7, // 치유의 숲
  EX070100: 7, // 유람선
  EX060800: 4, // 농원·양조장
};

// 이름에 들어 있으면 더하거나 빼는 말
const PLUS = [
  [/국립공원/, 5], [/유네스코/, 5], [/세계유산/, 3], [/한옥마을/, 4], [/출렁다리/, 5], [/스카이워크/, 5], [/케이블카/, 4],
  [/레일바이크/, 4], [/해수욕장/, 3], [/해변/, 2], [/계곡/, 2], [/폭포/, 2], [/전망대/, 2], [/수목원/, 2], [/휴양림/, 1],
  [/[가-힣]궁$/, 5], [/민속촌/, 5], [/대교$/, 1], [/생태공원|습지/, 1], [/지질공원/, 1], [/(산|도립|군립)공원/, 1],
];
const MINUS = [
  [/약수|비석|송덕비|공적비|기념비|묘$|묘소|사당|재실|정려|효자|열녀|공덕|향교|서원지|사지$|요지$|선돌|석조|입상|부도/, -8],
  [/근린|소공원|어린이공원|체육공원|경로당|주차장|도서관|문화원|복지관/, -8],
  [/\(?폐쇄\)?|임시휴장|휴업|공사중/, -20],
];

// 인기 순위(티맵 연관 관광지)와 이름 맞추기용 — 띄어쓰기·괄호·기호를 뺀 이름
export const popKey = (s) =>
  String(s || '').replace(/\s|\(.*?\)|\[.*?\]|·|-|\/.*$/g, '').replace(/해수욕장$/, '해변').toLowerCase();
// 그 시·군·구 인기 순위에서 몇 위인지 (없으면 -1)
function popRank(p, pop) {
  const m = pop?.[`${p.rg}-${p.sg}`];
  if (!m) return -1;
  const k = popKey(p.t);
  const names = Object.keys(m);
  let i = names.indexOf(k);
  // '경포해수욕장' ↔ '경포해변' 처럼 앞부분이 같으면 같은 곳으로
  // '강릉 오죽헌·시립박물관' ↔ '오죽헌' 처럼 이름 안에 들어 있어도 같은 곳으로
  if (i < 0 && k.length >= 3) i = names.findIndex((n) => n.length >= 3 && (n.startsWith(k) || k.startsWith(n) || n.endsWith(k) || k.includes(n)));
  return i;
}

export function placeScore(p, detail, pop) {
  const r = popRank(p, pop);
  // 분류 목록에 없는 곳(시장·카페거리 등)도 그 지역 인기 15위 안이면 실음
  const base = W[p.c3] || (r >= 0 && r < 15 ? 4 : 0);
  if (!base || !p.img) return 0;
  let s = base;
  for (const [re, v] of PLUS) if (re.test(p.t)) s += v;
  for (const [re, v] of MINUS) if (re.test(p.t)) s += v;
  if (p.img2) s += 0.5;
  const o = detail?.o;
  if (o) s += o.length > 600 ? 2 : o.length > 250 ? 1 : 0;
  // 실제로 많이 찾는 곳 (티맵 이동 자료) — 순위가 높을수록 크게
  if (r >= 0) s += r < 5 ? 10 : r < 15 ? 7 : r < 30 ? 5 : 3;
  return s;
}

// 시·군·구 이름 — 같은 지역 번호를 가진 곳들의 주소 두 번째 낱말 중 가장 많이 나온 것.
// 수원시 장안구·권선구처럼 일반구는 시 하나로 묶음. 옛 광주광역시의 구는 '광주 ○구'.
export function districtKey(p) {
  return `${p.rg}-${p.sg || ''}`;
}
export function buildDistricts(list) {
  const cnt = {};
  for (const p of list) {
    const w = (p.a || '').trim().split(/\s+/);
    const name = w[1] || '';
    if (!name || /[로길]$|\d/.test(name)) continue;
    const k = districtKey(p);
    (cnt[k] ||= {})[name] = (cnt[k][name] || 0) + 1;
  }
  const out = {};
  for (const [k, m] of Object.entries(cnt)) {
    let name = Object.entries(m).sort((a, b) => b[1] - a[1])[0][0];
    const [rg, sg] = k.split('-');
    if (rg === '12' && /^(동|서|남|북|광산)구$/.test(name)) name = `광주 ${name}`;
    if (rg === '36110') name = '세종';
    out[k] = name;
  }
  return out;
}

// 시·군마다 점수 높은 순으로 최대 cap 곳. 같은 이름(설악산 내설악·남설악 등) 겹치는 것도 정리.
// 관광공사 자료에 '국립공원'(NA040100)으로 잘못 들어간 일반 공원 바로잡기 (예: 삼성해맞이공원)
const NP_NAME = /국립공원|생태탐방원|탐방안내소/;
export const fixCat = (p) => (p.c3 === 'NA040100' && !NP_NAME.test(p.t || '') ? { ...p, c3: 'VE030100' } : p);
// 같은 시설의 세부 장소(코엑스 → 코엑스 오디토리움·코엑스동측광장)는 대표 하나만
const baseKey = (t) => t.replace(/\s|\(.*?\)|\[.*?\]/g, '');
// 이름 앞 3글자 이상이 같고 500m 안이면 같은 시설로 봄 (국립중앙박물관·국립중앙도서관처럼 떨어진 곳은 따로)
const sameSite = (k, key, p) => {
  let n = 0;
  while (n < k.key.length && n < key.length && k.key[n] === key[n]) n++;
  if (n < 3) return false;
  const dx = (k.x - p.x) * 88, dy = (k.y - p.y) * 111; // km
  return Math.hypot(dx, dy) < 0.5;
};

export function pickPlaces(list, details = {}, { cap = 15, min = 7 } = {}, pop = null) {
  const dist = buildDistricts(list);
  const groups = {};
  for (const p0 of list) {
    const p = fixCat(p0);
    if (!p.x || !p.y || p.ty === '38') continue; // 쇼핑(시장)은 pickMarkets 에서 따로
    const sc = placeScore(p, details[p.id], pop);
    if (sc < min) continue;
    const name = dist[districtKey(p)] || '';
    const g = `${p.rg}|${name}`;
    (groups[g] ||= []).push({ p, sc, name });
  }
  // 시·군이 2곳 이하인 곳(제주·세종)은 한 곳에서 더 많이 보여 줌
  const nDist = {};
  for (const g of Object.keys(groups)) { const rg = g.split('|')[0]; nDist[rg] = (nDist[rg] || 0) + 1; }
  const out = [];
  for (const [g, arr] of Object.entries(groups)) {
    const capG = nDist[g.split('|')[0]] <= 2 ? cap * 3 : cap;
    arr.sort((a, b) => b.sc - a.sc || a.p.t.localeCompare(b.p.t, 'ko'));
    // 한 종류(해변·계곡 등)가 다 차지하지 않게 — 같은 분류는 먼저 4곳까지, 자리가 남으면 나머지로 채움
    const seen = new Set();
    const byCat = {};
    const pick = [];
    const left = [];
    const keys = [];
    for (const o of arr) {
      const key = baseKey(o.p.t);
      if (seen.has(key) || keys.some((k) => sameSite(k, key, o.p))) continue;
      seen.add(key);
      keys.push({ key, x: o.p.x, y: o.p.y });
      if ((byCat[o.p.c3] = (byCat[o.p.c3] || 0) + 1) <= 4) pick.push(o);
      else left.push(o);
    }
    const all = [...pick.slice(0, capG), ...left].slice(0, capG);
    all.sort((a, b) => b.sc - a.sc);
    out.push(...all);
  }
  return out;
}

// ── 시장·쇼핑 (한국관광공사 쇼핑 38) ──
// 관광객이 일부러 찾는 곳만: 그 지역 인기 순위(티맵)에 있는 시장·쇼핑 명소 우선,
// 순위에 없으면 이름으로 관광형 시장(관광·수산·어시장·야시장·민속·풍물·5일장 등)만. 백화점·마트·아울렛·면세점은 뺌.
const MK_NO = /약국|백화점|아울렛|아웃렛|면세|마트|홈플러스|코스트코|하나로|스타필드|쇼핑몰|몰$|상가|플라자|빌딩|타워|매장|대리점|직영점|[^시]점$|지하도|공판장|도매|가구|전자/;
const MK_MARKET = /시장|장터|5일장|오일장/;
const MK_TOUR = /관광|수산|어시장|야시장|민속|풍물|5일장|오일장|깡통|국제시장|중앙시장|올레|아리랑/;
export const isMarket = (p) => MK_MARKET.test(p.t || '');
export function marketScore(p, detail, pop) {
  if (!p.img || !p.x || !p.y || MK_NO.test(p.t || '')) return 0;
  const r = popRank(p, pop);
  const market = isMarket(p);
  let s = 0;
  if (r >= 0) s = 10 + (r < 5 ? 10 : r < 15 ? 7 : r < 30 ? 5 : 3);
  else if (market && MK_TOUR.test(p.t)) s = 7;
  if (!s) return 0;
  if (!market && r >= 30) return 0; // 시장이 아닌 쇼핑 명소는 인기 30위 안만
  const o = detail?.o;
  if (o) s += o.length > 400 ? 1 : 0;
  return s;
}
// 시·군마다 최대 cap 곳, 이미 관광지로 실린 이름은 빼고
export function pickMarkets(list, details = {}, { cap = 3 } = {}, pop = null, skipNames = new Set()) {
  const dist = buildDistricts(list);
  const groups = {};
  for (const p of list) {
    if (p.ty !== '38') continue;
    const sc = marketScore(p, details[p.id], pop);
    if (!sc) continue;
    const k = popKey(p.t);
    if (skipNames.has(k)) continue;
    const name = dist[districtKey(p)] || '';
    (groups[`${p.rg}|${name}`] ||= []).push({ p, sc, name, k });
  }
  // 시·군이 2곳 이하인 곳(제주·세종)은 한 곳에서 더 많이 보여 줌
  const nDist = {};
  for (const g of Object.keys(groups)) { const rg = g.split('|')[0]; nDist[rg] = (nDist[rg] || 0) + 1; }
  const out = [];
  for (const [g, arr] of Object.entries(groups)) {
    const capG = nDist[g.split('|')[0]] <= 2 ? cap * 3 : cap;
    arr.sort((a, b) => b.sc - a.sc || a.p.t.localeCompare(b.p.t, 'ko'));
    const seen = new Set();
    for (const o of arr) {
      if (seen.has(o.k)) continue;
      seen.add(o.k);
      out.push(o);
      if (seen.size >= cap) break;
    }
  }
  return out;
}
