// 국내여행 자료 — 한국관광공사 TourAPI 를 자동 수집한 것(archive/kr-*.json)을 화면용으로 정리
import fest from './archive/kr-festivals.json';
import places from './archive/kr-places.json';
import { KR_REGIONS } from './kr-regions.js';
import { pickPlaces, buildDistricts, districtKey } from './kr-pick.js';

// 상세 설명은 자동 수집이 며칠에 걸쳐 조금씩 채움 — 파일이 아직 없어도 사이트는 만들어지게
const dmod = import.meta.glob('./archive/kr-detail.json', { eager: true });
const DETAIL = Object.values(dmod)[0]?.default?.d || {};
export const detailOf = (id) => DETAIL[id] || null;
// 지역별 인기 순위 (티맵 연관 관광지, 한 달에 한 번) — 없으면 이름·분류 점수로만 고름
const pmod = import.meta.glob('./archive/kr-popular.json', { eager: true });
const POP = Object.values(pmod)[0]?.default?.s || null;

export { KR_REGIONS };
export const regionBySlug = Object.fromEntries(KR_REGIONS.map((r) => [r.slug, r]));
const regionByRg = Object.fromEntries(KR_REGIONS.map((r) => [r.rg, r]));
// 주소 첫 낱말로도 지역을 찾음 (지역 번호가 빠진 자료 대비)
const RG_WORD = [
  [/^서울/, '11'], [/^부산/, '26'], [/^대구/, '27'], [/^인천/, '28'], [/^대전/, '30'], [/^울산/, '31'], [/^세종/, '36110'],
  [/^경기/, '41'], [/^강원/, '51'], [/^충(청)?북/, '43'], [/^충(청)?남/, '44'], [/^전(라)?북|^전북/, '52'], [/^전남|^광주|^전라남/, '12'],
  [/^경(상)?북/, '47'], [/^경(상)?남/, '48'], [/^제주/, '50'],
];
export function regionOf(x) {
  if (x.rg && regionByRg[x.rg]) return regionByRg[x.rg];
  const w = (x.a || '').trim();
  for (const [re, rg] of RG_WORD) if (re.test(w)) return regionByRg[rg];
  return null;
}

// ── 날짜 (한국 시각) ──
const kst = (ms = Date.now()) => new Date(ms + 9 * 36e5);
const ymd = (d) => d.toISOString().slice(0, 10).replace(/-/g, '');
export const TODAY = ymd(kst());
const dow = kst().getUTCDay(); // 0 일 ~ 6 토
const addDays = (n) => ymd(new Date(kst().getTime() + n * 864e5));
// 이번 주말 — 오늘이 토·일이면 이번 주말, 아니면 다가오는 토·일
export const WEEKEND = dow === 6 ? [TODAY, addDays(1)] : dow === 0 ? [addDays(-1), TODAY] : [addDays(6 - dow), addDays(7 - dow)];
export const fmtD = (s) => (s ? `${+s.slice(4, 6)}.${+s.slice(6, 8)}` : '');
export const fmtFull = (s) => (s ? `${s.slice(0, 4)}년 ${+s.slice(4, 6)}월 ${+s.slice(6, 8)}일` : '');
const WD = ['일', '월', '화', '수', '목', '금', '토'];
export const fmtDW = (s) => {
  if (!s) return '';
  const d = new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8)));
  return `${+s.slice(4, 6)}.${+s.slice(6, 8)}(${WD[d.getUTCDay()]})`;
};

