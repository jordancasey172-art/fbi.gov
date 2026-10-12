# Deploying to Render

This project builds to a single self-contained `dist/index.html` (Vite + `vite-plugin-singlefile`),
so Render hosts it as a **Static Site** — no server process to keep warm.

## Fastest path (Blueprint)

1. Push this repository to GitHub or GitLab.
2. In Render: **New +** → **Blueprint** → select the repository.
3. Render finds `render.yaml` at the root and creates a static web service automatically.
4. Click **Apply**. First build takes about a minute.

`render.yaml` already configures the build command, publish directory, SPA rewrite
(`/* → /index.html`, so `#support-inbox`, `#ic3`, and `#support-chat` resolve), Node 20,
security headers, and auto-deploy.

## Manual path (no Blueprint)

1. Render → **New +** → **Static Site** → connect the repository.
2. Set:
   - **Build Command:** `npm ci || npm install`
   - **Publish Directory:** `dist`
   - **Node version:** add environment variable `NODE_VERSION` = `20.18.0`
3. Add a rewrite rule under **Rewrites & Redirects**: source `/*`, destination `/index.html`, action **Rewrite** (status 200).
4. Deploy.

## Local verification before pushing

```bash
npm install
npm run build
npx serve dist        # or: npx http-server dist
```

Environment variables are baked in at **build time**. After changing any `VITE_` value,
rebuild and redeploy — a restart alone will not pick it up.

---

# Duty-desk (admin) login

Open the duty inbox at `#support-inbox`, or via **Staff Portal** in the site footer.

## Local mode — the default, no configuration needed

| Field | Value |
| --- | --- |
| Username | `admin` |
| Passphrase | `FBI-DutyDesk-2026` |

The login screen displays these while the factory defaults are active, with a
**Change them now** button. Rotated credentials are stored as a SHA-256 hash in
`localStorage` and persist across reloads.

**Read this before relying on it.** In local mode the gate runs entirely in the
browser: the passphrase ships inside the JavaScript bundle and the session flag sits
in `localStorage`. It stops casual visitors and is fine for demos, internal previews,
and single-operator sites holding no sensitive data — but it is **not real access
control**. Anyone determined can open devtools and bypass it. Conversations are also
stored only in that one browser, so two devices cannot share a queue.

## Live mode — real authentication

Configure Supabase (see `SUPPORT_SETUP.md`) and the duty desk switches to
server-enforced sign-in:

- Operators authenticate against Supabase Auth with an email and password.
- Access is granted only to `user_id` rows present in the `public.support_operators` table.
- Row Level Security decides what each signed-in identity can read; non-approved accounts see nothing.
- Anonymous visitor sessions can never obtain operator privileges.

Create the operator account in **Authentication → Users** (confirmed, not anonymous), then:

```sql
insert into public.support_operators (user_id, display_name)
select id, 'Duty agent' from auth.users
where lower(email) = lower('owner@your-website.com') and is_anonymous is false
on conflict (user_id) do nothing;
```

Sign in at `#support-inbox` with that email and password. There is no public
registration path anywhere in the app.

---

# Automated triage, then a human agent

Every visitor conversation starts with the **Automated Triage Assistant**. It is
clearly labelled `automated` on every message and never claims to be a person.

## What it does

1. **Classifies** the report across 19 intents — crypto/pig-butchering, sextortion,
   ransomware, tech-support, elder fraud, government impersonation, BEC, romance,
   marketplace, real-estate, employment, lottery, identity theft, trafficking,
   terrorism, violent crime, missing persons, website issues, general.
2. **Detects urgency.** Threats to safety, sextortion, ransomware, trafficking, and
   missing-person reports set the urgent flag, print 911 guidance first, and skip
   straight to the agent queue.
3. **Gives protective steps** specific to the detected scam — stop sending, isolate
   the machine, request a wire recall, freeze credit, and so on.
