"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import {
  parseTheme,
  resolveTheme,
  THEME_COLORS,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/lib/theme";

const OPTIONS: { value: Theme; label: string; text: string }[] = [
  { value: "light", label: "라이트 모드", text: "Light" },
  { value: "dark", label: "다크 모드", text: "Dark" },
  { value: "system", label: "시스템 설정 따르기", text: "System" },
];

const DARK_QUERY = "(prefers-color-scheme: dark)";

function readStored(): Theme {
  try {
    return parseTheme(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
}

function applyTheme(theme: Theme) {
  const resolved = resolveTheme(theme, window.matchMedia(DARK_QUERY).matches);
  document.documentElement.classList.toggle("dark", resolved === "dark");

  // viewport.themeColor의 media 쿼리는 시스템 설정만 따르므로 수동 선택일 때 보정한다.
  document
    .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    .forEach((meta) => {
      const media = meta.getAttribute("media") ?? "";
      const own = media.includes("dark") ? "dark" : "light";
      meta.content = THEME_COLORS[theme === "system" ? own : resolved];
    });
}

export default function ThemeToggle() {
  // 서버 렌더와 같은 초기값("system")으로 시작하고, 마운트 후 저장값을 반영한다.
  const [theme, setTheme] = useState<Theme>("system");

  // 마운트 시 저장값 동기화. 개발 모드 Strict Mode 재마운트가 <html> 클래스를 지우는 경우도 복구한다.
  useLayoutEffect(() => {
    const stored = readStored();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(stored);
    applyTheme(stored);
  }, []);

  // System 선택일 때만 OS 설정 변경을 구독한다.
  useEffect(() => {
    if (theme !== "system") return;
    const mql = window.matchMedia(DARK_QUERY);
    const onChange = () => applyTheme("system");
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [theme]);

  // 다른 탭의 변경 동기화
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_STORAGE_KEY) return;
      const next = parseTheme(e.newValue);
      setTheme(next);
      applyTheme(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function select(next: Theme) {
    setTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // 저장 불가(사생활 보호 모드 등): 이번 방문에만 적용된다.
    }
    applyTheme(next);
  }

  return (
    <div
      role="group"
      aria-label="테마 선택"
      className="flex rounded-md border border-neutral-300 p-0.5 text-xs dark:border-neutral-700"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-label={o.label}
          aria-pressed={theme === o.value}
          onClick={() => select(o.value)}
          className={`rounded px-2 py-1 font-medium ${
            theme === o.value
              ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
              : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          }`}
        >
          {o.text}
        </button>
      ))}
    </div>
  );
}
