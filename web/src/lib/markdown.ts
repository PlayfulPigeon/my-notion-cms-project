import rehypeShiki from "@shikijs/rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import type { PluggableList } from "unified";

// 파이프라인 순서가 중요하다.
// 1. rehypeRaw: 토글(<details>) 등 raw HTML을 파싱
// 2. rehypeSanitize: 허용 태그만 남김. 이후 플러그인이 붙이는 class/style/id는 제거되지 않도록
//    하이라이터와 제목 id 부여는 반드시 sanitize 뒤에 둔다.
//    (기본 스키마는 id에 user-content- 접두사를 붙이므로 slug를 앞에 두면 목차 링크와 어긋난다.)
export const remarkPlugins: PluggableList = [remarkGfm];

export const rehypePlugins: PluggableList = [
  rehypeRaw,
  rehypeSanitize,
  rehypeSlug,
  [
    rehypeShiki,
    {
      // 듀얼 테마: 색을 CSS 변수(--shiki-light / --shiki-dark)로 내보내고 globals.css에서 .dark 기준으로 전환
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
      // Notion 언어명이 Shiki에 없으면 일반 텍스트로 처리
      fallbackLanguage: "text",
    },
  ],
];
