import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight, MapPin, Phone, Search, Siren, ShieldCheck, Fingerprint,
  FileText, Users, Landmark, ArrowRight, Calendar, Clock, Eye, TrendingUp,
  TrendingDown, Bitcoin, Shield, Lock, TriangleAlert as AlertIcon, CheckCircle2,
  Send, Building2, Star, Award, Briefcase, DollarSign, AlertCircle, Printer, Globe, MessageSquare
} from "lucide-react";
import { NEWS, FIELD_OFFICES, CRIME_STATS, CRIME_BARS, SCAMS, HERO_IMAGE, INTERROGATION_IMAGE, FINGERPRINT_IMAGE, BOARD_IMAGE, FORENSIC_IMAGE, IC3, AGENT_LINE } from "../data";
import { PostReportCapture, type FiledReport } from "../support/PostReportCapture";
import "../support/support.css";

/* ---------- HERO ---------- */
export function Hero() {
  const [slide, setSlide] = useState(0);
  const slides = [
    { kicker: "Operation Silent Ledger", title: "FBI-Led Operation Dismantles Ransomware Network Targeting Hospitals", desc: "42 servers seized • $8.7M in crypto recovered • 5 arrests in coordinated international takedown.", cta: "Read Press Release", img: HERO_IMAGE },
    { kicker: "Ten Most Wanted", title: "New Fugitive Added: $500,000 Reward for Cyber Intrusion Suspect", desc: "Accused of encrypting hospital systems across 14 states. Public assistance sought — do not approach.", cta: "View Poster", img: INTERROGATION_IMAGE },
    { kicker: "Protect Your Family", title: "Elder Fraud Losses Top $3.4B — Learn the Warning Signs", desc: "AI voice-cloning scams surging. Learn how to protect loved ones and report to IC3.", cta: "Scams & Safety", img: BOARD_IMAGE },
  ];
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, []);
  const s = slides[slide];
  return (
    <section id="top" className="relative bg-[#0B1F3A] text-white overflow-hidden scroll-mt-28">
      <div className="absolute inset-0">
        <motion.img key={slide} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} src={s.img} alt="" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A] via-[#0B1F3A]/85 to-[#0B1F3A]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A] via-transparent to-transparent" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 pt-14 pb-10 md:pt-20 md:pb-16 grid lg:grid-cols-[1.5fr_1fr] gap-10 items-center min-h-[540px]">
        <div>
          <motion.div key={"k" + slide} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-[#B22234] text-white text-[11px] font-extrabold uppercase tracking-[0.18em] px-3 py-1.5 rounded-sm">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> {s.kicker}
          </motion.div>
          <motion.h1 key={"t" + slide} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 text-3xl md:text-5xl font-extrabold leading-[1.08] tracking-tight font-serif max-w-2xl">
            {s.title}
          </motion.h1>
          <motion.p key={"d" + slide} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-4 text-white/80 text-[15px] md:text-[17px] max-w-xl leading-relaxed">
            {s.desc}
          </motion.p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#news" className="inline-flex items-center gap-2 bg-[#C49A3C] hover:bg-[#E8C766] text-black font-extrabold uppercase text-[13px] tracking-wide px-6 py-3.5 rounded-sm transition-colors">
              {s.cta} <ArrowRight size={15} />
            </a>
            <a href="#wanted" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold uppercase text-[13px] tracking-wide px-6 py-3.5 rounded-sm backdrop-blur transition-colors">
              Ten Most Wanted
            </a>
          </div>
          <div className="mt-8 flex items-center gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === slide ? "w-10 bg-[#C49A3C]" : "w-6 bg-white/30 hover:bg-white/50"}`} />
            ))}
            <span className="ml-3 text-[12px] text-white/50 font-medium">{slide + 1} / {slides.length} • Official Bureau Updates</span>
          </div>
        </div>
        {/* quick actions panel */}
        <div className="bg-white text-gray-900 rounded-sm shadow-2xl overflow-hidden">
          <div className="bg-[#12325B] text-white px-5 py-3 flex items-center justify-between">
            <span className="font-extrabold uppercase tracking-widest text-[12px]">How Can We Help You?</span>
            <ShieldCheck size={18} className="text-[#E8C766]" />
          </div>
          <div className="divide-y divide-black/8">
            {[
              { icon: Siren, t: "Submit a Tip & Report Scams", d: "Report fraud, scams, and criminal activity", href: "#tips", hot: true },
              { icon: Globe, t: "IC3 Complaint Center", d: "File internet crime online — 24/7 intake", href: IC3.url, hot: false, ext: true },
              { icon: Phone, t: "Special Agent Direct Line", d: `${AGENT_LINE.display} — call or text`, href: `tel:${AGENT_LINE.tel}`, hot: false },
              { icon: MapPin, t: "Find Your Field Office", d: "56 field divisions nationwide + legal attachés", href: "#field-offices", hot: false },
            ].map((a) => (
              <a key={a.t} href={a.href} {...(a.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F7F3E6] transition-colors group">
                <span className={`w-10 h-10 rounded-sm flex items-center justify-center shrink-0 ${a.hot ? "bg-[#B22234] text-white" : "bg-[#0B1F3A]/8 text-[#0B1F3A] group-hover:bg-[#0B1F3A] group-hover:text-[#E8C766]"} transition-colors`}>
                  <a.icon size={18} />
                </span>
                <span className="flex-1"><span className="block font-bold text-[14px] text-[#0B1F3A]">{a.t}</span><span className="block text-[12.5px] text-gray-500">{a.d}</span></span>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-[#0B1F3A] group-hover:translate-x-1 transition-all" />
              </a>
            ))}
          </div>
          <div className="bg-[#FFF3CD] border-t border-[#C49A3C]/30 px-5 py-3 flex items-center gap-2 text-[12.5px] text-[#664d03]">
            <Phone size={13} className="shrink-0" /> <span><strong>Emergency?</strong> Call 911 • <strong>FBI Duty Line:</strong> 1-855-CALL-FBI</span>
          </div>
        </div>
      </div>
      {/* stat strip */}
      <div className="relative border-t border-white/10 bg-black/30 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          {[
            ["35,000+", "Employees Worldwide"],
            ["56", "Field Divisions"],
            ["400+", "Resident Agencies"],
            ["190+", "Years of Law Enforcement"],
          ].map(([v, l]) => (
            <div key={l} className="py-3.5 px-4 text-center">
              <div className="text-xl md:text-2xl font-extrabold text-[#E8C766] tabular-nums">{v}</div>
              <div className="text-[11px] uppercase tracking-widest text-white/60 font-semibold">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- QUICK LINKS ---------- */
export function QuickLinks() {
  const links = [
    { icon: FileText, title: "The Vault", desc: "Declassified records & FOIA library", color: "bg-[#0B1F3A]" },
    { icon: Users, title: "Victim Services", desc: "Support for victims of crime & fraud", color: "bg-[#B22234]" },
    { icon: Briefcase, title: "Careers", desc: "Special Agents, analysts, cyber experts", color: "bg-[#1a5c3a]" },
    { icon: Landmark, title: "CJIS & Fingerprints", desc: "Background checks & biometrics", color: "bg-[#6b4d12]" },
  ];
  return (
    <section className="max-w-7xl mx-auto px-4 -mt-0 py-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {links.map((l, i) => (
          <motion.a key={l.title} href="#services" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="group bg-white border border-black/10 rounded-sm p-5 flex items-start gap-4 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <span className={`w-11 h-11 rounded-sm ${l.color} text-white flex items-center justify-center shrink-0`}><l.icon size={20} /></span>
            <span><span className="block font-extrabold text-[15px] text-[#0B1F3A] group-hover:text-[#1a4a8a]">{l.title}</span><span className="block text-[13px] text-gray-500 mt-0.5">{l.desc}</span></span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}

/* ---------- NEWS ---------- */
export function Newsroom() {
  const [cat, setCat] = useState("All");
  const cats = ["All", ...Array.from(new Set(NEWS.map(n => n.category)))];
  const filtered = cat === "All" ? NEWS : NEWS.filter(n => n.category === cat);
  const [active, setActive] = useState<string | null>(null);
  const featured = NEWS[0];
  return (
    <section id="news" className="scroll-mt-28 max-w-7xl mx-auto px-4 py-14 md:py-18">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#B22234] font-extrabold uppercase tracking-[0.2em] text-[12px]"><span className="w-8 h-[3px] bg-[#B22234] inline-block" /> Newsroom</div>
          <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-[#0B1F3A] tracking-tight font-serif">Latest News & Press Releases</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {cats.slice(0, 5).map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap border ${cat === c ? "bg-[#0B1F3A] text-white border-[#0B1F3A]" : "bg-white text-gray-600 border-black/15 hover:border-[#0B1F3A]"}`}>{c}</button>
          ))}
        </div>
      </div>

      {/* featured */}
      <div className="mt-6 grid lg:grid-cols-2 gap-5 bg-[#0B1F3A] rounded-sm overflow-hidden text-white shadow-xl">
        <div className="relative min-h-[260px] lg:min-h-[340px]">
          <img src={featured.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute top-4 left-4 bg-[#B22234] text-white text-[11px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-sm">Featured • {featured.category}</div>
        </div>
        <div className="p-6 md:p-10 flex flex-col justify-center">
          <div className="flex items-center gap-3 text-[12.5px] text-white/60"><span className="flex items-center gap-1"><Calendar size={13} /> {featured.date}</span><span className="flex items-center gap-1"><MapPin size={13} /> {featured.office}</span><span className="flex items-center gap-1"><Clock size={13} /> {featured.readTime}</span></div>
          <h3 className="mt-3 text-2xl md:text-[32px] font-extrabold leading-tight font-serif">{featured.title}</h3>
          <p className="mt-3 text-white/70 text-[14.5px] leading-relaxed">{featured.excerpt}</p>
          <div className="mt-5 flex gap-3">
            <button onClick={() => setActive(featured.id)} className="inline-flex items-center gap-2 bg-[#C49A3C] hover:bg-[#E8C766] text-black font-extrabold uppercase text-[12.5px] px-5 py-2.5 rounded-sm">Read Full Story <ArrowRight size={14} /></button>
            <span className="inline-flex items-center gap-1.5 text-white/50 text-[12.5px]"><Eye size={14} /> 48.2K views</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.slice(1, 7).map((n, i) => (
          <motion.article key={n.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.08 }} className="bg-white border border-black/10 rounded-sm overflow-hidden shadow-sm hover:shadow-xl transition-shadow group cursor-pointer" onClick={() => setActive(n.id)}>
            <div className="relative h-44 overflow-hidden">
              <img src={n.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              <span className="absolute bottom-3 left-3 bg-[#0B1F3A]/95 text-[#E8C766] text-[10.5px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-sm">{n.category}</span>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 text-[12px] text-gray-400"><Calendar size={12} /> {n.date} • {n.office}</div>
              <h3 className="mt-2 font-bold text-[15.5px] leading-snug text-[#0B1F3A] group-hover:text-[#1a4a8a] line-clamp-2">{n.title}</h3>
              <p className="mt-2 text-[13.5px] text-gray-500 leading-relaxed line-clamp-2">{n.excerpt}</p>
              <div className="mt-3 flex items-center justify-between text-[12.5px]">
                <span className="text-gray-400">{n.readTime}</span>
                <span className="font-bold text-[#B22234] flex items-center gap-1 group-hover:gap-2 transition-all">Read <ArrowRight size={13} /></span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* reader modal */}
      {active && (() => {
        const n = NEWS.find(x => x.id === active)!;
        return (
          <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setActive(null)}>
            <div className="max-w-2xl mx-auto bg-white rounded-sm shadow-2xl overflow-hidden mt-8" onClick={e => e.stopPropagation()}>
              <div className="relative h-56"><img src={n.image} className="w-full h-full object-cover" alt="" /><button onClick={() => setActive(null)} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black">✕</button></div>
              <div className="p-6 md:p-8">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#B22234]">{n.category} • {n.office} • {n.date}</div>
                <h3 className="mt-2 text-2xl font-extrabold text-[#0B1F3A] font-serif leading-tight">{n.title}</h3>
                <p className="mt-3 text-gray-600 leading-relaxed text-[14.5px]">{n.excerpt} The FBI works in partnership with federal, state, local, and international law enforcement agencies to protect communities and investigate major criminal enterprises.</p>
                <div className="mt-4 bg-gray-50 border border-black/10 rounded-sm p-4 text-[13px] text-gray-600">
                  <strong className="text-[#0B1F3A]">Media Inquiries:</strong> National Press Office, (202) 324-3000 • Washington, D.C.
                </div>
                <button onClick={() => setActive(null)} className="mt-5 w-full bg-[#0B1F3A] text-white font-bold uppercase text-[13px] py-3 rounded-sm">Close Article</button>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
}

/* ---------- STATS ---------- */
export function StatsDashboard() {
  const max = Math.max(...CRIME_BARS.map(b => Math.max(b.violent, b.property)));
  return (
    <section id="stats" className="scroll-mt-28 bg-[#0B1F3A] text-white py-14 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, #C49A3C 0, transparent 40%), radial-gradient(circle at 80% 70%, #B22234 0, transparent 40%)" }} />
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#E8C766] font-extrabold uppercase tracking-[0.2em] text-[12px]"><span className="w-8 h-[3px] bg-[#E8C766] inline-block" /> Crime Data Explorer</div>
            <h2 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight font-serif">Understanding Crime in America</h2>
            <p className="mt-2 text-white/60 text-[14.5px] max-w-2xl">Official statistical data collected from more than 18,000 law enforcement agencies nationwide through the Uniform Crime Reporting (UCR) Program.</p>
          </div>
          <a href="#services" className="inline-flex items-center gap-2 border border-[#C49A3C]/50 text-[#E8C766] hover:bg-[#C49A3C] hover:text-black font-bold uppercase text-[12.5px] px-5 py-2.5 rounded-sm transition-colors shrink-0">Open Full Explorer <ArrowRight size={14} /></a>
        </div>

        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CRIME_STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="bg-white/[0.06] border border-white/10 rounded-sm p-5 backdrop-blur hover:bg-white/[0.09] transition-colors">
              <div className="text-[11px] uppercase tracking-widest text-white/50 font-bold">{s.label}</div>
              <div className="mt-1 text-2xl md:text-3xl font-extrabold tabular-nums">{s.value}</div>
              <div className={`mt-1.5 inline-flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 rounded-full ${s.up ? "bg-green-500/15 text-green-300" : "bg-red-500/15 text-red-300"}`}>
                {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {s.change} YoY
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 grid lg:grid-cols-[1.4fr_1fr] gap-5">
          <div className="bg-white text-gray-900 rounded-sm p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-[#0B1F3A] text-[15px] uppercase tracking-wide">Reported Offenses per 100K (Annual Trend)</h3>
              <div className="flex gap-3 text-[12px] font-semibold"><span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#0B1F3A] inline-block" /> Violent</span><span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#C49A3C] inline-block" /> Property</span></div>
            </div>
            <div className="mt-6 flex items-end gap-3 md:gap-5 h-52">
              {CRIME_BARS.map((b, i) => (
                <div key={b.year} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="flex gap-1 items-end h-full w-full justify-center">
                    <motion.div initial={{ height: 0 }} whileInView={{ height: `${(b.violent / max) * 100}%` }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.6 }} className="w-full max-w-[34px] bg-[#0B1F3A] rounded-t-sm group-hover:bg-[#1a4a8a] relative" title={`Violent ${b.violent}`} />
                    <motion.div initial={{ height: 0 }} whileInView={{ height: `${(b.property / max) * 100}%` }} viewport={{ once: true }} transition={{ delay: i * 0.06 + 0.05, duration: 0.6 }} className="w-full max-w-[34px] bg-[#C49A3C] rounded-t-sm group-hover:bg-[#E8C766]" title={`Property ${b.property}`} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-500">{b.year}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[12px] text-gray-400 border-t border-black/10 pt-3">Source: FBI Crime Data Explorer (CDE) & National Incident-Based Reporting System (NIBRS).</p>
          </div>
          <div className="space-y-4">
            <div className="relative rounded-sm overflow-hidden shadow-xl min-h-[220px] group">
              <img src={FINGERPRINT_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 p-5">
                <div className="text-[#E8C766] text-[11px] font-extrabold uppercase tracking-widest">Inside the Lab</div>
                <div className="text-white font-extrabold text-[18px] leading-snug mt-1">94 Years of Forensic Science at Quantico</div>
                <span className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-bold text-[#E8C766]">Take the virtual tour <ArrowRight size={13} /></span>
              </div>
            </div>
            <div className="relative rounded-sm overflow-hidden shadow-xl min-h-[220px] group">
              <img src={FORENSIC_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 p-5">
                <div className="text-[#E8C766] text-[11px] font-extrabold uppercase tracking-widest">IC3 Recovery</div>
                <div className="text-white font-extrabold text-[18px] leading-snug mt-1">$412M Returned to Fraud Victims</div>
                <span className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-bold text-[#E8C766]">File a complaint at IC3 <ArrowRight size={13} /></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- SERVICES ---------- */
export function Services() {
  const services = [
    { icon: Fingerprint, title: "Identity History Checks", desc: "Request your FBI background check for employment, visas, or licensing. Results in 3–5 days via eDO.", tag: "Most Used" },
    { icon: FileText, title: "FOIA & The Vault", desc: "Search 6,700+ declassified documents — from historic cases to public records.", tag: "Records" },
    { icon: Users, title: "Victim Services", desc: "Advocates, resources, and notifications for victims and families in federal cases.", tag: "Support" },
    { icon: ShieldCheck, title: "Fingerprinting", desc: "Find approved channelers and live-scan locations for prints and clearances.", tag: "Biometrics" },
    { icon: Building2, title: "Name Checks for Business", desc: "Financial institutions: verify names against federal watchlists.", tag: "Business" },
    { icon: Award, title: "Community Outreach", desc: "Citizens Academy, Junior Agents, and Adopt-A-School programs near you.", tag: "Outreach" },
  ];
  return (
    <section id="services" className="scroll-mt-28 max-w-7xl mx-auto px-4 py-14 md:py-20">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 text-[#B22234] font-extrabold uppercase tracking-[0.2em] text-[12px]"><span className="w-8 h-[3px] bg-[#B22234] inline-block" /> Services <span className="w-8 h-[3px] bg-[#B22234] inline-block" /></div>
        <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-[#0B1F3A] font-serif tracking-tight">Services for the Public</h2>
        <p className="mt-2 text-gray-500 text-[14.5px]">Background checks, records requests, victim help, and community programs available through FBI field divisions and online portals.</p>
      </div>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.08 }} className="group bg-white border border-black/10 rounded-sm p-6 shadow-sm hover:shadow-xl hover:border-[#0B1F3A]/30 transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0B1F3A] to-[#C49A3C] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            <div className="flex items-start justify-between">
              <span className="w-12 h-12 rounded-sm bg-[#0B1F3A] text-[#E8C766] flex items-center justify-center group-hover:bg-[#B22234] group-hover:text-white transition-colors"><s.icon size={22} /></span>
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider bg-[#F0EDE2] text-[#0B1F3A] px-2.5 py-1 rounded-full border border-black/10">{s.tag}</span>
            </div>
            <h3 className="mt-4 font-extrabold text-[17px] text-[#0B1F3A]">{s.title}</h3>
            <p className="mt-1.5 text-[13.5px] text-gray-500 leading-relaxed">{s.desc}</p>
            <button className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-extrabold uppercase tracking-wide text-[#B22234] group-hover:gap-2.5 transition-all">Start Request <ArrowRight size={14} /></button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------- FIELD OFFICES ---------- */
export function FieldOffices({ globalQuery }: { globalQuery: string }) {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("All");
  const [sel, setSel] = useState(FIELD_OFFICES[9]);
  const regions = ["All", ...Array.from(new Set(FIELD_OFFICES.map(o => o.region)))];
  const query = (globalQuery || q).toLowerCase();
  const list = useMemo(() => FIELD_OFFICES.filter(o => {
    const mR = region === "All" || o.region === region;
    const mQ = !query || o.city.toLowerCase().includes(query) || o.state.toLowerCase().includes(query) || o.stateCode.toLowerCase().includes(query);
    return mR && mQ;
  }), [region, query]);

  return (
    <section id="field-offices" className="scroll-mt-28 bg-[#F5F3EC] border-y border-black/10 py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#B22234] font-extrabold uppercase tracking-[0.2em] text-[12px]"><span className="w-8 h-[3px] bg-[#B22234] inline-block" /> Nationwide Presence</div>
            <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-[#0B1F3A] font-serif tracking-tight">Find Your Field Office</h2>
            <p className="mt-2 text-gray-600 text-[14.5px] max-w-2xl">Direct contact and coverage for all 56 field divisions and 400+ resident agencies nationwide.</p>
          </div>
        </div>
        <div className="mt-6 grid lg:grid-cols-[1fr_380px] gap-5">
          <div className="bg-white rounded-sm border border-black/10 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-black/10 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search city or state... e.g. Texas" className="w-full border border-black/15 rounded-sm pl-9 pr-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-[#0B1F3A]" />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {regions.map(r => (
                  <button key={r} onClick={() => setRegion(r)} className={`px-3 py-2 rounded-sm text-[12px] font-bold whitespace-nowrap border ${region === r ? "bg-[#0B1F3A] text-white border-[#0B1F3A]" : "bg-white text-gray-600 border-black/15"}`}>{r}</button>
                ))}
              </div>
            </div>
            <div className="max-h-[420px] overflow-y-auto divide-y divide-black/5">
              {list.map(o => (
                <button key={o.city} onClick={() => setSel(o)} className={`w-full text-left px-4 py-3.5 flex items-center gap-4 hover:bg-[#F7F3E6] transition-colors ${sel.city === o.city ? "bg-[#F7F3E6] border-l-4 border-l-[#C49A3C]" : "border-l-4 border-l-transparent"}`}>
                  <span className="w-10 h-10 rounded-sm bg-[#0B1F3A] text-[#E8C766] flex items-center justify-center font-extrabold text-[13px] shrink-0">{o.stateCode}</span>
                  <span className="flex-1 min-w-0"><span className="block font-bold text-[14.5px] text-[#0B1F3A]">{o.city} <span className="font-normal text-gray-500">— {o.state}</span></span><span className="block text-[12.5px] text-gray-500 truncate">{o.covers}</span></span>
                  <span className="text-[12px] font-semibold text-gray-500 hidden sm:block">{o.phone}</span>
                  <ChevronRight size={16} className="text-gray-300 shrink-0" />
                </button>
              ))}
              {list.length === 0 && <div className="p-10 text-center text-gray-400 text-[14px]">No offices match your search.</div>}
            </div>
            <div className="px-4 py-2.5 bg-gray-50 border-t border-black/10 text-[12px] text-gray-500">Showing {list.length} of {FIELD_OFFICES.length} field divisions • 24/7 duty coverage</div>
          </div>
          {/* detail */}
          <div className="bg-[#0B1F3A] text-white rounded-sm overflow-hidden shadow-xl flex flex-col">
            <div className="p-6 border-b border-white/10">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#E8C766]">Selected Office</div>
              <h3 className="mt-1 text-2xl font-extrabold font-serif">{sel.city} Field Office</h3>
              <div className="mt-1 text-white/60 text-[13px]">{sel.state} • {sel.region} Region</div>
            </div>
            <div className="p-6 space-y-4 flex-1">
              <div className="flex gap-3"><MapPin size={17} className="text-[#E8C766] shrink-0 mt-0.5" /><div className="text-[14px] leading-relaxed">{sel.address}</div></div>
              <div className="flex gap-3"><Phone size={17} className="text-[#E8C766] shrink-0 mt-0.5" /><div><div className="text-[16px] font-extrabold tabular-nums">{sel.phone}</div><div className="text-[12px] text-white/50">24/7 Field Office Contact Line</div></div></div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white/5 border border-white/10 rounded-sm p-3 text-center"><div className="text-xl font-extrabold text-[#E8C766]">{sel.residentAgencies}</div><div className="text-[11px] uppercase tracking-wider text-white/50 font-bold">Resident Agencies</div></div>
                <div className="bg-white/5 border border-white/10 rounded-sm p-3 text-center"><div className="text-xl font-extrabold text-[#E8C766]">24/7</div><div className="text-[11px] uppercase tracking-wider text-white/50 font-bold">Duty Agent</div></div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-sm p-3 text-[13px] text-white/70"><strong className="text-white">Coverage:</strong> {sel.covers}</div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2 bg-black/20">
              <a href="#tips" className="text-center bg-[#B22234] hover:bg-[#8f1b29] font-bold uppercase text-[12px] py-2.5 rounded-sm">Report Crime or Scam</a>
              <button className="bg-white/10 hover:bg-white/20 font-bold uppercase text-[12px] py-2.5 rounded-sm">Directions</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- SCAMS ---------- */
export function Scams() {
  const icons: Record<string, typeof Shield> = { bitcoin: Bitcoin, shield: Shield, lock: Lock, alert: AlertIcon };
  return (
    <section className="max-w-7xl mx-auto px-4 py-14 md:py-18">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#B22234] font-extrabold uppercase tracking-[0.2em] text-[12px]"><span className="w-8 h-[3px] bg-[#B22234] inline-block" /> Scams & Safety</div>
          <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-[#0B1F3A] font-serif tracking-tight">Protect Yourself from Fraud</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <a href={IC3.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#0B1F3A] text-white px-4 py-2.5 rounded-sm text-[12px] font-extrabold uppercase tracking-wide hover:bg-[#12325B] transition-colors">
            <Globe size={14} /> File with IC3
          </a>
          <a href={`tel:${AGENT_LINE.tel}`} className="inline-flex items-center gap-2 bg-[#B22234] text-white px-4 py-2.5 rounded-sm text-[12px] font-extrabold uppercase tracking-wide hover:bg-[#8f1b29] transition-colors">
            <Phone size={14} /> {AGENT_LINE.display}
          </a>
        </div>
      </div>
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SCAMS.map((s, i) => {
          const Icon = icons[s.icon] || Shield;
          return (
            <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="bg-white border-t-4 border-[#B22234] border-x border-b border-black/10 rounded-b-sm p-5 shadow-sm hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-full bg-[#B22234]/10 text-[#B22234] flex items-center justify-center"><Icon size={19} /></span>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${s.level === "Critical" ? "bg-[#B22234] text-white" : "bg-amber-100 text-amber-800"}`}>{s.level}</span>
              </div>
              <h3 className="mt-3 font-extrabold text-[15px] text-[#0B1F3A] leading-snug">{s.title}</h3>
              <p className="mt-2 text-[13px] text-gray-500 leading-relaxed">{s.desc}</p>
              <a href="#ic3" className="mt-3 inline-block text-[12.5px] font-bold text-[#0B1F3A] underline underline-offset-2 hover:text-[#B22234]">Report this scam →</a>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- SCAM CATEGORIES DATA ---------- */
export const SCAM_OPTIONS = [
  { id: "crypto", label: "Cryptocurrency & Investment Fraud (Pig Butchering)", desc: "Fake trading platforms, guaranteed crypto returns, romance investment schemes" },
  { id: "romance", label: "Romance & Confidence Scam", desc: "Perpetrators posing as suitors online, requesting emergency funds or crypto" },
  { id: "tech_support", label: "Tech Support / Remote Access Scam", desc: "Fake security virus pop-ups, remote takeover, demands for cash/gift cards" },
  { id: "elder", label: "Elder Financial Fraud & Caregiver Exploitation", desc: "Grandparent scam, Medicare deception, targeting adults 60 and over" },
  { id: "impersonation", label: "Government / Law Enforcement Impersonation", desc: "Scammers claiming to be FBI, IRS, SSA, Customs, or Police threatening arrest" },
  { id: "bec", label: "Business Email Compromise (BEC) & Wire Divert", desc: "Spoofed vendor emails, fake executive requests to alter bank routing info" },
  { id: "ransomware", label: "Ransomware, Cyber Extortion & Sextortion", desc: "Encrypted data, threats to release compromising private photos or videos" },
  { id: "marketplace", label: "Online Marketplace & Shopping Fraud", desc: "Non-delivery of goods, counterfeit items, fraudulent buyer payment receipts" },
  { id: "real_estate", label: "Real Estate & Rental Scam", desc: "Fake rental listings, wire diversion during property closing escrow" },
  { id: "employment", label: "Employment & Work-From-Home Scam", desc: "Fake check mystery shopper, advance-fee job equipment purchase scams" },
  { id: "lottery", label: "Lottery, Sweepstakes & Inheritance Scam", desc: "Notification of unearned winnings requiring advance processing fees" },
  { id: "identity", label: "Identity Theft & Unauthorized Account Takeover", desc: "Fraudulent loans, stolen Social Security number, SIM swapping" },
];

export const OTHER_VIOLATIONS = [
  "Terrorism & National Security Threat",
  "Violent Crime & Armed Bank Robbery",
  "Missing Persons & Kidnapping",
  "Human Trafficking & Child Exploitation",
  "Civil Rights & Hate Crime",
  "Public Corruption & Bribery",
  "Economic Espionage & Trade Secrets",
  "Other Federal Violation",
];

/* ---------- TIP FORM (CASE & SCAM REPORTING INTAKE) ---------- */
export function TipForm() {
  const [step, setStep] = useState(1);
  const [reportType, setReportType] = useState<"scam" | "other">("scam");
  const [scamSubtype, setScamSubtype] = useState("crypto");
  const [otherViolation, setOtherViolation] = useState("Terrorism & National Security Threat");
  
  // Specific scam details
  const [lossAmount, setLossAmount] = useState("$25,000 - $100,000");
  const [customLoss, setCustomLoss] = useState("");
  const [contactMethod, setContactMethod] = useState("Social Media (WhatsApp / Telegram / Instagram)");
  const [paymentMethod, setPaymentMethod] = useState("Cryptocurrency (Bitcoin / USDT / Ethereum)");
  const [scammerIdentifiers, setScammerIdentifiers] = useState({
    nameOrAlias: "",
    phoneOrHandle: "",
    email: "",
    websiteUrl: "",
    walletOrBank: "",
  });

  const [form, setForm] = useState({
    office: "Washington",
    desc: "",
    incidentDate: new Date().toISOString().split("T")[0],
    name: "",
    contact: "",
    anon: false,
    hasEvidence: true,
  });

  const [done, setDone] = useState(false);
  const [ref, setRef] = useState("");
  const [filed, setFiled] = useState<FiledReport | null>(null);

  const submit = () => {
    const prefix = reportType === "scam" ? "IC3-2026" : "FBI-NOC-2026";
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const reference = `${prefix}-${randomHex}`;
    setRef(reference);
    setFiled({
      reference,
      category: reportType === "scam" ? (selectedScamObj?.label ?? "Internet Scam / Financial Fraud") : otherViolation,
      narrative: form.desc,
      fieldOffice: form.office,
      lossAmount: reportType === "scam" ? (lossAmount === "Custom Amount" ? customLoss : lossAmount) : "",
      suspectDetails: reportType === "scam"
        ? [
            scammerIdentifiers.nameOrAlias && `Alias/handle: ${scammerIdentifiers.nameOrAlias}`,
            scammerIdentifiers.phoneOrHandle && `Phone: ${scammerIdentifiers.phoneOrHandle}`,
            scammerIdentifiers.email && `Email: ${scammerIdentifiers.email}`,
            scammerIdentifiers.websiteUrl && `Website: ${scammerIdentifiers.websiteUrl}`,
            scammerIdentifiers.walletOrBank && `Wallet/account: ${scammerIdentifiers.walletOrBank}`,
            `Contact method: ${contactMethod}`,
            `Payment method: ${paymentMethod}`,
            `Incident date: ${form.incidentDate}`,
          ].filter(Boolean).join("\n")
        : `Incident date: ${form.incidentDate}`,
    });
    setDone(true);
    window.scrollTo({ top: document.getElementById("tips")!.offsetTop - 80, behavior: "smooth" });
  };

  const selectedScamObj = SCAM_OPTIONS.find(s => s.id === scamSubtype);

  return (
    <section id="tips" className="scroll-mt-28 bg-gradient-to-b from-[#7a1622] to-[#B22234] py-14 md:py-20 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.5) 20px, rgba(255,255,255,0.5) 21px)" }} />
      <div className="relative max-w-5xl mx-auto px-4">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-black/30 border border-white/20 rounded-full px-4 py-1.5 text-[12px] font-extrabold uppercase tracking-widest">
            <Siren size={14} /> National Threat Operations Center • IC3 Portal
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold font-serif tracking-tight">Submit a Tip & File a Scam Report</h2>
          <p className="mt-2 text-white/80 text-[14.5px] max-w-2xl mx-auto">
            Report online scams, cyber fraud, extortion, or suspicious criminal activity. Tips are triaged 24/7. You may submit anonymously or provide contact details for follow-up.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <a href={IC3.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white/10 border border-white/25 backdrop-blur px-4 py-2.5 rounded-sm text-[12px] font-extrabold uppercase tracking-wide text-white hover:bg-white hover:text-[#0B1F3A] transition-colors">
              <Globe size={14} /> {IC3.host}
            </a>
            <a href={`tel:${AGENT_LINE.tel}`} className="inline-flex items-center gap-2 bg-white text-[#B22234] px-4 py-2.5 rounded-sm text-[12px] font-extrabold uppercase tracking-wide hover:bg-[#E8C766] hover:text-black transition-colors">
              <Phone size={14} /> Call Agent {AGENT_LINE.display}
            </a>
            <a href={`sms:${AGENT_LINE.sms}`} className="inline-flex items-center gap-2 bg-[#C49A3C] text-black px-4 py-2.5 rounded-sm text-[12px] font-extrabold uppercase tracking-wide hover:bg-[#E8C766] transition-colors">
              <MessageSquare size={14} /> Text the Line
            </a>
          </div>
        </div>

        <div className="mt-8 bg-white text-gray-900 rounded-sm shadow-2xl overflow-hidden">
          {!done ? (
            <>
              {/* Stepper bar */}
              <div className="flex border-b border-black/10 bg-gray-50 overflow-x-auto">
                {[
                  { n: 1, label: "Violation & Scam Selection" },
                  { n: 2, label: "Scam Details & Evidence" },
                  { n: 3, label: "Narrative & Contact" },
                  { n: 4, label: "Review & File Case" },
                ].map((s) => (
                  <button
                    key={s.n}
                    type="button"
                    onClick={() => { if (step > s.n) setStep(s.n); }}
                    className={`flex-1 min-w-[150px] px-3 py-3.5 text-center text-[12px] font-extrabold uppercase tracking-wider border-b-[3px] transition-colors ${
                      step === s.n
                        ? "border-[#B22234] text-[#B22234] bg-white font-black"
                        : step > s.n
                        ? "border-green-600 text-green-700 bg-green-50/50 cursor-pointer"
                        : "border-transparent text-gray-400 cursor-default"
                    }`}
                  >
                    {s.n}. {s.label}
                  </button>
                ))}
              </div>

              <div className="p-6 md:p-8">
                {/* STEP 1: Select Type & Scam Categories */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-[13px] font-bold text-[#0B1F3A] uppercase tracking-wide block">
                        Select Incident Classification
                      </label>
                      <div className="mt-2 grid sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setReportType("scam")}
                          className={`p-4 rounded-sm border-2 text-left transition-all ${
                            reportType === "scam"
                              ? "border-[#B22234] bg-[#B22234]/5 ring-1 ring-[#B22234]"
                              : "border-black/10 hover:border-black/30 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-[#0B1F3A] text-[15px] flex items-center gap-2">
                              <DollarSign size={18} className="text-[#B22234]" /> Internet Scam / Financial Fraud
                            </span>
                            {reportType === "scam" && <CheckCircle2 size={18} className="text-[#B22234]" />}
                          </div>
                          <p className="mt-1 text-[12.5px] text-gray-500">
                            Cryptocurrency scams, romance fraud, elder abuse, phishing, BEC, impersonation, or marketplace fraud.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setReportType("other")}
                          className={`p-4 rounded-sm border-2 text-left transition-all ${
                            reportType === "other"
                              ? "border-[#0B1F3A] bg-[#0B1F3A]/5 ring-1 ring-[#0B1F3A]"
                              : "border-black/10 hover:border-black/30 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-[#0B1F3A] text-[15px] flex items-center gap-2">
                              <Shield size={18} className="text-[#0B1F3A]" /> Federal Crimes / Threat Tip
                            </span>
                            {reportType === "other" && <CheckCircle2 size={18} className="text-[#0B1F3A]" />}
                          </div>
                          <p className="mt-1 text-[12.5px] text-gray-500">
                            Terrorism threats, kidnapping, human trafficking, violent crimes, public corruption, or civil rights.
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* Specific Scam Options */}
                    {reportType === "scam" ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[13px] font-bold text-[#0B1F3A] uppercase tracking-wide">
                            Specific Scam Type to Report *
                          </label>
                          <span className="text-[11px] font-semibold text-[#B22234] bg-[#B22234]/10 px-2 py-0.5 rounded">
                            {SCAM_OPTIONS.length} Scam Categories
                          </span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1 border border-black/10 rounded-sm p-2 bg-gray-50/50">
                          {SCAM_OPTIONS.map((scam) => (
                            <button
                              key={scam.id}
                              type="button"
                              onClick={() => setScamSubtype(scam.id)}
                              className={`p-3 rounded-sm border text-left transition-all ${
                                scamSubtype === scam.id
                                  ? "bg-white border-[#B22234] shadow-md ring-2 ring-[#B22234]/30"
                                  : "bg-white border-black/10 hover:border-black/30"
                              }`}
                            >
                              <div className="font-bold text-[13.5px] text-[#0B1F3A] leading-snug">
                                {scam.label}
                              </div>
                              <div className="text-[12px] text-gray-500 mt-1 line-clamp-2">
                                {scam.desc}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="text-[13px] font-bold text-[#0B1F3A] uppercase tracking-wide block mb-2">
                          Select Crime Category *
                        </label>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {OTHER_VIOLATIONS.map((viol) => (
                            <button
                              key={viol}
                              type="button"
                              onClick={() => setOtherViolation(viol)}
                              className={`p-3 rounded-sm border text-left text-[13.5px] font-semibold transition-all ${
                                otherViolation === viol
                                  ? "bg-[#0B1F3A] text-white border-[#0B1F3A] shadow-md"
                                  : "bg-white border-black/10 hover:border-black/30 text-gray-800"
                              }`}
                            >
                              {viol}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-[13px] font-bold text-[#0B1F3A] uppercase tracking-wide block">
                        Assigned Field Division / Territory
                      </label>
                      <select
                        value={form.office}
                        onChange={(e) => setForm({ ...form, office: e.target.value })}
                        className="mt-1.5 w-full border border-black/15 rounded-sm px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                      >
                        {FIELD_OFFICES.map((o) => (
                          <option key={o.city} value={o.city}>
                            {o.city} Field Office ({o.state})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* STEP 2: Scam Loss, Contact Method & Suspect Identifiers */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div className="bg-[#F0EDE2] p-3.5 rounded-sm border border-black/10 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#B22234]">Selected Case Category</span>
                        <div className="font-extrabold text-[#0B1F3A] text-[15px]">
                          {reportType === "scam" ? selectedScamObj?.label : otherViolation}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-[12px] font-bold text-[#0B1F3A] underline"
                      >
                        Change
                      </button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[13px] font-bold text-[#0B1F3A] uppercase tracking-wide block">
                          Estimated Financial Loss ($ USD)
                        </label>
                        <select
                          value={lossAmount}
                          onChange={(e) => setLossAmount(e.target.value)}
                          className="mt-1.5 w-full border border-black/15 rounded-sm px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                        >
                          <option value="$0 (Attempted Only / No Monetary Loss)">$0 (Attempted Only / No Loss)</option>
                          <option value="Under $1,000">Under $1,000</option>
                          <option value="$1,000 - $5,000">$1,000 - $5,000</option>
                          <option value="$5,000 - $25,000">$5,000 - $25,000</option>
                          <option value="$25,000 - $100,000">$25,000 - $100,000</option>
                          <option value="$100,000 - $500,000">$100,000 - $500,000</option>
                          <option value="Over $500,000">Over $500,000</option>
                          <option value="Custom Amount">Specific Custom Amount...</option>
                        </select>
                        {lossAmount === "Custom Amount" && (
                          <input
                            type="text"
                            placeholder="e.g. $42,500.00"
                            value={customLoss}
                            onChange={(e) => setCustomLoss(e.target.value)}
                            className="mt-2 w-full border border-black/15 rounded-sm px-3 py-2 text-[14px]"
                          />
                        )}
                      </div>

                      <div>
                        <label className="text-[13px] font-bold text-[#0B1F3A] uppercase tracking-wide block">
                          Date of Initial Contact / Incident
                        </label>
                        <input
                          type="date"
                          value={form.incidentDate}
                          onChange={(e) => setForm({ ...form, incidentDate: e.target.value })}
                          className="mt-1.5 w-full border border-black/15 rounded-sm px-3 py-2 text-[14px] outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[13px] font-bold text-[#0B1F3A] uppercase tracking-wide block">
                          Primary Means of Initial Contact
                        </label>
                        <select
                          value={contactMethod}
                          onChange={(e) => setContactMethod(e.target.value)}
                          className="mt-1.5 w-full border border-black/15 rounded-sm px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                        >
                          <option value="Social Media (WhatsApp / Telegram / Instagram)">Social Media (WhatsApp / Telegram / Instagram)</option>
                          <option value="Dating Application (Tinder / Hinge / Bumble)">Dating Application (Tinder / Hinge / Bumble)</option>
                          <option value="Unsolicited Phone Call / Robocall">Unsolicited Phone Call / Robocall</option>
                          <option value="Text Message / SMS Phishing (Smishing)">Text Message / SMS Phishing (Smishing)</option>
                          <option value="Email / Spoofed Sender Address">Email / Spoofed Sender Address</option>
                          <option value="Web Search Ad / Pop-up Warning">Web Search Ad / Pop-up Warning</option>
                          <option value="Online Marketplace / Classifieds">Online Marketplace / Classifieds</option>
                          <option value="In-Person Contact">In-Person Contact</option>
                          <option value="Other / Unknown">Other / Unknown</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[13px] font-bold text-[#0B1F3A] uppercase tracking-wide block">
                          Method of Payment / Fund Transfer
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mt-1.5 w-full border border-black/15 rounded-sm px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                        >
                          <option value="Cryptocurrency (Bitcoin / USDT / Ethereum / Solana)">Cryptocurrency (Bitcoin / USDT / Ethereum / Solana)</option>
                          <option value="Bank Wire Transfer (Domestic / International)">Bank Wire Transfer (Domestic / International)</option>
                          <option value="P2P App (Zelle / CashApp / Venmo / PayPal)">P2P App (Zelle / CashApp / Venmo / PayPal)</option>
                          <option value="Gift Cards (Apple / Target / Google Play)">Gift Cards (Apple / Target / Google Play)</option>
                          <option value="Credit / Debit Card Transaction">Credit / Debit Card Transaction</option>
                          <option value="Physical Cash / Mail / Courier">Physical Cash / Mail / Courier</option>
                          <option value="Cashier's Check / Money Order">Cashier's Check / Money Order</option>
                          <option value="No Funds Transferred">No Funds Transferred</option>
                        </select>
                      </div>
                    </div>

                    {/* Suspect Identifiers */}
                    <div className="border-t border-black/10 pt-4">
                      <h4 className="text-[13px] font-extrabold uppercase tracking-wide text-[#0B1F3A] mb-3 flex items-center gap-1.5">
                        <AlertCircle size={15} className="text-[#B22234]" /> Suspect / Scammer Identifiers (Provide any available)
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3 text-[13px]">
                        <div>
                          <label className="font-semibold text-gray-700 block mb-1">Scammer Name / Alias / Handle</label>
                          <input
                            type="text"
                            placeholder="e.g. 'Alex Rivera' or @cryptotrade_pro"
                            value={scammerIdentifiers.nameOrAlias}
                            onChange={(e) => setScammerIdentifiers({ ...scammerIdentifiers, nameOrAlias: e.target.value })}
                            className="w-full border border-black/15 rounded-sm px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-gray-700 block mb-1">Scammer Phone Number / WhatsApp</label>
                          <input
                            type="text"
                            placeholder="e.g. +1 (555) 019-2831"
                            value={scammerIdentifiers.phoneOrHandle}
                            onChange={(e) => setScammerIdentifiers({ ...scammerIdentifiers, phoneOrHandle: e.target.value })}
                            className="w-full border border-black/15 rounded-sm px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-gray-700 block mb-1">Website URL / Domain / Mobile App</label>
                          <input
                            type="text"
                            placeholder="e.g. https://apex-crypto-market.com"
                            value={scammerIdentifiers.websiteUrl}
                            onChange={(e) => setScammerIdentifiers({ ...scammerIdentifiers, websiteUrl: e.target.value })}
                            className="w-full border border-black/15 rounded-sm px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-gray-700 block mb-1">Crypto Wallet Address / Bank Routing</label>
                          <input
                            type="text"
                            placeholder="e.g. 0x71C... or bc1q..."
                            value={scammerIdentifiers.walletOrBank}
                            onChange={(e) => setScammerIdentifiers({ ...scammerIdentifiers, walletOrBank: e.target.value })}
                            className="w-full border border-black/15 rounded-sm px-3 py-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Narrative & Contact info */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[13px] font-bold text-[#0B1F3A] uppercase tracking-wide block">
                        Detailed Incident Narrative *
                      </label>
                      <p className="text-[12px] text-gray-500 mb-1.5">
                        Explain chronologically how the incident occurred: initial communication, promises made, instructions given, transactions sent, and when you discovered the deception.
                      </p>
                      <textarea
                        value={form.desc}
                        onChange={(e) => setForm({ ...form, desc: e.target.value })}
                        rows={6}
                        placeholder="Provide details on the incident: timeline of events, communications received, transaction hash or wire reference numbers, and any other relevant facts..."
                        className="w-full border border-black/15 rounded-sm px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-[#0B1F3A] resize-y"
                      />
                      <div className="mt-1 flex justify-between text-[12px] text-gray-400">
                        <span>Minimum 20 characters required</span>
                        <span>{form.desc.length} / 4000 characters</span>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[13px] font-bold text-[#0B1F3A] uppercase tracking-wide block">
                          Your Full Name {!form.anon && "(Optional)"}
                        </label>
                        <input
                          disabled={form.anon}
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="First and Last Name"
                          className="mt-1.5 w-full border border-black/15 rounded-sm px-3 py-2 text-[14px] outline-none focus:ring-2 focus:ring-[#0B1F3A] disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="text-[13px] font-bold text-[#0B1F3A] uppercase tracking-wide block">
                          Contact Phone or Email {!form.anon && "(Optional)"}
                        </label>
                        <input
                          disabled={form.anon}
                          value={form.contact}
                          onChange={(e) => setForm({ ...form, contact: e.target.value })}
                          placeholder="email@example.com or phone"
                          className="mt-1.5 w-full border border-black/15 rounded-sm px-3 py-2 text-[14px] outline-none focus:ring-2 focus:ring-[#0B1F3A] disabled:bg-gray-100"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <label className="flex items-center gap-2.5 bg-gray-50 border border-black/10 rounded-sm px-4 py-3 cursor-pointer text-[13px] flex-1">
                        <input
                          type="checkbox"
                          checked={form.anon}
                          onChange={(e) => setForm({ ...form, anon: e.target.checked })}
                          className="w-4 h-4 accent-[#B22234]"
                        />
                        <span>
                          <strong>Submit Anonymously</strong>{" "}
                          <span className="text-gray-500">— do not include personal identifying information</span>
                        </span>
                      </label>

                      <label className="flex items-center gap-2.5 bg-gray-50 border border-black/10 rounded-sm px-4 py-3 cursor-pointer text-[13px] flex-1">
                        <input
                          type="checkbox"
                          checked={form.hasEvidence}
                          onChange={(e) => setForm({ ...form, hasEvidence: e.target.checked })}
                          className="w-4 h-4 accent-[#0B1F3A]"
                        />
                        <span>
                          <strong>I have digital evidence</strong>{" "}
                          <span className="text-gray-500">(chat logs, receipts, emails ready)</span>
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* STEP 4: Review Summary before submission */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="border border-black/10 rounded-sm p-5 bg-gray-50 text-[13.5px] space-y-3">
                      <div className="flex items-center justify-between border-b border-black/10 pb-2">
                        <span className="text-gray-500 font-semibold">Report Classification</span>
                        <strong className="text-[#0B1F3A] text-right">
                          {reportType === "scam" ? selectedScamObj?.label : otherViolation}
                        </strong>
                      </div>

                      {reportType === "scam" && (
                        <>
                          <div className="flex items-center justify-between border-b border-black/10 pb-2">
                            <span className="text-gray-500 font-semibold">Reported Loss Amount</span>
                            <span className="font-extrabold text-[#B22234]">
                              {lossAmount === "Custom Amount" ? customLoss || "$0.00" : lossAmount}
                            </span>
                          </div>

                          <div className="flex items-center justify-between border-b border-black/10 pb-2">
                            <span className="text-gray-500 font-semibold">Contact & Payment Method</span>
                            <span className="font-medium text-gray-800 text-right">
                              {contactMethod.split("(")[0]} • {paymentMethod.split("(")[0]}
                            </span>
                          </div>

                          {(scammerIdentifiers.nameOrAlias || scammerIdentifiers.websiteUrl || scammerIdentifiers.walletOrBank) && (
                            <div className="border-b border-black/10 pb-2">
                              <span className="text-gray-500 font-semibold block mb-1">Suspect Identifiers Provided</span>
                              <div className="text-[12.5px] bg-white p-2.5 rounded border border-black/10 space-y-1">
                                {scammerIdentifiers.nameOrAlias && <div><strong>Alias:</strong> {scammerIdentifiers.nameOrAlias}</div>}
                                {scammerIdentifiers.phoneOrHandle && <div><strong>Phone/Handle:</strong> {scammerIdentifiers.phoneOrHandle}</div>}
                                {scammerIdentifiers.websiteUrl && <div><strong>URL:</strong> {scammerIdentifiers.websiteUrl}</div>}
                                {scammerIdentifiers.walletOrBank && <div><strong>Wallet/Account:</strong> {scammerIdentifiers.walletOrBank}</div>}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      <div className="flex items-center justify-between border-b border-black/10 pb-2">
                        <span className="text-gray-500 font-semibold">Jurisdiction / Field Office</span>
                        <span className="font-bold text-[#0B1F3A]">{form.office} Field Office</span>
                      </div>

                      <div className="border-b border-black/10 pb-2">
                        <span className="text-gray-500 font-semibold block mb-1">Statement Summary</span>
                        <p className="bg-white p-3 rounded border border-black/10 text-gray-700 text-[13px] max-h-28 overflow-y-auto whitespace-pre-wrap">
                          {form.desc || "No narrative provided."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-gray-500 font-semibold">Complainant / Reporter</span>
                        <strong className="text-gray-900">
                          {form.anon ? "Anonymous Complainant" : form.name || "Contact on file"}
                        </strong>
                      </div>
                    </div>

                    <div className="bg-[#FFF8E1] border-l-4 border-[#C49A3C] p-4 text-[13px] text-gray-800 leading-relaxed">
                      <strong>Submission Notice:</strong> Submitting this report routes information to the FBI National Threat Operations Center (NTOC) and the Internet Crime Complaint Center (IC3) for intake, analysis, and law enforcement dissemination.
                      <span className="mt-2 block text-[12.5px] text-[#7a5c12]">
                        Scam or fraud case? Also file at{" "}
                        <a href={IC3.url} target="_blank" rel="noopener noreferrer" className="font-bold underline underline-offset-2 hover:text-[#B22234]">{IC3.host}</a>{" "}
                        to generate an IC3 reference number, or reach a Special Agent immediately at{" "}
                        <a href={`tel:${AGENT_LINE.tel}`} className="font-bold underline underline-offset-2 hover:text-[#B22234]">{AGENT_LINE.display}</a>{" "}
                        (voice or text).
                      </span>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-6 flex items-center justify-between pt-4 border-t border-black/10">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="px-6 py-2.5 rounded-sm border-2 border-black/15 font-bold uppercase text-[12.5px] hover:border-[#0B1F3A] transition-colors"
                    >
                      Back
                    </button>
                  ) : <div />}

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      disabled={step === 3 && form.desc.trim().length < 15}
                      className="inline-flex items-center gap-2 bg-[#0B1F3A] hover:bg-[#12325B] disabled:opacity-40 text-white font-bold uppercase text-[13px] px-8 py-3 rounded-sm transition-colors"
                    >
                      Next Step <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={submit}
                      disabled={form.desc.trim().length < 15}
                      className="inline-flex items-center gap-2 bg-[#B22234] hover:bg-[#8f1b29] disabled:opacity-40 text-white font-extrabold uppercase text-[13px] px-8 py-3.5 rounded-sm transition-colors shadow-lg"
                    >
                      <Send size={15} /> Transmit Official Case Report
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* SUCCESS CONFIRMATION RECEIPT */
            <div className="p-8 md:p-12 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
                <CheckCircle2 size={34} />
              </motion.div>
              <div className="text-[12px] font-extrabold uppercase tracking-widest text-[#B22234] mt-4">
                National Threat Operations Center • Intake Completed
              </div>
              <h3 className="mt-1 text-2xl md:text-3xl font-extrabold text-[#0B1F3A] font-serif">
                Case Report Successfully Transmitted
              </h3>
              <p className="mt-2 text-gray-600 text-[14px]">
                Your report has been logged and assigned the following official reference tracking number:
              </p>

              <div className="mt-4 inline-block bg-[#0B1F3A] text-[#E8C766] font-mono font-bold text-xl px-8 py-3 rounded-sm tracking-wider shadow-lg">
                {ref}
              </div>

              <div className="mt-6 max-w-xl mx-auto bg-gray-50 border border-black/10 rounded-sm p-4 text-left text-[13px] space-y-2 text-gray-700">
                <div className="flex justify-between font-medium">
                  <span>Category:</span>
                  <strong>{reportType === "scam" ? selectedScamObj?.label : otherViolation}</strong>
                </div>
                {reportType === "scam" && (
                  <div className="flex justify-between font-medium">
                    <span>Loss Reported:</span>
                    <strong>{lossAmount === "Custom Amount" ? customLoss || "$0" : lossAmount}</strong>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span>Routing Office:</span>
                  <strong>{form.office} Field Division</strong>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Status:</span>
                  <span className="text-green-700 font-bold">Under Review & Triage</span>
                </div>
              </div>

              {reportType === "scam" && (
                <div className="mt-6 max-w-xl mx-auto bg-[#0B1F3A] rounded-sm p-4 text-left text-white">
                  <div className="text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-[#E8C766]">
                    Next Step — Strengthen Your Case
                  </div>
                  <p className="mt-1.5 text-[12.5px] text-white/70 leading-relaxed">
                    Cross-file with the Internet Crime Complaint Center to obtain an IC3 reference number,
                    and alert a Special Agent directly if funds moved within the last 72 hours.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a href={IC3.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-[#C49A3C] hover:bg-[#E8C766] text-black font-extrabold uppercase text-[11px] px-3.5 py-2.5 rounded-sm transition-colors">
                      <Globe size={13} /> File with IC3
                    </a>
                    <a href={`tel:${AGENT_LINE.tel}`} className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 font-extrabold uppercase text-[11px] px-3.5 py-2.5 rounded-sm transition-colors">
                      <Phone size={13} /> Call Agent
                    </a>
                    <a href={`sms:${AGENT_LINE.sms}`} className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 font-extrabold uppercase text-[11px] px-3.5 py-2.5 rounded-sm transition-colors">
                      <MessageSquare size={13} /> Text {AGENT_LINE.display}
                    </a>
                  </div>
                </div>
              )}

              {filed && <PostReportCapture report={filed} />}

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 bg-white border border-black/20 text-[#0B1F3A] font-bold uppercase text-[12px] px-5 py-2.5 rounded-sm hover:bg-gray-100"
                >
                  <Printer size={14} /> Print Case Summary
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDone(false);
                    setStep(1);
                    setFiled(null);
                    setForm({
                      office: "Washington",
                      desc: "",
                      incidentDate: new Date().toISOString().split("T")[0],
                      name: "",
                      contact: "",
                      anon: false,
                      hasEvidence: true,
                    });
                  }}
                  className="inline-flex items-center gap-2 bg-[#0B1F3A] text-white font-bold uppercase text-[12px] px-6 py-2.5 rounded-sm hover:bg-[#12325B]"
                >
                  File Another Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- ABOUT / CAREERS ---------- */
export function AboutCareers() {
  return (
    <section id="about" className="scroll-mt-28 max-w-7xl mx-auto px-4 py-14 md:py-20">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-black/10 rounded-sm p-7 md:p-9 shadow-sm">
          <div className="flex items-center gap-2 text-[#0B1F3A] font-extrabold uppercase tracking-[0.2em] text-[12px]"><Star size={14} className="text-[#C49A3C]" /> Our Mission</div>
          <h2 className="mt-2 text-2xl md:text-3xl font-extrabold text-[#0B1F3A] font-serif">Protect the American People & Uphold the Constitution</h2>
          <p className="mt-3 text-[14.5px] text-gray-600 leading-relaxed">The FBI is the nation's premier law enforcement and domestic intelligence agency — guided by fidelity, bravery, and integrity. Our personnel operate across 56 field divisions and legal attaché posts worldwide to protect national security.</p>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            {[["Fidelity", "Service to country"], ["Bravery", "Courage in action"], ["Integrity", "Truth & justice"]].map(([t, d]) => (
              <div key={t} className="bg-[#F5F3EC] border border-black/10 rounded-sm p-3"><div className="font-extrabold text-[#0B1F3A] text-[14px]">{t}</div><div className="text-[11.5px] text-gray-500">{d}</div></div>
            ))}
          </div>
          <div className="mt-5 flex gap-3">
            <a href="#top" className="flex-1 text-center bg-[#0B1F3A] text-white font-bold uppercase text-[12.5px] py-3 rounded-sm hover:bg-[#12325B]">Our History</a>
            <a href="#top" className="flex-1 text-center border-2 border-[#0B1F3A] text-[#0B1F3A] font-bold uppercase text-[12.5px] py-2.5 rounded-sm hover:bg-[#0B1F3A] hover:text-white">Leadership</a>
          </div>
        </div>
        <div className="bg-[#0B1F3A] text-white rounded-sm p-7 md:p-9 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-[#C49A3C]/10" />
          <div className="flex items-center gap-2 text-[#E8C766] font-extrabold uppercase tracking-[0.2em] text-[12px]"><Briefcase size={14} /> Careers</div>
          <h2 className="mt-2 text-2xl md:text-3xl font-extrabold font-serif">Answer the Call. Become an FBI Special Agent.</h2>
          <p className="mt-3 text-white/70 text-[14.5px] leading-relaxed">Explore career opportunities across investigations, intelligence, cyber, STEM, and specialized operations.</p>
          <div className="mt-5 space-y-2.5">
            {[["Special Agent — Cyber Division", "Quantico, VA • Application Window Open"], ["Intelligence Analyst", "New York, NY • Field Intelligence Group"], ["Forensic Examiner — Digital Evidence", "Quantico, VA • Laboratory Division"]].map(([t, d]) => (
              <div key={t} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-sm px-4 py-3 hover:bg-white/10 transition-colors cursor-pointer">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
                <span className="flex-1"><span className="block font-bold text-[13.5px]">{t}</span><span className="block text-[12px] text-white/50">{d}</span></span>
                <ArrowRight size={15} className="text-[#E8C766]" />
              </div>
            ))}
          </div>
          <button className="mt-5 w-full bg-[#C49A3C] hover:bg-[#E8C766] text-black font-extrabold uppercase text-[13px] py-3.5 rounded-sm transition-colors">Explore FBIJOBS.gov</button>
        </div>
      </div>
    </section>
  );
}
