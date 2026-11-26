// 핀터레스트 자동 게시용 RSS — 핀 일괄 만들기 → 자동 게시에 연결
import { pinList } from '../pins/pins.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function GET() {
  const items = pinList()
    .sort((a, b) => b.date - a.date)
    .map((p) => {
      const img = `https://tripberry.kr/pins/${p.id}.png`;
      return `<item>
<title>${esc(p.title)}</title>
<link>${p.link}</link>
<guid isPermaLink="false">${p.id}</guid>
<pubDate>${p.date.toUTCString()}</pubDate>
<description>${esc(p.desc)}</description>
<enclosure url="${img}" type="image/png" length="0"/>
<media:content url="${img}" medium="image" type="image/png" width="1000" height="1500"/>
</item>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
<title>트립베리 - 국내·해외 여행 안전 · 날씨 · 가이드</title>
<link>https://tripberry.kr/</link>
<description>도시별 여행가이드, 이번 주말 전국 축제, 이달의 추천 여행지</description>
<language>ko</language>
${items}
</channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
