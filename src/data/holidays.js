// 나라별 현지 공휴일 — date-holidays(ISC) 로 사이트를 만들 때 계산 (바깥 API 안 씀).
// 앞으로 1년치. 공휴일 + 주말이 3일 넘게 이어지면 "연휴"로 묶어 붐빔 안내.
import Holidays from 'date-holidays';
import { COUNTRIES } from './countries.js';
import { BUILT_AT } from './load.js';

// 나라 slug → [나라 코드, 주(州)]
const CODE = { hawaii: ['US', 'HI'], guam: ['GU'], usa: ['US'] };
const codeOf = (c) => CODE[c.slug] || (c.iso2?.[0] ? [c.iso2[0]] : null);

const KO = {
  "New Year’s Day": '새해 첫날', "New Year’s Eve": '새해 전날', 'The first day of January': '새해 첫날', 'Day after New Year’s Day': '새해 연휴',
  'Coming of Age Day': '성인의 날', 'Foundation Day': '건국기념일', 'Emperor’s Birthday': '일왕 생일', 'Spring Equinox Day': '춘분의 날',
  'Showa Day': '쇼와의 날', 'Constitution Day': '헌법기념일', 'Greenery Day': '녹색의 날', 'Children’s Day': '어린이날',
  'Marine Day': '바다의 날', 'Mountain Day': '산의 날', 'Respect-for-the-Aged Day': '경로의 날', 'Citizens’ Holiday': '국민의 휴일',
  'Autumnal Equinox Day': '추분의 날', 'Sports Day': '스포츠의 날', 'Culture Day': '문화의 날', 'Labor Thanksgiving Day': '근로감사의 날',
  'Spring Festival': '춘절 (설)', 'Chinese New Year’s Eve': '설 전날', 'Chinese New Year': '설 (춘절)', 'Chinese New Year Holiday': '설 연휴',
  'Lunar New Year’s Day': '설날', 'The second day of Lunar New Year': '설 연휴', 'The third day of Lunar New Year': '설 연휴', 'The fourth day of Lunar New Year': '설 연휴',
  'The second day of the Chinese New Year': '설 연휴', 'The third day of the Chinese New Year': '설 연휴', 'The forth day of the Chinese New Year': '설 연휴',
  'Vietnamese New Year': '뗏 (베트남 설)', 'Vietnamese New Year Holidays': '뗏 연휴',
  'Qingming Festival': '청명절', 'Tomb Sweeping Day': '청명절', 'Ching Ming Festival': '청명절', 'The day following Ching Ming Festival': '청명절 다음 날',
  'Labour Day': '노동절', 'Labor Day': '노동절', 'Labour and Solidarity Day': '노동절', 'Dragon Boat Festival': '단오절', 'Tuen Ng Festival': '단오절',
  'Mid-Autumn Festival': '중추절', 'The day following the Chinese Mid-Autumn Festival': '중추절 다음 날', 'National Day': '국경절',
  'National Day / Double Tenth Day': '쌍십절 (건국기념일)', 'Founding of the Republic of China': '중화민국 개국기념일', 'Peace Memorial Day': '평화기념일',
  'Children’s Day (substitute day)': '어린이날 (대체)', 'Chung Yeung Festival': '중양절', 'The day following Chung Yeung Festival': '중양절 다음 날',
  'Birthday of the Buddha': '부처님 오신 날', 'The day following Birthday of the Buddha': '부처님 오신 날 다음 날', 'Vesak Day': '부처님 오신 날',
  'Hong Kong Special Administrative Region Establishment Day': '홍콩 반환 기념일', 'Christmas Day': '성탄절', 'The first weekday after Christmas Day': '성탄절 다음 날',
  'Boxing Day': '박싱 데이', 'Good Friday': '성금요일', 'The day following Good Friday': '부활절 연휴', 'Easter Saturday': '부활절 연휴', 'Easter Sunday': '부활절',
  'Easter Monday': '부활절 월요일', 'The day following Easter Monday': '부활절 연휴', 'Maundy Thursday': '성목요일',
  'Hung Kings Commemorations': '훙왕 기념일', 'Day of liberating the South for national reunification': '남부 해방 기념일', 'Independence Day': '독립기념일',
  'Songkran Festival': '송끄란 (태국 설·물축제)', 'Makha Bucha': '마카 부차 (불교 명절)', 'Asalha Puja': '아살하 부차 (불교 명절)', 'Buddhist Lent': '불교 안거 시작일',
  'Chakri Memorial Day': '짜끄리 왕조 기념일', 'Coronation Day': '대관식 기념일', 'King’s Birthday': '국왕 생일', 'Queen Suthida’s Birthday': '왕비 생일',
  'The Queen Mother’s Birthday': '왕대비 생일 (어머니의 날)', 'King Bhumibol Adulyadej Memorial Day': '푸미폰 국왕 추모일', 'King Chulalongkorn Day': '쭐랄롱꼰 국왕 기념일',
  'King Bhumibol Adulyadej’s Birthday': '푸미폰 국왕 생일 (아버지의 날)',
  'End of Ramadan (Eid al-Fitr)': '라마단 종료 (이드 알피트르)', 'Hari Raya Puasa': '라마단 종료 (하리라야)', 'Feast of the Sacrifice (Eid al-Adha)': '희생제 (이드 알아드하)',
  'Hari Raya Haji': '희생제 (하리라야 하지)', 'Islamic New Year': '이슬람 새해', 'Birthday of Muhammad (Mawlid)': '무함마드 탄신일', 'Laylat al-Miʿraj': '무함마드 승천일',
  'Day of Nuzul Al-Quran': '코란 계시일', 'Nyepi': '녜피 (발리 침묵의 날)', 'Ascension Day': '예수 승천일', 'Pancasila Day': '판차실라의 날', 'Deepavali': '디파발리 (힌두 빛 축제)',
  'Malaysia Day': '말레이시아의 날', 'Yang di-Pertuan Agong’s Birthday': '국왕 생일',
  'Day of Valor': '용사의 날', 'National Heroes’ Day': '국가 영웅의 날', 'Bonifacio Day': '보니파시오의 날', 'Rizal Day': '리살의 날', 'All Saints’ Day': '모든 성인의 날', 'All Souls’ Day': '위령의 날',
  'Martin Luther King Jr. Day': '마틴 루터 킹 데이', 'Washington’s Birthday': '대통령의 날', 'Presidents’ Day': '대통령의 날', 'Memorial Day': '메모리얼 데이', 'Juneteenth': '노예해방 기념일',
  'Columbus Day': '콜럼버스 데이', 'Veterans Day': '재향군인의 날', 'Thanksgiving Day': '추수감사절', 'Liberation Day': '해방 기념일',
  'Guam History and Chamorro Heritage Day': '괌 역사·차모로 문화의 날', 'Our Lady of Camarin Day': '카마린 성모의 날',
  'Prince Jonah Kuhio Kalanianaole Day': '쿠히오 왕자의 날', 'Kamehameha Day': '카메하메하 대왕의 날', 'Statehood Day': '하와이 주 승격 기념일', 'General Election Day': '선거일',
  'Benito Juárez’s birthday': '베니토 후아레스 탄신일', 'Revolution Day': '혁명 기념일',
  'Australia Day': '오스트레일리아 데이', 'Anzac Day': '안작 데이', 'ANZAC Day': '안작 데이', 'Waitangi Day': '와이탕이 데이', 'Matariki': '마타리키 (마오리 새해)',
  'National Sovereignty and Children’s Day': '국가 주권·어린이의 날', 'Commemoration of Atatürk, Youth and Sports Day': '아타튀르크·청년·스포츠의 날',
  'Democracy and National Unity Day': '민주주의·국민 통합의 날', 'Victory Day': '승전 기념일', 'Republic Day': '공화국 선포일',
  'Epiphany': '주현절', 'Clean Monday': '사순절 첫날', 'Annunciation, Anniversary of 1821 Revolution': '독립기념일', 'Pentecost': '오순절', 'Whit Monday': '오순절 월요일',
  'Assumption': '성모 승천일', 'Ohi Day': '오히 데이', 'Liberation from Nazi-Fascism (1945)': '해방 기념일', 'National Day of Saint Francis of Assisi': '성 프란치스코 축일',
  'Immaculate Conception': '성모 무염시태 축일', 'Army Day': '건군절', 'Youth Day': '청년절', 'International Women’s Day': '세계 여성의 날', 'Vietnam Culture Day': '베트남 문화의 날',
};
const ko = (n) => {
  const sub = /\(substitute day\)/.test(n);
  const base = n.replace(/\s*\(substitute day\)/, '');
  return (KO[n] || KO[base] || base) + (sub && !KO[n] ? ' (대체공휴일)' : '');
};

