import { useRef, useState } from "react";
import {
  GraduationCap,
  Store,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Sparkles,
  BadgeCheck,
  MapPin,
} from "lucide-react";
import { sendOtp, verifyOtp } from "../api";

const ROLES = [
  { value: "customer", label: "I Want Services", sub: "Student / Customer", Icon: GraduationCap },
  { value: "vendor", label: "I Want to Provide Services", sub: "Vendor / Service Provider", Icon: Store },
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-royal focus:bg-white focus:ring-4 focus:ring-royal/10";

export default function LoginCard({ onLogin }) {
  const [role, setRole] = useState("customer");
  const [name, setName] = useState("");
  const [digits, setDigits] = useState("");
  const [step, setStep] = useState("phone"); // phone | otp
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const refs = useRef([]);

  const phone = `+92${digits}`;
  const phoneValid = /^3\d{9}$/.test(digits);
  const code = otp.join("");

  const handlePhoneChange = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.startsWith("92")) v = v.slice(2);
    if (v.startsWith("0")) v = v.slice(1);
    setDigits(v.slice(0, 10));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    if (!phoneValid) {
      setError("Enter a valid Pakistani mobile number, for example 300 1234567.");
      return;
    }
    setLoading(true);
    try {
      const res = await sendOtp(phone);
      setDemoOtp(res.dev_otp || "");
      setOtp(Array(6).fill(""));
      setStep("otp");
      setTimeout(() => refs.current[0]?.focus(), 50);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    if (code.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp({ phone, code, role, name: name.trim() });
      onLogin(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setDigit = (i, v) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
    if (d && i < 5) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPaste = (e) => {
    const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!t) return;
    e.preventDefault();
    setOtp(Array.from({ length: 6 }, (_, i) => t[i] || ""));
    refs.current[Math.min(t.length, 5)]?.focus();
  };

  return (
    <div className="animate-fadeup w-full max-w-md">
      {/* Mobile brand header */}
      <div className="mb-6 lg:hidden">
        <h1 className="font-display text-4xl font-bold text-royal">
          I Perform You <span className="text-amber-500">Deserve</span>
        </h1>
        <p className="mt-1 text-sm text-slate-600">Lahore Student Lifestyle Platform</p>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white/85 shadow-2xl shadow-royal/20 ring-1 ring-white/60 backdrop-blur-xl">
        {/* Coloured header band */}
        <div className="relative overflow-hidden bg-gradient-to-br from-royal via-navy to-navy px-8 py-7 text-white">
          <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-emerald-400/30 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 left-1/3 h-32 w-32 rounded-full bg-amber-400/25 blur-2xl" />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-bold">
                {step === "phone" ? "Welcome" : "Verify your number"}
              </h2>
              <p className="mt-1 text-sm text-slate-200">
                {step === "phone"
                  ? "Sign in with your mobile number to continue."
                  : `We sent a 6-digit code to ${phone}.`}
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur">
              {step === "phone" ? <Sparkles size={24} className="text-amber-300" /> : <ShieldCheck size={24} className="text-emerald-300" />}
            </div>
          </div>
          <div className="relative mt-5 h-1 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 transition-all duration-500"
              style={{ width: step === "phone" ? "50%" : "100%" }}
            />
          </div>
        </div>

        {/* Form area */}
        <div className="p-8">
          {step === "phone" ? (
            <form onSubmit={handleSend} className="space-y-5">
              {/* Role toggle */}
              <div className="grid grid-cols-1 gap-3">
                {ROLES.map(({ value, label, sub, Icon }) => {
                  const selected = role === value;
                  return (
                    <button
                      type="button"
                      key={value}
                      onClick={() => setRole(value)}
                      className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition ${
                        selected
                          ? "border-royal bg-gradient-to-r from-royal/10 via-sky-50 to-emerald-50 shadow-md shadow-royal/10"
                          : "border-slate-200 bg-white/70 hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          selected
                            ? "bg-gradient-to-br from-royal to-emerald-500 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy">{label}</p>
                        <p className="text-xs text-slate-500">{sub}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Name */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Full name (optional)</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ayesha Khan"
                  className={inputClass}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Mobile number</label>
                <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white/80 transition focus-within:border-royal focus-within:bg-white focus-within:ring-4 focus-within:ring-royal/10">
                  <span className="flex items-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 text-sm font-semibold text-slate-600">
                    +92
                  </span>
                  <input
                    value={digits}
                    onChange={handlePhoneChange}
                    inputMode="numeric"
                    placeholder="300 1234567"
                    className="w-full bg-transparent px-4 py-3 text-sm outline-none"
                  />
                </div>
              </div>

              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3.5 font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-60"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Send OTP <ArrowRight size={18} /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="flex justify-between gap-2" onPaste={onPaste}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (refs.current[i] = el)}
                    value={d}
                    onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => onKeyDown(i, e)}
                    inputMode="numeric"
                    maxLength={1}
                    className="h-14 w-12 rounded-xl border border-slate-200 bg-white/80 text-center text-xl font-bold text-royal outline-none transition focus:border-royal focus:bg-white focus:ring-4 focus:ring-royal/10"
                  />
                ))}
              </div>

              {demoOtp && (
                <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-50 to-amber-100 px-4 py-3 text-sm text-amber-800">
                  <span>Demo mode: your code is <b>{demoOtp}</b></span>
                  <button
                    type="button"
                    onClick={() => setOtp(demoOtp.split(""))}
                    className="font-semibold underline"
                  >
                    Autofill
                  </button>
                </div>
              )}

              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-royal to-navy py-3.5 font-semibold text-white shadow-lg shadow-royal/30 transition hover:from-navy hover:to-navy disabled:opacity-60"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Verify &amp; Continue <ShieldCheck size={18} /></>}
              </button>

              <button
                type="button"
                onClick={() => { setStep("phone"); setError(""); }}
                className="flex w-full items-center justify-center gap-1 text-sm font-medium text-slate-500 hover:text-navy"
              >
                <ArrowLeft size={16} /> Change number
              </button>
            </form>
          )}
        </div>

        {/* Trust strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-slate-100 bg-gradient-to-r from-sky-50/70 via-white/60 to-emerald-50/70 px-6 py-4 text-xs font-medium text-slate-600">
          <span className="flex items-center gap-1.5">
            <BadgeCheck size={14} className="text-emerald-500" /> Verified vendors
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" /> AI budget matching
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={14} className="text-royal" /> Across Lahore
          </span>
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-slate-500">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}