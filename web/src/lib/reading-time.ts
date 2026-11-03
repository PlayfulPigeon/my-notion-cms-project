// 속도 상수는 추정값이다 (로드맵 열린 질문 6).
export const KOREAN_CHARS_PER_MINUTE = 500;
export const ENGLISH_WORDS_PER_MINUTE = 200;

// 읽는 데 필요 없는 마크다운 요소를 제거한다. 코드 블록은 읽는 시간에서 제외한다.
function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?(```|$)/g, " ")
    .replace(/~~~[\s\S]*?(~~~|$)/g, " ")
    .replace(/`[^`\n]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/<[^>]+>/g, " ");
}

export function estimateReadingMinutes(markdown: string): number {
  const text = toPlainText(markdown);
  const hangul = (text.match(/[가-힣]/g) ?? []).length;
  const words = (text.replace(/[가-힣]/g, " ").match(/[A-Za-z0-9]+/g) ?? [])
    .length;
  const minutes =
    hangul / KOREAN_CHARS_PER_MINUTE + words / ENGLISH_WORDS_PER_MINUTE;
  return Math.max(1, Math.ceil(minutes));
}
