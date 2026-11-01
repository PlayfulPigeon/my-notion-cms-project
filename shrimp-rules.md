# Development Guidelines

## Project Overview

- Notion DB를 CMS로 쓰는 유니티 개발 일지/포트폴리오 사이트. 코드는 `web/`에만 있다.
- 스택: Next.js 16.4.3 (App Router), React 19.3, TypeScript(strict), Tailwind CSS v4, `@notionhq/client` ^5, `notion-to-md`, `react-markdown`.
- 저장소 루트의 `scripts/`, `template/`, `docs/starterkit.html`은 Unity 스타터킷이다. 사이트 작업과 무관하다.
- 기준 문서: `docs/PRD.md`(요구사항), `docs/ROADMAP.md`(단계/체크리스트). 충돌 시 PRD가 우선한다.

## Directory Map

| 경로 | 용도 | 상태 |
|---|---|---|
| `web/src/app/` | 라우트 (`layout`, `page`, `not-found`, `projects/`, `devlog/`) | 스텁 존재 |
| `web/src/components/` | Header, Footer, ProjectCard, DevlogItem, PostBody, 빈 상태 | 비어 있음 (`.gitkeep`) |
| `web/src/lib/notion.ts` | Notion 클라이언트, 조회, 매핑, 본문 변환 | 비어 있음 (`export {}`) |
| `web/src/lib/types.ts` | `Post` 타입 | 완료 |
| `web/.env.local` | 비밀값 (git 제외) | 존재 |
| `web/.env.example` | 변수 이름만 (커밋 대상) | 존재 |

- 새 파일은 PRD 6.1 디렉터리 구조 안에만 만든다.
- 컴포넌트는 `web/src/components/`에 PascalCase 파일명(`ProjectCard.tsx`)으로 만든다.
- import는 `@/*` 별칭(`@/lib/notion`)을 쓴다. 상대경로 `../../lib/...` 금지.

## Mandatory First Step (Next.js)

- **Next.js 코드를 쓰거나 고치기 전에 `web/node_modules/next/dist/docs/`의 관련 문서를 읽는다.** 이 버전은 학습 데이터와 API가 다르다 (`web/AGENTS.md`).
- `params`는 Promise다. `const { slug } = await params;` 형태를 유지한다.
- 페이지 props 타입은 전역 헬퍼를 쓴다: `PageProps<"/projects/[slug]">`, `LayoutProps<"/">`. 직접 `{ params: { slug: string } }`로 쓰지 않는다.
- `next.config.ts`의 `turbopack.rules`(`@tailwindcss/turbopack`)를 지우거나 바꾸지 않는다.
- `web/AGENTS.md`의 `nextjs-agent-rules` 블록은 `next dev`가 재생성한다. 수동 편집·삭제하지 않는다.

## Commands

- **모든 npm 명령은 `web/`에서 실행한다.** 루트 `package.json`은 비어 있는 껍데기다. 루트에 패키지를 설치하지 않는다.
- 작업 완료 전 순서대로 통과시킨다: `npm run format:check` → `npm run lint` → `npm run typecheck` → `npm run build`.
- 포맷은 `npm run format`. Prettier 설정(세미콜론, 큰따옴표, trailing comma `all`, `prettier-plugin-tailwindcss` 클래스 정렬)을 따른다.

## Notion Data Layer (`web/src/lib/notion.ts`)

- `notion.ts` 최상단에 `import "server-only"`를 둔다 (패키지가 없으면 `npm install server-only`를 `web/`에서 실행).
- **0단계 선행 조건:** `@notionhq/client` v5의 DB 조회 방식(database vs data source)을 공식 문서/설치된 타입(`node_modules/@notionhq/client`)으로 확인한 뒤 구현한다. 추측으로 `databases.query`를 쓰지 않는다. 확정한 버전과 방식을 `notion.ts` 상단 주석에 기록한다.
- `@notionhq/client` 버전은 `package.json`에서 고정한다. `^`를 제거하는 변경은 확정 시점에만 한다.
- 환경변수는 `process.env.NOTION_TOKEN`, `process.env.NOTION_DATABASE_ID`만 쓴다. 값이 없으면 명확한 에러 메시지로 throw한다.
- 공개 함수 시그니처 (ROADMAP 2단계 기준, 이름 변경 금지):
  - `getPosts(type?: Post["type"]): Promise<Post[]>`
  - `getPostBySlug(type: Post["type"], slug: string): Promise<Post | null>`
  - `getPostBody(id: string): Promise<string>` (Markdown 문자열)
