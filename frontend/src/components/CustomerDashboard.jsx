import { useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertCircle, Search, Compass, CalendarCheck } from "lucide-react";
import BudgetForm from "./BudgetForm";
import ResultsView from "./ResultsView";
import HealthGuide from "./HealthGuide";
import ServiceBrowser from "./ServiceBrowser";
import MyBookings from "./MyBookings";
import { getLocations, recommend, createBooking } from "../api";

const TABS = [
  { key: "find", label: "Find a package", Icon: Search },
  { key: "browse", label: "Browse services", Icon: Compass },
  { key: "bookings", label: "My bookings", Icon: CalendarCheck },
];

export default function CustomerDashboard({ user }) {
  const [tab, setTab] = useState("find");
  const [locations, setLocations] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [busyVendor, setBusyVendor] = useState(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    getLocations().then(setLocations).catch((e) => setError(e.message));
  }, []);

  // Hide the floating notification automatically after 5 seconds
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const handleSubmit = async (payload) => {
    setError("");
    setNotice(null);
    setLoading(true);
    try {
      const data = await recommend(payload);
      setResults(data);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      setResults(null);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (vendorId) => {
    setNotice(null);
    setBusyVendor(vendorId);
    try {
      const res = await createBooking(vendorId);
      setNotice({
        type: "success",
        text: `${res.message}. Track it under My bookings.`,
      });
    } catch (e) {
      setNotice({ type: "error", text: e.message });
    } finally {
      setBusyVendor(null);
    }
  };

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-5 py-8">
      {/* Floating notification */}
      {notice && (
        <div className="fixed left-1/2 top-20 z-50 w-[92%] max-w-md -translate-x-1/2">
          <div
            className={`animate-fadeup flex items-start gap-3 rounded-2xl px-5 py-4 text-sm font-medium shadow-2xl ${
              notice.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
            }`}
          >
            {notice.type === "success" ? (
              <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
            )}
            {notice.text}
          </div>
        </div>
      )}

      {/* Greeting banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-royal via-navy to-navy p-8 text-white sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">Student Dashboard</p>
        <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
          Welcome{user.name ? `, ${user.name}` : ""}
        </h2>
        <p className="mt-2 max-w-xl text-slate-200">
          Tell us your budget and campus area. We will build the best living package for your life in Lahore.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-100">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
              tab === key ? "bg-royal text-white shadow" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Icon size={17} />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {tab === "find" && (
        <>
          <BudgetForm locations={locations} loading={loading} onSubmit={handleSubmit} />

          {error && (
            <div className="flex items-start gap-3 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}

          <div ref={resultsRef}>
            {results && <ResultsView data={results} onBook={handleBook} busyVendor={busyVendor} />}
          </div>

          <HealthGuide />
        </>
      )}

      {tab === "browse" && (
        <ServiceBrowser locations={locations} onBook={handleBook} busyVendor={busyVendor} />
      )}

      {tab === "bookings" && <MyBookings />}
    </main>
  );
}