4. **Collects contact details conversationally**, in order: name → email → phone →
   location → loss amount → transaction/wallet reference → preferred contact method.
   It extracts emails, phone numbers, dollar amounts, and wallet/transaction hashes
   straight from free text, so visitors never fill a form mid-conversation.
5. **Hands off.** Typing "agent", "human", or "real person" — or finishing intake —
   moves the case to **Awaiting agent** and forwards the whole transcript.

Quick-reply chips appear under the composer for the current question. Once an agent
sends any reply, the status becomes **Agent engaged** and the assistant goes silent
for that case permanently.

## Statuses

`Automated intake` → `Awaiting agent` → `Agent engaged` → `Resolved`
(an agent can move a case back at any time from the status selector).

## Built-in responder vs. AI provider

By default the responder is a **deterministic rule engine running in the browser**.
No text leaves the device, it works offline, and it never invents case numbers,
arrests, or recovery promises.

To have a real model draft the replies instead, set these public variables:

```
VITE_AI_ENDPOINT=https://api.openai.com/v1/chat/completions
VITE_AI_API_KEY=sk-...
VITE_AI_MODEL=gpt-4o-mini
```

Any OpenAI-compatible `/chat/completions` endpoint works. Behaviour:

- The provider drafts the reply; the rule engine still decides classification,
  urgency, which contact field to ask for next, and whether to hand off.
- 12-second timeout. On **any** failure — network, auth, rate limit, empty or
  oversized output — it silently falls back to the rule engine, so a visitor always
  gets an answer.
- The system prompt forbids claiming to be human, giving legal advice, or promising
  fund recovery, and injects the IC3 portal and Special Agent line.
- The header shows **AI drafting on** or **Built-in responder** so you always know
  which engine is live.

**Security warning:** anything in a `VITE_` variable is public. A key placed here can
be read by every visitor. For production, put the real key behind your own proxy
endpoint (a Render Web Service or Supabase Edge Function) that adds authentication,
rate limiting, and a spend cap, then set `VITE_AI_ENDPOINT` to that proxy and leave
`VITE_AI_API_KEY` as a placeholder the proxy ignores.

---

# Contact details after a filed report

Two capture points, both feeding the same duty queue:

1. **In chat** — the assistant asks during intake. A green *Contact details on file*
   card summarises what was captured, with an **Update** button.
2. **After the tip/scam form** — the confirmation screen shows *Add contact details
   for follow-up*. Accepting it creates a `report` case containing the reference
   number, classification, field division, loss amount, suspect identifiers, and full
   statement, then presents the structured form: full name, email, phone, city/state,
   loss, transaction reference, and preferred contact method.

Validation runs in the browser **and** in the database: email format is enforced,
at least one reachable channel is required, and every field has a length cap.

In the duty inbox each case gets a **Case file** sidebar — contact summary, clickable
call / text / email shortcuts, reference, detected intent, handoff timestamp, message
count — plus a transcript download that includes all captured contact details.

Queue tools: urgent filter, urgent and awaiting-agent counters in the header, status
filter, type tabs (chats / complaints / reports), and search across name, email,
phone, and reference.

---

# Pre-launch checklist

- [ ] Deploy to Render and confirm `#ic3`, `#support-chat`, `#support-inbox`, and `#tips` all resolve.
- [ ] Rotate the factory duty-desk passphrase, or enable live mode for real authentication.
- [ ] Send a scam report in chat — verify classification, protective steps, contact collection, and handoff.
- [ ] Send a threat-to-safety message — verify the urgent flag, 911 guidance, and priority sorting.
- [ ] Type "agent" mid-intake — verify immediate escalation.
- [ ] File the tip form, add contact details, and confirm the `report` case appears in the duty inbox with the sidebar populated.
- [ ] Reply as an agent — verify the assistant goes silent and status becomes *Agent engaged*.
- [ ] Test on a phone: keyboard behaviour, quick-reply chips, mobile queue/conversation switching.
- [ ] If AI drafting is enabled, kill the endpoint and confirm the rule engine takes over without an error.
- [ ] Confirm no `VITE_` variable holds a secret key.
