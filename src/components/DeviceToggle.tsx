import { Monitor, Smartphone, Tablet } from "lucide-react";
import { cx } from "../lib/util";

export type Device = "desktop" | "tablet" | "mobile";

export const DEVICE_WIDTH: Record<Device, number | null> = { desktop: null, tablet: 834, mobile: 390 };

const ICONS = { desktop: Monitor, tablet: Tablet, mobile: Smartphone };

export function DeviceToggle({ value, onChange }: { value: Device; onChange: (d: Device) => void }) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-line bg-subtle/70 p-0.5">
      {(Object.keys(ICONS) as Device[]).map((d) => {
        const Icon = ICONS[d];
        return (
          <button
            key={d}
            type="button"
            onClick={() => onChange(d)}
            title={`${d[0].toUpperCase()}${d.slice(1)} preview`}
            className={cx("grid h-6 w-7 place-items-center rounded-md transition", value === d ? "bg-panel text-fg shadow-sm" : "text-faint hover:text-fg")}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}
