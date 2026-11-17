import { useEffect, useState } from "react";

// Reuses the photos from src/assets/hero, so no extra images are needed.
const PHOTO_MODULES = import.meta.glob("../assets/hero/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG}", {
  eager: true,
  import: "default",
});

const PHOTOS = Object.entries(PHOTO_MODULES)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, src]) => src);

export default function PageBackground() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (PHOTOS.length < 2) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % PHOTOS.length), 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-sky-100 via-white to-emerald-100">
      {/* Rotating photos */}
      {PHOTOS.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ${
            i === active ? "animate-kenburns opacity-40" : "opacity-0"
          }`}
        />
      ))}

      {/* Soft veil so the cards on top stay easy to read */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/55 to-white/75" />

      {/* Floating colour blobs */}
      <div className="animate-float-slow absolute -right-20 top-10 h-96 w-96 rounded-full bg-emerald-400/30 blur-3xl" />
      <div className="animate-float absolute -left-28 top-1/2 h-[28rem] w-[28rem] rounded-full bg-blue-500/25 blur-3xl" />
      <div className="animate-float-slow absolute bottom-0 right-1/3 h-80 w-80 rounded-full bg-amber-300/40 blur-3xl" />
    </div>
  );
}