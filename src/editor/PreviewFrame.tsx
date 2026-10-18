import { useEffect, useMemo, useRef, useState } from "react";
import { DEVICE_WIDTH, type Device } from "../components/DeviceToggle";
import { cx } from "../lib/util";
import { buildPreviewDocument, type FrameMessage, type ParentCommand, type SelectionInfo } from "./bridge";

interface Props {
  html: string;
  device: Device;
  designMode: boolean;
  selectedId: number | null;
  onSelect: (info: SelectionInfo | null) => void;
  onTextEdit: (id: number, html: string) => void;
}

/**
 * Two iframes alternate: the next document loads in the hidden one and is swapped
 * in once it reports ready, so regenerations and edits don't flash a blank page.
 */
export function PreviewFrame({ html, device, designMode, selectedId, onSelect, onTextEdit }: Props) {
  const frames = [useRef<HTMLIFrameElement>(null), useRef<HTMLIFrameElement>(null)];
  const [docs, setDocs] = useState<[string, string]>(["", ""]);
  const [active, setActive] = useState(0);
  // The first document can sit blank while render-blocking CDN scripts download.
  const [firstPaint, setFirstPaint] = useState(false);
  const pending = useRef<number | null>(null);
  const fallback = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scrollY = useRef(0);
  const state = useRef({ designMode, selectedId, onSelect, onTextEdit, active });
  state.current = { designMode, selectedId, onSelect, onTextEdit, active };

  const doc = useMemo(() => buildPreviewDocument(html), [html]);

  useEffect(() => {
    if (!doc) return;
    // First document goes straight into the visible frame.
    const target = docs[active] === "" ? active : 1 - active;
    pending.current = target;
    // If the bridge's ready message never arrives (blocked script, lost message), show the frame anyway.
    clearTimeout(fallback.current);
    fallback.current = setTimeout(() => shown(target), 4000);
    setDocs((prev) => {
      const next: [string, string] = [...prev];
      // A unique suffix forces a reload even if this frame already holds identical markup.
      next[target] = `${doc}\n<!-- r${Date.now()} -->`;
      return next;
    });
  }, [doc]);

  /** A frame finished loading: swap it in if it was the pending one, and drop the loading overlay. */
  function shown(index: number) {
    if (pending.current === index) {
      pending.current = null;
      clearTimeout(fallback.current);
      setActive(index);
    }
    setFirstPaint(true);
  }

  useEffect(() => () => clearTimeout(fallback.current), []);

  const send = (index: number, message: ParentCommand) =>
    frames[index].current?.contentWindow?.postMessage({ source: "aura-parent", ...message }, "*");

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const data = e.data as (FrameMessage & { source?: string }) | null;
      if (!data || data.source !== "aura-frame") return;
      const index = frames.findIndex((f) => f.current?.contentWindow === e.source);
      if (index === -1) return;
      const s = state.current;

      if (data.type === "ready") {
        send(index, { type: "scroll", y: scrollY.current });
        send(index, { type: "design", enabled: s.designMode });
        send(index, { type: "select", id: s.selectedId });
        shown(index);
        return;
      }
      if (index !== s.active) return;
      if (data.type === "scroll") scrollY.current = data.y;
      else if (data.type === "selected") s.onSelect(data.info);
      else if (data.type === "deselected") s.onSelect(null);
      else if (data.type === "text") s.onTextEdit(data.id, data.html);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    send(active, { type: "design", enabled: designMode });
  }, [designMode, active]);

  useEffect(() => {
    send(active, { type: "select", id: selectedId });
  }, [selectedId, active]);

  const width = DEVICE_WIDTH[device];

  return (
    <div className="flex h-full justify-center overflow-hidden">
      <div
        className={cx(
          "relative h-full bg-white transition-[width] duration-300",
          width && "my-0 border-x border-line shadow-composer",
        )}
        style={{ width: width ?? "100%" }}
      >
        {docs.map((srcDoc, i) => (
          <iframe
            key={i}
            ref={frames[i]}
            title={i === active ? "Page preview" : "Next preview"}
            srcDoc={srcDoc}
            sandbox="allow-scripts allow-forms allow-popups allow-modals"
            className={cx("absolute inset-0 h-full w-full border-0", i === active ? "visible" : "invisible")}
            aria-hidden={i !== active}
          />
        ))}
        {!firstPaint && (
          <div className="absolute inset-0 grid place-items-center bg-canvas text-[13px] text-muted">
            <span className="flex items-center gap-2"><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" /> Rendering preview</span>
          </div>
        )}
      </div>
    </div>
  );
}
