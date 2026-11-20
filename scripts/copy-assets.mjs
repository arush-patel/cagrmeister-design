import { cpSync, rmSync } from "node:fs";

rmSync("dist/css", { recursive: true, force: true });
cpSync("src/css", "dist/css", { recursive: true });
