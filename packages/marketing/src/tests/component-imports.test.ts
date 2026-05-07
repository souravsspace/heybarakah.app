import { $ } from "bun";
import { describe, expect, test } from "bun:test";

const astroFiles = await $`find packages/marketing/src -name '*.astro'`.text();

const getFrontmatter = (source: string) => {
  if (!source.startsWith("---")) {
    return "";
  }

  const end = source.indexOf("\n---", 3);
  return end === -1 ? "" : source.slice(3, end);
};

const getTemplate = (source: string) => {
  if (!source.startsWith("---")) {
    return source;
  }

  const end = source.indexOf("\n---", 3);
  return end === -1 ? source : source.slice(end + 4);
};

const removeScripts = (template: string) =>
  template.replaceAll(/<script\b[\s\S]*?<\/script>/g, "");

const getImportedNames = (frontmatter: string) => {
  const names = new Set<string>();

  for (const match of frontmatter.matchAll(/import\s+(?:type\s+)?([^;]+?)\s+from\s+["'][^"']+["']/g)) {
    const importClause = match[1]?.trim();

    if (!importClause) {
      continue;
    }

    const defaultImport = importClause.match(/^([A-Z][A-Za-z0-9_]*)\b/);
    if (defaultImport?.[1]) {
      names.add(defaultImport[1]);
    }

    const namedImports = importClause.match(/\{([^}]+)\}/)?.[1];
    if (namedImports) {
      for (const part of namedImports.split(",")) {
        const importedName = part.trim().split(/\s+as\s+/).at(-1)?.trim();
        if (importedName && /^[A-Z]/.test(importedName)) {
          names.add(importedName);
        }
      }
    }
  }

  return names;
};

describe("Astro frontmatter", () => {
  for (const file of astroFiles.trim().split("\n")) {
    test(`${file} keeps template data variables renderable`, async () => {
      const source = await Bun.file(file).text();

      expect(getFrontmatter(source)).not.toMatch(/\bconst\s+_[a-zA-Z]/);
    });
  }
});

describe("Astro component imports", () => {
  for (const file of astroFiles.trim().split("\n")) {
    test(`${file} imports every component it renders`, async () => {
      const source = await Bun.file(file).text();
      const importedNames = getImportedNames(getFrontmatter(source));
      const renderedComponents = new Set(
        [
          ...removeScripts(getTemplate(source)).matchAll(
            /<([A-Z][A-Za-z0-9_]*)\b/g
          ),
        ].map(([, name]) => name)
      );

      expect(
        [...renderedComponents].filter((name) => !importedNames.has(name))
      ).toEqual([]);
    });
  }
});
