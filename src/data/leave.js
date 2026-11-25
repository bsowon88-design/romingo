// 한국 공휴일로 "연차 며칠 쓰면 며칠 쉬나" 자동 계산 (date-holidays, 사이트를 만들 때 계산)
import Holidays from 'date-holidays';
import { BUILT_AT } from './load.js';
import { BREAKS, md } from './holidays.js';
import { CITIES } from './cities.js';
import { bySlug } from './countries.js';
import { HAS_CLIMATE, climateOf, travelScore } from './weather.js';
import { flightMin } from './tripdata.js';
import { cityPhoto } from './photos.js';

const DAY = 864e5;
const ymd = (t) => new Date(t).toISOString().slice(0, 10);
const today = ymd(BUILT_AT + 9 * 36e5);
const until = ymd(BUILT_AT + 400 * DAY);

// 한국 공휴일 — 라이브러리는 설·추석 3일 연휴의 첫날만 주므로 다음 이틀을 더함
function krHolidays() {
  const h = new Holidays('KR', { languages: ['ko'] });
  const y0 = +today.slice(0, 4);
  const m = new Map();
  for (const y of [y0, y0 + 1, y0 + 2]) {
    for (const x of h.getHolidays(y) || []) {
      if (x.type !== 'public') continue;
      const d = String(x.date).slice(0, 10);
      const name = String(x.name);
      if (!m.has(d)) m.set(d, name);
      if (/^(설날|추석)$/.test(name)) {
        for (const k of [1, 2]) { const d2 = ymd(Date.parse(d) + k * DAY); if (!m.has(d2)) m.set(d2, name); }
      }
    }
  }
  // 노동절(5/1)은 2026년부터 공휴일 — 라이브러리에 없으면 더하고, 주말이면 다음 평일을 대체공휴일로
  for (const y of [y0, y0 + 1, y0 + 2]) {
    if (y < 2026) continue;
    const d = `${y}-05-01`;
    if (!m.has(d)) m.set(d, '노동절');
    const w = new Date(d + 'T00:00:00Z').getUTCDay();
    if (w === 0 || w === 6) {
      let t = Date.parse(d) + DAY;
      while ([0, 6].includes(new Date(t).getUTCDay()) || m.has(ymd(t))) t += DAY;
      m.set(ymd(t), '노동절 (대체공휴일)');
    }
  }
  return m;
}
const HOL = krHolidays();
export const KR_HOLIDAYS = [...HOL.entries()].filter(([d]) => d >= today && d <= until).sort().map(([d, n]) => ({ d, n }));

const off = (t) => { const w = new Date(t).getUTCDay(); return w === 0 || w === 6 || HOL.has(ymd(t)); };

// 공휴일이 낀 주 묶음마다: 연차 0~3일로 가장 길게 쉬는 방법
function plans() {
  const groups = [];
  for (const { d } of KR_HOLIDAYS) {
    const t = Date.parse(d);
    if (groups.length && t - groups[groups.length - 1].last <= 3 * DAY) { groups[groups.length - 1].last = t; groups[groups.length - 1].days.push(d); }
    else groups.push({ first: t, last: t, days: [d] });
  }
  const out = [];
  for (const g of groups) {
    const names = [...new Set(g.days.map((d) => HOL.get(d).replace(/ \(대체공휴일\)/, '')))];
    const best = {};
    for (let s = g.first - 9 * DAY; s <= g.first; s += DAY) {
      for (let e = g.last; e <= g.last + 9 * DAY; e += DAY) {
        if (off(s - DAY) || off(e + DAY)) continue; // 앞뒤로 쉬는 날이 더 붙으면 그만큼 늘린 쪽이 따로 잡힘
        const len = Math.round((e - s) / DAY) + 1;
        if (len > 16) continue;
        let leave = 0;
        for (let t = s; t <= e; t += DAY) if (!off(t)) leave++;
        if (leave > 3) continue;
        if (ymd(s) < today) continue;
        if (!best[leave] || best[leave].len < len) best[leave] = { s, e, len, leave };
      }
    }
    const opts = Object.values(best).sort((a, b) => a.leave - b.leave).filter((o, i, arr) => i === 0 || o.len > arr[i - 1].len);
    // 연차 대비 효과가 큰 것만 (쉬는 날 4일 이상)
    const good = opts.filter((o) => o.len >= 4 && (o.leave === 0 || o.len >= o.leave * 2 + 2));
    if (!good.length) continue;
    out.push({ names, days: g.days, opts: good.map((o) => ({ from: ymd(o.s), to: ymd(o.e), len: o.len, leave: o.leave, leaveDays: leaveDaysOf(o.s, o.e) })) });
  }
  return out;
}
const leaveDaysOf = (s, e) => { const a = []; for (let t = s; t <= e; t += DAY) if (!off(t)) a.push(ymd(t)); return a; };

// 그 기간에 가기 좋은 곳 — 날씨 점수 + 비행시간(짧은 연휴엔 가까운 곳) · 현지 연휴와 겹치면 표시
function suggest(from, to, len) {
  const m = +from.slice(5, 7);
  const maxFm = len <= 4 ? 210 : len <= 6 ? 330 : 9999;
  const rows = [];
  for (const x of CITIES) {
    if (x.slug === 'seoul' || !HAS_CLIMATE(x.slug) || !cityPhoto(x.slug)) continue;
    const fm = flightMin(x);
    if (fm > maxFm) continue;
    const s = travelScore(climateOf(x.slug).m[m - 1]);
    const busy = (BREAKS[x.country] || []).some((b) => b.from <= to && b.to >= from);
    rows.push({ slug: x.slug, ko: x.ko, country: x.country, s: s - (busy ? 15 : 0), busy });
  }
  rows.sort((a, b) => b.s - a.s);
  const seen = new Set(), top = [];
  for (const r of rows) { if (seen.has(r.country)) continue; seen.add(r.country); top.push(r); if (top.length === 3) break; }
  return top;
}

export const LEAVE_PLANS = plans().map((p) => ({ ...p, opts: p.opts.map((o) => ({ ...o, picks: suggest(o.from, o.to, o.len) })) }));
export { md };
