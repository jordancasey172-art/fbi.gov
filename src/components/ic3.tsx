import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Check, Copy, ExternalLink, FileWarning, Globe, Lock,
  MessageSquare, Phone, Radio, ShieldAlert,
} from "lucide-react";
import { AGENT_LINE, IC3, REPORT_TIMELINE } from "../data";

/* ---------- copy-to-clipboard ---------- */
function useCopy() {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(t);
  }, [copied]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(AGENT_LINE.display);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return { copied, copy };
}

/* ---------- simulated IC3 portal window ---------- */
const PORTAL_FIELDS = [
  { label: "Complaint Type", value: "Cryptocurrency Investment Fraud", width: "w-[62%]" },
  { label: "Date of Loss", value: "04 / 11 / 2026", width: "w-[34%]" },
  { label: "Dollar Loss", value: "$87,400.00 USD", width: "w-[34%]" },
  { label: "Method of Payment", value: "USDT (TRC-20)", width: "w-[62%]" },
];

function PortalWindow() {
  const [filled, setFilled] = useState(0);
  const [caret, setCaret] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setFilled((n) => (n >= PORTAL_FIELDS.length ? 0 : n + 1)), 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const blink = setInterval(() => setCaret((c) => !c), 520);
    return () => clearInterval(blink);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-md border border-white/15 bg-[#071627] shadow-[0_30px_70px_-25px_rgba(0,0,0,0.9)]">
      {/* browser chrome */}
      <div className="flex items-center gap-3 border-b border-white/10 bg-[#0d2440] px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#e05252]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#e0b23c]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#4fae6b]" />
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-sm bg-black/35 px-3 py-1.5">
          <Lock size={12} className="shrink-0 text-[#4fae6b]" />
          <span className="truncate font-mono text-[11.5px] text-white/70">{IC3.host}</span>
        </div>
        <span className="hidden items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#E8C766] sm:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4fae6b]" /> Secure
        </span>
      </div>

      {/* form body */}
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#E8C766]">
            New Complaint — Step 2 of 5
          </span>
          <span className="font-mono text-[10px] text-white/40">REF: IC3-2026-••••</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#C49A3C] to-[#E8C766]"
            animate={{ width: `${((filled + 1) / (PORTAL_FIELDS.length + 1)) * 100}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </div>

        {PORTAL_FIELDS.map((f, i) => {
          const isOn = i < filled;
          return (
            <div key={f.label} className={`${f.width} min-w-[150px]`}>
              <div className="mb-1 text-[9.5px] font-bold uppercase tracking-wider text-white/40">
                {f.label}
              </div>
              <div
                className={`flex h-8 items-center rounded-sm border px-2.5 font-mono text-[11.5px] transition-all duration-300 ${
                  isOn
                    ? "border-[#C49A3C]/50 bg-white/[0.06] text-white"
                    : "border-white/10 bg-black/20 text-white/15"
                }`}
              >
                {isOn ? f.value : "—"}
                {i === filled - 1 && caret && (
                  <span className="ml-1 inline-block h-3.5 w-[2px] bg-[#E8C766]" />
                )}
              </div>
            </div>
          );
        })}

        <div className="flex items-center justify-between pt-1">
          <span className="text-[9.5px] text-white/30">Encrypted submission • 18 U.S.C. § 1030</span>
          <span className="rounded-sm bg-[#C49A3C] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-black">
            Submit
          </span>
        </div>
      </div>

      {/* sweep highlight */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-[#E8C766]/[0.04] to-transparent" />
    </div>
  );
}

/* ---------- the section ---------- */
export function IC3Channels() {
  const { copied, copy } = useCopy();

  return (
    <section id="ic3" className="relative scroll-mt-28 overflow-hidden bg-[#071627] py-16 text-white md:py-24">
      {/* layered ambient background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 50% at 15% 0%, rgba(18,50,91,0.85) 0%, transparent 60%), radial-gradient(ellipse 55% 45% at 92% 12%, rgba(178,34,52,0.30) 0%, transparent 62%), radial-gradient(ellipse 60% 50% at 60% 100%, rgba(196,154,60,0.18) 0%, transparent 65%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "58px 58px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent)",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C49A3C]/60 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4">
        {/* header — asymmetric, left aligned */}
        <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-end">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full border border-[#C49A3C]/40 bg-[#C49A3C]/10 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#E8C766]"
            >
              <Radio size={13} className="animate-pulse" /> Official Reporting Channels
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.06 }}
              className="mt-5 font-serif text-[34px] font-extrabold leading-[1.05] tracking-tight md:text-5xl"
            >
              Two ways to reach us
              <span className="block text-[#E8C766]">when money is moving fast.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.12 }}
              className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/65"
            >
              File online with the Internet Crime Complaint Center, or reach a Special Agent
              directly by voice or text. Reporting within the first 72 hours dramatically
              improves the odds of freezing funds at the exchange or receiving bank.
            </motion.p>
          </div>

          {/* urgency callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
            className="flex items-start gap-3.5 rounded-md border-l-4 border-[#B22234] bg-white/[0.05] p-5 backdrop-blur-sm"
          >
            <ShieldAlert size={22} className="mt-0.5 shrink-0 text-[#e05252]" />
            <div>
              <div className="text-[13.5px] font-extrabold uppercase tracking-wide">
                Funds in transit? Call or text now.
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/60">
                Cryptocurrency and wire transfers can be layered across jurisdictions within
                hours. The Special Agent line exists for active, in-progress losses — not
                general questions.
              </p>
            </div>
          </motion.div>
        </div>

        {/* two channels — deliberately unequal */}
        <div className="mt-12 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          {/* IC3 portal */}
          <motion.a
            href={IC3.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            className="group relative flex flex-col overflow-hidden rounded-md border border-white/12 bg-[#0B1F3A]/70 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#C49A3C]/45 hover:shadow-[0_28px_60px_-24px_rgba(196,154,60,0.45)] md:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#C49A3C] text-black transition-transform duration-300 group-hover:scale-110">
                  <Globe size={21} />
                </span>
                <div>
                  <div className="font-serif text-[19px] font-extrabold leading-tight">
                    {IC3.name}
                  </div>
                  <div className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-[#E8C766]">
                    IC3 • Est. {IC3.since}
                  </div>
                </div>
              </div>
              <ExternalLink
                size={17}
                className="mt-1 shrink-0 text-white/35 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#E8C766]"
              />
            </div>

            <p className="mt-4 text-[14px] leading-relaxed text-white/60">{IC3.tagline}</p>

            <div className="mt-5">
              <PortalWindow />
            </div>

            {/* stats */}
            <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-sm bg-white/10 sm:grid-cols-4">
              {IC3.stats.map((s) => (
                <div key={s.label} className="bg-[#0B1F3A] px-3 py-3 text-center">
                  <div className="font-serif text-[17px] font-extrabold text-[#E8C766] tabular-nums">
                    {s.value}
                  </div>
                  <div className="mt-0.5 text-[9.5px] font-bold uppercase tracking-wider text-white/45">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <span className="mt-5 inline-flex items-center gap-2 text-[12.5px] font-extrabold uppercase tracking-wider text-[#E8C766] transition-all duration-300 group-hover:gap-3.5">
              Open IC3 Complaint Portal <ArrowRight size={15} />
            </span>

            <span className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#C49A3C]/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
          </motion.a>

          {/* Special agent line */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: 0.08 }}
            className="flex flex-col overflow-hidden rounded-md border border-[#B22234]/40 bg-gradient-to-b from-[#2a0d13] to-[#160709] p-6 shadow-[0_24px_55px_-28px_rgba(178,34,52,0.6)] md:p-7"
          >
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#B22234]">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#B22234] opacity-60" />
                <Phone size={17} className="relative text-white" />
              </span>
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#e79aa4]">
                  {AGENT_LINE.label}
                </div>
                <div className="text-[11.5px] text-white/50">{AGENT_LINE.hours}</div>
              </div>
            </div>

            {/* the number itself — huge */}
            <a
              href={`tel:${AGENT_LINE.tel}`}
              className="group/num mt-6 block"
            >
              <span className="block font-mono text-[30px] font-bold leading-none tracking-tight text-white transition-colors duration-200 group-hover/num:text-[#E8C766] sm:text-[38px]">
                {AGENT_LINE.display}
              </span>
              <span className="mt-2 flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wider text-white/40 transition-colors group-hover/num:text-[#E8C766]/70">
                Tap to dial <ArrowRight size={12} />
              </span>
            </a>

            {/* call / text / copy */}
            <div className="mt-6 grid grid-cols-2 gap-2.5">
              <a
                href={`tel:${AGENT_LINE.tel}`}
                className="flex items-center justify-center gap-2 rounded-sm bg-[#B22234] px-4 py-3.5 text-[12.5px] font-extrabold uppercase tracking-wide text-white transition-all duration-200 hover:bg-[#8f1b29] hover:shadow-lg active:scale-[0.97]"
              >
                <Phone size={15} /> Call Agent
              </a>
              <a
                href={`sms:${AGENT_LINE.sms}`}
                className="flex items-center justify-center gap-2 rounded-sm bg-white px-4 py-3.5 text-[12.5px] font-extrabold uppercase tracking-wide text-[#160709] transition-all duration-200 hover:bg-[#E8C766] hover:shadow-lg active:scale-[0.97]"
              >
                <MessageSquare size={15} /> Text Now
              </a>
            </div>

            <button
              type="button"
              onClick={() => void copy()}
              className="mt-2.5 flex items-center justify-center gap-2 rounded-sm border border-white/18 px-4 py-3 text-[12px] font-bold uppercase tracking-wide text-white/75 transition-all duration-200 hover:border-white/40 hover:text-white active:scale-[0.98]"
            >
              {copied ? (
                <>
                  <Check size={15} className="text-[#4fae6b]" /> Number copied to clipboard
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy number
                </>
              )}
            </button>

            <div className="mt-6 space-y-2.5 border-t border-white/10 pt-5">
              {[
                "Active loss or funds transferred in the last 72 hours",
                "Sextortion, threats against a minor, or doxxing",
                "Ransomware demand or extortion in progress",
                "Impersonation of FBI agents or federal officials",
              ].map((line) => (
                <div key={line} className="flex items-start gap-2.5 text-[12.5px] leading-snug text-white/65">
                  <FileWarning size={14} className="mt-0.5 shrink-0 text-[#e79aa4]" />
                  <span>{line}</span>
                </div>
              ))}
            </div>

            <p className="mt-5 rounded-sm bg-black/30 p-3 text-[11px] leading-relaxed text-white/45">
              For life-threatening emergencies, call <strong className="text-white">911</strong> first.
              Text messages are answered by on-duty personnel when available.
            </p>
          </motion.div>
        </div>

        {/* timeline */}
        <div className="mt-14">
          <div className="flex items-center gap-3">
            <span className="h-[3px] w-8 bg-[#C49A3C]" />
            <h3 className="text-[11.5px] font-extrabold uppercase tracking-[0.22em] text-[#E8C766]">
              What happens after you report
            </h3>
          </div>

          <div className="relative mt-7">
            {/* connecting rail */}
            <div className="absolute left-0 right-0 top-[26px] hidden h-px bg-gradient-to-r from-[#C49A3C]/50 via-white/15 to-transparent lg:block" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {REPORT_TIMELINE.map((t, i) => (
                <motion.div
                  key={t.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.09 }}
                  className="group relative"
                >
                  <div
                    className="flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 font-mono text-[15px] font-bold transition-all duration-300 group-hover:scale-110"
                    style={{
                      borderColor: t.accent,
                      color: t.accent === "#C49A3C" ? "#E8C766" : "#fff",
                      backgroundColor: i % 2 === 0 ? "rgba(255,255,255,0.04)" : "transparent",
                    }}
                  >
                    {t.step}
                  </div>
                  <h4 className="mt-4 text-[15px] font-extrabold text-white transition-colors duration-200 group-hover:text-[#E8C766]">
                    {t.title}
                  </h4>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">{t.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- compact badge for the sticky header (stays visible on scroll) ---------- */
export function AgentLineBadge() {
  return (
    <div className="hidden items-center gap-2 xl:flex">
      <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#B22234]">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#B22234] opacity-50" />
        <Phone size={13} className="relative text-white" />
      </span>
      <div className="leading-tight">
        <div className="text-[8.5px] font-extrabold uppercase tracking-[0.14em] text-[#E8C766]">
          Special Agent Line
        </div>
        <div className="flex items-center gap-1.5">
          <a
            href={`tel:${AGENT_LINE.tel}`}
            className="font-mono text-[12.5px] font-bold text-white transition-colors hover:text-[#E8C766]"
          >
            {AGENT_LINE.display}
          </a>
          <a
            href={`sms:${AGENT_LINE.sms}`}
            className="flex h-5 items-center gap-1 rounded-sm bg-white/12 px-1.5 text-[9px] font-extrabold uppercase tracking-wide text-white transition-colors hover:bg-[#C49A3C] hover:text-black"
            title="Send a text message"
          >
            <MessageSquare size={10} /> Text
          </a>
        </div>
      </div>
    </div>
  );
}
