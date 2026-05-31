import * as React from 'react'
import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import { main, container, brandBar, h1, text, code, footer, divider } from './_brand'

interface ReauthenticationEmailProps { token: string }

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="th" dir="ltr">
    <Head />
    <Preview>รหัสยืนยันตัวตนของคุณ</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brandBar}>So1o</Text>
        <Heading style={h1}>ยืนยันตัวตนอีกครั้ง</Heading>
        <Text style={text}>กรอกรหัสด้านล่างเพื่อยืนยันว่าเป็นคุณนะครับ:</Text>
        <Text style={code}>{token}</Text>
        <Hr style={divider} />
        <Text style={footer}>
          รหัสนี้จะหมดอายุภายในไม่กี่นาที ห้ามแชร์ให้คนอื่นเด็ดขาด<br />
          So1o · solofreelancer.com
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail
