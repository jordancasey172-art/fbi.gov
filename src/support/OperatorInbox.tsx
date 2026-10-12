import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft, ArrowRight, CheckCheck, Download, ExternalLink, FileText, Headphones, Inbox,
  KeyRound, LoaderCircle, LogIn, LogOut, MessageCircle, Search, Settings2, ShieldAlert, Zap,
} from "lucide-react";
import { localAdminState, signInOperator, signOutOperator, supportMode } from "./backend";
import {
  DEFAULT_ADMIN_PASSPHRASE, DEFAULT_ADMIN_USER, adminUserName, isUsingDefaultCredentials,
  rotateAdminCredentials,
} from "./admin";
import {
  KIND_LABELS, STATUS_LABELS, contactComplete, downloadTranscript, errorText, messagesFor,
  referenceFor, unreadCount, type ThreadKind, type ThreadStatus,
} from "./model";
import { aiMode } from "./triage";
import { ConnectionLabel, ContactSummary, Conversation, StatusBadge, SupportError } from "./shared";
import { useSupport, type SupportController } from "./useSupport";

/* ---------- credential rotation (local mode only) ---------- */
function RotateCredentials({ onDone }: { onDone: () => void }) {
  const [user, setUser] = useState(adminUserName());
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const prefix = useId();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await rotateAdminCredentials(user, pass, confirm);
      setPass("");
      setConfirm("");
      onDone();
    } catch (reason) { setError(errorText(reason)); }
    finally { setBusy(false); }
  };

  return (
    <form className="support-rotate" onSubmit={event => void submit(event)}>
      <h4><KeyRound size={15} aria-hidden="true" /> Change duty-desk credentials</h4>
      <SupportError message={error} />
      <fieldset disabled={busy}>
        <label htmlFor={`${prefix}-u`}>Username</label>
        <input id={`${prefix}-u`} value={user} onChange={event => setUser(event.target.value)} autoComplete="off" />
        <label htmlFor={`${prefix}-p`}>New passphrase (12+ characters)</label>
        <input id={`${prefix}-p`} type="password" value={pass} onChange={event => setPass(event.target.value)} autoComplete="new-password" />
        <label htmlFor={`${prefix}-c`}>Confirm passphrase</label>
        <input id={`${prefix}-c`} type="password" value={confirm} onChange={event => setConfirm(event.target.value)} autoComplete="new-password" />
        <div className="support-rotate-actions">
          <button type="submit" className="support-primary">Save credentials</button>
          <button type="button" className="support-text-button" onClick={onDone}>Cancel</button>
        </div>
      </fieldset>
    </form>
  );
}

