import * as React from "react";
import { FloatingChat } from "@/components/FloatingChat";
import { DASH_MOBILE_NAV_SPACER_PX } from "@/lib/layoutConstants";
import { cn } from "@/lib/utils";

type DockPos = { x: number; y: number };

const STORAGE_KEY = "so1o:fab-dock-pos:v1";
const DOCK_WIDTH = 48;
const DOCK_HEIGHT = 48;
const MARGIN = 12;
const DRAG_THRESHOLD = 5;

function useModalOpen() {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const body = document.body;
    const check = () => setOpen(body.hasAttribute("data-scroll-locked"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(body, { attributes: true, attributeFilter: ["data-scroll-locked"] });
    return () => obs.disconnect();
  }, []);
  return open;
}

function loadPos(): DockPos | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (typeof p?.x === "number" && typeof p?.y === "number") return p;
  } catch {
    /* noop */
  }
  return null;
}

function defaultPos(): DockPos {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  const w = window.innerWidth;
  const h = window.innerHeight;
  const bottomOffset =
    typeof window !== "undefined" && window.innerWidth < 768
      ? DASH_MOBILE_NAV_SPACER_PX + 48
      : 24;
  return {
    x: w - DOCK_WIDTH - MARGIN,
    y: h - DOCK_HEIGHT - bottomOffset,
  };
}

function clampPos(p: DockPos): DockPos {
  if (typeof window === "undefined") return p;
  const w = window.innerWidth;
  const h = window.innerHeight;
  return {
    x: Math.max(MARGIN, Math.min(p.x, w - DOCK_WIDTH - MARGIN)),
    y: Math.max(MARGIN, Math.min(p.y, h - DOCK_HEIGHT - MARGIN)),
  };
}

function snapToEdge(p: DockPos): DockPos {
  if (typeof window === "undefined") return p;
  const w = window.innerWidth;
  const distLeft = p.x;
  const distRight = w - (p.x + DOCK_WIDTH);
  const snappedX = distLeft < distRight ? MARGIN : w - DOCK_WIDTH - MARGIN;
  return clampPos({ x: snappedX, y: p.y });
}

export function DraggableFabDock() {
  const modalOpen = useModalOpen();
  const [pos, setPos] = React.useState<DockPos>(() => clampPos(loadPos() ?? defaultPos()));
  const [dragging, setDragging] = React.useState(false);
  const skipClickRef = React.useRef(false);
  const dragState = React.useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
    pointerId: number;
  } | null>(null);

  React.useEffect(() => {
    const onResize = () => setPos((p) => clampPos(p));
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    skipClickRef.current = false;
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
      moved: false,
      pointerId: e.pointerId,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = dragState.current;
    if (!s || s.pointerId !== e.pointerId) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    if (!s.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    if (!s.moved) {
      s.moved = true;
      setDragging(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    setPos(clampPos({ x: s.origX + dx, y: s.origY + dy }));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = dragState.current;
    if (!s || s.pointerId !== e.pointerId) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    if (s.moved) {
      skipClickRef.current = true;
      const snapped = snapToEdge(pos);
      setPos(snapped);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapped));
      } catch {
        /* noop */
      }
    }
    dragState.current = null;
    setTimeout(() => setDragging(false), 0);
  };

  return (
    <div
      aria-hidden={modalOpen ? true : undefined}
      className="fixed z-[60] touch-none select-none"
      style={{
        left: 0,
        top: 0,
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${modalOpen ? 0.85 : 1})`,
        transition: dragging ? "none" : "transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.2s ease",
        willChange: "transform",
        opacity: modalOpen ? 0 : 1,
        pointerEvents: modalOpen ? "none" : "auto",
      }}
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={cn(
          "cursor-grab active:cursor-grabbing",
          dragging && "cursor-grabbing",
        )}
        aria-label="ลากเพื่อย้าย AI Chat"
        title="ลากเพื่อย้าย · คลิกเพื่อเปิดแชท"
      >
        <FloatingChat inline skipClickRef={skipClickRef} />
      </div>
    </div>
  );
}
