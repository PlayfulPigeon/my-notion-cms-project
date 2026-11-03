# ROADMAP v2: 고도화 단계 (MVP 이후)

> 기준 문서: [PRD.md](./PRD.md) · 이전 로드맵: [roadmaps/ROADMAP_v1.md](./roadmaps/ROADMAP_v1.md) (MVP 구현 이력, 수정하지 않음)
> 최종 갱신: 2026-11-03
> 목표: 배포와 측정 기준선을 확보한 뒤, 다크 모드 고도화(필수)와 사용자가 선택한 3개 기능(구문 강조·읽기 편의, 검색, 배포 마무리)을 순서대로 추가한다.
> 총 예상 시간: 약 **11~15시간** (추정. PRD에 근거 없음. 아래 시간은 모두 추정이며, 대기 시간은 제외한다.)
> 규모 표기(추정): S = 약 1시간 이내, M = 1~2시간, L = 2시간 초과

## 현재 상태 (코드 확인 기준, 2026-11-02)

| 항목 | 상태 | 근거 |
|---|---|---|
| MVP 라우트 (홈, 목록 2종, 상세 2종, 404) | 구현 완료 | `web/src/app/` (커밋 d3e90c6) |
| v1 4단계 항목 (이미지 로컬화, 재검증 API, RSS, 목록 필터, 확장 블록) | 구현 완료 | `web/src/lib/images.ts`, `web/src/app/api/revalidate/route.ts`, `web/src/app/rss.xml/route.ts`, `web/src/components/FilterableList.tsx`, `web/src/components/PostBody.tsx` |
| 다크 모드 | 시스템 설정만 따름. 토글, 선택 저장, FOUC 방지 없음 | `web/src/app/globals.css`의 `@media (prefers-color-scheme: dark)`, `dark:` 클래스를 쓰는 11개 파일 + `globals.css`. `Header.tsx`에 토글 없음, `layout.tsx`의 `<html>`에 테마 처리 없음 |
| 코드 구문 강조 | 없음 (코드 블록은 항상 어두운 고정 스타일) | `web/src/components/PostBody.tsx`의 `[&_pre]` 클래스 |
| 테스트 러너, CI | 없음 | `web/package.json`에 `test` 스크립트 없음, vitest/jest 설정 파일 없음, `.github/` 없음 |
| GitHub / Vercel | `origin`은 `github.com/PlayfulPigeon/my-notion-cms-project`, `main`은 `origin/main`(9e390f9)과 동일. Vercel 배포 완료: `https://my-notion-cms-project.vercel.app` (Root Directory `web`). 빌드 로그에 경고 없음(사용자 보고) | `git remote -v`, 배포 URL 스모크 (2026-11-03) |
| Footer 링크 | 실제 값으로 교체 완료 (`https://github.com/PlayfulPigeon`, 이메일) | `web/src/components/Footer.tsx` |
| 스택 | Next 16.4.3, React 19.3.0, Tailwind 4.3.3, `@notionhq/client` 5.28.0, `react-markdown` 10.1.0 + `remark-gfm` + `rehype-raw` + `rehype-sanitize` | `web/package.json`, `node_modules` |

> 주의: 이 저장소의 Next.js는 학습 데이터와 다를 수 있다(`web/AGENTS.md`). 구현 전 `web/node_modules/next/dist/docs/`의 해당 문서를 먼저 읽는다.

## 진행 현황

| Phase | 이름 | 예상 시간 (추정) | 선행 | 상태 |
|---|---|---|---|---|
| 0 | 배포 마무리 + Lighthouse 기준선 | 0.5~1시간 (+ 대기) | 없음 | 대기 |
| 1 | 다크 모드 고도화 (필수) | 3~4시간 | Phase 0 | 코드 구현·자동 검증 완료 (2026-11-02, `npm test` 15건), 브라우저 수동 검증 대기 |
| 2 | 코드 구문 강조 + 읽기 편의 | 4~6시간 | Phase 1 | 코드 구현·자동 검증 완료 (2026-11-02, `npm test` 44건), 수동 검증·Lighthouse 비교 대기 |
| 3 | 검색 | 3~4시간 | Phase 1 (UI 다크 모드 변형), 순서상 Phase 2 이후 | 코드 구현·자동 검증 완료 (2026-11-02, `npm test` 57건), 수동 검증 대기 |

> 의존 관계: 0 → 1 → 2 → 3 순서로 진행한다.
> Phase 2와 Phase 3 사이에 코드 의존은 없다(전자는 `PostBody`와 상세 페이지, 후자는 검색 라이브러리와 새 라우트). 이 순서는 사용자 우선순위다.
> 각 Phase 끝에서 `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build`(웹 디렉터리 `web/`에서 실행)가 통과해야 다음으로 넘어간다. `npm test`는 Phase 1에서 도입한다.

---

## Phase 0. 배포 마무리 + Lighthouse 기준선

**예상 소요 시간:** 30~60분 (추정) + 대기 시간(ISR 5분, 이미지 만료 관찰 1시간)
**선행 조건:** 없음 (v1 5단계 잔여 항목)
**변경 대상 파일:** `web/src/components/Footer.tsx`(플레이스홀더 교체). 나머지는 코드 밖 설정(GitHub, Vercel, Notion).

