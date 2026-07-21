const fs = require("node:fs");
const path = require("node:path");
const { describe, expect, test } = require("bun:test");
const {
  applySwiftReplacements,
  buildSwiftReplacements,
  dynamicColorExpr,
  escapeSwiftString,
  hexToRgb,
  renderCountSuffixSwift,
  uiColorLiteral,
} = require("./swift-substitutions");

const APP_GROUP = "group.com.souravsspace.Barakah.shield";

describe("escapeSwiftString", () => {
  test("escapes quotes, backslashes, and newlines for a Swift literal", () => {
    expect(escapeSwiftString('say "hi"')).toBe('say \\"hi\\"');
    expect(escapeSwiftString("a\\b")).toBe("a\\\\b");
    expect(escapeSwiftString("a\nb\r")).toBe("a\\nb\\r");
  });

  test("coerces non-strings", () => {
    expect(escapeSwiftString(42)).toBe("42");
  });
});

describe("hexToRgb", () => {
  test("parses 6-digit hex to normalized rgb", () => {
    expect(hexToRgb("#ffffff")).toEqual({ r: "1.000", g: "1.000", b: "1.000" });
    expect(hexToRgb("#000000")).toEqual({ r: "0.000", g: "0.000", b: "0.000" });
  });

  test("expands 3-digit shorthand", () => {
    expect(hexToRgb("#fff")).toEqual(hexToRgb("#ffffff"));
  });

  test("throws on malformed hex", () => {
    expect(() => hexToRgb("#12")).toThrow(/invalid hex color/);
    expect(() => hexToRgb("nope")).toThrow(/invalid hex color/);
  });
});

describe("color expressions", () => {
  test("uiColorLiteral emits a UIColor init", () => {
    expect(uiColorLiteral("#fb6107")).toMatch(
      /^UIColor\(red: [\d.]+, green: [\d.]+, blue: [\d.]+, alpha: 1\.0\)$/
    );
  });

  test("dynamicColorExpr is static when no dark color", () => {
    expect(dynamicColorExpr("#111111", null)).not.toContain("trait");
  });

  test("dynamicColorExpr branches on trait when dark color given", () => {
    const expr = dynamicColorExpr("#111111", "#eeeeee");
    expect(expr).toContain("userInterfaceStyle == .dark");
  });
});

describe("renderCountSuffixSwift", () => {
  test("interpolates {count} as a Swift interpolation", () => {
    expect(renderCountSuffixSwift(" {count} apps")).toBe('" \\(count) apps"');
  });

  test("empty template yields an empty Swift literal", () => {
    expect(renderCountSuffixSwift("")).toBe('""');
  });
});

describe("buildSwiftReplacements", () => {
  test("substitutes the app group verbatim", () => {
    const r = buildSwiftReplacements(APP_GROUP);
    expect(r.APP_GROUP_PLACEHOLDER).toBe(APP_GROUP);
  });

  test("applies user shield config over defaults", () => {
    const r = buildSwiftReplacements(APP_GROUP, {
      ios: { shield: { title: "Quiet at salah." } },
    });
    expect(r.SHIELD_TITLE_PLACEHOLDER).toBe("Quiet at salah.");
  });

  test("escapes a shield title containing a quote", () => {
    const r = buildSwiftReplacements(APP_GROUP, {
      ios: { shield: { title: 'The "quiet" hour' } },
    });
    expect(r.SHIELD_TITLE_PLACEHOLDER).toBe('The \\"quiet\\" hour');
  });

  test("every replacement value is a defined string (no undefined leaking into Swift)", () => {
    const r = buildSwiftReplacements(APP_GROUP);
    for (const [key, value] of Object.entries(r)) {
      expect(typeof value, `${key} should be a string`).toBe("string");
      expect(value).not.toContain("undefined");
    }
  });
});

describe("template substitution (integration)", () => {
  const targetsDir = path.join(__dirname, "..", "..", "targets");

  function readTemplateSwiftFiles() {
    const files = [];
    for (const dir of fs.readdirSync(targetsDir)) {
      const dirPath = path.join(targetsDir, dir);
      if (!fs.statSync(dirPath).isDirectory()) {
        continue;
      }
      for (const file of fs.readdirSync(dirPath)) {
        if (file.endsWith(".swift")) {
          files.push(path.join(dirPath, file));
        }
      }
    }
    return files;
  }

  test("template targets exist to substitute", () => {
    expect(readTemplateSwiftFiles().length).toBeGreaterThan(0);
  });

  test("no PLACEHOLDER token survives substitution in any target Swift file", () => {
    const replacements = buildSwiftReplacements(APP_GROUP, {
      ios: { shield: { title: "Quiet at salah." } },
    });
    for (const filePath of readTemplateSwiftFiles()) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const substituted = applySwiftReplacements(raw, replacements);
      const leftover = substituted.match(/[A-Z0-9_]*PLACEHOLDER/g);
      expect(leftover, `${filePath} left unsubstituted: ${leftover}`).toBeNull();
    }
  });

  test("substituted app-group id lands in the extension Swift", () => {
    const replacements = buildSwiftReplacements(APP_GROUP);
    const files = readTemplateSwiftFiles();
    const withGroup = files.filter((f) => {
      const raw = fs.readFileSync(f, "utf-8");
      return raw.includes("APP_GROUP_PLACEHOLDER");
    });
    expect(withGroup.length).toBeGreaterThan(0);
    for (const f of withGroup) {
      const out = applySwiftReplacements(fs.readFileSync(f, "utf-8"), replacements);
      expect(out).toContain(APP_GROUP);
    }
  });
});
