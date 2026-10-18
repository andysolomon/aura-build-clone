import { useEffect, useRef, useState } from "react";

const PAGE_WIDTH = 1440;

/** Live, scaled-down render of a project's current page in a sandboxed iframe. */
export function ProjectThumb({ projectId, updatedAt }: { projectId: string; updatedAt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const resize = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / PAGE_WIDTH));
    const intersect = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible(true), { rootMargin: "200px" });
    resize.observe(el);
    intersect.observe(el);
    return () => {
      resize.disconnect();
      intersect.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line-soft bg-subtle">
      {visible && scale > 0 && (
        <iframe
          title="Project preview"
          src={`/api/projects/${projectId}/preview?v=${encodeURIComponent(updatedAt)}`}
          sandbox="allow-scripts"
          loading="lazy"
          tabIndex={-1}
          className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
          style={{ width: PAGE_WIDTH, height: PAGE_WIDTH / 1.6, transform: `scale(${scale})` }}
        />
      )}
    </div>
  );
}
