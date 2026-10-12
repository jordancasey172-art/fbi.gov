import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Menu, X, ChevronDown, Phone, MapPin,
  ExternalLink, Shield, Bell, Globe, Clock, ArrowUp, Siren, Fingerprint,
  Share2, AtSign, Rss, MessageCircle, MessageSquare, Send
} from "lucide-react";
import { WANTED, NEWS, FIELD_OFFICES, AGENT_LINE, IC3 } from "../data";
import { AgentLineBadge } from "./ic3";

export function Seal({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="shrink-0 drop-shadow-lg">
      <circle cx="50" cy="50" r="48" fill="#0B1F3A" stroke="#C49A3C" strokeWidth="3" />
      <circle cx="50" cy="50" r="41" fill="none" stroke="#C49A3C" strokeWidth="1" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="#C49A3C" strokeWidth="0.5" strokeDasharray="2 2" />
      {/* circular text simulation */}
      <path id="topArc" d="M 50,50 m -33,0 a 33,33 0 1,1 66,0" fill="none" />
      <text fontSize="7.2" fill="#E8C766" fontWeight="700" letterSpacing="1.2" textAnchor="middle">
        <textPath href="#topArc" startOffset="25%">FEDERAL BUREAU</textPath>
      </text>
      <path id="botArc" d="M 50,50 m -33,0 a 33,33 0 1,0 66,0" fill="none" />
      <text fontSize="7.2" fill="#E8C766" fontWeight="700" letterSpacing="1.2" textAnchor="middle">
        <textPath href="#botArc" startOffset="25%">OF INVESTIGATION</textPath>
      </text>
      {/* inner shield */}
      <g transform="translate(50 52)">
        <path d="M0,-18 L14,-11 V4 C14,12 7,17 0,20 C-7,17 -14,12 -14,4 V-11 Z" fill="#12325B" stroke="#E8C766" strokeWidth="1.5" />
        <path d="M0,-18 L0,20 M-14,-11 L14,-11 M-14,2 L14,2" stroke="#E8C766" strokeWidth="0.5" opacity="0.7" />
        {/* scales */}
        <g stroke="#E8C766" strokeWidth="1" fill="none">
          <line x1="-6" y1="-8" x2="6" y2="-8" />
          <line x1="0" y1="-8" x2="0" y2="-3" />
          <path d="M-6,-8 L-8,-3 M-6,-8 L-4,-3 M6,-8 L4,-3 M6,-8 L8,-3" />
        </g>
        {/* stars */}
        <g fill="#E8C766">
          <circle cx="-7" cy="7" r="1.2" /><circle cx="0" cy="8.5" r="1.2" /><circle cx="7" cy="7" r="1.2" />
        </g>
        <text y="-13.5" textAnchor="middle" fontSize="4.5" fill="#E8C766" fontWeight="800">FBI</text>
        {/* stripes */}
        <g>
          {[-9, -4.5, 0, 4.5, 9].map((x) => (
            <rect key={x} x={x - 1} y={11} width={2} height={4} fill="#B22234" opacity="0.9" />
          ))}
        </g>
      </g>
      {/* side stars */}
      <g fill="#E8C766" fontSize="8">
        <text x="8" y="53" textAnchor="middle">★</text>
        <text x="92" y="53" textAnchor="middle">★</text>
      </g>
    </svg>
  );
}

