// 어디서나 검색에 쓰는 목록 (사이트를 만들 때 한 번 만들어서 페이지에 넣음)
import { COUNTRIES, flagOf } from './countries.js';
import { CITIES } from './cities.js';
import { GUIDES } from './guides.js';
import { countryAlarm, ALARM_KO, countryRate } from './load.js';
import { HAS_CLIMATE } from './weather.js';

const guideSet = new Set(GUIDES.map((g) => g.city));

// 다른 이름·옛 이름·영어로도 찾히게 (예: 냐짱 → 나트랑)
const ALIAS = {
  tokyo: '동경 tokyo', osaka: '난바 도톤보리 우메다', kyoto: '경도', fukuoka: '하카타 텐진', sapporo: '홋카이도 북해도 오타루', okinawa: '나하 오키나와현',
  nagoya: '나고야성', shanghai: '상해', beijing: '북경 뻬이징', qingdao: '청도 칭따오', weihai: '위해', zhangjiajie: '장자제 장가계',
  taipei: '타이페이 대북 지우펀 예류', kaohsiung: '까오슝 고웅', hongkong: '홍꽁 침사추이 마카오',
  danang: '다 낭 호이안 바나힐', nhatrang: '냐짱 나짱 냐트랑 깜란', phuquoc: '푸꿕 푸국', hanoi: '하롱베이 하롱', hochiminh: '호찌민 호치민시 사이공 hcmc',
  bangkok: '방꼭', phuket: '빠통 피피섬', chiangmai: '치앙라이', pattaya: '파타야',
  cebu: '막탄', boracay: '보라', bohol: '팡라오', manila: '마닐라',
  bali: '우붓 덴파사르 꾸따 스미냑', kotakinabalu: '코키 코타 키나발루', kualalumpur: '쿠알라 kl 쿠알라룸프르',
  guam: '투몬', saipan: '사이빤', honolulu: '하와이 와이키키 오아후',
  newyork: '뉴욕시 nyc 맨해튼', losangeles: '로스앤젤레스 엘에이 la', sanfrancisco: '샌프란 샌프', lasvegas: '베가스', cancun: '칸쿤',
  goldcoast: '골코',
  hangzhou: '항주 서호', guangzhou: '광주 광동', shenzhen: '심천', shenyang: '심양', dalian: '대련', nanjing: '남경', yantai: '연대', harbin: '하얼삔 빙등제',
  taichung: '대중 타이충', ulaanbaatar: '울란바타르 울란바아타르 테를지 몽고', kagoshima: '사쿠라지마', matsuyama: '도고온천 시코쿠', takamatsu: '나오시마 시코쿠', shizuoka: '후지산', queenstown: '퀸즈타운', cappadocia: '괴레메 카파도키아', santorini: '이아 피라', venice: '베네치아', florence: '피렌체', rome: '로마',
};

export const SEARCH_INDEX = COUNTRIES.map((c) => {
  const al = countryAlarm(c);
  const rate = countryRate(c);
  const cities = CITIES.filter((x) => x.country === c.slug).map((x) => ({
    s: x.slug,
    k: x.ko,
    e: `${x.photoQ || ''} ${ALIAS[x.slug] || ''}`.toLowerCase(),
    g: guideSet.has(x.slug) ? 1 : 0,
    w: HAS_CLIMATE(x.slug) ? 1 : 0,
  }));
  return {
    s: c.slug,
    k: c.ko,
    f: flagOf(c),
    e: `${c.slug} ${(c.photoQ || '').toLowerCase()} ${c.cities.join(' ')}`,
    a: al && al.max ? `외교부 ${al.levels.every((l) => /일부/.test(l.region)) ? '일부 지역 ' : ''}${al.max}단계 ${ALARM_KO[al.max].label}` : '',
    r: rate ? rate.line1 : '',
    c: cities,
  };
});

// 트립베리에 아직 없는 나라를 찾을 때 — 외교부 여행경보만이라도 보여 줌
import alarmsAll from './archive/alarms.json';
export const ALARM_INDEX = Object.values(alarmsAll || {}).map((a) => [
  a.name,
  String(a.en || '').split(/[:(]/)[0].trim().toLowerCase(),
  String(a.iso || '').toLowerCase(),
  a.max || 0,
  a.levels?.length ? a.levels.every((l) => /일부/.test(l.region)) : false,
]);
