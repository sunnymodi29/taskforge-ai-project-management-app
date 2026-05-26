import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateIssueKey(projectPrefix: string, number: number): string {
  return `${projectPrefix}-${number}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export const priorityColors: Record<string, string> = {
  urgent: "text-red-400 bg-red-400/10",
  high: "text-orange-400 bg-orange-400/10",
  medium: "text-yellow-400 bg-yellow-400/10",
  low: "text-blue-400 bg-blue-400/10",
  none: "text-zinc-400 bg-zinc-400/10",
};

export const statusColors: Record<string, string> = {
  backlog: "text-zinc-400 bg-zinc-500/10",
  todo: "text-zinc-300 bg-zinc-500/10",
  "in-progress": "text-blue-400 bg-blue-400/10",
  "in-review": "text-purple-400 bg-purple-400/10",
  done: "text-emerald-400 bg-emerald-400/10",
  cancelled: "text-red-400 bg-red-400/10",
};

export const typeColors: Record<string, string> = {
  task: "text-blue-400",
  bug: "text-red-400",
  feature: "text-purple-400",
  improvement: "text-teal-400",
  epic: "text-amber-400",
  story: "text-green-400",
};
