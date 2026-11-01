export default function EmptyState({
  message = "아직 등록된 글이 없습니다.",
}: {
  message?: string;
}) {
  return (
    <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-12 text-center text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
      {message}
    </p>
  );
}
