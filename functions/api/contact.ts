// Cloudflare Pages Function — POST /api/contact
//
// This is the form's backend. It lives OUTSIDE the Astro build (in /functions),
// so the site stays a pure static build and keeps its build-time image
// optimization — no @astrojs/cloudflare adapter needed. Cloudflare Pages runs
// this server-side next to the static assets.
//
// The <Form> component (src/components/Form.astro) POSTs FormData here and
// treats any 2xx response as success.
//
// ⚠️ EMAIL IS NOT WIRED YET. Right now this validates the submission, logs it,
// and returns success so the form works end-to-end. To actually deliver mail,
// uncomment ONE option in the "WIRE EMAIL HERE" block below and set the matching
// env vars / binding in the Cloudflare Pages project settings.

interface Env {
  NOTIFY_TO?: string;
  FROM_EMAIL?: string;
  FROM_NAME?: string;
  // Wire one of these when connecting email:
  // NOTIFY_EMAIL?: { send(msg: unknown): Promise<void> }; // CF Email Routing binding
  // RESEND_API_KEY?: string;                               // or an email API key
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

export const onRequestPost = async (
  context: { request: Request; env: Env },
): Promise<Response> => {
  const { request, env } = context;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: "Invalid form submission." }, 400);
  }

  // Honeypot — Form.astro renders a hidden `website` field. Bots fill it;
  // humans never see it. Pretend success and send nothing.
  if (String(form.get("website") ?? "")) return json({ ok: true });

  const firstName = String(form.get("firstName") ?? "").trim();
  const lastName = String(form.get("lastName") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();

  if (!firstName || !lastName || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json(
      { ok: false, error: "Please provide your name and a valid email." },
      422,
    );
  }

  const body = [
    `Name:  ${firstName} ${lastName}`,
    `Email: ${email}`,
    ``,
    `Submitted: ${new Date().toISOString()}`,
  ].join("\n");

  // ── WIRE EMAIL HERE ─────────────────────────────────────────────────────
  // Not connected yet — just log + succeed. Pick ONE when you're ready:
  //
  // Option A — Cloudflare Email Routing (free; needs the domain on Cloudflare
  //   with Email Routing on + a verified destination + a `send_email` binding
  //   named NOTIFY_EMAIL added to the Pages project). Needs `mimetext`:
  //
  //     import { EmailMessage } from "cloudflare:email";
  //     import { createMimeMessage } from "mimetext";
  //     const m = createMimeMessage();
  //     m.setSender({ name: env.FROM_NAME!, addr: env.FROM_EMAIL! });
  //     m.setRecipient(env.NOTIFY_TO!);
  //     m.setSubject(`New contact: ${firstName} ${lastName}`);
  //     m.addMessage({ contentType: "text/plain", data: body });
  //     await env.NOTIFY_EMAIL!.send(new EmailMessage(env.FROM_EMAIL!, env.NOTIFY_TO!, m.asRaw()));
  //
  // Option B — Resend (easiest; set RESEND_API_KEY + FROM_EMAIL/NOTIFY_TO in
  //   the Pages env vars):
  //
  //     const r = await fetch("https://api.resend.com/emails", {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${env.RESEND_API_KEY}`,
  //         "content-type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
  //         to: env.NOTIFY_TO,
  //         subject: `New contact: ${firstName} ${lastName}`,
  //         text: body,
  //       }),
  //     });
  //     if (!r.ok) return json({ ok: false, error: "Could not send. Try again." }, 502);
  // ─────────────────────────────────────────────────────────────────────────
  console.log("[contact] received (email not wired yet):\n" + body);

  return json({ ok: true });
};
