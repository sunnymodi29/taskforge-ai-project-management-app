"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export const QUICK_EMOJIS = [
  "👍", "👎", "❤️", "🎉", "😄", "😂", "🔥", "👀",
  "✅", "❌", "🙏", "💯", "🚀", "😮", "😢", "🤔",
];

interface EmojiPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  className?: string;
  title?: string;
}

export function EmojiPicker({
  open,
  onClose,
  onSelect,
  className,
  title = "Pick an emoji",
}: EmojiPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute bottom-full left-0 mb-2 z-50 rounded-lg border border-border bg-card shadow-lg p-2 w-[220px]",
        className
      )}
    >
      <div className="text-[10px] font-medium text-muted-foreground px-1 mb-1.5">{title}</div>
      <div className="grid grid-cols-8 gap-0.5">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-accent text-base transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
