import { renderToStaticMarkup } from "react-dom/server";
import { MarkdownAsync } from "react-markdown";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { describe, expect, it } from "vitest";
import { extractToc } from "@/lib/toc";
import { rehypePlugins, remarkPlugins } from "@/lib/markdown";

// react-markdown과 같은 설정(allowDangerousHtml)으로 문자열 → HTML 변환
async function render(md: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkPlugins)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypePlugins)
    .use(rehypeStringify)
    .process(md);
  return String(file);
}

describe("마크다운 파이프라인", () => {
  it("지원 언어(C#)를 토큰화하고 듀얼 테마 변수를 붙인다", async () => {
    const html = await render("```csharp\nint x = 1;\n```");
    expect(html).toContain("shiki");
    expect(html).toContain("--shiki-light:");
    expect(html).toContain("--shiki-dark:");
    expect(html).toContain("<span");
  });

  it("Notion 별칭 c#도 강조된다", async () => {
    const html = await render("```c#\nint x = 1;\n```");
    expect(html).toContain("--shiki-light:");
  });

  it("미지원 언어는 일반 텍스트로 폴백하고 내용을 유지한다", async () => {
    const html = await render("```notalang\nhello world\n```");
    expect(html).toContain("hello world");
  });

  it("언어 미지정 코드 블록도 렌더된다", async () => {
    const html = await render("```\nplain\n```");
    expect(html).toContain("plain");
  });

  it("빈 코드 블록도 오류 없이 렌더된다", async () => {
    await expect(render("```csharp\n```")).resolves.toContain("<pre");
  });

  it("raw HTML의 script와 onerror는 제거된다 (보안 회귀)", async () => {
    const html = await render(
      '<script>alert(1)</script>\n\n<img src="x" onerror="alert(2)">\n\n<a href="javascript:alert(3)">x</a>',
    );
    expect(html).not.toContain("<script");
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("javascript:");
  });

  it("토글(details)은 유지된다", async () => {
    const html = await render(
      "<details><summary>제목</summary>\n\n내용\n\n</details>",
    );
    expect(html).toContain("<details>");
    expect(html).toContain("<summary>");
  });

  it("제목 id가 접두사 없이 붙고 목차의 id와 일치한다", async () => {
    const md = [
      "# 제목",
      "## 시작하기",
      "### 설치 **방법**",
      "## 시작하기",
      "## Code `Foo`",
    ].join("\n\n");
    const html = await render(md);
    for (const item of extractToc(md)) {
      expect(html).toContain(`id="${item.id}"`);
    }
    expect(html).not.toContain("user-content-");
  });

  it("react-markdown(MarkdownAsync) 경로에서도 코드 블록이 강조된다 (비동기 플러그인 회귀)", async () => {
    const el = await MarkdownAsync({
      children: "```csharp\nint a;\n```",
      remarkPlugins,
      rehypePlugins,
    });
    const html = renderToStaticMarkup(el);
    expect(html).toContain("--shiki-light");
    expect(html).toContain("--shiki-dark");
  });
});
