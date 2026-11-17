import { useState } from "react";
import { Search, Loader2, MapPin } from "lucide-react";
import { SERVICE_META, pkr } from "../serviceMeta";

export default function BudgetForm({ locations, loading, onSubmit }) {
  const [budget, setBudget] = useState(40000);
  const [area, setArea] = useState("Johar Town");
  const [services, setServices] = useState(["hostel", "food", "laundry", "commute"]);
  const [radius, setRadius] = useState(8);

  const toggle = (key) =>
    setServices((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ budget, area, services, radius_km: radius });
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100 sm:p-8"
    >
      <h2 className="text-xl font-bold text-navy">Plan your monthly budget</h2>
      <p className="mt-1 text-sm text-slate-500">
        Our AI splits your budget and finds the best-fit packages near your campus.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Budget */}
        <div>
          <div className="flex items-end justify-between">
            <label className="text-sm font-medium text-slate-700">Monthly budget</label>
            <span className="text-2xl font-bold text-royal">{pkr(budget)}</span>
          </div>
          <input
            type="range"
            min={15000}
            max={150000}
            step={1000}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="mt-3 w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>PKR 15,000</span>
            <span>PKR 150,000</span>
          </div>
        </div>

        {/* Area */}
        <div>
          <label className="mb-1 flex items-center gap-1 text-sm font-medium text-slate-700">
            <MapPin size={14} /> Preferred area / campus hub
          </label>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-royal focus:ring-4 focus:ring-royal/10"
          >
            {locations.map((l) => (
              <option key={l.name} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>

          <div className="mt-4 flex items-end justify-between">
            <label className="text-sm font-medium text-slate-700">Search radius</label>
            <span className="text-sm font-semibold text-navy">{radius} km</span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="mt-2 w-full accent-emerald-500"
          />
        </div>
      </div>

      {/* Services */}
      <div className="mt-6">
        <label className="text-sm font-medium text-slate-700">Services you need</label>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(SERVICE_META).map(([key, { label, Icon }]) => {
            const on = services.includes(key);
            return (
              <button
                type="button"
                key={key}
                onClick={() => toggle(key)}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition ${
                  on
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                <Icon size={18} /> {label}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || services.length === 0 || !area}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            <Search size={18} /> Find my best packages
          </>
        )}
      </button>
    </form>
  );
}