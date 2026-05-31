import * as React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { main, container, brandBar, h1, text, button, footer, divider, card, cardLabel, cardRow, brand } from './_brand'

interface CreditsTopupProps {
  credits?: number
  balance?: number
  priceId?: string
}

const CreditsTopupEmail = ({ credits = 0, balance = 0 }: CreditsTopupProps) => (
  <Html lang="th" dir="ltr">
    <Head />
    <Preview>{`เติมเครดิตสำเร็จ +${credits} (ยอดรวม ${balance})`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brandBar}>So1o · เติมเครดิตสำเร็จ</Text>
        <Heading style={h1}>⚡ +{credits} AI Credits</Heading>
        <Text style={text}>การเติมเครดิตของคุณเรียบร้อยแล้ว ใช้งาน AI Mentor / Brief / Image ได้ทันที</Text>
        <div style={card}>
          <p style={cardLabel}>ยอดเครดิตปัจจุบัน</p>
          <p style={{ fontSize: '36px', fontWeight: 700, color: brand.orange, margin: '4px 0 0' }}>
            {balance.toLocaleString('th-TH')}
          </p>
        </div>
        <Button style={button} href="https://solofreelancer.com/dashboard">เปิด Dashboard</Button>
        <Hr style={divider} />
        <Text style={footer}>เครดิตไม่หมดอายุ · So1o · solofreelancer.com</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: CreditsTopupEmail,
  subject: (data: Record<string, any>) => `[So1o] เติมเครดิตสำเร็จ +${data?.credits ?? 0}`,
  displayName: 'Credits top-up',
  previewData: { credits: 500, balance: 1200, priceId: 'credits_500' },
} satisfies TemplateEntry

export default CreditsTopupEmail