- 조회 필터는 항상 `Status = Published`, 정렬은 `Published At` 내림차순.
- Slug가 비었거나 중복이면 해당 행을 건너뛰고 `console.warn`으로 경고한다. throw하지 않는다.
- 매핑 시 `genre`, `tags`는 빈 값이면 `[]`. 선택 필드(`cover`, `engineVersion`, `playUrl`, `repoUrl`)는 없으면 `undefined`.
- 레이트 리밋 대응: 요청을 병렬 폭주시키지 않고 직렬화한다. 같은 렌더 중 목록 조회는 재사용(`React.cache` 등)한다.
- Notion 속성 이름은 PRD 3장 표 그대로 쓴다 (`Title`, `Slug`, `Type`, `Status`, `Published At`, `Summary`, `Cover`, `Genre`, `Engine Version`, `Tags`, `Play URL`, `Repo URL`).

## Routes and Rendering

- 라우트는 PRD 4.1 경로만 만든다: `/`, `/projects`, `/projects/[slug]`, `/devlog`, `/devlog/[slug]`, `not-found`.
- 데이터 조회는 서버 컴포넌트에서만 한다. `"use client"` 파일에서 `@/lib/notion`을 import하지 않는다.
- 각 목록/상세 페이지에 `export const revalidate = 300;`을 둔다. 다른 값 금지.
- 상세 페이지는 `generateStaticParams`와 `generateMetadata`(`title`, `description`)를 함께 구현한다.
- 존재하지 않거나 `Draft`인 slug는 `notFound()`를 호출한다. 다른 `Type`의 slug로 접근해도 404 (`/devlog/<project-slug>` 금지).
- 홈: 최근 Project 3개, 최근 Devlog 5개, 각 섹션에 "전체 보기" 링크.
- Play/Repo 버튼은 `playUrl`/`repoUrl`이 있을 때만 렌더링한다. 외부 링크는 `target="_blank" rel="noopener noreferrer"`.
- 목록이 비면 빈 상태 컴포넌트를 렌더링한다.
- UI 문구는 한국어, `<html lang="ko">` 유지.

## Images

- Notion 파일 URL은 약 1시간 후 만료된다. MVP에서는 ISR 300초로 대응하고, 영구 대응은 ROADMAP 4단계 항목이다 (MVP 중 임의 구현 금지).
- `next/image`를 쓰면 `next.config.ts`에 Notion 이미지 호스트(`prod-files-secure.s3.us-west-2.amazonaws.com`, `s3.us-west-2.amazonaws.com` 등 실제 응답에서 확인한 호스트만)를 `images.remotePatterns`로 추가한다. 기존 `turbopack` 설정은 유지한다.

## Styling

- Tailwind v4 유틸리티 클래스만 쓴다. `web/src/app/globals.css`는 `@import "tailwindcss";`로 시작하며 이 줄을 유지한다. `tailwind.config.js`를 새로 만들지 않는다.
- 반응형: 모바일 1열, 데스크톱(`lg:`) 3열 그리드.
- 다크 모드는 ROADMAP 4단계 항목이다. MVP 작업에서 추가하지 않는다.

## Secrets and Security

- **`NEXT_PUBLIC_` 접두사 환경변수 금지.**
- `web/.env.local`을 읽어서 출력하거나 커밋하거나 문서/로그에 값을 복사하지 않는다.
- 새 환경변수를 추가하면 `web/.env.example`에 이름만 추가하고, `docs/PRD.md` 2.1 표도 갱신한다.
- 토큰을 클라이언트 컴포넌트, `props`, 로그로 넘기지 않는다.

