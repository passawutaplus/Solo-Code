import { createFileRoute } from "@tanstack/react-router";
import { ANTHEM_SHOWCASE_URL } from "@/lib/productLinks";
import { SITE_URL } from "@/lib/siteUrl";

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        const body = `# So1o Freelancer

> หลังบ้านครบวงจรสำหรับฟรีแลนซ์ไทย — ลูกค้า ใบเสนอราคา การเงิน ภาษี Smart Brief Creative Labs และ AI Mentor (ไม่รวมฟีดโชว์เคสผลงาน)

## Pages

- [Home](${SITE_URL}/): ภาพรวมแอปและเครื่องคำนวณราคางานฟรีแลนซ์ฟรี
- [Blog](${SITE_URL}/blog): บทความและเทคนิคสำหรับฟรีแลนซ์ไทย
- [Pricing](${SITE_URL}/pricing): แพ็กเกจ Free / Pro / In-House
- [Creative Partner AI](${SITE_URL}/creative-partner): AI ที่ปรึกษาด้านงานออกแบบ สี ฟอนต์ คอนเซปต์
- [Sign in](${SITE_URL}/auth): เข้าสู่ระบบหรือสมัครสมาชิก

## Related products (external)

- [an1hem Community Showcase](${ANTHEM_SHOWCASE_URL}): ฟีดผลงานชุมชนฟรีแลนซ์สไตล์ Pinterest — แยกจาก My Desk
`;
        return new Response(body, {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
