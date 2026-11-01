// TODO: 실제 GitHub / 이메일 주소로 교체한다.
const GITHUB_URL = "https://github.com/";
const EMAIL = "hello@example.com";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 text-sm text-neutral-500 dark:text-neutral-400">
        <span>© {new Date().getFullYear()} Unity Devlog</span>
        <div className="flex gap-4">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            GitHub
          </a>
          <a
            href={`mailto:${EMAIL}`}
            className="hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
