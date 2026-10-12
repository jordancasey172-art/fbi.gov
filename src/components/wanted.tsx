import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, DollarSign, AlertTriangle, Printer, Share2, Phone, ChevronRight, Search, BadgeAlert } from "lucide-react";
import { WANTED, type WantedPerson } from "../data";

const TABS = [
  { id: "all", label: "All Fugitives" },
  { id: "ten", label: "Ten Most Wanted" },
  { id: "terror", label: "Terrorism" },
  { id: "cyber", label: "Cyber" },
  { id: "white-collar", label: "White-Collar" },
  { id: "violent", label: "Violent Crime" },
];

export function WantedCard({ person, onSelect, index }: { person: WantedPerson; onSelect: () => void; index: number }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: (index % 4) * 0.07, duration: 0.4 }}
      onClick={onSelect}
      className="group text-left bg-white rounded-sm overflow-hidden shadow-md hover:shadow-2xl transition-all border border-black/10 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/4.6] overflow-hidden bg-gray-200">
        <img src={person.image} alt={person.name} className="w-full h-full object-cover object-top grayscale-[35%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" loading="lazy" />
        <div className="absolute top-0 left-0 right-0 bg-[#B22234] text-white text-[10.5px] font-extrabold tracking-widest uppercase px-3 py-1.5 text-center">
          {person.category === "ten" ? "★ Ten Most Wanted ★" : person.warning.split("—")[0].slice(0, 32)}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-8">
          <div className="inline-flex items-center gap-1 bg-[#C49A3C] text-black text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-sm mb-1.5">
            <DollarSign size={10} /> {person.reward}
          </div>
          <div className="text-white font-extrabold text-[15px] leading-tight">{person.name}</div>
        </div>
        {person.category === "ten" && (
          <div className="absolute top-9 right-2 w-9 h-9 rounded-full bg-[#0B1F3A] border-2 border-[#C49A3C] text-[#E8C766] flex items-center justify-center text-[13px] font-extrabold shadow-lg">
            {index + 1 < 10 ? `0${(index % 10) + 1}` : (index % 10) + 1}
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="text-[12.5px] font-semibold text-[#0B1F3A] leading-snug line-clamp-2 min-h-[36px]">{person.crime}</div>
        <div className="mt-2 flex items-center justify-between text-[12px] text-gray-500">
          <span className="flex items-center gap-1"><MapPin size={11} /> {person.fieldOffice}</span>
          <span className="flex items-center gap-1 font-bold text-[#B22234] group-hover:gap-2 transition-all">Poster <ChevronRight size={13} /></span>
        </div>
      </div>
    </motion.button>
  );
}