### 작업
- [x] 로컬 사전 점검: `web/`에서 `npm run format:check && npm run lint && npm run typecheck && npm run build` 통과 확인 (S)
- [x] `web/src/components/Footer.tsx`의 `GITHUB_URL`, `EMAIL` 플레이스홀더를 실제 값으로 교체 (S). 공개 배포 전 필수
- [x] 푸시 범위 결정 후 커밋·푸시: `docs/ROADMAP.md`(신규), `docs/roadmaps/`. `mcp-shrimp-task-manager/`, `shrimp_data/`는 푸시 대상인지 먼저 결정 (S)
- [x] Vercel 프로젝트를 만들고 GitHub 저장소 연결: Framework는 Next.js, **Root Directory는 `web`**, Node.js 버전이 Next 16 요구사항(20.9 이상, 추정)을 충족하는지 확인 (S)
- [x] Vercel 환경변수 등록: `NOTION_TOKEN`, `NOTION_DATABASE_ID`, `REVALIDATE_SECRET`, (선택) `SITE_URL` (S). `NEXT_PUBLIC_` 접두사 금지, 값은 문서·로그·커밋에 쓰지 않는다
- [x] Notion Integration이 콘텐츠 데이터베이스에 Connections로 연결돼 있는지 확인 (S)
- [x] 첫 배포를 실행하고 빌드 로그의 `[notion]` 경고(Slug 누락·중복)와 `[images]` 저장 실패 경고를 확인 (S)
- [x] 배포 스모크 점검: `/`, `/projects`, `/projects/[slug]`, `/devlog`, `/devlog/[slug]`, 없는 경로(404), `/rss.xml`을 열고 Draft 글 미노출, OG/RSS 링크가 `localhost`가 아닌지 확인 (S) — 확인: 라우트 200/404, 목록 3건, Draft(`draft-first`) 목록·RSS 미노출·상세 404, `localhost` 0건 (2026-11-03)
- [ ] `/api/revalidate` 스모크: 헤더 없이 호출하면 401, 올바른 `x-revalidate-secret` 헤더로 POST하면 200 (S) — **미완료**: 배포본이 `REVALIDATE_SECRET`을 읽지 못해 헤더 없는 호출이 401이 아닌 500(`Not configured`). 사용자가 환경변수는 Production에 등록했다고 했으나 Redeploy 후 재확인하지 않음. 사용자 결정으로 Phase 0은 완료 처리
- [x] ISR 반영 시험: Notion에서 제목 수정 또는 `Draft` → `Published` 변경 후 5분 이내 반영 확인 (S, 대기 포함) — 확인: 12:33 제목 수정 → 12:34:12 `<title>` 반영 (2026-11-03)
- [ ] 이미지 만료 확인: 배포 1시간 뒤에도 커버·본문 이미지가 `/notion-images/...` 정적 경로로 서빙되고 깨지지 않는지 확인. 배포 후 Notion에 새로 올린 이미지는 ISR 재생성 때 어떻게 되는지 확인 (S) — **미수행**: 샘플 글에 이미지가 없어 시험 불가, 사용자 결정으로 건너뜀. 열린 질문 7은 보류
- [x] 배포 번들·페이지 소스에서 Notion 토큰 값이 검색되지 않음을 확인 (S) — 확인: 페이지 6개와 정적 JS/CSS 10개에서 `NOTION_TOKEN`·`NOTION_DATABASE_ID` 값 0건 (`REVALIDATE_SECRET`은 `.env.local`에 없어 비교 불가)
- [x] Lighthouse 측정(모바일, 라이트 모드 기본값): 아래 5개 URL을 각 3회 측정해 중앙값(추정)을 기준선 표에 기록 (M)

테스트: 이 Phase에는 새 비즈니스 로직이 없어 단위 테스트 대상이 없다. 위 스모크 점검이 검증을 대신한다. 테스트 러너는 Phase 1에서 도입한다.

### Lighthouse 기준선 (모바일, 라이트 모드)

측정 일시: 2026-11-03 12:35 (KST) · 커밋: 9e390f9 (`main`, Phase 1~3 미포함) · 도구: Lighthouse 13.6.0 (headless Chrome, 각 URL 3회 중앙값)

