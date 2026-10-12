import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Download, FileText, Headphones, History, LoaderCircle, MessageCircle, Plus, X } from "lucide-react";
import {
  COMPLAINT_CATEGORIES, downloadTranscript, errorText, messagesFor, newId,
  referenceFor, unreadCount, type SupportThread,
} from "./model";
import { ConnectionLabel, Conversation, MessageComposer, StatusBadge, SupportError, SupportNotice } from "./shared";
import { classifyIntent, detectUrgency } from "./triage";
import { type SupportController } from "./useSupport";

export type VisitorTab = "chat" | "complaint" | "requests";

function ComplaintForm({ support, onView }: { support: SupportController; onView: (id: string) => void }) {
  const [form, setForm] = useState({ name: "", subject: "", category: "", body: "", consent: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);
  const requestId = useRef(newId());
  const messageId = useRef(newId());
  const busyRef = useRef(false);
  const prefix = useId();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busyRef.current || !support.ready) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      const id = await support.create({ ...form, id: requestId.current, messageId: messageId.current, kind: "complaint" });
      setReceipt(id);
    } catch (reason) { setError(errorText(reason)); }
    finally { setBusy(false); busyRef.current = false; }
  };

  if (receipt) {
    return (
      <div className="support-receipt" role="status">
        <CheckCircle2 size={40} strokeWidth={1.5} />
        <h3>Complaint Logged</h3>
        <p>Your concern has been submitted to the support desk. Please retain your reference number below:</p>
        <span className="support-reference">{referenceFor({ id: receipt, kind: "complaint" })}</span>
        <p className="support-small">You can view status updates and replies under My Requests.</p>
        <button type="button" className="support-primary" onClick={() => onView(receipt)}>View Case & Replies <ArrowRight size={15} /></button>
        <button type="button" className="support-text-button" onClick={() => {
          setReceipt(null);
          setForm({ name: "", subject: "", category: "", body: "", consent: false });
          requestId.current = newId();
          messageId.current = newId();
        }}>File Another Concern</button>
      </div>
    );
  }

  return (
    <form className="support-complaint-form" onSubmit={event => void submit(event)}>
      <div className="support-form-intro"><h3>File a website complaint</h3><p>Tell the site owner what went wrong. You can follow the response in My requests.</p></div>
      <SupportError message={error} />
      <fieldset disabled={busy || !support.ready}>
        <label htmlFor={`${prefix}-name`}>Display name <span>(optional)</span></label>
        <input id={`${prefix}-name`} maxLength={60} value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="A nickname is fine" autoComplete="off" />
        <label htmlFor={`${prefix}-category`}>Complaint category <span aria-hidden="true">*</span></label>
        <select id={`${prefix}-category`} required value={form.category} onChange={event => setForm({ ...form, category: event.target.value })}>
          <option value="">Select a category</option>
          {COMPLAINT_CATEGORIES.map(category => <option key={category}>{category}</option>)}
        </select>
        <label htmlFor={`${prefix}-subject`}>Subject <span aria-hidden="true">*</span></label>
        <input id={`${prefix}-subject`} required minLength={3} maxLength={120} value={form.subject} onChange={event => setForm({ ...form, subject: event.target.value })} placeholder="Briefly summarize your concern" />
        <label htmlFor={`${prefix}-details`}>What happened? <span aria-hidden="true">*</span></label>
        <textarea id={`${prefix}-details`} rows={4} required minLength={20} maxLength={2000} value={form.body} onChange={event => setForm({ ...form, body: event.target.value })} placeholder="Describe the website issue and how we could help. Do not include private information or allegations about real people." aria-describedby={`${prefix}-count`} />
        <div className="support-field-hint" id={`${prefix}-count`}>At least 20 characters <span>{form.body.length}/2000</span></div>
        <label className="support-consent" htmlFor={`${prefix}-consent`}>
          <input id={`${prefix}-consent`} type="checkbox" required checked={form.consent} onChange={event => setForm({ ...form, consent: event.target.checked })} />
          <span>I certify that this information is accurate to the best of my knowledge.</span>
        </label>
        <button type="submit" className="support-primary" disabled={busy || !support.ready}>
          {busy ? <><LoaderCircle size={16} className="support-spin" /> Transmitting...</> : <><FileText size={16} /> Submit Complaint</>}
        </button>
      </fieldset>
      <p className="support-storage-note">Secure Support Portal • Transmitted to Duty Desk</p>
    </form>
  );
}

