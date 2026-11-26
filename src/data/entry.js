// 나라별 입국 정보 (한국 일반 여권, 관광 목적 기준)
// 2026-11-25 공식 사이트·외교부·각국 정부 발표로 확인. 규칙이 바뀌면 여기만 고치면 됨.
// kind: free(무비자) / auth(무비자지만 사전 허가 필요) / visa(비자 필요)
// items.need: must(꼭 해야 함) / opt(하면 편함)
// until: 한시 무비자 끝나는 날 — 지나면 화면에 '기한 지남' 경고

export const ENTRY_CHECKED = '2026-11-25';
export const MOFA_URL = 'https://www.0404.go.kr/';

const SCHENGEN = {
  kind: 'free',
  stay: '90일 무비자',
  stayNote: '180일 안에 솅겐 나라들(프랑스·독일·이탈리아·스페인·그리스·체코·스위스 등)에 머문 날을 모두 더해 90일까지',
  items: [
    { t: 'EES 생체 정보 등록', need: 'must', d: '2026년 4월 10일부터 전면 시행. 처음 입국할 때 공항에서 지문과 얼굴 사진을 등록해요. 미리 신청할 것은 없고, 첫 입국 때 줄이 길 수 있어요.', url: 'https://travel-europe.europa.eu/ees_en' },
  ],
  notes: ['유럽 여행 허가 ETIAS는 아직 시작하지 않았고 시작 날짜도 정해지지 않았어요. 지금 ETIAS 신청을 받는 사이트는 공식이 아니에요.'],
};

