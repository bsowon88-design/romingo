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
import { fetchYoutube } from './youtube.mjs';
import { fetchFestivals, fetchPlaces, fetchDetails, kstDate } from './tour.mjs';
import { pickPlaces } from '../src/data/kr-pick.js';
import { KR_WX } from '../src/data/kr-regions.js';
import { updatePopular, fetchTodayFlights } from './icn.mjs';
import { fetchForecasts } from './forecast.mjs';
import { mkdir } from 'node:fs/promises';
import { CITIES, SEOUL } from '../src/data/cities.js';

const Q_FILE = new URL('../src/data/archive/quakes.json', import.meta.url);
const D_FILE = new URL('../src/data/archive/disasters.json', import.meta.url);
const A_FILE = new URL('../src/data/archive/alarms.json', import.meta.url);
const J_FILE = new URL('../src/data/archive/adjusts.json', import.meta.url);
const R_FILE = new URL('../src/data/archive/rates.json', import.meta.url);
const C_FILE = new URL('../src/data/archive/climate.json', import.meta.url);
const P_FILE = new URL('../src/data/archive/photos.json', import.meta.url);
const Y_FILE = new URL('../src/data/archive/youtube.json', import.meta.url);
const F_FILE = new URL('../src/data/archive/popular.json', import.meta.url);
// 자주 바뀌는 자료 — 사이트를 다시 만들지 않고 화면에서 바로 불러옴 (live 폴더)
const LIVE_DIR = new URL('../live/', import.meta.url);
const LF_FILE = new URL('../live/flights.json', import.meta.url);
const LW_FILE = new URL('../live/forecast.json', import.meta.url);
// 국내여행 (한국관광공사) — 자료는 archive, 마지막 수집 시각은 live (시각만 바뀌면 사이트를 다시 만들지 않게)
const KF_FILE = new URL('../src/data/archive/kr-festivals.json', import.meta.url);
const KP_FILE = new URL('../src/data/archive/kr-places.json', import.meta.url);
const KT_FILE = new URL('../live/tour.json', import.meta.url);
const KD_FILE = new URL('../src/data/archive/kr-detail.json', import.meta.url);

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

// 인기 도시 — 인천공항 출발편 (하루 한 번)
if (KEY) {
  try {
    const old = await readList(F_FILE);
    const { out, changed: ch } = await updatePopular(KEY, old);
    if (ch) changed = (await save(F_FILE, old, out, '인기 도시')) || changed;
    else console.log('인기 도시: 오늘 이미 셈 / 받은 것 없음');
  } catch (e) {
    console.warn('인기 도시 수집 실패:', e.message);
  }
}

// 오늘 운항 현황 — 매번
await mkdir(LIVE_DIR, { recursive: true });
if (KEY) {
  try {
    const f = await fetchTodayFlights(KEY);
    if (f) {
      await writeFile(LF_FILE, JSON.stringify(f) + '\n');
      console.log(`운항 현황: 도시 ${Object.keys(f.c).length}곳`);
    } else console.warn('운항 현황: 받은 것 없음');
  } catch (e) {
    console.warn('운항 현황 실패:', e.message);
  }
}

// 날씨 예보 (노르웨이 기상청) — 3시간마다
try {
  let old = null;
  try { old = JSON.parse(await readFile(LW_FILE, 'utf8')); } catch {}
  if (!old || Date.now() - (old.at || 0) > 170 * 60000) {
    const fc = await fetchForecasts([...CITIES, ...KR_WX]); // 해외 도시 + 국내 시도별 기준 지점
    if (fc) {
      await writeFile(LW_FILE, JSON.stringify(fc) + '\n');
      console.log(`예보: 도시 ${Object.keys(fc.c).length}곳`);
    }
  } else console.log('예보: 3시간 안 됨, 건너뜀');
} catch (e) {
  console.warn('예보 실패:', e.message);
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

// 한국 여행 유튜버 영상 — 키가 있을 때, 일주일 지난 도시만 (한 번에 8곳)
const YKEY = process.env.YOUTUBE_KEY;
if (!YKEY) {
  console.log('유튜브: YOUTUBE_KEY 없음, 건너뜀');
} else {
  try {
    const old = await readList(Y_FILE);
    const base = Array.isArray(old) ? {} : old;
    const { out, done, left } = await fetchYoutube(YKEY, base);
    if (done) {
      console.log(`유튜브: ${done}곳 받음, 남은 곳 ${left}, 오늘 사용량 ${out.meta.units}`);
      changed = (await save(Y_FILE, old, out, '유튜브')) || changed;
    } else console.log('유튜브: 새로 받을 곳 없음');
  } catch (e) {
    console.warn('유튜브 수집 실패:', e.message);
  }
}

// 국내여행 — 한국관광공사 축제(6시간마다) · 관광지·문화시설(하루 한 번)
if (KEY) {
  let clock = {};
  try { clock = JSON.parse(await readFile(KT_FILE, 'utf8')); } catch {}
  const tour = [
    ['축제', KF_FILE, fetchFestivals, 'fest', () => Date.now()],
    ['관광지', KP_FILE, fetchPlaces, 'place', () => kstDate()],
  ];
  for (const [label, file, fn, ck, stamp] of tour) {
    try {
      const old = await readList(file);
      const base = Array.isArray(old) ? {} : old;
      const r = await fn(KEY, base, clock);
      if (!r) { console.log(`${label}: 아직 받을 때 아님`); continue; }
      clock[ck] = stamp();
      if (JSON.stringify(r.list) !== JSON.stringify(base.list || [])) {
        await writeFile(file, JSON.stringify(r) + '\n');
        console.log(`${label}: ${(base.list || []).length} → ${r.list.length}개 저장`);
        changed = true;
      } else console.log(`${label}: 바뀐 것 없음`);
    } catch (e) {
      console.warn(`${label} 수집 실패:`, e.message);
    }
  }
  // 상세 설명 — 하루 한 번, 축제 먼저 그다음 사이트에 싣는 관광지
  try {
    const fl = (await readList(KF_FILE)).list || [];
    const pl = (await readList(KP_FILE)).list || [];
    const oldD = await readList(KD_FILE);
    const baseD = Array.isArray(oldD) ? {} : oldD;
    const ids = pickPlaces(pl, baseD.d || {}, { cap: 13, min: 7 }).map((o) => o.p.id);
    const r = await fetchDetails(KEY, baseD, clock, fl, ids);
    if (!r) console.log('상세: 오늘은 이미 받음');
    else {
      clock.detail = kstDate();
      if (JSON.stringify(r.d) !== JSON.stringify(baseD.d || {})) {
        await writeFile(KD_FILE, JSON.stringify({ d: r.d }) + '\n');
        changed = true;
      }
    }
  } catch (e) {
    console.warn('상세 수집 실패:', e.message);
  }
  await mkdir(LIVE_DIR, { recursive: true });
  await writeFile(KT_FILE, JSON.stringify(clock) + '\n');
}

console.log(changed ? '→ 바뀐 것 있음' : '→ 그대로');
