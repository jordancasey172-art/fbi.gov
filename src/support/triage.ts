import { AGENT_LINE, IC3 } from "../data";
import {
  EMAIL_RE, contactComplete, messagesFor, normalizePhone,
  type ContactDetails, type SupportMessage, type SupportSnapshot, type SupportThread, type ThreadStatus,
} from "./model";

/**
 * Automated triage responder.
 *
 * Default engine is deterministic and runs entirely in the browser: it classifies
 * intent, extracts contact details from free text, gives protective guidance, and
 * escalates to a human agent. If the site owner configures an OpenAI-compatible
 * endpoint, that provider drafts the reply first and the rule engine is the fallback.
 */
const AI_ENDPOINT = import.meta.env.VITE_AI_ENDPOINT?.trim();
const AI_KEY = import.meta.env.VITE_AI_API_KEY?.trim();
export const aiMode: "provider" | "rules" = AI_ENDPOINT && AI_KEY ? "provider" : "rules";

export type IntentId =
  | "crypto_investment" | "romance" | "tech_support" | "elder_fraud" | "impersonation"
  | "bec" | "ransomware" | "sextortion" | "marketplace" | "real_estate" | "employment"
  | "lottery" | "identity_theft" | "trafficking" | "terrorism" | "violent_crime"
  | "missing_person" | "website_issue" | "general";

export interface IntentRule {
  id: IntentId;
  label: string;
  keywords: string[];
  urgent?: boolean;
  scam?: boolean;
  guidance: string[];
}

