import { execFile, spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createInterface } from "node:readline";

/** Environment for subscription CLIs. API keys are removed so each CLI uses its own login. */
export function subscriptionEnv(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
  const env = { ...process.env, ...extra };
  delete env.ANTHROPIC_API_KEY;
  delete env.ANTHROPIC_AUTH_TOKEN;
  delete env.OPENAI_API_KEY;
  delete env.CURSOR_API_KEY;
  return env;
}

/** Runs a short command. Resolves null if the command isn't installed. */
export function run(cmd: string, args: string[], timeoutMs = 20_000): Promise<{ stdout: string; stderr: string; code: number } | null> {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout: timeoutMs, env: subscriptionEnv(), maxBuffer: 16 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err && (err as NodeJS.ErrnoException).code === "ENOENT") return resolve(null);
      const code = err ? (typeof err.code === "number" ? err.code : 1) : 0;
      resolve({ stdout: String(stdout), stderr: String(stderr), code });
    });
  });
}

export async function hasCommand(cmd: string): Promise<boolean> {
  return (await run("which", [cmd], 5_000))?.code === 0;
}

/** A scratch directory per generation, so agent CLIs never touch real files. */
export async function withScratchDir<T>(fn: (dir: string) => AsyncGenerator<T>): Promise<AsyncGenerator<T>> {
  const dir = await mkdtemp(path.join(tmpdir(), "aura-gen-"));
  async function* wrapped() {
    try {
      yield* fn(dir);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }
  return wrapped();
}

const DATA_URL = /^data:image\/(png|jpeg|gif|webp);base64,(.+)$/;

/** Writes image data URLs to files in `dir`, for CLIs that take image paths. */
export async function writeImages(dir: string, images: string[]): Promise<string[]> {
  const files: string[] = [];
  for (const [i, image] of images.entries()) {
    const match = DATA_URL.exec(image);
    if (!match) continue;
    const file = path.join(dir, `attachment-${i + 1}.${match[1] === "jpeg" ? "jpg" : match[1]}`);
    await writeFile(file, Buffer.from(match[2], "base64"));
    files.push(file);
  }
  return files;
}

// Agent CLIs run for minutes; if the server exits (including dev restarts), take them down
// with it instead of leaving orphans that keep spending subscription quota.
const running = new Set<ReturnType<typeof spawn>>();
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"] as const) {
  process.once(signal, () => {
    for (const child of running) child.kill("SIGTERM");
    process.exit(0);
  });
}
process.once("exit", () => {
  for (const child of running) child.kill("SIGKILL");
});

export interface JsonLinesResult {
  code: number | null;
  stderr: string;
}

/**
 * Spawns a CLI, writes `stdin`, and yields each JSON line from stdout. Non-JSON lines are
 * skipped. Aborting the signal terminates the process. The generator's return value
 * carries the exit code and the tail of stderr.
 */
export async function* jsonLines(
  cmd: string,
  args: string[],
  opts: { stdin: string; cwd: string; env?: NodeJS.ProcessEnv; signal: AbortSignal; timeoutMs?: number },
): AsyncGenerator<Record<string, unknown>, JsonLinesResult> {
  const child = spawn(cmd, args, { cwd: opts.cwd, env: opts.env ?? subscriptionEnv(), stdio: ["pipe", "pipe", "pipe"] });
  running.add(child);
  child.once("close", () => running.delete(child));
  let stderr = "";
  child.stderr.on("data", (chunk: Buffer) => {
    stderr = (stderr + chunk.toString()).slice(-4000);
  });
  const exited = new Promise<number | null>((resolve) => {
    child.on("close", (code) => resolve(code));
    child.on("error", (err) => {
      stderr += `\n${err.message}`;
      resolve(-1);
    });
  });

  const kill = () => {
    if (child.exitCode !== null) return;
    child.kill("SIGTERM");
    setTimeout(() => child.exitCode === null && child.kill("SIGKILL"), 3_000).unref();
  };
  opts.signal.addEventListener("abort", kill, { once: true });
  const timer = setTimeout(kill, opts.timeoutMs ?? 15 * 60_000);

  child.stdin.on("error", () => {});
  child.stdin.end(opts.stdin);

  try {
    for await (const line of createInterface({ input: child.stdout })) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("{")) continue;
      try {
        yield JSON.parse(trimmed) as Record<string, unknown>;
      } catch {
        // Partial or non-JSON output; ignore.
      }
    }
    return { code: await exited, stderr: stderr.trim() };
  } finally {
    clearTimeout(timer);
    opts.signal.removeEventListener("abort", kill);
    kill();
  }
}

/** Last meaningful stderr line, for error messages. */
export function stderrSummary(stderr: string): string {
  const lines = stderr.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.at(-1)?.slice(0, 300) ?? "";
}
