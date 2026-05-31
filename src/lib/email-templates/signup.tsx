import * as React from 'react'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Text,
} from '@react-email/components'
import { main, container, brandBar, h1, text, button, link, footer, divider } from './_brand'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({ siteName, siteUrl, recipient, confirmationUrl }: SignupEmailProps) => (
  <Html lang="th" dir="ltr">
    <Head />
    <Preview>ยืนยันอีเมลของคุณกับ {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brandBar}>So1o</Text>
        <Heading style={h1}>ยินดีต้อนรับสู่ครอบครัวฟรีแลนซ์</Heading>
        <Text style={text}>
          ขอบคุณที่สมัครใช้งาน <Link href={siteUrl} style={link}>{siteName}</Link> ครับ
          กดปุ่มด้านล่างเพื่อยืนยันอีเมล <strong>{recipient}</strong> แล้วเริ่มจัดการงานฟรีแลนซ์ได้เลย
        </Text>
        <Button style={button} href={confirmationUrl}>ยืนยันอีเมลของฉัน</Button>
        <Hr style={divider} />
        <Text style={footer}>
          ถ้าคุณไม่ได้สมัครบัญชี ไม่ต้องทำอะไรครับ — อีเมลนี้จะหมดอายุภายในไม่กี่ชั่วโมง<br />
          So1o · เครื่องมือสำหรับฟรีแลนซ์ไทย · solofreelancer.com
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
