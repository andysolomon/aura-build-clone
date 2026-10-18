import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "../lib/util";

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden className={cx("h-6 w-6", className)}>
      <defs>
        <pattern id="logo-hatch" width="2.4" height="2.4" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <rect width="1.1" height="2.4" fill="currentColor" />
        </pattern>
      </defs>
      <path d="M14 3 25 25h-5.2L14 13.4 8.2 25H3L14 3Z" fill="url(#logo-hatch)" />
      <path d="M14 3 25 25h-5.2L14 13.4 8.2 25H3L14 3Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M10.4 19.6h7.2" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-ink text-ink-fg hover:opacity-90 shadow-sm",
  secondary: "bg-panel text-fg border border-line hover:bg-subtle shadow-[0_1px_1px_rgb(0_0_0/0.03)]",
  ghost: "text-muted hover:text-fg hover:bg-subtle",
};
const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-9 px-3.5 text-sm gap-2 rounded-lg",
  lg: "h-11 px-6 text-[15px] gap-2 rounded-full",
  icon: "h-8 w-8 rounded-lg justify-center",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }
>(function Button({ variant = "secondary", size = "md", className, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={cx(
        "inline-flex shrink-0 items-center font-medium whitespace-nowrap transition disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-accent",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
});

export function Popover({ open, children, className, align = "left", side = "bottom" }: {
  open: boolean;
  children: ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
  side?: "top" | "bottom";
}) {
  if (!open) return null;
  return (
    <div
      className={cx(
        "absolute z-50 min-w-56 rounded-xl border border-line bg-panel p-1.5 shadow-pop animate-fade-in",
        side === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
        align === "left" && "left-0",
        align === "right" && "right-0",
        align === "center" && "left-1/2 -translate-x-1/2",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function MenuItem({ children, onClick, active, className, disabled }: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition hover:bg-subtle disabled:opacity-40",
        active && "bg-subtle",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "pro" | "accent" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        tone === "neutral" && "bg-subtle text-muted",
        tone === "pro" && "border border-line text-muted",
        tone === "accent" && "bg-accent text-white",
      )}
    >
      {children}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <span className={cx("inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent", className)} />;
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded border border-line bg-subtle px-1 font-mono text-[10px] text-muted">{children}</kbd>;
}
