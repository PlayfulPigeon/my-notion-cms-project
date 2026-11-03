import { MarkdownAsync } from "react-markdown";
import { rehypePlugins, remarkPlugins } from "@/lib/markdown";

// 확장 블록 (notion-to-md 변환 결과 기준)
// - 표: GFM 표 → remark-gfm
// - 토글: <details><summary> HTML → rehype-raw로 파싱, rehype-sanitize로 허용 태그만 남김
// - 코드: Shiki 플러그인은 비동기라 MarkdownAsync가 필요하다(동기 ReactMarkdown은 runSync 오류). Shiki(서버 실행)가 듀얼 테마 CSS 변수를 붙이고 globals.css가 .dark 기준으로 전환
// - 콜아웃: "> 이모지 텍스트" 인용문으로 변환되므로 인용 스타일(상자)로 표시
export default async function PostBody({ markdown }: { markdown: string }) {
  if (!markdown.trim()) return null;
  return (
    <div
      className={[
        "space-y-4 leading-relaxed break-words",
        "[&_h1]:mt-8 [&_h1]:text-3xl [&_h1]:font-bold",
        "[&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold",
        "[&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold",
        "[&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6",
        "[&_a]:text-blue-600 [&_a]:underline dark:[&_a]:text-blue-400",
        "[&_blockquote]:rounded-r-lg [&_blockquote]:border-l-4 [&_blockquote]:border-neutral-300 [&_blockquote]:bg-neutral-50 [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:text-neutral-600 dark:[&_blockquote]:border-neutral-700 dark:[&_blockquote]:bg-neutral-900 dark:[&_blockquote]:text-neutral-300",
        "[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-neutral-200 [&_pre]:bg-[var(--shiki-light-bg,#ffffff)] [&_pre]:p-4 [&_pre]:text-sm dark:[&_pre]:border-neutral-800 dark:[&_pre]:bg-[var(--shiki-dark-bg,#0a0a0a)]",
        "[&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-neutral-100 [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:text-sm dark:[&_:not(pre)>code]:bg-neutral-800",
        "[&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg",
        "[&_details]:rounded-lg [&_details]:border [&_details]:border-neutral-200 [&_details]:px-4 [&_details]:py-2 dark:[&_details]:border-neutral-800",
        "[&_details[open]>summary]:mb-2 [&_summary]:cursor-pointer [&_summary]:font-medium",
        "[&_table]:block [&_table]:max-w-full [&_table]:border-collapse [&_table]:overflow-x-auto [&_table]:text-sm",
        "[&_th]:border [&_th]:border-neutral-300 [&_th]:bg-neutral-100 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left dark:[&_th]:border-neutral-700 dark:[&_th]:bg-neutral-800",
        "[&_td]:border [&_td]:border-neutral-300 [&_td]:px-3 [&_td]:py-2 dark:[&_td]:border-neutral-700",
      ].join(" ")}
    >
      <MarkdownAsync
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
      >
        {markdown}
      </MarkdownAsync>
    </div>
  );
}
