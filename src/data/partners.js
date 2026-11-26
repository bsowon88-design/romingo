// 여행 준비 제휴 링크 (링크프라이스). url 이 비어 있으면 화면에 안 나옴.
// 장점은 각 업체 공식 앱스토어 설명·공식 사이트에서 확인한 것만 (2026-11-25 확인).
export const AD_NOTE = '이 링크로 구매·예약하면 트립베리가 제휴 수수료를 받을 수 있어요. 여러분이 내는 가격은 똑같아요.';

export const CATS = [
  { id: 'data', ico: '📶', name: '데이터 (eSIM·유심)', lead: '도착하자마자 지도·번역·택시 앱을 쓰려면 데이터부터 준비하세요. eSIM은 휴대폰이 eSIM을 지원해야 쓸 수 있어요.' },
  { id: 'flight', ico: '✈️', name: '항공권', lead: '출발이 가까울수록 남은 좌석을 싸게 파는 "땡처리" 항공권이 나와요. 날짜를 정하지 않았다면 먼저 둘러보세요.' },
  { id: 'tour', ico: '🎟️', name: '투어·입장권', lead: '테마파크·전망대 입장권이나 하루 투어는 미리 사 두면 현장 줄을 줄일 수 있어요.' },
  { id: 'stay', ico: '🏨', name: '숙소', lead: '가이드의 "숙소 잡기 좋은 곳"을 먼저 보고, 그 동네로 찾으면 빨라요.' },
  { id: 'car', ico: '🚗', name: '렌터카', lead: '일본에서 운전하려면 국제운전면허증과 여권, 한국 면허증이 필요해요. 일본은 왼쪽 통행이에요.' },
];

export const PARTNERS = [
  {
    id: 'dosirak', cat: 'data', name: '도시락eSIM', url: 'https://click.linkprice.com/click.php?m=dosirak1&a=A100710605&l=0000',
    best: '결제와 동시에 발급되는 eSIM, 도착하자마자 바로 연결',
    pros: ['365일 24시간, 사면 바로 eSIM 발급', '140여 개국 · 1~180일 상품', '도시락eSIM 고객은 해외 통화 100분 무료 (앱 안내)'],
  },
  {
    id: 'usimsa', cat: 'data', name: '유심사', url: 'https://click.linkprice.com/click.php?m=usimsa&a=A100710605&l=0000',
    best: '여행 중에도 앱 하나로 충전·연장까지 자유로운 eSIM·유심',
    pros: ['365일 24시간 고객센터', '앱에서 데이터 사용량 조회·충전·연장', '유심사케어: 통신 장애로 생긴 비용 보장 (적용 상품만)'],
  },
  {
    id: 'klook', cat: 'tour', name: '클룩', url: 'https://click.linkprice.com/click.php?m=klook&a=A100710605&l=0000',
    best: '입장권부터 교통 패스까지, 여행 일정을 앱 하나에 담다',
    pros: ['입장권·투어·기차·버스·페리까지 한 곳에서', '바우처를 미리 받아 두면 인터넷 없이도 보여 줄 수 있음', '회원 등급별 할인 코드'],
  },
  {
    id: 'myrealtrip', cat: 'tour', name: '마이리얼트립', url: 'https://click.linkprice.com/click.php?m=myrealtrip&a=A100710605&l=0000',
    best: '한국어 상담으로 더 세심하게 준비하는 현지 투어',
    pros: ['한국 회사 · 한국어 상담', '투어·액티비티 2만 9천여 개', '항공권·숙소·렌터카·여행자 보험도 함께'],
  },
  {
    id: 'agoda', cat: 'stay', name: '아고다', url: 'https://click.linkprice.com/click.php?m=agoda&a=A100710605&l=0000',
    best: '아시아 곳곳의 숙소를 합리적인 가격으로 엄선',
    pros: ['전 세계 숙소 450만 곳 이상', '네이버페이 등 간편결제', '회원·앱 전용 특가'],
  },
  {
    id: 'hotelscombined', cat: 'stay', name: '호텔스컴바인', url: 'https://click.linkprice.com/click.php?m=hcombine2&a=A100710605&l=0000',
    best: '주요 예약 사이트의 요금을 한눈에 비교하는 현명한 선택',
    pros: ['아고다·호텔스닷컴·트립닷컴·부킹닷컴 등 가격을 한 화면에', '찜한 호텔 값이 내려가면 알림', '항공편·렌터카도 같이 비교'],
  },
  {
    id: 'ttang', cat: 'flight', name: '땡처리닷컴', url: 'https://click.linkprice.com/click.php?m=072com&a=A100710605&l=0000',
    best: '출발이 임박한 특가 항공권을 가장 먼저 만나는 곳',
    pros: ['땡처리 전문 여행사 (마감 임박 특가)', '항공권·호텔·패키지·입장권·여행자 보험까지', '회원가입 없이도 예약 가능'],
  },
  {
    id: 'toyota', cat: 'car', name: '도요타렌터카', url: 'https://click.linkprice.com/click.php?m=toyotarent&a=A100710605&l=0000', only: ['japan'],
    best: '한국어 지원으로 처음 떠나는 일본 드라이브도 여유롭게',
    pros: ['한국어 예약 사이트', '대여·반납 때 한국어 영상 통역 (영업시간)', '운전 중 문제는 한국어 채팅·전화 통역'],
  },
];

