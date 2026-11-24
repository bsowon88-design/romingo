// 사이트를 만들기 전에 국기 그림(flag-icons, MIT)을 public/flags 로 복사.
import { cp, mkdir } from 'node:fs/promises';
const src = new URL('../node_modules/flag-icons/flags/4x3/', import.meta.url);
const dst = new URL('../public/flags/', import.meta.url);
await mkdir(dst, { recursive: true });
await cp(src, dst, { recursive: true });
console.log('국기 그림 복사 완료');
