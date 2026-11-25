// 월별 날씨 → 옷차림·비·여행하기 좋은지 (규칙으로 자동 판단)
import climate from './archive/climate.json';
import { CITIES, SEOUL } from './cities.js';

export const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
export const HAS_CLIMATE = (slug) => !!climate?.[slug]?.m;
export const climateOf = (slug) => climate?.[slug] || null;
export const seoulM = (m) => climate?.[SEOUL.slug]?.m?.[m - 1] || null;
export const citiesWithClimate = CITIES.filter((c) => HAS_CLIMATE(c.slug));

export function clothes(d) {
  const t = (d.hi + d.lo) / 2;
  if (t >= 27) return { icon: '🩳', title: '한여름 옷차림', items: ['반팔·반바지·원피스', '선크림·모자·선글라스', '실내 에어컨 대비 얇은 셔츠'] };
  if (t >= 22) return { icon: '👕', title: '여름 옷차림', items: ['반팔·얇은 긴바지', '저녁용 얇은 셔츠나 가디건', '선크림'] };
  if (t >= 17) return { icon: '👔', title: '봄·가을 옷차림', items: ['긴팔 티·셔츠', '얇은 가디건이나 바람막이', '아침저녁 쌀쌀함 대비'] };
  if (t >= 12) return { icon: '🧥', title: '선선한 날씨 옷차림', items: ['니트·맨투맨', '자켓이나 트렌치코트', '겹쳐 입기 좋은 옷'] };
  if (t >= 5) return { icon: '🧣', title: '겨울 초입 옷차림', items: ['코트나 가벼운 패딩', '니트·기모 옷', '목도리'] };
  return { icon: '🥶', title: '한겨울 옷차림', items: ['두꺼운 패딩', '내복·기모 바지', '장갑·목도리·모자'] };
}

export function rainInfo(d) {
  // 평균기온이 0℃ 안팎이면 비보다 눈 — 이름만 눈으로 (양 기준은 같음)
  if ((d.hi + d.lo) / 2 <= 1 && (d.rain >= 50 || d.rdays >= 9)) {
    if (d.rain >= 120 || d.rdays >= 16) return { lv: d.rain >= 250 || d.rdays >= 22 ? 3 : 2, snow: true, label: '눈 많음', text: '눈이 자주 와요. 미끄럼 방지 신발과 방수 외투를 챙기고, 교통 지연에 대비하세요.' };
    return { lv: 1, snow: true, label: '가끔 눈', text: '가끔 눈이 와요. 미끄럽지 않은 신발을 챙기세요.' };
  }
  if (d.rain >= 250 || d.rdays >= 22) return { lv: 3, label: '우기', text: '비가 아주 많이 와요. 우산·우비를 꼭 챙기고, 실내 일정을 섞어 두세요.' };
  if (d.rain >= 120 || d.rdays >= 16) return { lv: 2, label: '비 자주', text: '비 오는 날이 꽤 있어요. 접이식 우산을 챙기세요.' };
  if (d.rain >= 50 || d.rdays >= 9) return { lv: 1, label: '가끔 비', text: '가끔 비가 와요. 작은 우산 하나면 충분해요.' };
  return { lv: 0, label: '맑은 편', text: '비가 거의 안 오는 건기예요.' };
}

// 여행하기 좋은지 0~100 (기온 쾌적함 + 비)
export function travelScore(d) {
  const t = (d.hi + d.lo) / 2;
  let s = 100;
  if (t < 18) s -= (18 - t) * 4.5;
  if (t > 24) s -= (t - 24) * 7;
  if (d.hi > 30) s -= (d.hi - 30) * 5;
  s -= rainInfo(d).lv * 14;
  if (d.hum >= 80 && t >= 24) s -= 6;
  return Math.max(5, Math.min(100, Math.round(s)));
}

export function scoreLabel(s) {
  if (s >= 75) return { label: '여행하기 좋아요', cls: 'good' };
  if (s >= 50) return { label: '무난해요', cls: 'ok' };
  return { label: '조금 아쉬워요', cls: 'bad' };
}

export function bestMonths(slug, n = 3) {
  const c = climateOf(slug);
  if (!c) return [];
  return c.m
    .map((d, i) => ({ m: i + 1, s: travelScore(d) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((x) => x.m)
    .sort((a, b) => a - b);
}

export const t1 = (x) => `${Math.round(x)}°`;
