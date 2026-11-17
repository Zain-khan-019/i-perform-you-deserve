import { Star, Wifi, Zap, BadgeCheck, MapPin, CalendarCheck, Loader2 } from "lucide-react";
import { SERVICE_META, pkr } from "../serviceMeta";

export default function ResultsView({ data, onBook, busyVendor }) {
  const { allocation, packages, area, budget } = data;
  // Show only the services that actually received a share of the budget
  const keys = Object.keys(allocation.percent).filter((k) => allocation.percent[k] > 0);

  return (
    <section className="space-y-6">
      {/* Allocation */}
      <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100 sm:p-8">
        <h2 className="text-xl font-bold text-navy">Your AI budget split</h2>
        <p className="mt-1 text-sm text-slate-500">
          Recommended allocation of {pkr(budget)} per month for {area}.
        </p>

        <div className="mt-5 flex h-4 overflow-hidden rounded-full bg-slate-100">
          {keys.map((k) => (
            <div
              key={k}
              className={`${SERVICE_META[k].bar} transition-all`}
              style={{ width: `${allocation.percent[k]}%` }}
            />
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {keys.map((k) => {
            const { label, Icon, text } = SERVICE_META[k];
            return (
              <div key={k} className="rounded-2xl bg-mist p-4">
                <div className={`flex items-center gap-2 text-sm font-semibold ${text}`}>
                  <Icon size={16} /> {label}
                </div>
                <p className="mt-2 text-lg font-bold text-navy">{pkr(allocation.amounts[k])}</p>
                <p className="text-xs text-slate-500">{allocation.percent[k]}% of budget</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Packages */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-navy">Best-fit packages</h2>
        <div className="grid gap-5 lg:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.rank}
              className={`flex flex-col rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/60 ring-1 ${
                pkg.rank === 1 ? "ring-2 ring-emerald-500" : "ring-slate-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">Option {pkg.rank}</span>
                {pkg.rank === 1 && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    Best match
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-4">
                {Object.entries(pkg.services).map(([cat, v]) => {
                  const { label, Icon, text } = SERVICE_META[cat];
                  return (
                    <div key={cat} className="rounded-2xl border border-slate-100 p-4">
                      <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${text}`}>
                        <Icon size={14} /> {label}
                      </div>
                      {v ? (
                        <>
                          <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-navy">
                            {v.name}
                            {v.verified && <BadgeCheck size={15} className="text-emerald-500" />}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Star size={12} className="text-amber-500" /> {v.rating}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={12} /> {v.distance_km} km
                            </span>
                            {cat === "hostel" && v.seater && <span>{v.seater}-seater</span>}
                            {cat === "hostel" && v.wifi && (
                              <span className="flex items-center gap-1"><Wifi size={12} /> Wi-Fi</span>
                            )}
                            {cat === "hostel" && v.backup && (
                              <span className="flex items-center gap-1"><Zap size={12} /> Backup</span>
                            )}
                          </div>
                          <p className="mt-2 text-base font-bold text-navy">{pkr(v.price)}</p>
                          {cat === "hostel" && (
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
                          )}
                        </>
                      ) : (
                        <p className="mt-2 text-sm text-slate-400">No match found within your budget and radius.</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-auto pt-5">
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-sm text-slate-500">Total per month</span>
                  <span className="text-xl font-bold text-royal">{pkr(pkg.total_cost)}</span>
                </div>
                <p className={`mt-1 text-right text-xs font-semibold ${pkg.within_budget ? "text-emerald-600" : "text-red-500"}`}>
                  {pkg.within_budget
                    ? `${pkr(pkg.remaining)} left in your budget`
                    : `${pkr(Math.abs(pkg.remaining))} over your budget`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}