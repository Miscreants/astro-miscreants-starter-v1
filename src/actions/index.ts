import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { EmailMessage } from "cloudflare:email";
import { env } from "cloudflare:workers";
import { createMimeMessage } from "mimetext";

// `env` is the typed bindings object — populated by the @astrojs/cloudflare
// adapter from wrangler.jsonc. Types come from `worker-configuration.d.ts`
// (or, in this project, `src/env.d.ts`).

export const server = {
  contact: defineAction({
    accept: "form",
    input: z.object({
      firstName: z.string().trim().min(1, "First name is required").max(100),
      lastName: z.string().trim().min(1, "Last name is required").max(100),
      email: z.string().trim().email("Enter a valid email").max(254),
      // Honeypot — Form.astro renders this hidden field. Bots fill it.
      website: z.string().max(0).optional(),
    }),
    handler: async (input) => {
      if (input.website) return { ok: true };

      const submittedAt = new Date().toISOString();
      const body = [
        `Name:  ${input.firstName} ${input.lastName}`,
        `Email: ${input.email}`,
        ``,
        `Submitted: ${submittedAt}`,
      ].join("\n");

      // In `astro dev` and any environment where the binding isn't wired up,
      // log the payload and return success — lets you exercise the form
      // locally without provisioning Email Routing.
      if (import.meta.env.DEV || !env.NOTIFY_EMAIL) {
        console.log("[contact action] (dev) would send email:\n" + body);
        return { ok: true };
      }

      const mime = createMimeMessage();
      mime.setSender({ name: env.FROM_NAME, addr: env.FROM_EMAIL });
      mime.setRecipient(env.NOTIFY_TO);
      mime.setSubject(`New contact: ${input.firstName} ${input.lastName}`);
      mime.addMessage({ contentType: "text/plain", data: body });

      try {
        await env.NOTIFY_EMAIL.send(
          new EmailMessage(env.FROM_EMAIL, env.NOTIFY_TO, mime.asRaw())
        );
      } catch (err) {
        console.error("send_email failed", err);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not send notification. Please try again.",
        });
      }

      return { ok: true };
    },
  }),
};
