"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button, Input, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Sprint } from "@/types";

function formatDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function defaultEndDate(start: Date): Date {
  const end = new Date(start);
  end.setDate(end.getDate() + 13);
  return end;
}

export interface SprintFormValues {
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  startImmediately: boolean;
}

interface SprintFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: SprintFormValues) => Promise<void>;
  sprint?: Sprint | null;
  loading?: boolean;
}

export function SprintFormModal({
  open,
  onClose,
  onSubmit,
  sprint,
  loading = false,
}: SprintFormModalProps) {
  const isEdit = Boolean(sprint);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState(formatDateInput(new Date()));
  const [endDate, setEndDate] = useState(formatDateInput(defaultEndDate(new Date())));
  const [startImmediately, setStartImmediately] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (sprint) {
      setName(sprint.name);
      setGoal(sprint.goal ?? "");
      setStartDate(formatDateInput(sprint.startDate));
      setEndDate(formatDateInput(sprint.endDate));
      setStartImmediately(false);
    } else {
      const start = new Date();
      setName("");
      setGoal("");
      setStartDate(formatDateInput(start));
      setEndDate(formatDateInput(defaultEndDate(start)));
      setStartImmediately(false);
    }
    setError(null);
  }, [open, sprint]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Sprint name is required");
      return;
    }
    if (endDate < startDate) {
      setError("End date must be on or after start date");
      return;
    }
    try {
      await onSubmit({
        name: name.trim(),
        goal: goal.trim(),
        startDate,
        endDate,
        startImmediately: !isEdit && startImmediately,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save sprint");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={loading ? undefined : onClose} />
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="relative w-full max-w-md rounded-xl border border-border bg-card shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-bold">{isEdit ? "Edit Sprint" : "Create Sprint"}</h2>
          <button type="button" onClick={onClose} disabled={loading} className="p-1 rounded hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sprint 12" disabled={loading} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Goal (optional)</label>
            <Textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What should this sprint achieve?"
              rows={2}
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Start</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">End</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          {!isEdit && (
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={startImmediately}
                onChange={(e) => setStartImmediately(e.target.checked)}
                disabled={loading}
                className="rounded border-border"
              />
              Start sprint immediately (completes any other active sprint)
            </label>
          )}
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={loading || !name.trim()}>
            {loading ? "Saving…" : isEdit ? "Save" : "Create"}
          </Button>
        </div>
      </form>
    </div>
  );
}
