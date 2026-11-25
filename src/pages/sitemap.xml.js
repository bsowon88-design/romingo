import { SITE_URL } from '../site.js';
import { COUNTRIES } from '../data/countries.js';
import { bigQuakes } from '../data/load.js';
import { citiesWithClimate, MONTHS } from '../data/weather.js';
import { GUIDES } from '../data/guides.js';
import { PAIRS } from '../data/pairs.js';

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
    ['/compare/', null],
    ...PAIRS.map(([a, b]) => [`/compare/${a}-vs-${b}/`, null]),
    ['/popular/', now],
    ['/airport/', now],
    ['/find/', null],
    ['/holidays/', now],
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
