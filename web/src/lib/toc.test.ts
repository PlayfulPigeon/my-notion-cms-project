import { describe, expect, it } from "vitest";
import { extractToc } from "@/lib/toc";

describe("extractToc", () => {
  it("제목이 없으면 빈 배열", () => {
    expect(extractToc("")).toEqual([]);
    expect(extractToc("본문만 있다")).toEqual([]);
  });

  it("h2~h3만 추출하고 h1, h4는 제외한다", () => {
    const toc = extractToc("# a\n\n## b\n\n### c\n\n#### d");
    expect(toc.map((t) => [t.depth, t.text])).toEqual([
      [2, "b"],
      [3, "c"],
    ]);
  });

  it("한글 제목의 id를 만든다", () => {
    expect(extractToc("## 시작하기")).toEqual([
      { depth: 2, text: "시작하기", id: "시작하기" },
    ]);
  });

  it("중복 제목에는 접미사를 붙인다", () => {
    const ids = extractToc("## 개요\n\n## 개요\n\n## 개요").map((t) => t.id);
    expect(ids).toEqual(["개요", "개요-1", "개요-2"]);
  });

  it("h1 제목과 같은 이름도 슬러그 순서에 포함된다", () => {
    const ids = extractToc("# 개요\n\n## 개요").map((t) => t.id);
    expect(ids).toEqual(["개요-1"]);
  });

  it("코드 펜스 안의 # 줄은 제외한다", () => {
    const md = "```bash\n## not a heading\n```\n\n## 진짜";
    expect(extractToc(md).map((t) => t.text)).toEqual(["진짜"]);
  });

  it("굵게·링크·인라인 코드가 섞인 제목은 텍스트만 남긴다", () => {
    const toc = extractToc("## **굵게** [링크](https://a.com) `code`");
    expect(toc[0].text).toBe("굵게 링크 code");
  });
});
