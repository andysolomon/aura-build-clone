import { Highlight, themes } from "prism-react-renderer";
import { useEffect, useState } from "react";
import { useTheme } from "../lib/theme";

/** Read-only syntax-highlighted code with line numbers. */
export function CodeBlock({ code, language = "markup", className }: { code: string; language?: string; className?: string }) {
  const { mode } = useTheme();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), [mode]);

  return (
    <Highlight code={code} language={language} theme={dark ? themes.vsDark : themes.vsLight}>
      {({ tokens, getLineProps, getTokenProps }) => (
        <pre className={`overflow-auto py-4 font-mono text-[12.5px] leading-[1.6] scrollbar-thin ${className ?? ""}`} style={{ background: "transparent" }}>
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
  );
}
