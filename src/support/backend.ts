import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  newId, normalizeThread, validateContact, validateMessage, validateRequest,
  type ConnectionState, type ContactDetails, type NewRequest, type SupportMessage,
  type SupportRole, type SupportSnapshot, type SupportThread, type ThreadStatus,
} from "./model";
import {
  appendLocalBotMessage, createLocalRequest, hasLocalSession, localVisitorId, markLocalRead,
  readLocalSnapshot, requestLocalHandoff, saveLocalContact, sendLocalMessage, setLocalStatus,
  subscribeLocal,
} from "./local";
import { closeAdminSession, hasAdminSession, openAdminSession, verifyAdmin } from "./admin";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const publicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
export const supportMode = url && publicKey ? "live" : "local";

const clients: Partial<Record<SupportRole, SupabaseClient>> = {};
let visitorSignIn: Promise<void> | null = null;

export function hasVisitorSession() {
  if (supportMode === "local") return hasLocalSession();
  try { return Boolean(localStorage.getItem("demo-support-visitor-auth-v1")); }
  catch { return false; }
}

export class OperatorAuthRequired extends Error {
  constructor() {
    super("Sign in with an approved duty-desk account.");
  }
}

function clientFor(role: SupportRole) {
  if (!url || !publicKey) throw new Error("Live support setup is incomplete. The site owner must configure both Supabase environment variables.");
  if (!/^https?:\/\//.test(url)) throw new Error("The support server URL is invalid. Ask the site owner to check the configuration.");
  let secretKey = publicKey.startsWith("sb_secret_");
  if (publicKey.split(".").length === 3) {
    try {
      const payload = JSON.parse(atob(publicKey.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as { role?: string };
      secretKey = secretKey || payload.role === "service_role";
    } catch { /* Supabase will validate other malformed public keys. */ }
  }
  if (secretKey) throw new Error("Unsafe support configuration: remove the secret key, rotate it, and use only a public publishable key.");
  if (!clients[role]) {
    // Separate sessions let the owner test visitor and operator views in one browser.
    clients[role] = createClient(url, publicKey, {
      auth: { storageKey: `demo-support-${role}-auth-v1`, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    });
  }
  return clients[role]!;
}

async function verifyOperator() {
  const client = clientFor("operator");
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError) throw sessionError;
  if (!sessionData.session) throw new OperatorAuthRequired();
  const { data, error } = await client.from("support_operators").select("user_id")
    .eq("user_id", sessionData.session.user.id).maybeSingle();
  if (error) throw error;
  if (!data) {
    await client.auth.signOut({ scope: "local" });
    throw new OperatorAuthRequired();
  }
}

/** Local mode has no server, so the duty desk uses the browser admin gate instead. */
export function localAdminState() {
  return { required: supportMode === "local", granted: hasAdminSession() };
}

export async function signInOperator(email: string, password: string) {
  if (supportMode === "local") {
    if (!(await verifyAdmin(email, password))) {
      throw new Error("Those duty-desk credentials were not recognised.");
    }
    openAdminSession();
    return;
  }
  const { error } = await clientFor("operator").auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
  await verifyOperator();
}

export async function signOutOperator() {
  if (supportMode === "local") { closeAdminSession(); return; }
  const { error } = await clientFor("operator").auth.signOut({ scope: "local" });
  if (error) throw error;
}

export async function initializeSupport(role: SupportRole) {
  if (supportMode === "local") {
    localVisitorId();
    if (role === "operator" && !hasAdminSession()) throw new OperatorAuthRequired();
    return;
  }
  if (role === "operator") { await verifyOperator(); return; }
  if (!visitorSignIn) {
    visitorSignIn = (async () => {
      const client = clientFor("visitor");
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      if (!data.session) {
        const result = await client.auth.signInAnonymously();
        if (result.error) throw result.error;
      }
    })().finally(() => { visitorSignIn = null; });
  }
  await visitorSignIn;
}

async function fetchRows<T>(client: SupabaseClient, table: string): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += 500) {
    const { data, error } = await client.from(table).select("*").order("created_at").order("id").range(from, from + 499);
    if (error) throw error;
    rows.push(...(data as T[]));
    if (data.length < 500) return rows;
  }
}

export async function loadSupport(role: SupportRole): Promise<SupportSnapshot> {
  if (supportMode === "local") return readLocalSnapshot(role);
  const client = clientFor(role);
  const { data } = await client.auth.getSession();
  if (!data.session) {
    if (role === "operator") throw new OperatorAuthRequired();
    throw new Error("Your visitor session has ended. Reload support to reconnect.");
  }
  const [rawThreads, messages] = await Promise.all([
    fetchRows<Record<string, unknown>>(client, "support_threads"),
    fetchRows<SupportMessage>(client, "support_messages"),
  ]);
  const threads = rawThreads.map(normalizeThread);
  return {
    threads: threads.sort((a, b) =>
      Number(b.urgent) - Number(a.urgent) || Date.parse(b.updated_at) - Date.parse(a.updated_at)),
    messages,
  };
}

export async function createRequest(request: NewRequest) {
  validateRequest(request);
  if (supportMode === "local") return createLocalRequest(request);
  const { error } = await clientFor("visitor").rpc("support_start_thread", {
    p_id: request.id, p_message_id: request.messageId, p_kind: request.kind,
    p_subject: request.subject.trim(), p_category: request.category,
    p_visitor_name: request.name.trim() || "Visitor", p_body: request.body.trim(),
    p_intent: request.intent ?? "", p_urgent: Boolean(request.urgent), p_consent: request.consent,
  });
  if (error) throw error;
  return request.id;
}

export async function sendMessage(role: SupportRole, threadId: string, body: string, id: string) {
  validateMessage(body);
  if (supportMode === "local") return sendLocalMessage(role, threadId, body, id);
  const { error } = await clientFor(role).rpc("support_send_message", { p_id: id, p_thread_id: threadId, p_body: body.trim() });
  if (error) throw error;
}

/** Bot replies are produced in the visitor's browser, so they ride the visitor session. */
export async function appendBotReply(threadId: string, body: string, id: string, patch: Partial<ContactDetails> = {}) {
  validateMessage(body);
  if (supportMode === "local") return appendLocalBotMessage(threadId, body, id, patch);
  const { error } = await clientFor("visitor").rpc("support_bot_reply", {
    p_id: id, p_thread_id: threadId, p_body: body.trim(),
    p_contact_name: patch.contact_name ?? null, p_contact_email: patch.contact_email ?? null,
    p_contact_phone: patch.contact_phone ?? null, p_contact_location: patch.contact_location ?? null,
    p_contact_preference: patch.contact_preference ?? null, p_loss_amount: patch.loss_amount ?? null,
    p_transaction_ref: patch.transaction_ref ?? null,
  });
  if (error) throw error;
}

export async function requestHandoff(threadId: string, status: ThreadStatus = "awaiting_agent", urgent = false, intent = "") {
  if (supportMode === "local") { requestLocalHandoff(threadId, urgent, intent); return; }
  const { error } = await clientFor("visitor").rpc("support_request_handoff", {
    p_thread_id: threadId, p_status: status, p_urgent: urgent, p_intent: intent,
  });
  if (error) throw error;
}

export async function saveContact(threadId: string, contact: ContactDetails) {
  validateContact(contact, { emailRequired: false, phoneRequired: false });
  if (supportMode === "local") {
    saveLocalContact(threadId, {
      contact_name: contact.contact_name.trim(),
      contact_email: contact.contact_email.trim(),
      contact_phone: contact.contact_phone.trim(),
      contact_location: contact.contact_location.trim(),
      contact_preference: contact.contact_preference,
      loss_amount: contact.loss_amount.trim(),
      transaction_ref: contact.transaction_ref.trim(),
    });
    return;
  }
  const { error } = await clientFor("visitor").rpc("support_save_contact", {
    p_thread_id: threadId, p_contact_name: contact.contact_name.trim(),
    p_contact_email: contact.contact_email.trim(), p_contact_phone: contact.contact_phone.trim(),
    p_contact_location: contact.contact_location.trim(), p_contact_preference: contact.contact_preference,
    p_loss_amount: contact.loss_amount.trim(), p_transaction_ref: contact.transaction_ref.trim(),
  });
  if (error) throw error;
}

export async function setStatus(threadId: string, status: ThreadStatus) {
  if (supportMode === "local") return setLocalStatus(threadId, status);
  const { error } = await clientFor("operator").rpc("support_set_status", { p_thread_id: threadId, p_status: status });
  if (error) throw error;
}

export async function markRead(role: SupportRole, threadId: string, until: string) {
  if (supportMode === "local") return markLocalRead(role, threadId, until);
  const { error } = await clientFor(role).rpc("support_mark_read", { p_thread_id: threadId, p_until: until });
  if (error) throw error;
}

export function subscribeSupport(role: SupportRole, onChange: () => void, onState: (state: ConnectionState) => void) {
  if (supportMode === "local") {
    onState("local");
    return subscribeLocal(onChange);
  }
  const client = clientFor(role);
  const channel = client.channel(`site-support-${role}-${newId()}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "support_threads" }, onChange)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages" }, onChange)
    .subscribe(status => {
      if (status === "SUBSCRIBED") { onState("connected"); onChange(); }
      else if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(status)) onState("reconnecting");
    });
  const { data: authListener } = client.auth.onAuthStateChange(() => {
    // Keep database work outside the auth callback's internal lock.
    window.setTimeout(onChange, 0);
  });
  return () => {
    authListener.subscription.unsubscribe();
    void client.removeChannel(channel);
  };
}

export type { SupportThread };
