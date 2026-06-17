import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LANDING_MOCKUPS } from "@/data/landingAssets";
import { carouselSlideTransition, carouselSlideVariants } from "@/lib/motion";
import { BrowserFrame, MockupImage } from "@/components/landing/BrowserFrame";

const SLIDES = LANDING_MOCKUPS.heroSlides;
const AUTOPLAY_MS = 5000;

export function LandingHeroMockup({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const [idx, setIdx] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (reduced || paused || SLIDES.length <= 1) return;
    const t = window.setInterval(() => {
      setIdx((i) => (i + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(t);
  }, [reduced, paused]);

  const slide = SLIDES[idx] ?? SLIDES[0];

  return (
    <div
      className={cn("w-full max-w-lg mx-auto lg:max-w-none", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <BrowserFrame label="app.solofreelancer.com/dashboard">
        <div className="relative aspect-[800/520] overflow-hidden">
          {reduced ? (
            <MockupImage src={SLIDES[0].src} alt={SLIDES[0].alt} priority className="absolute inset-0 object-cover" />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.src}
                className="absolute inset-0"
                variants={carouselSlideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={carouselSlideTransition}
              >
                <MockupImage
                  src={slide.src}
                  alt={slide.alt}
                  priority={idx === 0}
                  className="h-full w-full object-cover object-top"
                />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </BrowserFrame>

      {!reduced && SLIDES.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.label}
              type="button"
              aria-label={`ดู ${s.label}`}
              aria-current={i === idx ? "true" : undefined}
              onClick={() => setIdx(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === idx ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
