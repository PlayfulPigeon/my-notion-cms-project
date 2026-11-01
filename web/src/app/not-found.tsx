import Link from "next/link";

export default function NotFound() {
  return (
    <main className="space-y-4 py-16 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-neutral-600 dark:text-neutral-400">
        페이지를 찾을 수 없습니다.
      </p>
      <Link href="/" className="inline-block text-sm underline">
        홈으로 돌아가기
      </Link>
    </main>
  );
}
