// 쿠팡 파트너스 여행 준비물 (광고). url 이 비어 있으면 화면에 안 나옴.
// url 은 쿠팡 파트너스 '링크 생성'에서 쿠팡 검색 결과 주소로 만든 https://link.coupang.com/... 주소.
// 도시마다 조건(콘센트·이달 기온·해변·동남아·장거리·쇼핑)에 맞는 것 최대 3개.
import climate from './archive/climate.json';
import { bySlug as COUNTRY } from './countries.js';

export const CP_NOTE = '이 페이지는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';

// q = 쿠팡 검색어(링크 만들 때 쓴 말)
export const CP = {
  pig:      { ico: '🔌', label: '돼지코 어댑터', q: '여행용 돼지코', url: '' },
  multi:    { ico: '🔌', label: '만능 어댑터', q: '여행용 멀티어댑터', url: '' },
  battery:  { ico: '🔋', label: '보조배터리', q: '보조배터리 10000mAh', url: '' },
  pouch:    { ico: '🗜️', label: '압축 파우치', q: '여행용 압축파우치', url: '' },
  carrier:  { ico: '🧳', label: '캐리어', q: '여행용 캐리어', url: '' },
  scale:    { ico: '⚖️', label: '캐리어 저울', q: '캐리어 저울', url: '' },
  bag:      { ico: '👜', label: '접이식 보조가방', q: '여행용 접이식 보조가방', url: '' },
  pillow:   { ico: '💤', label: '목베개', q: '기내용 목베개', url: '' },
  water:    { ico: '💧', label: '휴대폰 방수팩', q: '휴대폰 방수팩', url: '' },
  mosquito: { ico: '🦟', label: '모기 기피제', q: '모기 기피제', url: '' },
  fan:      { ico: '🌬️', label: '휴대용 선풍기', q: '휴대용 선풍기', url: '' },
  hotpack:  { ico: '🔥', label: '핫팩', q: '휴대용 핫팩', url: '' },
};

// 여행 준비 페이지에 보일 공통 준비물 (순서대로)
export const CP_COMMON = ['battery', 'pouch', 'carrier', 'scale', 'bag', 'pillow', 'pig', 'multi'];

const BEACH = new Set(['okinawa', 'miyakojima', 'ishigaki', 'sanya', 'danang', 'nhatrang', 'phuquoc', 'phuket', 'pattaya', 'krabi', 'kohsamui', 'cebu', 'boracay', 'bohol', 'palawan', 'bali', 'kotakinabalu', 'penang', 'langkawi', 'guam', 'saipan', 'honolulu', 'cancun', 'goldcoast', 'santorini']);
const SHOPPING = new Set(['japan', 'taiwan', 'hongkong']);

// 콘센트: 어댑터가 필요하고 A 타입(11자)이면 돼지코, 아니면 만능 어댑터
export const adapterOf = (country) => {
  const co = COUNTRY[country];
  if (!co?.adapter) return '';
  return /^A/.test(co.plug || '') ? 'pig' : 'multi';
};

// 빌드하는 달(한국 시간) 기준 그 도시 평균 기온
const MONTH = +new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', month: 'numeric' }).format(new Date());

export function cpFor(city, country) {
  const co = COUNTRY[country] || {};
  const m = climate[city]?.m?.[MONTH - 1];
  const want = [
    adapterOf(country),
    m && m.hi >= 30 ? 'fan' : '',
    m && m.lo <= 2 ? 'hotpack' : '',
    BEACH.has(city) ? 'water' : '',
    co.region === 'sea' && !(m && m.hi < 25) ? 'mosquito' : '',
    co.region === 'far' || co.region === 'europe' ? 'pillow' : '',
    SHOPPING.has(country) ? 'scale' : '',
    'battery', 'bag', 'pouch',
  ];
  return [...new Set(want.filter((k) => k && CP[k]?.url))].slice(0, 3);
}

// 화면용: 주소가 있는 것만 [아이콘, 이름, 주소]
export const cpItems = (keys) => keys.filter((k) => CP[k]?.url).map((k) => [CP[k].ico, CP[k].label, CP[k].url]);
