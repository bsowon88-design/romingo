// 나라별 페이지 목록 — 한국인이 많이 가는 곳 위주.
// keys: USGS 지진 위치 글(영어)에 들어 있으면 이 나라로 봄 (소문자)
// states: 위치 글의 맨 끝이 정확히 이 말이면 이 나라로 봄
// iso3: GDACS 재난 경보의 나라 코드
// tz: 현지 시각 계산용 (서머타임 자동 반영)
// plug/adapter: 한국 플러그(C·F 타입, 220V) 기준
// emergency: [이름, 번호]
export const REGIONS = [
  ['near', '가까운 나라'],
  ['sea', '동남아'],
  ['resort', '휴양지'],
  ['far', '미주·오세아니아'],
  ['europe', '유럽·기타'],
];

export const COUNTRIES = [
  { slug: 'japan', landmark: '후지산', photoQ: 'Mount Fuji Japan', cur: 'JPY', curName: '엔', iso2: ['JP'], ko: '일본', flag: '🇯🇵', region: 'near', iso3: ['JPN'],
    keys: ['japan', 'honshu', 'hokkaido', 'kyushu', 'shikoku', 'ryukyu', 'izu islands', 'bonin islands', 'volcano islands'],
    tz: 'Asia/Tokyo', capital: '도쿄', currency: '엔 (JPY)', lang: '일본어',
    volt: '100V', plug: 'A·B 타입', adapter: true,
    emergency: [['경찰', '110'], ['구급·화재', '119']],
    flight: '약 2시간 (도쿄)', cities: ['도쿄', '오사카', '후쿠오카', '삿포로', '오키나와', '나고야', '가고시마', '마쓰야마', '다카마쓰', '시즈오카'],
    color: ['#e94b5b', '#f6a5a1'] },
  { slug: 'china', landmark: '만리장성', photoQ: 'Great Wall China', cur: 'CNY', curName: '위안', iso2: ['CN'], ko: '중국', flag: '🇨🇳', region: 'near', iso3: ['CHN'],
    keys: ['china', 'xizang', 'tibet', 'sichuan', 'yunnan', 'xinjiang', 'qinghai', 'gansu'],
    tz: 'Asia/Shanghai', capital: '베이징', currency: '위안 (CNY)', lang: '중국어',
    volt: '220V', plug: 'A·C·I 타입', adapter: false, adapterNote: 'C 타입 콘센트가 있는 곳이 많아요',
    emergency: [['경찰', '110'], ['구급', '120'], ['화재', '119']],
    flight: '약 2시간 (베이징·상하이)', cities: ['상하이', '베이징', '칭다오', '웨이하이', '장가계'],
    color: ['#d93a2f', '#f3b23c'] },
  { slug: 'taiwan', landmark: '타이베이', photoQ: 'Taipei city skyline', cur: 'TWD', curName: '대만 달러', iso2: ['TW'], ko: '대만', flag: '🇹🇼', region: 'near', iso3: ['TWN'], keys: ['taiwan'],
    tz: 'Asia/Taipei', capital: '타이베이', currency: '대만 달러 (TWD)', lang: '중국어',
    volt: '110V', plug: 'A·B 타입', adapter: true,
    emergency: [['경찰', '110'], ['구급·화재', '119']],
    flight: '약 2시간 30분', cities: ['타이베이', '가오슝', '타이중', '화롄'],
    color: ['#2e64c9', '#7fb3f0'] },
  { slug: 'hongkong', landmark: '빅토리아 하버 야경', photoQ: 'Hong Kong Victoria Harbour skyline', cur: 'HKD', curName: '홍콩 달러', iso2: ['HK'], ko: '홍콩', flag: '🇭🇰', region: 'near', iso3: ['HKG'], keys: ['hong kong'],
    tz: 'Asia/Hong_Kong', capital: '홍콩', currency: '홍콩 달러 (HKD)', lang: '광둥어·영어',
    volt: '220V', plug: 'G 타입', adapter: true,
    emergency: [['긴급 신고', '999']],
    flight: '약 3시간 30분', cities: ['홍콩섬', '침사추이', '몽콕', '란타우'],
    color: ['#d6334a', '#f39a8f'] },
  { slug: 'vietnam', landmark: '하롱베이', photoQ: 'Ha Long Bay Vietnam', cur: 'VND', curName: '동', iso2: ['VN'], ko: '베트남', flag: '🇻🇳', region: 'sea', iso3: ['VNM'], keys: ['vietnam'],
    tz: 'Asia/Ho_Chi_Minh', capital: '하노이', currency: '동 (VND)', lang: '베트남어',
    volt: '220V', plug: 'A·C 타입', adapter: false, adapterNote: '한국 플러그가 대부분 그대로 맞아요',
    emergency: [['경찰', '113'], ['화재', '114'], ['구급', '115']],
    flight: '약 4시간 30분 (다낭)', cities: ['다낭', '나트랑', '푸꾸옥', '하노이', '호치민'],
    color: ['#e0452f', '#ffc857'] },
  { slug: 'thailand', landmark: '방콕 사원', photoQ: 'Bangkok temple Thailand', cur: 'THB', curName: '바트', iso2: ['TH'], ko: '태국', flag: '🇹🇭', region: 'sea', iso3: ['THA'], keys: ['thailand'],
    tz: 'Asia/Bangkok', capital: '방콕', currency: '바트 (THB)', lang: '태국어',
    volt: '220V', plug: 'A·B·C·O 타입', adapter: false, adapterNote: '한국 플러그가 대부분 그대로 맞아요',
    emergency: [['관광경찰', '1155'], ['경찰', '191'], ['구급', '1669']],
    flight: '약 6시간 (방콕)', cities: ['방콕', '푸껫', '치앙마이', '파타야', '코사무이'],
    color: ['#3049a8', '#e2556b'] },
  { slug: 'philippines', landmark: '팔라완 해변', photoQ: 'Palawan beach Philippines', cur: 'PHP', curName: '페소', iso2: ['PH'], ko: '필리핀', flag: '🇵🇭', region: 'sea', iso3: ['PHL'], keys: ['philippines', 'mindanao', 'luzon'],
    tz: 'Asia/Manila', capital: '마닐라', currency: '페소 (PHP)', lang: '필리핀어·영어',
    volt: '220V', plug: 'A·B·C 타입', adapter: true, adapterNote: '11자 콘센트(A타입)가 많아 어댑터가 있으면 편해요',
    emergency: [['긴급 신고', '911']],
    flight: '약 4시간 30분 (세부)', cities: ['세부', '보라카이', '마닐라', '보홀', '클락'],
    color: ['#1f5fbf', '#f2c230'] },
  { slug: 'indonesia', landmark: '발리 계단식 논', photoQ: 'Bali rice terrace', cur: 'IDR', curName: '루피아', iso2: ['ID'], ko: '인도네시아', flag: '🇮🇩', region: 'sea', iso3: ['IDN'],
    keys: ['indonesia', 'sumatra', 'java', 'bali', 'sulawesi', 'banda sea', 'molucca', 'halmahera', 'flores sea', 'lombok'],
    tz: 'Asia/Makassar', tzLabel: '발리 기준', tzMore: [['자카르타', 'Asia/Jakarta']], capital: '자카르타', currency: '루피아 (IDR)', lang: '인도네시아어',
    volt: '230V', plug: 'C·F 타입', adapter: false,
    emergency: [['긴급 신고', '112'], ['경찰', '110']],
    flight: '약 7시간 (발리)', cities: ['발리', '자카르타', '롬복', '족자카르타'],
    color: ['#d8333d', '#f08b7f'] },
  { slug: 'malaysia', landmark: '쿠알라룸푸르', photoQ: 'Kuala Lumpur skyline', cur: 'MYR', curName: '링깃', iso2: ['MY'], ko: '말레이시아', flag: '🇲🇾', region: 'sea', iso3: ['MYS'], keys: ['malaysia', 'sabah', 'sarawak'],
    tz: 'Asia/Kuala_Lumpur', capital: '쿠알라룸푸르', currency: '링깃 (MYR)', lang: '말레이어·영어',
    volt: '240V', plug: 'G 타입', adapter: true,
    emergency: [['긴급 신고', '999']],
    flight: '약 6시간 30분', cities: ['코타키나발루', '쿠알라룸푸르', '랑카위', '페낭'],
    color: ['#1d3f8f', '#f4c542'] },
  { slug: 'singapore', landmark: '마리나베이', photoQ: 'Marina Bay Singapore', cur: 'SGD', curName: '싱가포르 달러', iso2: ['SG'], ko: '싱가포르', flag: '🇸🇬', region: 'sea', iso3: ['SGP'], keys: ['singapore'],
    tz: 'Asia/Singapore', capital: '싱가포르', currency: '싱가포르 달러 (SGD)', lang: '영어·중국어 등',
    volt: '230V', plug: 'G 타입', adapter: true,
    emergency: [['경찰', '999'], ['구급·화재', '995']],
    flight: '약 6시간 30분', cities: ['마리나베이', '센토사', '오차드'],
    color: ['#e03a44', '#f7a1a6'] },
  { slug: 'guam-saipan', landmark: '괌 해변', photoQ: 'Guam beach', cur: 'USD', curName: '달러', iso2: ['GU', 'MP', 'US'], ko: '괌·사이판', short: '마리아나 제도(괌·사이판)', flag: '🏝️', region: 'resort', iso3: ['GUM', 'MNP'], keys: ['guam', 'mariana'],
    tz: 'Pacific/Guam', capital: '하갓냐 (괌)', currency: '미국 달러 (USD)', lang: '영어',
    volt: '110V', plug: 'A·B 타입', adapter: true,
    emergency: [['긴급 신고', '911']],
    flight: '약 4시간 30분', cities: ['괌 투몬', '사이판', '로타'],
    color: ['#0fa3b1', '#7fdcd2'] },
  { slug: 'hawaii', landmark: '와이키키 해변', photoQ: 'Waikiki beach Hawaii', cur: 'USD', curName: '달러', iso2: [], ko: '하와이', flag: '🌺', region: 'resort', iso3: [], keys: ['hawaii'],
    tz: 'Pacific/Honolulu', capital: '호놀룰루', currency: '미국 달러 (USD)', lang: '영어',
    volt: '120V', plug: 'A·B 타입', adapter: true,
    emergency: [['긴급 신고', '911']],
    flight: '약 8시간 30분', cities: ['오아후 (와이키키)', '마우이', '빅아일랜드', '카우아이'],
    color: ['#0b8f8a', '#f39a5a'] },
  { slug: 'usa', landmark: '뉴욕', photoQ: 'New York city skyline', cur: 'USD', curName: '달러', iso2: ['US'], ko: '미국 본토·알래스카', short: '미국', flag: '🇺🇸', region: 'far', iso3: ['USA'],
    keys: ['california', 'alaska', 'new mexico', 'nevada', 'oregon', 'washington', 'utah', 'idaho', 'montana', 'wyoming'],
    states: ['ca', 'ak', 'nv', 'or', 'wa', 'ut', 'id', 'mt', 'wy'],
    tz: 'America/Los_Angeles', tzLabel: 'LA 기준', tzMore: [['뉴욕', 'America/New_York'], ['앵커리지(알래스카)', 'America/Anchorage']], capital: '워싱턴 D.C.', currency: '미국 달러 (USD)', lang: '영어',
    volt: '120V', plug: 'A·B 타입', adapter: true,
    emergency: [['긴급 신고', '911']],
    flight: '약 11시간 (LA)', cities: ['뉴욕', 'LA', '샌프란시스코', '라스베이거스', '시애틀'],
    color: ['#2a3d8f', '#d9434f'] },
  { slug: 'mexico', landmark: '칸쿤 해변', photoQ: 'Cancun beach', cur: 'MXN', curName: '페소', iso2: ['MX'], ko: '멕시코', flag: '🇲🇽', region: 'far', iso3: ['MEX'], keys: ['mexico', 'baja california'],
    tz: 'America/Mexico_City', tzLabel: '멕시코시티 기준', capital: '멕시코시티', currency: '페소 (MXN)', lang: '스페인어',
    volt: '127V', plug: 'A·B 타입', adapter: true,
    emergency: [['긴급 신고', '911']],
    cities: ['칸쿤', '멕시코시티', '로스카보스'],
    color: ['#0d7a4f', '#d9473b'] },
  { slug: 'australia', landmark: '시드니 오페라하우스', photoQ: 'Sydney Opera House', cur: 'AUD', curName: '호주 달러', iso2: ['AU'], ko: '호주', flag: '🇦🇺', region: 'far', iso3: ['AUS'], keys: ['australia'],
    tz: 'Australia/Sydney', tzLabel: '시드니 기준', tzMore: [['브리즈번', 'Australia/Brisbane'], ['멜버른', 'Australia/Melbourne'], ['퍼스', 'Australia/Perth']], capital: '캔버라', currency: '호주 달러 (AUD)', lang: '영어',
    volt: '230V', plug: 'I 타입', adapter: true,
    emergency: [['긴급 신고', '000']],
    flight: '약 10시간 (시드니)', cities: ['시드니', '멜버른', '브리즈번', '골드코스트', '케언스'],
    color: ['#1b3a8a', '#f2a93b'] },
  { slug: 'new-zealand', landmark: '밀포드 사운드', photoQ: 'Milford Sound New Zealand', cur: 'NZD', curName: '뉴질랜드 달러', iso2: ['NZ'], ko: '뉴질랜드', flag: '🇳🇿', region: 'far', iso3: ['NZL'], keys: ['new zealand', 'kermadec'],
    tz: 'Pacific/Auckland', capital: '웰링턴', currency: '뉴질랜드 달러 (NZD)', lang: '영어·마오리어',
    volt: '230V', plug: 'I 타입', adapter: true,
    emergency: [['긴급 신고', '111']],
    flight: '약 11시간 (오클랜드)', cities: ['오클랜드', '퀸스타운', '크라이스트처치', '로토루아'],
    color: ['#1f3b73', '#5aa7a0'] },
  { slug: 'turkiye', landmark: '카파도키아 열기구', photoQ: 'Cappadocia hot air balloons', cur: 'TRY', curName: '리라', iso2: ['TR'], ko: '튀르키예', flag: '🇹🇷', region: 'europe', iso3: ['TUR'], keys: ['turkey', 'türkiye', 'turkiye'],
    tz: 'Europe/Istanbul', capital: '앙카라', currency: '리라 (TRY)', lang: '튀르키예어',
    volt: '230V', plug: 'C·F 타입', adapter: false,
    emergency: [['긴급 신고', '112']],
    cities: ['이스탄불', '카파도키아', '안탈리아', '파묵칼레'],
    color: ['#d3343b', '#f0868b'] },
  { slug: 'greece', landmark: '산토리니 이아 마을', photoQ: 'Santorini Oia', cur: 'EUR', curName: '유로', iso2: ['GR'], ko: '그리스', flag: '🇬🇷', region: 'europe', iso3: ['GRC'], keys: ['greece', 'crete', 'aegean'],
    tz: 'Europe/Athens', capital: '아테네', currency: '유로 (EUR)', lang: '그리스어',
    volt: '230V', plug: 'C·F 타입', adapter: false,
    emergency: [['긴급 신고', '112']],
    cities: ['아테네', '산토리니', '미코노스', '크레타'],
    color: ['#1f63c6', '#8cc4f2'] },
  { slug: 'italy', landmark: '로마 콜로세움', photoQ: 'Rome Colosseum', cur: 'EUR', curName: '유로', iso2: ['IT'], ko: '이탈리아', flag: '🇮🇹', region: 'europe', iso3: ['ITA'], keys: ['italy', 'sicily'],
    tz: 'Europe/Rome', capital: '로마', currency: '유로 (EUR)', lang: '이탈리아어',
    volt: '230V', plug: 'C·F·L 타입', adapter: false, adapterNote: 'L 타입(3구)만 있는 곳은 어댑터가 필요해요',
    emergency: [['긴급 신고', '112']],
    cities: ['로마', '피렌체', '베네치아', '밀라노', '나폴리'],
    color: ['#16824a', '#d8414a'] },
  { slug: 'nepal', landmark: '히말라야', photoQ: 'Himalaya mountains Nepal', cur: 'NPR', curName: '루피', iso2: ['NP'], ko: '네팔', flag: '🇳🇵', region: 'europe', iso3: ['NPL'], keys: ['nepal'],
    tz: 'Asia/Kathmandu', capital: '카트만두', currency: '네팔 루피 (NPR)', lang: '네팔어',
    volt: '230V', plug: 'C·D·M 타입', adapter: false, adapterNote: 'C 타입이 많지만 D·M 타입용 어댑터가 있으면 편해요',
    emergency: [['경찰', '100'], ['구급', '102']],
    cities: ['카트만두', '포카라', '안나푸르나'],
    color: ['#c8233d', '#3a4fa8'] },
  { slug: 'mongolia', landmark: '테를지 초원', photoQ: 'Mongolia steppe ger', cur: 'MNT', curName: '투그릭', iso2: ['MN'], ko: '몽골', flag: '🇲🇳', region: 'near', iso3: ['MNG'], keys: ['mongolia'],
    tz: 'Asia/Ulaanbaatar', capital: '울란바토르', currency: '투그릭 (MNT)', lang: '몽골어',
    volt: '230V', plug: 'C·E 타입', adapter: false,
    emergency: [['경찰', '102'], ['구급', '103'], ['화재', '101']],
    flight: '약 3시간 30분 (울란바토르)', cities: ['울란바토르', '테를지', '홉스골', '고비 사막'],
    color: ['#c4272f', '#015197'] },
  { slug: 'laos', landmark: '루앙프라방', photoQ: 'Luang Prabang Laos', cur: 'LAK', curName: '킵', iso2: ['LA'], ko: '라오스', flag: '🇱🇦', region: 'sea', iso3: ['LAO'], keys: ['laos'],
    tz: 'Asia/Vientiane', capital: '비엔티안', currency: '킵 (LAK)', lang: '라오어',
    volt: '230V', plug: 'A·B·C·E·F 타입', adapter: false,
    emergency: [['경찰', '191'], ['구급', '195'], ['화재', '190']],
    flight: '약 5시간 30분 (비엔티안)', cities: ['비엔티안', '루앙프라방', '방비엥'],
    color: ['#ce1126', '#002868'] },
  { slug: 'cambodia', landmark: '앙코르와트', photoQ: 'Angkor Wat Cambodia', cur: 'KHR', curName: '리엘', iso2: ['KH'], ko: '캄보디아', flag: '🇰🇭', region: 'sea', iso3: ['KHM'], keys: ['cambodia'],
    tz: 'Asia/Phnom_Penh', capital: '프놈펜', currency: '리엘 (KHR) · 미국 달러도 널리 씀', lang: '크메르어',
    volt: '230V', plug: 'A·C·G 타입', adapter: false,
    emergency: [['경찰', '117'], ['구급', '119'], ['화재', '118']],
    flight: '약 5시간 30분 (씨엠립)', cities: ['씨엠립', '프놈펜', '앙코르와트'],
    color: ['#032ea1', '#e00025'] },
];

