import type { Metadata } from "next";
import SearchView from "@/components/SearchView";

export const metadata: Metadata = {
  title: "Search",
  description: "프로젝트와 개발 일지를 제목, 요약, 태그로 검색",
};

export default function SearchPage() {
  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold">Search</h1>
      <SearchView />
    </main>
  );
}
