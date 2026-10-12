import {
  EMPTY_CONTACT, newId, normalizeStatus, normalizeThread, validateMessage, validateRequest,
  type ContactDetails, type MessageSender, type NewRequest, type SupportMessage,
  type SupportRole, type SupportSnapshot, type SupportThread, type ThreadStatus,
} from "./model";

const PREFIX = "demo-site-support:v1:";
const CHANGE_EVENT = "demo-site-support-change";

type SupportEvent = { at: string } & (
  | { type: "create"; thread: SupportThread; message: SupportMessage }
  | { type: "message"; message: SupportMessage }
  | { type: "status"; threadId: string; status: ThreadStatus }
  | { type: "read"; threadId: string; role: SupportRole; until: string }
  | { type: "contact"; threadId: string; patch: Partial<ContactDetails> }
  | { type: "handoff"; threadId: string; urgent?: boolean; intent?: string }
);

export function hasLocalSession() {
  try { return Boolean(localStorage.getItem(`${PREFIX}visitor`)); }
  catch { return false; }
}

export function localVisitorId() {
  try {
    const existing = localStorage.getItem(`${PREFIX}visitor`);
    if (existing) return existing;
    const id = newId();
    localStorage.setItem(`${PREFIX}visitor`, id);
    return id;
  } catch {
    throw new Error("Browser storage is unavailable. Enable storage for this site to use live chat.");
  }
}

function readEvents(): SupportEvent[] {
  try {
    const events: SupportEvent[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(`${PREFIX}event:`)) continue;
      const value: unknown = JSON.parse(localStorage.getItem(key) || "null");
      if (!value || typeof value !== "object" || !("at" in value) || !("type" in value)) {
        throw new Error("Invalid saved support event.");
      }
      events.push(value as SupportEvent);
    }
    return events.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  } catch {
    throw new Error("Couldn't read saved conversations. Browser storage may be blocked or damaged.");
  }
}

