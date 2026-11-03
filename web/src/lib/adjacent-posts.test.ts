import { describe, expect, it } from "vitest";
import { getAdjacentPosts } from "@/lib/adjacent-posts";

const p = (slug: string, publishedAt: string) => ({ slug, publishedAt });
const posts = [
  p("c", "2026-03-01"),
  p("b", "2026-02-01"),
  p("a", "2026-01-01"),
];

describe("getAdjacentPosts", () => {
  it("중간 글: 이전 = 더 오래된 글, 다음 = 더 최신 글", () => {
    const r = getAdjacentPosts(posts, "b");
    expect(r.prev?.slug).toBe("a");
    expect(r.next?.slug).toBe("c");
  });

  it("가장 최신 글은 next가 null", () => {
    const r = getAdjacentPosts(posts, "c");
    expect(r.next).toBeNull();
    expect(r.prev?.slug).toBe("b");
  });

  it("가장 오래된 글은 prev가 null", () => {
    const r = getAdjacentPosts(posts, "a");
    expect(r.prev).toBeNull();
    expect(r.next?.slug).toBe("b");
  });

  it("글이 1개면 둘 다 null", () => {
    expect(getAdjacentPosts([p("x", "2026-01-01")], "x")).toEqual({
      prev: null,
      next: null,
    });
  });

  it("없는 slug와 빈 배열은 둘 다 null", () => {
    expect(getAdjacentPosts(posts, "zzz")).toEqual({ prev: null, next: null });
    expect(getAdjacentPosts([], "a")).toEqual({ prev: null, next: null });
  });

  it("같은 publishedAt이면 입력 순서를 유지한다", () => {
    const tied = [
      p("x", "2026-01-01"),
      p("y", "2026-01-01"),
      p("z", "2026-01-01"),
    ];
    const r = getAdjacentPosts(tied, "y");
    expect(r.next?.slug).toBe("x");
    expect(r.prev?.slug).toBe("z");
  });

  it("정렬되지 않은 입력도 처리한다", () => {
    const r = getAdjacentPosts([posts[2], posts[0], posts[1]], "b");
    expect(r.prev?.slug).toBe("a");
    expect(r.next?.slug).toBe("c");
  });
});
