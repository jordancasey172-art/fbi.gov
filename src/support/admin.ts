import { newId } from "./model";

/**
 * Local-mode administrator gate.
 *
 * IMPORTANT: in local mode this is a UI gate only. Credentials live in the browser
 * bundle and session state lives in localStorage, so a determined visitor can bypass
 * it. It is appropriate for demos, internal previews, and single-operator sites where
 * no sensitive data is stored. For real access control, enable live mode (Supabase) —
 * there the operator must authenticate against a server and row-level security decides
 * what they can read. See SUPPORT_SETUP.md.
 */

const SESSION_KEY = "fbi-support:admin-session:v1";
const CREDS_KEY = "fbi-support:admin-creds:v1";

export const DEFAULT_ADMIN_USER = "admin";
export const DEFAULT_ADMIN_PASSPHRASE = "FBI-DutyDesk-2026";

interface StoredCreds {
  user: string;
  hash: string;
  rotatedAt: string;
}

async function sha256(text: string) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
}

function readCreds(): StoredCreds | null {
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredCreds>;
    if (typeof parsed.user !== "string" || typeof parsed.hash !== "string") return null;
    return { user: parsed.user, hash: parsed.hash, rotatedAt: String(parsed.rotatedAt ?? "") };
  } catch {
    return null;
  }
}

export function isUsingDefaultCredentials() {
  return readCreds() === null;
}

export function adminUserName() {
  return readCreds()?.user ?? DEFAULT_ADMIN_USER;
}

/** Constant-time-ish comparison to avoid trivially obvious timing leaks. */
function matches(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifyAdmin(user: string, passphrase: string) {
  const stored = readCreds();
  const expectedUser = stored?.user ?? DEFAULT_ADMIN_USER;
  const expectedHash = stored?.hash ?? (await sha256(DEFAULT_ADMIN_PASSPHRASE));
  const givenHash = await sha256(passphrase);
  if (!matches(user.trim().toLowerCase(), expectedUser.trim().toLowerCase())) return false;
  return matches(givenHash, expectedHash);
}

export function openAdminSession() {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: newId(), at: new Date().toISOString() }));
  } catch {
    /* Session simply will not persist across reloads. */
  }
}

export function hasAdminSession() {
  try { return Boolean(localStorage.getItem(SESSION_KEY)); }
  catch { return false; }
}

export function closeAdminSession() {
  try { localStorage.removeItem(SESSION_KEY); }
  catch { /* nothing to clear */ }
}

export async function rotateAdminCredentials(newUser: string, newPassphrase: string, confirm: string) {
  const user = newUser.trim();
  if (user.length < 3 || user.length > 40) throw new Error("Choose a username between 3 and 40 characters.");
  if (!/^[a-zA-Z0-9._-]+$/.test(user)) throw new Error("Use letters, numbers, dots, dashes, or underscores only.");
  if (newPassphrase.length < 12) throw new Error("Use a passphrase of at least 12 characters.");
  if (newPassphrase !== confirm) throw new Error("The two passphrases do not match.");
  if (newPassphrase === DEFAULT_ADMIN_PASSPHRASE) throw new Error("Choose something other than the factory default.");
  try {
    const creds: StoredCreds = { user, hash: await sha256(newPassphrase), rotatedAt: new Date().toISOString() };
    localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
  } catch {
    throw new Error("Could not save credentials — browser storage is unavailable.");
  }
}
