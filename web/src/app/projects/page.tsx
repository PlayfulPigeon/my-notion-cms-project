import type { Metadata } from "next";
import FilterableList from "@/components/FilterableList";
import { getPosts } from "@/lib/notion";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Projects",
  description: "만든 게임과 프로젝트 목록",
};

export default async function ProjectsPage() {
  const projects = await getPosts("Project");

  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold">Projects</h1>
      <FilterableList
        posts={projects}
        variant="project"
        emptyMessage="아직 등록된 프로젝트가 없습니다."
      />
    </main>
  );
}