export const INTENTS: IntentRule[] = [
  {
    id: "sextortion", label: "Sextortion / image-based abuse", urgent: true, scam: true,
    keywords: ["sextort", "nude", "naked", "compromising photo", "compromising video", "intimate image", "blackmail photo", "webcam", "exposed video"],
    guidance: [
      "Stop all contact immediately and do not send money — payment almost never stops the demands.",
      "Preserve everything: screenshots of profiles, messages, links, and any payment instructions.",
      "If the person is threatening a minor, this is an emergency priority — report right away and consider calling 911.",
    ],
  },
  {
    id: "ransomware", label: "Ransomware / cyber extortion", urgent: true, scam: true,
    keywords: ["ransom", "encrypted", "locked files", "locked system", "decrypt", "data leak", "exfiltrat", "ddos threat"],
    guidance: [
      "Isolate affected systems from the network but do not power them off — memory can hold decryption keys.",
      "Do not pay before speaking with an agent; payment funds further attacks and does not guarantee recovery.",
      "Record the ransom note text, wallet address, attacker email, and any deadline shown.",
    ],
  },
  {
    id: "terrorism", label: "Threat to public safety", urgent: true,
    keywords: ["bomb", "explosive", "shooting", "active shooter", "attack plan", "terrorist", "detonate", "mass casualty", "weapon at", "going to blow"],
    guidance: [
      "If anyone is in immediate danger, call 911 first — before anything else.",
      "Then contact the Special Agent line or your nearest field office so the threat can be assessed.",
      "Do not confront, warn, or tip off the person you are reporting.",
    ],
  },
  {
    id: "violent_crime", label: "Violent crime / threat against a person", urgent: true,
    keywords: ["stabbing", "assault", "beaten", "gunshot", "shot at", "murder", "kill", "hostage", "kidnap", "abduct", "armed robbery", "carjack", "danger right now"],
    guidance: [
      "If this is happening now or someone is hurt, call 911 immediately.",
      "Note exact locations, times, vehicle descriptions, and any injuries.",
      "Preserve messages, recordings, and photos — do not delete anything.",
    ],
  },
  {
    id: "missing_person", label: "Missing person", urgent: true,
    keywords: ["missing person", "disappeared", "runaway", "abducted child", "cannot find my", "gone missing", "vanished"],
    guidance: [
      "Report to local police immediately — there is no waiting period for a missing child.",
      "Have a recent photo, clothing description, and last known location ready.",
      "Preserve the person's devices and accounts untouched; login history often helps.",
    ],
  },
  {
    id: "trafficking", label: "Human trafficking", urgent: true,
    keywords: ["trafficking", "trafficked", "forced to work", "forced labor", "sex work coerced", "pimp", "smuggled", "held against", "not allowed to leave"],
    guidance: [
      "Do not attempt a rescue yourself — it can endanger the victim.",
      "Note locations, vehicles, schedules, and controlling individuals without alerting them.",
      "The National Human Trafficking Hotline is 1-888-373-7888 (call or text 233733).",
    ],
  },
  {
    id: "crypto_investment", label: "Cryptocurrency / investment fraud", scam: true,
    keywords: ["crypto", "bitcoin", "usdt", "ethereum", "pig butcher", "investment platform", "trading app", "mining pool", "wallet address", "binance", "coinbase", "token", "defi", "liquidity", "guaranteed return"],
    guidance: [
      "Stop sending funds immediately — additional \"tax\", \"fee\", or \"unlock\" payments are part of the same scheme.",
      "Record every wallet address, transaction hash, exchange name, and the exact amounts sent.",
      "Report quickly: funds can sometimes be frozen at the receiving exchange within the first 72 hours.",
    ],
  },
  {
    id: "impersonation", label: "Government / law enforcement impersonation", scam: true,
    keywords: ["impersonat", "pretending to be fbi", "claims to be an agent", "fake agent", "irs scam", "social security", "warrant for my arrest", "gift card", "says he is police", "badge number"],
    guidance: [
      "Real federal agents never demand payment by gift card, crypto, or wire, and never threaten immediate arrest by phone.",
      "Hang up. Do not call the number they give you — verify independently.",
      "Record the caller's name, badge or reference number, callback number, and the exact demands.",
    ],
  },
  {
    id: "tech_support", label: "Tech support / remote access scam", scam: true,
    keywords: ["tech support", "remote access", "anydesk", "teamviewer", "pop-up virus", "computer infected", "microsoft warning", "took control of my computer"],
    guidance: [
      "Disconnect the machine from the internet and do not let anyone regain remote access.",
      "Contact your bank immediately if credentials or card details were entered during the session.",
      "Run a full scan from a clean device and change passwords from that clean device, not the affected one.",
    ],
  },
  {
    id: "elder_fraud", label: "Elder financial fraud", scam: true,
    keywords: ["elder", "grandparent scam", "my mother", "my father", "grandmother", "grandfather", "senior citizen", "nursing home", "caregiver", "medicare"],
    guidance: [
      "Contact the bank or card issuer right away and ask for a fraud hold and reversal request.",
      "Talk with the person calmly — shame often delays reporting, and speed matters for recovery.",
      "Gather statements, call logs, and any mailers or emails involved.",
    ],
  },
  {
    id: "romance", label: "Romance / confidence fraud", scam: true,
    keywords: ["romance", "dating app", "tinder", "hinge", "bumble", "boyfriend online", "girlfriend online", "never met", "fianc", "love scam", "sent money to a man i met"],
    guidance: [
      "Stop all transfers. Requests framed as emergencies, customs fees, or medical bills are the scheme's core.",
      "Save the full chat history and any photos — reverse image searches often reveal stolen identities.",
      "Note every payment channel used and the names or aliases given.",
    ],
  },
  {
    id: "bec", label: "Business email compromise", scam: true,
    keywords: ["bec", "business email", "invoice fraud", "vendor payment", "wire diversion", "ceo fraud", "spoofed email", "changed bank details", "payroll redirect"],
    guidance: [
      "Call your bank's fraud line immediately and request a wire recall — the first hours are decisive.",
      "Preserve the original emails with full headers; do not forward-only, as headers are lost.",
      "Notify everyone in the approval chain and freeze further payments to that vendor.",
    ],
  },
  {
    id: "marketplace", label: "Marketplace / shopping fraud", scam: true,
    keywords: ["marketplace", "ebay", "facebook marketplace", "craigslist", "never arrived", "not delivered", "counterfeit", "fake item", "overpayment check"],
    guidance: [
      "Dispute the charge with your card issuer or payment platform right away.",
      "Keep the listing, all messages, and shipping or tracking information.",
      "Never accept an overpayment followed by a request to refund the difference.",
    ],
  },
  {
    id: "real_estate", label: "Real estate / rental fraud", scam: true,
    keywords: ["rental scam", "fake listing", "landlord", "escrow wire", "closing funds", "title company", "deposit for apartment"],
    guidance: [
      "Contact the receiving bank and the title company immediately to attempt a recall.",
      "Verify wiring instructions by a known phone number, never by the email that sent them.",
      "Preserve the listing, lease documents, and all correspondence.",
    ],
  },
  {
    id: "employment", label: "Employment / work-from-home fraud", scam: true,
    keywords: ["job scam", "fake job", "employment offer", "mystery shopper", "paid for equipment", "hiring manager", "work from home check"],
    guidance: [
      "Do not deposit or forward any check you were sent — it will bounce and you will owe the bank.",
      "Legitimate employers never ask you to buy equipment with a check they mail you.",
      "Report the posting platform and preserve the offer letter and all messages.",
    ],
  },
  {
    id: "lottery", label: "Lottery / sweepstakes / inheritance fraud", scam: true,
    keywords: ["lottery", "sweepstakes", "prize", "won a", "inheritance", "next of kin", "advance fee", "processing fee to release"],
    guidance: [
      "Any prize requiring an upfront fee is a scam — there is no winning entry.",
      "Do not share bank details or identity documents.",
      "Preserve the notification email or letter, including sender addresses.",
    ],
  },
  {
    id: "identity_theft", label: "Identity theft / account takeover", scam: true,
    keywords: ["identity theft", "stolen identity", "opened an account", "sim swap", "account taken over", "unauthorized loan", "someone used my social security"],
    guidance: [
      "Freeze credit at all three bureaus: Equifax, Experian, and TransUnion.",
      "Change passwords from a clean device and enable hardware-key or app-based MFA.",
      "File a report at IdentityTheft.gov and keep the recovery plan reference.",
    ],
  },
  {
    id: "website_issue", label: "Website or portal issue",
    keywords: ["website", "page not loading", "broken link", "cannot log in", "login fails", "error on the site", "form not working", "accessibility", "screen reader", "typo"],
    guidance: [
      "Note the page address, browser, device, and the exact error text or behaviour.",
      "A screenshot and the time it happened speed up the fix considerably.",
      "If your submission was interrupted, check whether a reference number was issued before retrying.",
    ],
  },
  {
    id: "general", label: "General inquiry",
    keywords: [],
    guidance: [
      "Provide dates, locations, names, and any reference numbers you already hold.",
      "For internet-enabled crime, the IC3 portal issues a formal complaint number.",
      "For anything in progress or life-threatening, call 911 first.",
    ],
  },
];

