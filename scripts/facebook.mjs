// 페이스북 페이지(트립베리) 자동 게시 — 하루 1번 (.github/workflows/facebook.yml)
// 핀터레스트 RSS(https://tripberry.kr/pins.xml)의 카드(/pins/ig/<id>.jpg)에 누를 수 있는 링크를 붙여 올림.
// 최근 게시물에 같은 링크가 있으면 건너뜀.
// 필요한 비밀 값: FB_TOKEN (GitHub Secrets) — 페이지 토큰 또는 시스템 사용자 토큰
// 페이지가 여러 개 보이면 FB_PAGE_ID 로 고를 수 있음(없으면 이름에 '트립베리'가 들어간 페이지)
const API = 'https://graph.facebook.com/v23.0';
let TOKEN = (process.env.FB_TOKEN || '').trim();
const DRY = process.env.DRY === '1';

async function api(path, params = {}, method = 'GET') {
  const u = new URL(`${API}${path}`);
  for (const [k, v] of Object.entries({ ...params, access_token: TOKEN })) u.searchParams.set(k, v);
  const r = await fetch(u, { method });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(`${path} → ${r.status} ${j.error?.message || ''}`);
  return j;
}
const un = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const tag = (x, t) => un((x.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`)) || [])[1] || '').trim();

async function page() {
  // 시스템 사용자·개인 토큰이면 관리 페이지 목록에서 페이지 토큰을 꺼냄
  try {
    const j = await api('/me/accounts', { fields: 'id,name,access_token', limit: 50 });
    const list = j.data || [];
    if (list.length) {
      const p = list.find((x) => x.id === process.env.FB_PAGE_ID) || list.find((x) => /트립베리|tripberry/i.test(x.name));
      if (!p) throw new Error(`트립베리 페이지를 못 찾았어요 → 보이는 페이지: ${list.map((x) => x.name).join(', ')}`);
      TOKEN = p.access_token;
      return p;
    }
  } catch (e) {
    if (/트립베리 페이지/.test(e.message)) throw e;
  }
  return api('/me', { fields: 'id,name' }); // 이미 페이지 토큰
}

async function main() {
  if (!TOKEN) { console.log('FB_TOKEN 이 없어요 → GitHub Secrets 에 넣어 주세요. 이번에는 건너뜀'); return; }
  const pg = await page();
  console.log(`페이지: ${pg.name} (${pg.id})`);

  const xml = await (await fetch('https://tripberry.kr/pins.xml', { headers: { 'cache-control': 'no-cache' } })).text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, x]) => ({
    id: tag(x, 'guid'), title: tag(x, 'title'), link: tag(x, 'link'), desc: tag(x, 'description'), date: new Date(tag(x, 'pubDate')),
  })).filter((x) => x.id);
  if (!items.length) { console.log('pins.xml 에 항목이 없어요'); return; }

  let recent = '';
  try {
    const j = await api(`/${pg.id}/posts`, { fields: 'message', limit: 40 });
    recent = (j.data || []).map((p) => p.message || '').join('\n');
  } catch (e) { console.log('최근 게시물 확인 실패:', e.message); }

  const dow = new Date(Date.now() + 9 * 3600e3).getUTCDay();
  const city = items.filter((x) => x.id.startsWith('guide-')).sort((a, b) => b.date - a.date);
  const fest = items.filter((x) => x.id.startsWith('fest-'));
  const best = items.filter((x) => x.id.startsWith('best-'));
  const order = dow >= 4 && dow <= 6 ? [...fest, ...city] : dow === 1 ? [...best, ...city] : city;
  const pick = order.find((x) => x.link && !recent.includes(x.link));
  if (!pick) { console.log('새로 올릴 카드가 없어요'); return; }

  const body = pick.desc.replace(/\s*#\S+/g, '').trim();
  const tags = [...new Set([...(pick.desc.match(/#\S+/g) || []).slice(0, 2), '#트립베리', '#여행정보'])].join(' ');
  const message = `${pick.title}\n\n${body}\n\n👉 ${pick.link}\n\n${tags}`;
  const img = `https://tripberry.kr/pins/ig/${pick.id}.jpg`;
  console.log(`올릴 카드: ${pick.id}\n${img}\n${message}`);
  if (DRY) return;

  const p = await api(`/${pg.id}/photos`, { url: img, message, published: 'true' }, 'POST');
  console.log('올렸어요:', p.post_id || p.id);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
