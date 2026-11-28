// IndexNow — 사이트맵에서 새로 생긴 주소만 네이버·Bing 에 알립니다.
// - 이미 알린 주소는 .indexnow/seen.json (Actions 캐시)에 기록해 다시 보내지 않음
// - 자주 바뀌는 대표 페이지는 하루 1번만 다시 알림 (한국 날짜 기준)
// - 사이트맵 주소가 비정상적으로 적거나, 열쇠 파일이 안 열리면 아무것도 보내지 않음
// - 시험: DRY=1 node scripts/indexnow.mjs (보내지 않고 개수만 출력)
import fs from 'node:fs';
import path from 'node:path';

const SITE = 'https://tripberry.kr';
const HOST = 'tripberry.kr';
const KEY = '6a589641cd3c060b0dd2feae9e199162';
const KEY_URL = `${SITE}/${KEY}.txt`;
const SEEN_PATH = process.env.SEEN_PATH || '.indexnow/seen.json';
const DRY = process.env.DRY === '1';
const MIN_URLS = 500; // 이보다 적으면 사이트맵이 깨진 것으로 보고 보내지 않음
const CHUNK = 1000;
const ENGINES = {
  naver: 'https://searchadvisor.naver.com/indexnow',
  bing: 'https://api.indexnow.org/indexnow',
};
// 자주 바뀌는 대표 페이지 — 하루 1번만 다시 알림
const DAILY = ['/', '/safety/', '/disasters/', '/domestic/', '/domestic/festival/', '/rates/', '/popular/'].map((p) => SITE + p);

const today = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10); // 한국 날짜
const warn = (m) => console.log(`::warning::${m}`);
const fail = (m) => { console.log(`::error::${m}`); process.exit(1); };

async function getText(url, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { redirect: 'follow' });
      if (r.ok) return await r.text();
      last = `HTTP ${r.status}`;
    } catch (e) {
      last = e.message;
    }
    await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
  }
  throw new Error(`${url} → ${last}`);
}

// 1) 사이트맵
let urls;
try {
  const xml = await getText(`${SITE}/sitemap.xml`);
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()).filter((u) => u.startsWith(SITE + '/'));
} catch (e) {
  fail(`사이트맵을 읽지 못했습니다: ${e.message}`);
}
urls = [...new Set(urls)];

// 2) 기록 읽기
let seen = { naver: [], bing: [], daily: { naver: '', bing: '' } };
try {
  seen = { ...seen, ...JSON.parse(fs.readFileSync(SEEN_PATH, 'utf8')) };
} catch {}
const all = new Set(urls);
const seenMax = Math.max(seen.naver.length, seen.bing.length);
if (urls.length < MIN_URLS || (seenMax > 0 && urls.length < seenMax * 0.5)) {
  warn(`사이트맵 주소가 비정상적으로 적습니다 (${urls.length}개, 기록 ${seenMax}개) — 이번에는 보내지 않습니다`);
  process.exit(0);
}

// 3) 열쇠 파일 확인 (이게 안 열리면 엔진이 403 을 돌려줌)
if (!DRY) {
  try {
    const k = (await getText(KEY_URL)).trim();
    if (k !== KEY) fail(`열쇠 파일 내용이 다릅니다: ${KEY_URL}`);
  } catch (e) {
    fail(`열쇠 파일이 열리지 않습니다 (사이트에 올라갔는지 확인): ${e.message}`);
  }
}

// 4) 엔진별로 보내기
let ok = 0;
let bad = 0;
for (const [name, endpoint] of Object.entries(ENGINES)) {
  const have = new Set(seen[name].filter((u) => all.has(u))); // 사라진 주소는 기록에서 뺌
  const fresh = urls.filter((u) => !have.has(u));
  const daily = seen.daily[name] === today ? [] : DAILY.filter((u) => all.has(u) && !fresh.includes(u));
  const todo = [...fresh, ...daily];
  console.log(`[${name}] 새 주소 ${fresh.length}개 · 오늘 다시 알릴 대표 페이지 ${daily.length}개`);
  if (!todo.length) { seen[name] = [...have]; continue; }
  if (DRY) { console.log(`[${name}] DRY — 보내지 않음`); continue; }
  let sent = 0;
  let engineFailed = false;
  for (let i = 0; i < todo.length; i += CHUNK) {
    const part = todo.slice(i, i + CHUNK);
    let status = 0;
    let bodyText = '';
    try {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_URL, urlList: part }),
      });
      status = r.status;
      if (status !== 200 && status !== 202) bodyText = (await r.text().catch(() => '')).slice(0, 300);
    } catch (e) {
      warn(`[${name}] 연결 실패: ${e.message}`);
    }
    if (status === 200 || status === 202) {
      sent += part.length;
      part.forEach((u) => have.add(u));
      await new Promise((r) => setTimeout(r, 1000));
    } else {
      engineFailed = true;
      // 429(잠깐 많음)·5xx 는 다음 실행에서 다시, 400/403/422 는 설정 문제
      const why = status === 429 ? '요청이 많아 잠시 막힘' : status === 403 ? '열쇠 불일치(403)' : status === 422 ? '주소가 사이트와 안 맞음(422)' : `응답 ${status || '없음'}`;
      warn(`[${name}] ${why} — 남은 주소는 다음 실행에서 다시 보냅니다${bodyText ? ' · 응답: ' + bodyText.replace(/\s+/g, ' ') : ''}`);
      break;
    }
  }
  seen[name] = [...have];
  if (!engineFailed) seen.daily[name] = today;
  console.log(`[${name}] ${sent}개 전송${engineFailed ? ' (일부 실패)' : ''}`);
  if (engineFailed && sent === 0) bad++;
  else ok++;
}

// 5) 기록 저장
if (!DRY) {
  fs.mkdirSync(path.dirname(SEEN_PATH), { recursive: true });
  fs.writeFileSync(SEEN_PATH, JSON.stringify(seen));
}
if (!DRY && ok === 0 && bad > 0) fail('모든 엔진에 보내지 못했습니다');
console.log('끝');
