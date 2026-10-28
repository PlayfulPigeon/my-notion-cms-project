# PRD: Notion CMS 기반 유니티 개발 일지 / 포트폴리오 사이트

## 1. 개요

### 1.1 목적
Notion 데이터베이스에 개발 일지와 프로젝트를 작성하면, 별도 관리자 화면 없이 웹사이트에 목록과 상세 페이지로 자동 반영되는 개인 포트폴리오 사이트를 만든다.

### 1.2 대상 사용자
| 사용자 | 필요 |
|---|---|
| 작성자(본인) | Notion에서 글만 쓰면 사이트에 반영된다. 코드 수정과 재배포가 필요 없다. |
| 방문자(채용 담당자, 동료 개발자) | 만든 게임과 개발 과정을 빠르게 훑어보고 플레이 링크나 저장소로 이동한다. |

### 1.3 성공 기준
- 30분 안에 첫 배포 URL을 얻는다.
- Notion에서 `Status`를 `Published`로 바꾸면 5분 이내에 사이트에 반영된다.
- 방문자가 홈에서 두 번 이내 클릭으로 프로젝트 상세에 도달한다.

## 2. 기술 스택

| 영역 | 선택 | 비고 |
|---|---|---|
| 프레임워크 | Next.js (App Router) | 서버 컴포넌트에서 Notion을 직접 호출한다. |
| 언어 | TypeScript | Notion 응답을 도메인 타입으로 매핑한다. |
| 스타일 | Tailwind CSS | 빠른 UI 구성 |
| Notion 연동 | `@notionhq/client` | 서버에서만 호출한다. 토큰은 `NOTION_TOKEN` 환경변수로 관리한다. |
| 본문 렌더링 | `notion-to-md` + `react-markdown` | Notion 블록을 Markdown으로 변환 후 렌더링. MVP 이후 직접 블록 렌더러로 교체 가능 |
| 렌더링 전략 | SSG + ISR (`revalidate` 300초) | 빌드 시 페이지를 만들고, 주기적으로 재생성한다. |
| 배포 | Vercel | GitHub 연동 자동 배포 |

### 2.1 환경변수
| 이름 | 설명 |
|---|---|
| `NOTION_TOKEN` | Notion Integration 시크릿 |
| `NOTION_DATABASE_ID` | 콘텐츠 데이터베이스 ID |

`.env.local`에만 저장하고 저장소에 커밋하지 않는다. 클라이언트 번들에 노출되는 `NEXT_PUBLIC_` 접두사는 쓰지 않는다.

### 2.2 확인 필요
Notion API는 버전에 따라 데이터베이스 조회 방식이 다르다(최신 버전은 data source 단위로 조회). 구현 0단계에서 공식 문서로 `@notionhq/client` 버전과 조회 API를 확정한다.

## 3. Notion 데이터베이스 구조

데이터베이스 하나에 일지와 프로젝트를 함께 두고 `Type`으로 구분한다.

| 속성 | Notion 타입 | 필수 | 설명 |
|---|---|---|---|
| Title | Title | O | 글/프로젝트 제목 |
| Slug | Rich text | O | URL 경로. 영문 소문자와 하이픈, 중복 불가 |
| Type | Select (`Devlog`, `Project`) | O | 노출될 섹션 결정 |
| Status | Select (`Draft`, `Published`) | O | `Published`만 사이트에 노출 |
| Published At | Date | O | 정렬 기준(내림차순) |
| Summary | Rich text | O | 목록 카드에 보이는 한 줄 설명 |
| Cover | Files & media | | 썸네일/대표 이미지 |
| Genre | Multi-select | | 예: Platformer, Puzzle, FPS |
| Engine Version | Select | | 예: 6000.3, 2022.3 |
| Tags | Multi-select | | 자유 태그 |
| Play URL | URL | | WebGL 빌드 또는 itch.io 링크 (Project) |
| Repo URL | URL | | GitHub 저장소 링크 (Project) |

### 3.1 규칙
- 조회 필터: `Status = Published`
- 정렬: `Published At` 내림차순
- 본문: 각 행(페이지)의 블록 내용을 사용한다.
- Slug가 비어 있거나 중복이면 해당 행은 건너뛰고 빌드 로그에 경고를 남긴다.
- 사용 전 Notion Integration을 만들고 해당 데이터베이스에 연결(Connections)해야 한다.

### 3.2 도메인 타입 (초안)
```ts
type Post = {
  id: string;
  slug: string;
  title: string;
  type: "Devlog" | "Project";
  summary: string;
  publishedAt: string; // ISO date
  cover?: string;
  genre: string[];
  engineVersion?: string;
  tags: string[];
  playUrl?: string;
  repoUrl?: string;
};
```

## 4. 화면 구성

### 4.1 라우트
| 경로 | 화면 | 데이터 |
|---|---|---|
| `/` | 홈 | 최근 프로젝트 3개, 최근 일지 5개 |
| `/projects` | 프로젝트 목록 | `Type = Project` 전체 |
| `/projects/[slug]` | 프로젝트 상세 | 메타 정보 + 링크 + 본문 |
| `/devlog` | 일지 목록 | `Type = Devlog` 전체 |
| `/devlog/[slug]` | 일지 상세 | 본문 |
| `not-found` | 404 | - |

