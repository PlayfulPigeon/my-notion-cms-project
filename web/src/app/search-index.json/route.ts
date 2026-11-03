import { getPosts } from "@/lib/notion";
import { buildSearchIndex } from "@/lib/search";

// 검색 인덱스: 기존 getPosts() 결과에서 파생해 Notion 추가 조회를 만들지 않는다.
// Draft 제외는 getPosts의 Status = Published 필터에 의존한다.
export const revalidate = 300;

export async function GET() {
  const posts = await getPosts();
  return Response.json(buildSearchIndex(posts));
}
