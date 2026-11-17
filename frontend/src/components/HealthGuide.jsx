import { useEffect, useState } from "react";
import { Bug, ShieldAlert, Phone } from "lucide-react";
import { getHealthGuide } from "../api";

export default function HealthGuide() {
  const [guide, setGuide] = useState(null);

  useEffect(() => {
    getHealthGuide().then(setGuide).catch(() => setGuide(null));
  }, []);

  if (!guide) return null;

  return (
    <section className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100 sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white">
          <ShieldAlert size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-navy">{guide.title}</h2>
          <p className="text-sm text-slate-500">{guide.intro}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {guide.risks.map((r) => (
          <div key={r.name} className="rounded-2xl bg-mist p-5">
            <div className="flex items-center gap-2 text-royal">
              <Bug size={18} />
              <h3 className="font-bold">{r.name}</h3>
            </div>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-amber-600">{r.season}</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {r.tips.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-2xl bg-red-50 px-5 py-4 text-red-700">
        <Phone size={20} />
        <p className="text-sm font-semibold">
          {guide.emergency.note} Rescue <span className="text-lg">{guide.emergency.rescue}</span>
        </p>
      </div>
    </section>
  );
}