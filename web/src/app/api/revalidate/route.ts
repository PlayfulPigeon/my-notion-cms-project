import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";

// Notion 버튼/웹훅에서 호출하는 On-demand revalidation (ROADMAP 4단계, P4-2).
// POST /api/revalidate  +  헤더 `x-revalidate-secret: <REVALIDATE_SECRET>`
// (쿼리스트링은 로그에 남을 수 있어 헤더만 허용한다.)
// 홈/목록/상세 모두 Notion 데이터를 쓰므로 루트 레이아웃 하위 전체를 재검증한다.

function isAuthorized(request: Request): boolean {
  const secret = process.env.REVALIDATE_SECRET;
  const provided = request.headers.get("x-revalidate-secret");
  if (!secret || !provided) return false;

  const a = Buffer.from(secret);
  const b = Buffer.from(provided);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!process.env.REVALIDATE_SECRET) {
    console.error(
      "[revalidate] 환경변수 REVALIDATE_SECRET이 설정되지 않았습니다.",
    );
    return Response.json({ message: "Not configured" }, { status: 500 });
  }
  if (!isAuthorized(request)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  revalidatePath("/", "layout");
  return Response.json({ revalidated: true, at: new Date().toISOString() });
}
