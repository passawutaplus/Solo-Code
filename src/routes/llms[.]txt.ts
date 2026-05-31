import { createFileRoute } from "@tanstack/react-router";

const SITE_URL = "https://solofreelancer.com";

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        const body = `# So1o Freelancer

> หลังบ้านครบวงจรสำหรับฟรีแลนซ์ไทย — บริหารพอร์ต ลูกค้า ใบเสนอราคา การเงิน ภาษี ใบแจ้งหนี้ และคอนเทนต์ในที่เดียว พร้อม AI Mentor ที่ปรึกษาด้านราคาและงานออกแบบ

## Pages

- [Home](${SITE_URL}/): ภาพรวมแอปและเครื่องคำนวณราคางานฟรีแลนซ์ฟรี
- [Blog](${SITE_URL}/blog): บทความและเทคนิคสำหรับฟรีแลนซ์ไทย
- [Creative Partner AI](${SITE_URL}/creative-partner): AI ที่ปรึกษาด้านงานออกแบบ สี ฟอนต์ คอนเซปต์
- [Sign in](${SITE_URL}/auth): เข้าสู่ระบบหรือสมัครสมาชิก
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
