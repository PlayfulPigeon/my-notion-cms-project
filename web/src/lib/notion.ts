import "server-only";

// Notion API 결정 사항 (P1-1 확정)
// - @notionhq/client 5.28.0 (버전 고정, ^ 없음)
// - 이 버전의 Client에는 databases.query가 없다. 조회는 dataSources.query({ data_source_id })를 쓴다.
//   NOTION_DATABASE_ID로 databases.retrieve를 호출해 data_sources[0].id를 얻은 뒤 query한다.
// - 서버 전용: 토큰은 NOTION_TOKEN 환경변수(.env.local)로만 관리한다.
import { cache } from "react";
import { Client, isFullPage } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { localizeImage, localizeMarkdownImages } from "./images";
import type { Post } from "./types";

type PostType = Post["type"];
type Property = PageObjectResponse["properties"][string];
type PropertyOf<T extends Property["type"]> = Extract<Property, { type: T }>;

function requireEnv(name: "NOTION_TOKEN" | "NOTION_DATABASE_ID"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `환경변수 ${name}이(가) 없습니다. web/.env.local에 설정하세요. (.env.example 참고)`,
    );
  }
  return value;
}

const getClient = cache(() => new Client({ auth: requireEnv("NOTION_TOKEN") }));

const getDataSourceId = cache(async (): Promise<string> => {
  const database = await getClient().databases.retrieve({
    database_id: requireEnv("NOTION_DATABASE_ID"),
  });
  if (!("data_sources" in database) || database.data_sources.length === 0) {
    throw new Error("데이터베이스에서 data source를 찾을 수 없습니다.");
  }
  return database.data_sources[0].id;
});

// --- 속성 읽기 헬퍼 (빈 값은 안전한 기본값으로) ---

function prop<T extends Property["type"]>(
  page: PageObjectResponse,
  name: string,
  type: T,
): PropertyOf<T> | undefined {
  const p = page.properties[name];
  return p && p.type === type ? (p as PropertyOf<T>) : undefined;
}

const plain = (items: { plain_text: string }[] | undefined): string =>
  (items ?? []).map((t) => t.plain_text).join("");

function readCover(page: PageObjectResponse): string | undefined {
  const file = prop(page, "Cover", "files")?.files[0];
  if (!file) return undefined;
  return file.type === "external" ? file.external.url : file.file.url;
}

function mapPage(page: PageObjectResponse): Post | null {
  const type = prop(page, "Type", "select")?.select?.name;
  if (type !== "Devlog" && type !== "Project") return null;

  return {
    id: page.id,
    slug: plain(prop(page, "Slug", "rich_text")?.rich_text).trim(),
    title: plain(prop(page, "Title", "title")?.title),
    type,
    summary: plain(prop(page, "Summary", "rich_text")?.rich_text),
    publishedAt: prop(page, "Published At", "date")?.date?.start ?? "",
    cover: readCover(page),
    genre:
      prop(page, "Genre", "multi_select")?.multi_select.map((s) => s.name) ??
      [],
    engineVersion: prop(page, "Engine Version", "select")?.select?.name,
    tags:
      prop(page, "Tags", "multi_select")?.multi_select.map((s) => s.name) ?? [],
    playUrl: prop(page, "Play URL", "url")?.url ?? undefined,
    repoUrl: prop(page, "Repo URL", "url")?.url ?? undefined,
  };
}

// Published 전체를 한 번만 조회한다(요청 단위 캐시). 페이지네이션은 순차 처리해 레이트 리밋을 피한다.
const fetchAllPosts = cache(async (): Promise<Post[]> => {
  const client = getClient();
  const dataSourceId = await getDataSourceId();

  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined;
  do {
    const res = await client.dataSources.query({
      data_source_id: dataSourceId,
      filter: { property: "Status", select: { equals: "Published" } },
      sorts: [{ property: "Published At", direction: "descending" }],
      start_cursor: cursor,
    });
    for (const r of res.results) {
      if (isFullPage(r)) pages.push(r);
    }
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);

  const seen = new Set<string>();
  const posts: Post[] = [];
  for (const page of pages) {
    const post = mapPage(page);
    if (!post) {
      console.warn(`[notion] Type이 올바르지 않아 건너뜀: ${page.id}`);
      continue;
    }
    if (!post.slug) {
      console.warn(
        `[notion] Slug가 비어 있어 건너뜀: "${post.title}" (${page.id})`,
      );
      continue;
    }
    if (seen.has(post.slug)) {
      console.warn(
        `[notion] Slug 중복으로 건너뜀: "${post.slug}" (${page.id})`,
      );
      continue;
    }
    seen.add(post.slug);
    // 만료되는 Notion 파일 URL을 정적 자산으로 치환 (직렬 처리, 실패 시 원본 유지)
    if (post.cover) post.cover = await localizeImage(post.cover);
    posts.push(post);
  }
  return posts;
});

export async function getPosts(type?: PostType): Promise<Post[]> {
  const posts = await fetchAllPosts();
  return type ? posts.filter((p) => p.type === type) : posts;
}

export async function getPostBySlug(
  type: PostType,
  slug: string,
): Promise<Post | null> {
  const posts = await getPosts(type);
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function getPostBody(id: string): Promise<string> {
  const n2m = new NotionToMarkdown({ notionClient: getClient() });
  const blocks = await n2m.pageToMarkdown(id);
  const markdown = n2m.toMarkdownString(blocks).parent ?? "";
  return localizeMarkdownImages(markdown);
}