export const partnersOf = (cat, country) =>
  PARTNERS.filter((p) => p.cat === cat && p.url && (!p.only || !country || p.only.includes(country)));

// 여행 준비 가이드 글 — /prep/{slug}/ (글은 src/pages/prep/{slug}.astro)
export const PREP_GUIDES = [
  { slug: 'japan-esim', cat: 'data', country: 'japan', title: '일본 eSIM 고르는 법: 도시락eSIM vs 유심사', short: '일본 eSIM 고르는 법', desc: '로컬망·로밍망 차이, 무제한과 매일 ○GB 중 고르는 법, 사기 전에 확인할 4가지', date: '2026-11-25' },
];

// 클룩 검색 결과로 바로 가는 링크 (링크프라이스 딥링크, 트립베리 사이트 번호)
// 검색 주소 모양은 2026-11-26 사장님 화면에서 확인: https://www.klook.com/ko/search/result/?query=…
export const LP_SITE = 'A100710605';
// 링크프라이스 딥링크 — m: 업체 코드, url: 보낼 업체 페이지
export const lpDeep = (m, url) => `https://click.linkprice.com/click.php?m=${m}&a=${LP_SITE}&l=9999&l_cd1=3&l_cd2=0&tu=${encodeURIComponent(url)}`;
export const klookSearch = (q) => lpDeep('klook', `https://www.klook.com/ko/search/result/?query=${encodeURIComponent(q)}`);
// 마이리얼트립 검색 결과 (2026-11-26 사장님 화면에서 확인: https://www.myrealtrip.com/search?q=다낭)
export const mrtSearch = (q) => lpDeep('myrealtrip', `https://www.myrealtrip.com/search?q=${encodeURIComponent(q)}`);

// 아고다 도시 숙소 페이지 (링크프라이스 딥링크) — 주소 이름은 도시마다 달라서 확인한 곳만.
// 2026-11-26: ✔ = 아고다 실제 페이지 확인 / 나머지는 규칙(영어이름-나라코드)이 분명한 곳. 새 도시는 확인 후 추가.
export const AGODA_CITY = {
  tokyo: 'tokyo-jp', osaka: 'osaka-jp' /* ✔ */, kyoto: 'kyoto-jp', fukuoka: 'fukuoka-jp', sapporo: 'sapporo-jp',
  okinawa: 'okinawa-main-island-jp' /* ✔ */, nagoya: 'nagoya-jp',
  danang: 'da-nang-vn' /* ✔ */, nhatrang: 'nha-trang-vn' /* ✔ */, phuquoc: 'phu-quoc-island-vn' /* ✔ */, hanoi: 'hanoi-vn',
  hochiminh: 'ho-chi-minh-city-vn' /* ✔ */, dalat: 'dalat-vn' /* ✔ */,
  bangkok: 'bangkok-th', phuket: 'phuket-th', chiangmai: 'chiang-mai-th' /* ✔ */, pattaya: 'pattaya-th',
  cebu: 'cebu-ph' /* ✔ */, boracay: 'boracay-island-ph' /* ✔ */,
  taipei: 'taipei-tw', hongkong: 'hong-kong-hk' /* ✔ */, macau: 'macau-mo' /* ✔ */, singapore: 'singapore-sg',
  bali: 'bali-id' /* ✔ */, kotakinabalu: 'kota-kinabalu-my' /* ✔ */, kualalumpur: 'kuala-lumpur-my' /* ✔ */,
  guam: 'guam-gu' /* ✔ */, saipan: 'saipan-mp' /* ✔ */, shanghai: 'shanghai-cn', qingdao: 'qingdao-cn',
};
export const agodaCity = (city) => (AGODA_CITY[city] ? lpDeep('agoda', `https://www.agoda.com/ko-kr/city/${AGODA_CITY[city]}.html`) : '');

