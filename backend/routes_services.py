from typing import Optional
import random

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from auth import require_role
from database import get_db
from locations import LOCATIONS
from models import Booking, User, Vendor

router = APIRouter(prefix="/api", tags=["Services & Vendors"])

CATEGORIES = ["hostel", "food", "laundry", "commute", "pest"]
SEATERS = ["", "single", "bi", "tri"]


def vendor_out(v: Vendor):
    return {
        "id": v.id,
        "name": v.business_name,
        "category": v.category,
        "area": v.area,
        "address": v.address,
        "price": v.price,
        "rating": v.rating,
        "verified": v.is_verified,
        "seater": v.seater,
        "wifi": v.has_wifi,
        "backup": v.has_backup,
        "description": v.description,
        "latitude": v.latitude,
        "longitude": v.longitude,
    }


# ---------------- Services list ----------------
@router.get("/services/list")
def list_services(
    category: Optional[str] = None,
    area: Optional[str] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    seater: Optional[str] = None,
    verified_only: bool = False,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    q = db.query(Vendor)
    if category:
        if category not in CATEGORIES:
            raise HTTPException(status_code=400, detail=f"Category must be one of: {CATEGORIES}")
        q = q.filter(Vendor.category == category)
    if area:
        q = q.filter(Vendor.area == area)
    if max_price is not None:
        q = q.filter(Vendor.price <= max_price)
    if min_rating is not None:
        q = q.filter(Vendor.rating >= min_rating)
    if seater:
        q = q.filter(Vendor.seater == seater)
    if verified_only:
        q = q.filter(Vendor.is_verified == True)  # noqa: E712
    vendors = q.order_by(Vendor.rating.desc(), Vendor.price.asc()).limit(limit).all()
    return {"count": len(vendors), "results": [vendor_out(v) for v in vendors]}


@router.get("/services/{vendor_id}")
def service_detail(vendor_id: int, db: Session = Depends(get_db)):
    v = db.get(Vendor, vendor_id)
    if not v:
        raise HTTPException(status_code=404, detail="Service not found")
    return vendor_out(v)


# ---------------- Vendor register ----------------
class VendorRegisterIn(BaseModel):
    business_name: str = Field(..., min_length=3, max_length=80)
    category: str
    area: str
    address: str = ""
    price: float = Field(..., gt=0, le=1000000)  # PKR
    seater: str = ""
    has_wifi: bool = False
    has_backup: bool = False
    description: str = Field("", max_length=500)


@router.post("/vendors/register")
def register_vendor(
    data: VendorRegisterIn,
    user: User = Depends(require_role("vendor")),
    db: Session = Depends(get_db),
):
    if data.category not in CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Category must be one of: {CATEGORIES}")
    if data.area not in LOCATIONS:
        raise HTTPException(status_code=400, detail="Unknown area. See /api/locations for the full list.")
    if data.seater not in SEATERS:
        raise HTTPException(status_code=400, detail="Seater must be single, bi or tri")

    lat, lng, _ = LOCATIONS[data.area]
    vendor = Vendor(
        user_id=user.id,
        business_name=data.business_name,
        category=data.category,
        area=data.area,
        address=data.address or f"{data.area}, Lahore",
        latitude=lat + random.uniform(-0.006, 0.006),
        longitude=lng + random.uniform(-0.006, 0.006),
        price=data.price,
        seater=data.seater if data.category == "hostel" else "",
        has_wifi=data.has_wifi,
        has_backup=data.has_backup,
        description=data.description,
        rating=4.0,
        is_verified=False,  # an admin verifies listings later
    )
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return {"message": "Vendor registered successfully (verification pending)", "vendor": vendor_out(vendor)}


@router.get("/vendors/my")
def my_vendors(user: User = Depends(require_role("vendor")), db: Session = Depends(get_db)):
    vendors = db.query(Vendor).filter(Vendor.user_id == user.id).all()
    return [vendor_out(v) for v in vendors]


# ---------------- Bookings ----------------
class BookingIn(BaseModel):
    vendor_id: int


class BookingStatusIn(BaseModel):
    status: str  # confirmed | cancelled


@router.post("/bookings")
def create_booking(
    data: BookingIn,
    user: User = Depends(require_role("customer")),
    db: Session = Depends(get_db),
):
    vendor = db.get(Vendor, data.vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    existing = (
        db.query(Booking)
        .filter(Booking.customer_id == user.id, Booking.vendor_id == vendor.id, Booking.status == "pending")
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="You already have a pending booking with this vendor")
    booking = Booking(customer_id=user.id, vendor_id=vendor.id)
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return {"message": "Booking request sent", "booking_id": booking.id, "status": booking.status}


@router.get("/bookings/my")
def my_bookings(user: User = Depends(require_role("customer")), db: Session = Depends(get_db)):
    rows = (
        db.query(Booking, Vendor)
        .join(Vendor, Booking.vendor_id == Vendor.id)
        .filter(Booking.customer_id == user.id)
        .order_by(Booking.id.desc())
        .all()
    )
    return [
        {"booking_id": b.id, "status": b.status, "created_at": b.created_at.isoformat(), "vendor": vendor_out(v)}
        for b, v in rows
    ]


@router.get("/vendors/bookings")
def vendor_bookings(user: User = Depends(require_role("vendor")), db: Session = Depends(get_db)):
    rows = (
        db.query(Booking, Vendor, User)
        .join(Vendor, Booking.vendor_id == Vendor.id)
        .join(User, Booking.customer_id == User.id)
        .filter(Vendor.user_id == user.id)
        .order_by(Booking.id.desc())
        .all()
    )
    return [
        {
            "booking_id": b.id,
            "status": b.status,
            "created_at": b.created_at.isoformat(),
            "service": v.business_name,
            "customer": {"name": c.name, "phone": c.phone},
        }
        for b, v, c in rows
    ]


@router.patch("/bookings/{booking_id}")
def update_booking(
    booking_id: int,
    data: BookingStatusIn,
    user: User = Depends(require_role("vendor")),
    db: Session = Depends(get_db),
):
    if data.status not in ("confirmed", "cancelled"):
        raise HTTPException(status_code=400, detail="Status must be confirmed or cancelled")
    booking = db.get(Booking, booking_id)
    vendor = db.get(Vendor, booking.vendor_id) if booking else None
    if not booking or not vendor or vendor.user_id != user.id:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = data.status
    db.commit()
    return {"booking_id": booking.id, "status": booking.status}


# ---------------- Health & pest safety guide ----------------
@router.get("/health-guide")
def health_guide():
    return {
        "title": "Lahore Student Health & Home Safety Guide",
        "intro": "Seasonal health risks and practical safety measures for students living in hostels and rented rooms in Lahore.",
        "risks": [
            {
                "name": "Dengue Fever",
                "season": "Post-monsoon, typically August to November",
                "tips": [
                    "Do not allow water to stagnate in or around your room (coolers, buckets, old tyres, flower pots).",
                    "Mosquitoes are most active at dawn and dusk. Wear full-sleeved clothing and apply repellent.",
                    "Install mesh screens on windows and use mosquito nets at night.",
                    "Seek medical attention immediately if you develop high fever, severe body aches or pain behind the eyes.",
                ],
            },
            {
                "name": "Mosquitoes & Flies",
                "season": "Year-round, with a peak during the monsoon",
                "tips": [
                    "Keep the area around your hostel clean and free of standing water.",
                    "Arrange a professional pest-control spray at least once a month.",
                ],
            },
            {
                "name": "Snakes & Venomous Insects",
                "season": "Summer and monsoon, especially near vacant plots and green areas",
                "tips": [
                    "Seal gaps under doors and keep grass and garbage away from the building.",
                    "Use a torch when walking in the dark and avoid walking barefoot at night.",
                    "If you see a snake, do not try to catch or kill it. Move away and call Rescue 1122.",
                    "In case of a bite, keep the person calm and still, and go to the nearest hospital immediately.",
                    "Do not cut the wound, apply a tight tourniquet or try to suck out the venom.",
                ],
            },
        ],
        "emergency": {
            "rescue": "1122",
            "note": "In any medical emergency, call Rescue 1122 immediately.",
        },
        "service_category": "pest",
    }