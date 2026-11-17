from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

import recommender as rec
from database import get_db
from locations import LOCATIONS
from models import Vendor

router = APIRouter(prefix="/api", tags=["AI Recommender"])


class RecommendIn(BaseModel):
    budget: float = Field(..., ge=10000, le=500000)
    area: str
    services: List[str] = ["hostel", "food", "laundry", "commute"]
    radius_km: float = Field(8, ge=1, le=30)


def vendor_dict(v, dist):
    return {
        "id": v.id,
        "name": v.business_name,
        "category": v.category,
        "area": v.area,
        "price": v.price,
        "rating": v.rating,
        "verified": v.is_verified,
        "distance_km": round(dist, 1),
        "seater": v.seater,
        "wifi": v.has_wifi,
        "backup": v.has_backup,
    }


@router.get("/locations")
def list_locations():
    return [{"name": n, "latitude": lat, "longitude": lng} for n, (lat, lng, _) in LOCATIONS.items()]


@router.post("/recommend")
def recommend(data: RecommendIn, db: Session = Depends(get_db)):
    if data.area not in LOCATIONS:
        raise HTTPException(status_code=400, detail="Unknown area. See /api/locations for the full list.")
    services = [s for s in data.services if s in rec.SERVICES]
    if not services:
        raise HTTPException(status_code=400, detail="Please select at least one service.")

    lat, lng, tier = LOCATIONS[data.area]
    alloc = rec.allocate(data.budget, tier, services)
    amounts = alloc["amounts"]

    # Food / laundry / commute
    others = {}
    for cat in services:
        if cat == "hostel":
            continue
        vendors = db.query(Vendor).filter(Vendor.category == cat).all()
        picked = rec.pick_service(vendors, lat, lng, data.radius_km, amounts[cat])
        others[cat] = vendor_dict(*picked) if picked else None

    # Hostels (KNN)
    hostel_options = [None]
    if "hostel" in services:
        hostels = db.query(Vendor).filter(Vendor.category == "hostel").all()
        hostel_options = rec.match_hostels(hostels, lat, lng, data.radius_km, amounts["hostel"], k=3)
        if not hostel_options:
            raise HTTPException(
                status_code=404,
                detail="No hostel matches your budget and radius. Please increase your budget or search radius.",
            )

    packages = []
    for rank, opt in enumerate(hostel_options, start=1):
        items = {}
        total = 0
        if opt:
            items["hostel"] = vendor_dict(*opt)
            total += opt[0].price
        for cat, v in others.items():
            items[cat] = v
            if v:
                total += v["price"]
        packages.append({
            "rank": rank,
            "services": items,
            "total_cost": total,
            "remaining": data.budget - total,
            "within_budget": total <= data.budget,
        })

    return {
        "area": data.area,
        "budget": data.budget,
        "allocation": alloc,
        "packages": packages,
    }