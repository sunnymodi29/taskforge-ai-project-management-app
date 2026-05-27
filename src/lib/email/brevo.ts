import nodemailer from "nodemailer";

export interface SendEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: { email: string; name?: string };
}

export interface SendEmailResult {
  sent: boolean;
  skipped?: boolean;
  error?: string;
  messageId?: string;
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim() ?? "";
  const user = process.env.SMTP_USER?.trim() ?? "";
  const pass = process.env.SMTP_PASS?.trim() ?? "";
  const fromEmail = process.env.EMAIL?.trim() ?? "";
  const portRaw = process.env.SMTP_PORT?.trim();

  if (!host || !user || !pass || !fromEmail) return null;

  const port = portRaw ? Number(portRaw) : 587;
  if (!Number.isFinite(port) || port <= 0) return null;

  return {
    host,
    port,
    user,
    pass,
    fromEmail,
    fromName: (process.env.SMTP_FROM_NAME ?? "TrackEzz").trim(),
  };
}

export function isBrevoConfigured(): boolean {
  return getSmtpConfig() !== null;
}

function formatSmtpError(message: string): string {
  const lower = message.toLowerCase();
  if (/invalid login|authentication failed|535|auth/i.test(lower)) {
    return "SMTP authentication failed. Use your Brevo login email for SMTP_USER and the SMTP key (not the REST API key) for SMTP_PASS.";
  }
  if (/sender|from address|not verified|not authorised/i.test(lower)) {
    return `Sender not verified in Brevo. Set EMAIL to a verified sender address (${message})`;
  }
  if (/econnrefused|enotfound|etimedout|connect/i.test(lower)) {
    return `Could not reach SMTP server. Check SMTP_HOST (${process.env.SMTP_HOST}) and SMTP_PORT (${process.env.SMTP_PORT ?? 587}).`;
  }
  return message;
}

export async function sendBrevoEmail(
  params: SendEmailParams
): Promise<SendEmailResult> {
  const smtp = getSmtpConfig();

  if (!smtp) {
    console.warn(
      "[email] SMTP_HOST, SMTP_USER, EMAIL, or SMTP_PASS missing — email not sent"
    );
    return {
      sent: false,
      skipped: true,
      error:
        "Email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, EMAIL, and SMTP_PASS.",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"${smtp.fromName}" <${smtp.fromEmail}>`,
      to: params.to.trim(),
      subject: params.subject,
      html: params.htmlContent,
      text: params.textContent,
      replyTo: params.replyTo?.email
        ? params.replyTo.name
          ? `"${params.replyTo.name}" <${params.replyTo.email}>`
          : params.replyTo.email
        : undefined,
    });

    return { sent: true, messageId: info.messageId };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Unknown error";
    console.error("[email] SMTP send failed:", raw);
    return { sent: false, error: formatSmtpError(raw) };
  }
}

/** Throws if the invitation email could not be sent (config missing or SMTP error). */
export async function sendBrevoEmailOrThrow(
  params: SendEmailParams
): Promise<void> {
  const result = await sendBrevoEmail(params);
  if (result.sent) return;
  throw new Error(result.error ?? "Failed to send email");
}

export function buildOrgAdminInviteEmail(params: {
  inviteUrl: string;
  organizationName: string;
  inviterName: string;
}): { subject: string; html: string; text: string } {
  const subject = `You're invited to manage projects at ${params.organizationName}`;
  const text = `${params.inviterName} invited you as a project admin at ${params.organizationName}.\n\nAccept: ${params.inviteUrl}`;
  const html = inviteEmailLayout({
    title: "Project admin invitation",
    body: `<p><strong>${escapeHtml(params.inviterName)}</strong> invited you to create and manage projects at <strong>${escapeHtml(params.organizationName)}</strong>.</p>`,
    inviteUrl: params.inviteUrl,
  });
  return { subject, html, text };
}

export function buildProjectInviteEmail(params: {
  inviteUrl: string;
  projectName: string;
  organizationName: string;
  inviterName: string;
  role: string;
}): { subject: string; html: string; text: string } {
  const roleLabel = params.role.replace(/_/g, " ");
  const subject = `You're invited to ${params.projectName} on TrackEzz`;
  const text = `${params.inviterName} invited you to ${params.projectName} (${params.organizationName}) as ${roleLabel}.\n\nAccept: ${params.inviteUrl}`;
  const html = inviteEmailLayout({
    title: "Project invitation",
    body: `<p><strong>${escapeHtml(params.inviterName)}</strong> invited you to <strong>${escapeHtml(params.projectName)}</strong> at ${escapeHtml(params.organizationName)} as <strong>${escapeHtml(roleLabel)}</strong>.</p>`,
    inviteUrl: params.inviteUrl,
  });
  return { subject, html, text };
}

function inviteEmailLayout(parts: {
  title: string;
  body: string;
  inviteUrl: string;
}): string {
  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">
      <div style="margin-bottom:20px">
        <span style="display:inline-block;background:#6366f1;color:#fff;font-weight:700;font-size:14px;padding:8px 12px;border-radius:8px">TrackEzz</span>
      </div>
      <h2 style="margin:0 0 16px;font-size:20px">${escapeHtml(parts.title)}</h2>
      ${parts.body}
      <p style="margin:24px 0">
        <a href="${parts.inviteUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Accept invitation</a>
      </p>
      <p style="color:#666;font-size:12px;line-height:1.5">Or copy this link:<br/>
        <a href="${parts.inviteUrl}" style="color:#6366f1;word-break:break-all">${parts.inviteUrl}</a>
      </p>
      <p style="color:#999;font-size:11px;margin-top:32px">This link expires in 7 days.</p>
    </div>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildWorkspaceInviteEmail(params: {
  inviteUrl: string;
  workspaceName: string;
  organizationName: string;
  inviterName: string;
  role: string;
}): { subject: string; html: string; text: string } {
  const subject = `You're invited to ${params.workspaceName} on TrackEzz`;
  const text = `${params.inviterName} invited you to join the "${params.workspaceName}" team workspace at ${params.organizationName} as ${params.role}.\n\nAccept: ${params.inviteUrl}`;
  const html = inviteEmailLayout({
    title: "You're invited to TrackEzz",
    body: `<p><strong>${escapeHtml(params.inviterName)}</strong> invited you to join <strong>${escapeHtml(params.workspaceName)}</strong> (${escapeHtml(params.organizationName)}) as <strong>${escapeHtml(params.role)}</strong>.</p>`,
    inviteUrl: params.inviteUrl,
  });
  return { subject, html, text };
}
