"use client";

import { useMemo, useState } from "react";
import DevlogItem from "@/components/DevlogItem";
import EmptyState from "@/components/EmptyState";
import ProjectCard from "@/components/ProjectCard";
import type { Post } from "@/lib/types";

// 장르/태그/엔진 버전 필터 (ROADMAP 4단계, P4-4)
// 페이지를 정적(SSG/ISR)으로 유지하려고 searchParams 대신 클라이언트에서 거른다.
// props로 받는 Post는 공개 데이터뿐이며 Notion 호출은 서버 컴포넌트에서만 한다.

type FilterKey = "genre" | "tag" | "engine";
type Selected = Record<FilterKey, string | null>;

const KEYS: FilterKey[] = ["genre", "tag", "engine"];

const LABELS: Record<FilterKey, string> = {
  genre: "장르",
  tag: "태그",
  engine: "엔진 버전",
};

const EMPTY_SELECTION: Selected = { genre: null, tag: null, engine: null };

function valuesOf(post: Post, key: FilterKey): string[] {
  if (key === "genre") return post.genre;
  if (key === "tag") return post.tags;
  return post.engineVersion ? [post.engineVersion] : [];
}

function chipClass(active: boolean): string {
  return [
    "rounded-full border px-3 py-1 text-xs transition",
    active
      ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
      : "border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800",
  ].join(" ");
}

export default function FilterableList({
  posts,
  variant,
  emptyMessage,
}: {
  posts: Post[];
  variant: "project" | "devlog";
  emptyMessage: string;
}) {
  const [selected, setSelected] = useState<Selected>(EMPTY_SELECTION);

  const options = useMemo(() => {
    const result = {} as Record<FilterKey, string[]>;
    for (const key of KEYS) {
      result[key] = [...new Set(posts.flatMap((p) => valuesOf(p, key)))].sort(
        (a, b) => a.localeCompare(b, undefined, { numeric: true }),
      );
    }
    return result;
  }, [posts]);

  const filtered = posts.filter((post) =>
    KEYS.every((key) => {
      const value = selected[key];
      return value === null || valuesOf(post, key).includes(value);
    }),
  );

  const groups = KEYS.filter((key) => options[key].length > 0);
  const hasSelection = KEYS.some((key) => selected[key] !== null);

  if (posts.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <div className="space-y-6">
      {groups.length > 0 && (
        <div className="space-y-3">
          {groups.map((key) => (
            <div
              key={key}
              role="group"
              aria-label={LABELS[key]}
              className="flex flex-wrap items-center gap-2"
            >
              <span className="w-20 shrink-0 text-sm text-neutral-500 dark:text-neutral-400">
                {LABELS[key]}
              </span>
              {options[key].map((value) => {
                const active = selected[key] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    className={chipClass(active)}
                    onClick={() =>
                      setSelected((prev) => ({
                        ...prev,
                        [key]: active ? null : value,
                      }))
                    }
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          ))}
          {hasSelection && (
            <button
              type="button"
              className="text-sm underline"
              onClick={() => setSelected(EMPTY_SELECTION)}
            >
              필터 초기화
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState message="조건에 맞는 항목이 없습니다." />
      ) : variant === "project" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {filtered.map((post) => (
            <ProjectCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <ul>
          {filtered.map((post) => (
            <DevlogItem key={post.id} post={post} />
          ))}
        </ul>
      )}
    </div>
  );
}
