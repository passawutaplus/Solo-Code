export { SignupEmail } from './signup'
export { InviteEmail } from './invite'
export { MagicLinkEmail } from './magic-link'
export { RecoveryEmail } from './recovery'
export { EmailChangeEmail } from './email-change'
export { ReauthenticationEmail } from './reauthentication'
export { HireRequestEmail } from './hire-request'
export { ChatMessageEmail } from './chat-message'
export { JobMatchEmail } from './job-match'
export { CollabRequestEmail } from './collab-request'
export { GiftReceivedEmail } from './gift-received'
export { FollowEmail } from './follow'
export { JobApplicationEmail } from './job-application'
export { TopupSuccessEmail } from './topup-success'
export { CashoutStatusEmail } from './cashout-status'
export {
  NOTIFICATION_TEMPLATES,
  ANTHEM_NOTIFICATION_SUBJECTS,
  type NotificationTemplateEntry,
} from './registry'
export { SITE_NAME, SITE_URL, CONTACT_EMAIL } from './brandMeta'

export const ANTHEM_AUTH_SUBJECTS: Record<string, string> = {
  signup: 'ยืนยันอีเมลของคุณ — 1PX',
  invite: 'คุณได้รับคำเชิญเข้าร่วม 1PX',
  magiclink: 'ลิงก์เข้าสู่ระบบ 1PX',
  recovery: 'รีเซ็ตรหัสผ่าน 1PX',
  email_change: 'ยืนยันการเปลี่ยนอีเมล — 1PX',
  reauthentication: 'รหัสยืนยันตัวตนของคุณ — 1PX',
}
