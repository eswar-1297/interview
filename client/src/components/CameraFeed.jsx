import React, { useRef, useEffect, useState } from "react";

export default function CameraFeed({ size = "sm" }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { width: 320, height: 240 }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => setError(true));

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const sizeClass = size === "lg"
    ? "w-64 h-48"
    : "w-28 h-20";

  if (error) {
    return (
      <div className={`${sizeClass} bg-gray-100 rounded flex items-center justify-center`}>
        <span className="text-[10px] text-gray-400">Camera off</span>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className={`${sizeClass} rounded object-cover bg-black`}
    />
  );
}