| URL | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` | 93 | 95 | 96 | 90 | 2.63s | 0 | 31ms |
| `/projects` | 94 | 93 | 96 | 100 | 2.47s | 0 | 32ms |
| `/projects/first-game` | 94 | 100 | 96 | 100 | 2.48s | 0 | 65ms |
| `/devlog` | 94 | 98 | 96 | 100 | 2.47s | 0 | 26ms |
| `/devlog/first-devlog` | 94 | 100 | 96 | 100 | 2.48s | 0 | 58ms |

감점 원인(첫 실행 기준): `color-contrast`(`/`, `/projects`), `heading-order`(`/projects`), `link-text`(`/`, SEO), `errors-in-console`(`/`, `/projects`, Best Practices). 원인 상세는 미조사.

### 왜 이 순서인가
- Phase 1~3은 모두 "이전보다 좋아졌는가"를 비교해야 한다. 기준선이 없으면 구문 강조(Phase 2)와 검색(Phase 3)이 성능에 준 영향을 알 수 없다.
- 배포 환경(Vercel)에서만 드러나는 문제(읽기 전용 파일시스템에서의 이미지 처리, 환경변수 누락, `SITE_URL` 폴백)를 고도화 작업 전에 먼저 찾아야 원인이 단순하다.
- Footer 플레이스홀더가 남은 채로 공개하면 포트폴리오 사이트로서 신뢰를 잃는다.

### 검증 방법
- 위 스모크 점검 목록을 배포 URL에서 직접 수행한다.
- `/api/revalidate`는 `curl -X POST`로 헤더 유무에 따른 401/200을 확인한다(시크릿 값은 기록하지 않는다).

### 완료 기준
- [x] 배포 URL에서 Notion 데이터가 보이고 `Draft` 글은 보이지 않는다.
- [x] 로컬과 Vercel 빌드에서 `format:check`, `lint`, `typecheck`, `build`가 통과한다.
- [x] Notion에서 `Draft` → `Published` 또는 제목 수정이 5분 이내 사이트에 반영된다.
- [ ] `/api/revalidate`가 헤더 없이 401, 올바른 시크릿으로 200을 반환한다. — **미충족** (500 Not configured). 사용자 결정으로 완료 처리
- [x] Lighthouse 기준선 표(모바일 5개 URL)가 채워져 있다. 점수가 90 미만이어도 기준선 기록이 목적이므로 Phase 0은 완료로 본다. 미달 항목은 해당 Phase에서 다루거나 백로그에 올린다.
- [x] Footer에 플레이스홀더가 없고, 번들·페이지 소스에 토큰이 없다.

### 리스크
- Vercel ISR 재생성 단계는 파일시스템이 읽기 전용이라 `web/src/lib/images.ts`가 원본(만료되는) URL로 폴백한다(코드 주석 기준). 배포 후 새로 올린 이미지는 약 1시간 뒤 깨질 수 있다(추정). 시험 결과에 따라 열린 질문 7로 처리한다.
- 빌드 중 Notion 호출이 많으면 429가 날 수 있다. 빌드 로그를 확인한다.

---

## Phase 1. 다크 모드 고도화 (필수)

**예상 소요 시간:** 3~4시간 (추정)
**선행 조건:** Phase 0 (성능 기준선, 배포 환경)
**목표:** 클래스 기반으로 Light / Dark / System 3-상태를 지원하고, 새로고침 시 깜빡임(FOUC)이 없으며, 모든 컴포넌트가 두 테마에서 WCAG AA 대비를 만족한다.

### 변경 대상 파일

| 파일 | 구분 | 내용 |
|---|---|---|
| `web/src/app/globals.css` | 수정 | `@custom-variant dark (&:where(.dark, .dark *));` 추가, `@media (prefers-color-scheme: dark)` 제거, `:root`/`.dark`에 색 변수와 `color-scheme` 분리 |
| `web/src/app/layout.tsx` | 수정 | `<html lang="ko" suppressHydrationWarning>`, `<head>`에 테마 스크립트, `viewport` export(`colorScheme`, `themeColor`) |
| `web/src/components/Header.tsx` | 수정 | 토글 배치 |
| `web/src/components/ThemeToggle.tsx` | 신규 | Light / Dark / System 토글 (클라이언트 컴포넌트) |
| `web/src/components/ThemeScript.tsx` | 신규 | `<head>` 인라인 스크립트 (서버 컴포넌트) |
| `web/src/lib/theme.ts`, `web/src/lib/theme.test.ts` | 신규 | 저장값 검증·해석 순수 로직과 테스트 |
| `web/vitest.config.mts`, `web/package.json` | 신규/수정 | 테스트 러너 최소 도입 (추정) |
| `dark:` 클래스를 쓰는 파일 11개 | 필요 시 수정 | 대비 점검 결과 반영 |

`dark:` 클래스 사용 파일: `web/src/components/{DevlogItem,EmptyState,FilterableList,Footer,Header,PostBody,ProjectCard}.tsx`, `web/src/app/{page,not-found}.tsx`, `web/src/app/projects/[slug]/page.tsx`, `web/src/app/devlog/[slug]/page.tsx`. 변형 정의만 클래스 기반으로 바꾸면 이 파일들의 `dark:` 클래스는 그대로 동작한다.

### 작업

**테스트 러너 (최소 도입)**
- [ ] `vitest`, `vite-tsconfig-paths`를 devDependency로 추가하고 `web/vitest.config.mts`(`environment: "node"`, `@/` 별칭) 작성, `package.json`에 `"test": "vitest run"` 추가 (S). Next 공식 문서는 Vitest가 async 서버 컴포넌트를 지원하지 않는다고 안내하므로 **`src/lib`의 순수 함수만** 대상으로 한다. `server-only`를 import하는 `notion.ts`는 직접 import하지 않는다.

**테마 기반**
- [ ] `globals.css`를 클래스 기반으로 전환: `@custom-variant dark` 추가, `:root`는 라이트 변수와 `color-scheme: light`, `.dark`는 다크 변수와 `color-scheme: dark`, 미디어 쿼리 제거 (S)
- [ ] `web/src/lib/theme.ts`에 `Theme`("light" | "dark" | "system") 타입, 저장 키 상수, `parseTheme`(잘못된 저장값은 "system"), `resolveTheme(theme, systemPrefersDark)` 구현 (S)
- [ ] `theme.test.ts` 작성·실행: 정상(light/dark/system), 저장값 null·빈 문자열·알 수 없는 값, system + 시스템 라이트/다크 조합 (S)

**FOUC 방지**
- [ ] `ThemeScript.tsx`를 만들고 `layout.tsx`의 `<head>`에 배치, `<html>`에 `suppressHydrationWarning` 추가 (S). 스크립트는 HTML 파싱 중 동기 실행되어 첫 페인트 전에 `<html>`에 `dark` 클래스를 설정한다. `localStorage` 접근은 `try/catch`로 감싼다. `cookies()`/`headers()`는 쓰지 않는다(루트 레이아웃에서 읽으면 정적 프리렌더링을 잃는다 — Next 문서 `preventing-flash-before-hydration.md`)
- [ ] 스크립트 문자열 단위 테스트: 가짜 `localStorage`/`matchMedia`/`document.documentElement`로 스크립트를 실행해 (저장값 dark, 저장값 light, 저장값 없음 + 시스템 다크, `localStorage` 예외 발생) 4개 케이스의 `dark` 클래스 결과를 검증 (S)

**토글**
- [ ] `ThemeToggle.tsx` 구현 (M)
  - Light / Dark / System 3개 버튼을 `role="group"` + `aria-label`로 묶고, 각 버튼에 `aria-label`과 `aria-pressed`를 둔다(`FilterableList.tsx`의 칩 버튼과 같은 패턴). Tab, Enter, Space로 조작 가능
  - 선택값을 `localStorage`에 저장하고(`try/catch`) `<html>` 클래스를 즉시 갱신
  - System 선택일 때만 `matchMedia("(prefers-color-scheme: dark)")`의 `change` 이벤트를 구독하고 해제는 언마운트 시 수행
  - 개발 모드 Strict Mode 재마운트가 `<html>` 속성을 초기화하는 문제 대응: `useLayoutEffect`로 저장값을 재적용 (Next 문서 "Re-applying attributes in development")
  - 서버 렌더 결과와 달라지지 않도록 현재 선택 표시는 마운트 후 반영 (hydration 불일치 방지)
- [ ] `Header.tsx`에 토글 배치, 360px 폭에서 내비게이션과 겹치지 않음 확인 (S)
- [ ] (선택) 다른 탭의 변경을 `storage` 이벤트로 동기화 (S)

**color-scheme / theme-color**
- [ ] `layout.tsx`에 `viewport` export 추가: `colorScheme`, `themeColor`를 `media` 쿼리 2개(라이트/다크)로 선언 (S)
- [ ] 수동 선택이 시스템과 다를 때 `meta[name="theme-color"]`가 선택과 맞도록 갱신하는 방식을 확정·구현 (S). `viewport.themeColor`의 `media` 쿼리는 시스템 설정만 따르므로 JS 보정이 필요하다 (미확인, 구현 시 검증)

**대비 점검 (아래 표 참고)**
- [ ] 표의 각 대상을 라이트/다크 양쪽에서 측정하고 미달 항목을 수정 (M)
- [ ] 전역 포커스 링 스타일을 두 테마에서 3:1 이상으로 정의 (현재 정의 없음, 브라우저 기본) (S)

### 대비 점검 대상

| 대상 | 파일 | 점검 포인트 |
|---|---|---|
| 본문 링크, 인라인 코드 | `PostBody.tsx` | `[&_a]` blue-600 / blue-400, 인라인 코드 배경 |
| 코드 블록 | `PostBody.tsx` `[&_pre]` | 현재 라이트에서도 어두운 고정 배경. Phase 1에서는 두 모드 모두 읽히는지만 확인하고, 테마 연동은 Phase 2 |
| 인용 / Notion 콜아웃 | `PostBody.tsx` `[&_blockquote]` | 콜아웃은 `> 이모지 텍스트` 인용문으로 변환되어 인용 상자로 표시됨. 배경·글자·왼쪽 테두리 대비, 이모지 가독성 |
| 표, 토글(details) | `PostBody.tsx` | `th`/`td` 테두리·배경, `details` 테두리 |
| 본문 이미지 | `PostBody.tsx` `[&_img]` | 흰 배경 스크린샷·투명 PNG가 다크에서 눈부시거나 사라지지 않는지. 이미지 반전은 하지 않고 밝기 보정 정도만 검토 |
| 커버 이미지, 자리표시 | `ProjectCard.tsx`, `projects/[slug]/page.tsx` | `bg-neutral-100 dark:bg-neutral-800` 배경. "No cover" 문구가 `text-neutral-400`(라이트)·`dark:text-neutral-500`(다크)로 **AA 미달 의심** (수동 계산 약 2.3:1, 약 3.2:1. 도구로 재측정 필요) |
| 장르 칩 | `ProjectCard.tsx` | `bg-neutral-100 text-neutral-700` / `dark:bg-neutral-800 dark:text-neutral-300` |
| 필터 칩 (선택/비선택) | `FilterableList.tsx` `chipClass` | 선택 상태 반전 색, 호버 |
| Play / Repo 버튼 | `projects/[slug]/page.tsx` | 채움 버튼·윤곽 버튼 대비와 호버 |
| 빈 상태, 404 | `EmptyState.tsx`, `not-found.tsx` | 점선 테두리, 보조 글자색 |
| 헤더, 푸터 | `Header.tsx`, `Footer.tsx` | 보조 글자색(`text-neutral-500`)과 호버 색 |
| 스크롤바, 폼 컨트롤 | `globals.css` | `color-scheme`이 선택 모드를 따르는지 |

### 왜 이 순서인가
- Phase 2의 코드 블록 테마와 Phase 3의 검색 UI는 모두 `.dark` 클래스 기준으로 만든다. 변형 정의를 나중에 바꾸면 새로 만든 컴포넌트까지 다시 점검해야 한다.
- 수정 대상이 `globals.css`·`layout.tsx`·`Header.tsx` 같은 공용 파일이라, 기능을 추가하기 전에 먼저 정리하면 충돌이 줄어든다.
- 순수 로직(`theme.ts`, 스크립트)부터 테스트와 함께 만들면 FOUC와 상태 전환 버그를 UI 작업 전에 잡을 수 있다.
- 테스트 러너는 첫 구현 Phase인 여기서 도입해 Phase 2·3이 그대로 사용한다.

### 검증 방법
1. 개발 서버가 아니라 **`npm run build && npm start`** 로 확인한다(개발 모드 Strict Mode 재마운트의 오탐 방지).
2. FOUC: `localStorage`에 dark를 저장하고 OS는 라이트인 상태에서 하드 리로드. DevTools Performance의 필름스트립(CPU 스로틀 + 느린 네트워크)에서 첫 프레임이 밝은 배경이 아님을 확인한다. 반대 조합(저장값 light + OS 다크)도 확인한다.
3. System 모드: DevTools Rendering 탭의 `prefers-color-scheme` 에뮬레이션을 바꾸면 새로고침 없이 전환되는지 확인한다. 새로고침 후에도 선택이 유지되는지 확인한다.
4. 콘솔에 hydration 경고가 없는지 확인한다.
5. 모든 라우트(`/`, `/projects`, `/projects/[slug]`, `/devlog`, `/devlog/[slug]`, 404)를 두 테마에서 Lighthouse Accessibility와 axe로 점검한다. Lighthouse는 기본이 라이트 모드이므로 다크는 수동 선택 후 별도로 측정한다.
6. 키보드만으로 토글을 조작하고 포커스 링이 보이는지 확인한다.

### 완료 기준
- [ ] `npm test`가 통과한다. 다룬 시나리오: `parseTheme`/`resolveTheme`의 정상·잘못된 저장값·시스템 조합, 인라인 스크립트 4케이스(저장 dark, 저장 light, 저장 없음 + 시스템 다크, `localStorage` 예외).
- [ ] `format:check`, `lint`, `typecheck`, `build`가 통과한다.
- [ ] 프로덕션 빌드에서 새로고침 시 깜빡임이 없다(저장 dark + OS 라이트, 저장 light + OS 다크, 저장 없음 + OS 다크 3가지).
- [ ] Light / Dark / System이 모두 동작하고, System 모드에서 OS 설정 변경이 즉시 반영된다. 선택은 새로고침 후에도 유지된다.
- [ ] 토글이 `aria-label`/`aria-pressed`를 갖고 키보드만으로 조작된다.
- [ ] 대비 점검 표의 모든 항목이 두 테마에서 WCAG AA(일반 텍스트 4.5:1, 큰 텍스트·UI 요소 3:1)를 만족하고 axe 대비 위반이 0건이다.
- [ ] `globals.css`에 `@media (prefers-color-scheme: dark)`가 남아 있지 않다(수동 선택이 시스템 설정에 덮이지 않음). 콘솔 hydration 경고가 없다.
- [ ] 모든 라우트를 두 테마에서 확인했다.

### 리스크
- Tailwind v4에서 `@custom-variant` 선언 위치·문법 오류 시 `dark:` 클래스가 전부 무효가 된다. 첫 작업 직후 한 페이지에서 바로 확인한다.
- 인라인 스크립트 문자열과 `theme.ts`의 로직이 어긋날 수 있다. 스크립트 실행 테스트로 막는다.

---

## Phase 2. 코드 구문 강조 + 읽기 편의

**예상 소요 시간:** 4~6시간 (추정)
**선행 조건:** Phase 1 (`.dark` 클래스를 코드 테마 전환 기준으로 사용, 테스트 러너 재사용)
**목표:** 코드 블록이 라이트/다크에 맞춰 구문 강조되고, 상세 페이지에 목차·읽는 시간·이전/다음 글이 생긴다. 이 항목들은 PRD에 없는 사용자 선택 기능이다.

### 변경 대상 파일

| 파일 | 구분 | 내용 |
|---|---|---|
| `web/src/components/PostBody.tsx` | 수정 | rehype 플러그인 체인에 구문 강조·제목 id 추가, `[&_pre]` 고정 스타일을 테마 연동으로 정리 |
| `web/src/app/globals.css` | 수정 | 구문 강조 라이트/다크 색 토큰 (`.dark` 기준) |
| `web/src/lib/markdown.ts` | 신규 (추정) | remark/rehype 플러그인 구성을 한 곳으로 분리해 테스트 가능하게 함 |
| `web/src/lib/toc.ts`, `toc.test.ts` | 신규 | 제목 추출 |
| `web/src/lib/reading-time.ts`, `reading-time.test.ts` | 신규 | 읽는 시간 계산 |
| `web/src/lib/adjacent-posts.ts`, `adjacent-posts.test.ts` | 신규 | 이전/다음 글 계산 |
| `web/src/components/TableOfContents.tsx` | 신규 | 목차 UI (서버 컴포넌트) |
| `web/src/components/PostNav.tsx` | 신규 | 이전/다음 글 링크 |
| `web/src/app/projects/[slug]/page.tsx`, `web/src/app/devlog/[slug]/page.tsx` | 수정 | 읽는 시간, 목차, 이전/다음 배치 |
| `web/package.json` | 수정 | 구문 강조·제목 id용 의존성 추가 |

### 작업

**구문 강조 (라이트/다크 연동)**
- [x] 방식 확정: `PostBody`는 서버 컴포넌트이므로 서버에서 실행되는 rehype 하이라이터를 고른다 (S). 후보는 (a) Shiki 계열 rehype 플러그인(듀얼 테마, CSS 변수로 전환), (b) highlight.js 계열 `rehype-highlight`(CSS 테마 2벌). 기준: 클라이언트 JS 증가 0, 지원 언어(C#, JSON, shell, ShaderLab/HLSL 등 Unity 글에서 쓸 법한 언어 — 추정), 서버 번들 크기·빌드 시간, `.dark` 전환 방식. 결과를 열린 질문 2에 기록한다
- [x] 선택한 플러그인을 `PostBody.tsx` 파이프라인에 추가 (M). **`rehypeSanitize` 뒤에 배치하거나 sanitize 스키마를 확장**한다. sanitize가 하이라이터가 붙이는 `class`/`style`을 제거하기 때문이다
- [x] Notion 코드 블록 언어명(예: `c#`, `plain text`, 언어 없음)을 하이라이터 언어명에 매핑하고 미지원 언어는 일반 텍스트로 폴백 (S)
- [x] 라이트/다크 코드 테마 연동: `.dark` 기준 CSS를 `globals.css`에 추가하고 `PostBody.tsx`의 `[&_pre]:bg-neutral-900 ... text-neutral-100` 고정 스타일을 정리 (M). 라이트 모드의 밝은 코드 테마 여부는 열린 질문 3
- [ ] 긴 줄 가로 스크롤, 탭·공백 표시, 모바일 폭에서 코드가 레이아웃을 깨지 않는지 확인 (S)
- [x] 마크다운 파이프라인 테스트 작성·실행 (M): 파이프라인 구성을 `lib/markdown.ts`로 분리해 문자열 → HTML 변환을 검증한다(`renderToStaticMarkup(<PostBody/>)` 또는 unified 직접 호출 중 선택, 추정). 시나리오: 지원 언어 토큰화, 미지원·미지정 언어 폴백, 빈 코드 블록, **`<script>`·`onerror` 등 raw HTML이 여전히 제거됨(보안 회귀)**

