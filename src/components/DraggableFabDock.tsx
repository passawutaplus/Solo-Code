import * as React from "react";
import { GripVertical } from "lucide-react";
import { FloatingChat } from "@/components/FloatingChat";
import { DASH_MOBILE_NAV_SPACER_PX } from "@/lib/layoutConstants";

type DockPos = { x: number; y: number };

const STORAGE_KEY = "so1o:fab-dock-pos:v1";
const DOCK_WIDTH = 60; // px (FABs h-12)
const DOCK_HEIGHT = 88; // chat button + handle + gap
const MARGIN = 12;
const DRAG_THRESHOLD = 5; // px

/**
 * Returns true while any Radix modal (Dialog/Sheet/AlertDialog) is open.
 * Radix sets `data-scroll-locked` on <body> while a modal is mounted.
 */
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
  // Above mobile bottom nav (64px) + safe-area; extra margin on narrow viewports
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
  const snappedX =
    distLeft < distRight ? MARGIN : w - DOCK_WIDTH - MARGIN;
  return clampPos({ x: snappedX, y: p.y });
}

export function DraggableFabDock() {
  const modalOpen = useModalOpen();
  const [pos, setPos] = React.useState<DockPos>(() => clampPos(loadPos() ?? defaultPos()));
  const [dragging, setDragging] = React.useState(false);
  const dragState = React.useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
    pointerId: number;
  } | null>(null);

  // Re-clamp on resize / orientation
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
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
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
      const snapped = snapToEdge(pos);
      setPos(snapped);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapped));
      } catch {
        /* noop */
      }
    }
    dragState.current = null;
    // Defer to allow click to NOT fire on children when we actually dragged
    setTimeout(() => setDragging(false), 0);
  };

  return (
    <div
      aria-hidden={modalOpen ? true : undefined}
      className="fixed z-[60] flex flex-col items-center gap-2 touch-none select-none"
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
      {/* Drag handle */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`h-6 w-14 grid place-items-center rounded-full text-white/90 cursor-grab active:cursor-grabbing transition-opacity drop-shadow ${
          dragging ? "opacity-100" : "opacity-70 hover:opacity-100"
        }`}
        aria-label="ลากเพื่อย้ายปุ่ม"
        title="ลากเพื่อย้ายปุ่ม"
        role="button"
        tabIndex={-1}
      >
        <GripVertical className="h-3.5 w-3.5 rotate-90" />
      </div>

      {/* Disable children pointer events while actively dragging */}
      <div className={dragging ? "pointer-events-none" : ""}>
        <FloatingChat inline />
      </div>
    </div>
  );
}
