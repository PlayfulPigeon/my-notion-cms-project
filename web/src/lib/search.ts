import type { Post } from "./types";

// 검색 인덱스 항목: 본문·커버·id는 넣지 않아 크기를 최소화한다.
export type SearchEntry = {
  type: Post["type"];
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  publishedAt: string;
};

export function buildSearchIndex(posts: Post[]): SearchEntry[] {
  return posts.map((p) => ({
    type: p.type,
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    tags: p.tags,
    publishedAt: p.publishedAt,
  }));
}

const normalize = (value: string): string =>
  value.normalize("NFC").toLowerCase();

// 가중치(추정): 제목 > 태그 > 요약
const WEIGHT = { title: 3, tag: 2, summary: 1 } as const;

function scoreEntry(entry: SearchEntry, terms: string[]): number {
  const title = normalize(entry.title ?? "");
  const summary = normalize(entry.summary ?? "");
  const tags = (entry.tags ?? []).map(normalize);

  let total = 0;
  for (const term of terms) {
    let best = 0;
    if (title.includes(term)) best += WEIGHT.title;
    if (tags.some((t) => t.includes(term))) best += WEIGHT.tag;
    if (summary.includes(term)) best += WEIGHT.summary;
    if (best === 0) return 0; // 모든 단어가 일치해야 한다(AND)
    total += best;
  }
  return total;
}

// 정규식을 쓰지 않고 includes로만 비교한다(메타문자 안전).
export function searchEntries(
  index: SearchEntry[],
  query: string,
): SearchEntry[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  return index
    .map((entry) => ({ entry, score: scoreEntry(entry, terms) }))
    .filter((r) => r.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.entry.publishedAt ?? "").localeCompare(a.entry.publishedAt ?? ""),
    )
    .map((r) => r.entry);
}
