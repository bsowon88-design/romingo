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
export const klookSearch = (q) =>
  `https://click.linkprice.com/click.php?m=klook&a=${LP_SITE}&l=9999&l_cd1=3&l_cd2=0&tu=${encodeURIComponent(`https://www.klook.com/ko/search/result/?query=${encodeURIComponent(q)}`)}`;

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
export const agodaCity = (city) =>
  AGODA_CITY[city]
    ? `https://click.linkprice.com/click.php?m=agoda&a=${LP_SITE}&l=9999&l_cd1=3&l_cd2=0&tu=${encodeURIComponent(`https://www.agoda.com/ko-kr/city/${AGODA_CITY[city]}.html`)}`
    : '';
