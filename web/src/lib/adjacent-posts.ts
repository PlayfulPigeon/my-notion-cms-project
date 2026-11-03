type Dated = { slug: string; publishedAt: string };

// 같은 목록 안에서 이전/다음 글을 구한다.
// 이전 = 더 오래된 글, 다음 = 더 최신 글 (로드맵 열린 질문 4의 제안안).
// 입력 순서와 무관하게 publishedAt 내림차순(동률은 입력 순서 유지)으로 정렬해 계산한다.
export function getAdjacentPosts<T extends Dated>(
  posts: readonly T[],
  slug: string,
): { prev: T | null; next: T | null } {
  const sorted = posts
    .map((post, index) => ({ post, index }))
    .sort(
      (a, b) =>
        b.post.publishedAt.localeCompare(a.post.publishedAt) ||
        a.index - b.index,
    )
    .map((e) => e.post);
  const i = sorted.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return { prev: sorted[i + 1] ?? null, next: sorted[i - 1] ?? null };
}
