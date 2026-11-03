import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Post } from "@/lib/types";

vi.mock("server-only", () => ({}));
// vi.fn은 거부된 Promise를 따로 추적해 unhandled rejection을 일으키므로 일반 함수로 대체한다.
let getPosts: () => Promise<Post[]> = async () => [];
vi.mock("@/lib/notion", () => ({ getPosts: () => getPosts() }));

import { GET } from "./route";

const post = (over: Partial<Post>): Post => ({
  id: "id",
  slug: "s",
  title: "t",
  type: "Devlog",
  summary: "",
  publishedAt: "2026-01-01",
  genre: [],
  tags: [],
  ...over,
});

beforeEach(() => {
  getPosts = async () => [];
});

describe("GET /search-index.json", () => {
  it("성공: 스키마와 순서를 유지하고 id·cover를 노출하지 않는다", async () => {
    getPosts = async () => [
      post({ slug: "new", publishedAt: "2026-02-01", cover: "/x.png" }),
      post({ slug: "old", publishedAt: "2026-01-01", type: "Project" }),
    ];
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.map((e: { slug: string }) => e.slug)).toEqual(["new", "old"]);
    expect(body[0]).not.toHaveProperty("id");
    expect(body[0]).not.toHaveProperty("cover");
  });

  it("빈 결과는 빈 배열이다", async () => {
    getPosts = async () => [];
    const res = await GET();
    expect(await res.json()).toEqual([]);
  });

  it("조회 실패(4xx/5xx·타임아웃)는 오류를 전파한다", async () => {
    getPosts = async () => {
      throw new Error("Notion 503");
    };
    let error: unknown;
    try {
      await GET();
    } catch (e) {
      error = e;
    }
    expect((error as Error).message).toBe("Notion 503");
  });
});
