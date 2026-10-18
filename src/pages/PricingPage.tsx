import { ArrowUpRight, Check, Plus, Rocket, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { cx } from "../lib/util";

interface Plan {
  name: string;
  blurb: string;
  monthly: number;
  prompts: string;
  cta: string;
  icon: typeof Zap;
  popular?: boolean;
  features: string[];
}

const PLANS: Plan[] = [
  { name: "Free", blurb: "Explore templates and the editor", monthly: 0, prompts: "5 AI prompts / day", cta: "Start building", icon: ArrowUpRight, features: ["All free templates", "Visual Design mode", "HTML export", "1 published page"] },
  { name: "Pro", blurb: "The core workflow for solo builders", monthly: 25, prompts: "300 prompts / month", cta: "Start Pro trial", icon: Zap, popular: true, features: ["Everything in Free", "All AI models", "Pro templates", "Image references", "Unlimited published pages"] },
  { name: "Max", blurb: "More prompts for frequent builders", monthly: 50, prompts: "800 prompts / month", cta: "Start Max trial", icon: Rocket, features: ["Everything in Pro", "Priority generation", "Custom design systems", "Version history forever"] },
  { name: "Ultra", blurb: "High-volume workspace for teams", monthly: 100, prompts: "2,000 prompts / month", cta: "Start Ultra trial", icon: Sparkles, features: ["Everything in Max", "5 team seats", "Shared projects", "Custom domains", "Priority support"] },
];

const FAQ = [
  ["What counts as a prompt?", "Each message you send to the AI, whether it creates a new page or edits an existing one, uses one prompt credit regardless of model."],
  ["Can I export my designs?", "Yes. Every plan can download standalone HTML with Tailwind CSS, or copy the code straight from the Code tab."],
  ["Which models are available?", "Whatever your own subscriptions include. The builder detects Claude Code, Codex, Cursor and OpenCode on this machine and uses their sign-ins, or the Anthropic API if you set a key. Pick a model per prompt in the composer."],
  ["Is this the real Aura?", "No. This is an educational clone of aura.build, reconstructed from its public site. Plans here are illustrative and no payment is taken."],
];

export function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-[944px] -translate-x-1/2 border-x border-line lg:block" />
      <div className="h-28 border-b border-line" />
      <section className="border-b border-line px-6 py-6">
        <div className="mx-auto max-w-[944px]">
          <div className="mx-auto w-fit rounded-full border border-amber-300/70 bg-amber-50 px-5 py-2 text-[14px] text-amber-950 shadow-[0_0_30px_-8px_rgb(251_191_36/0.6)] dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
            <span className="mr-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">Annual promo</span>
            Paid annual plans are 50% off while your subscription stays active.
          </div>
          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.2fr_1fr]">
            <h1 className="text-[clamp(2.4rem,5vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.04em]">Plans for every kind of builder</h1>
            <p className="text-[17px] leading-relaxed text-muted">
              Try Pro, Max or Ultra free for 3 days with 20 trial prompts. Cancel anytime before the trial ends.
            </p>
          </div>
        </div>
      </section>
      <div className="h-8 border-b border-line" />

      <section className="px-4 py-10">
        <div className="flex items-center justify-center gap-4">
          <span className={cx("text-[15px]", annual ? "text-muted" : "text-fg")}>Monthly</span>
          <button
            role="switch"
            aria-checked={annual}
            onClick={() => setAnnual((v) => !v)}
            className={cx("relative h-9 w-[72px] rounded-xl border-2 border-line p-0.5 transition", annual ? "bg-blue-500" : "bg-subtle")}
          >
            <span className={cx("block h-7 w-8 rounded-lg bg-white shadow transition", annual && "translate-x-[32px]")} />
          </button>
          <span className={cx("text-[15px]", annual ? "text-fg" : "text-muted")}>Annual</span>
          <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">Save 50%</span>
        </div>

        <div className="mx-auto mt-10 grid max-w-[1200px] gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((plan, i) => {
            const price = annual ? plan.monthly / 2 : plan.monthly;
            const Icon = plan.icon;
            return (
              <div key={plan.name} className={cx("relative flex flex-col rounded-2xl border bg-panel p-6", plan.popular ? "border-line shadow-composer" : "border-line")}>
                <div className="flex items-center justify-between">
                  <span className="grid h-6 w-6 place-items-center rounded-full border border-line text-[11px] text-muted">0{i + 1}</span>
                  {plan.popular && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-2.5 py-1 text-[11px] text-white">
                      <Sparkles className="h-3 w-3" /> Most popular
                    </span>
                  )}
                </div>
                <h2 className="mt-5 text-2xl font-medium">{plan.name}</h2>
                <p className="mt-1 min-h-10 text-[14px] text-muted">{plan.blurb}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-[32px] font-medium tracking-tight">${price % 1 ? price.toFixed(2) : price}</span>
                  <span className="text-sm text-muted">/mo</span>
                </div>
                <p className="mt-1 text-[12.5px] text-muted">
                  {plan.prompts}
                  {annual && plan.monthly > 0 && <span className="ml-2 line-through opacity-70">${plan.monthly * 12}/yr</span>}
                </p>
                <Link
                  to="/"
                  className="mt-6 flex h-11 items-center justify-center gap-2 rounded-full bg-ink text-[15px] text-ink-fg transition hover:opacity-90"
                >
                  {plan.cta} <Icon className="h-4 w-4" />
                </Link>
                <p className="mt-6 text-[13px] text-muted">Includes:</p>
                <ul className="mt-3 space-y-2.5 text-[14px]">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-10 pt-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight">Frequently asked questions</h2>
        <div className="mt-8 divide-y divide-line rounded-2xl border border-line bg-panel">
          {FAQ.map(([q, a], i) => (
            <div key={q}>
              <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between px-5 py-4 text-left text-[15px] font-medium">
                {q}
                <Plus className={cx("h-4 w-4 text-muted transition", open === i && "rotate-45")} />
              </button>
              {open === i && <p className="px-5 pb-5 text-[14px] leading-relaxed text-muted">{a}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
