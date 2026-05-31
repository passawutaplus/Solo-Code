import * as React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { main, container, brandBar, h1, text, button, footer, divider, card, cardLabel, cardRow, brand } from './_brand'

interface PaymentSuccessProps {
  recipientName?: string
  clientName?: string
  projectName?: string
  amount?: number
  currency?: string
  paymentDate?: string
  invoiceNumber?: string
  receiptUrl?: string
}

const formatAmount = (n: number, currency: string) => {
  try {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(n)
  } catch {
    return `${n.toLocaleString('th-TH')} ${currency}`
  }
}

const PaymentSuccessEmail = ({
  recipientName = 'คุณ',
  clientName = 'ลูกค้าของคุณ',
  projectName = 'โปรเจกต์',
  amount = 0,
  currency = 'THB',
  paymentDate = new Date().toLocaleDateString('th-TH'),
  invoiceNumber = '—',
  receiptUrl = 'https://solofreelancer.com',
}: PaymentSuccessProps) => (
  <Html lang="th" dir="ltr">
    <Head />
    <Preview>ได้รับเงินจาก {clientName} เรียบร้อย</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brandBar}>So1o · ชำระเงินสำเร็จ</Text>
        <Heading style={h1}>💰 ได้เงินแล้ว!</Heading>
        <Text style={text}>
          ยินดีด้วยครับ {recipientName} — {clientName} ชำระเงินสำหรับ
          {' '}<strong style={{ color: brand.ink }}>{projectName}</strong> เรียบร้อยแล้ว
        </Text>
        <div style={card}>
          <p style={cardLabel}>จำนวนเงิน</p>
          <p style={{ fontSize: '28px', fontWeight: 700, color: brand.orange, margin: '0 0 18px', letterSpacing: '-0.01em' }}>
            {formatAmount(amount, currency)}
          </p>
          <p style={cardLabel}>ลูกค้า</p>
          <p style={{ ...cardRow, color: brand.ink, fontWeight: 600, margin: '0 0 14px' }}>{clientName}</p>
          <p style={cardLabel}>โปรเจกต์</p>
          <p style={{ ...cardRow, margin: '0 0 14px' }}>{projectName}</p>
          <p style={cardLabel}>เลขที่ใบแจ้งหนี้</p>
          <p style={{ ...cardRow, margin: '0 0 14px' }}>{invoiceNumber}</p>
          <p style={cardLabel}>วันที่ชำระ</p>
          <p style={{ ...cardRow, margin: 0 }}>{paymentDate}</p>
        </div>
        <Button style={button} href={receiptUrl}>ดูใบเสร็จ</Button>
        <Hr style={divider} />
        <Text style={footer}>
          ตัวเลขทั้งหมดเป็นการคำนวณเบื้องต้น โปรดเก็บบันทึกไว้สำหรับการยื่นภาษีนะครับ<br />
          So1o · เครื่องมือสำหรับฟรีแลนซ์ไทย · solofreelancer.com
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PaymentSuccessEmail,
  subject: (data: Record<string, any>) => {
    const amt = formatAmount(data?.amount ?? 0, data?.currency ?? 'THB')
    return `[So1o] ได้รับเงินแล้ว ${amt} จาก ${data?.clientName ?? 'ลูกค้า'}`
  },
  displayName: 'Payment success',
  previewData: {
    recipientName: 'พี่บอส',
    clientName: 'บริษัท Sundae Cafe จำกัด',
    projectName: 'Rebrand & Logo Design',
    amount: 25000,
    currency: 'THB',
    paymentDate: '27 พ.ค. 2026',
    invoiceNumber: 'INV-2026-0042',
    receiptUrl: 'https://solofreelancer.com/dashboard/invoices',
  },
} satisfies TemplateEntry

export default PaymentSuccessEmail
