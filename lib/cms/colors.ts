const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function isValidHexColor(value: string): boolean {
  return HEX_RE.test(value.trim());
}

export function normalizeHexColor(value: string): string | null {
  const raw = value.trim();
  if (!HEX_RE.test(raw)) return null;
  if (raw.length === 4) {
    const [, r, g, b] = raw;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return raw.toLowerCase();
}

export function colorsToCssVars(colors: {
  background: string;
  foreground: string;
  lime: string;
  limeDark: string;
  navy: string;
  navyDeep: string;
  slate: string;
  muted: string;
}): string {
  return [
    `--background: ${colors.background}`,
    `--foreground: ${colors.foreground}`,
    `--brand-lime: ${colors.lime}`,
    `--brand-lime-dark: ${colors.limeDark}`,
    `--brand-navy: ${colors.navy}`,
    `--brand-navy-deep: ${colors.navyDeep}`,
    `--brand-slate: ${colors.slate}`,
    `--brand-muted: ${colors.muted}`,
  ].join("; ");
}
