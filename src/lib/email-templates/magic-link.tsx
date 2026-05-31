import * as React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import { main, container, brandBar, h1, text, button, footer, divider } from './_brand'

interface MagicLinkEmailProps { siteName: string; confirmationUrl: string }

export const MagicLinkEmail = ({ siteName, confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="th" dir="ltr">
    <Head />
    <Preview>ลิงก์เข้าสู่ระบบของคุณ — {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brandBar}>So1o</Text>
        <Heading style={h1}>เข้าสู่ระบบด่วน</Heading>
        <Text style={text}>
          กดปุ่มด้านล่างเพื่อเข้าสู่ระบบ {siteName} โดยไม่ต้องใช้รหัสผ่าน
          ลิงก์นี้ใช้ได้ครั้งเดียวและจะหมดอายุภายใน 1 ชั่วโมงนะครับ
        </Text>
        <Button style={button} href={confirmationUrl}>เข้าสู่ระบบ</Button>
        <Hr style={divider} />
        <Text style={footer}>
          ถ้าคุณไม่ได้ขอลิงก์นี้ ลบอีเมลนี้ทิ้งได้เลยครับ บัญชีของคุณยังปลอดภัยดี<br />
          So1o · solofreelancer.com
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail
