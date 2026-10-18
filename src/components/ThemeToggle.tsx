import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemeMode } from "../lib/theme";
import { cx } from "../lib/util";

const OPTIONS: { mode: ThemeMode; icon: typeof Sun; label: string }[] = [
  { mode: "light", icon: Sun, label: "Light theme" },
  { mode: "system", icon: Monitor, label: "System theme" },
  { mode: "dark", icon: Moon, label: "Dark theme" },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { mode, setMode } = useTheme();
  return (
    <div className={cx("inline-flex items-center gap-0.5 rounded-full border border-line bg-subtle/60 p-0.5", className)} role="radiogroup" aria-label="Theme">
      {OPTIONS.map(({ mode: m, icon: Icon, label }) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={mode === m}
          aria-label={label}
          title={label}
          onClick={() => setMode(m)}
          className={cx(
            "grid h-6 w-6 place-items-center rounded-full transition",
            mode === m ? "bg-panel text-fg shadow-sm" : "text-faint hover:text-fg",
          )}
        >
          <Icon className="h-3 w-3" strokeWidth={2} />
        </button>
      ))}
    </div>
  );
}