// 일부 사람만 쉬는 날(여성·청년·군인)은 뺌
const SKIP = new Set(['International Women’s Day', 'Youth Day', 'Army Day']);

// 실제 연휴가 공식 공휴일보다 긴 나라 — 안내 문구
export const HOLIDAY_NOTE = {
  china: '춘절(설)·노동절·국경절은 정부가 주말 근무일과 바꿔 보통 5~9일 연달아 쉬어요. 이때 중국 전역이 크게 붐벼요.',
  vietnam: '뗏(베트남 설)은 실제로 일주일 넘게 쉬는 곳이 많아요. 식당·가게가 문을 닫기도 해요.',
  japan: '4월 말~5월 초 골든위크, 8월 중순 오봉, 연말연시(12/29~1/3)는 일본 전역이 붐비고 숙소값이 올라요.',
  taiwan: '설(춘절) 연휴는 보통 5일 이상 쉬어요.',
  hongkong: '설 연휴와 부활절·성탄절 연휴에는 중국 본토 관광객이 많이 와서 붐벼요.',
};

const ymd = (d) => d.toISOString().slice(0, 10);
const DAY = 864e5;
const start = new Date(BUILT_AT - 2 * DAY);
const end = new Date(BUILT_AT + 366 * DAY);

function listFor(c) {
  const code = codeOf(c);
  if (!code) return [];
  let h;
  try { h = new Holidays(...code); } catch { return []; }
  const y0 = start.getUTCFullYear();
  const seen = new Map();
  for (const y of [y0, y0 + 1]) {
    for (const x of h.getHolidays(y, 'en') || []) {
      if (x.type !== 'public' || SKIP.has(x.name)) continue;
      const d = String(x.date).slice(0, 10);
      if (d < ymd(start) || d > ymd(end)) continue;
      const name = ko(x.name);
      const prev = seen.get(d);
      if (!prev) seen.set(d, name);
      else if (!prev.includes(name)) seen.set(d, `${prev} · ${name}`);
    }
  }
  return [...seen.entries()].sort().map(([d, n]) => ({ d, n }));
}

