import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import PostBody from "@/components/PostBody";
import { getPostBody, getPostBySlug, getPosts } from "@/lib/notion";

export const revalidate = 300;

export async function generateStaticParams() {
  const projects = await getPosts("Project");
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug("Project", slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      publishedTime: post.publishedAt || undefined,
      images: post.cover ? [post.cover] : undefined,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug("Project", slug);
  if (!post) notFound();

  const body = await getPostBody(post.id);
  const meta = [
    post.genre.join(", "),
    post.engineVersion ? `Unity ${post.engineVersion}` : "",
    post.publishedAt.slice(0, 10),
  ].filter(Boolean);

  return (
    <main className="space-y-8">
      <header className="space-y-4">
        {post.cover && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
            <Image
              src={post.cover}
              alt={post.title}
              fill
              preload
              sizes="(min-width: 1024px) 1024px, 100vw"
              unoptimized={!post.cover.startsWith("/")}
              className="object-cover"
            />
          </div>
        )}
        <h1 className="text-3xl font-bold break-words">{post.title}</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {meta.join(" · ")}
        </p>
        {(post.playUrl || post.repoUrl) && (
          <div className="flex flex-wrap gap-3">
            {post.playUrl && (
              <a
                href={post.playUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
              >
                Play
              </a>
            )}
            {post.repoUrl && (
              <a
                href={post.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                Repo
              </a>
            )}
          </div>
        )}
      </header>
      <PostBody markdown={body} />
    </main>
  );
}
