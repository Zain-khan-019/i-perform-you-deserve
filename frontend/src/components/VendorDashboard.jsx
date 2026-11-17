import { useEffect, useState } from "react";
import { Store, BadgeCheck, Clock, MapPin, Loader2, AlertCircle } from "lucide-react";
import ListingForm from "./ListingForm";
import BookingRequests from "./BookingRequests";
import { getLocations, getMyVendors } from "../api";
import { pkr } from "../serviceMeta";

const CATEGORY_LABEL = {
  hostel: "Hostel",
  food: "Food / Tiffin",
  laundry: "Laundry",
  commute: "Commute",
  pest: "Pest Control",
};

export default function VendorDashboard({ user }) {
  const [locations, setLocations] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadListings = async () => {
    try {
      setListings(await getMyVendors());
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocations().then(setLocations).catch((e) => setError(e.message));
    loadListings();
  }, []);

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-5 py-8">
      {/* Greeting banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-royal to-navy p-8 text-white sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">Service Provider Portal</p>
        <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
          Welcome{user.name ? `, ${user.name}` : ""}
        </h2>
        <p className="mt-2 max-w-xl text-slate-200">
          List your services, reach students across Lahore and manage their booking requests in one place.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <ListingForm locations={locations} onCreated={loadListings} />

      {/* My listings */}
      <section className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-white">
            <Store size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-navy">My listings</h2>
            <p className="text-sm text-slate-500">Services you have added to the platform.</p>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 flex justify-center">
            <Loader2 className="animate-spin text-royal" size={28} />
          </div>
        ) : listings.length === 0 ? (
          <p className="mt-6 rounded-2xl bg-mist px-5 py-8 text-center text-sm text-slate-500">
            You have not added any listings yet. Use the form above to add your first one.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <div key={l.id} className="rounded-2xl border border-slate-100 p-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-royal">
                    {CATEGORY_LABEL[l.category] || l.category}
                  </span>
                  {l.verified ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      <BadgeCheck size={13} /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                      <Clock size={13} /> Pending
                    </span>
                  )}
                </div>
                <p className="mt-3 font-semibold text-navy">{l.name}</p>
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                  <MapPin size={14} /> {l.area}
                </p>
                <p className="mt-3 text-lg font-bold text-navy">{pkr(l.price)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <BookingRequests />
    </main>
  );
}