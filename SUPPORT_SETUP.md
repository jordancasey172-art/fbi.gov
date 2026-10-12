# Website Chat and Complaints

This is independent website support, not an FBI service. The existing site and tip
form are unchanged. Chat and website complaints have their own operator inbox and
never create law-enforcement reports.

> **Deploying to Render, duty-desk credentials, and the automated triage assistant are
> documented in [`DEPLOYMENT.md`](./DEPLOYMENT.md).** This file covers the database side.

## Try It

1. Click **Live Duty Desk** in the bottom-right corner.
2. Send a message — or pick one of the common-report starters. The automated assistant answers immediately, classifies the matter, gives protective steps, and begins collecting contact details.
3. Type **"agent"** (or finish intake) to escalate. The case moves to **Awaiting agent**.
4. Click **Staff Portal** in the widget footer or site footer. It opens `#support-inbox` in a new tab.
5. Sign in. In local mode the factory credentials are shown on the login screen until you rotate them.
6. Select the case, review the **Case file** sidebar, and reply. Your first reply sets the status to **Agent engaged** and the assistant goes silent for that case.
7. Use **My requests** for replies, references, and status. Both views download plain-text transcripts including captured contact details.

Without environment configuration this is a **local, same-browser queue**. Requests
are stored in localStorage on the same website origin. Clearing site storage removes
them. Other devices, browsers, private sessions, and domains do not share them.

The assistant is labelled `automated` on every message and never claims to be a
person, but it is **not** a substitute for staffing: a human must open the duty inbox
to take over. Failed sends retain their drafts and retries reuse message IDs to avoid
duplication. Filed tip-form reports only enter this queue when the visitor opts in to
share contact details for follow-up.

## Connect Real Visitors

The live adapter uses Supabase Auth, Postgres, Row Level Security, and Realtime.
This source code does not provision a project, credentials, hosting, or an operator
account. Configure and verify them before claiming support is live.

1. Create a dedicated project at https://supabase.com/dashboard.
2. Run `supabase/support.sql` in the project's SQL editor. This installs tables, access policies, validated write functions, per-user rate limits, and Realtime publication.
3. In Authentication settings, enable **Anonymous Sign-Ins**. Each visitor gets an authenticated guest identity without an email address. This is not unrestricted public database access.
4. In Authentication > Users, create a permanent, confirmed email/password account for yourself. There is no public operator signup in the app.
5. Approve the account using the SQL below, replacing the email with your own account's email.
6. Copy `.env.example` to `.env.local`. Fill in your Supabase project URL and public publishable key. A legacy public `anon` key also works. Never use a secret or service-role key in any `VITE_` variable.
7. Restart development, or set these environment variables in your hosting provider and redeploy the Vite app. Values are applied at build time.
8. Sign in at `#support-inbox`. Visitors on other devices can use the deployed site's chat widget.

```sql
insert into public.support_operators (user_id, display_name)
select id, 'Site operator'
from auth.users
where lower(email) = lower('owner@your-website.com')
  and is_anonymous is false
on conflict (user_id) do nothing;
```

Operator approval comes from a server-managed table, not user-editable metadata or
a browser flag. Visitors can read only their own requests. Approved operators can
read and respond to the queue. Direct table writes are forbidden. RPC functions
validate ownership, sender identity, length, status, and rate limits. A new request
and its first message are committed atomically. Successful retries are idempotent.

Visitor and operator authentication use separate storage keys, so testing both views
in one browser does not replace the guest session. A guest's history is specific to
their browser: clearing guest auth storage loses access. Complaint references are
identifiers, not passwords; knowing a reference does not expose another visitor's
request. There is no cross-device guest account recovery in this version.

Local demo data is **not uploaded** when live support is enabled. If a live
configuration is incomplete or the backend fails, the app reports an error rather
than silently falling back to local storage and pretending to deliver the message.

## Verify Before Publishing