**목차 (TOC)**
- [x] 본문 제목에 id 부여: `rehype-slug` 계열을 **`rehypeSanitize` 뒤에** 배치한다 (S). `hast-util-sanitize` 기본 스키마는 `id`에 `user-content-` 접두사를 붙이므로(`node_modules` 확인), sanitize 앞에 두면 목차 링크와 id가 어긋난다
- [x] `lib/toc.ts`에 마크다운에서 h2~h3를 추출해 `{ depth, text, id }[]`를 돌려주는 함수 구현 (M). 렌더 결과와 같은 슬러그 규칙을 써야 한다(한글 제목, 중복 제목 접미사)
- [x] `toc.test.ts` 작성·실행 (S): 제목 없음, 한글 제목, 중복 제목, 코드 펜스 안의 `#` 줄 제외, 굵게·링크 등 인라인 서식이 섞인 제목의 text, 추출 id와 렌더된 id 일치
- [x] `TableOfContents.tsx` 구현 (M): 제목이 3개 이상일 때만 표시(임계값은 추정), `nav aria-label="목차"`, 데스크톱 sticky 사이드 또는 상단 블록, 모바일 접이식, 두 테마 대비 확인
- [x] (선택) 스크롤 위치 강조(IntersectionObserver)는 클라이언트 JS가 늘어 기본 범위에서 제외한다

