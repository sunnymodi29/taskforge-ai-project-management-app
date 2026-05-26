export interface SendEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export async function sendBrevoEmail(
  params: SendEmailParams
): Promise<{ sent: boolean; skipped?: boolean; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME ?? "TaskForge AI";

  if (!apiKey || !senderEmail) {
    console.warn(
      "[brevo] BREVO_API_KEY or BREVO_SENDER_EMAIL missing — email not sent"
    );
    return { sent: false, skipped: true };
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: params.to }],
        subject: params.subject,
        htmlContent: params.htmlContent,
        textContent: params.textContent,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[brevo] send failed", res.status, body);
      return { sent: false, error: body };
    }

    return { sent: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[brevo]", message);
    return { sent: false, error: message };
  }
}

export function buildWorkspaceInviteEmail(params: {
  inviteUrl: string;
  workspaceName: string;
  organizationName: string;
  inviterName: string;
  role: string;
}): { subject: string; html: string; text: string } {
  const subject = `You're invited to ${params.workspaceName} on TaskForge`;
  const text = `${params.inviterName} invited you to join the "${params.workspaceName}" team workspace at ${params.organizationName} as ${params.role}.\n\nAccept: ${params.inviteUrl}`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 12px">You're invited to TaskForge</h2>
      <p><strong>${params.inviterName}</strong> invited you to join
        <strong>${params.workspaceName}</strong> (${params.organizationName}) as <strong>${params.role}</strong>.</p>
      <p><a href="${params.inviteUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Accept invitation</a></p>
      <p style="color:#666;font-size:12px">Or copy this link:<br/><a href="${params.inviteUrl}">${params.inviteUrl}</a></p>
    </div>
  `;
  return { subject, html, text };
}

export function buildProjectInviteEmail(params: {
  inviteUrl: string;
  projectName: string;
  organizationName: string;
  inviterName: string;
  role: string;
}): { subject: string; html: string; text: string } {
  const subject = `You're invited to ${params.projectName} on TaskForge`;
  const text = `${params.inviterName} invited you to ${params.projectName} (${params.organizationName}) as ${params.role}.\n\nAccept: ${params.inviteUrl}`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 12px">Project invitation</h2>
      <p><strong>${params.inviterName}</strong> invited you to <strong>${params.projectName}</strong> at ${params.organizationName} as <strong>${params.role}</strong>.</p>
      <p><a href="${params.inviteUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Accept invitation</a></p>
    </div>
  `;
  return { subject, html, text };
}
