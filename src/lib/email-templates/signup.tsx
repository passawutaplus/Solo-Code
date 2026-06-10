import * as React from 'react'
import { Link } from '@react-email/components'
import { EmailLayout, EmailButton, EmailText, link } from './layout'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({ siteName, siteUrl, recipient, confirmationUrl }: SignupEmailProps) => (
  <EmailLayout
    preview={`ยืนยันอีเมลของคุณกับ ${siteName}`}
    badge="So1o · ยืนยันอีเมล"
    title="ยินดีต้อนรับสู่ครอบครัวฟรีแลนซ์"
    footerNote={
      <>
        ถ้าคุณไม่ได้สมัครบัญชี ไม่ต้องทำอะไรครับ — อีเมลนี้จะหมดอายุภายในไม่กี่ชั่วโมง<br />
        So1o · solofreelancer.com
      </>
    }
  >
    <EmailText>
      ขอบคุณที่สมัครใช้งาน <Link href={siteUrl} style={link}>{siteName}</Link> ครับ
      กดปุ่มด้านล่างเพื่อยืนยันอีเมล <strong>{recipient}</strong> แล้วเริ่มจัดการงานฟรีแลนซ์ได้เลย
    </EmailText>
    <EmailButton href={confirmationUrl}>ยืนยันอีเมลของฉัน</EmailButton>
  </EmailLayout>
)

export default SignupEmail
