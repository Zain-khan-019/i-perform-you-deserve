import { useEffect, useState } from "react";
import { Building2, UtensilsCrossed, Shirt, Car, ShieldCheck, MapPin, Sparkles } from "lucide-react";

// Every image placed in src/assets/hero is bundled by Vite automatically, whatever its file name is.
const PHOTO_MODULES = import.meta.glob("../assets/hero/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG}", {
  eager: true,
  import: "default",
});

const PHOTOS = Object.entries(PHOTO_MODULES)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, src]) => ({ name: path.split("/").pop().toLowerCase(), src }));

// Use the photo whose name contains the keyword; otherwise use the photos in order.
const getPhoto = (keyword, index) => {
  const named = PHOTOS.find((p) => p.name.includes(keyword));
  if (named) return named.src;
  return PHOTOS.length ? PHOTOS[index % PHOTOS.length].src : null;
};

const SLIDES = [
  {
    key: "hostels",
    Icon: Building2,
    label: "Accommodation",
    title: "Verified hostels near your campus",
    text: "Compare single, bi and tri-seater rooms with Wi-Fi and power backup across Lahore.",
    photo: "hostel",
    gradient: "from-royal via-navy to-navy",
  },
  {
    key: "meals",
    Icon: UtensilsCrossed,
    label: "Food & Mess",
    title: "Home-cooked meals, every day",
    text: "Monthly tiffin and mess plans that fit a student budget.",
    photo: "meal",
    gradient: "from-emerald-900 via-navy to-navy",
  },
  {
    key: "laundry",
    Icon: Shirt,
    label: "Laundry & Care",
    title: "Fresh clothes, zero effort",
    text: "Pickup and drop-off laundry and ironing services at your doorstep.",
    photo: "laundry",
    gradient: "from-sky-900 via-royal to-navy",
  },
  {
    key: "commute",
    Icon: Car,
    label: "Daily Commute",
    title: "Smart rides to your university",
    text: "Student-friendly cab, bike and ride-sharing options for daily travel.",
    photo: "commute",
    gradient: "from-navy via-royal to-navy",
  },
  {
    key: "safety",
    Icon: ShieldCheck,
    label: "Health & Safety",
    title: "A safer, healthier home",
    text: "Professional pest control and seasonal health guidance for dengue, mosquitoes and snakes.",
    photo: "safety",
    gradient: "from-emerald-800 via-royal to-navy",
  },
];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), 5500);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[active];

  return (
    <div className="relative h-full w-full overflow-hidden bg-navy text-white">
      {/* Background slides */}
      {SLIDES.map((s, i) => {
        const src = getPhoto(s.photo, i);
        return (
          <div
            key={s.key}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === active ? "opacity-100" : "opacity-0"}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`} />
            {src && (
              <img
                src={src}
                alt=""
                className={`absolute inset-0 h-full w-full object-cover ${i === active ? "animate-kenburns" : ""}`}
              />
            )}
            {/* Light overlay so the photo stays visible, darker only at the bottom for readable text */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/35 to-navy/10" />
          </div>
        );
      })}

      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute bottom-20 right-0 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl animate-float" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
            <MapPin size={16} className="text-amber-400" />
            Lahore, Pakistan
          </div>
          <div className="animate-float hidden items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur xl:flex">
            <Sparkles size={16} className="text-emerald-400" />
            AI-powered budget matching
          </div>
        </div>

        {/* Brand headline */}
        <div className="drop-shadow-lg">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
            Student Lifestyle Platform
          </p>
          <h1 className="font-display text-5xl font-bold leading-[1.05] xl:text-7xl">
            I Perform
            <br />
            You <span className="text-amber-400">Deserve</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-slate-100">
            Everything a student needs to live well in Lahore. Housing, meals, laundry, travel and safety, in one place.
          </p>
        </div>

        {/* Active slide card */}
        <div>
          <div
            key={active}
            className="animate-fadeup flex max-w-xl items-start gap-4 rounded-2xl border border-white/20 bg-navy/50 p-5 backdrop-blur-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500">
              <slide.Icon size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">{slide.label}</p>
              <h3 className="mt-1 text-lg font-semibold">{slide.title}</h3>
              <p className="mt-1 text-sm text-slate-200">{slide.text}</p>
            </div>
          </div>

          {/* Dots */}
          <div className="mt-6 flex items-center gap-2">
            {SLIDES.map((s, i) => (
              <button
                key={s.key}
                onClick={() => setActive(i)}
                aria-label={`Show slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === active ? "w-10 bg-amber-400" : "w-4 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}