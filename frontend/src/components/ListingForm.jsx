import { useState } from "react";
import { PlusCircle, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { registerVendor } from "../api";

const CATEGORIES = [
  { value: "hostel", label: "Hostel / Accommodation" },
  { value: "food", label: "Food / Tiffin" },
  { value: "laundry", label: "Laundry & Ironing" },
  { value: "commute", label: "Commute / Ride" },
  { value: "pest", label: "Pest Control" },
];

const SEATERS = [
  { value: "single", label: "Single seater" },
  { value: "bi", label: "Bi-seater" },
  { value: "tri", label: "Tri-seater" },
];

const EMPTY = {
  business_name: "",
  category: "hostel",
  area: "",
  address: "",
  price: "",
  seater: "single",
  has_wifi: false,
  has_backup: false,
  description: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-royal focus:ring-4 focus:ring-royal/10";

export default function ListingForm({ locations, onCreated }) {
  const [form, setForm] = useState({ ...EMPTY });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const isHostel = form.category === "hostel";

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (form.business_name.trim().length < 3) {
      setMessage({ type: "error", text: "Business name must be at least 3 characters." });
      return;
    }
    if (!form.area) {
      setMessage({ type: "error", text: "Please select an area." });
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setMessage({ type: "error", text: "Please enter a valid price." });
      return;
    }

    setLoading(true);
    try {
      const res = await registerVendor({
        business_name: form.business_name.trim(),
        category: form.category,
        area: form.area,
        address: form.address.trim(),
        price: Number(form.price),
        seater: isHostel ? form.seater : "",
        has_wifi: form.has_wifi,
        has_backup: form.has_backup,
        description: form.description.trim(),
      });
      setMessage({ type: "success", text: res.message });
      setForm({ ...EMPTY });
      onCreated?.();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100 sm:p-8"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-royal text-white">
          <PlusCircle size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-navy">Add a new listing</h2>
          <p className="text-sm text-slate-500">
            New listings are reviewed and verified before they appear to students.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Business name</label>
          <input
            value={form.business_name}
            onChange={(e) => set("business_name", e.target.value)}
            placeholder="e.g. Green Valley Hostel"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Service category</label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Area</label>
          <select value={form.area} onChange={(e) => set("area", e.target.value)} className={inputClass}>
            <option value="">Select an area</option>
            {locations.map((l) => (
              <option key={l.name} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Price (PKR {form.category === "pest" ? "per visit" : "per month"})
          </label>
          <input
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="e.g. 15000"
            className={inputClass}
          />
        </div>

        {isHostel && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Room type</label>
            <select value={form.seater} onChange={(e) => set("seater", e.target.value)} className={inputClass}>
              {SEATERS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={isHostel ? "" : "sm:col-span-1"}>
          <label className="mb-1 block text-sm font-medium text-slate-700">Address (optional)</label>
          <input
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="Street, block or landmark"
            className={inputClass}
          />
        </div>
      </div>

      {isHostel && (
        <div className="mt-5 flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.has_wifi}
              onChange={(e) => set("has_wifi", e.target.checked)}
              className="h-4 w-4 accent-emerald-500"
            />
            Wi-Fi available
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.has_backup}
              onChange={(e) => set("has_backup", e.target.checked)}
              className="h-4 w-4 accent-emerald-500"
            />
            Generator / UPS backup
          </label>
        </div>
      )}

      <div className="mt-5">
        <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
        <textarea
          rows={3}
          maxLength={500}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Tell students what makes your service a good choice."
          className={inputClass}
        />
      </div>

      {message && (
        <div
          className={`mt-5 flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600 disabled:opacity-60"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <>Submit listing</>}
      </button>
    </form>
  );
}