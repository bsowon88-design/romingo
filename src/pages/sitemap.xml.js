import { SITE_URL } from '../site.js';
import { COUNTRIES } from '../data/countries.js';
import { bigQuakes } from '../data/load.js';
import { citiesWithClimate, MONTHS } from '../data/weather.js';
import { GUIDES } from '../data/guides.js';
import { PAIRS } from '../data/pairs.js';
import { PREP_GUIDES } from '../data/partners.js';
import { ytCities } from '../data/youtube.js';
import { KR_REGIONS, FESTIVALS, PLACES, detailOf } from '../data/domestic.js';

export function GET() {
  const now = new Date().toISOString();
  const urls = [
    ['/', now],
    ['/country/', now],
    ['/safety/', now],
    ['/rates/', now],
    ['/guide/', null],
    ['/quakes/', now],
    ['/disasters/', now],
    ['/about/', null],
    ['/map/', now],
    ['/prep/', now],
    ...PREP_GUIDES.map((g) => [`/prep/${g.slug}/`, new Date(g.date).toISOString()]),
    ['/compare/', null],
    ...PAIRS.map(([a, b]) => [`/compare/${a}-vs-${b}/`, null]),
    ['/popular/', now],
    ['/airport/', now],
    ['/find/', null],
    ['/holidays/', now],
    ['/videos/', now],
    ['/domestic/', now],
    ['/domestic/festival/', now],
    ...KR_REGIONS.map((r) => [`/domestic/${r.slug}/`, now]),
    // 소개 글까지 받아 둔 곳만 (아직 없는 곳은 페이지에 noindex)
    ...FESTIVALS.filter((f) => detailOf(f.id)?.o).map((f) => [`/domestic/festival/${f.id}/`, null]),
    ...PLACES.filter((p) => detailOf(p.id)?.o).map((p) => [`/domestic/place/${p.id}/`, null]),
    ...ytCities().map((k) => [`/videos/${k}/`, now]),
    ...['icn', 'gmp', 'pus', 'cju'].map((a) => [`/airport/${a}/`, now]),
    ...COUNTRIES.flatMap((c) => ['', 'safety/', 'weather/', 'info/'].map((t) => [`/country/${c.slug}/${t}`, now])),
    ...GUIDES.map((g) => [`/guide/${g.city}/`, new Date(g.updated).toISOString()]),
    ['/weather/', null],
    ...citiesWithClimate.flatMap((c) => [[`/weather/${c.slug}/`, null], ...MONTHS.map((m) => [`/weather/${c.slug}/${m}/`, null])]),
    ...bigQuakes.map((q) => [`/quake/${q.id}/`, new Date(q.time).toISOString()]),
  ];
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map(([p, m]) => `  <url><loc>${new URL(p, SITE_URL).href}</loc>${m ? `<lastmod>${m}</lastmod>` : ''}</url>`)
      .join('\n') +
    '\n</urlset>\n';
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
