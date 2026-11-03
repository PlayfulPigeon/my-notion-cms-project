import Link from "next/link";

type NavPost = { slug: string; title: string };

export default function PostNav({
  basePath,
  prev,
  next,
}: {
  basePath: "/projects" | "/devlog";
  prev: NavPost | null;
  next: NavPost | null;
}) {
  if (!prev && !next) return null;
  const linkClass =
    "block rounded-lg border border-neutral-200 px-4 py-3 hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-800";
  const labelClass = "text-xs text-neutral-600 dark:text-neutral-400";
  return (
    <nav
      aria-label="이전/다음 글"
      className="grid gap-3 border-t border-neutral-200 pt-6 sm:grid-cols-2 dark:border-neutral-800"
    >
      {prev ? (
        <Link
          href={`${basePath}/${prev.slug}`}
          className={linkClass}
          rel="prev"
        >
          <span className={labelClass}>← 이전 글</span>
          <span className="mt-1 block font-medium break-words">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span aria-hidden className="hidden sm:block" />
      )}
      {next && (
        <Link
          href={`${basePath}/${next.slug}`}
          className={`${linkClass} sm:text-right`}
          rel="next"
        >
          <span className={labelClass}>다음 글 →</span>
          <span className="mt-1 block font-medium break-words">
            {next.title}
          </span>
        </Link>
      )}
    </nav>
  );
}