export function VisitorWidget({ open, tab, setTab, onClose, support }: {
  open: boolean;
  tab: VisitorTab;
  setTab: (tab: VisitorTab) => void;
  onClose: () => void;
  support: SupportController;
}) {
  const [selectedId, setSelectedId] = useState<string | null | undefined>(undefined);
  const [name, setName] = useState("");
  const panel = useRef<HTMLElement>(null);
  const nicknameId = useId();
  const selected = support.snapshot.threads.find(thread => thread.id === selectedId);
  const unseen = support.snapshot.threads.reduce((sum, thread) => sum + unreadCount(thread, support.snapshot.messages, "visitor"), 0);

  useEffect(() => {
    if (support.ready && selectedId === undefined) {
      setSelectedId(support.snapshot.threads.find(thread => thread.kind === "chat" && thread.status !== "resolved")?.id ?? null);
    }
  }, [support.ready, support.snapshot.threads, selectedId]);

  useEffect(() => {
    if (open) panel.current?.focus({ preventScroll: true });
  }, [open]);

  const viewRequest = (id: string) => { setSelectedId(id); setTab("chat"); };
  const startChat = async (body: string, id: string) => {
    // Classify immediately so the duty queue can sort and filter from message one.
    const intent = classifyIntent(body);
    const request = await support.create({
      id, messageId: id, name, kind: "chat",
      subject: body.replace(/\s+/g, " ").slice(0, 80).padEnd(3, "."),
      category: intent.label, body, consent: true,
      intent: intent.label, urgent: detectUrgency(body),
    });
    setSelectedId(request);
  };

  return (
    <section ref={panel} id="site-support-panel" className="support-panel" hidden={!open} role="dialog" aria-label="FBI Online Support and Case Inquiries" tabIndex={-1} onKeyDown={event => {
      if (event.key === "Escape") { event.stopPropagation(); onClose(); }
    }}>
      <header className="support-panel-header">
        <span className="support-header-icon"><Headphones size={23} strokeWidth={1.7} /></span>
        <div><h2>FBI Online Assistance</h2><p>Live Duty Desk & Case Inquiries</p></div>
        <button type="button" className="support-icon-button" onClick={onClose} aria-label="Close support chat"><X size={20} /></button>
      </header>
      <div className="support-mode-line"><ConnectionLabel state={support.connection} /><span>24/7 Desk</span></div>
      <SupportNotice />
      <nav className="support-tabs" aria-label="Support sections">
        <button type="button" aria-pressed={tab === "chat"} onClick={() => setTab("chat")}><MessageCircle size={15} /> Live Chat</button>
        <button type="button" aria-pressed={tab === "complaint"} onClick={() => setTab("complaint")}><FileText size={15} /> File Complaint</button>
        <button type="button" aria-pressed={tab === "requests"} onClick={() => setTab("requests")}><History size={15} /> My Requests{unseen > 0 && <span className="support-count">{unseen}</span>}</button>
      </nav>
      <SupportError message={support.error} onRetry={support.retry} />
      {!support.ready ? (
        <div className="support-loading" role="status">{support.loading ? <><LoaderCircle size={23} className="support-spin" /><span>Connecting to duty desk...</span></> : <><MessageCircle size={28} /><span>Support desk is temporarily unavailable.</span><button type="button" className="support-text-button" onClick={support.retry}>Try connecting again</button></>}</div>
      ) : (
        <div className="support-tab-content">
          <div hidden={tab !== "chat"} className="support-chat-tab">
            {selected ? (
              <>
                <div className="support-thread-heading">
                  <button type="button" className="support-icon-button" onClick={() => setTab("requests")} aria-label="View all requests"><ArrowLeft size={16} /></button>
                  <div><strong title={selected.subject}>{selected.subject}</strong><span>{referenceFor(selected)} <StatusBadge status={selected.status} /></span></div>
                  <button type="button" className="support-icon-button" title="Download conversation" aria-label="Download conversation" onClick={() => downloadTranscript(selected, messagesFor(support.snapshot, selected.id))}><Download size={16} /></button>
                  <button type="button" className="support-icon-button" title="Start a new chat" aria-label="Start a new chat" onClick={() => setSelectedId(null)}><Plus size={18} /></button>
                </div>
                <Conversation key={selected.id} thread={selected} support={support} role="visitor" visible={open && tab === "chat"} />
              </>
            ) : (
              <div className="support-new-chat">
                <div className="support-new-chat-intro">
                  <span className="support-welcome-icon"><MessageCircle size={25} strokeWidth={1.5} /></span>
                  <h3>Describe what happened.</h3>
                  <p>
                    An automated assistant answers instantly, gives you protective steps, and collects
                    your contact details. Say <strong>"agent"</strong> at any point and a duty agent
                    takes over with the full transcript.
                  </p>

                  <div className="support-starters">
                    <span>Common reports</span>
                    <div>
                      {[
                        "I lost money to a crypto investment site",
                        "Someone is blackmailing me with photos",
                        "A caller claimed to be an FBI agent",
                        "My business was hit by ransomware",
                        "My elderly parent was scammed",
                      ].map(starter => (
                        <button key={starter} type="button" onClick={() => void startChat(starter, newId())}>{starter}</button>
                      ))}
                    </div>
                  </div>

                  <label htmlFor={nicknameId}>Your name <span>(optional)</span></label>
                  <input id={nicknameId} value={name} maxLength={60} onChange={event => setName(event.target.value)} placeholder="Name an agent can use" autoComplete="off" />
                  <p className="support-small">
                    If someone is in immediate danger, stop and call 911. The assistant never asks for
                    passwords or full card numbers.
                  </p>
                </div>
                <MessageComposer onSend={startChat} disabled={!support.ready} placeholder="Describe the scam, threat, or problem..." />
              </div>
            )}
          </div>
          <div hidden={tab !== "complaint"} className="support-scroll-tab"><ComplaintForm support={support} onView={viewRequest} /></div>
          <div hidden={tab !== "requests"} className="support-scroll-tab">
            <div className="support-requests-heading"><h3>Your Active Inquiries</h3><p>Follow status updates and replies below.</p></div>
            {support.snapshot.threads.length ? support.snapshot.threads.map(thread => <VisitorRequest key={thread.id} thread={thread} support={support} onSelect={() => viewRequest(thread.id)} />) : (
              <div className="support-empty"><History size={29} strokeWidth={1.4} /><h3>No Active Inquiries</h3><p>Your chats and submitted complaints will appear here.</p><button type="button" className="support-text-button" onClick={() => setTab("chat")}>Start a conversation <ArrowRight size={14} /></button></div>
            )}
          </div>
        </div>
      )}
      <footer className="support-panel-footer"><span>FBI Online Support Portal</span><a href="#support-inbox" target="_blank" rel="noopener noreferrer">Staff Portal <ArrowRight size={11} /></a></footer>
    </section>
  );
}

function VisitorRequest({ thread, support, onSelect }: { thread: SupportThread; support: SupportController; onSelect: () => void }) {
  const unread = unreadCount(thread, support.snapshot.messages, "visitor");
  return (
    <button type="button" className="support-visitor-request" onClick={onSelect}>
      <span className="support-request-icon">{thread.kind === "complaint" ? <FileText size={18} /> : <MessageCircle size={18} />}</span>
      <span><strong>{thread.subject}</strong><span className="support-request-meta">{referenceFor(thread)} <StatusBadge status={thread.status} /></span></span>
      {unread > 0 ? <span className="support-count">{unread}</span> : <ChevronRight size={16} />}
    </button>
  );
}