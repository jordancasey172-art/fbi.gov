import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  AlertCircle, BadgeCheck, Bot, Check, CheckCheck, FileText, Headphones, Info,
  LoaderCircle, Mail, MapPin, MessageCircle, Phone, Send, Smartphone, UserRound, Zap,
} from "lucide-react";
import { AGENT_LINE, IC3 } from "../data";
import {
  CONTACT_PREFERENCES, EMAIL_RE, STATUS_LABELS, contactComplete, errorText, messagesFor,
  newId, normalizePhone, unreadCount, validateContact,
  type ContactDetails, type ConnectionState, type SupportMessage, type SupportRole,
  type SupportThread, type ThreadStatus,
} from "./model";
import { aiMode, buildBotReply, providerReply } from "./triage";
import { useWindowActive, type SupportController } from "./useSupport";

export function SupportNotice() {
  return (
    <div className="support-notice">
      <Info size={15} aria-hidden="true" />
      <p>
        <strong>Automated triage answers first, then a duty agent takes over.</strong>{" "}
        For scams and internet crime, file at{" "}
        <a href={IC3.url} target="_blank" rel="noopener noreferrer">{IC3.host}</a>, or reach a
        Special Agent at <a href={`tel:${AGENT_LINE.tel}`}>{AGENT_LINE.display}</a>. Emergencies: 911.
      </p>
    </div>
  );
}

export function ConnectionLabel({ state }: { state: ConnectionState }) {
  const labels: Record<ConnectionState, string> = {
    local: "Triage assistant online",
    connecting: "Connecting to duty desk...",
    connected: "Secure channel active",
    reconnecting: "Reconnecting channel...",
  };
  return (
    <span className={`support-connection support-connection--${state}`}>
      <span aria-hidden="true" />
      {labels[state]}
      <em>{aiMode === "provider" ? "AI drafting on" : "Built-in responder"}</em>
    </span>
  );
}

export function SupportError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  if (!message) return null;
  return (
    <div className="support-error" role="alert">
      <AlertCircle size={16} aria-hidden="true" />
      <span>{message}</span>
      {onRetry && <button type="button" onClick={onRetry}>Retry</button>}
    </div>
  );
}

export function StatusBadge({ status }: { status: ThreadStatus }) {
  return (
    <span className={`support-status support-status--${status}`}>
      {status === "resolved" && <Check size={11} aria-hidden="true" />}
      {status === "awaiting_agent" && <Zap size={11} aria-hidden="true" />}
      {status === "bot_intake" && <Bot size={11} aria-hidden="true" />}
      {STATUS_LABELS[status]}
    </span>
  );
}

export function MessageComposer({ onSend, disabled, operator = false, placeholder }: {
  onSend: (body: string, id: string) => Promise<void>;
  disabled?: boolean;
  operator?: boolean;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const busyRef = useRef(false);
  const pending = useRef<{ body: string; id: string } | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const inputId = useId();

  const send = async (event?: FormEvent) => {
    event?.preventDefault();
    if (busyRef.current || disabled || !draft.trim()) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    setSent(false);
    const message = pending.current?.body === draft.trim()
      ? pending.current : { body: draft.trim(), id: newId() };
    pending.current = message;
    try {
      await onSend(message.body, message.id);
      setDraft("");
      pending.current = null;
      setSent(true);
    } catch (reason) {
      setError(errorText(reason));
    } finally {
      busyRef.current = false;
      setBusy(false);
      requestAnimationFrame(() => textarea.current?.focus());
    }
  };

  return (
    <form className="support-composer" onSubmit={event => void send(event)}>
      <SupportError message={error} />
      <label htmlFor={inputId} className="support-sr-only">{operator ? "Reply to visitor" : "Your message"}</label>
      <div className="support-composer-input">
        <textarea
          ref={textarea} id={inputId} rows={2} maxLength={2000} value={draft}
          disabled={disabled || busy}
          placeholder={placeholder ?? (operator ? "Write a reply to this visitor..." : "Write your message...")}
          onChange={event => { setDraft(event.target.value); setSent(false); }}
          onKeyDown={event => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              void send();
            }
          }}
        />
        <button type="submit" disabled={disabled || busy || !draft.trim()} aria-label={busy ? "Sending message" : "Send message"} title="Send message">
          {busy ? <LoaderCircle className="support-spin" size={18} /> : <Send size={18} />}
        </button>
      </div>
      <div className="support-composer-hint">
        <span role="status">{sent ? <><CheckCheck size={12} /> Message saved</> : "Enter to send. Shift + Enter for a new line."}</span>
        <span>{draft.length}/2000</span>
      </div>
    </form>
  );
}

