/** Session keys for cross-app quotation handoff (Anthem → So1o). */

export const ANTHEM_QUOTATION_HANDOFF_KEY = "so1o.openQuotationFromAnthem";

export type AnthemQuotationHandoff = {
  projectName: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  notes?: string;
  endDate?: string;
  ecosystemLinkId?: string;
  conversationId?: string;
  requestId?: string;
};

export const ANTHEM_HANDOFF_EVENT = "so1o:anthem-handoff";

export function storeAnthemQuotationHandoff(payload: AnthemQuotationHandoff): void {
  try {
    sessionStorage.setItem(ANTHEM_QUOTATION_HANDOFF_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent(ANTHEM_HANDOFF_EVENT));
  } catch {
    /* noop */
  }
}

export function consumeAnthemQuotationHandoff(): AnthemQuotationHandoff | null {
  try {
    const raw = sessionStorage.getItem(ANTHEM_QUOTATION_HANDOFF_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(ANTHEM_QUOTATION_HANDOFF_KEY);
    return JSON.parse(raw) as AnthemQuotationHandoff;
  } catch {
    return null;
  }
}

/** Parse Anthem deep-link query params from dashboard URL. */
export function parseAnthemDashboardParams(search: string): {
  fromAnthem: boolean;
  conversationId?: string;
  requestId?: string;
  clientName?: string;
  projectTitle?: string;
  clientEmail?: string;
  clientPhone?: string;
  message?: string;
  deadline?: string;
  linkId?: string;
} {
  const sp = new URLSearchParams(search);
  if (sp.get("from") !== "anthem") {
    return { fromAnthem: false };
  }
  return {
    fromAnthem: true,
    conversationId: sp.get("conversation_id") ?? undefined,
    requestId: sp.get("request_id") ?? undefined,
    clientName: sp.get("client_name") ?? undefined,
    projectTitle: sp.get("project_title") ?? undefined,
    clientEmail: sp.get("client_email") ?? undefined,
    clientPhone: sp.get("client_phone") ?? undefined,
    message: sp.get("message") ?? undefined,
    deadline: sp.get("deadline") ?? undefined,
    linkId: sp.get("link_id") ?? undefined,
  };
}
