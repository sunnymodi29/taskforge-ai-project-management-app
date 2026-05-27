"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { acceptInvitation } from "@/lib/actions/invitations";

export function AcceptInviteButton({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setLoading(true);
    setError(null);
    try {
      const { projectKey } = await acceptInvitation(token);
      if (projectKey) {
        router.push(`/dashboard/projects/${projectKey}`);
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-xs text-destructive bg-destructive/10 rounded px-2 py-1.5">{error}</p>
      )}
      <Button onClick={() => void handleAccept()} disabled={loading} className="w-full">
        {loading ? "Joining…" : "Accept invitation"}
      </Button>
    </div>
  );
}
