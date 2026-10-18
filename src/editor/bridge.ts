// The preview iframe is sandboxed (no same-origin access), so Design mode talks to
// it over postMessage. Every body element in the preview copy gets a sequential
// data-aura-id; parsing the source HTML again assigns the same ids, which lets
// edits made in the live preview be applied to the clean source document.

const ID_ATTR = "data-aura-id";

export interface SelectionInfo {
  id: number;
  tag: string;
  classes: string;
  text: string | null;
  href: string | null;
  src: string | null;
  alt: string | null;
  outerHTML: string;
  path: string[];
}

export type Patch =
  | { type: "text"; html: string }
  | { type: "attrs"; classes?: string; href?: string; src?: string; alt?: string }
  | { type: "delete" }
  | { type: "duplicate" }
  | { type: "move"; dir: -1 | 1 };

export type FrameMessage =
  | { type: "ready" }
  | { type: "selected"; info: SelectionInfo }
  | { type: "deselected" }
  | { type: "text"; id: number; html: string }
  | { type: "scroll"; y: number };

/** Commands the editor sends into the preview; they travel with `source: "aura-parent"`. */
export type ParentCommand =
  | { type: "design"; enabled: boolean }
  | { type: "select"; id: number | null }
  | { type: "scroll"; y: number };

function parse(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

function bodyElements(doc: Document): Element[] {
  return doc.body ? Array.from(doc.body.querySelectorAll("*")) : [];
}

function serialize(doc: Document): string {
  return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
}

/** Removes design ids from an HTML fragment produced by the live preview. */
export function stripIds(html: string): string {
  return html.replace(/\sdata-aura-id="\d+"/g, "");
}

/** Prepares source HTML for the preview: tags elements and injects the bridge script. */
export function buildPreviewDocument(html: string): string {
  if (!html.trim()) return "";
  const doc = parse(html);
  bodyElements(doc).forEach((el, i) => el.setAttribute(ID_ATTR, String(i)));
  const script = doc.createElement("script");
  script.setAttribute("data-aura-bridge", "");
  script.textContent = BRIDGE_SCRIPT;
  (doc.body ?? doc.documentElement).appendChild(script);
  return serialize(doc);
}

/** Applies a Design-mode patch to the source HTML. Returns the new HTML and the patched element's new id. */
export function applyPatch(html: string, id: number, patch: Patch): { html: string; id: number | null } {
  const doc = parse(html);
  const el = bodyElements(doc)[id];
  if (!el) return { html, id: null };

  let focus: Element | null = el;
  switch (patch.type) {
    case "text":
      el.innerHTML = stripIds(patch.html);
      break;
    case "attrs": {
      const set = (name: string, value: string | undefined) => {
        if (value === undefined) return;
        if (value.trim()) el.setAttribute(name, value.trim());
        else el.removeAttribute(name);
      };
      set("class", patch.classes);
      set("href", patch.href);
      set("src", patch.src);
      set("alt", patch.alt);
      break;
    }
    case "delete":
      el.remove();
      focus = null;
      break;
    case "duplicate":
      el.after(el.cloneNode(true));
      break;
    case "move": {
      const sibling = patch.dir < 0 ? el.previousElementSibling : el.nextElementSibling;
      if (sibling) {
        if (patch.dir < 0) sibling.before(el);
        else sibling.after(el);
      }
      break;
    }
  }
  const newId = focus ? bodyElements(doc).indexOf(focus) : null;
  return { html: serialize(doc), id: newId === -1 ? null : newId };
}

/** A CSS selector path for the element with the given id, used to scope AI edits. */
export function selectorFor(html: string, id: number): string | null {
  const el = bodyElements(parse(html))[id];
  if (!el) return null;
  const parts: string[] = [];
  let node: Element | null = el;
  while (node && node.tagName !== "BODY" && node.tagName !== "HTML") {
    const tag = node.tagName.toLowerCase();
    const parent: Element | null = node.parentElement;
    const same = parent ? Array.from(parent.children).filter((c) => c.tagName === node!.tagName) : [];
    parts.unshift(same.length > 1 ? `${tag}:nth-of-type(${same.indexOf(node) + 1})` : tag);
    node = parent;
  }
  return ["body", ...parts].join(" > ");
}

/**
 * The live preview's DOM includes changes made by the page's own scripts (for example
 * scroll-reveal classes), so editable attributes are read from the source instead.
 */
export function withSourceAttributes(html: string, info: SelectionInfo): SelectionInfo {
  const el = bodyElements(parse(html))[info.id];
  if (!el) return info;
  const text = el.children.length === 0 && el.textContent?.trim() ? el.textContent.replace(/\s+/g, " ").trim() : null;
  return {
    ...info,
    classes: el.getAttribute("class") ?? "",
    href: el.getAttribute("href"),
    src: el.getAttribute("src"),
    alt: el.getAttribute("alt"),
    text,
  };
}

export function sourceOuterHTML(html: string, id: number): string | null {
  const el = bodyElements(parse(html))[id];
  return el ? el.outerHTML : null;
}

// Runs inside the preview iframe. Kept dependency-free and small.
const BRIDGE_SCRIPT = String.raw`(() => {
  const ATTR = "${ID_ATTR}";
  const post = (m) => parent.postMessage(Object.assign({ source: "aura-frame" }, m), "*");
  let design = false, selected = null, hovered = null, editing = null;

  const mk = (color, fill) => {
    const d = document.createElement("div");
    d.setAttribute("data-aura-overlay", "");
    d.style.cssText = "position:fixed;pointer-events:none;z-index:2147483646;display:none;box-sizing:border-box;border-radius:3px;border:1.5px " + (fill ? "solid " : "dashed ") + color + ";" + (fill ? "background:rgba(59,130,246,.06)" : "");
    const tag = document.createElement("span");
    tag.style.cssText = "position:absolute;left:-1.5px;top:-20px;font:500 10px/18px ui-monospace,monospace;padding:0 6px;border-radius:4px 4px 0 0;color:#fff;background:" + color;
    d.appendChild(tag);
    document.documentElement.appendChild(d);
    return d;
  };
  const hoverBox = mk("#60a5fa", false), selectBox = mk("#2563eb", true);

  const place = (box, el) => {
    if (!el || !el.isConnected) { box.style.display = "none"; return; }
    const r = el.getBoundingClientRect();
    Object.assign(box.style, { display: "block", left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
    box.firstChild.textContent = el.tagName.toLowerCase() + (el.classList[0] ? "." + el.classList[0] : "");
    box.firstChild.style.top = r.top < 22 ? "0px" : "-20px";
  };
  const refresh = () => { place(hoverBox, design && hovered !== selected ? hovered : null); place(selectBox, design ? selected : null); };
  const find = (t) => (t && t.closest ? t.closest("[" + ATTR + "]") : null);
  const byId = (id) => document.querySelector("[" + ATTR + '="' + id + '"]');
  const clean = (s) => s.replace(/\sdata-aura-id="\d+"/g, "").replace(/\scontenteditable="[^"]*"/g, "");

  const info = (el) => {
    const path = [];
    for (let n = el; n && n !== document.body; n = n.parentElement) path.unshift(n.tagName.toLowerCase());
    // Only plain-text elements get a text field; mixed content is edited inline (double-click).
    const leaf = el.children.length === 0;
    return {
      id: Number(el.getAttribute(ATTR)), tag: el.tagName.toLowerCase(), classes: el.getAttribute("class") || "",
      text: leaf && el.textContent.trim() ? el.textContent.replace(/\s+/g, " ").trim() : null,
      href: el.getAttribute("href"), src: el.getAttribute("src"), alt: el.getAttribute("alt"),
      outerHTML: clean(el.outerHTML).slice(0, 6000), path,
    };
  };
  const select = (el) => {
    selected = el;
    refresh();
    if (el) post({ type: "selected", info: info(el) }); else post({ type: "deselected" });
  };
  const finishEdit = () => {
    if (!editing) return;
    const el = editing; editing = null;
    el.removeAttribute("contenteditable");
    post({ type: "text", id: Number(el.getAttribute(ATTR)), html: clean(el.innerHTML) });
  };

  document.addEventListener("mouseover", (e) => { if (design) { hovered = find(e.target); refresh(); } }, true);
  document.addEventListener("mouseleave", () => { hovered = null; refresh(); });
  document.addEventListener("click", (e) => {
    if (design) {
      if (editing && editing.contains(e.target)) return;
      e.preventDefault(); e.stopPropagation();
      finishEdit();
      select(find(e.target));
      return;
    }
    const a = e.target.closest && e.target.closest("a[href]");
    if (a && !a.getAttribute("href").startsWith("#")) e.preventDefault();
  }, true);
  document.addEventListener("dblclick", (e) => {
    if (!design) return;
    const el = find(e.target);
    if (!el || el.tagName === "IMG" || el.tagName === "svg") return;
    e.preventDefault();
    editing = el; select(el);
    el.setAttribute("contenteditable", "true");
    el.focus();
  }, true);
  document.addEventListener("keydown", (e) => {
    if (!editing) return;
    if (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey)) { e.preventDefault(); editing.blur(); }
  }, true);
  document.addEventListener("focusout", (e) => { if (editing && e.target === editing) finishEdit(); }, true);
  // Never let a form submission navigate the preview away; the page's own handlers still run.
  document.addEventListener("submit", (e) => e.preventDefault(), true);

  let scrollTimer;
  addEventListener("scroll", () => { refresh(); clearTimeout(scrollTimer); scrollTimer = setTimeout(() => post({ type: "scroll", y: scrollY }), 120); }, { passive: true });
  addEventListener("resize", refresh);

  addEventListener("message", (e) => {
    const m = e.data;
    if (!m || m.source !== "aura-parent") return;
    if (m.type === "design") { design = m.enabled; if (!design) { finishEdit(); hovered = null; } document.documentElement.style.cursor = design ? "default" : ""; refresh(); }
    if (m.type === "select") {
      selected = m.id === null ? null : byId(m.id);
      refresh();
      // Re-send details so the inspector reflects the element after a reload.
      if (selected) post({ type: "selected", info: info(selected) });
    }
    if (m.type === "scroll") { const prev = document.documentElement.style.scrollBehavior; document.documentElement.style.scrollBehavior = "auto"; scrollTo(0, m.y); document.documentElement.style.scrollBehavior = prev; }
  });

  let sent = false;
  const ready = () => { if (!sent) { sent = true; post({ type: "ready" }); } };
  if (document.readyState === "complete") setTimeout(ready, 60);
  else { addEventListener("load", () => setTimeout(ready, 60)); setTimeout(ready, 1500); }
})();`;
