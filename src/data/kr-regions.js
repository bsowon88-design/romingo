// 국내여행 — 시도 목록 (한국관광공사 TourAPI 의 법정동 시도 코드 lDongRegnCd 기준)
// 2026년 광주·전남이 합쳐져 '전남광주통합특별시'(코드 12) 하나로 들어옴.
// wx: 날씨 예보 기준 지점 (노르웨이 기상청 예보를 3시간마다 받음 — scripts/forecast.mjs)
export const KR_REGIONS = [
  { rg: '11', slug: 'seoul', ko: '서울', full: '서울특별시', wx: { ko: '서울', lat: 37.57, lon: 126.98 } },
  { rg: '41', slug: 'gyeonggi', ko: '경기', full: '경기도', wx: { ko: '수원', lat: 37.26, lon: 127.03 } },
  { rg: '28', slug: 'incheon', ko: '인천', full: '인천광역시', wx: { ko: '인천', lat: 37.46, lon: 126.71 } },
  { rg: '51', slug: 'gangwon', ko: '강원', full: '강원특별자치도', wx: { ko: '강릉', lat: 37.75, lon: 128.9 } },
  { rg: '43', slug: 'chungbuk', ko: '충북', full: '충청북도', wx: { ko: '청주', lat: 36.64, lon: 127.49 } },
  { rg: '44', slug: 'chungnam', ko: '충남', full: '충청남도', wx: { ko: '공주', lat: 36.45, lon: 127.12 } },
  { rg: '30', slug: 'daejeon', ko: '대전', full: '대전광역시', wx: { ko: '대전', lat: 36.35, lon: 127.38 } },
  { rg: '36110', slug: 'sejong', ko: '세종', full: '세종특별자치시', wx: { ko: '세종', lat: 36.48, lon: 127.29 } },
  { rg: '52', slug: 'jeonbuk', ko: '전북', full: '전북특별자치도', wx: { ko: '전주', lat: 35.82, lon: 127.15 } },
  { rg: '12', slug: 'jeonnam', ko: '전남·광주', full: '전남광주통합특별시', wx: { ko: '광주', lat: 35.16, lon: 126.85 } },
  { rg: '47', slug: 'gyeongbuk', ko: '경북', full: '경상북도', wx: { ko: '경주', lat: 35.84, lon: 129.21 } },
  { rg: '27', slug: 'daegu', ko: '대구', full: '대구광역시', wx: { ko: '대구', lat: 35.87, lon: 128.6 } },
  { rg: '48', slug: 'gyeongnam', ko: '경남', full: '경상남도', wx: { ko: '통영', lat: 34.85, lon: 128.43 } },
  { rg: '26', slug: 'busan', ko: '부산', full: '부산광역시', wx: { ko: '부산', lat: 35.18, lon: 129.08 } },
  { rg: '31', slug: 'ulsan', ko: '울산', full: '울산광역시', wx: { ko: '울산', lat: 35.54, lon: 129.31 } },
  { rg: '50', slug: 'jeju', ko: '제주', full: '제주특별자치도', wx: { ko: '제주', lat: 33.5, lon: 126.53 } },
];

// 날씨 예보 수집용 — 예보 자료(live/forecast.json)에서 'kr-지역' 이름으로 저장
export const KR_WX = KR_REGIONS.map((r) => ({ slug: `kr-${r.slug}`, ko: r.wx.ko, lat: r.wx.lat, lon: r.wx.lon, tz: 'Asia/Seoul' }));
