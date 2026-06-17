import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FEATURE_GROUPS } from "@/data/landingContent";
import { LANDING_MOCKUPS } from "@/data/landingAssets";
import { FadeUp } from "@/components/motion/FadeUp";
import { BrowserFrame, MockupImage } from "@/components/landing/BrowserFrame";

const MOCK_BY_GROUP = {
  jobs: LANDING_MOCKUPS.features.jobs,
  manage: LANDING_MOCKUPS.features.manage,
  finance: LANDING_MOCKUPS.features.finance,
} as const;

export function LandingFeaturesTabs() {
  const [tab, setTab] = React.useState<string>("jobs");
  const group = FEATURE_GROUPS.find((g) => g.id === tab) ?? FEATURE_GROUPS[0];
  const mock = MOCK_BY_GROUP[group.id as keyof typeof MOCK_BY_GROUP];

  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
      <FadeUp className="text-center max-w-2xl mx-auto mb-8">
        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">ฟีเจอร์ที่ครบทุกมุมการทำงาน</h3>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground">
          ออกแบบมาเพื่อฟรีแลนซ์โดยเฉพาะ ตั้งแต่รับงาน บริหาร ไปจนถึงเก็บเงินและยื่นภาษี
        </p>
      </FadeUp>

      <FadeUp delay={0.06}>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            {FEATURE_GROUPS.map((g) => (
              <TabsTrigger key={g.id} value={g.id} className="text-xs sm:text-sm">
                {g.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {FEATURE_GROUPS.map((g) => (
            <TabsContent key={g.id} value={g.id} className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <ul className="space-y-4 order-2 lg:order-1">
                  {g.items.map((item) => (
                    <li key={item.title} className="flex gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-soft">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">{item.title}</h4>
                        <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="order-1 lg:order-2">
                  <BrowserFrame label={`solofreelancer.com — ${g.label}`}>
                    <MockupImage src={mock.src} alt={mock.alt} className="w-full" />
                  </BrowserFrame>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </FadeUp>
    </section>
  );
}