## Multi-file Coordination

| 변경 | 같이 수정할 파일 |
|---|---|
| `Post` 타입 필드 추가/변경 | `web/src/lib/types.ts`, `web/src/lib/notion.ts`(매핑), `docs/PRD.md` 3.2, 해당 필드를 쓰는 컴포넌트 |
| Notion DB 속성 추가/변경 | `docs/PRD.md` 3장 표, `web/src/lib/notion.ts`, `types.ts` |
| 환경변수 추가 | `web/.env.example`, `docs/PRD.md` 2.1 |
| 라우트 추가/삭제 | `docs/PRD.md` 4.1, `docs/ROADMAP.md` 3단계, Header/Footer 링크 |
| 의존성 추가/버전 변경 | `web/package.json`, `web/package-lock.json` (루트가 아님) |
| 단계 작업 완료 | `docs/ROADMAP.md`의 해당 `- [ ]`를 `- [x]`로, "진행 현황" 표 상태 갱신 |
| API 방식 확정 (database/data source) | `notion.ts` 주석, `docs/ROADMAP.md` 1단계 완료 기준 체크 |

## Workflow Order

- 순서는 ROADMAP을 따른다: 1 초기 설정 → 2 공통 모듈(`lib` 먼저, 그다음 `components`) → 3 페이지(홈 → 목록 → 상세) → 5 배포. 4단계는 MVP 배포 뒤에 한다.
- `lib/notion.ts`를 콘솔/임시 페이지로 검증하기 전에 페이지 구현을 시작하지 않는다. 임시 검증 코드는 완료 후 삭제한다.
- 1단계의 "스타터 데모 코드와 기본 에셋 제거"가 이미 끝난 상태다. 데모 코드를 다시 만들지 않는다.

## AI Decision Rules

- PRD와 ROADMAP이 다르면 → PRD 기준으로 구현하고 ROADMAP을 맞춘다.
- 요구사항이 PRD 5.2 "제외" 목록에 있으면 → 구현하지 않는다 (검색, 필터 페이지, 댓글, RSS, 다국어, 웹훅 재검증, 확장 블록, iframe 임베드).
- 라이브러리 선택이 필요하면 → PRD 2장 스택 안에서 고른다. 새 의존성은 꼭 필요할 때만 추가한다.
- Next.js API가 불확실하면 → `web/node_modules/next/dist/docs/`를 읽는다. 기억에 의존하지 않는다.
- Notion API 응답 구조가 불확실하면 → 설치된 `@notionhq/client` 타입을 확인한다.

## Prohibited Actions

- 루트(`notion-cms-project/`)에서 `npm install`/`npm run` 실행 금지 (항상 `web/`).
- `scripts/`, `template/`, `mcp-shrimp-task-manager/`, `shrimp_data/`, `.claude/agents/`를 사이트 작업 중 수정 금지.
- `.env.local`, `.next/`, `node_modules/` 커밋 금지.
- 클라이언트 컴포넌트에서 Notion 호출 금지.
- 샘플/하드코딩 데이터를 최종 페이지에 남기는 것 금지 (컴포넌트 검증용 임시 props는 3단계 전에 제거).
- `Draft` 글을 목록/직접 URL 어디에도 노출하는 것 금지.
- 테스트 러너가 없는 상태에서 `npm test`를 실행하거나 테스트 프레임워크를 임의로 추가하는 것 금지.
- 커밋/푸시는 사용자가 요청할 때만 한다.

### Do / Don't

```ts
// DO
import { getPosts } from "@/lib/notion";
export const revalidate = 300;
export default async function Page() {
  const projects = await getPosts("Project");
  return <main>{/* ... */}</main>;
}

// DON'T
"use client";
import { Client } from "@notionhq/client"; // 클라이언트에서 Notion 호출 금지
const token = process.env.NEXT_PUBLIC_NOTION_TOKEN; // NEXT_PUBLIC_ 금지
```
