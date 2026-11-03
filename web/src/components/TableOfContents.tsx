import type { TocItem } from "@/lib/toc";

export const MIN_TOC_ITEMS = 3;

export default function TableOfContents({ items }: { items: TocItem[] }) {
  if (items.length < MIN_TOC_ITEMS) return null;
  return (
    <nav
      aria-label="목차"
      className="rounded-lg border border-neutral-200 px-4 py-3 text-sm dark:border-neutral-800"
    >
      <details open>
        <summary className="cursor-pointer font-medium">목차</summary>
        <ol className="mt-2 space-y-1">
          {items.map((item) => (
            <li key={item.id} className={item.depth === 3 ? "pl-4" : ""}>
              <a
                href={`#${item.id}`}
                className="text-neutral-600 hover:text-neutral-900 hover:underline dark:text-neutral-400 dark:hover:text-neutral-100"
              >
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      </details>
    </nav>
  );
}
