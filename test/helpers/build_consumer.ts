import { lstatSync, mkdirSync, readlinkSync, symlinkSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { build } from "vite";

const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(here, "../..");
const consumerRoot = path.join(packageRoot, "test/consumer");

// Idempotent: leaves a correct symlink alone, replaces a stale one.
function linkPackage(): void {
  const scope = path.join(consumerRoot, "node_modules/@cagrmeister");
  const link = path.join(scope, "design");
  mkdirSync(scope, { recursive: true });
  try {
    if (lstatSync(link).isSymbolicLink() && path.resolve(scope, readlinkSync(link)) === packageRoot) return;
    unlinkSync(link);
  } catch {
    // no link yet
  }
  symlinkSync(packageRoot, link, "dir");
}

export async function buildConsumer(
  name: "theme" | "strict" | "compat",
): Promise<{ css: string; fontFiles: string[] }> {
  linkPackage();
  const result = await build({
    root: consumerRoot,
    logLevel: "silent",
    plugins: [tailwindcss()],
    build: {
      write: false,
      minify: false,
      cssMinify: false,
      rollupOptions: { input: path.join(consumerRoot, `${name}.html`) },
    },
  });
  const outputs = (Array.isArray(result) ? result : [result as { output: unknown[] }]).flatMap(
    (r) => (r as { output: any[] }).output,
  );
  const assets = outputs.filter((o) => o.type === "asset");
  const css = assets
    .filter((a) => a.fileName.endsWith(".css"))
    .map((a) => String(a.source))
    .join("\n");
  const fontFiles = assets.filter((a) => a.fileName.endsWith(".woff2")).map((a) => a.fileName);
  return { css, fontFiles };
}
