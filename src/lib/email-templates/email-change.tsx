import * as React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import { main, container, brandBar, h1, text, button, footer, divider, brand } from './_brand'

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({ siteName, oldEmail, newEmail, confirmationUrl }: EmailChangeEmailProps) => (
  <Html lang="th" dir="ltr">
    <Head />
    <Preview>ยืนยันการเปลี่ยนอีเมล {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brandBar}>So1o</Text>
        <Heading style={h1}>ยืนยันการเปลี่ยนอีเมล</Heading>
        <Text style={text}>
          คุณขอเปลี่ยนอีเมลของบัญชี {siteName} จาก
          {' '}<strong style={{ color: brand.ink }}>{oldEmail}</strong>{' '}
          เป็น <strong style={{ color: brand.orange }}>{newEmail}</strong>
        </Text>
        <Button style={button} href={confirmationUrl}>ยืนยันการเปลี่ยนแปลง</Button>
        <Hr style={divider} />
        <Text style={footer}>
          ถ้าคุณไม่ได้เป็นคนทำรายการนี้ โปรดเปลี่ยนรหัสผ่านทันทีเพื่อความปลอดภัย<br />
          So1o · solofreelancer.com
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail
