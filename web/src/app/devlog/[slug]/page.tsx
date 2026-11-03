import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostBody from "@/components/PostBody";
import PostNav from "@/components/PostNav";
import TableOfContents from "@/components/TableOfContents";
import { getAdjacentPosts } from "@/lib/adjacent-posts";
import { estimateReadingMinutes } from "@/lib/reading-time";
import { extractToc } from "@/lib/toc";
import { getPostBody, getPostBySlug, getPosts } from "@/lib/notion";

export const revalidate = 300;

export async function generateStaticParams() {
  const devlogs = await getPosts("Devlog");
  return devlogs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/devlog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug("Devlog", slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      publishedTime: post.publishedAt || undefined,
    },
  };
}

export default async function DevlogDetailPage({
  params,
}: PageProps<"/devlog/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug("Devlog", slug);
  if (!post) notFound();

  const body = await getPostBody(post.id);
  const minutes = estimateReadingMinutes(body);
  const toc = extractToc(body);
  const { prev, next } = getAdjacentPosts(await getPosts("Devlog"), slug);

  return (
    <main className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold break-words">{post.title}</h1>
        <p className="text-sm text-neutral-500 tabular-nums dark:text-neutral-400">
          <time dateTime={post.publishedAt}>
            {post.publishedAt.slice(0, 10)}
          </time>
          <span aria-hidden> · </span>약 {minutes}분
        </p>
      </header>
      <TableOfContents items={toc} />
      <PostBody markdown={body} />
      <PostNav basePath="/devlog" prev={prev} next={next} />
    </main>
  );
}