const INTENT_BY_ID = new Map(INTENTS.map(i => [i.id, i]));

export interface IntakeState {
  intent: IntentRule;
  urgent: boolean;
  askedFor: (keyof ContactDetails)[];
  missing: (keyof ContactDetails)[];
  humanRequested: boolean;
  botTurns: number;
}

const HUMAN_PHRASES = ["human", "real person", "agent", "speak to someone", "talk to someone", "operator", "live person", "not a bot", "stop the bot", "representative", "officer"];

function fieldSequence(intent: IntentRule): (keyof ContactDetails)[] {
  const base: (keyof ContactDetails)[] = ["contact_name", "contact_email", "contact_phone", "contact_location"];
  if (intent.scam) base.push("loss_amount", "transaction_ref");
  base.push("contact_preference");
  return base;
}

export function classifyIntent(text: string): IntentRule {
  const haystack = text.toLowerCase();
  let best: IntentRule | null = null;
  let bestScore = 0;
  for (const intent of INTENTS) {
    let score = 0;
    for (const kw of intent.keywords) if (haystack.includes(kw)) score += kw.includes(" ") ? 3 : 2;
    if (intent.urgent && score > 0) score += 2;
    if (score > bestScore) { bestScore = score; best = intent; }
  }
  return best ?? INTENT_BY_ID.get("general")!;
}

export function detectUrgency(text: string) {
  const intent = classifyIntent(text);
  if (intent.urgent) return true;
  return /\b(911|in danger|right now|emergency|bleeding|unconscious|threatening to kill|suicide)\b/i.test(text);
}

export function requestsHuman(text: string) {
  const lower = text.toLowerCase();
  return HUMAN_PHRASES.some(p => lower.includes(p));
}

