import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/types";

export default function ProjectCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/projects/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 transition hover:shadow-md dark:border-neutral-800"
    >
      <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-800">
        {post.cover ? (
          <Image
            src={post.cover}
            alt={post.title}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            unoptimized={!post.cover.startsWith("/")}
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-600 dark:text-neutral-400">
            No cover
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-semibold break-words group-hover:underline">
          {post.title}
        </h3>
        <p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
          {post.summary}
        </p>
        {post.genre.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
            {post.genre.map((g) => (
              <li
                key={g}
                className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              >
                {g}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
