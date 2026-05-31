import * as React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { main, container, brandBar, h1, text, button, footer, divider, card, cardLabel, cardRow, brand } from './_brand'

interface ProjectAlertProps {
  recipientName?: string
  projectName?: string
  alertType?: 'deadline' | 'comment' | 'status' | 'analysis_complete'
  message?: string
  actionUrl?: string
  dueDate?: string
}

const ALERT_LABEL: Record<NonNullable<ProjectAlertProps['alertType']>, string> = {
  deadline: 'ใกล้ครบกำหนด',
  comment: 'มีคอมเมนต์ใหม่',
  status: 'อัปเดตสถานะ',
  analysis_complete: 'วิเคราะห์บรีฟเสร็จแล้ว',
}

const ProjectAlertEmail = ({
  recipientName = 'คุณ',
  projectName = 'โปรเจกต์ของคุณ',
  alertType = 'status',
  message = 'มีความเคลื่อนไหวใหม่ในโปรเจกต์ของคุณ',
  actionUrl = 'https://solofreelancer.com',
  dueDate,
}: ProjectAlertProps) => (
  <Html lang="th" dir="ltr">
    <Head />
    <Preview>{ALERT_LABEL[alertType]} — {projectName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brandBar}>So1o · แจ้งเตือนโปรเจกต์</Text>
        <Heading style={h1}>{ALERT_LABEL[alertType]}</Heading>
        <Text style={text}>
          สวัสดีครับ {recipientName} — มีอัปเดตจากโปรเจกต์ <strong style={{ color: brand.ink }}>{projectName}</strong> ที่คุณควรดูครับ
        </Text>
        <div style={card}>
          <p style={cardLabel}>โปรเจกต์</p>
          <p style={{ ...cardRow, color: brand.ink, fontWeight: 600, margin: '0 0 14px' }}>{projectName}</p>
          <p style={cardLabel}>รายละเอียด</p>
          <p style={{ ...cardRow, margin: dueDate ? '0 0 14px' : 0 }}>{message}</p>
          {dueDate ? (
            <>
              <p style={cardLabel}>กำหนดส่ง</p>
              <p style={{ ...cardRow, color: brand.orange, fontWeight: 600, margin: 0 }}>{dueDate}</p>
            </>
          ) : null}
        </div>
        <Button style={button} href={actionUrl}>เปิดดูโปรเจกต์</Button>
        <Hr style={divider} />
        <Text style={footer}>
          คุณได้รับอีเมลนี้เพราะมีกิจกรรมใหม่ในโปรเจกต์ของคุณ<br />
          So1o · solofreelancer.com
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ProjectAlertEmail,
  subject: (data: Record<string, any>) => {
    const t = (data?.alertType ?? 'status') as keyof typeof ALERT_LABEL
    const name = data?.projectName ?? 'โปรเจกต์ของคุณ'
    return `[So1o] ${ALERT_LABEL[t] ?? 'แจ้งเตือนโปรเจกต์'} — ${name}`
  },
  displayName: 'Project alert',
  previewData: {
    recipientName: 'พี่บอส',
    projectName: 'Rebrand ร้านกาแฟ Sundae',
    alertType: 'deadline',
    message: 'งานออกแบบโลโก้รอบ Final ใกล้ครบกำหนดส่งแล้ว เหลืออีก 2 วัน',
    actionUrl: 'https://solofreelancer.com/dashboard',
    dueDate: '28 พ.ค. 2026',
  },
} satisfies TemplateEntry

export default ProjectAlertEmail
