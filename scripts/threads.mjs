// 스레드(@tripberry.kr) 자동 게시 — 하루 2번 (.github/workflows/threads.yml)
// 사이트의 핀터레스트 RSS(https://tripberry.kr/pins.xml)에 있는 카드 이미지와 글을 그대로 씀.
// 최근에 올린 글에 같은 링크가 있으면 건너뛰어서 같은 내용을 두 번 올리지 않음.
// 필요한 비밀 값: THREADS_TOKEN (GitHub Secrets)
const API = 'https://graph.threads.net/v1.0';
let TOKEN = process.env.THREADS_TOKEN || '';
const SLOT = process.env.SLOT || (new Date(Date.now() + 9 * 3600e3).getUTCHours() < 14 ? 'am' : 'pm'); // 한국 시간 오후 2시 전이면 아침 글
const DRY = process.env.DRY === '1';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function api(path, params = {}, method = 'GET') {
  const u = new URL(path.startsWith('http') ? path : `${API}${path}`);
  for (const [k, v] of Object.entries({ ...params, access_token: TOKEN })) u.searchParams.set(k, v);
  const r = await fetch(u, { method });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(`${path} → ${r.status} ${j.error?.message || ''}`);
  return j;
}

const un = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const tag = (x, t) => un((x.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`)) || [])[1] || '').trim();

async function main() {
  if (!TOKEN) { console.log('THREADS_TOKEN 이 없어요 → GitHub Secrets 에 넣어 주세요. 이번에는 건너뜀'); return; }

  // 토큰 기한 늘리기 (60일 토큰, 하루 지난 뒤부터 가능 — 실패해도 지금 토큰으로 계속)
  try {
    const j = await api('https://graph.threads.net/refresh_access_token', { grant_type: 'th_refresh_token' });
    if (j.access_token) {
      if (j.access_token !== TOKEN) console.log('→ 토큰이 새로 바뀌었어요. 기한 안에 GitHub Secrets 의 THREADS_TOKEN 을 새로 만들어 넣어야 할 수 있어요.');
      TOKEN = j.access_token;
      console.log(`토큰 남은 기간: 약 ${Math.round((j.expires_in || 0) / 86400)}일`);
    }
  } catch (e) { console.log('토큰 연장 건너뜀:', e.message); }

  const xml = await (await fetch('https://tripberry.kr/pins.xml', { headers: { 'cache-control': 'no-cache' } })).text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, x]) => ({
    id: tag(x, 'guid'),
    title: tag(x, 'title'),
    link: tag(x, 'link'),
    desc: tag(x, 'description'),
    img: (x.match(/<enclosure url="([^"]+)"/) || [])[1],
    date: new Date(tag(x, 'pubDate')),
  })).filter((x) => x.id && x.img);
  if (!items.length) { console.log('pins.xml 에 항목이 없어요'); return; }

  // 최근 글 (같은 링크 다시 안 올리기)
  let recent = '';
  try {
    const j = await api('/me/threads', { fields: 'text,timestamp', limit: 40 });
    recent = (j.data || []).map((p) => p.text || '').join('\n');
  } catch (e) { console.log('최근 글 확인 실패:', e.message); }

  const kstDow = new Date(Date.now() + 9 * 3600e3).getUTCDay(); // 0 일 ~ 6 토
  const city = items.filter((x) => x.id.startsWith('guide-')).sort((a, b) => b.date - a.date);
  const fest = items.filter((x) => x.id.startsWith('fest-'));
  const best = items.filter((x) => x.id.startsWith('best-'));
  let order = city;
  if (SLOT === 'pm' && kstDow >= 4 && kstDow <= 6) order = [...fest, ...city]; // 목·금·토 저녁: 이번 주말 축제
  else if (SLOT === 'pm' && kstDow === 1) order = [...best, ...city]; // 월 저녁: 이번 달 추천 여행지
  else if (SLOT === 'pm') order = [...city.slice(1), ...city.slice(0, 1)];
  const pick = order.find((x) => !recent.includes(x.link));
  if (!pick) { console.log('새로 올릴 카드가 없어요 (최근에 다 올림)'); return; }

  const body = pick.desc.replace(/\s*#\S+/g, '').trim();
  const topic = (pick.desc.match(/#(\S+)/) || [])[1];
  let text = `${pick.title}\n\n${body}\n\n👉 ${pick.link}`;
  if (topic) text += `\n#${topic}`;
  if (text.length > 490) text = `${pick.title}\n\n${body.slice(0, 490 - pick.title.length - pick.link.length - 20)}…\n\n👉 ${pick.link}`;

  console.log(`올릴 카드: ${pick.id}\n${text}`);
  if (DRY) return;

  const c = await api('/me/threads', { media_type: 'IMAGE', image_url: pick.img, text }, 'POST');
  await sleep(30000); // 이미지 처리 기다림 (메타 권장 30초)
  for (let i = 0; i < 5; i++) {
    try {
      const p = await api('/me/threads_publish', { creation_id: c.id }, 'POST');
      console.log('올렸어요:', p.id);
      return;
    } catch (e) {
      console.log('아직 준비 중 — 다시 시도', e.message);
      await sleep(20000);
    }
  }
  throw new Error('게시 실패 — 다음 실행 때 다시 해요');
}

main().catch((e) => { console.error(e.message); process.exit(1); });
