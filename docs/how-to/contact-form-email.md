# Contact form + Cloudflare native email

A reusable example: a simple form (first name, last name, email) captured by an
**Astro Action** and forwarded as an email notification via Cloudflare's
**native `send_email` binding** — no Resend, no third-party email API.

End-to-end verified locally with `wrangler dev`: filling the form triggers the
binding, and Miniflare captures the resulting `.eml` so you can inspect the
message before pointing it at real Email Routing.

## Files

| File | Role |
| --- | --- |
| `astro.config.mjs` | `output: 'static'` + `@astrojs/cloudflare` adapter. Pages stay prerendered; the adapter mounts actions at `/_actions/<name>` as on-demand endpoints. `platformProxy` is intentionally **off** (see "Local dev" below). |
| `wrangler.jsonc` | Worker config. Declares the `NOTIFY_EMAIL` send_email binding and `FROM_EMAIL` / `FROM_NAME` / `NOTIFY_TO` vars. **No `main` field** — the adapter writes its own `dist/server/wrangler.json` with the right entry. |
| `src/env.d.ts` | Module-augments the Cloudflare adapter's `Env` interface so `import { env } from "cloudflare:workers"` is fully typed. |
| `src/actions/index.ts` | The `contact` action — Zod input validation, builds a MIME message with `mimetext`, sends via the binding. Has a DEV short-circuit that logs and returns success when the binding isn't wired up. |
| `src/pages/contact.astro` | Example page — uses the existing `<Form>` / `<Field>` / `<Button>` components, points at `/_actions/contact`. |

## How the wiring works

1. The form posts `multipart/form-data` to `/_actions/contact`. Existing
   `Form.astro` intercepts via JS and `fetch()`s; without JS the browser
   does a native form POST. Both paths hit the same endpoint.
2. The adapter routes that path to `src/actions/index.ts → server.contact`.
3. Zod validates the input. Honeypot field (`website`) silently 200s.
4. The handler imports `env` from `cloudflare:workers` (the Astro 6 API —
   `Astro.locals.runtime.env` was removed) and calls
   `env.NOTIFY_EMAIL.send(new EmailMessage(from, to, mime))`.

## Prerequisites for production (one-time Cloudflare setup)

The native `send_email` binding only works against a domain on Cloudflare with
Email Routing enabled, sending to verified destination addresses.

1. Buy or transfer a domain into Cloudflare Registrar (at-cost).
2. Cloudflare dashboard → the zone → **Email** → **Email Routing** → enable.
3. **Destination addresses** → add your inbox (e.g. `jarsson@gmail.com`) and click the verification link.
4. (Optional) Add a routing rule like `hello@yourdomain.tld → jarsson@gmail.com` so replies work.
5. Update `wrangler.jsonc`:
   - `FROM_EMAIL` → an address on the Cloudflare-managed zone (`noreply@yourdomain.tld`).
   - `NOTIFY_TO` and `send_email[0].destination_address` → the verified inbox.

## Local dev

There are two modes — pick based on what you're testing.

### `npm run dev` (fast iteration on UI)

Runs Astro's normal dev server. **Caveat:** `@astrojs/cloudflare` v13 with
`platformProxy: { enabled: true }` runs SSR through workerd, which breaks
projects using `astro-icon` (CJS internals). This config keeps `platformProxy`
off so dev runs in plain Node. The contact action's DEV branch logs the
payload and returns success without needing the binding — the form's success
state still renders correctly.

```sh
npm run dev
# open http://localhost:4321/contact
```

### `wrangler dev` (test the real binding)

Builds the project and runs it under workerd with the actual `send_email`
binding wired up. Miniflare doesn't deliver email — instead it writes each
sent message to a `.eml` file in `%TEMP%/miniflare-*/email/email/` and logs
the path. Open that file to verify the message body.

```sh
npm run build
npx wrangler dev --config dist/server/wrangler.json --port 4400
# open http://127.0.0.1:4400/contact
```

If you change `src/actions/index.ts` or any page, `Ctrl+C`, run
`npm run build`, and start wrangler again. (Astro doesn't watch under
wrangler dev.) On Windows, sometimes the `dist/server/.wrangler/state/*.sqlite`
files stay locked for a few seconds after stopping wrangler — wait or kill
any leftover `workerd.exe` processes.

## Deploy

```sh
npm run build
npx wrangler deploy --config dist/server/wrangler.json
```

Then submit the form on the deployed URL. Tail logs with
`npx wrangler tail` if email doesn't arrive — most failures are
unverified destination address or `FROM_EMAIL` on a zone without Email
Routing.

## Reuse checklist

To drop this into a new Astro 6 project:

1. `npm i @astrojs/cloudflare mimetext`
2. In `astro.config.mjs`: `output: 'static'` + `adapter: cloudflare()`.
3. Copy `wrangler.jsonc`, `src/env.d.ts`, `src/actions/index.ts`, `src/pages/contact.astro`.
4. Update in `wrangler.jsonc`: `name`, `FROM_EMAIL`, `NOTIFY_TO`, and `send_email[0].destination_address`.
5. Make sure the form posts to `/_actions/contact` (or whatever you rename the action).
6. If the project doesn't already have `Form.astro` / `Field.astro` / `Button.astro`, copy those over too.

## Things to add later (not in this example)

- Rate limiting (Cloudflare Turnstile, or KV-backed per-IP counter).
- `Reply-To` header set to the submitter's email so you can reply from Gmail.
- HTML body alongside the plain-text one.
- Persistence to D1 if you want submissions auditable beyond email.
