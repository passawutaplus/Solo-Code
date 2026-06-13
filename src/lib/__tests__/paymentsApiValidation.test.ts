import { describe, it, expect } from "vitest";
import {
  assertAllowedPaymentRedirectUrl,
  getAllowedPaymentRedirectOrigins,
} from "../paymentsApiValidation";

describe("assertAllowedPaymentRedirectUrl", () => {
  it("allows canonical production origin", () => {
    expect(assertAllowedPaymentRedirectUrl("https://solofreelancer.com/dashboard?ok=1")).toContain(
      "solofreelancer.com",
    );
  });

  it("allows localhost in dev", () => {
    expect(assertAllowedPaymentRedirectUrl("http://localhost:5173/pricing")).toContain("localhost");
  });

  it("blocks external open redirect", () => {
    expect(() => assertAllowedPaymentRedirectUrl("https://evil.com/phish")).toThrow(
      /not allowed/i,
    );
  });

  it("blocks javascript scheme", () => {
    expect(() => assertAllowedPaymentRedirectUrl("javascript:alert(1)")).toThrow();
  });
});

describe("getAllowedPaymentRedirectOrigins", () => {
  it("includes static production origins", () => {
    const origins = getAllowedPaymentRedirectOrigins();
    expect(origins).toContain("https://solofreelancer.com");
  });
});
