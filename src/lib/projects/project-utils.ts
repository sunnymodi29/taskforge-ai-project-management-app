const PROJECT_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#14b8a6",
];

/** Pick a random accent color for new projects. */
export function randomProjectColor(): string {
  return PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)]!;
}

/** First letter of the project title (e.g. "Test Project" → "T"). */
export function projectIconFromName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const first = trimmed.match(/[A-Za-z0-9]/);
  return (first?.[0] ?? trimmed[0]).toUpperCase();
}

/** Derive a short uppercase project key from the name. */
export function deriveProjectKey(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return words
      .map((w) => w.replace(/[^A-Za-z0-9]/g, "").charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 4);
  }
  const compact = name.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return (compact.slice(0, 2) || "TP");
}
