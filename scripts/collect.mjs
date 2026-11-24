// 자동 수집 — GitHub Actions 가 1시간마다 실행.
// 큰 지진(규모 5 이상)과 재난 경보를 보관함에 쌓음. 바뀐 게 있을 때만 파일을 고침 → 그때만 사이트가 다시 만들어짐.
import { readFile, writeFile } from 'node:fs/promises';
import {
  USGS_MONTH, gdacsUrl, normQuake, normDisaster, mergeById, getJson, ARCHIVE_MIN_MAG,
} from '../src/data/normalize.js';

const Q_FILE = new URL('../src/data/archive/quakes.json', import.meta.url);
const D_FILE = new URL('../src/data/archive/disasters.json', import.meta.url);

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

console.log(changed ? '→ 바뀐 것 있음' : '→ 그대로');
