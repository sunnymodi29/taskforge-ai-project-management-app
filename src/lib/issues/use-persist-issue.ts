"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateIssue,
  type UpdateIssueInput,
} from "@/lib/actions/issues";
import { useDataStore } from "@/store/data-store";
import type { Issue } from "@/types";

export function usePersistIssue() {
  const router = useRouter();
  const upsertIssue = useDataStore((s) => s.upsertIssue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback(
    async (issueId: string, input: UpdateIssueInput): Promise<Issue | null> => {
      setSaving(true);
      setError(null);
      try {
        const updated = await updateIssue(issueId, input);
        upsertIssue(updated);
        router.refresh();
        return updated;
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to save";
        setError(message);
        console.error(message);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [router, upsertIssue]
  );

  return { persist, saving, error };
}
