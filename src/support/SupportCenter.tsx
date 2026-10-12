import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { Headphones, X } from "lucide-react";
import { OperatorInbox } from "./OperatorInbox";
import { VisitorWidget, type VisitorTab } from "./VisitorWidget";
import { useSupport } from "./useSupport";
import { unreadCount } from "./model";
import { hasVisitorSession } from "./backend";
import "./support.css";

function isVisitorHash(hash: string) {
  return hash === "#support-chat" || hash === "#support-complaint";
}

class SupportBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  render() {
    if (this.state.failed) return (
      <div className="support-ui support-fallback" role="alert">
        <strong>Website support couldn't open.</strong>
        <button type="button" className="support-text-button" onClick={() => this.setState({ failed: false })}>Reload support</button>
      </div>
    );
    return this.props.children;
  }
}

export function SupportCenter() {
  return <SupportBoundary><SupportContents /></SupportBoundary>;
}

function SupportContents() {
  const [inbox, setInbox] = useState(() => window.location.hash === "#support-inbox");
  const [open, setOpen] = useState(() => isVisitorHash(window.location.hash));
  const [activated, setActivated] = useState(() => open || hasVisitorSession());
  const [tab, setTab] = useState<VisitorTab>(() => window.location.hash === "#support-complaint" ? "complaint" : "chat");
  const launcher = useRef<HTMLButtonElement>(null);
  const support = useSupport("visitor", activated && !inbox);
  const unread = support.snapshot.threads.reduce((count, thread) => count + unreadCount(thread, support.snapshot.messages, "visitor"), 0);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash;
      setInbox(hash === "#support-inbox");
      if (isVisitorHash(hash)) {
        setOpen(true);
        setActivated(true);
        setTab(hash === "#support-complaint" ? "complaint" : "chat");
      }
    };
    const onSupportLink = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest("a") : null;
      if (anchor?.target === "_blank") return;
      const href = anchor?.getAttribute("href");
      if (href && isVisitorHash(href) && href === window.location.hash) onHashChange();
    };
    window.addEventListener("hashchange", onHashChange);
    document.addEventListener("click", onSupportLink);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("click", onSupportLink);
    };
  }, []);

  const close = () => {
    setOpen(false);
    if (isVisitorHash(window.location.hash)) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
    requestAnimationFrame(() => launcher.current?.focus({ preventScroll: true }));
  };

  return (
    <div className="support-ui">
      {inbox && <OperatorInbox onClose={() => {
        setInbox(false);
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
        requestAnimationFrame(() => launcher.current?.focus({ preventScroll: true }));
      }} />}
      <div hidden={inbox}>
        <VisitorWidget open={open && !inbox} tab={tab} setTab={setTab} onClose={close} support={support} />
        <button ref={launcher} type="button" className={`support-launcher ${open ? "support-launcher--open" : ""}`} aria-label={open ? "Close support chat" : `Open website chat and complaints${unread ? `, ${unread} unread replies` : ""}`} aria-expanded={open} aria-controls="site-support-panel" onClick={() => {
          if (open) close();
          else { setOpen(true); setActivated(true); }
        }}>
          {open ? <X size={22} /> : <Headphones size={23} strokeWidth={1.7} />}
          <span>{open ? "Close Support" : "Live Duty Desk"}<small>Case & Scam Inquiries</small></span>
          {!open && unread > 0 && <span className="support-launcher-badge">{unread > 99 ? "99+" : unread}</span>}
        </button>
      </div>
    </div>
  );
}