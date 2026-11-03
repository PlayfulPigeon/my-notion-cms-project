"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import EmptyState from "@/components/EmptyState";
import { searchEntries, type SearchEntry } from "@/lib/search";

// 검색 UI: 인덱스는 마운트 시 1회만 가져와 메모리에 보관한다(검색 페이지에서만 로드).
type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; index: SearchEntry[] };

const GROUPS = [
  { type: "Project", label: "Projects", base: "/projects" },
  { type: "Devlog", label: "Devlog", base: "/devlog" },
] as const;

export default function SearchView() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [query, setQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/search-index.json", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<SearchEntry[]>;
      })
      .then((index) => setState({ status: "ready", index }))
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({ status: "error" });
      });
    return () => controller.abort();
  }, []);

  const results = useMemo(
    () => (state.status === "ready" ? searchEntries(state.index, query) : []),
    [state, query],
  );

  const hasQuery = query.trim().length > 0;

  let status = "";
  if (state.status === "loading") status = "검색 데이터를 불러오는 중...";
  else if (state.status === "error")
    status = "검색 데이터를 불러오지 못했습니다. 새로고침 해 주세요.";
  else if (!hasQuery) status = "검색어를 입력하세요.";
  else status = `검색 결과 ${results.length}건`;

  return (
    <div role="search" className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="site-search" className="text-sm font-medium">
          제목, 요약, 태그 검색
        </label>
        <input
          id="site-search"
          type="search"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={state.status === "error"}
          placeholder="예: 타일맵, Unity"
          className="w-full rounded-lg border border-neutral-500 bg-white px-3 py-2 text-base placeholder:text-neutral-500 dark:border-neutral-500 dark:bg-neutral-900 dark:placeholder:text-neutral-400"
        />
      </div>

      <p
        aria-live="polite"
        className="text-sm text-neutral-600 dark:text-neutral-400"
      >
        {status}
      </p>

      {state.status === "ready" && hasQuery && results.length === 0 && (
        <EmptyState message="일치하는 글이 없습니다." />
      )}

      {GROUPS.map(({ type, label, base }) => {
        const items = results.filter((r) => r.type === type);
        if (items.length === 0) return null;
        return (
          <section key={type} aria-label={label} className="space-y-2">
            <h2 className="text-lg font-semibold">
              {label} ({items.length})
            </h2>
            <ul>
              {items.map((item) => (
                <li
                  key={`${item.type}-${item.slug}`}
                  className="border-b border-neutral-200 py-4 last:border-b-0 dark:border-neutral-800"
                >
                  <Link
                    href={`${base}/${item.slug}`}
                    className="group flex flex-col gap-1 sm:flex-row sm:gap-6"
                  >
                    <time
                      dateTime={item.publishedAt}
                      className="shrink-0 text-sm text-neutral-500 tabular-nums sm:w-28 dark:text-neutral-400"
                    >
                      {item.publishedAt.slice(0, 10)}
                    </time>
                    <div className="min-w-0">
                      <h3 className="font-medium break-words group-hover:underline">
                        {item.title}
                      </h3>
                      {item.summary && (
                        <p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                          {item.summary}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
