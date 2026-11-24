// 한국은행 ECOS 환율 — 자동 수집에서만 씀. 키는 GitHub 비밀 칸 ECOS_KEY.
// 통계표 731Y001: 주요국 통화의 대원화 환율 (매일). 항목 이름으로 통화를 찾음.
const STAT = '731Y001';

// 통화 코드 → 항목 이름에 들어 있는 말 (한국은행 표기가 조금씩 달라서 여러 개)
export const CUR_KEYS = {
  USD: ['미국달러', '미 달러', '미국 달러'],
  JPY: ['일본엔', '엔(100엔)', '일본 엔'],
  CNY: ['위안'],
  EUR: ['유로'],
  TWD: ['대만달러', '대만 달러'],
  VND: ['베트남동', '베트남 동'],
  THB: ['태국바트', '태국 바트'],
  PHP: ['필리핀페소', '필리핀 페소'],
  IDR: ['인도네시아루피아', '인도네시아 루피아'],
  MYR: ['말레이지아', '말레이시아'],
  SGD: ['싱가폴', '싱가포르'],
  MXN: ['멕시코'],
  AUD: ['호주달러', '호주 달러'],
  NZD: ['뉴질랜드'],
  TRY: ['튀르키예', '터키'],
  NPR: ['네팔'],
  HKD: ['홍콩'],
};

const ymd = (d) => d.toISOString().slice(0, 10).replace(/-/g, '');

export async function fetchRates(key) {
  const end = new Date(Date.now() + 9 * 36e5); // 한국 날짜
  const start = new Date(end.getTime() - 14 * 864e5);
  const url = `https://ecos.bok.or.kr/api/StatisticSearch/${encodeURIComponent(key)}/json/kr/1/2000/${STAT}/D/${ymd(start)}/${ymd(end)}`;
  const res = await fetch(url);
  const text = await res.text();
  let j;
  try {
    j = JSON.parse(text);
  } catch {
    throw new Error(`JSON 아님 (HTTP ${res.status}): ${text.slice(0, 200)}`);
  }
  const rows = j?.StatisticSearch?.row;
  if (!Array.isArray(rows)) throw new Error(`응답 이상: ${text.slice(0, 300)}`);

  // 항목별로 가장 최근 날짜 값
  const latest = {};
  for (const r of rows) {
    const name = String(r.ITEM_NAME1 || '');
    const v = parseFloat(String(r.DATA_VALUE || '').replace(/,/g, ''));
    if (!name || !isFinite(v)) continue;
    if (!latest[name] || r.TIME > latest[name].time) latest[name] = { name, time: r.TIME, value: v };
  }
  const names = Object.keys(latest);
  console.log('  환율 항목 수:', names.length, '| 예:', names.slice(0, 6).join(', '));

  const out = {};
  for (const [code, keys] of Object.entries(CUR_KEYS)) {
    // "원/○○" 처럼 원화 기준인 항목만
    const hit = names.find((n) => !/^[^원]*\/원/.test(n) && keys.some((k) => n.replace(/\s/g, '').includes(k.replace(/\s/g, ''))));
    if (!hit) continue;
    const x = latest[hit];
    const unit = parseInt((hit.match(/\((\d+)/) || [])[1] || '1', 10);
    out[code] = { value: x.value, unit, date: x.time, name: hit };
  }
  return out;
}
