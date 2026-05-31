import * as React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Text } from '@react-email/components'
import { main, container, brandBar, h1, text, button, link, footer, divider } from './_brand'

interface InviteEmailProps { siteName: string; siteUrl: string; confirmationUrl: string }

export const InviteEmail = ({ siteName, siteUrl, confirmationUrl }: InviteEmailProps) => (
  <Html lang="th" dir="ltr">
    <Head />
    <Preview>คุณได้รับเชิญเข้าร่วม {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brandBar}>So1o</Text>
        <Heading style={h1}>คุณได้รับคำเชิญ</Heading>
        <Text style={text}>
          คุณได้รับเชิญให้เข้าร่วม <Link href={siteUrl} style={link}>{siteName}</Link>
          กดปุ่มด้านล่างเพื่อยอมรับคำเชิญและสร้างบัญชีของคุณได้เลย
        </Text>
        <Button style={button} href={confirmationUrl}>ยอมรับคำเชิญ</Button>
        <Hr style={divider} />
        <Text style={footer}>
          ถ้าคุณไม่ได้คาดหวังคำเชิญนี้ ลบอีเมลนี้ทิ้งได้เลยครับ<br />
          So1o · solofreelancer.com
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail
