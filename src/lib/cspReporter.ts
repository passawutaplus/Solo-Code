/**
 * CSP Violation Reporter
 *
 * Listens for `securitypolicyviolation` events fired by the browser when
 * a CSP rule blocks a resource. Logs compact info to console under the
 * `[CSP]` tag so the team can filter in DevTools.
 *
 * Plug into `src/main.tsx` (or root entry) with `installCspReporter()` once.
 *
 * Roll-out plan: see docs/csp-report.md
 */

let installed = false;

export function installCspReporter() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("securitypolicyviolation", (e) => {
    // SecurityPolicyViolationEvent — see https://w3c.github.io/webappsec-csp/
    // Avoid logging too much (PII) — just enough to act on
    // eslint-disable-next-line no-console
    console.warn("[CSP]", {
      blockedURI: e.blockedURI,
      violatedDirective: e.violatedDirective,
      effectiveDirective: e.effectiveDirective,
      sourceFile: e.sourceFile,
      lineNumber: e.lineNumber,
      columnNumber: e.columnNumber,
      disposition: e.disposition, // "enforce" | "report"
      sample: e.sample, // first 40 chars of blocked content (if any)
    });
  });
}
