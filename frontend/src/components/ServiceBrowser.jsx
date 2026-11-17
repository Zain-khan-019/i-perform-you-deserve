import { useEffect, useState } from "react";
import {
  Building2,
  UtensilsCrossed,
  Shirt,
  Car,
  Bug,
  LayoutGrid,
  Star,
  Wifi,
  Zap,
  BadgeCheck,
  Clock,
  MapPin,
  CalendarCheck,
  Loader2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { getServices } from "../api";
import { pkr } from "../serviceMeta";

const CATEGORIES = [
  { value: "", label: "All services", Icon: LayoutGrid },
  { value: "hostel", label: "Hostel", Icon: Building2 },
  { value: "food", label: "Food / Tiffin", Icon: UtensilsCrossed },
  { value: "laundry", label: "Laundry", Icon: Shirt },
  { value: "commute", label: "Commute", Icon: Car },
  { value: "pest", label: "Pest Control", Icon: Bug },
];

const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]));

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-royal focus:ring-4 focus:ring-royal/10";

const DEFAULT_FILTERS = {
  category: "",
  area: "",
  max_price: "",
  min_rating: "",
  seater: "",
  verified_only: false,
};

export default function ServiceBrowser({ locations, onBook, busyVendor }) {
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const set = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  // Re-fetch whenever a filter changes (short delay so typing a price does not spam the server)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await getServices({ ...filters, limit: 60 });
        if (!cancelled) {
          setResults(data.results);
          setError("");
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [filters]);

  const isHostel = filters.category === "hostel";

  return (
    <section className="space-y-6">
      {/* Filters */}
      <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100 sm:p-8">
        <h2 className="text-xl font-bold text-navy">Browse all services</h2>
        <p className="mt-1 text-sm text-slate-500">
          Explore verified hostels, meals, laundry, commute and pest control across Lahore.
        </p>

        {/* Category chips */}
        <div className="mt-5 flex flex-wrap gap-2">
          {CATEGORIES.map(({ value, label, Icon }) => {
            const on = filters.category === value;
            return (
              <button
                key={value || "all"}
                onClick={() => setFilters((f) => ({ ...f, category: value, seater: "" }))}
                className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
                  on
                    ? "border-royal bg-royal text-white"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            );
          })}
        </div>

        {/* Other filters */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Area</label>
            <select value={filters.area} onChange={(e) => set("area", e.target.value)} className={inputClass}>
              <option value="">All areas</option>
              {locations.map((l) => (
                <option key={l.name} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Max price (PKR)
            </label>
            <input
              type="number"
              min="0"
              value={filters.max_price}
              onChange={(e) => set("max_price", e.target.value)}
              placeholder="e.g. 20000"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Minimum rating
            </label>
            <select value={filters.min_rating} onChange={(e) => set("min_rating", e.target.value)} className={inputClass}>
              <option value="">Any rating</option>
              <option value="3.5">3.5 and above</option>
              <option value="4">4.0 and above</option>
              <option value="4.5">4.5 and above</option>
            </select>
          </div>

          {isHostel ? (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Room type
              </label>
              <select value={filters.seater} onChange={(e) => set("seater", e.target.value)} className={inputClass}>
                <option value="">Any room type</option>
                <option value="single">Single seater</option>
                <option value="bi">Bi-seater</option>
                <option value="tri">Tri-seater</option>
              </select>
            </div>
          ) : (
            <div className="hidden lg:block" />
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={filters.verified_only}
              onChange={(e) => set("verified_only", e.target.checked)}
              className="h-4 w-4 accent-emerald-500"
            />
            Verified vendors only
          </label>
          <button
            onClick={() => setFilters({ ...DEFAULT_FILTERS })}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <RotateCcw size={15} /> Reset filters
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {/* Results */}
      <div>
        <p className="mb-3 text-sm font-medium text-slate-500">
          {loading ? "Searching..." : `${results.length} service${results.length === 1 ? "" : "s"} found`}
        </p>

        {loading && results.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-royal" size={30} />
          </div>
        ) : results.length === 0 ? (
          <p className="rounded-2xl bg-white px-5 py-10 text-center text-sm text-slate-500 ring-1 ring-slate-100">
            No services match these filters. Try a higher price or reset the filters.
          </p>
        ) : (
          <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${loading ? "opacity-60" : ""}`}>
            {results.map((v) => (
              <div
                key={v.id}
                className="flex flex-col rounded-3xl bg-white p-5 shadow-lg shadow-slate-200/60 ring-1 ring-slate-100"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-royal">
                    {CATEGORY_LABEL[v.category] || v.category}
                  </span>
                  {v.verified ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      <BadgeCheck size={13} /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                      <Clock size={13} /> Not verified
                    </span>
                  )}
                </div>

                <p className="mt-3 font-semibold text-navy">{v.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {v.area}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={12} className="text-amber-500" /> {v.rating}
                  </span>
                  {v.category === "hostel" && v.seater && <span>{v.seater}-seater</span>}
                  {v.category === "hostel" && v.wifi && (
                    <span className="flex items-center gap-1">
                      <Wifi size={12} /> Wi-Fi
                    </span>
                  )}
                  {v.category === "hostel" && v.backup && (
                    <span className="flex items-center gap-1">
                      <Zap size={12} /> Backup
                    </span>
                  )}
                </div>

                {v.description && <p className="mt-3 line-clamp-2 text-sm text-slate-500">{v.description}</p>}

                <div className="mt-auto pt-4">
                  <p className="text-lg font-bold text-navy">
                    {pkr(v.price)}
                    <span className="ml-1 text-xs font-medium text-slate-400">
                      {v.category === "pest" ? "per visit" : "per month"}
                    </span>
                  </p>
                  <button
                    onClick={() => onBook(v.id)}
                    disabled={busyVendor === v.id}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-royal py-2.5 text-sm font-semibold text-white transition hover:bg-navy disabled:opacity-60"
                  >
                    {busyVendor === v.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <CalendarCheck size={16} /> Request booking
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}