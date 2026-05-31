import * as React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { main, container, brandBar, h1, text, button, footer, divider } from './_brand'

interface PastDueProps {
  priceId?: string
}

const PastDueEmail = ({ priceId = 'pro' }: PastDueProps) => (
  <Html lang="th" dir="ltr">
    <Head />
    <Preview>⚠️ การชำระเงินไม่สำเร็จ — กรุณาอัปเดตวิธีชำระเงิน</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={{ ...brandBar, background: '#DC2626' }}>So1o · แจ้งเตือนการชำระเงิน</Text>
        <Heading style={h1}>⚠️ บัตรเครดิตของคุณถูกปฏิเสธ</Heading>
        <Text style={text}>
          เราพยายามตัดเงินรอบบิลของแพ็กเกจ <strong>{priceId}</strong> แต่ไม่สำเร็จ
          เพื่อไม่ให้บัญชีถูกระงับ กรุณาอัปเดตช่องทางชำระเงินภายใน 7 วัน
        </Text>
        <Text style={text}>
          ระหว่างนี้คุณยังใช้งานได้ตามปกติ — Stripe จะลองตัดเงินอัตโนมัติอีก 2-3 ครั้ง
        </Text>
        <Button style={{ background: '#DC2626', color: '#fff', fontSize: '15px', fontWeight: 600, borderRadius: '12px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }} href="https://solofreelancer.com/pricing">
          อัปเดตวิธีชำระเงิน
        </Button>
        <Hr style={divider} />
        <Text style={footer}>ติดปัญหา? ตอบกลับเมลนี้ได้เลยครับ · So1o · solofreelancer.com</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PastDueEmail,
  subject: () => `⚠️ [So1o] การชำระเงินไม่สำเร็จ — โปรดอัปเดตบัตร`,
  displayName: 'Subscription past due',
  previewData: { priceId: 'pro_monthly' },
} satisfies TemplateEntry

export default PastDueEmail
