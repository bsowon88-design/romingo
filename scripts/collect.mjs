// 자동 수집 — GitHub Actions 가 1시간마다 실행.
// 큰 지진(규모 5 이상)과 재난 경보를 보관함에 쌓음. 바뀐 게 있을 때만 파일을 고침 → 그때만 사이트가 다시 만들어짐.
import { readFile, writeFile } from 'node:fs/promises';
import {
  USGS_MONTH, gdacsUrl, normQuake, normDisaster, mergeById, getJson, ARCHIVE_MIN_MAG,
} from '../src/data/normalize.js';
import { fetchAlarms, fetchAdjusts } from './mofa.mjs';
import { fetchRates } from './ecos.mjs';
import { fetchClimate } from './climate.mjs';
import { fetchPhotos } from './photos.mjs';
import { CITIES, SEOUL } from '../src/data/cities.js';

const Q_FILE = new URL('../src/data/archive/quakes.json', import.meta.url);
const D_FILE = new URL('../src/data/archive/disasters.json', import.meta.url);
const A_FILE = new URL('../src/data/archive/alarms.json', import.meta.url);
const J_FILE = new URL('../src/data/archive/adjusts.json', import.meta.url);
const R_FILE = new URL('../src/data/archive/rates.json', import.meta.url);
const C_FILE = new URL('../src/data/archive/climate.json', import.meta.url);
const P_FILE = new URL('../src/data/archive/photos.json', import.meta.url);

async function readList(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return [];
  }
}

async function save(file, oldList, newList, label) {
  const before = JSON.stringify(oldList);
  const after = JSON.stringify(newList);
  if (before === after) {
    console.log(`${label}: 바뀐 것 없음`);
    return false;
  }
  await writeFile(file, JSON.stringify(newList, null, 1) + '\n');
  console.log(`${label}: ${oldList.length} → ${newList.length}개`);
  return true;
}

let changed = false;

try {
  const j = await getJson(USGS_MONTH, 30000);
  const big = (j.features || []).map(normQuake).filter((q) => q.mag >= ARCHIVE_MIN_MAG);
  const old = await readList(Q_FILE);
  changed = (await save(Q_FILE, old, mergeById(old, big), '지진')) || changed;
} catch (e) {
  console.warn('지진 수집 실패:', e.message);
}

try {
  const j = await getJson(gdacsUrl(), 30000);
  const list = (j.features || []).map(normDisaster);
  const old = await readList(D_FILE);
  changed = (await save(D_FILE, old, mergeById(old, list, 'from'), '재난 경보')) || changed;
} catch (e) {
  console.warn('재난 경보 수집 실패:', e.message);
}

// 외교부 여행경보 — 키가 있을 때만
const KEY = process.env.DATA_GO_KR_KEY;
if (!KEY) {
  console.log('외교부: DATA_GO_KR_KEY 없음, 건너뜀');
} else {
  try {
    const alarms = await fetchAlarms(KEY);
    if (Object.keys(alarms).length) {
      const old = await readList(A_FILE);
      changed = (await save(A_FILE, old, alarms, '여행경보')) || changed;
    } else console.warn('여행경보: 받은 것 없음');
  } catch (e) {
    console.warn('여행경보 수집 실패:', e.message);
  }
  try {
    const adj = await fetchAdjusts(KEY);
    if (adj.length) {
      const old = await readList(J_FILE);
      changed = (await save(J_FILE, old, adj, '여행경보 조정')) || changed;
    } else console.warn('여행경보 조정: 받은 것 없음');
  } catch (e) {
    console.warn('여행경보 조정 수집 실패:', e.message);
  }
}

// 한국은행 환율 — 키가 있을 때만
const EKEY = process.env.ECOS_KEY;
if (!EKEY) {
  console.log('환율: ECOS_KEY 없음, 건너뜀');
} else {
  try {
    const rates = await fetchRates(EKEY);
    if (Object.keys(rates).length) {
      const old = await readList(R_FILE);
      changed = (await save(R_FILE, old, rates, '환율')) || changed;
    } else console.warn('환율: 받은 것 없음');
  } catch (e) {
    console.warn('환율 수집 실패:', e.message);
  }
}

// 도시 월별 날씨 — 아직 없는 도시만 받아 옴 (처음 한 번)
try {
  const old = await readList(C_FILE);
  const clim = Array.isArray(old) ? {} : { ...old };
  const todo = [SEOUL, ...CITIES].filter((c) => !clim[c.slug]);
  if (todo.length) console.log(`날씨: ${todo.length}개 도시 받기`);
  for (const c of todo) {
    try {
      clim[c.slug] = await fetchClimate(c);
      console.log(`  ${c.ko} 완료`);
    } catch (e) {
      console.warn(`  ${c.ko} 실패:`, e.message);
    }
    await new Promise((r) => setTimeout(r, 800));
  }
  if (todo.length) changed = (await save(C_FILE, old, clim, '날씨')) || changed;
} catch (e) {
  console.warn('날씨 수집 실패:', e.message);
}

// 대표 사진 — 키가 있을 때, 아직 없는 곳만 (한 번에 20곳)
const UKEY = process.env.UNSPLASH_KEY;
if (!UKEY) {
  console.log('사진: UNSPLASH_KEY 없음, 건너뜀');
} else {
  try {
    const old = await readList(P_FILE);
    const base = Array.isArray(old) ? {} : old;
    const { out, done, left } = await fetchPhotos(UKEY, base);
    if (done) {
      console.log(`사진: ${done}곳 받음, 남은 곳 ${left}`);
      changed = (await save(P_FILE, old, out, '사진')) || changed;
    } else console.log('사진: 새로 받을 곳 없음');
  } catch (e) {
    console.warn('사진 수집 실패:', e.message);
  }
}

console.log(changed ? '→ 바뀐 것 있음' : '→ 그대로');