// 도시락eSIM 나라별 상품 목록 (2026-11-26 확인: https://www.dosirakesim.com/Product/List?cId=JPN — 나라 3글자 코드)
import { bySlug as COUNTRY } from './countries.js';
import isoCountries from 'i18n-iso-countries';
export function dosirakCountry(slug) {
  const c = COUNTRY[slug];
  const iso2 = c?.iso2?.[0] || (slug === 'hawaii' ? 'US' : '');
  const iso3 = iso2 && isoCountries.alpha2ToAlpha3(iso2);
  return iso3 ? lpDeep('dosirak1', `https://www.dosirakesim.com/Product/List?cId=${iso3}`) : '';
}
// 화면에 쓸 링크 — 나라가 정해진 곳에서는 업체 첫 화면 대신 그 나라 상품으로
export const partnerUrl = (p, country) => (country && ((p.id === 'dosirak' && dosirakCountry(country)) || (p.id === 'usimsa' && usimsaCountry(country)))) || p.url;

// 유심사 나라별 상품 (2026-11-26 확인: usimsa.com/product/more 의 나라 목록 · https://shop.usimsa.com/sim/<나라 코드>)
// 유심사에 없는 나라(네팔·우즈베키스탄)는 첫 화면으로
const G = '-6A69-EE11-BBF0-28187860D6D3', H = '-836E-EE11-BBF0-28187860D6D3';
export const USIMSA_SIM = {
  japan: '179D30E5' + G, china: '1B9D30E5' + G, vietnam: '1A9D30E5' + G, taiwan: '189D30E5' + G,
  philippines: '1F9D30E5' + G, thailand: '199D30E5' + G, malaysia: '1E9D30E5' + G, usa: '1C9D30E5' + G,
  hawaii: '1C9D30E5' + G, indonesia: '239D30E5' + G, australia: '2A9D30E5' + G, hongkong: '219D30E5' + G,
  'guam-saipan': '209D30E5' + G, macau: '229D30E5' + G, singapore: '1D9D30E5' + G, uae: '289D30E5' + G,
  germany: '259D30E5' + G, uk: '279D30E5' + G, italy: '299D30E5' + G, france: '269D30E5' + G,
  mongolia: 'B2578299' + H, mexico: 'BE578299' + H, spain: 'B4578299' + H, cambodia: 'BD578299' + H,
  canada: 'B3578299' + H,
  greece: '10E06A0B-2F5A-F111-8FCB-002248F6DB4A', 'new-zealand': 'A2472A10-7BDB-EE11-85F9-002248F774EE',
  laos: 'B83E155F-8BAE-EE11-BE9E-002248F7DBDD', switzerland: 'BEA57CC8-92DB-EE11-85F9-002248F774EE',
  czechia: '3CCB0AB2-0433-F111-9A49-002248F610B2', turkiye: 'D68AECFE-93DB-EE11-85F9-002248F774EE',
};
export const usimsaCountry = (slug) => (USIMSA_SIM[slug] ? lpDeep('usimsa', `https://shop.usimsa.com/sim/${USIMSA_SIM[slug]}`) : '');