// 외교부 영사콜센터 (해외에서 24시간)
export const CONSULAR_CALL = '+82-2-3210-0404';

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

// 국기 그림 코드 (소문자 2자리)
export const flagOf = (c) => (c.fi || (c.iso2 && c.iso2[0]) || '').toLowerCase();

const ISO_TO_SLUG = {};
for (const c of COUNTRIES) for (const i of c.iso3) ISO_TO_SLUG[i] = c.slug;
export function slugFromIso3(iso3) {
  return ISO_TO_SLUG[iso3] || null;
}

// 한국과의 시차(시간). 서머타임 자동 반영. 예: -2, +1, -3.25
export function tzDiff(tz, at = Date.now()) {
  const off = (zone) => {
    const p = new Intl.DateTimeFormat('en-US', {
      timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric',
    }).formatToParts(new Date(at));
    const g = (t) => +p.find((x) => x.type === t).value;
    return (Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute')) - Math.floor(at / 60000) * 60000) / 36e5;
  };
  return Math.round((off(tz) - off('Asia/Seoul')) * 4) / 4;
}

export function tzDiffText(h) {
  if (h === 0) return '시차 없음';
  const a = Math.abs(h);
  const hh = Math.floor(a);
  const mm = Math.round((a - hh) * 60);
  return `한국보다 ${hh ? `${hh}시간` : ''}${mm ? ` ${mm}분` : ''} ${h < 0 ? '느림' : '빠름'}`.replace('  ', ' ');
}
