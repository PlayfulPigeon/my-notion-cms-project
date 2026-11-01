import Link from "next/link";
import type { Post } from "@/lib/types";

export default function DevlogItem({ post }: { post: Post }) {
  return (
    <li className="border-b border-neutral-200 py-4 last:border-b-0 dark:border-neutral-800">
      <Link
        href={`/devlog/${post.slug}`}
        className="group flex flex-col gap-1 sm:flex-row sm:gap-6"
      >
        <time
          dateTime={post.publishedAt}
          className="shrink-0 text-sm text-neutral-500 tabular-nums sm:w-28 dark:text-neutral-400"
        >
          {post.publishedAt.slice(0, 10)}
        </time>
        <div className="min-w-0">
          <h3 className="font-medium break-words group-hover:underline">
            {post.title}
          </h3>
          {post.summary && (
            <p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
              {post.summary}
            </p>
          )}
        </div>
      </Link>
    </li>
  );
}
