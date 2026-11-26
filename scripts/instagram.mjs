// 인스타그램(@tripberry.kr) 자동 게시 — 하루 1번 (.github/workflows/instagram.yml)
// 핀터레스트 RSS(https://tripberry.kr/pins.xml)의 카드를 인스타 비율(1080×1350 JPG, /pins/ig/<id>.jpg)로 올림.
// 최근 게시물 설명에 같은 카드 표시(🔖id)가 있으면 건너뜀.
// 필요한 비밀 값: IG_TOKEN (GitHub Secrets)
//  - 통합 로그인 시스템 사용자 토큰(만료 없음) → graph.facebook.com + 인스타 계정 ID
//  - 인스타그램 로그인 토큰(IG 로 시작, 60일) → graph.instagram.com + /me, 매번 기한 연장
let TOKEN = (process.env.IG_TOKEN || '').trim();
const IGLOGIN = TOKEN.startsWith('IG');
const API = IGLOGIN ? 'https://graph.instagram.com/v23.0' : 'https://graph.facebook.com/v23.0';
const ME = IGLOGIN ? '/me' : `/${process.env.IG_ID || '17841478065695574'}`; // @tripberry.kr
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
  if (!TOKEN) { console.log('IG_TOKEN 이 없어요 → GitHub Secrets 에 넣어 주세요. 이번에는 건너뜀'); return; }

  // 토큰 기한 늘리기 (인스타그램 로그인 토큰만, 60일)
  if (IGLOGIN) try {
    const j = await api('https://graph.instagram.com/refresh_access_token', { grant_type: 'ig_refresh_token' });
    if (j.access_token) {
      if (j.access_token !== TOKEN) console.log('→ 토큰이 새로 바뀌었어요. 기한 안에 GitHub Secrets 의 IG_TOKEN 을 새로 넣어야 할 수 있어요.');
      TOKEN = j.access_token;
      console.log(`토큰 남은 기간: 약 ${Math.round((j.expires_in || 0) / 86400)}일`);
    }
  } catch (e) { console.log('토큰 연장 건너뜀:', e.message); }

  const xml = await (await fetch('https://tripberry.kr/pins.xml', { headers: { 'cache-control': 'no-cache' } })).text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, x]) => ({
    id: tag(x, 'guid'), title: tag(x, 'title'), link: tag(x, 'link'), desc: tag(x, 'description'), date: new Date(tag(x, 'pubDate')),
  })).filter((x) => x.id);
  if (!items.length) { console.log('pins.xml 에 항목이 없어요'); return; }

  let recent = '';
  try {
    const j = await api(`${ME}/media`, { fields: 'caption,timestamp', limit: 40 });
    recent = (j.data || []).map((p) => p.caption || '').join('\n');
  } catch (e) { console.log('최근 게시물 확인 실패:', e.message); }

  const dow = new Date(Date.now() + 9 * 3600e3).getUTCDay();
  const city = items.filter((x) => x.id.startsWith('guide-')).sort((a, b) => b.date - a.date);
  const fest = items.filter((x) => x.id.startsWith('fest-'));
  const best = items.filter((x) => x.id.startsWith('best-'));
  const order = dow >= 4 && dow <= 6 ? [...fest, ...city] : dow === 1 ? [...best, ...city] : city;
  const pick = order.find((x) => !recent.includes(`🔖${x.id}`));
  if (!pick) { console.log('새로 올릴 카드가 없어요'); return; }

  const body = pick.desc.replace(/\s*#\S+/g, '').trim();
  const tags = [...new Set([...(pick.desc.match(/#\S+/g) || []), '#트립베리', '#여행정보', '#여행스타그램'])].join(' ');
  const caption = `${pick.title}\n\n${body}\n\n🔗 자세한 정보는 프로필 링크(tripberry.kr)에서 확인하세요.\n\n${tags}\n🔖${pick.id}`;
  const img = `https://tripberry.kr/pins/ig/${pick.id}.jpg`;
  console.log(`올릴 카드: ${pick.id}\n${img}\n${caption}`);
  if (DRY) return;

  const c = await api(`${ME}/media`, { image_url: img, caption }, 'POST');
  for (let i = 0; i < 10; i++) {
    await sleep(10000);
    const s = await api(`/${c.id}`, { fields: 'status_code' }).catch(() => ({}));
    if (s.status_code === 'FINISHED') break;
    if (s.status_code === 'ERROR') throw new Error('이미지 처리 실패');
  }
  const p = await api(`${ME}/media_publish`, { creation_id: c.id }, 'POST');
  console.log('올렸어요:', p.id);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
