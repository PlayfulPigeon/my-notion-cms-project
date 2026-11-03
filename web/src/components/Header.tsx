import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const NAV = [
  { href: "/projects", label: "Projects" },
  { href: "/devlog", label: "Devlog" },
  { href: "/search", label: "Search" },
] as const;

export default function Header() {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Unity Devlog
        </Link>
        <nav aria-label="주 메뉴">
          <ul className="flex gap-6 text-sm font-medium">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
