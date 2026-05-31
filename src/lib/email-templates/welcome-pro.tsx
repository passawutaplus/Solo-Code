import * as React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { main, container, brandBar, h1, text, button, footer, divider, card, cardLabel, cardRow, brand } from './_brand'

interface WelcomeProProps {
  priceId?: string
  environment?: string
}

const planLabel = (priceId?: string) => {
  switch (priceId) {
    case 'pro_monthly': return 'Pro (รายเดือน)'
    case 'pro_yearly': return 'Pro (รายปี)'
    case 'inhouse_monthly': return 'In-House (รายเดือน)'
    case 'inhouse_yearly': return 'In-House (รายปี)'
    default: return 'Pro'
  }
}

const WelcomeProEmail = ({ priceId }: WelcomeProProps) => (
  <Html lang="th" dir="ltr">
    <Head />
    <Preview>ยินดีต้อนรับสู่ So1o {planLabel(priceId)} — ปลดล็อกทุกฟีเจอร์แล้ว</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brandBar}>So1o · สมัครสำเร็จ</Text>
        <Heading style={h1}>🎉 ยินดีต้อนรับสู่ {planLabel(priceId)}!</Heading>
        <Text style={text}>
          ขอบคุณที่ไว้วางใจ So1o ครับ — บัญชีของคุณได้รับการอัปเกรดเรียบร้อยแล้ว
          ทุกฟีเจอร์ระดับโปรพร้อมใช้งานทันที
        </Text>
        <div style={card}>
          <p style={cardLabel}>สิ่งที่คุณปลดล็อกได้</p>
          <p style={{ ...cardRow, color: brand.ink, margin: '4px 0 6px' }}>✓ Job Tracker ไม่จำกัด</p>
          <p style={{ ...cardRow, margin: '4px 0 6px' }}>✓ AI Mentor ขั้นสูงไม่จำกัด</p>
          <p style={{ ...cardRow, margin: '4px 0 6px' }}>✓ Content Planner + AI Assist</p>
          <p style={{ ...cardRow, margin: '4px 0 6px' }}>✓ Design Brief แบบมืออาชีพ</p>
          <p style={{ ...cardRow, margin: '4px 0 0' }}>✓ Public Tracking Links ไม่จำกัด</p>
        </div>
        <Button style={button} href="https://solofreelancer.com/dashboard">เปิด Dashboard</Button>
        <Hr style={divider} />
        <Text style={footer}>
          มีข้อสงสัยตอบกลับเมลนี้ได้เลยครับ<br />
          So1o · เครื่องมือสำหรับฟรีแลนซ์ไทย · solofreelancer.com
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeProEmail,
  subject: (data: Record<string, any>) => `[So1o] ยินดีต้อนรับสู่ ${planLabel(data?.priceId)}! 🎉`,
  displayName: 'Welcome Pro',
  previewData: { priceId: 'pro_yearly', environment: 'live' },
} satisfies TemplateEntry

export default WelcomeProEmail
