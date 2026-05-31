import { Link, useRouter } from "@tanstack/react-router";

export function RouteError({ error }: { error: Error }) {
  const router = useRouter();
  const message = error?.message || "เกิดข้อผิดพลาดที่ไม่คาดคิด";
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-4">
        <div className="text-6xl">⚠️</div>
        <h1 className="text-2xl font-bold text-foreground">โหลดหน้านี้ไม่สำเร็จ</h1>
        <p className="text-sm text-muted-foreground break-words">{message}</p>
        <div className="flex gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={() => router.invalidate()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            ลองใหม่
          </button>
          <Link
            to="/"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </div>
  );
}
