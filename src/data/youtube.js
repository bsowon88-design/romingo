// 한국 여행 유튜버 영상 (scripts/youtube.mjs 가 일주일마다 채움)
import yt from './archive/youtube.json';

export const YT = yt?.cities || {};
export const ytOf = (slug) => YT[slug]?.list || [];
export const ytCities = () => Object.keys(YT).filter((k) => ytOf(k).length);
export const fmtViews = (n) => (n >= 1e8 ? `${(n / 1e8).toFixed(1)}억회` : n >= 1e4 ? `${Math.round(n / 1e4)}만회` : `${n.toLocaleString()}회`);
export const fmtDur = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
