// 공항 코드 → 도시 (인기 도시 순위용). city: cities.js 의 slug (있으면 날씨·가이드 링크), iso: 국기
export const AIRPORTS = {
  NRT: ['tokyo', '도쿄', 'jp'], HND: ['tokyo', '도쿄', 'jp'],
  KIX: ['osaka', '오사카', 'jp'], ITM: ['osaka', '오사카', 'jp'],
  FUK: ['fukuoka', '후쿠오카', 'jp'], CTS: ['sapporo', '삿포로', 'jp'], OKA: ['okinawa', '오키나와', 'jp'],
  NGO: ['nagoya', '나고야', 'jp'], KMJ: ['kumamoto', '구마모토', 'jp'], KOJ: ['kagoshima', '가고시마', 'jp'], OKJ: [null, '오카야마', 'jp'],
  TAK: ['takamatsu', '다카마쓰', 'jp'], MYJ: ['matsuyama', '마쓰야마', 'jp'], HIJ: ['hiroshima', '히로시마', 'jp'], SDJ: [null, '센다이', 'jp'],
  KMQ: [null, '고마쓰', 'jp'], YGJ: [null, '요나고', 'jp'], AOJ: [null, '아오모리', 'jp'], KIJ: [null, '니가타', 'jp'],
  FSZ: ['shizuoka', '시즈오카', 'jp'], OIT: ['oita', '오이타', 'jp'], KKJ: [null, '기타큐슈', 'jp'], NGS: [null, '나가사키', 'jp'],
  KMI: [null, '미야자키', 'jp'], ISG: [null, '이시가키', 'jp'], AKJ: [null, '아사히카와', 'jp'], UBJ: [null, '야마구치우베', 'jp'],
  PVG: ['shanghai', '상하이', 'cn'], SHA: ['shanghai', '상하이', 'cn'],
  PEK: ['beijing', '베이징', 'cn'], PKX: ['beijing', '베이징', 'cn'],
  TAO: ['qingdao', '칭다오', 'cn'], WEH: ['weihai', '웨이하이', 'cn'], DYG: ['zhangjiajie', '장가계', 'cn'],
  CAN: ['guangzhou', '광저우', 'cn'], SZX: ['shenzhen', '선전', 'cn'], CTU: ['chengdu', '청두', 'cn'], TFU: ['chengdu', '청두', 'cn'],
  XIY: ['xian', '시안', 'cn'], YNJ: ['yanji', '옌지', 'cn'], SHE: ['shenyang', '선양', 'cn'], DLC: ['dalian', '다롄', 'cn'],
  HGH: ['hangzhou', '항저우', 'cn'], NKG: ['nanjing', '난징', 'cn'], KWL: [null, '구이린', 'cn'], SYX: [null, '싼야', 'cn'],
  CGQ: [null, '창춘', 'cn'], HRB: ['harbin', '하얼빈', 'cn'], TSN: [null, '톈진', 'cn'], YNT: ['yantai', '옌타이', 'cn'],
  CKG: [null, '충칭', 'cn'], WUH: [null, '우한', 'cn'], XMN: ['xiamen', '샤먼', 'cn'], KMG: [null, '쿤밍', 'cn'],
  HKG: ['hongkong', '홍콩', 'hk'], MFM: ['macau', '마카오', 'mo'],
  TPE: ['taipei', '타이베이', 'tw'], TSA: ['taipei', '타이베이', 'tw'], KHH: ['kaohsiung', '가오슝', 'tw'], RMQ: ['taichung', '타이중', 'tw'],
  DAD: ['danang', '다낭', 'vn'], CXR: ['nhatrang', '나트랑', 'vn'], PQC: ['phuquoc', '푸꾸옥', 'vn'],
  HAN: ['hanoi', '하노이', 'vn'], SGN: ['hochiminh', '호치민', 'vn'], HPH: [null, '하이퐁', 'vn'], DLI: ['dalat', '달랏', 'vn'],
  BKK: ['bangkok', '방콕', 'th'], DMK: ['bangkok', '방콕', 'th'], HKT: ['phuket', '푸껫', 'th'], CNX: ['chiangmai', '치앙마이', 'th'],
  UTP: ['pattaya', '파타야', 'th'], USM: ['kohsamui', '코사무이', 'th'],
  CEB: ['cebu', '세부', 'ph'], MPH: ['boracay', '보라카이', 'ph'], KLO: ['boracay', '보라카이', 'ph'],
  TAG: ['bohol', '보홀', 'ph'], MNL: ['manila', '마닐라', 'ph'], CRK: ['clark', '클락', 'ph'],
  DPS: ['bali', '발리', 'id'], CGK: ['jakarta', '자카르타', 'id'], BTH: [null, '바탐', 'id'],
  BKI: ['kotakinabalu', '코타키나발루', 'my'], KUL: ['kualalumpur', '쿠알라룸푸르', 'my'], PEN: ['penang', '페낭', 'my'], LGK: ['langkawi', '랑카위', 'my'],
  SIN: ['singapore', '싱가포르', 'sg'],
  GUM: ['guam', '괌', 'gu'], SPN: ['saipan', '사이판', 'mp'], ROR: [null, '팔라우', 'pw'],
  HNL: ['honolulu', '하와이 호놀룰루', 'us'],
  JFK: ['newyork', '뉴욕', 'us'], EWR: ['newyork', '뉴욕', 'us'], LAX: ['losangeles', 'LA', 'us'],
  SFO: ['sanfrancisco', '샌프란시스코', 'us'], LAS: ['lasvegas', '라스베이거스', 'us'], SEA: [null, '시애틀', 'us'],
  ATL: [null, '애틀랜타', 'us'], ORD: [null, '시카고', 'us'], IAD: [null, '워싱턴', 'us'], DFW: [null, '댈러스', 'us'],
  BOS: [null, '보스턴', 'us'], ANC: [null, '앵커리지', 'us'], MSP: [null, '미니애폴리스', 'us'], DTW: [null, '디트로이트', 'us'],
  IAH: [null, '휴스턴', 'us'], SLC: [null, '솔트레이크시티', 'us'], SJC: [null, '산호세', 'us'],
  YVR: [null, '밴쿠버', 'ca'], YYZ: [null, '토론토', 'ca'],
  CUN: ['cancun', '칸쿤', 'mx'], MEX: [null, '멕시코시티', 'mx'],
  SYD: ['sydney', '시드니', 'au'], MEL: ['melbourne', '멜버른', 'au'], OOL: ['goldcoast', '골드코스트', 'au'], BNE: [null, '브리즈번', 'au'],
  AKL: ['auckland', '오클랜드', 'nz'], ZQN: ['queenstown', '퀸스타운', 'nz'],
  IST: ['istanbul', '이스탄불', 'tr'], ATH: ['athens', '아테네', 'gr'],
  FCO: ['rome', '로마', 'it'], MXP: [null, '밀라노', 'it'], VCE: ['venice', '베네치아', 'it'],
  KTM: ['kathmandu', '카트만두', 'np'],
  CDG: ['paris', '파리', 'fr'], ORY: ['paris', '파리', 'fr'], LHR: ['london', '런던', 'gb'], LGW: ['london', '런던', 'gb'], FRA: [null, '프랑크푸르트', 'de'], MUC: [null, '뮌헨', 'de'],
  AMS: [null, '암스테르담', 'nl'], MAD: ['madrid', '마드리드', 'es'], BCN: ['barcelona', '바르셀로나', 'es'], ZRH: ['zurich', '취리히', 'ch'],
  VIE: [null, '빈', 'at'], PRG: ['prague', '프라하', 'cz'], BUD: [null, '부다페스트', 'hu'], WAW: [null, '바르샤바', 'pl'],
  HEL: [null, '헬싱키', 'fi'], LIS: [null, '리스본', 'pt'], CPH: [null, '코펜하겐', 'dk'],
  DXB: ['dubai', '두바이', 'ae'], AUH: [null, '아부다비', 'ae'], DOH: [null, '도하', 'qa'], TLV: [null, '텔아비브', 'il'],
  ULN: ['ulaanbaatar', '울란바토르', 'mn'], UBN: ['ulaanbaatar', '울란바토르', 'mn'],
  KTI: ['phnompenh', '프놈펜', 'kh'], UKB: ['kobe', '고베', 'jp'], SHI: [null, '미야코지마', 'jp'], TKS: [null, '도쿠시마', 'jp'], HSG: [null, '사가', 'jp'],
  TNA: [null, '지난', 'cn'], HFE: [null, '허페이', 'cn'], CGO: [null, '정저우', 'cn'], YNZ: [null, '옌청', 'cn'], FOC: [null, '푸저우', 'cn'],
  WUX: [null, '우시', 'cn'], WUS: [null, '우이산', 'cn'], CSX: [null, '창사', 'cn'], URC: [null, '우루무치', 'cn'], LJG: [null, '리장', 'cn'],
  SJW: [null, '스자좡', 'cn'], HAK: [null, '하이커우', 'cn'], WDS: [null, '스옌', 'cn'], YTY: [null, '양저우', 'cn'], YIH: [null, '이창', 'cn'],
  WNZ: [null, '원저우', 'cn'], JMU: [null, '자무쓰', 'cn'],
  NQZ: [null, '아스타나', 'kz'], CIT: [null, '심켄트', 'kz'], ASB: [null, '아시가바트', 'tm'], MDC: [null, '마나도', 'id'],
  BWN: [null, '반다르스리브가완', 'bn'], WRO: [null, '브로츠와프', 'pl'], VVO: [null, '블라디보스토크', 'ru'], IKT: [null, '이르쿠츠크', 'ru'],
  ALA: [null, '알마티', 'kz'], TAS: [null, '타슈켄트', 'uz'],
  PNH: ['phnompenh', '프놈펜', 'kh'], REP: ['siemreap', '씨엠립', 'kh'], SAI: ['siemreap', '씨엠립', 'kh'], VTE: ['vientiane', '비엔티안', 'la'], LPQ: ['luangprabang', '루앙프라방', 'la'], KBV: ['krabi', '끄라비', 'th'], PPS: ['palawan', '팔라완', 'ph'],
  RGN: [null, '양곤', 'mm'], CMB: [null, '콜롬보', 'lk'], DEL: [null, '델리', 'in'], BOM: [null, '뭄바이', 'in'],
  MLE: [null, '몰디브', 'mv'], NAN: [null, '난디(피지)', 'fj'],
  CAI: [null, '카이로', 'eg'], ADD: [null, '아디스아바바', 'et'], NBO: [null, '나이로비', 'ke'],
  GRU: [null, '상파울루', 'br'], SCL: [null, '산티아고', 'cl'], LIM: [null, '리마', 'pe'],
};

// 국내선 연결편(인천→부산 등)은 해외여행 순위에서 뺌
export const KOREA = new Set(['GMP', 'PUS', 'CJU', 'TAE', 'KWJ', 'CJJ', 'MWX', 'YNY', 'RSU', 'USN', 'HIN', 'KPO', 'KUV', 'WJU', 'ICN']);

// 같은 도시 공항을 하나로 묶는 열쇠
export function cityKeyOf(code, nameEn = '') {
  const a = AIRPORTS[code];
  if (KOREA.has(code)) return { key: `k:${code}`, city: null, ko: code, iso: 'kr', domestic: true };
  if (!a) return { key: `x:${code}`, city: null, ko: nameEn || code, iso: '' };
  return { key: a[0] ? `c:${a[0]}` : `n:${a[1]}`, city: a[0], ko: a[1], iso: a[2] };
}