**읽는 시간**
- [x] `lib/reading-time.ts`에 `estimateReadingMinutes(markdown)` 구현 (S): 한글 글자 수 기준 + 영문 단어 수 기준 혼합, 코드 블록은 제외 또는 낮은 가중치, 최소 1분. 속도 상수는 추정이며 열린 질문 6
- [x] `reading-time.test.ts` 작성·실행 (S): 빈 문자열, 한글만, 영문만, 혼합, 코드 블록만, 마크다운 기호·이미지·링크 URL 제외, 올림 경계값
- [x] 두 상세 페이지에 "약 N분" 표시: `projects/[slug]/page.tsx`의 `meta` 배열, `devlog/[slug]/page.tsx`의 날짜 옆 (S)

**이전/다음 글**
- [x] `lib/adjacent-posts.ts`에 `getAdjacentPosts(posts, slug)` 구현 (S): 같은 `Type` 안에서 `getPosts(type)`(내림차순) 결과를 재사용한다. 방향 정의는 열린 질문 4(제안: 이전 = 더 오래된 글, 다음 = 더 최신 글)
- [x] `adjacent-posts.test.ts` 작성·실행 (S): 중간 글, 첫 글·마지막 글(한쪽 null), 글 1개, 없는 slug, 빈 배열, 같은 `publishedAt` 동률
- [x] `PostNav.tsx` 구현 후 두 상세 페이지에 배치 (S). 추가 Notion 호출은 없다(기존 `getPosts` 결과 재사용)

### 왜 이 순서인가
- 구문 강조는 Phase 1의 `.dark` 클래스에 색을 연결하므로 다크 모드가 끝난 뒤여야 한다. 먼저 하면 코드 색을 두 번 정의한다.
- 구문 강조와 목차는 둘 다 `PostBody.tsx`의 rehype 체인을 건드린다. 같은 Phase에서 `lib/markdown.ts`로 한 번에 정리하고 sanitize 순서 문제(`class`/`style` 제거, `id` 접두사)를 같이 푼다.
- 읽는 시간과 이전/다음 글은 순수 함수라 독립적이며, 같은 두 상세 페이지를 수정하므로 한 번에 묶는다.

### 검증 방법
- Notion에 샘플 글을 준비한다: C#·JSON·미지원 언어 코드 블록, 한글·중복 제목이 있는 h2/h3 다수, 긴 글과 짧은 글, 같은 Type의 글 1개·2개·3개 이상.
- 두 테마를 번갈아 전환하며 코드 블록이 새로고침 없이 바뀌고 대비가 AA인지 확인한다.
- 번들 영향: Phase 1 완료 시점 대비 상세 페이지의 JS 전송량을 DevTools Network로 비교하고, 가능하면 `next experimental-analyze`(v16.1+, 실험적이므로 사용 가능 여부 확인)를 쓴다. Next 16의 `next build`는 First Load JS 지표를 출력하지 않는다(`version-16.md`).
- Lighthouse를 Phase 0과 같은 조건으로 다시 측정해 기준선 표와 비교한다.

