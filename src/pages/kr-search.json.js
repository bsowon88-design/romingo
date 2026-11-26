// 검색창용 국내 자료 (지역·시군구·축제·관광지) — 검색을 처음 칠 때만 불러옴 (모든 페이지에 넣으면 무거워서)
import { KR_REGIONS, PLACES, FESTIVALS, TODAY, catOf } from '../data/domestic.js';

export function GET() {
  const clean = (t) => t.replace(/\s*\[.*?\]\s*/g, ' ').trim();
  // 시·군·구 이름 → 그 지역 (곳이 많은 것부터)
  const dmap = new Map();
  for (const p of PLACES) if (p.dist) dmap.set(`${p.region.slug}|${p.dist}`, [p.dist, p.region.slug, p.region.ko]);
  const body = {
    r: KR_REGIONS.map((r) => [r.slug, r.ko, r.full]),
    d: [...dmap.values()],
    // 끝나지 않은 축제만, 시작일 순
    f: FESTIVALS.filter((f) => f.e >= TODAY)
      .sort((a, b) => a.s.localeCompare(b.s))
      .map((f) => [f.id, clean(f.t), f.region.ko, f.dist || '', f.s, f.e]),
    // 관광지는 점수 높은 순 (검색 결과도 이 순서)
    p: [...PLACES].sort((a, b) => b.sc - a.sc).map((p) => [p.id, clean(p.t), p.region.ko, p.dist || '', catOf(p.c3)]),
  };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