export function WantedModal({ person, onClose }: { person: WantedPerson | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {person && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm p-3 md:p-6 overflow-y-auto" onClick={onClose}>
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl mx-auto bg-white rounded-sm shadow-2xl overflow-hidden"
          >
            {/* poster header */}
            <div className="bg-[#0B1F3A] text-white px-5 md:px-8 py-4 flex items-center justify-between border-b-4 border-[#C49A3C]">
              <div>
                <div className="text-[10px] tracking-[0.25em] text-[#E8C766] font-bold uppercase">Federal Bureau of Investigation • Official Wanted Poster</div>
                <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mt-0.5">{person.name}</h2>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0"><X size={18} /></button>
            </div>
            <div className="bg-[#B22234] text-white text-center text-[12px] md:text-[13px] font-extrabold tracking-widest uppercase py-2 px-4 flex items-center justify-center gap-2">
              <AlertTriangle size={15} /> {person.warning}
            </div>
            <div className="grid md:grid-cols-[300px_1fr]">
              <div className="bg-[#F0EDE2] p-5 md:p-6 border-r border-black/10">
                <div className="border-4 border-white shadow-lg overflow-hidden bg-gray-300">
                  <img src={person.image} alt={person.name} className="w-full aspect-[3/3.6] object-cover object-top" />
                </div>
                <div className="mt-4 space-y-2 text-[13px]">
                  <div className="flex justify-between border-b border-black/10 pb-1.5"><span className="text-gray-500 font-medium">Reward</span><span className="font-extrabold text-[#B22234]">{person.reward}</span></div>
                  <div className="flex justify-between border-b border-black/10 pb-1.5"><span className="text-gray-500 font-medium">DOB</span><span className="font-semibold">{person.dob}</span></div>
                  <div className="flex justify-between border-b border-black/10 pb-1.5"><span className="text-gray-500 font-medium">POB</span><span className="font-semibold text-right">{person.pob}</span></div>
                  <div className="flex justify-between border-b border-black/10 pb-1.5"><span className="text-gray-500 font-medium">Height / Weight</span><span className="font-semibold">{person.height} / {person.weight}</span></div>
                  <div className="flex justify-between border-b border-black/10 pb-1.5"><span className="text-gray-500 font-medium">Hair / Eyes</span><span className="font-semibold">{person.hair} / {person.eyes}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Field Office</span><span className="font-semibold">{person.fieldOffice}</span></div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 bg-[#0B1F3A] text-white text-[12px] font-bold uppercase py-2.5 rounded-sm hover:bg-[#12325B]"><Printer size={13} /> Poster</button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-black/15 text-[12px] font-bold uppercase py-2.5 rounded-sm hover:bg-gray-50"><Share2 size={13} /> Share</button>
                </div>
              </div>
              <div className="p-5 md:p-8">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#B22234]">Charges</div>
                <p className="text-[17px] md:text-[19px] font-bold text-[#0B1F3A] leading-snug mt-1">{person.crime}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-[11px] font-bold uppercase bg-[#0B1F3A] text-white px-2.5 py-1 rounded-sm">{person.status}</span>
                  <span className="text-[11px] font-bold uppercase bg-[#F0EDE2] text-[#0B1F3A] px-2.5 py-1 rounded-sm border border-black/10">Poster: {person.posterDate}</span>
                  {person.alias.map((a) => (
                    <span key={a} className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-sm">aka "{a}"</span>
                  ))}
                </div>
                <div className="mt-5">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-gray-500">Case Summary & Details</div>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-gray-700">{person.description}</p>
                </div>
                <div className="mt-5 bg-[#FFF8E1] border-l-4 border-[#C49A3C] p-4 rounded-r-sm">
                  <div className="flex items-center gap-2 font-extrabold text-[13px] uppercase tracking-wide text-[#0B1F3A]"><BadgeAlert size={15} /> Should be considered dangerous</div>
                  <p className="mt-1.5 text-[13px] text-gray-700 leading-relaxed">If you have information concerning this person, please contact your local FBI office or the nearest American Embassy or Consulate. For immediate emergencies, call 911.</p>
                </div>
                <div className="mt-5 grid sm:grid-cols-2 gap-3">
                  <a href="#tips" onClick={onClose} className="flex items-center justify-center gap-2 bg-[#B22234] hover:bg-[#8f1b29] text-white font-bold uppercase text-[13px] py-3 rounded-sm transition-colors">
                    <Phone size={14} /> Submit a Tip
                  </a>
                  <a href="#field-offices" onClick={onClose} className="flex items-center justify-center gap-2 bg-[#0B1F3A] hover:bg-[#12325B] text-white font-bold uppercase text-[13px] py-3 rounded-sm transition-colors">
                    <MapPin size={14} /> Contact {person.fieldOffice}
                  </a>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[12px] text-gray-400"><Calendar size={12} /> Federal Bureau of Investigation • Office of Public Affairs</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function MostWantedSection({ globalQuery }: { globalQuery: string }) {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<WantedPerson | null>(null);
  const [visible, setVisible] = useState(8);

  const query = (globalQuery || q).toLowerCase();
  const filtered = useMemo(() => {
    return WANTED.filter((w) => {
      const matchTab = tab === "all" || w.category === tab;
      const matchQ = !query || w.name.toLowerCase().includes(query) || w.crime.toLowerCase().includes(query) || w.fieldOffice.toLowerCase().includes(query);
      return matchTab && matchQ;
    });
  }, [tab, query]);

  return (
    <section id="wanted" className="scroll-mt-28 bg-[#F5F3EC] py-14 md:py-20 border-y border-black/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#B22234] font-extrabold uppercase tracking-[0.2em] text-[12px]">
              <span className="w-8 h-[3px] bg-[#B22234] inline-block" /> Wanted by the FBI
            </div>
            <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-[#0B1F3A] tracking-tight font-serif">Most Wanted</h2>
            <p className="mt-2 text-gray-600 text-[14.5px] max-w-2xl">Help us locate fugitives and missing persons. Select a poster for details, physical description, and reward information.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by name, crime, city..." className="w-full bg-white border border-black/15 rounded-sm pl-9 pr-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-[#0B1F3A]" />
          </div>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id); setVisible(8); }} className={`px-4 py-2 rounded-full text-[12.5px] font-bold uppercase tracking-wide whitespace-nowrap border transition-all ${tab === t.id ? "bg-[#0B1F3A] text-[#E8C766] border-[#0B1F3A] shadow-md" : "bg-white text-gray-600 border-black/15 hover:border-[#0B1F3A] hover:text-[#0B1F3A]"}`}>
              {t.label}
              <span className={`ml-1.5 text-[11px] ${tab === t.id ? "text-white/60" : "text-gray-400"}`}>
                {t.id === "all" ? WANTED.length : WANTED.filter(w => w.category === t.id).length}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10 bg-white border border-dashed border-black/20 rounded-sm p-12 text-center text-gray-500">
            No fugitives match "{query}". Try a different search.
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {filtered.slice(0, visible).map((p, i) => (
                <WantedCard key={p.id} person={p} index={i} onSelect={() => setSelected(p)} />
              ))}
            </div>
            {visible < filtered.length && (
              <div className="mt-8 text-center">
                <button onClick={() => setVisible(v => v + 4)} className="inline-flex items-center gap-2 bg-white border-2 border-[#0B1F3A] text-[#0B1F3A] font-bold uppercase text-[13px] tracking-wide px-8 py-3 rounded-sm hover:bg-[#0B1F3A] hover:text-[#E8C766] transition-colors">
                  Load More Posters ({filtered.length - visible} remaining)
                </button>
              </div>
            )}
          </>
        )}

        <div className="mt-8 bg-[#0B1F3A] rounded-sm p-5 md:p-6 flex flex-col md:flex-row items-center gap-4 text-white">
          <div className="w-12 h-12 rounded-full bg-[#B22234] flex items-center justify-center shrink-0"><Phone size={20} /></div>
          <div className="text-center md:text-left flex-1">
            <div className="font-extrabold uppercase tracking-wide text-[15px]">Have a tip? 1-855-CALL-FBI (1-855-225-5324)</div>
            <div className="text-white/70 text-[13px]">Tips can remain anonymous. For emergencies call 911. Online reports are triaged by the National Threat Operations Center.</div>
          </div>
          <a href="#tips" className="bg-[#C49A3C] hover:bg-[#E8C766] text-black font-extrabold uppercase text-[13px] px-6 py-3 rounded-sm transition-colors whitespace-nowrap">Submit Tip Online</a>
        </div>
      </div>
      <WantedModal person={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
