import { describe, expect, it } from "vitest";
import { buildSearchIndex, searchEntries, type SearchEntry } from "./search";
import type { Post } from "./types";

const entry = (over: Partial<SearchEntry>): SearchEntry => ({
  type: "Devlog",
  slug: "a",
  title: "",
  summary: "",
  tags: [],
  publishedAt: "2026-01-01",
  ...over,
});

const INDEX: SearchEntry[] = [
  entry({
    slug: "tilemap",
    title: "타일맵 충돌 처리",
    summary: "Collider 정리",
    tags: ["Unity", "2D"],
    publishedAt: "2026-10-20",
  }),
  entry({
    type: "Project",
    slug: "platformer",
    title: "Platformer Demo",
    summary: "작은 플랫포머 게임",
    tags: ["Game"],
    publishedAt: "2026-09-01",
  }),
  entry({ slug: "empty", title: "빈 항목", publishedAt: "2026-08-01" }),
];

describe("searchEntries", () => {
  it("제목·요약·태그 각각에서 일치한다", () => {
    expect(searchEntries(INDEX, "충돌").map((e) => e.slug)).toEqual([
      "tilemap",
    ]);
    expect(searchEntries(INDEX, "플랫포머").map((e) => e.slug)).toEqual([
      "platformer",
    ]);
    expect(searchEntries(INDEX, "2d").map((e) => e.slug)).toEqual(["tilemap"]);
  });

  it("빈 문자열과 공백만 있으면 결과가 없다", () => {
    expect(searchEntries(INDEX, "")).toEqual([]);
    expect(searchEntries(INDEX, "   ")).toEqual([]);
  });

  it("대소문자를 무시한다", () => {
    expect(searchEntries(INDEX, "PLATFORMER")).toHaveLength(1);
  });

  it("한글 부분 일치와 NFD 입력을 처리한다", () => {
    expect(searchEntries(INDEX, "타일")).toHaveLength(1);
    expect(searchEntries(INDEX, "타일맵".normalize("NFD"))).toHaveLength(1);
  });

  it("여러 단어는 AND로 매칭한다", () => {
    expect(searchEntries(INDEX, "타일맵 unity")).toHaveLength(1);
    expect(searchEntries(INDEX, "타일맵 platformer")).toHaveLength(0);
  });

  it("정규식 메타문자를 그대로 문자로 취급한다", () => {
    for (const q of ["(", "*", ".", "[a-z]", "\\"]) {
      expect(() => searchEntries(INDEX, q)).not.toThrow();
      expect(searchEntries(INDEX, q)).toEqual([]);
    }
    const withDot = [entry({ slug: "dot", title: "v1.0 릴리스" })];
    expect(searchEntries(withDot, "1.0")).toHaveLength(1);
    expect(searchEntries(withDot, "1x0")).toHaveLength(0);
  });

  it("결과가 없으면 빈 배열이다", () => {
    expect(searchEntries(INDEX, "존재하지않는단어")).toEqual([]);
  });

  it("summary·tags가 비어 있어도 동작한다", () => {
    expect(searchEntries(INDEX, "빈 항목").map((e) => e.slug)).toEqual([
      "empty",
    ]);
    const broken = [
      { ...entry({ slug: "x" }), tags: undefined },
    ] as unknown as SearchEntry[];
    expect(() => searchEntries(broken, "x")).not.toThrow();
  });

  it("제목 일치가 요약 일치보다 먼저, 동점은 최신순이다", () => {
    const idx = [
      entry({ slug: "sum", summary: "unity", publishedAt: "2026-12-01" }),
      entry({ slug: "title-old", title: "unity", publishedAt: "2026-01-01" }),
      entry({ slug: "title-new", title: "unity", publishedAt: "2026-06-01" }),
    ];
    expect(searchEntries(idx, "unity").map((e) => e.slug)).toEqual([
      "title-new",
      "title-old",
      "sum",
    ]);
  });
});

describe("buildSearchIndex", () => {
  it("본문·커버·id를 포함하지 않는다", () => {
    const post: Post = {
      id: "secret-id",
      slug: "s",
      title: "t",
      type: "Project",
      summary: "sum",
      publishedAt: "2026-01-01",
      cover: "/notion-images/x.png",
      genre: ["Puzzle"],
      engineVersion: "6000.3",
      tags: ["a"],
      playUrl: "https://example.com",
      repoUrl: "https://example.com",
    };
    const [item] = buildSearchIndex([post]);
    expect(Object.keys(item).sort()).toEqual([
      "publishedAt",
      "slug",
      "summary",
      "tags",
      "title",
      "type",
    ]);
  });
});
