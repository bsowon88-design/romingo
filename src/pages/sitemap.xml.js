import { SITE_URL } from '../site.js';
import { COUNTRIES } from '../data/countries.js';
import { bigQuakes } from '../data/load.js';
import { citiesWithClimate, MONTHS } from '../data/weather.js';

export function GET() {
  const now = new Date().toISOString();
  const urls = [
    ['/', now],
    ['/country/', now],
    ['/quakes/', now],
    ['/disasters/', now],
    ['/about/', null],
    ...COUNTRIES.map((c) => [`/country/${c.slug}/`, now]),
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
