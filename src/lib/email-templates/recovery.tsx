import * as React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import { main, container, brandBar, h1, text, button, footer, divider } from './_brand'

interface RecoveryEmailProps { siteName: string; confirmationUrl: string }

export const RecoveryEmail = ({ siteName, confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="th" dir="ltr">
    <Head />
    <Preview>รีเซ็ตรหัสผ่าน {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brandBar}>So1o</Text>
        <Heading style={h1}>รีเซ็ตรหัสผ่านของคุณ</Heading>
        <Text style={text}>
          มีคำขอรีเซ็ตรหัสผ่านบัญชี {siteName} ของคุณเข้ามา
          กดปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่ ลิงก์ใช้ได้ครั้งเดียวและจะหมดอายุภายใน 1 ชั่วโมง
        </Text>
        <Button style={button} href={confirmationUrl}>ตั้งรหัสผ่านใหม่</Button>
        <Hr style={divider} />
        <Text style={footer}>
          ถ้าคุณไม่ได้ขอรีเซ็ต ไม่ต้องทำอะไรครับ รหัสผ่านเดิมยังใช้งานได้ตามปกติ<br />
          So1o · solofreelancer.com
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
