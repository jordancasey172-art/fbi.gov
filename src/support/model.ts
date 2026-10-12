export type SupportRole = "visitor" | "operator";
export type MessageSender = SupportRole | "bot";
export type ThreadKind = "chat" | "complaint" | "report";
export type ThreadStatus = "bot_intake" | "awaiting_agent" | "in_progress" | "resolved";
export type ConnectionState = "local" | "connecting" | "connected" | "reconnecting";
export type ContactPreference = "email" | "phone" | "sms" | "any";

export interface ContactDetails {
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  contact_location: string;
  contact_preference: ContactPreference;
  loss_amount: string;
  transaction_ref: string;
  contact_saved_at: string | null;
}

export interface SupportThread extends ContactDetails {
  id: string;
  visitor_id: string;
  visitor_name: string;
  kind: ThreadKind;
  subject: string;
  category: string;
  status: ThreadStatus;
  intent: string;
  urgent: boolean;
  handoff_requested_at: string | null;
  bot_completed_at: string | null;
  created_at: string;
  updated_at: string;
  visitor_read_at: string | null;
  operator_read_at: string | null;
}

export interface SupportMessage {
  id: string;
  thread_id: string;
  sender: MessageSender;
  body: string;
  created_at: string;
}

export interface SupportSnapshot {
  threads: SupportThread[];
  messages: SupportMessage[];
}

export interface NewRequest {
  id: string;
  messageId: string;
  name: string;
  kind: ThreadKind;
  subject: string;
  category: string;
  body: string;
  consent: boolean;
  intent?: string;
  urgent?: boolean;
}

export const EMPTY_CONTACT: ContactDetails = {
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  contact_location: "",
  contact_preference: "any",
  loss_amount: "",
  transaction_ref: "",
  contact_saved_at: null,
};

export const COMPLAINT_CATEGORIES = [
  "Website issue",
  "Accessibility",
  "Content concern",
  "Support experience",
  "Other feedback",
] as const;

export const CONTACT_PREFERENCES: { value: ContactPreference; label: string }[] = [
  { value: "any", label: "No preference" },
  { value: "email", label: "Email only" },
  { value: "phone", label: "Voice call" },
  { value: "sms", label: "Text message (SMS)" },
];

export const STATUS_LABELS: Record<ThreadStatus, string> = {
  bot_intake: "Automated intake",
  awaiting_agent: "Awaiting agent",
  in_progress: "Agent engaged",
  resolved: "Resolved",
};

export const KIND_LABELS: Record<ThreadKind, string> = {
  chat: "Live chat",
  complaint: "Complaint",
  report: "Case report",
};

export const EMPTY_SNAPSHOT: SupportSnapshot = { threads: [], messages: [] };

export function newId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const REF_PREFIX: Record<ThreadKind, string> = { chat: "CHAT", complaint: "CMP", report: "RPT" };

export function referenceFor(thread: Pick<SupportThread, "kind" | "id">) {
  return `${REF_PREFIX[thread.kind] ?? "CHAT"}-${thread.id.slice(0, 8).toUpperCase()}`;
}

export function messagesFor(snapshot: SupportSnapshot, threadId: string) {
  return snapshot.messages.filter(message => message.thread_id === threadId)
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at) || a.id.localeCompare(b.id));
}

export function unreadCount(thread: SupportThread, messages: SupportMessage[], reader: SupportRole) {
  const seenAt = Date.parse((reader === "visitor" ? thread.visitor_read_at : thread.operator_read_at) || "1970-01-01");
  return messages.filter(m =>
    m.thread_id === thread.id && m.sender !== reader && m.sender !== "bot"
    && Date.parse(m.created_at) > seenAt,
  ).length;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export function normalizePhone(raw: string) {
  const digits = raw.replace(/[^\d+]/g, "");
  return digits.replace(/\D/g, "").length >= 7 ? digits : "";
}

export function validateContact(contact: ContactDetails, opts: { emailRequired?: boolean; phoneRequired?: boolean } = {}) {
  const email = contact.contact_email.trim();
  const phone = normalizePhone(contact.contact_phone);
  if (opts.emailRequired !== false && !EMAIL_RE.test(email)) {
    throw new Error("Enter a valid email address so we can reach you about this report.");
  }
  if (opts.phoneRequired && !phone) {
    throw new Error("Enter a reachable phone number with at least 7 digits.");
  }
  if (email.length > 160) throw new Error("That email address is too long.");
  if (contact.contact_name.trim().length > 90) throw new Error("Please keep the name under 90 characters.");
  if (contact.contact_location.trim().length > 120) throw new Error("Please keep the location under 120 characters.");
  if (contact.loss_amount.trim().length > 60) throw new Error("Please keep the loss amount under 60 characters.");
  if (contact.transaction_ref.trim().length > 200) throw new Error("Please keep the reference under 200 characters.");
  if (!CONTACT_PREFERENCES.some(p => p.value === contact.contact_preference)) {
    throw new Error("Choose how you would prefer to be contacted.");
  }
  if (!email && !phone) throw new Error("Provide at least one way for an agent to contact you.");
}

export function validateRequest(request: NewRequest) {
  if (!request.consent) throw new Error("Please certify and acknowledge the submission agreement.");
  if (request.name.trim().length > 60) throw new Error("Please use a display name of 60 characters or fewer.");
  if (request.subject.trim().length < 3 || request.subject.trim().length > 120) {
    throw new Error("The subject must be between 3 and 120 characters.");
  }
  if (request.kind === "complaint" && !(COMPLAINT_CATEGORIES as readonly string[]).includes(request.category)) {
    throw new Error("Please choose a complaint category.");
  }
  validateMessage(request.body);
  if (request.kind === "complaint" && request.body.trim().length < 20) {
    throw new Error("Please describe your complaint in at least 20 characters.");
  }
}

export function validateMessage(body: string) {
  if (!body.trim()) throw new Error("Write a message before sending.");
  if (body.trim().length > 2000) throw new Error("Please keep your message under 2,000 characters.");
}

export function errorText(error: unknown) {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    if (/fetch|network/i.test(error.message)) return "Couldn't reach support. Check your connection and try again. Your draft is still here.";
    return error.message;
  }
  return "Something went wrong. Please try again. Your draft has not been sent.";
}

