import { useCallback, useEffect, useRef, useState } from "react";
import {
  initializeSupport, loadSupport, subscribeSupport, supportMode, OperatorAuthRequired,
  createRequest, sendMessage, setStatus, markRead, appendBotReply, requestHandoff, saveContact,
} from "./backend";
import {
  EMPTY_SNAPSHOT, errorText,
  type ConnectionState, type ContactDetails, type NewRequest, type SupportRole, type ThreadStatus,
} from "./model";

export function useSupport(role: SupportRole, enabled: boolean) {
  const [snapshot, setSnapshot] = useState(EMPTY_SNAPSHOT);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");
  const [authRequired, setAuthRequired] = useState(false);
  const [connection, setConnection] = useState<ConnectionState>(supportMode === "local" ? "local" : "connecting");
  const [generation, setGeneration] = useState(0);
  const refreshRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    let version = 0;
    let unsubscribe = () => {};
    let interval: ReturnType<typeof setInterval> | undefined;

    const handleError = (reason: unknown) => {
      if (!alive) return;
      if (reason instanceof OperatorAuthRequired) {
        setAuthRequired(true);
        setReady(false);
        setSnapshot(EMPTY_SNAPSHOT);
        setError("");
      } else setError(errorText(reason));
      setLoading(false);
    };

    const refresh = async () => {
      if (!alive) return;
      const requestVersion = ++version;
      try {
        const data = await loadSupport(role);
        if (!alive || version !== requestVersion) return;
        setSnapshot(data);
        setError("");
        setReady(true);
        setLoading(false);
        setAuthRequired(false);
      } catch (reason) {
        if (version === requestVersion) handleError(reason);
      }
    };
    refreshRef.current = refresh;

    const onResume = () => { if (document.visibilityState === "visible") void refresh(); };
    const onOffline = () => { if (supportMode === "live") setConnection("reconnecting"); };
    setLoading(true);
    setError("");
    void initializeSupport(role).then(() => {
      if (!alive) return;
      unsubscribe = subscribeSupport(role, () => void refresh(), state => { if (alive) setConnection(state); });
      void refresh();
      window.addEventListener("focus", onResume);
      window.addEventListener("online", onResume);
      window.addEventListener("offline", onOffline);
      document.addEventListener("visibilitychange", onResume);
      // Polling catches missed websocket events after sleep or a reconnect.
      if (supportMode === "live") interval = setInterval(onResume, 12000);
    }).catch(handleError);

    return () => {
      alive = false;
      unsubscribe();
      clearInterval(interval);
      window.removeEventListener("focus", onResume);
      window.removeEventListener("online", onResume);
      window.removeEventListener("offline", onOffline);
      document.removeEventListener("visibilitychange", onResume);
      refreshRef.current = async () => {};
    };
  }, [role, enabled, generation]);

  const retry = useCallback(() => setGeneration(value => value + 1), []);
  const create = useCallback(async (request: NewRequest) => {
    const id = await createRequest(request);
    await refreshRef.current();
    return id;
  }, []);
  const send = useCallback(async (threadId: string, body: string, id: string) => {
    await sendMessage(role, threadId, body, id);
    await refreshRef.current();
  }, [role]);
  const updateStatus = useCallback(async (threadId: string, status: ThreadStatus) => {
    if (role !== "operator") throw new Error("Only site operators can change a request's status.");
    await setStatus(threadId, status);
    await refreshRef.current();
  }, [role]);
  const read = useCallback(async (threadId: string, until: string) => {
    await markRead(role, threadId, until);
    await refreshRef.current();
  }, [role]);

  const botReply = useCallback(async (threadId: string, body: string, id: string, patch?: Partial<ContactDetails>) => {
    await appendBotReply(threadId, body, id, patch);
    await refreshRef.current();
  }, []);

  const handoff = useCallback(async (threadId: string, status: ThreadStatus = "awaiting_agent", urgent = false, intent = "") => {
    await requestHandoff(threadId, status, urgent, intent);
    await refreshRef.current();
  }, []);

  const saveContactDetails = useCallback(async (threadId: string, contact: ContactDetails) => {
    await saveContact(threadId, contact);
    await refreshRef.current();
  }, []);

  return {
    snapshot, ready, loading, error, authRequired, connection, retry,
    create, send, updateStatus, read, botReply, handoff, saveContactDetails,
  };
}

export type SupportController = ReturnType<typeof useSupport>;

export function useWindowActive() {
  const [active, setActive] = useState(() => document.visibilityState === "visible" && document.hasFocus());
  useEffect(() => {
    const update = () => setActive(document.visibilityState === "visible" && document.hasFocus());
    window.addEventListener("focus", update);
    window.addEventListener("blur", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.removeEventListener("focus", update);
      window.removeEventListener("blur", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  return active;
}