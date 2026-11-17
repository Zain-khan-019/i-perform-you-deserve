import { Building2, UtensilsCrossed, Shirt, Car, Bug, ShieldCheck, Phone, MapPin } from "lucide-react";

const SERVICES = [
  { label: "Hostels & Accommodation", Icon: Building2 },
  { label: "Food & Tiffin", Icon: UtensilsCrossed },
  { label: "Laundry & Ironing", Icon: Shirt },
  { label: "Daily Commute", Icon: Car },
  { label: "Pest Control", Icon: Bug },
];

const PLATFORM = [
  "AI budget planner",
  "Verified service providers",
  "Booking requests",
  "Health and safety guide",
  "18 student hubs across Lahore",
];

export default function Footer() {
  return (
    <footer className="relative z-10 mt-16 overflow-hidden bg-gradient-to-br from-navy via-navy to-royal text-slate-300">
      {/* Coloured top border */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-amber-300 to-royal" />

      {/* Soft glow */}
      <div className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <h3 className="font-display text-2xl font-bold text-white">
            I Perform You <span className="text-amber-400">Deserve</span>
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            An AI-powered platform that helps students living in Lahore plan their budget and find hostels,
            meals, laundry, commute and safe homes in one place.
          </p>
          <p className="mt-4 flex items-center gap-2 text-sm text-slate-300">
            <MapPin size={16} className="text-emerald-400" /> Lahore, Pakistan
          </p>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-400">Services</h4>
          <ul className="mt-4 space-y-3 text-sm">
            {SERVICES.map(({ label, Icon }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon size={15} className="text-amber-300" /> {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Platform */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-400">Platform</h4>
          <ul className="mt-4 space-y-3 text-sm">
            {PLATFORM.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" /> {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Safety */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-400">Stay safe</h4>
          <p className="mt-4 flex items-start gap-2 text-sm text-slate-400">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-400" />
            Read our dengue, mosquito and snake safety guide on the student dashboard.
          </p>
          <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-300">
              <Phone size={14} /> Emergency
            </p>
            <p className="mt-1 text-sm text-slate-200">
              Call Rescue <span className="text-lg font-bold text-white">1122</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-4 text-xs text-slate-400 sm:flex-row">
          <p>&copy; 2026 I Perform You Deserve. All rights reserved.</p>
          <p>Developed by Zain Khan, Full Stack AI, Arfa Software Technology Park</p>
        </div>
      </div>
    </footer>
  );
}