/** Legacy rows written before the intake rewrite used "new"; map them forward. */
export function normalizeStatus(raw: unknown): ThreadStatus {
  const value = String(raw ?? "");
  if (value === "awaiting_agent" || value === "in_progress" || value === "resolved") return value;
  return "bot_intake";
}

export function normalizeThread(raw: Record<string, unknown>): SupportThread {
  const preference = String(raw.contact_preference ?? "any");
  return {
    id: String(raw.id ?? ""),
    visitor_id: String(raw.visitor_id ?? ""),
    visitor_name: String(raw.visitor_name ?? "Visitor"),
    kind: (["chat", "complaint", "report"].includes(String(raw.kind)) ? String(raw.kind) : "chat") as ThreadKind,
    subject: String(raw.subject ?? ""),
    category: String(raw.category ?? "General support"),
    status: normalizeStatus(raw.status),
    intent: String(raw.intent ?? ""),
    urgent: Boolean(raw.urgent),
    handoff_requested_at: raw.handoff_requested_at ? String(raw.handoff_requested_at) : null,
    bot_completed_at: raw.bot_completed_at ? String(raw.bot_completed_at) : null,
    created_at: String(raw.created_at ?? new Date().toISOString()),
    updated_at: String(raw.updated_at ?? String(raw.created_at ?? new Date().toISOString())),
    visitor_read_at: raw.visitor_read_at ? String(raw.visitor_read_at) : null,
    operator_read_at: raw.operator_read_at ? String(raw.operator_read_at) : null,
    contact_name: String(raw.contact_name ?? ""),
    contact_email: String(raw.contact_email ?? ""),
    contact_phone: String(raw.contact_phone ?? ""),
    contact_location: String(raw.contact_location ?? ""),
    contact_preference: (["email", "phone", "sms", "any"].includes(preference) ? preference : "any") as ContactPreference,
    loss_amount: String(raw.loss_amount ?? ""),
    transaction_ref: String(raw.transaction_ref ?? ""),
    contact_saved_at: raw.contact_saved_at ? String(raw.contact_saved_at) : null,
  };
}

export function contactComplete(thread: SupportThread) {
  return Boolean(EMAIL_RE.test(thread.contact_email.trim()) || normalizePhone(thread.contact_phone));
}

export function downloadTranscript(thread: SupportThread, messages: SupportMessage[]) {
  const senderName = (m: SupportMessage) =>
    m.sender === "operator" ? "Duty Agent" : m.sender === "bot" ? "Automated Triage Assistant" : thread.visitor_name;
  const text = [
    "FEDERAL BUREAU OF INVESTIGATION - ONLINE SUPPORT & INQUIRY RECORD",
    `Reference: ${referenceFor(thread)}`,
    `Type: ${KIND_LABELS[thread.kind]}`,
    `Subject: ${thread.subject}`,
    `Category: ${thread.category}`,
    `Detected intent: ${thread.intent || "unclassified"}`,
    `Status: ${STATUS_LABELS[thread.status]}`,
    `Urgent flag: ${thread.urgent ? "YES" : "no"}`,
    `Created: ${new Date(thread.created_at).toISOString()}`,
    thread.handoff_requested_at ? `Agent handoff requested: ${new Date(thread.handoff_requested_at).toISOString()}` : "",
    "",
    "--- CONTACT DETAILS ON FILE ---",
    `Name: ${thread.contact_name || "(not provided)"}`,
    `Email: ${thread.contact_email || "(not provided)"}`,
    `Phone: ${thread.contact_phone || "(not provided)"}`,
    `Location: ${thread.contact_location || "(not provided)"}`,
    `Preferred contact: ${thread.contact_preference}`,
    `Reported loss: ${thread.loss_amount || "(not provided)"}`,
    `Transaction / reference: ${thread.transaction_ref || "(not provided)"}`,
    "",
    "--- TRANSCRIPT ---",
    ...messages.flatMap(m => [
      `[${new Date(m.created_at).toLocaleString()}] ${senderName(m)}`,
      m.body,
      "",
    ]),
  ].filter(line => line !== "" || true).join("\n");
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${referenceFor(thread)}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
