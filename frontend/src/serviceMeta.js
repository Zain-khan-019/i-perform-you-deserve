import { Building2, UtensilsCrossed, Shirt, Car } from "lucide-react";

export const SERVICE_META = {
  hostel: { label: "Hostel", Icon: Building2, bar: "bg-royal", text: "text-royal" },
  food: { label: "Food / Mess", Icon: UtensilsCrossed, bar: "bg-emerald-500", text: "text-emerald-600" },
  laundry: { label: "Laundry", Icon: Shirt, bar: "bg-amber-500", text: "text-amber-600" },
  commute: { label: "Commute", Icon: Car, bar: "bg-sky-500", text: "text-sky-600" },
};

export const pkr = (n) => `PKR ${Math.round(n).toLocaleString("en-PK")}`;
