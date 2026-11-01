import { getPosts } from "@/lib/notion";

// RSS 피드 (ROADMAP 4단계, P4-4): Published 글을 최신순으로 출력한다.
// 사이트 주소는 SITE_URL(서버 전용) → Vercel 프로덕션 도메인 → localhost 순으로 정한다.
export const revalidate = 300;

function siteUrl(): string {
  const explicit = process.env.SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const base = siteUrl();
  const posts = await getPosts();

  const items = posts
    .map((post) => {
      const path = post.type === "Project" ? "projects" : "devlog";
      const link = `${base}/${path}/${encodeURIComponent(post.slug)}`;
      const date = new Date(post.publishedAt);
      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        Number.isNaN(date.getTime())
          ? ""
          : `      <pubDate>${date.toUTCString()}</pubDate>`,
        `      <description>${escapeXml(post.summary)}</description>`,
        ...post.tags.map((t) => `      <category>${escapeXml(t)}</category>`),
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Unity Devlog &amp; Portfolio</title>
    <link>${escapeXml(base)}</link>
    <description>만든 게임과 개발 과정을 기록하는 유니티 개발 일지 / 포트폴리오</description>
    <language>ko</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
