import * as React from 'react'
import { EmailLayout, EmailButton, EmailText } from './layout'

interface RecoveryEmailProps { siteName: string; confirmationUrl: string }

export const RecoveryEmail = ({ siteName, confirmationUrl }: RecoveryEmailProps) => (
  <EmailLayout
    preview={`รีเซ็ตรหัสผ่าน ${siteName}`}
    badge="So1o · รีเซ็ตรหัสผ่าน"
    title="รีเซ็ตรหัสผ่านของคุณ"
    footerNote={
      <>
        ถ้าคุณไม่ได้ขอรีเซ็ต ไม่ต้องทำอะไรครับ รหัสผ่านเดิมยังใช้งานได้ตามปกติ<br />
        So1o · solofreelancer.com
      </>
    }
  >
    <EmailText>
      มีคำขอรีเซ็ตรหัสผ่านบัญชี {siteName} ของคุณเข้ามา
      กดปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่ ลิงก์ใช้ได้ครั้งเดียวและจะหมดอายุภายใน 1 ชั่วโมง
    </EmailText>
    <EmailButton href={confirmationUrl}>ตั้งรหัสผ่านใหม่</EmailButton>
  </EmailLayout>
)

export default RecoveryEmail
