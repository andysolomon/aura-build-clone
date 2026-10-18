import { Check, Copy, Pencil, Save, X } from "lucide-react";
import { Highlight, themes } from "prism-react-renderer";
import { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui";
import { useTheme } from "../lib/theme";

interface Props {
  html: string;
  streaming: boolean;
  onSave: (html: string) => void;
}

function useIsDark() {
  const { mode } = useTheme();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), [mode]);
  return dark;
}

export function CodeView({ html, streaming, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(html);
  const [copied, setCopied] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const dark = useIsDark();

  useEffect(() => {
    if (!editing) setDraft(html);
  }, [html, editing]);

  useEffect(() => {
    if (streaming && scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [html, streaming]);

  async function copy() {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const lines = html.split("\n").length;
  const kb = (new Blob([html]).size / 1024).toFixed(1);

  return (
    <div className="flex h-full flex-col bg-panel">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-line px-3">
        <span className="font-mono text-xs text-muted">
          index.html · {lines} lines · {kb} KB{streaming && " · streaming…"}
        </span>
        <div className="flex gap-1.5">
          {editing ? (
            <>
              <Button size="sm" onClick={() => (setEditing(false), setDraft(html))}><X className="h-3.5 w-3.5" /> Cancel</Button>
              <Button size="sm" variant="primary" onClick={() => (onSave(draft), setEditing(false))}><Save className="h-3.5 w-3.5" /> Save</Button>
            </>
          ) : (
            <>
              <Button size="sm" onClick={copy} disabled={!html}>{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} Copy</Button>
              <Button size="sm" onClick={() => setEditing(true)} disabled={!html || streaming}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          spellCheck={false}
          className="flex-1 resize-none bg-panel p-4 font-mono text-[12.5px] leading-[1.6] text-fg outline-none"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "s") {
              e.preventDefault();
              onSave(draft);
              setEditing(false);
            }
          }}
        />
      ) : (
        <div ref={scroller} className="flex-1 overflow-auto scrollbar-thin">
          {streaming ? (
            // Plain text while streaming: re-highlighting a growing document on every chunk is too slow.
            <pre className="p-4 font-mono text-[12.5px] leading-[1.6] text-muted">{html}</pre>
          ) : (
            <Highlight code={html} language="markup" theme={dark ? themes.vsDark : themes.vsLight}>
              {({ tokens, getLineProps, getTokenProps }) => (
                <pre className="py-4 font-mono text-[12.5px] leading-[1.6]" style={{ background: "transparent" }}>
                  {tokens.map((line, i) => (
                    <div key={i} {...getLineProps({ line })} className="flex">
                      <span className="w-12 shrink-0 select-none pr-4 text-right text-faint">{i + 1}</span>
                      <span className="whitespace-pre-wrap break-all pr-4">
                        {line.map((token, key) => <span key={key} {...getTokenProps({ token })} />)}
                      </span>
                    </div>
                  ))}
                </pre>
              )}
            </Highlight>
          )}
        </div>
      )}
    </div>
  );
}
