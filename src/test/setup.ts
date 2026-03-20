import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Ensure each test starts from a clean DOM state.
afterEach(() => {
  cleanup();
});
