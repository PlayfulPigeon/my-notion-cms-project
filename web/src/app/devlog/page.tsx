import type { Metadata } from "next";
import FilterableList from "@/components/FilterableList";
import { getPosts } from "@/lib/notion";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Devlog",
  description: "개발 과정을 기록한 일지 목록",
};

export default async function DevlogPage() {
  const devlogs = await getPosts("Devlog");

  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold">Devlog</h1>
      <FilterableList
        posts={devlogs}
        variant="devlog"
        emptyMessage="아직 등록된 일지가 없습니다."
      />
    </main>
  );
}