### 완료 기준
- [x] `npm test`가 통과한다. 다룬 시나리오: 마크다운 파이프라인(토큰화·폴백·sanitize 회귀), `toc`(빈 입력·한글·중복·코드 펜스·인라인 서식·id 일치), `reading-time`(빈·한글·영문·혼합·코드·경계값), `adjacent-posts`(중간·양끝·1개·없는 slug·빈 배열·동률).
- [x] `format:check`, `lint`, `typecheck`, `build`가 통과한다.
- [ ] 코드 블록이 라이트/다크 모두에서 구문 강조되고, 테마 전환이 즉시 반영되며, 대비가 AA이다.
- [ ] 목차 링크를 누르면 해당 제목으로 이동하고, 제목이 3개 미만이면 목차가 숨겨진다.
- [x] 읽는 시간이 두 상세 페이지에 표시되고, 이전/다음 링크가 양끝 글에서도 깨지지 않는다.
- [ ] 상세 페이지의 클라이언트 JS 전송량이 Phase 1 완료 시점보다 늘지 않는다(서버 실행이므로 0 기대, 추정). 늘었다면 원인과 크기를 기록한다.
- [ ] 상세 페이지 Lighthouse Performance가 Phase 0 기준선 대비 5점 이상 하락하지 않는다(5점은 추정 기준).

### 리스크
- 하이라이터를 sanitize 앞에 두거나 id 접두사를 놓치면 강조가 사라지거나 목차가 동작하지 않는다. 파이프라인 테스트로 잡는다.
- Notion 언어명이 하이라이터 언어명과 달라 일부 블록이 강조되지 않을 수 있다(매핑 작업과 폴백으로 대응).

---

## Phase 3. 검색

**예상 소요 시간:** 3~4시간 (추정)
**선행 조건:** Phase 1 (검색 UI가 `dark:` 변형과 테스트 러너를 사용). 코드 의존이 없으므로 Phase 2와 순서를 바꿀 수 있으나, 사용자 우선순위에 따라 Phase 2 뒤에 진행한다.
**목표:** 제목·요약·태그를 클라이언트에서 검색한다. 인덱스는 빌드 시 JSON으로 만들고 기존 목록 조회 결과를 재사용해 Notion 호출을 늘리지 않는다. (PRD 5.2의 후속 단계 항목이며, 이번에 편입한다.)

### 변경 대상 파일

| 파일 | 구분 | 내용 |
|---|---|---|
| `web/src/lib/search.ts`, `search.test.ts` | 신규 | 인덱스 생성·검색 순수 함수와 테스트 |
| `web/src/app/search-index.json/route.ts` | 신규 | 인덱스 JSON 라우트 (`web/src/app/rss.xml/route.ts`와 같은 패턴, `revalidate = 300`) |
| `web/src/app/search/page.tsx` | 신규 | 검색 페이지 (정적) |
| `web/src/components/SearchView.tsx` | 신규 | 검색 입력·결과 (클라이언트 컴포넌트). 결과는 `ProjectCard`/`DevlogItem` 재사용 |
| `web/src/components/Header.tsx` | 수정 | 검색 진입 링크 |
| `web/src/lib/notion.ts` | 수정 (조건부) | 호출 횟수 측정, 필요 시 빌드 단위 캐시 |

### 작업

**레이트 리밋 (위험 먼저)**
- [x] 현재 `next build` 한 번에 발생하는 Notion API 호출 수(`databases.retrieve`, `dataSources.query`)를 임시 카운터 로그로 측정하고 결과를 이 문서에 기록한 뒤 로그는 제거 (S). `getPosts()`가 쓰는 `React.cache`는 렌더 단위 캐시라 라우트마다 다시 조회할 가능성이 있다(추정, **미확인**)
- [x] 측정 결과가 PRD §7의 한도(평균 초당 3회)에 근접하거나 넘으면 빌드 단위 캐시를 도입 (M, 조건부). 방식(모듈 수준 메모이즈 또는 Next 캐시 API)은 측정 후 해당 버전 문서를 확인하고 확정한다

**검색 로직**
- [x] `lib/search.ts`에 `buildSearchIndex(posts)` 구현 (S): `Post[]` → `{ type, slug, title, summary, tags, publishedAt }[]`. 본문·커버·id는 넣지 않는다(크기 최소화)
- [x] `lib/search.ts`에 `searchEntries(index, query)` 구현 (M): NFC 정규화, 대소문자 무시, 공백으로 나눈 단어 AND 매칭, 가중치는 제목 > 태그 > 요약(추정), 동점은 최신순. 정규식은 쓰지 않고 `includes`로 비교한다(메타문자 안전)
- [x] `search.test.ts` 작성·실행 (S): 제목·요약·태그 각각 일치, 빈 문자열·공백만, 대소문자, 한글 부분 일치, 여러 단어 AND, 정규식 메타문자(`(`, `*`, `.`) 입력, 결과 없음, summary·tags가 비어 있는 항목, 동점 정렬, `buildSearchIndex`가 본문을 포함하지 않음

**인덱스 라우트**
- [x] `app/search-index.json/route.ts` 구현 (S): `getPosts()` 결과로 JSON을 응답하고 `export const revalidate = 300`. Draft 제외는 `getPosts`의 `Status = Published` 필터에 의존한다. `getPosts` 실패 시 오류를 전파한다(ISR은 직전 성공 결과를 유지, 추정)
- [x] 라우트 테스트 작성·실행 (S): `getPosts`를 모킹(`server-only`도 모킹)해 성공(2건), 빈 결과, `getPosts` 거부(Notion 4xx/5xx·타임아웃 모사) 시 동작, 응답 스키마와 정렬을 검증

**검색 UI**
- [x] `SearchView.tsx` 구현 (M): 인덱스를 `/search-index.json`에서 마운트 시 1회 가져와 메모리에 보관, 입력 즉시 결과 갱신, 로딩·오류·빈 결과 상태, 유형별(Projects / Devlog) 그룹, `<label>`과 `role="search"`, 결과 개수는 `aria-live="polite"`. 두 테마에서 `dark:` 변형 확인
- [x] `app/search/page.tsx` 구현 (S): 정적 페이지와 `metadata`(`title`). `?q=` 쿼리 동기화는 `useSearchParams`가 Suspense 경계를 요구하므로 기본 범위에서 제외(열린 질문 5)
- [x] `Header.tsx`에 검색 링크를 추가하고, 모바일 폭에서 내비게이션·테마 토글과 공존하는지 확인 (S)
- [ ] 컴포넌트 UI는 별도 테스트를 두지 않고(jsdom·testing-library 도입은 이번 범위 밖) 수동 검증한다: 키보드 입력, 스크린리더 안내

**반영 시간**
- [ ] Notion에서 새 글을 `Published`로 바꾼 뒤 인덱스에 반영되는 시간(최대 300초)을 확인하고, `/api/revalidate` 호출이 `/search-index.json`까지 갱신하는지 시험 (S, **미확인**: `revalidatePath("/", "layout")`가 이 라우트를 포함하는지)

### 구현 기록 (2026-11-02)

