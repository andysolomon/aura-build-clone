import { ArrowUp, Globe, Mail, Menu, Rss, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, ScrollRestoration } from "react-router";
import { cx } from "../lib/util";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./ui";

const NAV = [
  { to: "/", label: "Create" },
  { to: "/templates", label: "Templates" },
  { to: "/design-systems", label: "Design.md" },
  { to: "/projects", label: "Projects" },
  { to: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-6">
        <Link to="/" className="text-fg" aria-label="Home">
          <Logo className="h-[26px] w-[26px]" />
        </Link>
        <nav className="hidden items-center gap-10 md:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cx("text-[12.5px] uppercase tracking-[0.02em] transition", isActive ? "text-fg" : "text-muted hover:text-fg")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-5">
          <ThemeToggle className="hidden sm:inline-flex" />
          <Link to="/projects" className="hidden text-[12.5px] uppercase tracking-[0.02em] text-muted hover:text-fg sm:inline">
            My work
          </Link>
          <button className="md:hidden text-muted" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-line px-6 py-4 md:hidden">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="block py-2 text-sm uppercase text-muted">
              {item.label}
            </Link>
          ))}
          <ThemeToggle className="mt-3" />
        </nav>
      )}
    </header>
  );
}

const FOOTER_COLUMNS = [
  { title: "Product", links: [["Create", "/"], ["Templates", "/templates"], ["Design systems", "/design-systems"], ["Pricing", "/pricing"]] },
  { title: "Workspace", links: [["Projects", "/projects"], ["New project", "/build"]] },
  { title: "Templates", links: [["SaaS", "/templates?category=SaaS"], ["Portfolio", "/templates?category=Portfolio"], ["E-commerce", "/templates?category=E-commerce"], ["Services", "/templates?category=Services"]] },
];

export function SiteFooter() {
  return (
    <footer className="px-3 pb-3 pt-16">
      <div className="mx-auto max-w-[1440px] rounded-3xl border border-line bg-panel/60 px-10 pb-8 pt-14">
        <div className="relative grid gap-12 md:grid-cols-[1.6fr_repeat(3,1fr)]">
          <div>
            <Logo className="h-9 w-9" />
            <p className="mt-8 max-w-sm text-[15px] leading-relaxed text-muted">
              An AI landing page builder that turns a prompt into a polished, exportable HTML page. A clone of aura.build, built for learning.
            </p>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="text-[11px] uppercase tracking-wide text-faint">{col.title}</div>
              <ul className="mt-5 space-y-3">
                {col.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="text-[15px] text-muted transition hover:text-fg">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="absolute -top-4 right-0 grid h-8 w-8 place-items-center rounded-full border border-line text-muted hover:text-fg"
            aria-label="Back to top"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <div className="flex items-center gap-4 text-[13px] text-muted">
            <span>© {new Date().getFullYear()} Aura Clone. Not affiliated with aura.build.</span>
            <ThemeToggle />
          </div>
          <div className="flex gap-2">
            {[Globe, Rss, Mail].map((Icon, i) => (
              <span key={i} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted">
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export function MarketingLayout() {
  return (
    <>
      <ScrollRestoration />
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
    </>
  );
}
