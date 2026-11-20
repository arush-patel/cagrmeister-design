import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { installMatchMedia } from "./helpers/media";

// Node-environment suites (consumer_build) have no window; only jsdom suites get the stub.
if (typeof window !== "undefined") installMatchMedia();

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
