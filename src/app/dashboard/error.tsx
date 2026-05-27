"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  const message =
    error.message && !error.message.includes("omitted in production")
      ? error.message
      : "We could not load your workspace. If you just accepted an invitation, try again or sign out and back in with the invited email.";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full rounded-xl border border-border bg-card p-8 space-y-4 text-center">
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
        {error.digest && (
          <p className="text-[10px] text-muted-foreground font-mono">
            Reference: {error.digest}
          </p>
        )}
        <div className="flex flex-col gap-2 pt-2">
          <Button type="button" onClick={() => reset()} className="w-full">
            Try again
          </Button>
          <Link href="/login" className="block">
            <Button variant="outline" className="w-full">
              Sign in again
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
