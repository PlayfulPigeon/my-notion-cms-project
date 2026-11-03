import GithubSlugger from "github-slugger";
import { toString } from "mdast-util-to-string";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";

export type TocItem = { depth: 2 | 3; text: string; id: string };

// 마크다운에서 h2~h3를 추출한다. id는 렌더 파이프라인의 rehype-slug와 같은 규칙(github-slugger)으로 만든다.
// rehype-slug는 문서의 모든 제목(h1~h6)에 순서대로 슬러그를 붙이므로, 중복 접미사(-1, -2)를
// 일치시키려면 모든 제목을 같은 순서로 슬러그한 뒤 h2~h3만 걸러야 한다.
export function extractToc(markdown: string): TocItem[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  visit(tree, "heading", (node) => {
    const text = toString(node).trim();
    const id = slugger.slug(text);
    if (node.depth === 2 || node.depth === 3) {
      items.push({ depth: node.depth, text, id });
    }
  });
  return items;
}
