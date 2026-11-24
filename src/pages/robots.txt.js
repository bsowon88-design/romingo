import { SITE_URL } from '../site.js';

export function GET() {
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', SITE_URL).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
