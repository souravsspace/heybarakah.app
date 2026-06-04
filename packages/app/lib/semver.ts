function parse(version: string): number[] {
  return version
    .trim()
    .split(".")
    .map((part) => {
      const n = Number.parseInt(part, 10);
      return Number.isNaN(n) ? 0 : n;
    });
}

/**
 * Returns true when `a` is strictly lower than `b` (semver-ish, numeric parts only).
 * Missing parts count as 0, so "0.9" < "0.9.2".
 */
export function semverLt(a: string, b: string): boolean {
  const pa = parse(a);
  const pb = parse(b);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x < y) {
      return true;
    }
    if (x > y) {
      return false;
    }
  }
  return false;
}
