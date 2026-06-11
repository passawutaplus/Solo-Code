import * as React from 'react'
import { EmailLayout, EmailButton, EmailText } from './layout'

interface MagicLinkEmailProps { siteName: string; confirmationUrl: string }

export const MagicLinkEmail = ({ siteName, confirmationUrl }: MagicLinkEmailProps) => (
  <EmailLayout
    preview={`ลิงก์เข้าสู่ระบบของคุณ — ${siteName}`}
    badge="เข้าสู่ระบบ"
    icon="mail"
    title="เข้าสู่ระบบด่วน"
    footerNote="ถ้าคุณไม่ได้ขอลิงก์นี้ ลบอีเมลนี้ทิ้งได้เลยครับ บัญชีของคุณยังปลอดภัยดี"
  >
    <EmailText>
      กดปุ่มด้านล่างเพื่อเข้าสู่ระบบ {siteName} โดยไม่ต้องใช้รหัสผ่าน
      ลิงก์นี้ใช้ได้ครั้งเดียวและจะหมดอายุภายใน 1 ชั่วโมงนะครับ
    </EmailText>
    <EmailButton href={confirmationUrl}>เข้าสู่ระบบ</EmailButton>
  </EmailLayout>
)

export default MagicLinkEmail
