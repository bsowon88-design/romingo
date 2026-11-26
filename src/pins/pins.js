// 핀터레스트 자동 게시용 세로 카드(1000×1500)와 RSS 항목
// 핀터레스트 비즈니스 → 설정 → 핀 일괄 만들기 → 자동 게시에 https://tripberry.kr/pins.xml 을 연결해 둠.
// 매일 도시 가이드 카드 3장 + 이번 주말 축제 1장 + 이번 달 추천 도시 1장. guid 가 같으면 핀터레스트가 다시 올리지 않음.
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { CITIES } from '../data/cities.js';
import { bySlug } from '../data/countries.js';
import { guideByCity } from '../data/guides.js';
import { HAS_CLIMATE, climateOf, travelScore, rainInfo, bestMonths } from '../data/weather.js';
import { flightMin } from '../data/tripdata.js';
import { countryAlarm } from '../data/load.js';
import { cityLevels } from '../data/near.js';
import { festWeekend, WEEKEND, fmtD } from '../data/domestic.js';

const ROOT = process.cwd();
const W = 1000, H = 1500;
const C = { bg: '#FFF6EF', ink: '#2E2420', sea: '#C85E30', coral: '#E8794A', soft: '#FCE3D6', line: '#F0DDD2', sub: '#7a665c' };
const FONT = 'Noto Sans CJK KR';
const fontFiles = ['Medium', 'Bold', 'Black'].map((w) => path.join(ROOT, 'src/pins', `NotoSansKR-${w}.otf`));

// ── 날짜 (한국 시간) ──
const kst = new Date(Date.now() + 9 * 3600e3);
const ymd = kst.toISOString().slice(0, 10);
const START = Date.UTC(2026, 10, 26); // 첫 게시일
const DAY = Math.max(0, Math.floor((Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate()) - START) / 86400e3));
const MONTH = kst.getUTCMonth() + 1;
const dayDate = (d) => new Date(START + d * 86400e3); // 그날 오전 9시(한국)

// ── 글자 ──
// 폰트에 없는 글자(한자 등)는 빼고 그림
const OK = /[\u0020-\u007e\uac00-\ud7a3\u3131-\u318e\u3008-\u3011\u2018-\u201f\uff01-\uff5e\u00b7\u00d7\u2022\u2013\u2014\u2192\u00b0\u2026\u2027]/;
const safe = (s) => [...String(s)].filter((ch) => OK.test(ch)).join('').replace(/\s+/g, ' ').trim();
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cw = (ch, fs) => (/[ᄀ-ᇿ㄰-㆏가-힣]/.test(ch) ? fs * 0.95 : /[A-Z0-9]/.test(ch) ? fs * 0.6 : /[a-z]/.test(ch) ? fs * 0.52 : fs * 0.35);
const textW = (s, fs) => [...s].reduce((a, ch) => a + cw(ch, fs), 0);
function wrap(s, fs, maxW, maxLines) {
  const words = String(s).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (textW(t, fs) <= maxW) cur = t;
    else { if (cur) lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const keep = lines.slice(0, maxLines);
    let last = keep[maxLines - 1];
    while (textW(`${last}…`, fs) > maxW && last.length > 1) last = last.slice(0, -1);
    keep[maxLines - 1] = `${last}…`;
    return keep;
  }
  return lines;
}
const clip = (s, fs, maxW) => wrap(s, fs, maxW, 1)[0] || '';
const T = (x, y, s0, fs, { w = 700, fill = C.ink, anchor = 'start' } = {}) =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${fs}" font-weight="${w}" fill="${fill}" text-anchor="${anchor}">${esc(safe(s0))}</text>`;

function flagImg(country, x, y, size) {
  const iso = bySlug[country]?.iso2?.[0]?.toLowerCase();
  const f = iso && path.join(ROOT, 'public/flags', `${iso}.svg`);
  if (!f || !fs.existsSync(f)) return '';
  const b64 = fs.readFileSync(f).toString('base64');
  const id = `fc${x}${y}`;
  return `<clipPath id="${id}"><circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size / 2}"/></clipPath>
  <image href="data:image/svg+xml;base64,${b64}" x="${x - size * 0.17}" y="${y}" width="${size * 1.34}" height="${size}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>
  <circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size / 2 - 2}" fill="none" stroke="#fff" stroke-width="6"/>`;
}

