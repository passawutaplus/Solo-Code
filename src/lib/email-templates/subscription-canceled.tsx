import * as React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { main, container, brandBar, h1, text, button, footer, divider, brand } from './_brand'

interface CanceledProps {
  endsAt?: string | null
}

const fmtDate = (iso?: string | null) => {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) }
  catch { return iso }
}

const CanceledEmail = ({ endsAt = null }: CanceledProps) => (
  <Html lang="th" dir="ltr">
    <Head />
    <Preview>ยืนยันการยกเลิก subscription — คุณยังใช้งานได้ถึง {fmtDate(endsAt)}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brandBar}>So1o · ยืนยันการยกเลิก</Text>
        <Heading style={h1}>ขอบคุณที่อยู่กับเรามาตลอด</Heading>
        <Text style={text}>
          เราได้รับคำขอยกเลิก subscription ของคุณเรียบร้อยแล้ว
        </Text>
        <Text style={text}>
          คุณยังสามารถใช้งานฟีเจอร์ Pro ได้จนถึงวันที่{' '}
          <strong style={{ color: brand.orange }}>{fmtDate(endsAt)}</strong>{' '}
          หลังจากนั้นบัญชีจะกลับสู่ Free Plan โดยอัตโนมัติ — ข้อมูลของคุณยังอยู่ครบ
        </Text>
        <Button style={button} href="https://solofreelancer.com/pricing">กลับมาเป็นสมาชิกอีกครั้ง</Button>
        <Hr style={divider} />
        <Text style={footer}>
          มีข้อเสนอแนะอยากบอกเรา? ตอบกลับเมลนี้ได้เลย — เราอ่านทุกฉบับครับ<br />
          So1o · solofreelancer.com
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: CanceledEmail,
  subject: () => `[So1o] ยืนยันยกเลิก subscription`,
  displayName: 'Subscription canceled',
  previewData: { endsAt: '2026-06-27' },
} satisfies TemplateEntry

export default CanceledEmail
