import { useEffect, useRef, useState } from "react";
import { BadgeCheck, ChevronRight, LoaderCircle, Mail, Phone, ShieldCheck } from "lucide-react";
import { useSupport } from "./useSupport";
import { ContactForm, SupportError } from "./shared";
import { errorText, newId, referenceFor, type SupportThread } from "./model";
import { detectUrgency, classifyIntent } from "./triage";

export interface FiledReport {
  reference: string;
  category: string;
  narrative: string;
  fieldOffice: string;
  lossAmount: string;
  suspectDetails: string;
}

/**
 * Shown after a tip/scam report is filed. Creates a `report` thread in the duty
 * inbox and captures the follow-up contact details the agent needs.
 */
export function PostReportCapture({ report }: { report: FiledReport }) {
  const [activated, setActivated] = useState(false);
  const [phase, setPhase] = useState<"idle" | "creating" | "form" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [thread, setThread] = useState<SupportThread | null>(null);
  const ids = useRef({ thread: newId(), message: newId() });
  const support = useSupport("visitor", activated);

  const begin = () => {
    setActivated(true);
    setPhase("creating");
    setError("");
  };

  // The controller only exists after activation; open the follow-up file once it is ready.
  const started = useRef(false);
  useEffect(() => {
    if (!activated || phase !== "creating" || !support.ready || started.current) return;
    started.current = true;
    const subject = `${report.category} — ${report.reference}`;
    const body = [
      `Filed report ${report.reference}`,
      `Classification: ${report.category}`,
      `Field division: ${report.fieldOffice}`,
      report.lossAmount ? `Reported loss: ${report.lossAmount}` : "",
      "",
      "Statement:",
      report.narrative,
      report.suspectDetails ? `\nSuspect identifiers:\n${report.suspectDetails}` : "",
    ].filter(Boolean).join("\n").slice(0, 2000);
    const intent = classifyIntent(`${report.category} ${report.narrative}`);
    void (async () => {
      try {
        await support.create({
          id: ids.current.thread, messageId: ids.current.message, name: "",
          kind: "report", subject, category: report.category, body, consent: true,
          intent: intent.label, urgent: detectUrgency(report.narrative),
        });
        setPhase("form");
      } catch (reason) {
        setError(errorText(reason));
        setPhase("error");
        started.current = false;
      }
    })();
  }, [activated, phase, support, report]);

  // Resolve the live thread row once the queue has refreshed.
  useEffect(() => {
    if (phase !== "form" && phase !== "done") return;
    const found = support.snapshot.threads.find(t => t.id === ids.current.thread);
    if (found) setThread(found);
  }, [phase, support.snapshot]);

  if (phase === "idle") {
    return (
      <div className="mt-6 max-w-xl mx-auto bg-white border border-black/10 rounded-sm p-5 text-left shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[#0B1F3A] text-[#E8C766]">
            <Mail size={19} />
          </span>
          <div className="flex-1">
            <h4 className="font-extrabold text-[15px] text-[#0B1F3A]">Add contact details for follow-up</h4>
            <p className="mt-1 text-[13px] leading-relaxed text-gray-600">
              An agent may need to reach you for evidence, screenshots, or a sworn statement.
              Save your email and phone now and they are attached to reference{" "}
              <strong className="font-mono text-[#0B1F3A]">{report.reference}</strong>.
            </p>
            <button
              type="button"
              onClick={() => void begin()}
              className="mt-3 inline-flex items-center gap-2 bg-[#B22234] hover:bg-[#8f1b29] text-white font-bold uppercase text-[12px] px-5 py-2.5 rounded-sm transition-colors"
            >
              <BadgeCheck size={14} /> Save my contact details
            </button>
            <p className="mt-2 text-[11.5px] text-gray-400">
              Optional. Anonymous reports are still triaged, but cannot receive a callback.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "creating") {
    return (
      <div className="mt-6 max-w-xl mx-auto bg-white border border-black/10 rounded-sm p-6 text-center shadow-sm">
        <LoaderCircle size={22} className="mx-auto animate-spin text-[#0B1F3A]" />
        <p className="mt-3 text-[13px] text-gray-600">Opening your follow-up file...</p>
        <SupportError message={error} />
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="mt-6 max-w-xl mx-auto bg-white border border-black/10 rounded-sm p-5 shadow-sm">
        <SupportError message={error || "Could not open the follow-up file."} />
        <button
          type="button"
          onClick={() => { ids.current = { thread: newId(), message: newId() }; setPhase("creating"); }}
          className="mt-3 inline-flex items-center gap-2 bg-[#0B1F3A] text-white font-bold uppercase text-[12px] px-5 py-2.5 rounded-sm"
        >
          Try again <ChevronRight size={14} />
        </button>
      </div>
    );
  }

  if (phase === "done" && thread) {
    return (
      <div className="mt-6 max-w-xl mx-auto bg-white border border-black/10 rounded-sm p-6 text-center shadow-sm">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
          <ShieldCheck size={24} />
        </span>
        <h4 className="mt-3 font-serif text-[19px] font-extrabold text-[#0B1F3A]">Contact details attached</h4>
        <p className="mt-1.5 text-[13px] leading-relaxed text-gray-600">
          A duty agent can now reach you about report{" "}
          <strong className="font-mono">{report.reference}</strong>. Your follow-up file is{" "}
          <strong className="font-mono">{referenceFor(thread)}</strong>.
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2 text-[12px]">
          {thread.contact_email && (
            <a href={`mailto:${thread.contact_email}`} className="inline-flex items-center gap-1.5 border border-black/15 px-3 py-2 rounded-sm text-[#0B1F3A] font-semibold hover:bg-gray-50">
              <Mail size={13} /> {thread.contact_email}
            </a>
          )}
          {thread.contact_phone && (
            <a href={`tel:${thread.contact_phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 border border-black/15 px-3 py-2 rounded-sm text-[#0B1F3A] font-semibold hover:bg-gray-50">
              <Phone size={13} /> {thread.contact_phone}
            </a>
          )}
        </div>
        <button
          type="button"
          onClick={() => setPhase("form")}
          className="mt-4 text-[12px] font-bold text-[#B22234] underline underline-offset-2"
        >
          Edit these details
        </button>
      </div>
    );
  }

  if (thread) {
    return (
      <div className="mt-6 max-w-xl mx-auto bg-white border border-black/10 rounded-sm p-5 shadow-sm text-left support-ui">
        <ContactForm thread={thread} support={support} onDone={() => {
          const updated = support.snapshot.threads.find(t => t.id === thread.id);
          setThread(updated ?? thread);
          setPhase("done");
        }} />
      </div>
    );
  }

  return null;
}