export const ENTRY = {
  japan: {
    kind: 'free', stay: '90일 무비자',
    items: [
      { t: 'Visit Japan Web', need: 'opt', d: '입국 심사·세관 신고를 미리 등록해 두면 공항에서 QR 코드로 빨리 통과해요. 무료.', url: 'https://www.vjw.digital.go.jp/' },
    ],
    notes: ['일본은 사전 허가제(JESTA)를 만들기로 했지만 늦어도 2029년 3월까지 시작 예정이라, 지금은 신청할 것이 없어요.'],
  },
  china: {
    kind: 'free', stay: '30일 무비자', until: '2026-12-31',
    stayNote: '관광·출장·친지 방문·경유 목적만. 2026년 12월 31일까지 한시적으로 시행되는 무비자입니다.',
    items: [],
    notes: ['2027년부터 무비자가 이어지는지는 아직 발표되지 않았어요. 내년 1월 이후 여행이면 주한중국대사관 공지를 꼭 확인하세요.'],
  },
  taiwan: {
    kind: 'free', stay: '90일 무비자',
    items: [
      { t: '대만 온라인 입국신고서 (TWAC)', need: 'must', d: '2025년 10월부터 종이 신고서가 없어졌어요. 도착 3일 전부터 온라인으로 작성. 무료.', url: 'https://twac.immigration.gov.tw/' },
    ],
  },
  hongkong: {
    kind: 'free', stay: '90일 무비자',
    items: [],
  },
  macau: {
    kind: 'free', stay: '90일 무비자',
    items: [],
    notes: ['홍콩 달러도 거의 같은 가치로 받지만, 거스름돈은 파타카로 줍니다.', '홍콩·중국 본토와는 입국 심사를 따로 받습니다. 마카오에서 주하이(중국 본토)로 넘어가면 중국 입국 규칙을 따라요.'],
  },
  vietnam: {
    kind: 'free', stay: '45일 무비자',
    items: [
      { t: '전자비자 (45일 넘게 머물 때만)', need: 'opt', d: '최대 90일. 단수 25달러. 공식 사이트에서만 신청하세요 (비슷한 대행 사이트가 많아요).', url: 'https://evisa.gov.vn/' },
    ],
  },
  thailand: {
    kind: 'free', stay: '90일 무비자',
    stayNote: '한국-태국 협정으로 90일',
    items: [
      { t: '태국 디지털 입국카드 (TDAC)', need: 'must', d: '도착 3일 전부터 온라인 제출. 입국할 때마다 새로 써야 해요. 무료.', url: 'https://tdac.immigration.go.th/' },
    ],
  },
  philippines: {
    kind: 'free', stay: '30일 무비자',
    items: [
      { t: 'eTravel 등록', need: 'must', d: '출발 72시간 전부터 온라인 등록 후 QR 코드를 받아요. 무료 (돈을 받는 곳은 대행 사이트).', url: 'https://etravel.gov.ph/' },
    ],
  },
  indonesia: {
    kind: 'visa', stay: '도착비자 30일',
    stayNote: '50만 루피아. 현지에서 30일 한 번 연장 가능',
    items: [
      { t: '전자 도착비자 (e-VOA)', need: 'opt', d: '공항에서 사도 되지만 미리 온라인으로 사 두면 줄을 덜 서요. 값은 같아요.', url: 'https://evisa.imigrasi.go.id/' },
      { t: 'All Indonesia 입국카드', need: 'must', d: '입국·세관·건강 신고를 한 번에. 도착 3일 전부터 온라인 작성. 무료.', url: 'https://allindonesia.imigrasi.go.id/' },
      { t: '발리 관광세 (발리 갈 때만)', need: 'must', d: '1인 15만 루피아. Love Bali 사이트에서 미리 내고 QR 코드를 받아요.', url: 'https://lovebali.baliprov.go.id/' },
    ],
    notes: ['인도네시아 이민청이 2026년 8월 도착비자 값 인상안을 내놓았어요. 결제 전에 공식 사이트 금액을 확인하세요.'],
  },
  malaysia: {
    kind: 'free', stay: '90일 무비자',
    items: [
      { t: '말레이시아 디지털 입국카드 (MDAC)', need: 'must', d: '도착 3일 전부터 온라인 제출. 무료. 비슷한 이름의 대행·사칭 사이트를 조심하세요.', url: 'https://imigresen-online.imi.gov.my/mdac/main' },
    ],
  },
  singapore: {
    kind: 'free', stay: '90일 무비자',
    items: [
      { t: 'SG Arrival Card', need: 'must', d: '도착 3일 전부터 온라인 또는 MyICA 앱으로 제출. 무료.', url: 'https://eservices.ica.gov.sg/sgarrivalcard/' },
    ],
  },
  'guam-saipan': {
    kind: 'auth', stay: '45일 (G-CNMI ETA)',
    stayNote: 'ESTA가 있으면 90일',
    items: [
      { t: 'G-CNMI ETA', need: 'must', d: '괌·사이판만 45일 안으로 갈 때. 무료, 2년 유효. 늦어도 출발 5일 전, 되도록 7일 전에 신청. (ESTA가 있으면 안 해도 돼요)', url: 'https://g-cnmi-eta.cbp.dhs.gov/' },
      { t: 'ESTA (대신 써도 됨)', need: 'opt', d: '미국 다른 곳도 들르거나 45일 넘게 머물 때. 약 40달러, 2년 유효.', url: 'https://esta.cbp.dhs.gov/' },
      { t: '괌 전자 세관신고서 (EDF)', need: 'must', d: '도착 72시간 전부터 온라인 작성. 한 가족에 한 장이면 돼요. QR 코드를 저장해 두세요. 무료.', url: 'https://cqa.guam.gov/' },
    ],
  },
  hawaii: {
    kind: 'auth', stay: '90일 (ESTA)',
    items: [
      { t: 'ESTA 전자여행허가', need: 'must', d: '탑승 72시간 전까지 신청. 2026년 10월 16일부터 40.62달러, 2년 유효. 공식 사이트가 아닌 대행 사이트는 수수료가 추가됩니다.', url: 'https://esta.cbp.dhs.gov/' },
    ],
  },
  usa: {
    kind: 'auth', stay: '90일 (ESTA)',
    items: [
      { t: 'ESTA 전자여행허가', need: 'must', d: '탑승 72시간 전까지 신청. 2026년 10월 16일부터 40.62달러, 2년 유효. 공식 사이트가 아닌 대행 사이트는 수수료가 추가됩니다.', url: 'https://esta.cbp.dhs.gov/' },
    ],
  },
  mexico: {
    kind: 'free', stay: '최대 180일 무비자',
    stayNote: '실제 체류 가능 기간은 입국 심사관이 정합니다. 여권에 기재된 날짜를 꼭 확인하세요.',
    items: [],
  },
  australia: {
    kind: 'auth', stay: '3개월 (ETA)',
    items: [
      { t: '호주 ETA', need: 'must', d: '공식 앱 AustralianETA로 신청. 서비스 수수료 20호주달러. 12개월 동안 여러 번, 한 번에 3개월까지.', url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601' },
    ],
  },
  'new-zealand': {
    kind: 'auth', stay: '90일 (NZeTA)',
    items: [
      { t: 'NZeTA + 관광세(IVL)', need: 'must', d: 'NZeTA 앱 17 / 웹 23 뉴질랜드달러 + 관광세 100 뉴질랜드달러를 함께 내요. 출발 72시간 전까지, 2년 유효.', url: 'https://www.immigration.govt.nz/new-zealand-visas/visas/visa/nzeta' },
    ],
  },
  turkiye: {
    kind: 'free', stay: '90일 무비자',
    stayNote: '180일 안에 90일까지',
    items: [],
  },
  greece: SCHENGEN,
  italy: SCHENGEN,
  france: SCHENGEN,
  spain: SCHENGEN,
  czechia: SCHENGEN,
  switzerland: SCHENGEN,
  germany: SCHENGEN,
  nepal: {
    kind: 'visa', stay: '도착비자',
    stayNote: '15일 30달러 · 30일 50달러 · 90일 125달러',
    items: [
      { t: '온라인 비자 신청서', need: 'opt', d: '도착비자 신청서를 미리 온라인으로 써 두면 공항 줄이 짧아요. 돈은 공항에서 내요.', url: 'https://www.immigration.gov.np/' },
    ],
  },
  mongolia: {
    kind: 'free', stay: '90일 무비자', until: '2026-12-31',
    stayNote: '몽골 정부가 한국인에게 2026년 12월 31일까지 한시적으로 시행되는 무비자입니다.',
    items: [],
    notes: ['2027년 연장 여부는 아직 발표되지 않았어요. 작년에도 발표가 늦어 공항에서 혼선이 있었으니, 내년 여행이면 주한몽골대사관 공지를 꼭 확인하세요.'],
  },
  laos: {
    kind: 'free', stay: '30일 무비자',
    items: [],
    notes: ['입국 도장에 적힌 체류 기한을 꼭 확인하세요.'],
  },
  cambodia: {
    kind: 'visa', stay: '비자 필요 (30일)',
    stayNote: '전자비자 30달러 또는 공항 도착비자',
    items: [
      { t: '캄보디아 전자비자 (e-Visa)', need: 'opt', d: '30일 단수, 30달러. 처리에 3영업일쯤 걸려요. 도착비자로 대신할 수 있어요.', url: 'https://www.evisa.gov.kh/' },
      { t: '캄보디아 e-Arrival', need: 'must', d: '비행기로 들어가는 모든 사람이 출발 7일 전부터 온라인 작성. 비자와 별도로 제출해야 합니다.', url: 'https://www.arrival.gov.kh/' },
    ],
  },
  uk: {
    kind: 'auth', stay: '6개월 (ETA)',
    items: [
      { t: '영국 ETA 전자여행허가', need: 'must', d: '2026년 4월 8일부터 20파운드. UK ETA 앱이나 gov.uk에서 신청, 2년 유효. 보통 3영업일 안에 나와요.', url: 'https://www.gov.uk/eta' },
    ],
    notes: ['영국은 솅겐이 아니라서 유럽 90일 계산에 들어가지 않아요.'],
  },
  canada: {
    kind: 'auth', stay: '최대 6개월 (eTA)',
    stayNote: '머무는 기간은 입국 심사관이 정해요. 보통 최대 6개월',
    items: [
      { t: '캐나다 eTA 전자여행허가', need: 'must', d: '비행기로 들어가거나 캐나다 공항을 경유할 때 필요해요. 7캐나다달러, 5년(또는 여권 만료일까지) 유효. 대부분 몇 분 안에 나와요. 공식 사이트에서만 신청하세요.', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta/apply.html' },
    ],
    notes: ['육로·배로 미국에서 넘어갈 때는 eTA가 없어도 되지만, 비행기를 탈 일이 있다면 미리 받아 두세요.'],
  },
  uzbekistan: {
    kind: 'free', stay: '30일 무비자',
    items: [],
    notes: ['3일 넘게 머물면 체류 등록을 해야 해요. 호텔에 묵으면 호텔이 대신 해 주니 체크인할 때 등록 확인증을 받아 두세요.', '30일을 넘기면 출국할 때 문제가 되니 일정을 꼭 30일 안으로 잡으세요.'],
  },
  uae: {
    kind: 'free', stay: '90일 무비자',
    stayNote: '도착할 때 무료로 받아요',
    items: [],
    notes: ['약은 성분에 따라 반입이 금지될 수 있어요. 처방약은 영문 처방전을 챙기세요.'],
  },
};

export const KIND_KO = {
  free: { label: '무비자', cls: 'ok' },
  auth: { label: '사전 허가 필요', cls: 'auth' },
  visa: { label: '비자 필요', cls: 'need' },
};

export function entryOf(slug) {
  const e = ENTRY[slug];
  if (!e) return null;
  const expired = e.until ? Date.now() > Date.parse(e.until + 'T23:59:59+09:00') : false;
  return { ...e, expired, musts: e.items.filter((i) => i.need === 'must') };
}
