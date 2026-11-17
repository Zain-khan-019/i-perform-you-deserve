const BASE = "http://127.0.0.1:8000";

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Please make sure the backend is running.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(
      typeof data.detail === "string" ? data.detail : "Something went wrong. Please try again."
    );
    err.status = res.status;
    throw err;
  }
  return data;
}

// Auth
export const sendOtp = (phone) => request("/api/auth/send-otp", { method: "POST", body: { phone } });
export const verifyOtp = (payload) => request("/api/auth/verify-otp", { method: "POST", body: payload });
export const getMe = () => request("/api/auth/me", { auth: true });

// Customer
export const getLocations = () => request("/api/locations");
export const recommend = (payload) => request("/api/recommend", { method: "POST", body: payload });
export const createBooking = (vendor_id) =>
  request("/api/bookings", { method: "POST", body: { vendor_id }, auth: true });
export const getMyBookings = () => request("/api/bookings/my", { auth: true });
export const getHealthGuide = () => request("/api/health-guide");

// Browse services (filters are optional; empty values are skipped)
export const getServices = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined && value !== false) {
      qs.append(key, value);
    }
  });
  const query = qs.toString();
  return request(`/api/services/list${query ? `?${query}` : ""}`);
};

// Vendor
export const registerVendor = (payload) =>
  request("/api/vendors/register", { method: "POST", body: payload, auth: true });
export const getMyVendors = () => request("/api/vendors/my", { auth: true });
export const getVendorBookings = () => request("/api/vendors/bookings", { auth: true });
export const updateBooking = (id, status) =>
  request(`/api/bookings/${id}`, { method: "PATCH", body: { status }, auth: true });