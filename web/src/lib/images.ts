import "server-only";

// Notion 파일 URL 만료 대응 (ROADMAP 4단계, P4-1)
// - Notion이 주는 업로드 파일 URL(S3 서명 URL)은 약 1시간 후 만료된다.
// - 빌드/재생성 시 이미지를 내려받아 web/public/notion-images/ 에 저장하고 정적 경로로 치환한다.
// - 파일명은 URL의 pathname(서명 쿼리 제외) 해시라서 같은 파일은 재사용된다.
// - 생성물이므로 git에서 제외한다 (web/.gitignore의 /public/notion-images/).
// - 다운로드는 하나씩 직렬 처리한다 (레이트 리밋/메모리 보호).
// - 실패하면(읽기 전용 파일시스템 등) 원본 URL을 그대로 돌려줘 페이지가 깨지지 않게 한다.
//   Vercel의 ISR 재생성 단계는 파일시스템이 읽기 전용이라 이 폴백이 쓰인다.
//   이미 빌드 시 저장된 파일이 있으면 그 경로를 재사용한다.
import { createHash } from "node:crypto";
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const PUBLIC_DIR = path.join(process.cwd(), "public", "notion-images");
const PUBLIC_PREFIX = "/notion-images";

const CONTENT_TYPE_EXT: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "image/avif": ".avif",
};

// 만료되는 Notion 호스팅 파일만 대상이다. 외부 URL(external)은 그대로 둔다.
export function isNotionHostedFile(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host.endsWith(".amazonaws.com") || host.endsWith("notion.so");
  } catch {
    return false;
  }
}

async function exists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function extOf(url: URL, contentType: string | null): string {
  const fromPath = path.extname(url.pathname).toLowerCase();
  if (/^\.(png|jpe?g|gif|webp|svg|avif)$/.test(fromPath)) return fromPath;
  const type = contentType?.split(";")[0].trim().toLowerCase() ?? "";
  return CONTENT_TYPE_EXT[type] ?? ".bin";
}

// 직렬 큐: 이전 작업이 끝난 뒤에 다음 다운로드를 시작한다.
let queue: Promise<unknown> = Promise.resolve();
const inflight = new Map<string, Promise<string>>();

async function download(sourceUrl: string): Promise<string> {
  const url = new URL(sourceUrl);
  const hash = createHash("sha256")
    .update(url.origin + url.pathname)
    .digest("hex")
    .slice(0, 16);

  // 이미 저장된 파일(확장자 후보)이 있으면 재사용한다.
  const knownExts = [...new Set(Object.values(CONTENT_TYPE_EXT)), ".jpeg"];
  for (const ext of knownExts) {
    if (await exists(path.join(PUBLIC_DIR, hash + ext))) {
      return `${PUBLIC_PREFIX}/${hash}${ext}`;
    }
  }

  try {
    const res = await fetch(sourceUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ext = extOf(url, res.headers.get("content-type"));
    const file = `${hash}${ext}`;
    await mkdir(PUBLIC_DIR, { recursive: true });
    await writeFile(
      path.join(PUBLIC_DIR, file),
      Buffer.from(await res.arrayBuffer()),
    );
    return `${PUBLIC_PREFIX}/${file}`;
  } catch (error) {
    console.warn(
      `[images] 이미지 저장 실패, 원본 URL 사용: ${url.origin}${url.pathname} (${
        error instanceof Error ? error.message : String(error)
      })`,
    );
    return sourceUrl;
  }
}

// Notion 호스팅 이미지면 정적 경로로 치환해 돌려준다. 아니면 그대로 돌려준다.
export function localizeImage(sourceUrl: string): Promise<string> {
  if (!isNotionHostedFile(sourceUrl)) return Promise.resolve(sourceUrl);

  const key = (() => {
    const u = new URL(sourceUrl);
    return u.origin + u.pathname;
  })();
  const pending = inflight.get(key);
  if (pending) return pending;

  const task = queue.then(() => download(sourceUrl));
  queue = task.catch(() => undefined);
  inflight.set(key, task);
  return task;
}

const MARKDOWN_IMAGE = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;

// Markdown 본문의 ![alt](url) 중 Notion 호스팅 이미지를 정적 경로로 치환한다.
export async function localizeMarkdownImages(
  markdown: string,
): Promise<string> {
  const matches = [...markdown.matchAll(MARKDOWN_IMAGE)];
  if (matches.length === 0) return markdown;

  const replacements = new Map<string, string>();
  for (const [, , url] of matches) {
    if (!replacements.has(url)) {
      replacements.set(url, await localizeImage(url));
    }
  }
  return markdown.replace(
    MARKDOWN_IMAGE,
    (_all, alt: string, url: string) =>
      `![${alt}](${replacements.get(url) ?? url})`,
  );
}
