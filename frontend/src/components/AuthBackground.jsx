import { useEffect, useState } from "react";

// Reuses the photos from src/assets/hero, so no extra images are needed.
const PHOTO_MODULES = import.meta.glob("../assets/hero/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG}", {
  eager: true,
  import: "default",
});

const PHOTOS = Object.entries(PHOTO_MODULES)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, src]) => src);

export default function AuthBackground() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (PHOTOS.length < 2) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % PHOTOS.length), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-gradient-to-br from-sky-100 via-white to-emerald-100">
      {/* Rotating photos */}
      {PHOTOS.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            i === active ? "animate-kenburns opacity-50" : "opacity-0"
          }`}
        />
      ))}

      {/* Soft white veil keeps the card readable */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/25 to-white/60" />

      {/* Floating colour blobs */}
      <div className="animate-float-slow absolute -right-16 -top-20 h-80 w-80 rounded-full bg-emerald-400/40 blur-3xl" />
      <div className="animate-float absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl" />
      <div className="animate-float-slow absolute -bottom-24 right-1/4 h-80 w-80 rounded-full bg-amber-300/50 blur-3xl" />
    </div>
  );
}