// Each event gets its own storage key, so simultaneous tabs never overwrite replies.
function appendEvent(event: SupportEvent, id = newId()) {
  try {
    const key = `${PREFIX}event:${id}`;
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(event));
  } catch {
    throw new Error("This message was not saved. Browser storage is full or unavailable; keep your draft and try again.");
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function readLocalSnapshot(role: SupportRole): SupportSnapshot {
  const visitorId = localVisitorId();
  const events = readEvents();
  const threads = new Map<string, SupportThread>();
  const messages = new Map<string, SupportMessage>();

  for (const event of events) {
    if (event.type === "create") {
      threads.set(event.thread.id, { ...EMPTY_CONTACT, ...normalizeThread(event.thread as unknown as Record<string, unknown>) });
      messages.set(event.message.id, event.message);
    }
  }

  for (const event of events) {
    if (event.type === "create") continue;
    const thread = threads.get(event.type === "message" ? event.message.thread_id : event.threadId);
    if (!thread) continue;
    if (event.type === "message") {
      messages.set(event.message.id, event.message);
      thread.updated_at = event.at;
      if (event.message.sender === "operator" && thread.status !== "resolved") thread.status = "in_progress";
    } else if (event.type === "status") {
      thread.status = normalizeStatus(event.status);
      thread.updated_at = event.at;
    } else if (event.type === "read") {
      const field = event.role === "visitor" ? "visitor_read_at" : "operator_read_at";
      if (!thread[field] || Date.parse(event.until) > Date.parse(thread[field])) thread[field] = event.until;
    } else if (event.type === "contact") {
      Object.assign(thread, event.patch);
      thread.contact_saved_at = event.at;
      thread.updated_at = event.at;
    } else if (event.type === "handoff") {
      thread.handoff_requested_at = event.at;
      if (thread.status === "bot_intake") thread.status = "awaiting_agent";
      if (event.urgent) thread.urgent = true;
      if (event.intent) thread.intent = event.intent;
      thread.updated_at = event.at;
    }
  }

  const visibleThreads = [...threads.values()]
    .filter(thread => role === "operator" || thread.visitor_id === visitorId)
    .sort((a, b) =>
      Number(b.urgent) - Number(a.urgent)
      || Date.parse(b.updated_at) - Date.parse(a.updated_at));
  const ids = new Set(visibleThreads.map(thread => thread.id));
  return {
    threads: visibleThreads,
    messages: [...messages.values()].filter(message => ids.has(message.thread_id)),
  };
}

export function createLocalRequest(request: NewRequest) {
  validateRequest(request);
  const snapshot = readLocalSnapshot("visitor");
  const existing = snapshot.threads.find(thread => thread.id === request.id);
  if (existing) {
    const original = snapshot.messages.find(message => message.id === request.messageId);
    if (existing.subject === request.subject.trim() && existing.kind === request.kind
      && existing.category === request.category && existing.visitor_name === (request.name.trim() || "Visitor")
      && original?.body === request.body.trim()) return request.id;
    throw new Error("This request was already saved. Check My requests before starting another.");
  }
  const created = new Date().toISOString();
  const thread: SupportThread = {
    ...EMPTY_CONTACT,
    id: request.id, visitor_id: localVisitorId(), visitor_name: request.name.trim() || "Visitor",
    kind: request.kind, subject: request.subject.trim(), category: request.category,
    status: "bot_intake", intent: request.intent ?? "", urgent: Boolean(request.urgent),
    handoff_requested_at: null, bot_completed_at: null,
    created_at: created, updated_at: created,
    visitor_read_at: created, operator_read_at: null,
  };
  appendEvent({
    type: "create", at: created, thread,
    message: { id: request.messageId, thread_id: request.id, sender: "visitor", body: request.body.trim(), created_at: created },
  }, request.id);
  return request.id;
}

export function appendLocalBotMessage(threadId: string, body: string, id: string, patch: Partial<ContactDetails> = {}) {
  const snapshot = readLocalSnapshot("visitor");
  if (snapshot.messages.some(message => message.id === id)) return;
  const at = new Date().toISOString();
  if (Object.keys(patch).length > 0) appendEvent({ type: "contact", at, threadId, patch }, `contact:${threadId}:${id}`);
  appendEvent({ type: "message", at, message: { id, thread_id: threadId, sender: "bot" as MessageSender, body, created_at: at } }, id);
}

export function sendLocalMessage(role: SupportRole, threadId: string, body: string, id: string) {
  validateMessage(body);
  const snapshot = readLocalSnapshot(role);
  const existing = snapshot.messages.find(message => message.id === id);
  if (existing) {
    if (existing.body === body.trim() && existing.thread_id === threadId && existing.sender === role) return;
    throw new Error("This message was already saved. Reload the conversation before retrying.");
  }
  const thread = snapshot.threads.find(item => item.id === threadId);
  if (!thread) throw new Error("This conversation is unavailable.");
  if (thread.status === "resolved") throw new Error("This request is resolved. Reopen it in the duty inbox or start a new request.");
  const at = new Date().toISOString();
  appendEvent({ type: "message", at, message: { id, thread_id: threadId, sender: role, body: body.trim(), created_at: at } }, id);
}

export function setLocalStatus(threadId: string, status: ThreadStatus) {
  const allowed: ThreadStatus[] = ["bot_intake", "awaiting_agent", "in_progress", "resolved"];
  if (!allowed.includes(status)) throw new Error("Invalid request status.");
  if (!readLocalSnapshot("operator").threads.some(thread => thread.id === threadId)) throw new Error("This request is unavailable.");
  appendEvent({ type: "status", at: new Date().toISOString(), threadId, status });
}

export function requestLocalHandoff(threadId: string, urgent = false, intent = "") {
  appendEvent({ type: "handoff", at: new Date().toISOString(), threadId, urgent, intent });
}

export function saveLocalContact(threadId: string, patch: Partial<ContactDetails>) {
  appendEvent({ type: "contact", at: new Date().toISOString(), threadId, patch });
}

export function markLocalRead(role: SupportRole, threadId: string, until: string) {
  appendEvent({ type: "read", at: new Date().toISOString(), threadId, role, until }, `read:${role}:${threadId}:${until}`);
}

export function subscribeLocal(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key.startsWith(PREFIX)) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}