// ── 사진 (한국관광공사, 공공누리) ──
// http 로 오는 주소는 https 로. 사진 자체는 고치지 않고 그대로 보여 줌.
export const imgUrl = (u) => (u ? u.replace(/^http:\/\//, 'https://') : '');

// ── 거리 ──
export function km(a, b) {
  const R = 6371, toR = Math.PI / 180;
  const dLat = (b.y - a.y) * toR, dLon = (b.x - a.x) * toR;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.y * toR) * Math.cos(b.y * toR) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// ── 분류 이름 (lclsSystm3 → 보기 좋은 말) ──
const CAT = {
  NA040100: '국립공원', NA020900: '해변', NA010400: '계곡', NA010300: '폭포', NA040700: '수목원·정원', NA040600: '자연휴양림',
  NA020800: '해안 절경', NA020500: '섬', NA030100: '동굴', NA030300: '기암·절리', NA030400: '습지', NA030500: '협곡',
  NA040200: '도립공원', NA040300: '군립공원', NA040400: '지질공원', NA050100: '명승·경관', NA020200: '호수', NA010200: '숲',
  NA010100: '산', NA020400: '연못·늪', NA020700: '항구·포구', NA020100: '강',
  HS010100: '궁·관아', HS010200: '성곽', HS010600: '민속·한옥마을', HS010400: '고택', HS011000: '유적지', HS030100: '사찰',
  HS030200: '성당·성지', HS040100: '안보관광',
  VE010200: '전망대', VE010300: '다리', VE010600: '터널', VE010800: '등대', VE020100: '테마파크', VE020200: '워터파크',
  VE020300: '동물원', VE020400: '아쿠아리움', VE020500: '천문대', VE040100: '거리', VE040200: '마을', VE040300: '걷기 길',
  VE050100: '관광단지', VE030100: '공원', VE030500: '테마공원', VE070100: '박물관', VE070500: '과학관', VE070600: '미술관',
  EX030200: '목장', EX050100: '온천', EX050600: '치유의 숲', EX070100: '유람선', EX060800: '농원·양조장',
};
export const catOf = (c3) => CAT[c3] || '관광지';
// 큰 묶음 (지역 페이지 고르기 버튼)
export const THEMES = [
  ['sea', '바다·섬', /^NA02(05|07|08|09)|^VE0108/],
  ['valley', '계곡·폭포', /^NA010[34]|^NA0305/],
  ['forest', '숲·수목원', /^NA0102|^NA040[67]|^EX0506/],
  ['mountain', '산·국립공원', /^NA0101|^NA040[1-4]|^NA0303|^NA0301/],
  ['history', '역사·한옥', /^HS/],
  ['view', '전망·다리', /^VE010[236]/],
  ['fun', '테마파크·체험', /^VE02|^VE05|^EX0[367]|^EX0501/],
  ['culture', '박물관·미술관', /^VE07/],
  ['walk', '거리·마을·길', /^VE04|^VE03|^NA020[124]|^NA050/],
];
export const themeOf = (c3) => (THEMES.find(([, , re]) => re.test(c3 || '')) || ['etc'])[0];

// ── 관광지 (골라 둔 곳만) ──
const ALL_PLACES = places?.list || [];
const DIST = buildDistricts(ALL_PLACES);
export const PLACES = pickPlaces(ALL_PLACES, DETAIL, { cap: 13, min: 7 }, POP)
  .map(({ p, sc, name }) => ({ ...p, sc, dist: name, region: regionOf(p) }))
  .filter((p) => p.region);
export const placeById = Object.fromEntries(PLACES.map((p) => [p.id, p]));
export const placesOfRegion = (slug) => PLACES.filter((p) => p.region.slug === slug);
export const districtOf = (p) => DIST[districtKey(p)] || '';

// ── 축제 ──
export const FESTIVALS = (fest?.list || [])
  .filter((f) => f.s && f.e && f.t)
  .map((f) => ({ ...f, region: regionOf(f), dist: DIST[districtKey(f)] || (f.a || '').split(/\s+/)[1] || '' }))
  .filter((f) => f.region);
export const festById = Object.fromEntries(FESTIVALS.map((f) => [f.id, f]));
export const festStatus = (f) => (f.e < TODAY ? 'end' : f.s > TODAY ? 'soon' : 'now');
const byStart = (a, b) => a.s.localeCompare(b.s) || a.e.localeCompare(b.e);
// 몇 달씩 이어지는 상설 전시·행사는 '축제'로 보기 어려워서 목록 맨 앞에는 안 둠 (60일 넘는 것)
export const longRun = (f) => {
  const d = (s) => Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8));
  return (d(f.e) - d(f.s)) / 864e5 > 60;
};
export const festNow = () => FESTIVALS.filter((f) => festStatus(f) === 'now').sort((a, b) => longRun(a) - longRun(b) || a.e.localeCompare(b.e));
export const festSoon = (days = 60) => {
  const lim = addDays(days);
  return FESTIVALS.filter((f) => f.s > TODAY && f.s <= lim).sort(byStart);
};
export const festWeekend = () =>
  FESTIVALS.filter((f) => f.s <= WEEKEND[1] && f.e >= WEEKEND[0]).sort((a, b) => longRun(a) - longRun(b) || byStart(a, b));
export const festOfRegion = (slug) => FESTIVALS.filter((f) => f.region.slug === slug && f.e >= TODAY).sort(byStart);
// 앞으로 12달 (이번 달부터)
export const MONTHS_AHEAD = Array.from({ length: 12 }, (_, i) => {
  const d = kst();
  const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + i, 1));
  return { ym: `${m.getUTCFullYear()}${String(m.getUTCMonth() + 1).padStart(2, '0')}`, y: m.getUTCFullYear(), m: m.getUTCMonth() + 1 };
});
// 그 달에 하루라도 열리는 축제
export const inMonth = (f, ym) => f.s.slice(0, 6) <= ym && f.e.slice(0, 6) >= ym;

// 가까운 곳 (거리순)
export function nearPlaces(pt, n = 6, maxKm = 25, skipId = '') {
  return PLACES.filter((p) => p.id !== skipId)
    .map((p) => ({ p, d: km(pt, p) }))
    .filter((o) => o.d <= maxKm)
    .sort((a, b) => a.d - b.d)
    .slice(0, n);
}
export function nearFests(pt, n = 4, maxKm = 30) {
  return FESTIVALS.filter((f) => f.e >= TODAY && f.x && f.y)
    .map((f) => ({ f, d: km(pt, f) }))
    .filter((o) => o.d <= maxKm)
    .sort((a, b) => a.f.s.localeCompare(b.f.s))
    .slice(0, n);
}

// 지도 앱으로 열기 (카카오맵·네이버 지도) — 좌표와 이름만 넘김
export const kakaoMap = (x) => `https://map.kakao.com/link/map/${encodeURIComponent(x.t)},${x.y},${x.x}`;
export const naverMap = (x) => `https://map.naver.com/p/search/${encodeURIComponent(x.t)}`;

export const KR_READY = FESTIVALS.length > 0 || PLACES.length > 0;
