// 한국 여행 유튜버 영상 — 도시마다 일주일에 한 번 유튜브에서 새로 찾음.
// 유튜브 API 하루 한도(10,000)를 넘지 않게 하루 사용량을 기록하고 8,000 에서 멈춤.
// 검색 1번 = 100, 영상·채널 정보 = 1씩.
import { CITIES } from '../src/data/cities.js';

const API = 'https://www.googleapis.com/youtube/v3';
const WEEK = 7 * 24 * 3600 * 1000;
const PER_RUN = 8; // 한 번 돌 때 최대 도시 수
const DAY_LIMIT = 8000;
const KEEP = 8; // 도시당 남길 영상 수
const PER_CH = 2; // 같은 유튜버는 도시당 2개까지

// 검색어가 도시 이름과 다른 곳
const QUERY = {
  honolulu: '하와이', losangeles: 'LA', newyork: '뉴욕', sanfrancisco: '샌프란시스코',
  kotakinabalu: '코타키나발루', hochiminh: '호치민', kualalumpur: '쿠알라룸푸르',
  guam: '괌', saipan: '사이판', okinawa: '오키나와', siemreap: '씨엠립',
  oita: '유후인', yanji: '연길', tashkent: '우즈베키스탄',
};
// 제목에 이 말 중 하나가 있어야 그 도시 영상으로 봄
const ALSO = {
  hochiminh: ['호찌민', '사이공'], kualalumpur: ['쿠알라 룸푸르', 'KL'], losangeles: ['로스앤젤레스', '엘에이'],
  siemreap: ['시엠립', '시엠레아프', '앙코르'], hongkong: ['홍콩'], bali: ['발리'], newyork: ['뉴욕', 'NYC'],
  cappadocia: ['카파도키아'], interlaken: ['인터라켄', '융프라우'], zhangjiajie: ['장가계', '장자제'],
  luangprabang: ['루앙프라방'], ulaanbaatar: ['울란바토르', '몽골'], cebu: ['세부'], danang: ['다낭', '호이안'],
  oita: ['오이타', '벳부', '유후인'], yanji: ['옌지', '백두산', '연변'], xian: ['서안'], chengdu: ['성도'], xiamen: ['하문'], guilin: ['계림', '양숴', '양삭'], sanya: ['삼아', '하이난'], kunming: ['곤명'], chongqing: ['중경'], tianjin: ['천진'],
  miyakojima: ['미야코'], ishigaki: ['이시가키지마'], vancouver: ['벤쿠버'], frankfurt: ['프랑크프루트'], tashkent: ['우즈베키스탄', '우즈벡', '사마르칸트', '부하라'],
};

const HANGUL = /[가-힣]/;
const SHORTS = /#shorts|쇼츠/i;

async function get(path, params) {
  const u = new URL(`${API}/${path}`);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const res = await fetch(u, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`${path} HTTP ${res.status} ${(await res.text()).slice(0, 160)}`);
  return res.json();
}

const secs = (iso) => {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso || '') || [];
  return (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0);
};

async function cityVideos(key, c) {
  const word = QUERY[c.slug] || c.ko.split(' ').pop();
  const names = [word, c.ko, ...(ALSO[c.slug] || [])].map((s) => s.toLowerCase());
  const since = new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString();
  const s = await get('search', {
    key, part: 'snippet', type: 'video', q: `${word} 여행`, maxResults: '50',
    relevanceLanguage: 'ko', regionCode: 'KR', videoEmbeddable: 'true', safeSearch: 'moderate', publishedAfter: since,
  });
  const ids = (s.items || []).map((i) => i.id?.videoId).filter(Boolean);
  if (!ids.length) return { list: [], units: 100 };
  const v = await get('videos', { key, part: 'snippet,contentDetails,statistics,status', id: ids.join(','), maxResults: '50' });
  let vids = (v.items || []).filter((x) => {
    const t = x.snippet?.title || '';
    const lt = t.toLowerCase();
    return x.status?.embeddable && x.status?.privacyStatus === 'public' && !x.status?.madeForKids
      && HANGUL.test(t) && !SHORTS.test(t) && secs(x.contentDetails?.duration) >= 240
      && names.some((n) => lt.includes(n));
  });
  const chIds = [...new Set(vids.map((x) => x.snippet.channelId))];
  const ch = chIds.length ? await get('channels', { key, part: 'snippet', id: chIds.slice(0, 50).join(','), maxResults: '50' }) : { items: [] };
  const korean = new Set((ch.items || []).filter((x) => x.snippet?.country === 'KR' || (!x.snippet?.country && HANGUL.test(x.snippet?.title || ''))).map((x) => x.id));
  vids = vids.filter((x) => korean.has(x.snippet.channelId))
    .sort((a, b) => (+b.statistics?.viewCount || 0) - (+a.statistics?.viewCount || 0));
  const per = {};
  const list = [];
  for (const x of vids) {
    const cid = x.snippet.channelId;
    if ((per[cid] = (per[cid] || 0) + 1) > PER_CH) continue;
    list.push({
      id: x.id,
      t: x.snippet.title.slice(0, 100),
      ch: x.snippet.channelTitle,
      cid,
      views: +x.statistics?.viewCount || 0,
      at: x.snippet.publishedAt.slice(0, 10),
      dur: secs(x.contentDetails?.duration),
    });
    if (list.length >= KEEP) break;
  }
  return { list, units: 102 };
}

// old: 지난 자료 { meta: { day, units }, cities: { slug: { at, list } } }
export async function fetchYoutube(key, old) {
  const out = { meta: { ...(old?.meta || {}) }, cities: { ...(old?.cities || {}) } };
  const today = new Date().toISOString().slice(0, 10); // 유튜브 한도는 미국 시간 기준이라 넉넉히 잡음
  if (out.meta.day !== today) out.meta = { day: today, units: 0 };
  const now = Date.now();
  const todo = CITIES.filter((c) => !out.cities[c.slug] || now - Date.parse(out.cities[c.slug].at) > WEEK)
    .sort((a, b) => (Date.parse(out.cities[a.slug]?.at || 0) || 0) - (Date.parse(out.cities[b.slug]?.at || 0) || 0));
  let done = 0;
  for (const c of todo.slice(0, PER_RUN)) {
    if (out.meta.units + 110 > DAY_LIMIT) break;
    try {
      const { list, units } = await cityVideos(key, c);
      out.meta.units += units;
      // 새로 찾은 게 너무 적으면 지난 영상 중 남은 걸 섞어서 유지
      const prev = (out.cities[c.slug]?.list || []).filter((p) => !list.some((x) => x.id === p.id));
      out.cities[c.slug] = { at: new Date().toISOString(), list: list.length >= 3 ? list : [...list, ...prev].slice(0, KEEP) };
      done++;
    } catch (e) {
      console.warn(`유튜브 ${c.slug} 실패:`, e.message);
      if (/HTTP 403/.test(e.message)) break; // 한도 초과 등
    }
  }
  return { out, done, left: Math.max(0, todo.length - done) };
}