### 4.2 홈
```
+--------------------------------------------------+
| Logo            Projects   Devlog                |
+--------------------------------------------------+
|  안녕하세요, 유니티 개발자 ○○입니다.                |
|  만든 게임과 개발 과정을 기록합니다.                |
+--------------------------------------------------+
|  Projects                          [전체 보기]    |
|  +--------+  +--------+  +--------+              |
|  | cover  |  | cover  |  | cover  |              |
|  | title  |  | title  |  | title  |              |
|  | genre  |  | genre  |  | genre  |              |
|  +--------+  +--------+  +--------+              |
|                                                  |
|  Devlog                            [전체 보기]    |
|  2026-10-20  타일맵 충돌 처리 정리                 |
|  2026-10-12  첫 WebGL 빌드 올리기                 |
+--------------------------------------------------+
| Footer: GitHub / Email                           |
+--------------------------------------------------+
```

### 4.3 프로젝트 상세
```
+--------------------------------------------------+
| [cover image]                                    |
| Title                                            |
| Genre · Engine Version · Published At            |
| [Play]  [Repo]                                   |
+--------------------------------------------------+
| 본문 (제목, 문단, 리스트, 이미지, 코드, 인용)       |
+--------------------------------------------------+
```

### 4.4 목록 페이지 (`/projects`, `/devlog`)
- 프로젝트: 카드 그리드(커버, 제목, 요약, 장르 칩)
- 일지: 날짜 + 제목 + 요약 리스트
- 공통: 항목이 없으면 빈 상태 문구를 보여준다.

### 4.5 공통
- 헤더(내비게이션), 푸터(링크), 반응형(모바일 1열, 데스크톱 3열)
- 다크 모드는 시스템 설정을 따른다(선택).

## 5. MVP 범위

### 5.1 포함
- 프로젝트/일지 목록과 상세 페이지
- `Status = Published` 필터와 `Published At` 정렬
- 본문 기본 블록: 제목, 문단, 리스트, 이미지, 코드, 인용
- ISR 재생성 (300초)
- Vercel 배포
- 기본 SEO: 페이지별 `title`, `description`

### 5.2 제외 (후속 단계)
- 검색, 태그/장르 필터 페이지
- 댓글, RSS
- 다국어
- 웹훅 기반 즉시 재검증(On-demand revalidation)
- 토글, 콜아웃, 테이블 등 확장 블록
- WebGL 빌드 iframe 임베드

## 6. 구현 단계

총 목표 30분.

| 단계 | 내용 | 시간 | 완료 조건 |
|---|---|---|---|
| 0 | Notion 준비: Integration 생성, DB 만들고 연결, 샘플 글 3개 입력, API 문서 확인 | 5분 | DB ID와 토큰을 확보했다. |
| 1 | Next.js 스캐폴딩, Tailwind 설정, `.env.local` 작성, 패키지 설치 | 5분 | `npm run dev`로 기본 페이지가 열린다. |
| 2 | `lib/notion.ts`: 목록 조회, slug 단건 조회, 속성 → `Post` 매핑, 본문 변환 | 5분 | 콘솔/테스트 페이지에서 샘플 3개가 출력된다. |
| 3 | 페이지 구현: 홈, 목록 2종, 상세 2종, 404 | 10분 | 모든 라우트가 샘플 데이터로 렌더링된다. |
| 4 | 스타일 다듬기, 메타데이터, GitHub 푸시 후 Vercel 배포, 환경변수 등록 | 5분 | 배포 URL에서 Notion 데이터가 보인다. |

### 6.1 디렉터리 구조 (초안)
```
web/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── not-found.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   └── devlog/
│   │       ├── page.tsx
│   │       └── [slug]/page.tsx
│   ├── components/        # Header, Footer, ProjectCard, DevlogItem, PostBody
│   └── lib/
│       ├── notion.ts      # Notion 클라이언트, 조회, 매핑
│       └── types.ts       # Post 타입
├── .env.local             # 커밋 금지
└── package.json
```

### 6.2 검증 방법
- 로컬: `npm run dev`로 각 라우트를 열어 샘플 3개가 보이는지 확인
- 필터: `Draft` 글이 노출되지 않는지 확인
- 반영: Notion에서 제목을 수정하고 `revalidate` 시간이 지난 뒤 사이트에 반영되는지 확인
- 빌드: `npm run build`가 오류 없이 끝나는지 확인

## 7. 리스크와 오픈 이슈

| 항목 | 내용 | 대응 |
|---|---|---|
| 이미지 URL 만료 | Notion이 주는 파일 URL은 약 1시간 후 만료된다. | ISR 재생성 주기를 짧게 유지하거나, 빌드 시 이미지를 내려받아 정적 자산으로 저장한다. |
| API 레이트 리밋 | 평균 초당 3회 수준으로 제한된다. | 빌드 시 요청을 직렬화하고 목록 조회 결과를 재사용한다. |
| API 버전 변경 | 데이터베이스 조회 방식이 버전에 따라 다르다. | 0단계에서 공식 문서로 확정하고 버전을 고정한다. |
| 토큰 노출 | 클라이언트 코드에 토큰이 들어가면 유출된다. | 서버 컴포넌트에서만 호출하고 `NEXT_PUBLIC_`을 쓰지 않는다. |
| 지원하지 않는 블록 | 변환기가 처리하지 못하는 블록은 비어 보일 수 있다. | MVP는 기본 블록만 사용하도록 작성 가이드를 둔다. |

## 8. 후속 확장 아이디어
- 웹훅/버튼으로 즉시 재검증
- WebGL 빌드 iframe 임베드 (게임 허브로 확장)
- 개발 일지에 Unity 버전별 필터 추가
- Notion DB를 게임 데이터 JSON API로 확장 (기획 데이터 에디터)
