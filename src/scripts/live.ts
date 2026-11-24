// 화면에서 바로 불러오는 자주 바뀌는 자료 (오늘 운항 현황·날씨 예보)
import { LIVE_BASE } from '../site.js';

const cache: Record<string, Promise<any>> = {};
export function loadLive(name: 'flights' | 'forecast'): Promise<any> {
  return (cache[name] ||= fetch(`${LIVE_BASE}${name}.json`, { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status))))));
}

// 노르웨이 기상청 날씨 모양 → 그림·말
export function sym(code: string): [string, string] {
  const c = code || '';
  if (/thunder/.test(c)) return ['⛈️', '뇌우'];
  if (/sleet/.test(c)) return ['🌨️', '진눈깨비'];
  if (/snow/.test(c)) return ['❄️', '눈'];
  if (/heavyrain/.test(c)) return ['🌧️', '많은 비'];
  if (/lightrain/.test(c)) return ['🌦️', '약한 비'];
  if (/rain/.test(c)) return ['🌧️', '비'];
  if (/fog/.test(c)) return ['🌫️', '안개'];
  if (/cloudy/.test(c) && !/partly/.test(c)) return ['☁️', '흐림'];
  if (/partlycloudy/.test(c)) return ['⛅', '구름 조금'];
  if (/fair/.test(c)) return ['🌤️', '대체로 맑음'];
  return ['☀️', '맑음'];
}

export const WD = ['일', '월', '화', '수', '목', '금', '토'];
export function dayLabel(ymd: string) {
  const [y, m, d] = ymd.split('-').map(Number);
  const w = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { md: `${m}.${d}`, wd: WD[w], we: w === 0 || w === 6 };
}

export const kstHM = (t: number) =>
  new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(t));

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = ''): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}
