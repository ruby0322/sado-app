export function cn(...inputs: (string | undefined | false | null)[]) {
  return inputs.filter(Boolean).join(" ");
}

// Rules of thumb for human-friendly colors:
// - Use HSL: hue varies (0-360), saturation 65-85% (vibrant, not gray), lightness 45-55% (readable, not muddy/neon)
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function generateRandomColor(excludeColors: string[] = []): string {
  const exclude = new Set(excludeColors.map((c) => c.toLowerCase()));
  let color: string;
  do {
    const h = Math.floor(Math.random() * 360); // full spectrum
    const s = 72 + Math.floor(Math.random() * 13); // 72-84%: rich saturation
    const l = 52 + Math.floor(Math.random() * 5); // 48-52%: sweet spot lightness
    color = hslToHex(h, s, l);
  } while (exclude.has(color.toLowerCase()));
  return color;
}