1. Send a message from a separate browser/device. Verify it appears in the authenticated operator inbox and that an operator reply arrives without refreshing.
2. Submit a complaint. Check its subject, category, description, reference, and status. Reply and resolve it; verify the visitor can read its transcript but cannot send to a resolved request. Reopen it and reply again.
3. Start another guest session in a separate browser. Verify it cannot read the first guest's threads or messages, even if it knows their IDs.
4. Sign in with a non-approved permanent account. Confirm it cannot access the queue, change statuses, or send an operator reply. Anonymous users must not be able to add themselves to `support_operators` or write directly to any support table.
5. Confirm Realtime is enabled for both support tables. Disconnect the network, check error/reconnection feedback and retained drafts, then reconnect. Retrying a send must not duplicate it.
6. Refresh both tabs and verify history, unread badges, and resolved state. Check mobile keyboard behavior, maximum message lengths, complaint consent, keyboard navigation, and Escape-to-close.
7. Check existing wanted posters, search, news, field offices, the tip form, and navigation.

## Operations and Limitations

- Use HTTPS, strong operator passwords, and a dedicated project. Review MFA and session policies before handling real business data.
- Keep all unofficial-site disclaimers. Do not present the operator, chat, or complaint receipt as an FBI service.
- Do not collect government IDs, passwords, financial details, crime allegations, or evidence through this demo.
- Only plain text is accepted. React escapes message content; HTML and attachments are not supported.
- Messages are stored locally or in your configured database. There are no email/push notifications, automated replies, guaranteed response times, or guaranteed staffing. Keep the inbox open to attend visitors.
- Server functions limit each user to 10 new requests per hour and 60 messages per minute. Configure Supabase Auth IP rate limits, retention, and abuse prevention before allowing public traffic.
- Supabase recommends CAPTCHA for public anonymous sign-ins. CAPTCHA UI/token integration is not included. If you enable a CAPTCHA requirement in Supabase, integrate its challenge token with visitor sign-in before publishing; otherwise new sign-ins fail visibly. See https://supabase.com/docs/guides/auth/auth-anonymous and https://supabase.com/docs/guides/auth/auth-captcha.
- The live adapter paginates reads, listens for RLS-authorized Postgres events, and refreshes every 12 seconds while visible as a fallback. High-volume deployments should add server-side inbox pagination, selected-thread message loading, audit/retention jobs, and stronger abuse controls.
- Remove an account from `public.support_operators` to revoke queue privileges. Manage operator accounts/passwords in Supabase, not in the browser app.
- No hosted project was connected during implementation. The SQL, real credentials, RLS behavior, and cross-device delivery must be verified on your deployed project with the checklist above.

## Implementation

- `src/support/SupportCenter.tsx`: support routes, launcher, and error boundary.
- `src/support/VisitorWidget.tsx`: visitor chat, complaints, receipts, request history, and report starters.
- `src/support/OperatorInbox.tsx`: duty-desk authentication, credential rotation, priority queue, case-file sidebar, and status controls.
- `src/support/triage.ts`: intent classification, urgency detection, contact extraction, responder, and optional AI provider.
- `src/support/admin.ts`: local duty-desk credential gate, hashing, and rotation.
- `src/support/PostReportCapture.tsx`: post-report contact capture that opens a `report` case.
- `src/support/backend.ts`: Supabase authentication, reads, RPCs, and subscriptions.
- `src/support/local.ts`: append-only local storage and cross-tab updates.
- `src/support/useSupport.ts`: session lifecycle, loading, errors, and synchronization.
- `src/support/model.ts`: types, statuses, contact validation, unread counts, and transcript downloads.
- `src/support/shared.tsx`: bot/agent/visitor bubbles, typing indicator, quick replies, contact form and summary.
- `src/support/support.css`: scoped and responsive styles.
- `supabase/support.sql`: schema, policies, rate limits, seven validated RPCs, and Realtime setup.

## Schema Changes From the Original Version

`supabase/support.sql` is idempotent and upgrades an existing installation in place:

- `support_threads`: adds `kind` value `report`; replaces status `new` with `bot_intake`,
  `awaiting_agent`, `in_progress`, `resolved`; adds `intent`, `urgent`,
  `handoff_requested_at`, `bot_completed_at`, and the eight contact columns.
- `support_messages`: `sender` now permits `bot`.
- `category` is length-checked rather than enum-checked, so filed report cases can
  carry their scam classification as the category.
- New RPCs: `support_bot_reply`, `support_save_contact`, `support_request_handoff`.
  `support_start_thread` now takes `p_intent` and `p_urgent`.
- New index `support_threads_queue_idx (status, urgent desc, updated_at desc)` for the duty queue.

Bot replies are written by the **visitor's own session** because the responder runs in
their browser; `support_bot_reply` therefore verifies thread ownership and refuses to
write once an agent has taken over or the case is resolved.