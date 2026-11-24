# 로밍고 (Romingo) — 사이트 인수인계 문서

> 해외 여행지 **안전 · 날씨 · 가이드**를 한곳에서 보여 주는 사이트  
> 주소: https://romingo.pages.dev  ·  저장소: https://github.com/bsowon88-design/romingo  
> 마지막 정리: 2026-11-24

이 문서 하나로 사이트가 **무엇을 보여 주는지**, **어떻게 자동으로 돌아가는지**, **어떻게 고치는지**를 알 수 있게 정리했어요.  
비밀번호·인증키 값은 이 문서에 없어요. 어디서 새로 받아서 어디에 넣는지만 적었어요.

---

## 목차

1. [한눈에 보기](#1-한눈에-보기)
2. [화면(페이지) 구성](#2-화면페이지-구성)
3. [필요한 계정과 키](#3-필요한-계정과-키)
4. [자동 수집 — 어떻게 돌아가나](#4-자동-수집--어떻게-돌아가나)
5. [파일 구조](#5-파일-구조)
6. [자주 하는 작업](#6-자주-하는-작업)
7. [처음부터 다시 세울 때 (사이트 이전)](#7-처음부터-다시-세울-때-사이트-이전)
8. [정한 규칙과 이유](#8-정한-규칙과-이유)
9. [출처 표시와 라이선스](#9-출처-표시와-라이선스)
10. [남은 일](#10-남은-일)
11. [문제가 생겼을 때](#11-문제가-생겼을-때)

---

## 1. 한눈에 보기

| 항목 | 내용 |
|---|---|
| 사이트 종류 | 정적 사이트 (서버·데이터베이스 없음) |
| 만든 도구 | [Astro](https://astro.build) 5 |
| 사이트 올리는 곳 | Cloudflare Pages (무료) |
| 코드 보관 | GitHub (무료) |
| 자동 수집 | GitHub Actions — 1시간마다 공식 자료를 받아 저장 (무료) |
| 운영비 | 0원 (도메인을 사면 도메인 값만) |
| 다루는 범위 | 나라 20곳, 도시 55곳, 여행가이드 22곳 |
| 회원가입·로그인 | 없음 ("나의 여행"은 방문자 브라우저에만 저장) |

**돌아가는 흐름**

```
공식 자료(USGS·GDACS·외교부·한국은행·공항·NASA·노르웨이 기상청·Unsplash)
        │  1시간마다
        ▼
GitHub Actions (scripts/collect.mjs)
        │  바뀐 게 있으면 저장소에 저장
        ├─ src/data/archive/*.json  ──▶  Cloudflare가 사이트를 다시 만듦
        └─ live/*.json (운항·예보)   ──▶  사이트를 다시 만들지 않고 화면이 바로 불러옴
```

---

## 2. 화면(페이지) 구성

**맨 위 메뉴**: 인기 도시 · 나라별 · 날씨 · 안전 정보 · 환율 + (오른쪽) 검색 · 나의 여행 · 공유하기  
폰에서는 두 줄이에요. 윗줄에 로고와 버튼, 아랫줄에 메뉴 5개. 로고를 누르면 홈으로 가요.

| 주소 | 페이지 | 내용 |
|---|---|---|
| `/` | 홈 | 검색창, 재난 소식, 사진 슬라이드, 인기 여행지, 이번 주 인기 도시, 도구(나의 여행·비교·지도), 여행가이드, 외교부 소식 |
| `/popular/` | 인기 도시 | 인천·김포·김해·제주 출발 국제선 편수 순위 (앞으로 7일, 지난주와 비교) |
| `/country/` | 나라별 | 나라 카드 + 외교부 여행경보 단계 필터 |
| `/country/나라/` | 나라 모아보기 | 여행가이드 → 재난·외교부 요약 → 시차·환율·전압 → 이번 달 날씨 → 공휴일·연휴 → 안전 소식 → 긴급 연락처 |
| `/country/나라/guide/` · `safety/` · `weather/` · `info/` | 나라 탭 | 여행가이드 / 안전(외교부 경보, 도시별 안전, 지진·재난) / 날씨 / 환율·긴급 |
| `/guide/도시/` | 여행가이드 | 관광지 사진 → 공식 홍보영상 → 날씨 예보(9일) → 도시 안전 현황 → 숙소 위치 → 공항 이동 → 교통 → 일정 → 돈·인터넷 → 주의할 점 |
| `/weather/도시/` · `/weather/도시/달/` | 날씨 | 9일 예보 + 월별 평균 기온·비, 여행하기 좋은 달, 옷차림 |
| `/safety/` | 안전 정보 | 외교부 여행경보 단계별 나라, 경보 조정 소식, 재난 경보, 실시간 지진 |
| `/map/` | 안전 지도 | 최근 30일 지진·재난 경보를 지도에 표시, 나라 색 = 외교부 단계 |
| `/compare/` | 여행지 비교 | 두 도시의 날씨·비행시간·시차·안전·환율·오늘 운항 |
| `/my/` | 나의 여행 | 도시·날짜 저장 → D-day, 안전, 기간 날씨, 환율, 운항, 현지 공휴일 (검색엔진 제외) |
| `/rates/` | 환율 | 한국은행 환율 + 계산기 |
| `/quakes/` · `/disasters/` · `/quake/번호/` | 지진·재난 | 목록과 큰 지진 상세 |
| `/about/` · `/privacy/` · `/credits/` | 소개 · 개인정보 · 사진 출처 | |
| `/sitemap.xml` · `/robots.txt` | 검색엔진용 | 자동 생성 |

**표시 규칙**
- 재난 배지: **평온 · 주의 · 경보** (자연재난 기준). "안전"이라는 말은 일부러 쓰지 않아요.
- 도시 안전: 도시 반경 300km 안 최근 30일 지진(규모 4.5 이상), 근처 태풍(800km)·홍수(300km)·화산(150km) 경보
- 외교부 경보는 나라 단위 자료라서 "일부 지역 3단계"처럼 보여 주고 지역 확인을 안내해요.

---

## 3. 필요한 계정과 키

| 서비스 | 용도 | 받는 곳 | 넣는 곳 |
|---|---|---|---|
| GitHub | 코드 보관 + 자동 수집 | github.com | — |
| Cloudflare | 사이트 올리기 | dash.cloudflare.com → Workers & Pages | 키 없음 |
| 공공데이터포털 | 외교부 여행경보 · 인천공항 · 한국공항공사 | data.go.kr (회원가입 → 활용신청) | GitHub Secret `DATA_GO_KR_KEY` |
| 한국은행 ECOS | 환율 | ecos.bok.or.kr (인증키 신청) | GitHub Secret `ECOS_KEY` |
| Unsplash | 나라·도시·관광지 사진 | unsplash.com/developers (앱 만들기 → Access Key) | GitHub Secret `UNSPLASH_KEY` |

**공공데이터포털에서 활용신청해야 하는 API (모두 같은 키 하나로 씀)**
- 외교부_국가·지역별 여행경보 (TravelAlarmService2)
- 외교부_국가별 여행경보 조정 이력 (CountryHistoryService2)
- 인천국제공항공사_항공기 운항 현황 상세 조회 (출발편)
- 한국공항공사_실시간 항공기 운항정보 조회_GW (김포·김해·제주 출발)

**키 넣는 법 (GitHub Secrets)**  
저장소 → Settings → Secrets and variables → Actions → **New repository secret** → 이름(`DATA_GO_KR_KEY` 등)과 값 입력 → Add secret

> ⚠️ 키는 GitHub Secrets에만 넣어요. 코드, 채팅, 캡처에 키가 보이면 그 키는 버리고 새로 받으세요.  
> Cloudflare에는 비밀 키를 넣지 않아요.

**키가 필요 없는 자료**: USGS 지진, GDACS 재난, NASA POWER 기후, 노르웨이 기상청 예보, 유튜브 퍼가기

---

## 4. 자동 수집 — 어떻게 돌아가나

설정 파일: `.github/workflows/collect.yml` — **매시 7분**에 실행 (수동 실행도 가능)

| 자료 | 출처 | 주기 | 저장 파일 | 담당 코드 |
|---|---|---|---|---|
| 지진 (규모 5 이상 보관) | 미국 지질조사국 USGS | 매시 | `src/data/archive/quakes.json` | `collect.mjs` |
| 재난 경보 (태풍·홍수·화산 등) | 국제재난경보 GDACS | 매시 | `archive/disasters.json` | `collect.mjs` |
| 외교부 여행경보 · 조정 소식 | 공공데이터포털 | 매시 | `archive/alarms.json`, `adjusts.json` | `mofa.mjs` |
| 환율 | 한국은행 ECOS | 매시 | `archive/rates.json` | `ecos.mjs` |
| 월별 기후 (10년 평균) | NASA POWER | 없는 도시만 1번 | `archive/climate.json` | `climate.mjs` |
| 인기 도시 (D-3 ~ D+6 출발편) | 인천국제공항공사 + 한국공항공사 | 하루 1번 | `archive/popular.json` | `icn.mjs` |
| 대표 사진 | Unsplash | 매시 20장씩 (없는 것만) | `archive/photos.json` | `photos.mjs` |
| 오늘 운항 현황 (편수·결항·지연) | 인천국제공항공사 + 한국공항공사 | 매시 | `live/flights.json` | `icn.mjs` |
| 9일 날씨 예보 | 노르웨이 기상청 MET Norway | 3시간마다 | `live/forecast.json` | `forecast.mjs` |
| 현지 공휴일 | `date-holidays` 패키지 (바깥 연결 없음) | 사이트 만들 때 계산 | — | `src/data/holidays.js` |

**두 종류의 저장**
- `src/data/archive/` 가 바뀌면 커밋 → **Cloudflare가 사이트를 다시 만들어요** (1~2분).
- `live/` 만 바뀌면 커밋 메시지에 `[skip ci]` → **사이트는 다시 안 만들고**, 화면이 `raw.githubusercontent.com` 에서 바로 불러와요. (Cloudflare 무료 빌드 횟수 절약)

**자료를 못 받으면**
- 지난 자료(보관함)로 그대로 보여 주고, 화면에 "⏳ 자료 확인 중 · 지난 자료로 보여 줘요"가 떠요.
- 운항·예보를 못 받으면 그 칸만 "확인 중"으로 보여요.

**수동 실행**: 저장소 → Actions → 재난 자료 자동 수집 → **Run workflow**  
실행 기록: Actions → 맨 위 실행 → collect → 공식 데이터 모으기

---

## 5. 파일 구조

```
romingo/
├─ .github/workflows/collect.yml   자동 수집 설정 (매시 7분)
├─ astro.config.mjs                Astro 설정
├─ package.json                    사용하는 패키지
├─ live/                           자주 바뀌는 자료 (운항·예보) — 봇이 씀
├─ public/                         그대로 올라가는 파일
│  ├─ og.png                       카톡·SNS 공유 그림 (1200×630)
│  ├─ logo-512.png, apple-touch-icon.png, favicon-*.png
│  └─ flags/                       국기 (빌드 때 자동 복사, 저장소에 없음)
├─ scripts/                        자동 수집 코드 (GitHub Actions에서 실행)
│  ├─ collect.mjs                  전체 순서
│  ├─ mofa.mjs  ecos.mjs  climate.mjs  icn.mjs  forecast.mjs  photos.mjs
│  └─ flags.mjs                    국기 그림 복사
└─ src/
   ├─ site.js                      사이트 이름·문구·주소 (SITE_URL)
   ├─ layouts/Base.astro           모든 페이지 공통 (머리글·메뉴·검색·바닥글·공유)
   ├─ components/                  화면 조각
   │  ├─ CountryShell.astro        나라 페이지 머리 + 탭
   │  ├─ CitySafety.astro          도시 안전 현황
   │  ├─ Forecast.astro            9일 예보
   │  ├─ CityVideo.astro           공식 홍보영상
   │  ├─ HolidayBox.astro          공휴일·연휴
   │  ├─ Updated.astro             갱신 시각 표시
   │  └─ (CountryCard, HeroSlider, PhotoSlider, Icon, Flag …)
   ├─ data/                        자료와 계산
   │  ├─ countries.js              나라 20곳 (시차·통화·전압·긴급번호·비행시간 등)
   │  ├─ cities.js                 도시 55곳 (좌표 포함)
   │  ├─ guides.js                 여행가이드 22곳 내용
   │  ├─ videos.js                 도시별 공식 홍보영상 (유튜브 ID)
   │  ├─ photo-pick.js             자동 사진이 마음에 안 들 때 바꾸기
   │  ├─ airports.js               공항 코드 → 도시
   │  ├─ load.js                   보관함 + 실시간 자료 합치기, 나라 상태
   │  ├─ near.js                   도시 기준 안전 (거리 계산)
   │  ├─ weather.js                여행 점수·비·옷차림 규칙
   │  ├─ holidays.js               공휴일·연휴 (이름 한국어 변환표 포함)
   │  ├─ popular.js · tripdata.js · mapdata.js · search.js · photos.js · place.js · normalize.js
   │  └─ archive/*.json            봇이 채우는 실제 자료 — 손으로 고치지 말 것
   ├─ scripts/live.ts              화면에서 운항·예보 불러오기
   └─ pages/                       주소별 페이지 (2번 표 참고)
```

---

## 6. 자주 하는 작업

모든 작업은 파일을 고친 뒤 **올리기**로 끝나요.

```
git pull
git add -A
git commit -m "무엇을 바꿨는지"
git push
```
1~2분 뒤 사이트에 반영돼요.

### 여행가이드 추가
1. 도시가 `src/data/cities.js` 에 없으면 추가: `{ slug: 'nagoya', photoQ: 'Nagoya Castle', ko: '나고야', country: 'japan', lat: 35.18, lon: 136.91 }`
2. 공항 코드가 `src/data/airports.js` 에 도시로 연결돼 있는지 확인 (예: `NGO: ['nagoya', '나고야', 'jp']`)
3. `src/data/guides.js` 에 다른 가이드와 같은 모양으로 추가 (spots 5개의 `q` 는 사진 검색어, 영어)
4. 올리면 사진·기후는 자동 수집이 채워요. 빨리 채우려면 Run workflow 몇 번.
- 가격·시간표처럼 자주 바뀌는 건 넣지 않아요. 고친 날짜(`updated`)를 바꿔 주세요.

### 공식 홍보영상 추가·교체
`src/data/videos.js` 에 `도시slug: { id: '유튜브ID', by: '출처 이름' }`  
- 관광청·시청 **공식 채널** 영상만 넣어요.
- 퍼가기 허용 확인: `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=유튜브ID&format=json` 이 열리면 OK
- 영상이 지워지면 화면에서 자동으로 숨겨져요.

### 대표 사진 바꾸기
`src/data/photo-pick.js` 에 `'city:osaka': 1` (두 번째 후보) 또는 Unsplash 사진 id를 적고, `src/data/archive/photos.json` 에서 그 항목을 지운 뒤 올리고 Run workflow.

### 나라 추가
`src/data/countries.js` 에 다른 나라와 같은 모양으로 추가 (`iso2`, `iso3`, `keys`(지진 지명 영어), `tz`, `cur`(ECOS 통화코드) 등), 도시도 `cities.js` 에 추가.

### 키 바꾸기
GitHub → Settings → Secrets and variables → Actions → 해당 이름 옆 연필 → 새 값 → Update

### 도메인 연결 (아직 안 함)
1. 도메인 구입 (예: 가비아)
2. Cloudflare → Pages 프로젝트 → **Custom domains** → 도메인 추가 → 안내대로 네임서버 변경
3. `src/site.js` 의 `SITE_URL` 을 새 주소로 바꾸고 올리기 (사이트맵·공유 그림 주소가 따라 바뀜)
4. 구글 서치콘솔·네이버 서치어드바이저에 등록 → `https://새주소/sitemap.xml` 제출
5. 카카오 공유 미리보기 초기화: https://developers.kakao.com/tool/debugger/sharing

---

## 7. 처음부터 다시 세울 때 (사이트 이전)

1. **GitHub**: 저장소를 새 주인 계정으로 넘기기 (Settings → Danger Zone → Transfer) 또는 복사
2. **GitHub Secrets** 3개 다시 넣기: `DATA_GO_KR_KEY`, `ECOS_KEY`, `UNSPLASH_KEY` (새 주인이 직접 받은 키)
3. **Actions 권한**: Settings → Actions → General → Workflow permissions → **Read and write** 선택
4. **Cloudflare Pages**: Workers & Pages → Create → Pages → GitHub 연결 → 저장소 선택
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
5. 저장소 주소가 바뀌면 `src/site.js` 의 `LIVE_BASE` (raw.githubusercontent.com 주소)와 `scripts/forecast.mjs` 의 User-Agent 주소를 새 주소로 바꾸기
6. Actions → Run workflow 한 번 → 사이트 확인

**내 컴퓨터에서 미리 보기** (선택): Node.js 22 설치 → 폴더에서 `npm install` → `npm run dev` → http://localhost:4321

---

## 8. 정한 규칙과 이유

- **자동으로 돌아가는 것만 넣는다.** 비자·입국 서류, 물가, 사기 유형, 현지 법률은 공식 자동 자료가 없어 사람이 계속 고쳐야 하고, 틀리면 신뢰를 잃어서 뺐어요.
- **추천하지 않고 보여 준다.** 인기 도시는 실제 출발편 수로만 정해요.
- **재난 배지에 "안전"이라는 말을 쓰지 않는다.** 재난이 없다고 치안까지 안전한 건 아니라서 "평온"을 써요.
- **"지금 가도 괜찮을까?" 같은 문구는 쓰지 않는다.** AI가 쓴 느낌이 나서요. 대표 문구는 "해외 여행지 안전 · 날씨 · 가이드".
- **날씨 예보는 9일.** 무료이면서 광고가 붙은 사이트에서도 쓸 수 있는 노르웨이 기상청 기준이에요. 그 뒤는 월별 평균.
- **비행시간(비교 화면)은 직선거리로 어림.** 화면에 그렇게 적어 뒀어요.
- **영상은 썸네일만 먼저 보여 주고 누르면 재생.** 페이지가 무거워지지 않게요. 새 창 없이 그 자리에서 재생돼요.
- **지도는 사이트를 만들 때 그림(SVG)으로 그린다.** 바깥 지도 서비스 사용료·약관 걱정이 없어요.
- **나의 여행은 로그인 없이 브라우저에만 저장.** 개인정보를 받지 않아요.
- **중국 춘절·국경절, 베트남 뗏**은 실제 연휴가 공식 공휴일보다 길어서 따로 안내 문구를 붙였어요.

---

## 9. 출처 표시와 라이선스

| 자료 | 출처·라이선스 | 표시 위치 |
|---|---|---|
| 지진 | 미국 지질조사국(USGS), 공공 | 바닥글, 지도 |
| 재난 경보 | GDACS | 바닥글, 지도 |
| 여행경보 | 외교부 (공공데이터포털) | 안전 페이지 |
| 환율 | 한국은행 ECOS | 환율 칸 |
| 출발편 | 인천국제공항공사 · 한국공항공사 (공공데이터포털) | 인기 도시 페이지 |
| 월별 기후 | NASA POWER | 날씨 페이지 |
| 날씨 예보 | 노르웨이 기상청 MET Norway, **CC BY 4.0** (출처 표시 필수) | 예보 칸, 바닥글 |
| 사진 | Unsplash (사진마다 작가·Unsplash 표시 필수, 다운로드 기록 전송) | 사진 위, `/credits/` |
| 홍보영상 | 각 관광청 유튜브 공식 퍼가기 | 영상 아래 |
| 지도 모양 | Natural Earth (퍼블릭 도메인) / world-atlas | 지도 아래 |
| 국기 | flag-icons (MIT) | — |
| 아이콘 | Lucide (ISC) | — |
| 공휴일 | date-holidays (ISC) | — |
| 글꼴 | Pretendard (OFL) | — |

---

## 10. 남은 일

- [ ] 도메인 구입·연결 (6번 참고)
- [ ] 구글 서치콘솔 · 네이버 서치어드바이저 등록, 사이트맵 제출
- [ ] 구글 애드센스 신청 (도메인 연결 후)
- [ ] 제휴 링크 (여행자보험 · eSIM · 투어) — 방문자가 생긴 뒤
- [ ] 홍보영상 없는 가이드: 홍콩 · 푸꾸옥 · 칭다오 · 웨이하이 · 상하이 · 하노이 · 호치민 · 오키나와 · 베이징

---

## 11. 문제가 생겼을 때

| 증상 | 확인할 곳 |
|---|---|
| 사이트가 안 바뀜 | Cloudflare → Pages → 프로젝트 → Deployments 에서 빌드 실패 여부 |
| 자료가 오래됨 / "확인 중"이 계속 뜸 | GitHub → Actions → 최근 실행이 빨간 X 인지, 로그의 "실패" 줄 |
| 외교부·공항 자료만 안 들어옴 | 공공데이터포털 활용신청 만료(보통 2년) 또는 키 변경 → 연장하고 Secret 확인 |
| 환율만 안 들어옴 | ECOS 키 확인 |
| 사진이 안 늘어남 | Unsplash 키 확인 (무료 앱은 1시간 50번 제한, 한 번에 20장) |
| 운항·예보 칸이 "확인 중" | 저장소의 `live/` 폴더 파일이 최근에 바뀌었는지 |
| Actions 가 저장을 못 함 | Settings → Actions → General → Workflow permissions → Read and write |
