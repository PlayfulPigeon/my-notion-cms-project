import Link from "next/link";
import DevlogItem from "@/components/DevlogItem";
import EmptyState from "@/components/EmptyState";
import ProjectCard from "@/components/ProjectCard";
import { getPosts } from "@/lib/notion";

export const revalidate = 300;

export default async function Home() {
  const [projects, devlogs] = await Promise.all([
    getPosts("Project"),
    getPosts("Devlog"),
  ]);
  const recentProjects = projects.slice(0, 3);
  const recentDevlogs = devlogs.slice(0, 5);

  return (
    <main className="space-y-12">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">안녕하세요, 유니티 개발자입니다.</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          만든 게임과 개발 과정을 기록합니다.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-bold">Projects</h2>
          <Link href="/projects" className="text-sm hover:underline">
            전체 보기
          </Link>
        </div>
        {recentProjects.length === 0 ? (
          <EmptyState message="아직 등록된 프로젝트가 없습니다." />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {recentProjects.map((post) => (
              <ProjectCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-bold">Devlog</h2>
          <Link href="/devlog" className="text-sm hover:underline">
            전체 보기
          </Link>
        </div>
        {recentDevlogs.length === 0 ? (
          <EmptyState message="아직 등록된 일지가 없습니다." />
        ) : (
          <ul>
            {recentDevlogs.map((post) => (
              <DevlogItem key={post.id} post={post} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