export function GovBanner() {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-[#F0F0F0] border-b border-black/10 text-[12.5px] text-gray-700 relative z-[60]">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1.5">
          <svg width="16" height="12" viewBox="0 0 19 13" className="rounded-[1px] shadow-sm">
            <rect width="19" height="13" fill="#B22234" />
            {[...Array(6)].map((_, i) => (
              <rect key={i} y={i * 2 + 1} width="19" height="1" fill="white" />
            ))}
            <rect width="8" height="7" fill="#3C3B6E" />
          </svg>
          <span className="font-medium">An official website of the United States government</span>
        </span>
        <button onClick={() => setOpen(!open)} className="text-[#0B1F3A] underline underline-offset-2 hover:text-[#1a4a8a] flex items-center gap-1 font-medium">
          Here's how you know <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <div className="ml-auto hidden md:flex items-center gap-4 text-[12px]">
          <span className="flex items-center gap-1"><Clock size={12} /> <LiveClock /></span>
          <a href="#field-offices" className="flex items-center gap-1 hover:underline"><MapPin size={12} /> Find Your Field Office</a>
          <a href="#tips" className="flex items-center gap-1 hover:underline font-semibold text-[#B22234]"><Siren size={12} /> Submit a Tip</a>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white border-t border-black/10">
            <div className="max-w-7xl mx-auto px-4 py-4 grid md:grid-cols-2 gap-6 text-[13px]">
              <div className="flex gap-3">
                <Globe className="text-[#0B1F3A] shrink-0 mt-0.5" size={28} />
                <div><p className="font-bold text-[#0B1F3A]">Official websites use .gov</p><p className="text-gray-600">A .gov website belongs to an official government organization in the United States.</p></div>
              </div>
              <div className="flex gap-3">
                <Shield className="text-[#0B1F3A] shrink-0 mt-0.5" size={28} />
                <div><p className="font-bold text-[#0B1F3A]">Secure .gov websites use HTTPS</p><p className="text-gray-600">A lock or https:// means you've safely connected. Share sensitive information only on official, secure websites.</p></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return <span className="tabular-nums">{now.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit" })} ET</span>;
}

const NAV = [
  { label: "Most Wanted", href: "#wanted", items: ["Ten Most Wanted", "Fugitives", "Missing Persons", "Seeking Information"] },
  { label: "News", href: "#news", items: ["Press Releases", "Speeches", "Podcasts", "Reports"] },
  { label: "Services", href: "#services", items: ["Background Checks", "Fingerprints", "FOIA / Vault", "Victim Services"] },
  { label: "Report a Scam", href: "#ic3", items: ["IC3 Complaint Portal", "Special Agent Direct Line", "Cryptocurrency Fraud", "Elder & Romance Fraud", "Ransomware & Extortion"] },
  { label: "Information", href: "#stats", items: ["Crime Data Explorer", "Scams & Safety", "History", "Stats & Reports"] },
  { label: "Field Offices", href: "#field-offices", items: ["Locate an Office", "Resident Agencies", "Overseas Offices"] },
  { label: "About", href: "#about", items: ["Mission", "Leadership", "Careers", "Contact"] },
];

export function Header({ onSearch }: { onSearch: (q: string) => void }) {
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [activeDrop, setActiveDrop] = useState<string | null>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const results = q.trim().length > 1 ? [
    ...WANTED.filter(w => w.name.toLowerCase().includes(q.toLowerCase()) || w.crime.toLowerCase().includes(q.toLowerCase())).slice(0, 3).map(w => ({ type: "Wanted", title: w.name, sub: w.crime, href: "#wanted" })),
    ...NEWS.filter(n => n.title.toLowerCase().includes(q.toLowerCase())).slice(0, 3).map(n => ({ type: "News", title: n.title, sub: n.date, href: "#news" })),
    ...FIELD_OFFICES.filter(o => o.city.toLowerCase().includes(q.toLowerCase()) || o.state.toLowerCase().includes(q.toLowerCase())).slice(0, 3).map(o => ({ type: "Field Office", title: `${o.city}, ${o.stateCode}`, sub: o.phone, href: "#field-offices" })),
  ] : [];

  return (
    <>
      <header className={`sticky top-0 z-50 transition-shadow ${scrolled ? "shadow-xl" : ""}`}>
        {/* Main bar */}
        <div className="bg-[#0B1F3A] text-white border-b-[3px] border-[#C49A3C]">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
            <a href="#top" className="flex items-center gap-3 group">
              <Seal size={58} />
              <div className="leading-tight">
                <div className="text-[11px] tracking-[0.18em] text-[#E8C766] font-bold uppercase">Federal Bureau of Investigation</div>
                <div className="text-2xl md:text-[28px] font-extrabold tracking-tight font-serif">FBI<span className="text-[#E8C766]">.gov</span></div>
                <div className="text-[11px] text-white/70 italic hidden sm:block">Fidelity • Bravery • Integrity</div>
              </div>
            </a>
            <div className="ml-auto flex items-center gap-2 md:gap-3">
              <div className="hidden lg:flex items-center gap-2 mr-2">
                {[Share2, AtSign, Rss, MessageCircle, Send].map((Icon, i) => (
                  <a key={i} href="#top" className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#C49A3C] hover:text-black flex items-center justify-center transition-colors" aria-label="social">
                    <Icon size={15} />
                  </a>
                ))}
              </div>
              <AgentLineBadge />
              <a href={IC3.url} target="_blank" rel="noopener noreferrer" className="hidden lg:inline-flex items-center gap-1.5 border border-[#C49A3C]/50 text-[#E8C766] hover:bg-[#C49A3C] hover:text-black text-[12px] font-bold px-3 py-2 rounded-sm uppercase tracking-wide transition-colors">
                <Globe size={14} /> IC3
              </a>
              <a href="#tips" className="hidden md:inline-flex items-center gap-2 bg-[#B22234] hover:bg-[#8f1b29] text-white text-[13px] font-bold px-4 py-2.5 rounded-sm uppercase tracking-wide transition-colors">
                <Siren size={15} /> Submit a Tip
              </a>
              <a href="#support-chat" className="hidden sm:flex w-10 h-10 rounded-sm bg-white/10 hover:bg-white/20 items-center justify-center transition-colors" aria-label="Open website chat and complaints" title="Website chat and complaints (unofficial)">
                <MessageCircle size={19} />
              </a>
              <button onClick={() => setSearchOpen(true)} className="w-10 h-10 rounded-sm bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" aria-label="Search">
                <Search size={18} />
              </button>
              <button onClick={() => setMobile(!mobile)} className="lg:hidden w-10 h-10 rounded-sm bg-white/10 flex items-center justify-center" aria-label="Menu">
                {mobile ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
        {/* Nav */}
        <nav className="bg-[#12325B] text-white hidden lg:block border-b border-black/30">
          <div className="max-w-7xl mx-auto px-4 flex items-stretch">
            {NAV.map((n) => (
              <div key={n.label} className="relative group" onMouseEnter={() => setActiveDrop(n.label)} onMouseLeave={() => setActiveDrop(null)}>
                <a href={n.href} className={`flex items-center gap-1 px-5 py-3 text-[13.5px] font-semibold uppercase tracking-wide transition-colors border-l border-white/10 last:border-r ${
                  n.label === "Report a Scam"
                    ? "bg-[#B22234]/85 text-white hover:bg-[#B22234] hover:text-white"
                    : "hover:bg-[#0B1F3A] hover:text-[#E8C766]"
                }`}>
                  {n.label} <ChevronDown size={13} className="opacity-70" />
                </a>
                <AnimatePresence>
                  {activeDrop === n.label && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.15 }} className="absolute top-full left-0 min-w-[240px] bg-white text-gray-800 shadow-2xl border-t-[3px] border-[#C49A3C] z-50">
                      {n.items.map((it) => (
                        <a key={it} href={n.href} className="block px-4 py-2.5 text-[13.5px] font-medium hover:bg-[#F0F0F0] hover:text-[#0B1F3A] border-b border-black/5 last:border-0">
                          {it}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            <div className="ml-auto flex items-center gap-2 px-4 text-[12.5px] text-white/80">
              <Phone size={13} /> <span className="font-bold text-white">1-855-CALL-FBI</span>
            </div>
          </div>
        </nav>
        {/* Mobile nav */}
        <AnimatePresence>
          {mobile && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="lg:hidden overflow-hidden bg-[#0B1F3A] text-white border-t border-white/10">
              <div className="px-4 py-3 space-y-1">
                {NAV.map((n) => (
                  <a key={n.label} href={n.href} onClick={() => setMobile(false)} className="block px-3 py-2.5 rounded bg-white/5 font-semibold uppercase text-[13px] tracking-wide hover:bg-white/10">
                    {n.label}
                  </a>
                ))}
                <a href="#tips" onClick={() => setMobile(false)} className="block text-center mt-2 bg-[#B22234] font-bold uppercase text-[13px] px-3 py-3 rounded">
                  Submit a Tip — 1-855-CALL-FBI
                </a>
                <div className="mt-2 rounded bg-white/5 border border-white/10 p-3">
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#E8C766]">
                    {AGENT_LINE.label}
                  </div>
                  <div className="mt-1 font-mono text-[15px] font-bold text-white">{AGENT_LINE.display}</div>
                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    <a href={`tel:${AGENT_LINE.tel}`} className="flex items-center justify-center gap-1.5 bg-[#B22234] px-3 py-2.5 text-[11px] font-extrabold uppercase text-white">
                      <Phone size={13} /> Call Agent
                    </a>
                    <a href={`sms:${AGENT_LINE.sms}`} className="flex items-center justify-center gap-1.5 bg-[#C49A3C] px-3 py-2.5 text-[11px] font-extrabold uppercase text-black">
                      <MessageSquare size={13} /> Text Now
                    </a>
                  </div>
                </div>
                <a href={IC3.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 mt-2 border border-[#C49A3C]/50 text-[#E8C766] font-bold uppercase text-[12px] px-3 py-3 rounded">
                  <Globe size={14} /> IC3 Complaint Portal
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-[#0B1F3A]/95 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setSearchOpen(false)}>
            <div className="max-w-3xl mx-auto mt-16 md:mt-24" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between text-white mb-4">
                <div className="flex items-center gap-2 text-[#E8C766] font-bold uppercase tracking-widest text-[13px]"><Search size={16} /> Search FBI.gov</div>
                <button onClick={() => setSearchOpen(false)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><X size={18} /></button>
              </div>
              <div className="relative">
                <input autoFocus value={q} onChange={(e) => { setQ(e.target.value); onSearch(e.target.value); }} placeholder="Search wanted fugitives, scams, news, field offices..." className="w-full bg-white rounded-sm pl-12 pr-4 py-4 text-[16px] text-gray-900 outline-none ring-[#C49A3C] focus:ring-4 shadow-2xl" />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
                {["Ransomware", "Most Wanted", "Crypto Scam", "Elder Fraud", "Chicago", "Missing"].map((t) => (
                  <button key={t} onClick={() => setQ(t)} className="px-3 py-1.5 rounded-full bg-white/10 text-white hover:bg-[#C49A3C] hover:text-black transition-colors border border-white/20">{t}</button>
                ))}
              </div>
              {results.length > 0 && (
                <div className="mt-4 bg-white rounded-sm shadow-2xl overflow-hidden">
                  {results.map((r, i) => (
                    <a key={i} href={r.href} onClick={() => setSearchOpen(false)} className="flex items-center gap-3 px-4 py-3 border-b border-black/5 last:border-0 hover:bg-[#F7F3E6]">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0B1F3A] text-[#E8C766] px-2 py-1 rounded-sm shrink-0">{r.type}</span>
                      <div className="min-w-0"><div className="font-semibold text-[14px] text-gray-900 truncate">{r.title}</div><div className="text-[12px] text-gray-500 truncate">{r.sub}</div></div>
                    </a>
                  ))}
                </div>
              )}
              {q.trim().length > 1 && results.length === 0 && (
                <div className="mt-4 bg-white rounded-sm p-6 text-center text-gray-500 text-[14px]">No results found for "{q}". Try searching "crypto", "fraud", or "Chicago".</div>
              )}
              <p className="mt-4 text-center text-white/50 text-[12px]">Press ESC or click outside to close</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function AlertTicker() {
  const items = [
    "SEEKING INFORMATION: Armored car robberies in OH, IN, KY — $25,000 reward",
    "NEW TO TEN MOST WANTED: Cyber fugitive wanted for hospital ransomware attacks",
    "SCAM ALERT: FBI impersonators demanding gift cards — hang up & report to IC3",
    "MISSING: FBI seeks public's help locating 2 children last seen in Denver",
    "OPERATION SILENT LEDGER: 42 servers seized in global ransomware takedown",
    "REPORT INTERNET CRIME: File at internetcrimecomplaintcenter.vercel.app (IC3)",
    "SPECIAL AGENT DIRECT LINE: Call or text +1 561-973-0575 for active losses within 72 hours",
  ];
  return (
    <div className="bg-[#B22234] text-white overflow-hidden border-y border-black/20 relative z-40">
      <div className="flex items-stretch">
        <div className="bg-black/30 px-4 py-2 flex items-center gap-2 font-extrabold uppercase text-[12px] tracking-widest shrink-0 z-10">
          <Bell size={14} className="animate-pulse" /> <span className="hidden sm:inline">Alerts</span>
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="ticker-track flex items-center gap-12 whitespace-nowrap py-2 text-[13px] font-medium">
            {[...items, ...items].map((t, i) => (
              <span key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-300 inline-block" />{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  const cols = [
    { h: "Report a Scam", links: ["IC3 Complaint Portal", "Special Agent Direct Line", "Cryptocurrency Fraud", "Elder & Romance Fraud", "Ransomware & Extortion"], href: "#ic3" },
    { h: "Most Wanted", links: ["Ten Most Wanted", "Fugitives", "Missing Persons", "Seeking Information", "Rewards Offered"], href: "#wanted" },
    { h: "Services", links: ["Background Checks", "Fingerprinting", "FOIA & The Vault", "Victim Services", "Name Checks"], href: "#services" },
    { h: "Information", links: ["Crime Data Explorer", "Scams & Safety", "History", "Reports & Publications", "FOIA Library"], href: "#stats" },
  ];
  return (
    <footer className="bg-[#0B1F3A] text-white mt-0">
      <div className="h-1 bg-gradient-to-r from-[#B22234] via-white to-[#12325B]" />
      <div className="max-w-7xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-[1.2fr_2fr]">
        <div>
          <div className="flex items-center gap-3">
            <Seal size={56} />
            <div>
              <div className="font-extrabold text-lg leading-tight">Federal Bureau<br />of Investigation</div>
              <div className="text-[#E8C766] text-[11px] tracking-[0.2em] font-bold mt-1">FIDELITY • BRAVERY • INTEGRITY</div>
            </div>
          </div>
          <p className="mt-4 text-[13px] text-white/70 leading-relaxed max-w-sm">
            J. Edgar Hoover Building<br />935 Pennsylvania Avenue, NW<br />Washington, D.C. 20535-0001<br />
            <span className="text-white font-semibold">(202) 324-3000 • 1-855-CALL-FBI</span>
          </p>
          <div className="mt-4 rounded-sm border border-[#B22234]/45 bg-[#B22234]/12 p-3.5 max-w-sm">
            <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#e79aa4]">
              <Phone size={12} /> {AGENT_LINE.label}
            </div>
            <div className="mt-1 font-mono text-[17px] font-bold text-white">{AGENT_LINE.display}</div>
            <div className="mt-1 text-[11.5px] text-white/55">{AGENT_LINE.hours}</div>
            <div className="mt-2.5 flex gap-2">
              <a href={`tel:${AGENT_LINE.tel}`} className="flex flex-1 items-center justify-center gap-1.5 bg-[#B22234] px-3 py-2 text-[10.5px] font-extrabold uppercase text-white transition-colors hover:bg-[#8f1b29]">
                <Phone size={12} /> Call
              </a>
              <a href={`sms:${AGENT_LINE.sms}`} className="flex flex-1 items-center justify-center gap-1.5 bg-[#C49A3C] px-3 py-2 text-[10.5px] font-extrabold uppercase text-black transition-colors hover:bg-[#E8C766]">
                <MessageSquare size={12} /> Text
              </a>
            </div>
          </div>
          <a href={IC3.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex max-w-sm items-center gap-2 rounded-sm border border-[#C49A3C]/40 bg-[#C49A3C]/10 px-3.5 py-2.5 text-[12.5px] font-bold text-[#E8C766] transition-colors hover:bg-[#C49A3C] hover:text-black">
            <Globe size={14} className="shrink-0" />
            <span className="truncate">{IC3.host}</span>
            <ExternalLink size={12} className="shrink-0" />
          </a>
          <div className="mt-4 flex gap-2">
            {[Share2, AtSign, Rss, MessageCircle].map((Icon, i) => (
              <a key={i} href="#top" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#C49A3C] hover:text-black flex items-center justify-center transition-colors"><Icon size={16} /></a>
            ))}
          </div>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-[12px] text-white/70">
            <Fingerprint size={14} /> Department of Justice • Federal Bureau of Investigation
          </div>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-white/80" aria-label="Website support">
            <a href="#support-chat" className="hover:text-white hover:underline underline-offset-2">Live Support Chat</a>
            <a href="#support-complaint" className="hover:text-white hover:underline underline-offset-2">File an Online Complaint</a>
            <a href="#support-inbox" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline underline-offset-2">Staff Portal / Inbox</a>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {cols.map((c) => (
            <div key={c.h}>
              <h4 className="text-[12px] font-extrabold uppercase tracking-widest text-[#E8C766] mb-3 border-b border-white/10 pb-2">{c.h}</h4>
              <ul className="space-y-2 text-[13px] text-white/80">
                {c.links.map((l) => {
                  const external = l === "IC3 Complaint Portal";
                  return (
                    <li key={l}>
                      <a
                        href={external ? IC3.url : c.href}
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className={`inline-flex items-center gap-1.5 hover:text-white hover:underline underline-offset-2 ${external ? "font-bold text-[#E8C766]" : ""}`}
                      >
                        {l}{external && <ExternalLink size={11} />}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-white/60">
          <span>© 2026 Federal Bureau of Investigation</span>
          <a href="#top" className="hover:text-white flex items-center gap-1">DOJ <ExternalLink size={11} /></a>
          <a href="#top" className="hover:text-white">USA.gov</a>
          <a href="#top" className="hover:text-white">Privacy Policy</a>
          <a href="#top" className="hover:text-white">FOIA</a>
          <a href="#top" className="hover:text-white">No FEAR Act</a>
          <span className="ml-auto flex items-center gap-1"><Shield size={12} /> Official FBI Portal • 24/7 Duty Service</span>
        </div>
      </div>
    </footer>
  );
}

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 800);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  if (!show) return null;
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-24 right-6 z-50 w-11 h-11 rounded-full bg-[#0B1F3A] text-[#E8C766] shadow-2xl border border-[#C49A3C]/40 flex items-center justify-center hover:bg-[#12325B]" aria-label="Back to top">
      <ArrowUp size={18} />
    </button>
  );
}
