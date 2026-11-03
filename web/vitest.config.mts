import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// src/lib의 순수 함수만 테스트한다. async 서버 컴포넌트는 Vitest가 지원하지 않는다.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Shiki 첫 초기화(문법 로드)가 느려 기본 5초를 넘길 수 있다.
    testTimeout: 30_000,
  },
});
