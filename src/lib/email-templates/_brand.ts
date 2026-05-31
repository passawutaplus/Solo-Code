// So1o brand styles for emails (white body + orange gradient accents).
// Email clients have limited CSS support — keep everything inline-safe.

export const brand = {
  orange: '#FF5F05',
  orangeLight: '#FF9F67',
  ink: '#0F0F0F',
  body: '#4A4A4A',
  mute: '#9CA3AF',
  border: '#F0EFEC',
  surface: '#FAFAF9',
  white: '#FFFFFF',
} as const

export const main = {
  backgroundColor: brand.white,
  fontFamily:
    "'Inter','Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif",
  margin: 0,
  padding: '24px 0',
}

export const container = {
  backgroundColor: brand.white,
  border: `1px solid ${brand.border}`,
  borderRadius: '16px',
  padding: '40px 32px',
  maxWidth: '560px',
  margin: '0 auto',
}

export const brandBar = {
  display: 'inline-block',
  background: `linear-gradient(90deg, ${brand.orange} 0%, ${brand.orangeLight} 100%)`,
  color: brand.white,
  fontSize: '11px',
  fontWeight: 700 as const,
  letterSpacing: '0.12em',
  padding: '6px 12px',
  borderRadius: '999px',
  margin: '0 0 24px',
  textTransform: 'uppercase' as const,
}

export const h1 = {
  fontSize: '24px',
  fontWeight: 600 as const,
  color: brand.ink,
  margin: '0 0 16px',
  letterSpacing: '-0.01em',
  lineHeight: '1.25',
}

export const text = {
  fontSize: '15px',
  color: brand.body,
  lineHeight: '1.6',
  margin: '0 0 20px',
}

export const button = {
  background: `linear-gradient(90deg, ${brand.orange} 0%, ${brand.orangeLight} 100%)`,
  color: brand.white,
  fontSize: '15px',
  fontWeight: 600 as const,
  borderRadius: '12px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
  letterSpacing: '0.01em',
}

export const link = { color: brand.orange, textDecoration: 'none', fontWeight: 600 as const }

export const code = {
  fontFamily: "'JetBrains Mono','Courier New',monospace",
  fontSize: '28px',
  fontWeight: 700 as const,
  color: brand.ink,
  letterSpacing: '0.25em',
  background: brand.surface,
  padding: '20px 24px',
  borderRadius: '12px',
  border: `1px solid ${brand.border}`,
  margin: '0 0 28px',
  textAlign: 'center' as const,
}

export const card = {
  backgroundColor: brand.surface,
  border: `1px solid ${brand.border}`,
  borderRadius: '12px',
  padding: '20px 24px',
  margin: '0 0 24px',
}

export const cardRow = {
  fontSize: '14px',
  color: brand.body,
  margin: '0 0 8px',
}

export const cardLabel = {
  color: brand.mute,
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  margin: '0 0 4px',
}

export const footer = {
  fontSize: '12px',
  color: brand.mute,
  margin: '32px 0 0',
  lineHeight: '1.5',
  textAlign: 'center' as const,
}

export const divider = {
  border: 'none',
  borderTop: `1px solid ${brand.border}`,
  margin: '28px 0',
}
