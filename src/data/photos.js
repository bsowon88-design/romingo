// 대표 사진 (Unsplash) — 주소를 그대로 불러 쓰고 크기만 바꿈
import photos from './archive/photos.json';

const UTM = 'utm_source=romingo&utm_medium=referral';
const withUtm = (u) => `${u}${u.includes('?') ? '&' : '?'}${UTM}`;

export function photoOf(key) {
  const p = photos?.[key];
  if (!p?.raw) return null;
  const sized = (w, h) => `${p.raw}&w=${w}&h=${h}&fit=crop&crop=entropy&q=70&fm=webp`;
  return {
    color: p.color,
    alt: p.alt,
    src: (w = 960, h = 540) => sized(w, h),
    srcset: (w, h) => `${sized(w, h)} 1x, ${sized(w * 2, h * 2)} 2x`,
    name: p.name,
    userUrl: withUtm(p.userUrl),
    unsplashUrl: withUtm('https://unsplash.com/'),
  };
}

export const countryPhoto = (slug) => photoOf(`country:${slug}`);
export const cityPhoto = (slug) => photoOf(`city:${slug}`);
export const allPhotos = () => Object.entries(photos || {}).map(([key, p]) => ({ key, ...p, userUrl: withUtm(p.userUrl), page: withUtm(p.page) }));