// 공휴일 + 주말이 3일 이상 붙으면 연휴
function breaksOf(list, gw = false) {
  const hol = new Set(list.map((x) => x.d));
  const off = (t) => { const w = new Date(t).getUTCDay(); return w === 0 || w === 6 || hol.has(ymd(new Date(t))); };
  const out = [];
  for (const x of list) {
    let a = Date.parse(x.d), b = a;
    if (out.length && Date.parse(out[out.length - 1].to) >= a) continue;
    while (off(a - DAY)) a -= DAY;
    while (off(b + DAY)) b += DAY;
    const days = Math.round((b - a) / DAY) + 1;
    if (days >= 3) {
      const names = [...new Set(list.filter((y) => y.d >= ymd(new Date(a)) && y.d <= ymd(new Date(b))).map((y) => y.n.replace(/ \(대체공휴일\)/, '')))];
      const f = ymd(new Date(a)), t = ymd(new Date(b));
      // 일본 4월 말~5월 초 연휴는 골든위크로 부름
      if (gw && f.slice(5) <= '05-06' && t.slice(5) >= '04-29' && f.slice(5) >= '04-25') names.unshift('골든위크');
      out.push({ from: f, to: t, days, names });
    }
  }
  return out;
}

export const HOLIDAYS = Object.fromEntries(COUNTRIES.map((c) => [c.slug, listFor(c)]));
export const BREAKS = Object.fromEntries(COUNTRIES.map((c) => [c.slug, breaksOf(HOLIDAYS[c.slug], c.slug === 'japan')]));

const WD = ['일', '월', '화', '수', '목', '금', '토'];
export const md = (d) => { const t = new Date(d + 'T00:00:00Z'); return `${t.getUTCMonth() + 1}.${t.getUTCDate()}(${WD[t.getUTCDay()]})`; };
