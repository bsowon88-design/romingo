// 지진 위치(영어) → 한국어, 날짜 → 한국 시간
// 이 파일은 화면(브라우저)에서도 같이 씀 — 노드 전용 기능 쓰지 말 것.
import { COUNTRIES, EXTRA_KO } from './countries.js';

const DIR = { N: '북', S: '남', E: '동', W: '서' };

function dirKo(d) {
  return d.toUpperCase().split('').map((c) => DIR[c] || '').join('') + '쪽';
}

// 위치 글에서 나라 페이지 찾기
export function countryOf(place = '') {
  const low = place.toLowerCase();
  const last = low.split(',').pop().trim().replace(/ region$/, '');
  // 1) 맨 끝 말이 정확히 맞는 나라 먼저 ("Baja California, Mexico" → 멕시코)
  for (const c of COUNTRIES) {
    if ((c.states && c.states.includes(last)) || c.keys.includes(last)) return c;
  }
  // 2) 글 안에 들어 있는 말로 찾기
  for (const c of COUNTRIES) {
    if (c.keys.some((k) => low.includes(k))) return c;
  }
  return null;
}

// 제목에 쓸 짧은 지역 이름
export function regionKo(place = '') {
  const c = countryOf(place);
  if (c) return c.short || c.ko;
  const low = place.toLowerCase();
  // 긴 이름부터 맞춰 봄 ("papua new guinea" 가 "papua" 보다 먼저)
  const keys = Object.keys(EXTRA_KO).sort((a, b) => b.length - a.length);
  for (const k of keys) if (low.includes(k)) return EXTRA_KO[k];
  const last = place.split(',').pop().trim().replace(/ region$/i, '');
  return last || '바다';
}

// "45 km SSE of Hualien City, Taiwan" → "대만 Hualien City 남남동쪽 45km"
export function translatePlace(place = '') {
  const m = place.match(/^(\d+)\s*km\s+([NSEW]{1,3})\s+of\s+(.+)$/i);
  const region = regionKo(place);
  if (m) {
    const parts = m[3].split(',').map((s) => s.trim());
    const city = parts.length > 1 ? parts.slice(0, -1).join(', ') : parts[0];
    return `${region} ${city} ${dirKo(m[2])} ${m[1]}km`;
  }
  const parts = place.split(',').map((x) => x.trim());
  const rest = parts.length > 1 ? parts.slice(0, -1).join(', ') : '';
  if (/^off the /i.test(place)) return `${region} 앞바다 (${place.replace(/,[^,]*$/, '')})`;
  if (rest) return `${region} ${rest}`;
  return `${region} 부근`;
}

const fmt = (opts) => new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', ...opts });
const fDateTime = fmt({ year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
const fDate = fmt({ year: 'numeric', month: 'long', day: 'numeric' });
const fShort = fmt({ month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });

export const kstDateTime = (t) => fDateTime.format(new Date(t));
export const kstDate = (t) => fDate.format(new Date(t));
export const kstShort = (t) => fShort.format(new Date(t));

export function ago(t, now = Date.now()) {
  const m = Math.round((now - t) / 60000);
  if (m < 1) return '방금';
  if (m < 60) return `${m}분 전`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.round(h / 24);
  return `${d}일 전`;
}

// 규모별 색 등급
export function magLevel(mag) {
  if (mag >= 7) return 'red';
  if (mag >= 6) return 'orange';
  if (mag >= 5) return 'yellow';
  return 'gray';
}
