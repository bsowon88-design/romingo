// 나라별 페이지 목록 — 한국인이 많이 가는 곳 위주.
// keys: USGS 지진 위치 글(영어)에 들어 있으면 이 나라로 봄 (소문자)
// states: 위치 글의 맨 끝이 정확히 이 말이면 이 나라로 봄
// iso3: GDACS 재난 경보의 나라 코드
export const COUNTRIES = [
  { slug: 'japan', ko: '일본', flag: '🇯🇵', iso3: ['JPN'],
    keys: ['japan', 'honshu', 'hokkaido', 'kyushu', 'shikoku', 'ryukyu', 'izu islands', 'bonin islands', 'volcano islands'] },
  { slug: 'china', ko: '중국', flag: '🇨🇳', iso3: ['CHN'],
    keys: ['china', 'xizang', 'tibet', 'sichuan', 'yunnan', 'xinjiang', 'qinghai', 'gansu'] },
  { slug: 'taiwan', ko: '대만', flag: '🇹🇼', iso3: ['TWN'], keys: ['taiwan'] },
  { slug: 'vietnam', ko: '베트남', flag: '🇻🇳', iso3: ['VNM'], keys: ['vietnam'] },
  { slug: 'thailand', ko: '태국', flag: '🇹🇭', iso3: ['THA'], keys: ['thailand'] },
  { slug: 'philippines', ko: '필리핀', flag: '🇵🇭', iso3: ['PHL'], keys: ['philippines', 'mindanao', 'luzon'] },
  { slug: 'indonesia', ko: '인도네시아', flag: '🇮🇩', iso3: ['IDN'],
    keys: ['indonesia', 'sumatra', 'java', 'bali', 'sulawesi', 'banda sea', 'molucca', 'halmahera', 'flores sea', 'lombok'] },
  { slug: 'malaysia', ko: '말레이시아', flag: '🇲🇾', iso3: ['MYS'], keys: ['malaysia', 'sabah', 'sarawak'] },
  { slug: 'singapore', ko: '싱가포르', flag: '🇸🇬', iso3: ['SGP'], keys: ['singapore'] },
  { slug: 'guam-saipan', ko: '괌·사이판', short: '마리아나 제도(괌·사이판)', flag: '🏝️', iso3: ['GUM', 'MNP'], keys: ['guam', 'mariana'] },
  { slug: 'hawaii', ko: '하와이', flag: '🌺', iso3: [], keys: ['hawaii'] },
  { slug: 'usa', ko: '미국 본토·알래스카', short: '미국', flag: '🇺🇸', iso3: ['USA'],
    keys: ['california', 'alaska', 'new mexico', 'nevada', 'oregon', 'washington', 'utah', 'idaho', 'montana', 'wyoming'],
    states: ['ca', 'ak', 'nv', 'or', 'wa', 'ut', 'id', 'mt', 'wy'] },
  { slug: 'mexico', ko: '멕시코', flag: '🇲🇽', iso3: ['MEX'], keys: ['mexico', 'baja california'] },
  { slug: 'australia', ko: '호주', flag: '🇦🇺', iso3: ['AUS'], keys: ['australia'] },
  { slug: 'new-zealand', ko: '뉴질랜드', flag: '🇳🇿', iso3: ['NZL'], keys: ['new zealand', 'kermadec'] },
  { slug: 'turkiye', ko: '튀르키예', flag: '🇹🇷', iso3: ['TUR'], keys: ['turkey', 'türkiye', 'turkiye'] },
  { slug: 'greece', ko: '그리스', flag: '🇬🇷', iso3: ['GRC'], keys: ['greece', 'crete', 'aegean'] },
  { slug: 'italy', ko: '이탈리아', flag: '🇮🇹', iso3: ['ITA'], keys: ['italy', 'sicily'] },
  { slug: 'nepal', ko: '네팔', flag: '🇳🇵', iso3: ['NPL'], keys: ['nepal'] },
];

// 나라 페이지는 없지만 이름은 한국어로 보여 줄 곳
export const EXTRA_KO = {
  chile: '칠레', peru: '페루', ecuador: '에콰도르', colombia: '콜롬비아', argentina: '아르헨티나',
  bolivia: '볼리비아', guatemala: '과테말라', 'el salvador': '엘살바도르', nicaragua: '니카라과',
  'costa rica': '코스타리카', panama: '파나마', honduras: '온두라스', 'puerto rico': '푸에르토리코',
  tonga: '통가', fiji: '피지', vanuatu: '바누아투', samoa: '사모아', 'papua new guinea': '파푸아뉴기니',
  'solomon islands': '솔로몬 제도', 'new caledonia': '뉴칼레도니아', 'timor leste': '동티모르', 'east timor': '동티모르',
  russia: '러시아', kamchatka: '러시아 캄차카', 'kuril islands': '쿠릴 열도', mongolia: '몽골',
  iran: '이란', iraq: '이라크', afghanistan: '아프가니스탄', pakistan: '파키스탄', india: '인도',
  myanmar: '미얀마', bangladesh: '방글라데시', tajikistan: '타지키스탄', kyrgyzstan: '키르기스스탄',
  kazakhstan: '카자흐스탄', uzbekistan: '우즈베키스탄', 'south africa': '남아프리카공화국',
  iceland: '아이슬란드', portugal: '포르투갈', spain: '스페인', algeria: '알제리', morocco: '모로코',
  'south sandwich islands': '사우스샌드위치 제도', 'mid-atlantic ridge': '대서양 중앙 해령',
  'east pacific rise': '동태평양 해령', 'macquarie island': '매쿼리섬', antarctica: '남극',
};

export const bySlug = Object.fromEntries(COUNTRIES.map((c) => [c.slug, c]));

const ISO_TO_SLUG = {};
for (const c of COUNTRIES) for (const i of c.iso3) ISO_TO_SLUG[i] = c.slug;
export function slugFromIso3(iso3) {
  return ISO_TO_SLUG[iso3] || null;
}
