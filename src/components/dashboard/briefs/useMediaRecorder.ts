import * as React from "react";
import { toast } from "sonner";
import { MEETING_LIMITS, formatDuration } from "@/lib/meetingCaptureSchema";

export type RecorderMode = "audio" | "screen";

export type RecorderState = {
  recording: boolean;
  paused: boolean;
  elapsedSec: number;
  blob: Blob | null;
  mimeType: string;
};

export function useMediaRecorder(mode: RecorderMode, maxSec: number) {
  const [state, setState] = React.useState<RecorderState>({
    recording: false,
    paused: false,
    elapsedSec: 0,
    blob: null,
    mimeType: mode === "audio" ? "audio/webm" : "video/webm",
  });

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = React.useRef(0);

  const cleanup = React.useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
  }, []);

  React.useEffect(() => () => cleanup(), [cleanup]);

  const stop = React.useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") mr.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setState((s) => ({ ...s, recording: false, paused: false }));
  }, []);

  const start = React.useCallback(async () => {
    try {
      chunksRef.current = [];
      let stream: MediaStream;

      if (mode === "audio") {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } else {
        const display = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        const audioTracks = display.getAudioTracks();
        if (audioTracks.length === 0) {
          toast.error("ไม่พบเสียงแท็บ — เลือกแท็บประชุมและติ๊ก Share tab audio");
        }
        stream = display;
      }

      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? mode === "audio"
          ? "audio/webm;codecs=opus"
          : "video/webm;codecs=vp9,opus"
        : mode === "audio"
          ? "audio/webm"
          : "video/webm";

      const mr = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType.split(";")[0] });
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        setState((s) => ({
          ...s,
          blob,
          mimeType: mimeType.split(";")[0],
          elapsedSec: elapsed,
          recording: false,
        }));
        cleanup();
      };

      mr.start(1000);
      startTimeRef.current = Date.now();
      setState({
        recording: true,
        paused: false,
        elapsedSec: 0,
        blob: null,
        mimeType: mimeType.split(";")[0],
      });

      timerRef.current = setInterval(() => {
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        setState((s) => ({ ...s, elapsedSec: elapsed }));
        if (elapsed >= maxSec) {
          toast.info(`อัดครบ ${formatDuration(maxSec)} — หยุดอัตโนมัติ`);
          stop();
        }
      }, 500);
    } catch (e) {
      cleanup();
      const msg = e instanceof Error ? e.message : "ไม่สามารถเริ่มอัดได้";
      toast.error(msg);
      throw e;
    }
  }, [mode, maxSec, cleanup, stop]);

  return { state, start, stop, cleanup };
}

/** Read duration from audio/video file without uploading. */
export function readMediaDurationSec(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement(file.type.startsWith("video/") ? "video" : "audio");
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      const d = el.duration;
      if (!Number.isFinite(d) || d <= 0) {
        reject(new Error("อ่านความยาวไฟล์ไม่ได้"));
        return;
      }
      resolve(Math.ceil(d));
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("อ่านไฟล์ไม่ได้"));
    };
    el.src = url;
  });
}

export function freeTierMaxSec() {
  return MEETING_LIMITS.freeMaxSec;
}