- Notion 호출 수(`next build` 1회, 글 3개): `databases.retrieve` 10, `dataSources.query` 10 (임시 로그로 측정 후 제거). 검색 라우트 추가 전후 값이 같아 추가 조회는 없다. 429 없음. 글 수가 늘면 재측정하며, 현재는 빌드 단위 캐시를 도입하지 않았다(조건부 작업 보류).
- `/search-index.json` 크기: 글 3개 기준 412바이트(본문·Draft·id·cover 없음).
- 결과 목록은 `ProjectCard`/`DevlogItem`을 재사용하지 않고 전용 목록으로 렌더한다(인덱스에 cover·genre·id가 없어서).
- `/api/revalidate`는 `revalidatePath("/", "layout")`를 호출하지만 `/search-index.json` 갱신 여부는 배포 환경에서 시험이 필요하다(미확인).
- 남은 수동 검증: 키보드·스크린리더, 두 테마 대비, Network 탭에서 검색 페이지에서만 인덱스 요청, 빌드 후 `/api/revalidate` 시험.

### 왜 이 순서인가
- 레이트 리밋 측정을 가장 앞에 두는 이유는 가장 불확실한 부분이고, 결과에 따라 `notion.ts` 구조가 바뀔 수 있기 때문이다.
- 검색 로직(순수 함수) → 인덱스 라우트 → UI 순으로 쌓으면 UI 문제가 생겨도 원인이 로직인지 데이터인지 분리된다.
- UI는 Phase 1의 `dark:` 변형과 Phase 2에서 정리한 공용 스타일 위에 만들어야 점검을 반복하지 않는다.

### 검증 방법
- 샘플 글로 한글·영문·태그 검색을 시험하고, Draft 글 제목으로 검색해 결과가 없음을 확인한다.
- `npm start` 후 `curl /search-index.json`으로 Draft와 본문이 없는지, 크기를 확인한다.
- 빌드 로그의 Notion 호출 수를 작업 전/후로 비교한다(검색 인덱스로 인한 추가 조회가 없어야 한다).
- 검색 페이지에서만 인덱스를 요청하는지 Network 탭으로 확인한다. 두 테마와 키보드 조작을 점검한다.

### 완료 기준
- [ ] `npm test`가 통과한다. 다룬 시나리오: 검색 로직(필드별 일치·빈 입력·대소문자·한글·다중 단어·메타문자·결과 없음·빈 필드·동점 정렬·본문 미포함), 인덱스 라우트(성공·빈 결과·조회 실패 모사).
- [ ] `format:check`, `lint`, `typecheck`, `build`가 통과한다.
- [ ] 한글·영문·태그 검색 결과가 정확하고, 빈 입력 안내와 결과 없음 문구가 있다.
- [ ] `/search-index.json`에 Draft와 본문이 없고 크기를 이 문서에 기록했다.
- [ ] 빌드 시 Notion 호출 수의 작업 전/후 값이 기록돼 있고 429 오류가 없다.
- [ ] 검색 입력부터 결과 이동까지 키보드만으로 가능하다. 두 테마에서 대비가 AA이다.
- [ ] 인덱스는 검색 페이지 진입 시에만 로드되어 다른 페이지의 초기 로드에 영향이 없다.

### 리스크
- 글이 크게 늘어 인덱스가 커지면 첫 검색이 느려진다(임계값은 정하지 않음. 필요 시 백로그에서 서버 검색 검토).
- `/api/revalidate`가 인덱스 라우트를 갱신하지 않으면 새 글이 최대 300초 동안 검색되지 않는다(허용 가능, 시험으로 확인).

---

## 구현 기록 (2026-11-02)

> **정정 이력:** 이전 정정 메모는 코드가 아직 없던 시점의 기록이었다. 2026-11-02 현재 `web/src/lib`에 `theme`, `markdown`, `toc`, `reading-time`, `adjacent-posts`, `search`와 각 테스트, `/search`, `/search-index.json`이 존재하고 아래 자동 검증이 통과한다. 단, 이 파일들은 아직 커밋되지 않았다(워킹 트리). Phase 2는 Shiki(`@shikijs/rehype`, 듀얼 테마, github-light/github-dark, `rehypeSanitize` 뒤 배치) + `rehype-slug`, 목차 임계값은 제목 3개 이상, 클라이언트 컴포넌트 추가 없음. "No cover" 대비는 `neutral-600`/`dark:neutral-400`으로 수정했다. 수동 검증(코드 블록 대비 AA, 긴 줄 스크롤, 목차 이동, JS 전송량·Lighthouse 비교)은 남아 있다.

- 자동 검증(2026-11-02 재실행): `format:check`, `lint`, `typecheck`, `npm test`(7파일 57건), `build` 통과. 빌드 라우트에 `/search`, `/search-index.json` 포함.
- 결정: 구문 강조는 Shiki(`@shikijs/rehype`, 듀얼 테마 CSS 변수, `rehypeSanitize` 뒤 배치) → 열린 질문 2. 라이트 모드 코드 블록은 밝은 테마(github-light) → 열린 질문 3. 이전/다음은 제안안(이전 = 더 오래된 글) → 질문 4. 검색은 `/search` 페이지, `?q=` 동기화 없음 → 질문 5. 읽는 시간은 한글 500자/분, 영문 200단어/분(추정) → 질문 6. 질문 1(테스트 러너)은 Vitest 4로 도입(vitest 5는 `@types/node` 22+ 요구로 설치 불가).
- Notion 호출 수(`next build` 1회, 글 3개): `databases.retrieve` 10, `dataSources.query` 10, `blocks.children` 3 = 총 23회. `React.cache`는 렌더 단위라 라우트마다 재조회된다. 빌드 중 429는 없었으나 `getPosts` 호출이 짧은 시간에 몰린다. 글이 늘면 한도(평균 초당 3회)에 근접할 수 있어 빌드 단위 캐시는 보류 상태(모듈 메모이즈는 ISR 런타임에서 오래된 데이터를 붙잡을 수 있어 별도 검토 필요). (이전 기록의 수치이며 이번 세션에서 재측정하지 않음 — **미확인**)
- `/search-index.json` 크기: 글 3개 기준 412바이트(빌드 산출물 `.next/server/app/search-index.json.body`로 확인). Draft·본문 없음.
- 미수행(사용자 환경 필요): Phase 0 전체(Footer 실제 값, 푸시, Vercel, Lighthouse 기준선), FOUC 필름스트립·키보드·axe/Lighthouse 대비 점검, `/api/revalidate`가 `/search-index.json`을 갱신하는지 시험, 번들 전송량 비교.

## 의존성·크리티컬 패스

```
Phase 0 (배포·기준선) → Phase 1 (다크 모드·테스트 러너) → Phase 2 (구문 강조·읽기 편의) → Phase 3 (검색)
```

- 크리티컬 패스는 0 → 1이다. Phase 1의 `.dark` 클래스와 테스트 러너를 2와 3이 그대로 쓴다.
- Phase 2 안에서 구문 강조와 목차는 `PostBody.tsx`/`lib/markdown.ts`를 같이 건드리므로 순차로, 읽는 시간과 이전/다음 글은 서로 독립이라 병행할 수 있다.
- Phase 3의 `lib/search.ts` 로직은 Phase 1 이후라면 Phase 2와 병행 가능하다(순서는 우선순위 때문).

