import { describe, expect, it } from "vitest";
import { SevenError } from "./errors";
import { classifySevenError } from "./error-taxonomy";

describe("unified Seven error taxonomy", () => {
  it("normalizes timeout, validation, rate limit, memory and cancellation", () => {
    expect(classifySevenError(new SevenError({ code: "DEADLINE_EXCEEDED", message: "x" })).category).toBe("TIMEOUT");
    expect(classifySevenError(new SevenError({ code: "VALIDATION", message: "x" })).category).toBe("VALIDATION_ERROR");
    expect(classifySevenError(new SevenError({ code: "PROVIDER", message: "x", details: { httpStatus: 429 } })).category).toBe("RATE_LIMIT");
    expect(classifySevenError(new SevenError({ code: "STORAGE", message: "x", details: { domain: "memory" } })).category).toBe("MEMORY_ERROR");
    expect(classifySevenError(new DOMException("Aborted", "AbortError")).category).toBe("CANCELLED");
  });
});
