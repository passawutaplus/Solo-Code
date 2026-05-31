export type InspireCategory =
  | "inspiration"
  | "uiux"
  | "branding"
  | "colors"
  | "assets"
  | "ai"
  | "mockup"
  | "marketing";

export interface InspireResource {
  name: string;
  url: string;
  domain: string;
  description: string;
  category: InspireCategory;
}

export interface CategoryMeta {
  id: "all" | InspireCategory;
  label: string;
  emoji: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: "all", label: "ทั้งหมด", emoji: "✨" },
  { id: "inspiration", label: "Inspiration", emoji: "🌐" },
  { id: "uiux", label: "Web & UI/UX", emoji: "🖥️" },
  { id: "branding", label: "Branding & Graphic", emoji: "🎨" },
  { id: "colors", label: "Colors & Gradients", emoji: "🌈" },
  { id: "assets", label: "Assets & Icons", emoji: "📦" },
  { id: "ai", label: "AI Design", emoji: "🤖" },
  { id: "mockup", label: "Mockups", emoji: "💻" },
  { id: "marketing", label: "Marketing & Copy", emoji: "✍️" },
];

export const RESOURCES: InspireResource[] = [
  // Inspiration (general)
  {
    name: "Pinterest",
    url: "https://www.pinterest.com",
    domain: "pinterest.com",
    description: "คลังแสงไอเดียไร้ขอบเขต เหมาะสำหรับทำ Moodboard ต้นทางของทุกงานสร้างสรรค์",
    category: "inspiration",
  },
  {
    name: "Behance",
    url: "https://www.behance.net",
    domain: "behance.net",
    description: "แหล่งรวมเคสงานดีไซน์ระดับบิ๊กโปรเจกต์ เจาะลึกวิธีคิดแบบ Case Study ของโปรทั่วโลก",
    category: "inspiration",
  },
  {
    name: "Dribbble",
    url: "https://dribbble.com",
    domain: "dribbble.com",
    description: "ชุมชนโชว์งานดีไซน์เน้นความสวยงาม ทันสมัย และเทรนด์ดีไซน์ล่าสุด",
    category: "inspiration",
  },
  {
    name: "Awwwards",
    url: "https://www.awwwards.com",
    domain: "awwwards.com",
    description: "เวทีประกวดเว็บไซต์ที่สวยและล้ำที่สุดในโลก เหมาะสำหรับหาไอเดียดีไซน์ระดับพรีเมียม",
    category: "inspiration",
  },

  // Web & UI/UX
  {
    name: "Mobbin",
    url: "https://mobbin.com",
    domain: "mobbin.com",
    description: "คลังภาพ Screenshot ของแอปจริงระดับโลก เจาะลึก UX/UI Flow ที่ดีที่สุด",
    category: "uiux",
  },
  {
    name: "Land-book",
    url: "https://land-book.com",
    domain: "land-book.com",
    description: "แหล่งรวมดีไซน์หน้าแรก (Landing Page) ที่เน้นการสร้าง Conversion ที่ดีที่สุด",
    category: "uiux",
  },
  {
    name: "Godly",
    url: "https://godly.website",
    domain: "godly.website",
    description: "รวมเว็บไซต์ที่มีแอนิเมชันลื่นไหลและดีไซน์ระดับเทพที่สุดในโลก",
    category: "uiux",
  },
  {
    name: "Lapa Ninja",
    url: "https://www.lapa.ninja",
    domain: "lapa.ninja",
    description: "คลังไอเดีย Landing Page แบ่งหมวดหมู่ตามธุรกิจอย่างละเอียด",
    category: "uiux",
  },
  {
    name: "Dark Mode Design",
    url: "https://darkmodedesign.com",
    domain: "darkmodedesign.com",
    description: "รวมเว็บไซต์โหมดมืด (Dark Mode) ที่ออกแบบแสงและเงามาอย่างสมบูรณ์แบบ",
    category: "uiux",
  },
  {
    name: "Screenlane",
    url: "https://screenlane.com",
    domain: "screenlane.com",
    description: "แจก UI หน้าจอแอปพลิเคชัน ค้นหาตามฟีเจอร์ได้เลย เช่น หน้า Login หรือหน้า Profile",
    category: "uiux",
  },

  // Branding & Graphic
  {
    name: "Savee",
    url: "https://savee.it",
    domain: "savee.it",
    description: "แพลตฟอร์มเซฟรูปภาพและ Inspiration ที่สะอาดตา (ดีไซเนอร์หลายคนใช้แทน Pinterest)",
    category: "branding",
  },
  {
    name: "BP&O",
    url: "https://bpando.org",
    domain: "bpando.org",
    description: "บทความวิเคราะห์งานออกแบบโลโก้และแพ็กเกจจิ้งระดับพรีเมียมทั่วโลก",
    category: "branding",
  },
  {
    name: "Mindsparkle Mag",
    url: "https://mindsparklemag.com",
    domain: "mindsparklemag.com",
    description: "แมกกาซีนออนไลน์รวมงานดีไซน์สไตล์มินิมอลและไฮเอนด์",
    category: "branding",
  },

  // Colors & Type
  {
    name: "Coolors",
    url: "https://coolors.co",
    domain: "coolors.co",
    description: "เครื่องมือเจนโทนสีที่เร็วที่สุดในโลก ช่วยจับคู่สีให้งานออกมาดูแพงและมีมิติ",
    category: "colors",
  },
  {
    name: "Color Hunt",
    url: "https://colorhunt.co",
    domain: "colorhunt.co",
    description: "คลังจานสี (Color Palettes) ที่คนโหวตว่าสวยที่สุด อัปเดตเทรนด์สีทุกวัน",
    category: "colors",
  },
  {
    name: "Khroma",
    url: "https://khroma.co",
    domain: "khroma.co",
    description: "AI ช่วยจับคู่สีตามความชอบของคุณ ได้เฉดสีที่แปลกใหม่และดูแพง",
    category: "colors",
  },
  {
    name: "Grabient",
    url: "https://www.grabient.com",
    domain: "grabient.com",
    description: "รวมโค้ดสีเกรเดี้ยน (Gradient) สวยๆ สามารถก๊อปปี้ CSS ไปใช้ทำเว็บได้ทันที",
    category: "colors",
  },
  {
    name: "Typewolf",
    url: "https://www.typewolf.com",
    domain: "typewolf.com",
    description: "ไบเบิลเรื่องฟอนต์ของดีไซเนอร์ บอกเทรนด์ฟอนต์มาแรงและวิธีจับคู่ฟอนต์",
    category: "colors",
  },
  {
    name: "Fontshare",
    url: "https://www.fontshare.com",
    domain: "fontshare.com",
    description: "คลังฟอนต์ระดับพรีเมียมที่เปิดให้โหลดไปใช้ในงานเชิงพาณิชย์ได้ฟรี 100%",
    category: "colors",
  },

  // Assets & Icons
  {
    name: "Unsplash",
    url: "https://unsplash.com",
    domain: "unsplash.com",
    description: "คลังภาพถ่ายความละเอียดสูงระดับช่างภาพโปร โหลดฟรีและไม่มีค่าลิขสิทธิ์",
    category: "assets",
  },
  {
    name: "Iconify",
    url: "https://iconify.design",
    domain: "iconify.design",
    description: "แหล่งรวมไอคอนเวกเตอร์ที่ใหญ่ที่สุด ค้นหาและดึงไปใช้งานเขียนโค้ดได้ทันที",
    category: "assets",
  },
  {
    name: "Freepik",
    url: "https://www.freepik.com",
    domain: "freepik.com",
    description: "คลังวัตถุดิบกราฟิกยอดฮิต มีครบทั้ง Vector, Mockup 3D และรูปภาพ",
    category: "assets",
  },
  {
    name: "unDraw",
    url: "https://undraw.co",
    domain: "undraw.co",
    description: "ภาพประกอบเวกเตอร์สไตล์มินิมอล สามารถปรับเปลี่ยนสีให้ตรงกับแบรนด์ได้ฟรี",
    category: "assets",
  },
  {
    name: "Lordicon",
    url: "https://lordicon.com",
    domain: "lordicon.com",
    description: "คลังไอคอนแอนิเมชันขยับได้ (Lottie) ช่วยให้งานออกแบบดูมีชีวิตชีวาขึ้น 10 เท่า",
    category: "assets",
  },
  {
    name: "Phosphor Icons",
    url: "https://phosphoricons.com",
    domain: "phosphoricons.com",
    description: "เซ็ตไอคอนคลีนๆ ที่เข้ากับดีไซน์ทุกรูปแบบ (สาย UI/UX นิยมใช้มาก)",
    category: "assets",
  },

  // AI Design
  {
    name: "v0 by Vercel",
    url: "https://v0.dev",
    domain: "v0.dev",
    description: "AI เจนโค้ด UI (React/Tailwind) จากการพิมพ์บรีฟ คัดลอกโค้ดไปแปะในระบบใช้งานได้ทันที",
    category: "ai",
  },
  {
    name: "Relume AI",
    url: "https://www.relume.io",
    domain: "relume.io",
    description: "AI ช่วยวางโครงสร้างเว็บ (Sitemap & Wireframe) พร้อมเขียนคำโฆษณาลง Figma ได้ภายในไม่กี่วินาที",
    category: "ai",
  },
  {
    name: "Uizard",
    url: "https://uizard.io",
    domain: "uizard.io",
    description: "AI อัจฉริยะแปลงภาพสเก็ตช์หรือแคปหน้าจอ ให้กลายเป็นหน้า UI/UX ที่คลิกโต้ตอบได้จริง",
    category: "ai",
  },
  {
    name: "Recraft.ai",
    url: "https://www.recraft.ai",
    domain: "recraft.ai",
    description: "AI เจนงานภาพประกอบเวกเตอร์และไอคอนคมชัด ดาวน์โหลด SVG ไปแก้ต่อใน Figma ได้ฟรี",
    category: "ai",
  },
  {
    name: "Kittl AI",
    url: "https://www.kittl.com",
    domain: "kittl.com",
    description: "AI ช่วยออกแบบลายเสื้อ โลโก้ และตัวอักษรศิลป์ (Typography) พร้อมเทมเพลตระดับโปร",
    category: "ai",
  },
  {
    name: "Adobe Firefly",
    url: "https://firefly.adobe.com",
    domain: "firefly.adobe.com",
    description: "AI สายดีไซเนอร์จาก Adobe เจนภาพและขยายขอบเขตภาพอย่างเนียนตา ปลอดภัยเรื่องลิขสิทธิ์เชิงพาณิชย์ 100%",
    category: "ai",
  },
  {
    name: "Midjourney",
    url: "https://www.midjourney.com",
    domain: "midjourney.com",
    description: "ราชาแห่ง AI เจนภาพกราฟิกและภาพถ่ายระดับภาพยนตร์ เหมาะทำ Moodboard ส่งลูกค้า",
    category: "ai",
  },
  {
    name: "Clipdrop",
    url: "https://clipdrop.co",
    domain: "clipdrop.co",
    description: "รวมเครื่องมือ AI มหัศจรรย์ ลบคนออกจากภาพ ย้ายแสงไฟ และขยายขนาดภาพได้โดยไม่แตก",
    category: "ai",
  },

  // Mockups
  {
    name: "Shots.so",
    url: "https://shots.so",
    domain: "shots.so",
    description: "เครื่องมือทำ Mockup จัดวางหน้าจอเว็บหรือแอปให้ดูพรีเมียมภายใน 10 วินาที",
    category: "mockup",
  },
  {
    name: "LS Graphics",
    url: "https://www.ls.graphics",
    domain: "ls.graphics",
    description: "แจก Mockup อุปกรณ์ต่างๆ ความละเอียดสูงระดับ 4K สำหรับสายพอร์ตโฟลิโอ",
    category: "mockup",
  },
  {
    name: "Artboard Studio",
    url: "https://artboard.studio",
    domain: "artboard.studio",
    description: "แพลตฟอร์มจัดวาง Mockup กำหนดมุมกล้องและแสงเงาเองได้เหมือนถ่ายในสตูดิโอ",
    category: "mockup",
  },

  // Marketing & Copy
  {
    name: "Swiped.co",
    url: "https://swiped.co",
    domain: "swiped.co",
    description: "คลังรวมโฆษณาและ Copywriting ระดับตำนาน เอาไว้แกะรอยวิธีเขียนขาย",
    category: "marketing",
  },
  {
    name: "Marketing Examples",
    url: "https://marketingexamples.com",
    domain: "marketingexamples.com",
    description: "สรุปเคสการตลาดเจ๋งๆ พร้อมภาพประกอบสั้นๆ เข้าใจง่าย เอาไปปรับใช้ได้ทันที",
    category: "marketing",
  },
];
