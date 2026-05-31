import * as React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { main, container, brandBar, h1, text, button, footer, divider, card, cardLabel, cardRow, brand } from './_brand'

interface ReceiptProps {
  amount?: string
  currency?: string
  nextBillingDate?: string | null
  invoiceUrl?: string | null
}

const fmtDate = (iso?: string | null) => {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) }
  catch { return iso }
}

const ReceiptEmail = ({ amount = '0', currency = 'THB', nextBillingDate = null, invoiceUrl = null }: ReceiptProps) => (
  <Html lang="th" dir="ltr">
    <Head />
    <Preview>ใบเสร็จ So1o — {amount} {currency}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brandBar}>So1o · ใบเสร็จ</Text>
        <Heading style={h1}>ขอบคุณสำหรับการต่ออายุ</Heading>
        <Text style={text}>การชำระเงินรอบบิลของคุณสำเร็จเรียบร้อยครับ</Text>
        <div style={card}>
          <p style={cardLabel}>จำนวนเงิน</p>
          <p style={{ fontSize: '24px', fontWeight: 700, color: brand.orange, margin: '0 0 16px' }}>
            {amount} {currency}
          </p>
          <p style={cardLabel}>วันต่ออายุครั้งถัดไป</p>
          <p style={{ ...cardRow, color: brand.ink, margin: 0 }}>{fmtDate(nextBillingDate)}</p>
        </div>
        {invoiceUrl ? <Button style={button} href={invoiceUrl}>ดูใบเสร็จเต็ม</Button> : null}
        <Hr style={divider} />
        <Text style={footer}>
          ยกเลิกหรือเปลี่ยนวิธีชำระเงินได้ที่หน้า Pricing → จัดการ Subscription<br />
          So1o · solofreelancer.com
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ReceiptEmail,
  subject: (data: Record<string, any>) => `[So1o] ใบเสร็จ ${data?.amount ?? '0'} ${data?.currency ?? 'THB'}`,
  displayName: 'Payment receipt',
  previewData: { amount: '249.00', currency: 'THB', nextBillingDate: '2026-06-27', invoiceUrl: 'https://example.com/inv' },
} satisfies TemplateEntry

export default ReceiptEmail
