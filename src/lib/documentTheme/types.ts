export interface DocumentThemeInput {
  primary?: string;
  invoiceColor?: string;
  receiptColor?: string;
  briefAccent?: string;
  unifiedColors?: boolean;
  portalShowLogo?: boolean;
  portalWelcomeMessage?: string;
}

export interface ResolvedDocumentColors {
  primary: string;
  invoiceAccent: string;
  receiptAccent: string;
  briefAccent: string;
  primarySoft: string;
  primaryBorder: string;
  headerTextOnPrimary: string;
  portalPrimary: string;
}

export interface ResolvedDocumentTheme {
  colors: ResolvedDocumentColors;
  showSo1oBadge: boolean;
  showPoweredBy: boolean;
  canCustomize: boolean;
}

export interface PortalBranding {
  showPoweredBy: boolean;
  brandName: string;
  tagline: string | null;
  logoUrl: string | null;
  welcomeMessage: string | null;
  theme: ResolvedDocumentTheme;
}
