import { LogOut, GraduationCap, Store, MapPin, Building2 } from "lucide-react";

export default function Navbar({ user, onLogout }) {
  const isVendor = user.role === "vendor";
  const displayName = user.name || user.phone;
  const initial = (user.name || "").trim().charAt(0).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 shadow-lg shadow-slate-300/40">
      {/* Coloured top border */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-amber-300 to-royal" />

      <div className="border-b border-white/60 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          {/* Logo and brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-royal to-emerald-500 text-white shadow-md shadow-royal/30">
              <Building2 size={22} />
            </div>
            <div className="leading-tight">
              <h1 className="font-display text-lg font-bold text-royal sm:text-2xl">
                I Perform You <span className="text-amber-500">Deserve</span>
              </h1>
              <p className="hidden items-center gap-1 text-xs font-medium text-slate-500 sm:flex">
                <MapPin size={12} className="text-emerald-500" /> Lahore Student Lifestyle Platform
              </p>
            </div>
          </div>

          {/* User area */}
          <div className="flex items-center gap-3">
            <span
              className={`hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold md:flex ${
                isVendor
                  ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
                  : "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
              }`}
            >
              {isVendor ? <Store size={14} /> : <GraduationCap size={14} />}
              {isVendor ? "Service Provider" : "Student"}
            </span>

            <div className="flex items-center gap-3 rounded-2xl bg-slate-50/80 py-1.5 pl-1.5 pr-4 ring-1 ring-slate-200">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-royal to-navy text-sm font-bold text-white">
                {initial}
              </div>
              <div className="hidden text-left leading-tight sm:block">
                <p className="max-w-[10rem] truncate text-sm font-semibold text-navy">{displayName}</p>
                <p className="text-xs text-slate-500">{isVendor ? "Vendor account" : "Student account"}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-navy to-royal px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-royal/20 transition hover:from-royal hover:to-royal"
            >
              <LogOut size={16} /> <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}