/** Pull structured contact data out of a free-text answer. */
export function extractFields(text: string): Partial<ContactDetails> {
  const found: Partial<ContactDetails> = {};
  const email = text.match(/[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}/i)?.[0];
  if (email && EMAIL_RE.test(email)) found.contact_email = email;
  const phone = text.match(/(\+?\d[\d\s().-]{7,}\d)/)?.[1];
  if (phone && normalizePhone(phone)) found.contact_phone = normalizePhone(phone);
  const money = text.match(/\$\s?\d[\d,]*(?:\.\d{1,2})?/)?.[0];
  if (money) found.loss_amount = money.replace(/\s+/g, "");
  const tx = text.match(/\b(0x[a-f0-9]{16,}|[13][a-km-z0-9]{20,}|bc1[a-z0-9]{20,}|T[A-Za-z0-9]{20,}|[a-f0-9]{40,})\b/)?.[1];
  if (tx) found.transaction_ref = tx;
  return found;
}

export function intakeState(thread: SupportThread, messages: SupportMessage[]): IntakeState {
  const intent = INTENT_BY_ID.get(thread.intent as IntentId) ?? classifyIntent(thread.subject + " " + messages.map(m => m.body).join(" "));
  const sequence = fieldSequence(intent);
  const missing = sequence.filter(field => {
    const value = thread[field];
    if (field === "contact_preference") return thread.contact_preference === "any" && !contactComplete(thread);
    return typeof value === "string" ? !value.trim() : !value;
  });
  return {
    intent,
    urgent: thread.urgent || detectUrgency(messages.map(m => m.sender === "visitor" ? m.body : "").join(" ")),
    askedFor: sequence,
    missing,
    humanRequested: messages.some(m => m.sender === "visitor" && requestsHuman(m.body)),
    botTurns: messages.filter(m => m.sender === "bot").length,
  };
}

const FIELD_PROMPT: Record<string, string> = {
  contact_name: "What name should an agent use when contacting you? A first name is fine if you prefer not to give your full legal name.",
  contact_email: "What is the best email address to reach you? This is how case updates and your reference confirmation will be sent.",
  contact_phone: "And a phone number where you can be reached — include the country code if you are outside the United States.",
  contact_location: "Which city and state (or country) are you in? This determines which field division handles the matter.",
  loss_amount: "Roughly how much did you lose, in US dollars? If nothing was lost yet, say \"none\".",
  transaction_ref: "Do you have a transaction ID, wallet address, wire reference, or confirmation number? Paste it here if so, otherwise say \"none\".",
  contact_preference: "Finally — how would you prefer to be contacted: email, voice call, or text message?",
};

export interface BotReply {
  body: string;
  quickReplies: string[];
  status: ThreadStatus;
  urgent: boolean;
  intentId: IntentId;
  extracted: Partial<ContactDetails>;
  handoff: boolean;
}

export function openingMessage(): string {
  return [
    "Automated Triage Assistant here — I answer immediately and can connect you to a duty agent.",
    "",
    "Tell me in your own words what happened. Include dates, amounts, and any account or wallet details you have.",
    "",
    "If someone is in immediate danger, stop chatting and call 911.",
  ].join("\n");
}

function preferenceReply(text: string) {
  const lower = text.toLowerCase();
  if (/\b(text|sms|message me)\b/.test(lower)) return "sms";
  if (/\b(call|voice|phone)\b/.test(lower)) return "phone";
  if (/\b(email|e-mail|mail)\b/.test(lower)) return "email";
  return "";
}

