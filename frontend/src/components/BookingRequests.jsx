import { useEffect, useState } from "react";
import { Inbox, Phone, User, Loader2, Check, X, AlertCircle } from "lucide-react";
import { getVendorBookings, updateBooking } from "../api";

const STATUS_STYLE = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function BookingRequests() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      setBookings(await getVendorBookings());
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

  const change = async (id, status) => {
    setBusyId(id);
    setError("");
    try {
      await updateBooking(id, status);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100 sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white">
          <Inbox size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-navy">Booking requests</h2>
          <p className="text-sm text-slate-500">Students who want to book your services appear here.</p>
        </div>
      </div>

      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="mt-8 flex justify-center">
          <Loader2 className="animate-spin text-royal" size={28} />
        </div>
      ) : bookings.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-mist px-5 py-8 text-center text-sm text-slate-500">
          No booking requests yet. They will show up here as soon as a student requests one of your services.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {bookings.map((b) => (
            <div
              key={b.booking_id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-navy">{b.service}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${STATUS_STYLE[b.status] || ""}`}
                  >
                    {b.status}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <User size={14} /> {b.customer.name || "Student"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone size={14} /> {b.customer.phone}
                  </span>
                  <span>Requested {formatDate(b.created_at)}</span>
                </div>
              </div>

              {b.status === "pending" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => change(b.booking_id, "confirmed")}
                    disabled={busyId === b.booking_id}
                    className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
                  >
                    {busyId === b.booking_id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    Confirm
                  </button>
                  <button
                    onClick={() => change(b.booking_id, "cancelled")}
                    disabled={busyId === b.booking_id}
                    className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}