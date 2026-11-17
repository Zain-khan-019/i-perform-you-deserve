import { useEffect, useState } from "react";
import { CalendarCheck, MapPin, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { getMyBookings } from "../api";
import { pkr } from "../serviceMeta";

const STATUS_STYLE = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
};

const STATUS_TEXT = {
  pending: "Waiting for the vendor to respond.",
  confirmed: "Confirmed. The vendor has accepted your request.",
  cancelled: "The vendor could not accept this request.",
};

const CATEGORY_LABEL = {
  hostel: "Hostel",
  food: "Food / Tiffin",
  laundry: "Laundry",
  commute: "Commute",
  pest: "Pest Control",
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setBookings(await getMyBookings());
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-royal text-white">
            <CalendarCheck size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-navy">My bookings</h2>
            <p className="text-sm text-slate-500">Track the requests you have sent to vendors.</p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {loading && bookings.length === 0 ? (
        <div className="mt-8 flex justify-center">
          <Loader2 className="animate-spin text-royal" size={28} />
        </div>
      ) : bookings.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-mist px-5 py-8 text-center text-sm text-slate-500">
          You have not requested any bookings yet. Find a package and press Request booking to get started.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {bookings.map((b) => (
            <div
              key={b.booking_id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-royal">
                    {CATEGORY_LABEL[b.vendor.category] || b.vendor.category}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${STATUS_STYLE[b.status] || ""}`}
                  >
                    {b.status}
                  </span>
                </div>
                <p className="mt-2 font-semibold text-navy">{b.vendor.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {b.vendor.area}
                  </span>
                  <span>Requested {formatDate(b.created_at)}</span>
                </div>
                <p className="mt-2 text-xs text-slate-400">{STATUS_TEXT[b.status]}</p>
              </div>
              <p className="text-lg font-bold text-navy">{pkr(b.vendor.price)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}