// 호텔스컴바인 도시 호텔 페이지 (2026-11-26 확인: https://www.hotelscombined.co.kr/Place/<이름>.htm — 30곳 모두 제목 확인)
export const HC_PLACE = { tokyo:'Tokyo', osaka:'Osaka', kyoto:'Kyoto', fukuoka:'Fukuoka', sapporo:'Sapporo', okinawa:'Okinawa_Prefecture', nagoya:'Nagoya', danang:'Da_Nang', nhatrang:'Nha_Trang', phuquoc:'Phu_Quoc', hanoi:'Hanoi', hochiminh:'Ho_Chi_Minh_City', dalat:'Da_Lat', bangkok:'Bangkok', phuket:'Phuket', chiangmai:'Chiang_Mai_Province', pattaya:'Pattaya', cebu:'Cebu', boracay:'Boracay', taipei:'Taipei', hongkong:'Hong_Kong', macau:'Macau', singapore:'Singapore', bali:'Bali', kotakinabalu:'Kota_Kinabalu', kualalumpur:'Kuala_Lumpur', guam:'Guam', saipan:'Saipan', shanghai:'Shanghai', qingdao:'Qingdao' };
export const hcCity = (city) => (HC_PLACE[city] ? lpDeep('hcombine2', `https://www.hotelscombined.co.kr/Place/${HC_PLACE[city]}.htm`) : '');

// 땡처리닷컴 검색 (2026-11-26 사장님 확인: https://www.ttang.com/search/search_list.do?srh_keyword=다낭)
export const ttangSearch = (q) => lpDeep('072com', `https://www.ttang.com/search/search_list.do?srh_keyword=${encodeURIComponent(q)}`);

// NOL(야놀자) 국내 숙소 검색 (2026-11-26 확인: 지역 이름만 바꾸면 됨, 날짜는 NOL 이 오늘로 채움)
export const NOL_BASE = 'https://nol.yanolja.com/discovery/list/search/PRODUCT_CATEGORY_KOREA_ACCOMMODATION?q=';
export const NOL_PRE = lpDeep('yanolja', '');
export const nolSearch = (q) => lpDeep('yanolja', NOL_BASE + encodeURIComponent(q));
// 검색어: 시·군은 '시/군' 떼고(강릉시→강릉), 구는 시도 붙여서(서울 중구), 고성처럼 겹치는 이름은 시도 붙임
export function nolQ(regionKo, dist = '') {
  const r = regionKo.replace('전남·광주', '전남');
  if (!dist) return r;
  if (/\s/.test(dist)) return dist;
  if (/구$/.test(dist)) return `${r} ${dist}`;
  const s = dist.length >= 3 ? dist.replace(/[시군]$/, '') : dist;
  return s === '고성' ? `${r} ${s}` : s;
}

// 라쿠텐 트래블 일본 도시 호텔 목록 (2026-11-26 확인: 날짜 없이 열림, 17곳 모두 제목·숙소 수 확인)
const RK = 'https://travel.rakuten.com/kor/ko-kr/hotel_list/cnt_japan/';
export const RAKUTEN_CITY = {
  tokyo: 'sub_tokyo/', osaka: 'sub_osaka/cty_osaka_city/', kyoto: 'sub_kyoto/cty_kyoto_city/',
  fukuoka: 'sub_fukuoka_prefecture/cty_fukuoka_city/', sapporo: 'sub_hokkaido/cty_sapporo_city/', okinawa: 'sub_okinawa/',
  nagoya: 'sub_aichi_prefecture/cty_nagoya_city/', kagoshima: 'sub_kagoshima_prefecture/cty_kagoshima_city/',
  kobe: 'sub_hyogo_prefecture/cty_kobe_city/', miyakojima: 'sub_okinawa/cty_miyakojima_city/', ishigaki: 'sub_okinawa/cty_ishigaki_city/',
  hiroshima: 'sub_hiroshima_prefecture/cty_hiroshima_city/', kumamoto: 'sub_kumamoto_prefecture/cty_kumamoto_city/',
  oita: 'sub_oita_prefecture/', matsuyama: 'sub_ehime_prefecture/cty_matsuyama_city/',
  takamatsu: 'sub_kagawa_prefecture/cty_takamatsu_city/', shizuoka: 'sub_shizuoka_prefecture/',
};
export const rakutenCity = (city) => (RAKUTEN_CITY[city] ? lpDeep('rakutentr', RK + RAKUTEN_CITY[city]) : '');
