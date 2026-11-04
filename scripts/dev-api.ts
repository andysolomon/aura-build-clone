// Runs the API server and restarts it when server code changes, like `tsx watch`, except that a
// restart waits until no generation is running. A restart kills the agent CLI mid-page, which
// throws away the tokens it already spent, and a git checkout or pull in this repo touches every
// server file at once.
//
//   npm run dev:api
import { spawn, type ChildProcess } from "node:child_process";
import { watch } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const PORT = Number(process.env.API_PORT ?? 8787);
const POLL_MS = 2_000;

let child: ChildProcess | null = null;
let changed = false;
let restarting = false;
let debounce: ReturnType<typeof setTimeout> | undefined;

function start() {
  child = spawn("tsx", ["--env-file-if-exists=.env", "server/index.ts"], { cwd: ROOT, stdio: "inherit" });
}

function stop(proc: ChildProcess): Promise<void> {
  if (proc.exitCode !== null || proc.signalCode !== null) return Promise.resolve();
  return new Promise((resolve) => {
    const force = setTimeout(() => proc.kill("SIGKILL"), 5_000);
    proc.once("exit", () => {
      clearTimeout(force);
      resolve();
    });
    proc.kill("SIGTERM");
  });
}

/** Generations in flight. A server that's down or still booting has none. */
async function busy(): Promise<number> {
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/api/dev/busy`, { signal: AbortSignal.timeout(2_000) });
    return ((await res.json()) as { generations?: number }).generations ?? 0;
  } catch {
    return 0;
  }
}

async function restart() {
  if (restarting) return;
  restarting = true;
  let announced = false;
  for (let n = await busy(); n > 0; n = await busy()) {
    if (!announced) {
      console.log(`[dev-api] Server code changed; restarting after ${n === 1 ? "the running generation finishes" : `${n} running generations finish`}.`);
      announced = true;
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
  changed = false;
  console.log("[dev-api] Restarting...");
  if (child) await stop(child);
  start();
  restarting = false;
  // Files that changed while we waited or restarted.
  if (changed) void restart();
}

function onChange(file: string | null) {
  if (file && file.endsWith(".test.ts")) return;
  changed = true;
  clearTimeout(debounce);
  debounce = setTimeout(() => void restart(), 300);
}

watch(path.join(ROOT, "server"), { recursive: true }, (_, file) => onChange(file));
watch(path.join(ROOT, "shared"), { recursive: true }, (_, file) => onChange(file));
watch(ROOT, (_, file) => file === ".env" && onChange(file));

for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"] as const) {
  process.once(signal, async () => {
    if (child) await stop(child);
    process.exit(0);
  });
}

start();