const frame = (inner, badge, foot) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="${C.bg}"/>
<circle cx="900" cy="80" r="300" fill="${C.soft}"/><circle cx="40" cy="1250" r="260" fill="#FBE6DB"/>
<rect x="70" y="80" width="${textW(badge, 34) + 64}" height="66" rx="33" fill="${C.sea}"/>
${T(102, 125, badge, 34, { w: 700, fill: '#fff' })}
${inner}
<rect x="0" y="${H - 170}" width="${W}" height="170" fill="${C.sea}"/>
${T(W / 2, H - 98, foot, 38, { w: 700, fill: '#fff', anchor: 'middle' })}
${T(W / 2, H - 46, 'tripberry.kr', 34, { w: 900, fill: '#FFE3D4', anchor: 'middle' })}
</svg>`;

const toPng = (svg) => new Resvg(svg, { fitTo: { mode: 'width', value: W }, font: { fontFiles, loadSystemFonts: false, defaultFontFamily: FONT } }).render().asPng();

// ── 카드 1: 도시 가이드 ──
const fmtMin = (m) => `약 ${Math.floor(m / 60) ? `${Math.floor(m / 60)}시간` : ''}${m % 60 ? ` ${m % 60}분` : ''}`.replace('약  ', '약 ');
const GUIDE_CITIES = CITIES.filter((c) => guideByCity[c.slug] && c.slug !== 'seoul');
function cityCard(c) {
  const g = guideByCity[c.slug];
  const co = bySlug[c.country];
  const best = bestMonths(c.slug, 3);
  const spots = (g.spots || []).slice(0, 3).map((s) => s.name);
  let y = 230;
  let s = flagImg(c.country, 70, y, 150);
  s += T(250, y + 45, co?.ko || '', 38, { w: 700, fill: C.sub });
  s += T(250, y + 145, c.ko, textW(c.ko, 110) > 680 ? 84 : 110, { w: 900 });
  y += 245;
  s += T(70, y, `${c.ko} 자유여행 가이드`, 56, { w: 900, fill: C.sea });
  y += 78;
  for (const l of wrap(g.intro || '', 42, 860, 4)) { s += T(70, y, l, 42, { w: 500, fill: C.ink }); y += 62; }
  y += 28;
  const rows = [];
  if (best.length) rows.push(['여행하기 좋은 달', `${best.join('·')}월`]);
  rows.push(['서울에서 비행시간', fmtMin(flightMin(c))]);
  const boxH = 50 + rows.length * 112 + (spots.length ? 70 + spots.length * 62 : 0);
  s += `<rect x="60" y="${y}" width="880" height="${boxH}" rx="36" fill="#fff" stroke="${C.line}" stroke-width="3"/>`;
  let ry = y + 74;
  for (const [k, v] of rows) {
    s += T(110, ry, k, 32, { w: 700, fill: C.sub });
    s += T(110, ry + 52, clip(v, 44, 780), 44, { w: 900, fill: C.ink });
    ry += 112;
  }
  if (spots.length) {
    s += T(110, ry, '꼭 가볼 곳', 32, { w: 700, fill: C.sub });
    ry += 58;
    for (const sp of spots) { s += T(110, ry, `· ${clip(sp, 42, 760)}`, 42, { w: 900, fill: C.ink }); ry += 62; }
  }
  return frame(s, '트립베리 여행가이드', '숙소 위치 · 공항 이동 · 추천 일정');
}

// ── 카드 2: 이번 주말 전국 축제 ──
function festCard(list) {
  let s = T(70, 290, '이번 주말', 64, { w: 700, fill: C.sea });
  s += T(70, 400, '전국 축제', 120, { w: 900 });
  s += T(70, 470, `${fmtD(WEEKEND[0])}(토) – ${fmtD(WEEKEND[1])}(일)`, 44, { w: 700, fill: C.sub });
  let y = 540;
  for (const f of list.slice(0, 7)) {
    s += `<rect x="60" y="${y}" width="880" height="100" rx="26" fill="#fff" stroke="${C.line}" stroke-width="3"/>`;
    s += T(100, y + 46, clip(f.t.replace(/\s*20\d\d\s*/g, ' ').trim(), 38, 800), 38, { w: 900 });
    s += T(100, y + 84, `${f.region.ko}${f.dist ? ` ${f.dist}` : ''} · ~${fmtD(f.e)}`, 28, { w: 500, fill: C.sub });
    y += 114;
  }
  return frame(s, '트립베리 국내여행', '기간 · 장소 · 주말 날씨까지 한눈에');
}

// ── 카드 3: 이번 달 여행하기 좋은 해외 도시 ──
function monthPicks() {
  const out = [];
  for (const c of CITIES) {
    if (c.slug === 'seoul' || !HAS_CLIMATE(c.slug)) continue;
    const co = bySlug[c.country];
    if (!co || (countryAlarm(co)?.max || 0) >= 3 || cityLevels[c.slug] === 'alert') continue;
    const d = climateOf(c.slug).m[MONTH - 1];
    out.push({ c, d, s: travelScore(d) });
  }
  const seen = new Set();
  return out.sort((a, b) => b.s - a.s).filter((x) => !seen.has(x.c.country) && seen.add(x.c.country)).slice(0, 6);
}
function monthCard(picks) {
  let s = T(70, 290, `${MONTH}월에 떠나기 좋은`, 64, { w: 700, fill: C.sea });
  s += T(70, 400, '해외 여행지', 120, { w: 900 });
  s += T(70, 470, '10년 평균 날씨 · 외교부 여행경보 반영', 36, { w: 700, fill: C.sub });
  let y = 530;
  for (const { c, d } of picks) {
    s += `<rect x="60" y="${y}" width="880" height="118" rx="28" fill="#fff" stroke="${C.line}" stroke-width="3"/>`;
    s += flagImg(c.country, 90, y + 19, 80);
    s += T(200, y + 70, c.ko, 46, { w: 900 });
    s += T(910, y + 70, `낮 ${Math.round(d.hi)}° · ${rainInfo(d).label}`, 34, { w: 700, fill: C.sea, anchor: 'end' });
    y += 134;
  }
  return frame(s, '트립베리 여행지 추천', '월별 날씨 · 비행시간 · 안전 비교');
}

// ── 오늘 RSS 에 들어갈 핀 목록 ──
const N = GUIDE_CITIES.length;
export function pinList() {
  const out = [];
  for (let d = Math.max(0, DAY - 6); d <= DAY; d++) {
    for (let k = 0; k < 3; k++) {
      const i = d * 3 + k;
      const c = GUIDE_CITIES[i % N];
      const cyc = Math.floor(i / N);
      const g = guideByCity[c.slug];
      out.push({
        id: `guide-${c.slug}-${cyc}`,
        date: dayDate(d),
        title: `${c.ko} 자유여행 가이드 - 숙소 위치·공항 이동·추천 일정`,
        desc: `${g.intro} 여행하기 좋은 달, 꼭 가볼 곳, 공항에서 시내 가는 법까지 트립베리에서 확인하세요. #${c.ko}여행 #${bySlug[c.country]?.ko || ''}여행 #해외여행 #자유여행`,
        link: `https://tripberry.kr/guide/${c.slug}/`,
        svg: () => cityCard(c),
      });
    }
    // 4번째 카드: 거꾸로 도는 순서(인스타·페이스북이 서로 다른 카드를 쓰도록 하루 4장)
    const used = new Set([0, 1, 2].map((k) => (d * 3 + k) % N));
    let r = ((N - 1 - d) % N + N) % N;
    while (used.has(r)) r = (r + N - 1) % N;
    const c = GUIDE_CITIES[r];
    const g = guideByCity[c.slug];
    out.push({
      id: `guide-${c.slug}-r${d}`,
      date: dayDate(d),
      title: `${c.ko} 여행 준비 - 날씨 좋은 달·꼭 가볼 곳·공항 가는 법`,
      desc: `${g.intro} 언제 가면 좋은지, 어디부터 둘러볼지 트립베리 가이드에 정리했습니다. #${c.ko}여행 #${bySlug[c.country]?.ko || ''}여행 #여행준비 #해외여행`,
      link: `https://tripberry.kr/guide/${c.slug}/`,
      svg: () => cityCard(c),
    });
  }
  const fests = festWeekend();
  if (fests.length >= 3) {
    out.push({
      id: `fest-${WEEKEND[0]}`,
      date: dayDate(DAY),
      title: `이번 주말 전국 축제 ${fmtD(WEEKEND[0])}~${fmtD(WEEKEND[1])} - 지역별 축제 일정`,
      desc: `이번 주말(${fmtD(WEEKEND[0])}~${fmtD(WEEKEND[1])}) 전국에서 열리는 축제 ${fests.length}개. ${fests.slice(0, 3).map((f) => f.t).join(', ')} 등 기간·장소·주말 날씨를 확인하세요. #주말축제 #국내여행 #주말나들이`,
      link: 'https://tripberry.kr/domestic/festival/',
      svg: () => festCard(fests),
    });
  }
  const picks = monthPicks();
  if (picks.length >= 4) {
    out.push({
      id: `best-${kst.getUTCFullYear()}-${MONTH}`,
      date: dayDate(DAY),
      title: `${MONTH}월 해외여행 추천 - 날씨 좋은 여행지 ${picks.length}곳`,
      desc: `${MONTH}월에 날씨가 좋은 해외 여행지 ${picks.map((p) => p.c.ko).join(', ')}. 10년 평균 날씨와 외교부 여행경보를 함께 반영했습니다. #${MONTH}월해외여행 #해외여행추천 #여행지추천`,
      link: 'https://tripberry.kr/find/',
      svg: () => monthCard(picks),
    });
  }
  return out;
}

export const pinPng = (p) => toPng(p.svg());
// 인스타그램용 (세로 4:5 · JPG) — 핀 카드를 1080×1350 가운데에 놓고 양옆은 살구색
export async function pinJpg(p) {
  const card = await sharp(pinPng(p)).resize({ height: 1350 }).toBuffer();
  return sharp({ create: { width: 1080, height: 1350, channels: 3, background: '#F7D9C8' } })
    .composite([{ input: card, gravity: 'center' }])
    .jpeg({ quality: 88 })
    .toBuffer();
}
export { ymd as PIN_DAY };