/* ---------- login ---------- */
function OperatorLogin({ support }: { support: SupportController }) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [rotating, setRotating] = useState(false);
  const [rotated, setRotated] = useState(false);
  const prefix = useId();
  const local = supportMode === "local";
  const usingDefault = local && isUsingDefaultCredentials();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await signInOperator(user, password);
      setPassword("");
      support.retry();
    } catch (reason) { setError(errorText(reason)); }
    finally { setBusy(false); }
  };

  return (
    <div className="support-login-wrap">
      <form className="support-login" onSubmit={event => void submit(event)}>
        <span className="support-welcome-icon"><LogIn size={25} /></span>
        <span className="support-eyebrow">DUTY DESK WORKSPACE</span>
        <h2>Sign in to attend visitors.</h2>
        <p>
          {local
            ? "This browser holds the conversation queue. Sign in with the duty-desk credentials to read and reply."
            : "Authenticate with your approved account to reach the shared queue across devices."}
        </p>

        <SupportError message={error} />

        {usingDefault && (
          <div className="support-cred-hint" role="note">
            <ShieldAlert size={15} aria-hidden="true" />
            <div>
              <strong>Factory credentials in use</strong>
              <p>Username <code>{DEFAULT_ADMIN_USER}</code> · Passphrase <code>{DEFAULT_ADMIN_PASSPHRASE}</code></p>
              <button type="button" onClick={() => setRotating(true)}>Change them now</button>
            </div>
          </div>
        )}
        {rotated && <p className="support-cred-saved"><CheckCheck size={14} aria-hidden="true" /> Credentials updated. Sign in with your new passphrase.</p>}

        <label htmlFor={`${prefix}-user`}>{local ? "Username" : "Operator email"}</label>
        <input
          id={`${prefix}-user`} type={local ? "text" : "email"} required value={user} disabled={busy}
          autoComplete="username" onChange={event => setUser(event.target.value)}
          placeholder={local ? DEFAULT_ADMIN_USER : "you@your-website.com"}
        />

        <label htmlFor={`${prefix}-pass`}>{local ? "Passphrase" : "Password"}</label>
        <input
          id={`${prefix}-pass`} type="password" required value={password} disabled={busy}
          autoComplete="current-password" onChange={event => setPassword(event.target.value)}
        />

        <button type="submit" className="support-primary" disabled={busy}>
          {busy ? <LoaderCircle size={17} className="support-spin" /> : <LogIn size={17} />}
          {busy ? "Verifying..." : "Access duty inbox"}
        </button>

        <p className="support-small">
          {local
            ? "Local mode: this gate runs in the browser only and is not real access control. Enable live mode for server-enforced authentication."
            : "Access is limited to accounts approved in the support_operators table."}
        </p>
      </form>

      {rotating && (
        <div className="support-login support-rotate-wrap">
          <RotateCredentials onDone={() => { setRotating(false); setRotated(true); }} />
        </div>
      )}
    </div>
  );
}

