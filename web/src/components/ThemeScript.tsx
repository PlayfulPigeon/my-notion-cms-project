import { THEME_INIT_SCRIPT } from "@/lib/theme";

// 첫 페인트 전에 <html>의 dark 클래스를 설정한다. <head>에 둔다.
export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />;
}
