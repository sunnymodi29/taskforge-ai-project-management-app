"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui";
import {
  acceptInvitationAction,
  type AcceptInviteState,
} from "@/lib/actions/invitations";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Joining…" : "Accept invitation"}
    </Button>
  );
}

export function AcceptInviteButton({ token }: { token: string }) {
  const [state, formAction] = useActionState<AcceptInviteState, FormData>(
    acceptInvitationAction.bind(null, token),
    null,
  );

  return (
    <form action={formAction} className="space-y-2">
      {state?.error && (
        <p className="text-xs text-destructive bg-destructive/10 rounded px-2 py-1.5">
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