export function buildBotReply(thread: SupportThread, snapshot: SupportSnapshot): BotReply {
  const messages = messagesFor(snapshot, thread.id);
  const state = intakeState(thread, messages);
  const lastVisitor = [...messages].reverse().find(m => m.sender === "visitor");
  const lastText = lastVisitor?.body ?? "";
  const extracted = extractFields(lastText);

  const preference = preferenceReply(lastText);
  if (preference && state.missing.includes("contact_preference")) extracted.contact_preference = preference;

  const parts: string[] = [];
  let handoff = false;

  // 1. Emergency short-circuit
  if (state.urgent && !thread.handoff_requested_at) {
    parts.push("PRIORITY — I have flagged this as urgent and an agent has been notified.");
    if (/\b(suicid|self.?harm|kill myself)\b/i.test(lastText)) {
      parts.push("If you are thinking about harming yourself, call or text 988 (Suicide & Crisis Lifeline) right now.");
    }
    parts.push("If there is any immediate physical danger, call 911 before we continue.");
    parts.push(`You can also reach a Special Agent directly, by voice or text, at ${AGENT_LINE.display}.`);
    handoff = true;
  }

  // 2. Intent acknowledgement with concrete protective steps
  const firstBotTurn = state.botTurns === 0;
  if (firstBotTurn && !state.urgent) {
    parts.push(`Understood — this reads as ${state.intent.label.toLowerCase()}.`);
    parts.push("");
    parts.push("Do this first:");
    state.intent.guidance.forEach((g, i) => parts.push(`${i + 1}. ${g}`));
    if (state.intent.scam) {
      parts.push("");
      parts.push(`File a formal complaint at ${IC3.host} so the matter receives a permanent IC3 reference number.`);
    }
    parts.push("");
  }

  // 3. Human handoff
  if (state.humanRequested) {
    handoff = true;
    parts.push("Connecting you to a duty agent. You are in the queue and your full transcript travels with you.");
    parts.push("");
  }

  // 4. Intake — ask for the next missing contact detail
  const next = state.missing[0];
  if (!handoff && next) {
    parts.push(FIELD_PROMPT[next]);
    parts.push("");
    parts.push("I capture these automatically as you type — no forms needed.");
  } else if (!handoff && !next) {
    handoff = true;
    parts.push("That is everything I need. Your contact details are saved to the case file and an agent has been alerted.");
    parts.push("");
  }

  if (handoff) {
    parts.push("");
    parts.push(`Reference: keep your case number handy. An agent replies here, or by your preferred contact method.`);
    parts.push(`Need someone now? Call or text the Special Agent line: ${AGENT_LINE.display}.`);
  }

  const status: ThreadStatus = handoff ? "awaiting_agent" : "bot_intake";

  const quickReplies: string[] = [];
  if (next === "contact_preference") quickReplies.push("Email", "Voice call", "Text message");
  if (next === "loss_amount") quickReplies.push("None", "Under $1,000", "$1,000 – $10,000", "Over $10,000");
  if (next === "transaction_ref") quickReplies.push("None available");
  if (!handoff) quickReplies.push("Connect me to an agent");
  if (state.intent.scam) quickReplies.push("How do I freeze the funds?");

  return {
    body: parts.join("\n").replace(/\n{3,}/g, "\n\n").trim(),
    quickReplies: quickReplies.slice(0, 4),
    status,
    urgent: state.urgent,
    intentId: state.intent.id,
    extracted,
    handoff,
  };
}

/** Optional provider-drafted reply. Returns null on any failure so rules take over. */
export async function providerReply(thread: SupportThread, snapshot: SupportSnapshot): Promise<string | null> {
  if (aiMode !== "provider" || !AI_ENDPOINT || !AI_KEY) return null;
  const messages = messagesFor(snapshot, thread.id).slice(-12);
  const reply = buildBotReply(thread, snapshot);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(AI_ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${AI_KEY}` },
      body: JSON.stringify({
        model: import.meta.env.VITE_AI_MODEL?.trim() || "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content: [
              "You are an automated triage assistant on a law-enforcement style public website.",
              "You are NOT a human agent and must never claim to be one, and must never give legal advice.",
              "Be concise, calm, and practical. Give protective steps, then ask for the next missing contact detail.",
              `Case type: ${reply.intentId}. Urgent: ${reply.urgent ? "yes" : "no"}.`,
              `Still needed: ${reply.status === "awaiting_agent" ? "nothing - hand off to agent" : "see transcript"}.`,
              "If there is any immediate physical danger, tell the user to call 911 first.",
              `Special Agent line for active losses: ${AGENT_LINE.display}. IC3 portal: ${IC3.host}.`,
              "Never invent case numbers, arrests, or promises of fund recovery.",
            ].join(" "),
          },
          ...messages.map(m => ({
            role: m.sender === "visitor" ? "user" : "assistant",
            content: m.body,
          })),
        ],
      }),
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text || text.length < 20 || text.length > 2400) return null;
    return text;
  } catch {
    return null;
  }
}