/** Quick-reply chips offered by the triage assistant. */
export function QuickReplies({ options, onPick, disabled }: { options: string[]; onPick: (text: string) => void; disabled?: boolean }) {
  if (!options.length) return null;
  return (
    <div className="support-quick-replies">
      {options.map(option => (
        <button key={option} type="button" disabled={disabled} onClick={() => onPick(option)}>{option}</button>
      ))}
    </div>
  );
}

/* ---------- contact capture ---------- */

const EMPTY: ContactDetails = {
  contact_name: "", contact_email: "", contact_phone: "", contact_location: "",
  contact_preference: "any", loss_amount: "", transaction_ref: "", contact_saved_at: null,
};

export function ContactForm({ thread, support, onDone, compact = false }: {
  thread: SupportThread;
  support: SupportController;
  onDone?: () => void;
  compact?: boolean;
}) {
  const [form, setForm] = useState<ContactDetails>({ ...EMPTY, ...thread });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const prefix = useId();
  const set = <K extends keyof ContactDetails>(key: K, value: ContactDetails[K]) =>
    setForm(current => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      validateContact(form, { emailRequired: true, phoneRequired: true });
      await support.saveContactDetails(thread.id, form);
      onDone?.();
    } catch (reason) {
      setError(errorText(reason));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={`support-contact-form ${compact ? "support-contact-form--compact" : ""}`} onSubmit={event => void submit(event)}>
      <div className="support-contact-intro">
        <Headphones size={19} aria-hidden="true" />
        <div>
          <h3>How should an agent reach you?</h3>
          <p>These details are attached to your case file so a duty agent can follow up after the report. Nothing here is published.</p>
        </div>
      </div>
      <SupportError message={error} />
      <fieldset disabled={busy}>
        <div className="support-field-grid">
          <div>
            <label htmlFor={`${prefix}-name`}>Full name <span aria-hidden="true">*</span></label>
            <input id={`${prefix}-name`} required maxLength={90} value={form.contact_name}
              onChange={event => set("contact_name", event.target.value)} placeholder="Jane A. Doe" autoComplete="name" />
          </div>
          <div>
            <label htmlFor={`${prefix}-email`}>Email address <span aria-hidden="true">*</span></label>
            <input id={`${prefix}-email`} type="email" required maxLength={160} value={form.contact_email}
              onChange={event => set("contact_email", event.target.value)} placeholder="you@example.com" autoComplete="email" />
          </div>
          <div>
            <label htmlFor={`${prefix}-phone`}>Phone number <span aria-hidden="true">*</span></label>
            <input id={`${prefix}-phone`} type="tel" required maxLength={40} value={form.contact_phone}
              onChange={event => set("contact_phone", event.target.value)} placeholder="+1 555 010 0100" autoComplete="tel" />
          </div>
          <div>
            <label htmlFor={`${prefix}-loc`}>City / State / Country</label>
            <input id={`${prefix}-loc`} maxLength={120} value={form.contact_location}
              onChange={event => set("contact_location", event.target.value)} placeholder="Tampa, FL, USA" />
          </div>
          <div>
            <label htmlFor={`${prefix}-loss`}>Amount lost (if any)</label>
            <input id={`${prefix}-loss`} maxLength={60} value={form.loss_amount}
              onChange={event => set("loss_amount", event.target.value)} placeholder="$12,500" />
          </div>
          <div>
            <label htmlFor={`${prefix}-tx`}>Transaction / wallet / reference ID</label>
            <input id={`${prefix}-tx`} maxLength={200} value={form.transaction_ref}
              onChange={event => set("transaction_ref", event.target.value)} placeholder="0x8f2c… or wire ref" />
          </div>
        </div>

        <label htmlFor={`${prefix}-pref`}>Preferred contact method</label>
        <select id={`${prefix}-pref`} value={form.contact_preference}
          onChange={event => set("contact_preference", event.target.value as ContactDetails["contact_preference"])}>
          {CONTACT_PREFERENCES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>

        <button type="submit" className="support-primary" disabled={busy}>
          {busy ? <><LoaderCircle size={16} className="support-spin" /> Saving...</> : <><BadgeCheck size={16} /> Save contact details</>}
        </button>
        <p className="support-small">
          An agent may contact you by your chosen method. Keep your reference number{" "}
          <strong>{thread.id.slice(0, 8).toUpperCase()}</strong> for follow-up.
        </p>
      </fieldset>
    </form>
  );
}

export function ContactSummary({ thread, onEdit }: { thread: SupportThread; onEdit?: () => void }) {
  const rows = [
    { icon: UserRound, label: "Name", value: thread.contact_name },
    { icon: Mail, label: "Email", value: thread.contact_email, href: thread.contact_email ? `mailto:${thread.contact_email}` : undefined },
    { icon: Phone, label: "Phone", value: thread.contact_phone, href: thread.contact_phone ? `tel:${thread.contact_phone.replace(/[^\d+]/g, "")}` : undefined },
    { icon: Smartphone, label: "Prefers", value: CONTACT_PREFERENCES.find(p => p.value === thread.contact_preference)?.label },
    { icon: MapPin, label: "Location", value: thread.contact_location },
    { label: "Loss", value: thread.loss_amount },
    { label: "Reference", value: thread.transaction_ref },
  ].filter(row => row.value);

  if (!rows.length) return null;
  return (
    <div className="support-contact-summary">
      <div className="support-contact-summary-head">
        <span><BadgeCheck size={14} aria-hidden="true" /> Contact details on file</span>
        {onEdit && <button type="button" onClick={onEdit}>Update</button>}
      </div>
      <dl>
        {rows.map(row => (
          <div key={row.label}>
            <dt>{row.icon ? <row.icon size={12} aria-hidden="true" /> : null}{row.label}</dt>
            <dd>{row.href ? <a href={row.href}>{row.value}</a> : row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ---------- automated triage responder ---------- */

export function useTriageResponder(thread: SupportThread, support: SupportController, active: boolean) {
  const [typing, setTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const running = useRef("");

  useEffect(() => {
    if (!active || !support.ready) return;
    // Once a human is engaged or the case is closed, the assistant stays quiet.
    if (thread.status === "in_progress" || thread.status === "resolved") {
      setQuickReplies([]);
      setTyping(false);
      return;
    }
    const transcript = messagesFor(support.snapshot, thread.id);
    const last = transcript[transcript.length - 1];
    if (!last || last.sender !== "visitor") return;

    // Deterministic id means two open tabs cannot both post the same reply.
    const botId = `bot-${last.id}`;
    if (transcript.some(m => m.id === botId) || running.current === botId) return;
    running.current = botId;
    setTyping(true);

    const delay = 900 + Math.min(2200, last.body.length * 14);
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const reply = buildBotReply(thread, support.snapshot);
          setQuickReplies(reply.quickReplies);
          const drafted = await providerReply(thread, support.snapshot);
          await support.botReply(thread.id, drafted ?? reply.body, botId, reply.extracted);
          if (reply.handoff) await support.handoff(thread.id, "awaiting_agent", reply.urgent, reply.intentId);
        } catch {
          // The visitor can retry; never fabricate a successful response.
        } finally {
          setTyping(false);
        }
      })();
    }, delay);

    return () => { window.clearTimeout(timer); setTyping(false); };
  }, [active, support.ready, support.snapshot, thread, support.botReply, support.handoff]);

  return { typing, quickReplies };
}

/* ---------- conversation ---------- */

export function Conversation({ thread, support, role, visible = true }: {
  thread: SupportThread;
  support: SupportController;
  role: SupportRole;
  visible?: boolean;
}) {
  const log = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const lastMarked = useRef("");
  const [readError, setReadError] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [quickPick, setQuickPick] = useState<{ text: string; id: string } | null>(null);
  const active = useWindowActive();
  const messages = messagesFor(support.snapshot, thread.id);
  const latestIncoming = [...messages].reverse().find(m => m.sender !== role && m.sender !== "bot");
  const unseen = unreadCount(thread, messages, role);
  const lastMessage = messages[messages.length - 1];

  const isVisitor = role === "visitor";
  const { typing, quickReplies } = useTriageResponder(thread, support, visible && isVisitor);
  const botEngaged = thread.status === "bot_intake" || thread.status === "awaiting_agent";
  const awaitingAgent = thread.status === "awaiting_agent";

  useEffect(() => {
    if (log.current && (nearBottom.current || lastMessage?.sender === role || typing)) {
      log.current.scrollTop = log.current.scrollHeight;
    }
  }, [messages.length, lastMessage?.sender, role, visible, typing]);

  useEffect(() => {
    const marker = `${thread.id}:${latestIncoming?.created_at}`;
    if (!visible || !active || !unseen || !latestIncoming || lastMarked.current === marker) return;
    lastMarked.current = marker;
    void support.read(thread.id, latestIncoming.created_at)
      .then(() => setReadError(""))
      .catch(() => setReadError("Your messages are available, but the read status could not be updated."));
  }, [visible, active, unseen, latestIncoming?.created_at, thread.id, support.read]);

  // Fire a quick reply through the same path as a typed message.
  useEffect(() => {
    if (!quickPick) return;
    const { text, id } = quickPick;
    setQuickPick(null);
    void support.send(thread.id, text, id).catch(() => undefined);
  }, [quickPick, support, thread.id]);

  const sendQuickReply = (text: string) => setQuickPick({ text, id: newId() });

  const escalate = async () => {
    try { await support.handoff(thread.id, "awaiting_agent", thread.urgent, thread.intent); }
    catch { /* surfaced by the composer error path */ }
  };

  return (
    <div className="support-conversation">
      <div className="support-message-log" ref={log} role="log" aria-label="Conversation messages" aria-live="polite" aria-relevant="additions text" onScroll={() => {
        const element = log.current;
        if (element) nearBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
      }}>
        <div className="support-conversation-start">
          {thread.kind === "complaint" ? <FileText size={21} /> : thread.kind === "report" ? <Zap size={21} /> : <MessageCircle size={21} />}
          <strong>{thread.intent || "Case opened"}</strong>
          <span>{new Date(thread.created_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
          <p>
            {isVisitor
              ? "The automated assistant collects the essentials, then a duty agent picks up the full transcript."
              : "Automated intake transcript and contact details captured from the visitor."}
          </p>
        </div>

        {messages.map(message => <Bubble key={message.id} message={message} role={role} visitorName={thread.visitor_name} />)}

        {typing && (
          <div className="support-message support-message--bot">
            <span className="support-message-author"><Bot size={11} aria-hidden="true" /> Triage assistant is writing</span>
            <p className="support-typing"><i /><i /><i /></p>
          </div>
        )}

        {awaitingAgent && !typing && (
          <p className="support-waiting support-waiting--urgent">
            <Zap size={12} aria-hidden="true" /> Queued for a duty agent — your reference and full transcript have been forwarded.
            {isVisitor && <> Need someone immediately? Call or text <a href={`tel:${AGENT_LINE.tel}`}>{AGENT_LINE.display}</a>.</>}
          </p>
        )}
        {botEngaged && !awaitingAgent && !typing && (
          <p className="support-waiting">Automated intake in progress. Ask for an agent at any time.</p>
        )}

        {isVisitor && contactComplete(thread) && !showContactForm && (
          <ContactSummary thread={thread} onEdit={() => setShowContactForm(true)} />
        )}
        {isVisitor && showContactForm && (
          <ContactForm thread={thread} support={support} compact onDone={() => setShowContactForm(false)} />
        )}
      </div>

      <SupportError message={readError} />

      {thread.status === "resolved" ? (
        <div className="support-resolved">
          <CheckCheck size={19} />
          <div>
            <strong>This request is resolved.</strong>
            <span>{role === "operator" ? "Change the status above to reopen the conversation." : "You can still read your messages or start a new request."}</span>
          </div>
        </div>
      ) : (
        <>
          {isVisitor && botEngaged && !typing && (
            <QuickReplies options={quickReplies} onPick={sendQuickReply} disabled={!support.ready} />
          )}
          <div className="support-composer-row">
            <MessageComposer
              disabled={!support.ready || typing}
              operator={role === "operator"}
              placeholder={typing ? "Triage assistant is responding..." : undefined}
              onSend={(body, id) => support.send(thread.id, body, id)}
            />
            {isVisitor && !awaitingAgent && thread.status !== "in_progress" && (
              <div className="support-escalate">
                <button type="button" className="support-outline-dark" onClick={() => void escalate()} disabled={!support.ready}>
                  <Headphones size={14} /> Skip to a live agent
                </button>
                {!contactComplete(thread) && (
                  <button type="button" className="support-outline-dark" onClick={() => setShowContactForm(true)} disabled={!support.ready}>
                    <Mail size={14} /> Add contact details
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Bubble({ message, role, visitorName }: { message: SupportMessage; role: SupportRole; visitorName: string }) {
  const own = message.sender === role;
  const isBot = message.sender === "bot";
  const author = isBot ? "Automated Triage Assistant" : message.sender === "operator" ? "Duty Agent" : role === "visitor" ? "You" : visitorName;
  return (
    <div className={`support-message ${own ? "support-message--own" : ""} ${isBot ? "support-message--bot" : ""}`}>
      <span className="support-message-author">
        {isBot && <Bot size={11} aria-hidden="true" />}
        {message.sender === "operator" && <Headphones size={11} aria-hidden="true" />}
        {author}
        {isBot && <em>automated</em>}
      </span>
      <p>{message.body}</p>
      <time dateTime={message.created_at} title={new Date(message.created_at).toLocaleString()}>
        {new Date(message.created_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
        {own && <Check size={11} aria-label="Saved" />}
      </time>
    </div>
  );
}

export function emailValid(value: string) {
  return EMAIL_RE.test(value.trim());
}

export function phoneValid(value: string) {
  return Boolean(normalizePhone(value));
}
