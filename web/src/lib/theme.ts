export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "theme";

const THEMES: readonly Theme[] = ["light", "dark", "system"];

// 저장값이 없거나 알 수 없는 값이면 "system"으로 취급한다.
export function parseTheme(raw: string | null): Theme {
  return THEMES.find((t) => t === raw) ?? "system";
}

export function resolveTheme(
  theme: Theme,
  systemPrefersDark: boolean,
): "light" | "dark" {
  if (theme === "system") return systemPrefersDark ? "dark" : "light";
  return theme;
}

export const THEME_COLORS = { light: "#ffffff", dark: "#0a0a0a" } as const;

// <head>에서 HTML 파싱 중 동기 실행되어 첫 페인트 전에 <html>의 dark 클래스를 정한다.
// 로직은 parseTheme/resolveTheme와 같아야 하며 theme.test.ts가 실제로 실행해 검증한다.
export const THEME_INIT_SCRIPT = `(function(){var t=null;try{t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})}catch(e){}var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)})()`;
