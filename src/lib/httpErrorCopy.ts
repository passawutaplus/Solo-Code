export type HttpErrorKind = "404" | "500" | "503" | "generic" | "article" | "token";

export type HttpErrorCopy = {
  code: number;
  titleTh: string;
  titleEn: string;
  descTh: string;
  descEn: string;
  taglineTh: string;
  taglineEn: string;
  hintTh?: string;
  hintEn?: string;
};

export const HTTP_ERROR_COPY: Record<HttpErrorKind, HttpErrorCopy> = {
  "404": {
    code: 404,
    titleTh: "อุ๊ปส์ หาไม่เจอหน้านี้นะ",
    titleEn: "Oops — we can't find this page",
    descTh: "ลิงก์อาจพิมพ์ผิด หน้าถูกย้าย หรืออาจถูกลบไปแล้ว ลองกลับไปหน้าแรก หรือเช็ก URL อีกทีนะ",
    descEn: "The link might be wrong, the page may have moved, or it could have been removed.",
    taglineTh: "หน้านี้ไม่มีอยู่จริง — ไม่เป็นไร กลับไปทางอื่นได้",
    taglineEn: "This page isn't here — no worries, you can go another way",
    hintTh: "ถ้ามั่นใจว่าหน้านี้ควรมีอยู่ แจ้งเราได้เลย — เราจะช่วยตามให้",
    hintEn: "If you're sure this page should exist, let us know — we'll look into it.",
  },
  "500": {
    code: 500,
    titleTh: "ขอโทษด้วยนะ มีบางอย่างขัดข้อง",
    titleEn: "Sorry — something went wrong on our end",
    descTh:
      "ระบบเจอปัญหาที่เราไม่ได้คาดไว้ ทีมงานได้รับแจ้งแล้วและกำลังรีบแก้ให้ ลองรีเฟรชหรือกลับมาใหม่อีกสักครู่นะ",
    descEn: "We hit an unexpected issue. Our team has been notified and is working on a fix.",
    taglineTh: "ฝั่งเรามีปัญหา — กำลังรีบแก้อยู่",
    taglineEn: "Something broke on our side — we're on it",
    hintTh: "ถ้ายังไม่หาย ส่งข้อความมาหาเราได้ — เราจะช่วยดูให้เร็วที่สุด",
    hintEn: "If it keeps happening, reach out — we'll help as soon as we can.",
  },
  "503": {
    code: 503,
    titleTh: "พักแป๊บนะ กำลังปรับปรุงระบบอยู่",
    titleEn: "Hang tight — we're updating things",
    descTh: "เรากำลังอัปเดตเพื่อให้ So1o ทำงานได้ลื่นขึ้น ไม่นานหรอก กลับมาใหม่ในอีกสักครู่นะ",
    descEn: "We're making updates so So1o runs smoother for you.",
    taglineTh: "ปรับปรุงระบบชั่วคราว — รอแป๊บเดียว",
    taglineEn: "Temporarily down for maintenance — just a moment",
    hintTh: "ขอบคุณที่รอ — เราจะรีบให้กลับมาใช้งานได้เร็วที่สุด",
    hintEn: "Thanks for your patience — we'll be back up as soon as possible.",
  },
  generic: {
    code: 0,
    titleTh: "โหลดหน้านี้ไม่สำเร็จ",
    titleEn: "This page didn't load",
    descTh: "อาจเป็นเพราะเน็ตชั่วคราว หรือข้อมูลยังโหลดไม่ครบ ลองกดลองใหม่อีกครั้งนะ",
    descEn: "It could be a spotty connection or data that didn't finish loading.",
    taglineTh: "ลองอีกครั้ง — มักจะหายเอง",
    taglineEn: "Try again — it often clears up on its own",
    hintTh: "ถ้ายังไม่ได้ เราพร้อมช่วยดูให้",
    hintEn: "Still stuck? We're happy to help.",
  },
  article: {
    code: 404,
    titleTh: "ไม่พบบทความนี้",
    titleEn: "Article not found",
    descTh: "บทความอาจถูกลบ ยังไม่เผยแพร่ หรือลิงก์อาจหมดอายุแล้ว",
    descEn: "It may have been removed, isn't published yet, or the link has expired.",
    taglineTh: "ลองกลับไปหน้ารวมบทความ",
    taglineEn: "Head back to all articles",
    hintTh: "ถ้าคิดว่าเป็นข้อผิดพลาด แจ้งทีมงานได้เลย",
    hintEn: "If you think this is a mistake, let our team know.",
  },
  token: {
    code: 404,
    titleTh: "ลิงก์นี้ใช้ไม่ได้แล้ว",
    titleEn: "This link isn't valid anymore",
    descTh: "ลิงก์อาจหมดอายุ ถูกปิด หรือพิมพ์ไม่ครบ ถ้าเป็นของคุณ ลองขอลิงก์ใหม่จากผู้ส่งได้เลย",
    descEn: "The link may have expired, been closed, or the URL might be incomplete.",
    taglineTh: "ขอลิงก์ใหม่จากผู้ส่งได้เลย",
    taglineEn: "Ask the sender for a new link if you need one",
    hintTh: "ถ้ายังมีปัญหา แจ้งเราได้ — เราจะช่วยตรวจสอบ",
    hintEn: "Still having trouble? We can take a look.",
  },
};

export function resolveErrorKind(code?: number, kind?: HttpErrorKind): HttpErrorKind {
  if (kind) return kind;
  if (code === 404) return "404";
  if (code === 503) return "503";
  if (code && code >= 500) return "500";
  return "generic";
}
