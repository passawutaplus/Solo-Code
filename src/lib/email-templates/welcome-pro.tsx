import * as React from 'react'
import type { TemplateEntry } from './registry'
import { EmailLayout, EmailCard, EmailCardRow, EmailButton, EmailText } from './layout'

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
  <EmailLayout
    preview={`ยินดีต้อนรับสู่ So1o ${planLabel(priceId)} — ปลดล็อกทุกฟีเจอร์แล้ว`}
    badge="So1o · สมัครสำเร็จ"
    badgeTone="success"
    title={`🎉 ยินดีต้อนรับสู่ ${planLabel(priceId)}!`}
    footerNote={
      <>
        มีข้อสงสัยตอบกลับเมลนี้ได้เลยครับ<br />
        So1o · เครื่องมือสำหรับฟรีแลนซ์ไทย · solofreelancer.com
      </>
    }
  >
    <EmailText>
      ขอบคุณที่ไว้วางใจ So1o ครับ — บัญชีของคุณได้รับการอัปเกรดเรียบร้อยแล้ว
      ทุกฟีเจอร์ระดับโปรพร้อมใช้งานทันที
    </EmailText>
    <EmailCard>
      <EmailCardRow>✓ Job Tracker ไม่จำกัด</EmailCardRow>
      <EmailCardRow>✓ AI Mentor ขั้นสูงไม่จำกัด</EmailCardRow>
      <EmailCardRow>✓ Content Planner + AI Assist</EmailCardRow>
      <EmailCardRow>✓ Design Brief แบบมืออาชีพ</EmailCardRow>
      <EmailCardRow>✓ Public Tracking Links ไม่จำกัด</EmailCardRow>
    </EmailCard>
    <EmailButton href="https://solofreelancer.com/dashboard">เปิด Dashboard</EmailButton>
  </EmailLayout>
)

export const template = {
  component: WelcomeProEmail,
  subject: (data: Record<string, any>) => `[So1o] ยินดีต้อนรับสู่ ${planLabel(data?.priceId)}! 🎉`,
  displayName: 'Welcome Pro',
  previewData: { priceId: 'pro_yearly', environment: 'live' },
} satisfies TemplateEntry

export default WelcomeProEmail
