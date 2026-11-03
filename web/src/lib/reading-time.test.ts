import { describe, expect, it } from "vitest";
import {
  ENGLISH_WORDS_PER_MINUTE,
  estimateReadingMinutes,
  KOREAN_CHARS_PER_MINUTE,
} from "@/lib/reading-time";

describe("estimateReadingMinutes", () => {
  it("빈 문자열은 최소 1분", () => {
    expect(estimateReadingMinutes("")).toBe(1);
  });

  it("한글만: 글자 수 기준으로 올림", () => {
    expect(estimateReadingMinutes("가".repeat(KOREAN_CHARS_PER_MINUTE))).toBe(
      1,
    );
    expect(
      estimateReadingMinutes("가".repeat(KOREAN_CHARS_PER_MINUTE + 1)),
    ).toBe(2);
    expect(
      estimateReadingMinutes("가".repeat(KOREAN_CHARS_PER_MINUTE * 3)),
    ).toBe(3);
  });

  it("영문만: 단어 수 기준", () => {
    const words = (n: number) => Array(n).fill("word").join(" ");
    expect(estimateReadingMinutes(words(ENGLISH_WORDS_PER_MINUTE))).toBe(1);
    expect(estimateReadingMinutes(words(ENGLISH_WORDS_PER_MINUTE + 1))).toBe(2);
  });

  it("혼합: 두 값을 합산한다", () => {
    const md =
      "가".repeat(KOREAN_CHARS_PER_MINUTE) +
      " " +
      Array(ENGLISH_WORDS_PER_MINUTE).fill("a").join(" ");
    expect(estimateReadingMinutes(md)).toBe(2);
  });

  it("코드 블록만 있으면 1분", () => {
    const code = "```cs\n" + "int x = 1; ".repeat(2000) + "\n```";
    expect(estimateReadingMinutes(code)).toBe(1);
  });

  it("닫히지 않은 코드 펜스 이후도 제외한다", () => {
    expect(estimateReadingMinutes("```cs\n" + "word ".repeat(5000))).toBe(1);
  });

  it("이미지와 링크 URL은 세지 않고 링크 텍스트는 센다", () => {
    const url = "https://example.com/" + "a".repeat(5000);
    expect(estimateReadingMinutes(`![img](${url})`)).toBe(1);
    expect(estimateReadingMinutes(`[${"가".repeat(501)}](${url})`)).toBe(2);
  });
});