## 리스크와 대응

| 리스크 | 단계 | 가능성 / 영향 (추정) | 대응 |
|---|---|---|---|
| FOUC: 저장된 테마가 하이드레이션 후에 적용되어 깜빡임, 또는 hydration 경고 | 1 | 중 / 상 | `<head>` 인라인 스크립트로 첫 페인트 전에 `<html>` 클래스 설정, `suppressHydrationWarning`, `cookies()` 미사용으로 정적 프리렌더링 유지, 프로덕션 빌드 + 필름스트립으로 검증. 개발 모드 Strict Mode 재마운트는 `useLayoutEffect`로 재적용 |
| 구문 강조로 번들/빌드 비용 증가 | 2 | 중 / 중 | 서버(`PostBody`)에서만 실행해 클라이언트 JS 증가 0 목표. 필요한 언어·테마만 로드. Phase 1 완료 시점 대비 JS 전송량·Lighthouse로 비교. 서버 번들 크기·빌드 시간도 기록. Next 문서도 하이라이팅은 서버 컴포넌트에서 처리하도록 안내한다 |
| 하이라이터·제목 id가 `rehype-sanitize`에 의해 제거/변경 | 2 | 상 / 중 | 두 플러그인을 sanitize 뒤에 배치하고, raw HTML 제거(보안 회귀)와 id 일치를 파이프라인 테스트로 고정 |
| 검색 인덱스 빌드 시 Notion 레이트 리밋(평균 초당 3회, PRD §7) | 3 | 중 / 상 | 인덱스는 기존 `getPosts()` 결과에서 파생해 추가 조회 코드를 만들지 않는다. `React.cache`는 렌더 단위라 라우트마다 재조회될 수 있어(추정) 작업 시작 시 호출 수를 측정하고, 높으면 빌드 단위 캐시를 도입 |
| 다크 모드에서 Notion 이미지·콜아웃 대비 부족 | 1 | 상 / 중 | 대비 점검 표로 전수 점검. 콜아웃은 인용 상자로 변환되므로 `[&_blockquote]` 색을 두 테마에서 측정, 이미지는 반전 없이 밝기 보정 정도만 검토. "No cover" 문구는 AA 미달 의심이므로 우선 수정 |
| Vercel ISR 재생성 시 이미지 로컬화가 읽기 전용이라 원본 URL로 폴백 → 신규 이미지 약 1시간 후 깨짐 | 0 | 중 / 중 | 배포 후 실제로 시험하고 결과로 방침 결정(열린 질문 7) |
| 테스트 러너 호환: `server-only` import, async 서버 컴포넌트 미지원 | 1~3 | 중 / 하 | `src/lib` 순수 함수만 대상으로 하고, `server-only`는 모킹. UI는 수동 검증 |
| Notion 코드 블록 언어명과 하이라이터 언어명 불일치 | 2 | 중 / 하 | 언어명 매핑과 일반 텍스트 폴백 |
| `@custom-variant` 오설정으로 `dark:` 전체 무효화 | 1 | 하 / 상 | 선언 직후 단일 페이지에서 즉시 확인 |

## 열린 질문 (결정 필요)

1. **테스트 러너 최소 도입을 허용하는가?** 현재 러너가 없다. 이 로드맵은 구현 작업마다 테스트 작업을 짝지으려고 `src/lib` 순수 함수 대상의 Vitest를 Phase 1에 최소 도입한다(도구는 추정, Next 공식 문서에 Vitest 가이드 있음). CI, E2E, 커버리지 기준은 백로그로 남겼다. 원하지 않으면 각 Phase의 테스트 작업과 "테스트 통과" 완료 기준을 수동 검증으로 바꾼다.
2. 구문 강조 라이브러리: Shiki 계열(듀얼 테마) vs highlight.js 계열. Phase 2 첫 작업에서 평가 후 확정한다.
3. 라이트 모드의 코드 블록: 밝은 코드 테마로 바꿀지, 현재처럼 항상 어두운 블록을 유지할지.
4. 이전/다음 글의 방향 정의(제안: 이전 = 더 오래된 글, 다음 = 더 최신 글).
5. 검색 UI 형태: `/search` 페이지(기본안) vs 헤더 모달, 그리고 `?q=` URL 동기화 여부.
6. 읽는 시간 속도 상수(한글 분당 글자 수, 영문 분당 단어 수).
7. Vercel에서 배포 후 추가한 Notion 이미지 처리 방침(원본 URL 폴백 시 약 1시간 후 만료). Phase 0 시험 결과를 보고 결정한다. 후보: 재배포 트리거, 외부 스토리지.
8. 커밋 범위: `mcp-shrimp-task-manager/`, `shrimp_data/`를 저장소에 포함할지.
9. `SITE_URL`을 지정할지, Vercel 프로덕션 도메인 폴백(`VERCEL_PROJECT_PRODUCTION_URL`)을 그대로 쓸지.

## 요구사항 추적

| 항목 | 근거 | Phase |
|---|---|---|
| 배포 마무리, 환경변수, Lighthouse 기준선 | PRD §1.3 성공 기준, §6 단계 4, v1 5단계 잔여 | 0 |
| 다크 모드 고도화 (3-상태, 저장, FOUC 방지, 대비) | PRD §4.5 다크 모드(선택, 시스템 설정 연동)의 확장 | 1 |
| 코드 구문 강조, 목차, 읽는 시간, 이전/다음 글 | PRD에 없음. 사용자 선택 (PRD §4.3 본문 렌더링의 확장) | 2 |
| 검색 (제목·요약·태그) | PRD §5.2 후속 단계(제외 항목)를 이번에 편입 | 3 |

## 백로그 (이번 로드맵에서 선택되지 않음)

- SEO 고도화: sitemap, robots, 페이지별 OG 이미지, JSON-LD
- WebGL 빌드 iframe 임베드 (PRD §5.2, §8)
- 품질 인프라 확장: CI 파이프라인, E2E 테스트, 커버리지 기준, Analytics
- 다국어 (PRD §5.2)
- 댓글 (PRD §5.2)
- 조회수

## 문서 운영

- 작업을 끝낼 때마다 해당 체크박스를 `[x]`로 바꾸고, 진행 현황 표의 상태를 갱신한다.
- 기준선 표, 열린 질문의 결정 결과, Notion 호출 수 측정값은 이 문서에 직접 기록한다.
- 모든 Phase가 끝나면 이 파일을 `docs/roadmaps/ROADMAP_v2.md`로 옮기고 새 `docs/ROADMAP.md`를 만든다(`CLAUDE.md`가 `docs/ROADMAP.md`를 참조한다).
