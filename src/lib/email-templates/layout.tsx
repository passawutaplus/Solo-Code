import * as React from 'react'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Text,
} from '@react-email/components'
import { SITE_NAME, SITE_URL } from '@/lib/siteUrl'
import { brand, main, container, h1, text, footer, divider, brandBar, button, link } from './_brand'

export type BadgeTone = 'brand' | 'warning' | 'success' | 'neutral'

const badgeTones: Record<BadgeTone, React.CSSProperties> = {
  brand: brandBar,
  warning: { ...brandBar, background: '#DC2626' },
  success: { ...brandBar, background: `linear-gradient(90deg, #059669 0%, #34D399 100%)` },
  neutral: { ...brandBar, background: brand.ink },
}

const outerWrap = {
  backgroundColor: brand.surface,
  margin: 0,
  padding: '32px 16px',
} as const

const innerCard = {
  ...container,
  borderRadius: '20px',
  padding: '0',
  overflow: 'hidden' as const,
  boxShadow: '0 4px 24px rgba(15,15,15,0.06)',
}

const topAccent = {
  height: '4px',
  background: `linear-gradient(90deg, ${brand.orange} 0%, ${brand.orangeLight} 50%, ${brand.orange} 100%)`,
  margin: 0,
} as const

const bodyPad = {
  padding: '36px 32px 32px',
} as const

const wordmark = {
  fontSize: '22px',
  fontWeight: 700 as const,
  letterSpacing: '-0.03em',
  margin: '0 0 20px',
  color: brand.ink,
} as const

const wordmarkAccent = {
  background: `linear-gradient(90deg, ${brand.orange} 0%, ${brand.orangeLight} 100%)`,
  WebkitBackgroundClip: 'text',
  color: 'transparent',
} as const

export interface EmailLayoutProps {
  preview: string
  badge?: string
  badgeTone?: BadgeTone
  title: string
  children: React.ReactNode
  footerNote?: string
  unsubscribeUrl?: string
}

export function EmailLayout({
  preview,
  badge,
  badgeTone = 'brand',
  title,
  children,
  footerNote,
  unsubscribeUrl,
}: EmailLayoutProps) {
  return (
    <Html lang="th" dir="ltr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={outerWrap}>
          <Container style={innerCard}>
            <div style={topAccent} />
            <div style={bodyPad}>
              <Text style={wordmark}>
                <span style={wordmarkAccent}>So1o</span>
                {' '}Freelancer
              </Text>
              {badge ? <Text style={badgeTones[badgeTone]}>{badge}</Text> : null}
              <Heading style={h1}>{title}</Heading>
              {children}
              <Hr style={divider} />
              <Text style={footer}>
                {footerNote ?? (
                  <>
                    {SITE_NAME} · เครื่องมือสำหรับฟรีแลนซ์ไทย ·{' '}
                    <Link href={SITE_URL} style={link}>solofreelancer.com</Link>
                  </>
                )}
                {unsubscribeUrl ? (
                  <>
                    <br />
                    <Link href={unsubscribeUrl} style={{ ...link, fontWeight: 400, fontSize: '11px' }}>
                      ยกเลิกรับอีเมลแจ้งเตือน
                    </Link>
                  </>
                ) : null}
              </Text>
            </div>
          </Container>
        </Container>
      </Body>
    </Html>
  )
}

export function EmailCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: brand.surface,
      border: `1px solid ${brand.border}`,
      borderRadius: '14px',
      padding: '20px 22px',
      margin: '0 0 24px',
    }}>
      {children}
    </div>
  )
}

export function EmailCardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      color: brand.mute,
      fontSize: '11px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      margin: '0 0 4px',
      fontWeight: 600,
    }}>
      {children}
    </p>
  )
}

export function EmailCardRow({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <p style={{
      fontSize: '14px',
      color: highlight ? brand.orange : brand.body,
      fontWeight: highlight ? 700 : 400,
      margin: '0 0 10px',
      lineHeight: '1.5',
    }}>
      {children}
    </p>
  )
}

export function EmailButton({ href, children }: { href: string; children: React.ReactNode }) {
  return <Button style={button} href={href}>{children}</Button>
}

export function EmailText({ children, small }: { children: React.ReactNode; small?: boolean }) {
  return <Text style={small ? { ...text, fontSize: '13px' } : text}>{children}</Text>
}

export { text, link, brand }
