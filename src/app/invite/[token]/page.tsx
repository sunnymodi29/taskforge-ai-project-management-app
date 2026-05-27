import Link from "next/link";
import { auth } from "@/auth";
import { getInvitationByToken } from "@/lib/actions/invitations";
import { Button } from "@/components/ui";
import { AcceptInviteButton } from "@/components/accept-invite-button";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await auth();
  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-xl font-bold">Invitation not found</h1>
          <p className="text-muted-foreground text-sm">
            This link may be invalid or already used.
          </p>
          <Link href="/login" className="inline-flex">
            <Button>Go to login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if ("expired" in invitation && invitation.expired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-xl font-bold">Invitation expired</h1>
          <p className="text-muted-foreground text-sm">
            Ask {invitation.invitedBy.name} to send a new invite to {invitation.email}.
          </p>
          <Link href="/dashboard" className="inline-flex">
            <Button>Go Back</Button>
          </Link>
        </div>
      </div>
    );
  }

  const orgName =
    invitation.organization?.name ??
    invitation.project?.organization?.name ??
    "TrackEzz";
  const projectName = invitation.project?.name;
  const roleLabel =
    invitation.projectRole?.replace("_", " ") ??
    invitation.organizationRole?.replace("_", " ") ??
    "member";

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full rounded-xl border border-border bg-card p-8 space-y-6 text-center">
          <h1 className="text-xl font-bold">
            {projectName ? `Join ${projectName}` : `Join ${orgName}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            {invitation.invitedBy.name} invited <strong>{invitation.email}</strong>
            {projectName ? (
              <>
                {" "}
                to <strong>{projectName}</strong> at {orgName}
              </>
            ) : (
              <> to manage projects at {orgName}</>
            )}{" "}
            as {roleLabel}.
          </p>
          <p className="text-xs text-muted-foreground">
            Sign in or create an account with <strong>{invitation.email}</strong> to accept.
          </p>
          <div className="flex flex-col gap-2">
            <Link href={`/login?callbackUrl=/invite/${token}`} className="block">
              <Button className="w-full">Sign in</Button>
            </Link>
            <Link
              href={`/register?email=${encodeURIComponent(invitation.email)}&invite=${token}`}
              className="block"
            >
              <Button variant="outline" className="w-full">
                Create account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full rounded-xl border border-border bg-card p-8 space-y-6 text-center">
        <h1 className="text-xl font-bold">
          {projectName ? `Join ${projectName}` : `Join ${orgName}`}
        </h1>
        <p className="text-sm text-muted-foreground">
          Accept access{projectName ? ` to ${projectName}` : ""} ({orgName}) as {roleLabel}.
        </p>
        <AcceptInviteButton token={token} />
      </div>
    </div>
  );
}
