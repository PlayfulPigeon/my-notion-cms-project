import { describe, expect, it } from "vitest";
import { parseTheme, resolveTheme, THEME_INIT_SCRIPT } from "@/lib/theme";

describe("parseTheme", () => {
  it.each(["light", "dark", "system"] as const)("%s를 그대로 돌려준다", (v) => {
    expect(parseTheme(v)).toBe(v);
  });

  it.each([null, "", "Dark", "blue", " light"])(
    "잘못된 저장값 %j는 system",
    (v) => {
      expect(parseTheme(v)).toBe("system");
    },
  );
});

describe("resolveTheme", () => {
  it("light/dark는 시스템 설정과 무관하다", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("system은 시스템 설정을 따른다", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
});

describe("THEME_INIT_SCRIPT", () => {
  function run(opts: {
    stored?: string | null;
    systemDark?: boolean;
    storageThrows?: boolean;
  }): boolean {
    const classes = new Set<string>();
    const sandbox = {
      localStorage: {
        getItem: () => {
          if (opts.storageThrows) throw new Error("blocked");
          return opts.stored ?? null;
        },
      },
      window: {
        matchMedia: () => ({ matches: opts.systemDark ?? false }),
      },
      document: {
        documentElement: {
          classList: {
            toggle: (name: string, force: boolean) => {
              if (force) classes.add(name);
              else classes.delete(name);
            },
          },
        },
      },
    };
    new Function("localStorage", "window", "document", THEME_INIT_SCRIPT)(
      sandbox.localStorage,
      sandbox.window,
      sandbox.document,
    );
    return classes.has("dark");
  }

  it("저장 dark면 시스템이 라이트여도 dark", () => {
    expect(run({ stored: "dark", systemDark: false })).toBe(true);
  });
  it("저장 light면 시스템이 다크여도 light", () => {
    expect(run({ stored: "light", systemDark: true })).toBe(false);
  });
  it("저장 없음 + 시스템 다크면 dark", () => {
    expect(run({ stored: null, systemDark: true })).toBe(true);
  });
  it("저장 없음 + 시스템 라이트면 light", () => {
    expect(run({ stored: null, systemDark: false })).toBe(false);
  });
  it("localStorage 예외 시 시스템 설정을 따른다", () => {
    expect(run({ storageThrows: true, systemDark: true })).toBe(true);
    expect(run({ storageThrows: true, systemDark: false })).toBe(false);
  });
});