/* ---------- inbox ---------- */
export function OperatorInbox({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const support = useSupport("operator", true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [kind, setKind] = useState<"all" | ThreadKind>("all");
  const [filter, setFilter] = useState("open");
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [actionError, setActionError] = useState("");
  const [changingStatus, setChangingStatus] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const selected = support.snapshot.threads.find(thread => thread.id === selectedId);
  const totalUnread = support.snapshot.threads.reduce((sum, thread) => sum + unreadCount(thread, support.snapshot.messages, "operator"), 0);
  const urgentCount = support.snapshot.threads.filter(thread => thread.urgent && thread.status !== "resolved").length;
  const handoffCount = support.snapshot.threads.filter(thread => thread.status === "awaiting_agent").length;
  const queryId = useId();
  const statusId = useId();
  const admin = localAdminState();

  useEffect(() => {
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (element && !element.open) element.showModal();
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const original = document.title;
    document.title = `${totalUnread ? `(${totalUnread}) ` : ""}Duty Inbox | FBI Online Support`;
    return () => { document.title = original; };
  }, [totalUnread]);

  const filtered = support.snapshot.threads.filter(thread => {
    const matchesKind = kind === "all" || thread.kind === kind;
    const matchesStatus = filter === "all" || (filter === "open" ? thread.status !== "resolved" : thread.status === "resolved");
    const matchesUrgent = !urgentOnly || thread.urgent;
    const needle = query.trim().toLowerCase();
    const matchesQuery = !needle || [
      thread.subject, thread.visitor_name, thread.category, thread.intent,
      thread.contact_email, thread.contact_phone, referenceFor(thread),
    ].some(value => String(value ?? "").toLowerCase().includes(needle));
    return matchesKind && matchesStatus && matchesUrgent && matchesQuery;
  });

  const updateStatus = async (status: ThreadStatus) => {
    if (!selected || changingStatus) return;
    setChangingStatus(true);
    setActionError("");
    try { await support.updateStatus(selected.id, status); }
    catch (reason) { setActionError(errorText(reason)); }
    finally { setChangingStatus(false); }
  };

  const logout = async () => {
    setSigningOut(true);
    setActionError("");
    try { await signOutOperator(); setSelectedId(null); support.retry(); }
    catch (reason) { setActionError(errorText(reason)); }
    finally { setSigningOut(false); }
  };

  const needsAuth = support.authRequired || (admin.required && !admin.granted);

  return (
    <dialog ref={dialog} className="support-operator-dialog support-ui" aria-labelledby="support-inbox-title" onCancel={event => { event.preventDefault(); onClose(); }}>
      <div className="support-operator-app">
        <header className="support-operator-header">
          <button type="button" className="support-icon-button" onClick={onClose} aria-label="Return to website"><ArrowLeft size={20} /></button>
          <span className="support-header-icon"><Headphones size={24} strokeWidth={1.6} /></span>
          <div>
            <span className="support-eyebrow">DUTY DESK WORKSPACE</span>
            <h1 id="support-inbox-title">Duty Inbox</h1>
          </div>
          <div className="support-operator-header-actions">
            <ConnectionLabel state={support.connection} />
            {urgentCount > 0 && <span className="support-urgent-pill"><Zap size={12} aria-hidden="true" /> {urgentCount} urgent</span>}
            {handoffCount > 0 && <span className="support-handoff-pill">{handoffCount} awaiting agent</span>}
            <a className="support-outline-button" href="#support-chat" target="_blank" rel="noopener noreferrer">Visitor view <ExternalLink size={14} /></a>
            {support.ready && <button type="button" className="support-outline-button" onClick={() => void logout()} disabled={signingOut}><LogOut size={14} /> Sign out</button>}
          </div>
        </header>

        <div className="support-operator-notice">
          <p>
            {supportMode === "local"
              ? <><strong>Local mode.</strong> Conversations live in this browser and sync across its tabs. Open the visitor widget in a second tab to test the full handoff.</>
              : <><strong>Live mode.</strong> Conversations are stored in your database and reachable from any device.</>}
            {" "}Automated triage is <strong>{aiMode === "provider" ? "drafting with your AI provider" : "running the built-in responder"}</strong>; you take over the moment you reply.
          </p>
          {supportMode === "local" && <details className="support-setup">
            <summary><Settings2 size={14} /> Go live across devices</summary>
            <div>
              <strong>Connect the shared queue</strong>
              <ol>
                <li>Create a Supabase project and run <code>supabase/support.sql</code>.</li>
                <li>Enable anonymous visitor sign-in, then create and approve an operator account.</li>
                <li>Set the public environment values from <code>.env.example</code> and redeploy.</li>
                <li>Optionally set <code>VITE_AI_ENDPOINT</code>, <code>VITE_AI_API_KEY</code>, and <code>VITE_AI_MODEL</code> for AI-drafted replies.</li>
                <li>Follow <code>SUPPORT_SETUP.md</code> to verify access policies before inviting visitors.</li>
              </ol>
              <p>Local conversations are not uploaded automatically.</p>
            </div>
          </details>}
        </div>

        <SupportError message={support.error} onRetry={support.retry} />
        <SupportError message={actionError} />

        {needsAuth ? <OperatorLogin support={support} /> : !support.ready ? (
          <div className="support-loading" role="status">
            {support.loading && <LoaderCircle size={30} className="support-spin" />}
            <span>{support.loading ? "Opening the duty inbox..." : "Couldn't open the inbox. Check the support configuration and try again."}</span>
            {!support.loading && <button type="button" className="support-primary" onClick={support.retry}>Retry connection</button>}
          </div>
        ) : (
          <div className={`support-workspace ${selected ? "support-workspace--selected" : ""}`}>
            <aside className="support-inbox-list" aria-label="Chats, complaints, and case reports">
              <div className="support-list-heading">
                <h2>Queue</h2>
                <span>{support.snapshot.threads.filter(thread => thread.status !== "resolved").length} open</span>
              </div>

              <nav className="support-inbox-tabs" aria-label="Filter request type">
                {([["all", "All"], ["chat", "Chats"], ["complaint", "Complaints"], ["report", "Reports"]] as const).map(([id, label]) => (
                  <button type="button" key={id} aria-pressed={kind === id} onClick={() => setKind(id)}>
                    {label}<span>{support.snapshot.threads.filter(thread => id === "all" || thread.kind === id).length}</span>
                  </button>
                ))}
              </nav>

              <div className="support-list-tools">
                <label className="support-search" htmlFor={queryId}>
                  <Search size={15} />
                  <input id={queryId} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search name, email, phone, reference" aria-label="Search queue" />
                </label>
                <div className="support-list-tools-row">
                  <label htmlFor={statusId} className="support-status-filter">
                    Show
                    <select id={statusId} value={filter} onChange={event => setFilter(event.target.value)}>
                      <option value="open">Open</option>
                      <option value="resolved">Resolved</option>
                      <option value="all">Everything</option>
                    </select>
                  </label>
                  <button type="button" className="support-urgent-toggle" aria-pressed={urgentOnly} onClick={() => setUrgentOnly(value => !value)}>
                    <Zap size={13} aria-hidden="true" /> Urgent{urgentCount > 0 && <span>{urgentCount}</span>}
                  </button>
                </div>
              </div>

              <div className="support-request-list-scroll">
                {filtered.map(thread => {
                  const unread = unreadCount(thread, support.snapshot.messages, "operator");
                  const threadMessages = messagesFor(support.snapshot, thread.id);
                  const latest = threadMessages[threadMessages.length - 1];
                  const prefix = latest?.sender === "operator" ? "You: " : latest?.sender === "bot" ? "Assistant: " : "";
                  return (
                    <button
                      type="button" key={thread.id}
                      className={`support-inbox-request ${selectedId === thread.id ? "support-inbox-request--selected" : ""} ${thread.urgent ? "support-inbox-request--urgent" : ""}`}
                      onClick={() => { setSelectedId(thread.id); setActionError(""); }}
                      aria-pressed={selectedId === thread.id}
                    >
                      <span className="support-inbox-request-top">
                        <span>
                          {thread.kind === "complaint" ? <FileText size={14} /> : thread.kind === "report" ? <Zap size={14} /> : <MessageCircle size={14} />}
                          {thread.visitor_name}
                          {thread.urgent && <em className="support-flag-urgent">Urgent</em>}
                        </span>
                        <time dateTime={thread.updated_at}>{new Date(thread.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</time>
                      </span>
                      <strong>{thread.subject}</strong>
                      <p>{prefix}{latest?.body}</p>
                      <span className="support-inbox-request-bottom">
                        <StatusBadge status={thread.status} />
                        <span className="support-list-reference">{referenceFor(thread)}</span>
                        {contactComplete(thread) && <span className="support-flag-contact" title="Contact details captured">Contact ✓</span>}
                        {unread > 0 && <span className="support-count" aria-label={`${unread} unread messages`}>{unread}</span>}
                      </span>
                    </button>
                  );
                })}
                {!filtered.length && (
                  <div className="support-empty">
                    <Inbox size={29} strokeWidth={1.5} />
                    <h3>{support.snapshot.threads.length ? "No matching requests" : "The queue is clear"}</h3>
                    <p>{support.snapshot.threads.length ? "Try a different search or filter." : "Visitor chats, complaints, and filed case reports land here — the assistant collects contact details first."}</p>
                    {support.snapshot.threads.length > 0
                      ? <button type="button" className="support-text-button" onClick={() => { setQuery(""); setKind("all"); setFilter("all"); setUrgentOnly(false); }}>Clear filters</button>
                      : <a href="#support-chat" target="_blank" rel="noopener noreferrer" className="support-text-button">Open the visitor widget <ExternalLink size={13} /></a>}
                  </div>
                )}
              </div>

              <div className="support-inbox-list-footer">
                <CheckCheck size={14} />
                {supportMode === "local" ? "Synced across this browser's tabs" : "Saved to the support database"}
              </div>
            </aside>

            <main className="support-inbox-conversation">
              {selected ? (
                <>
                  <header className="support-operator-thread-header">
                    <div className="support-operator-thread-title">
                      <button type="button" className="support-icon-button support-mobile-back" onClick={() => setSelectedId(null)} aria-label="Back to queue"><ArrowLeft size={18} /></button>
                      <div>
                        <span className="support-eyebrow">{KIND_LABELS[selected.kind].toUpperCase()} / {referenceFor(selected)}</span>
                        <h2>{selected.subject}</h2>
                        <p>
                          {selected.visitor_name} <span aria-hidden="true">/</span> {selected.category}
                          {selected.intent && <><span aria-hidden="true">/</span> {selected.intent}</>}
                        </p>
                      </div>
                    </div>
                    <div className="support-thread-actions">
                      <label htmlFor="support-update-status">Status</label>
                      <select id="support-update-status" value={selected.status} disabled={changingStatus} onChange={event => void updateStatus(event.target.value as ThreadStatus)}>
                        {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                      <button type="button" className="support-icon-button" title="Download transcript" aria-label="Download transcript" onClick={() => downloadTranscript(selected, messagesFor(support.snapshot, selected.id))}>
                        <Download size={17} />
                      </button>
                    </div>
                  </header>

                  {selected.urgent && (
                    <div className="support-urgent-banner">
                      <ShieldAlert size={16} aria-hidden="true" />
                      <span><strong>Flagged urgent by automated triage.</strong> Possible threat to safety, sextortion, or funds in transit. Confirm whether 911 has been called.</span>
                    </div>
                  )}

                  <div className="support-operator-body">
                    <Conversation key={selected.id} thread={selected} support={support} role="operator" />
                    <aside className="support-operator-sidebar" aria-label="Case details">
                      <h3>Case file</h3>
                      {contactComplete(selected)
                        ? <ContactSummary thread={selected} />
                        : <p className="support-no-contact">No contact details captured yet. The assistant asks for name, email, phone, and location during intake.</p>}

                      <dl className="support-case-meta">
                        <div><dt>Reference</dt><dd className="support-mono">{referenceFor(selected)}</dd></div>
                        <div><dt>Type</dt><dd>{KIND_LABELS[selected.kind]}</dd></div>
                        <div><dt>Detected intent</dt><dd>{selected.intent || "Unclassified"}</dd></div>
                        <div><dt>Handoff requested</dt><dd>{selected.handoff_requested_at ? new Date(selected.handoff_requested_at).toLocaleString() : "Not yet"}</dd></div>
                        <div><dt>Opened</dt><dd>{new Date(selected.created_at).toLocaleString()}</dd></div>
                        <div><dt>Messages</dt><dd>{messagesFor(support.snapshot, selected.id).length}</dd></div>
                      </dl>

                      <div className="support-agent-shortcuts">
                        <h4>Quick contact</h4>
                        {selected.contact_phone && (
                          <div className="support-shortcut-row">
                            <a href={`tel:${selected.contact_phone.replace(/[^\d+]/g, "")}`}>Call {selected.contact_phone}</a>
                            <a href={`sms:${selected.contact_phone.replace(/[^\d+]/g, "")}`}>Text</a>
                          </div>
                        )}
                        {selected.contact_email && <a className="support-shortcut-mail" href={`mailto:${selected.contact_email}`}>{selected.contact_email}</a>}
                        {!selected.contact_phone && !selected.contact_email && <p className="support-no-contact">Nothing to contact yet.</p>}
                      </div>

                      <a className="support-primary support-sidebar-cta" href="#support-chat" target="_blank" rel="noopener noreferrer">
                        Test as visitor <ArrowRight size={15} />
                      </a>
                    </aside>
                  </div>
                </>
              ) : (
                <div className="support-inbox-welcome">
                  <span className="support-welcome-icon"><Headphones size={37} strokeWidth={1.3} /></span>
                  <span className="support-eyebrow">A CONVERSATION STARTS HERE</span>
                  <h2>Be there when they need you.</h2>
                  <p>
                    The automated assistant answers instantly, classifies the matter, and collects
                    name, email, phone, location, and any loss details. Select a case to read the
                    transcript and take over.
                  </p>
                  <div className="support-inbox-welcome-line" />
                  <a href="#support-chat" target="_blank" rel="noopener noreferrer" className="support-primary">Open visitor chat <ArrowRight size={16} /></a>
                  <span className="support-small">
                    {supportMode === "local" ? "Send a message in another tab, watch triage respond, then reply here." : "Visitors can leave a message even when you are away."}
                  </span>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </dialog>
  );
}
