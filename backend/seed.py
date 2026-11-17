import random

from database import Base, SessionLocal, engine
import models  # noqa: F401
from models import Vendor
from locations import LOCATIONS

random.seed(42)  # fixed seed so the generated data is reproducible

HOSTEL_NAMES = ["Al-Noor", "Scholars", "Campus Inn", "Green Valley", "Royal Stay", "City Nest", "Iqra", "Student Palace"]
FOOD_NAMES = ["Ammi Ka Dastarkhwan", "Desi Tiffin", "Bismillah Mess", "Ghar Ka Khana", "Zaiqa Tiffin"]
LAUNDRY_NAMES = ["QuickWash", "Clean & Press", "Fresh Fold", "Dhobi Express"]
COMMUTE_NAMES = ["CampusRide", "Student Cab", "BikeBuddy", "UniPool"]
PEST_NAMES = ["SafeHome Pest Control", "Dengue Guard", "Snake & Insect Shield", "Lahore Fumigation Co"]

SEATER_PRICES = {"single": (18000, 28000), "bi": (12000, 18000), "tri": (8000, 13000)}


def jitter(value, spread=0.0008):
    return value + random.uniform(-spread * 10, spread * 10)


def make(name, category, area, lat, lng, price, tier, **extra):
    return Vendor(
        business_name=f"{name} ({area})",
        category=category,
        area=area,
        address=f"{area}, Lahore",
        latitude=jitter(lat),
        longitude=jitter(lng),
        price=round(price * tier / 500) * 500,  # round to the nearest PKR 500
        rating=round(random.uniform(3.6, 4.9), 1),
        is_verified=random.random() > 0.2,
        **extra,
    )


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    if db.query(Vendor).count() > 0:
        print("Seed data already exists. Skipping.")
        db.close()
        return

    vendors = []
    for area, (lat, lng, tier) in LOCATIONS.items():
        # Three hostels per area (single, bi and tri-seater)
        for seater in ["single", "bi", "tri"]:
            low, high = SEATER_PRICES[seater]
            vendors.append(make(
                random.choice(HOSTEL_NAMES), "hostel", area, lat, lng,
                random.randint(low, high), tier,
                seater=seater,
                has_wifi=random.random() > 0.25,
                has_backup=random.random() > 0.4,
                description=f"{seater.capitalize()}-seater hostel room in {area}",
            ))
        vendors.append(make(random.choice(FOOD_NAMES), "food", area, lat, lng,
                            random.randint(8000, 12000), tier,
                            description="Monthly home-cooked meal plan (2 meals/day)"))
        vendors.append(make(random.choice(LAUNDRY_NAMES), "laundry", area, lat, lng,
                            random.randint(2000, 4000), tier,
                            description="Monthly pickup & drop laundry + ironing"))
        vendors.append(make(random.choice(COMMUTE_NAMES), "commute", area, lat, lng,
                            random.randint(4000, 7000), tier,
                            description="Monthly student commute / ride package"))
        vendors.append(make(random.choice(PEST_NAMES), "pest", area, lat, lng,
                            random.randint(1500, 4000), 1.0,
                            description="Insect, mosquito & snake-repellent spray (per visit)"))

    db.add_all(vendors)
    db.commit()
    print(f"Done! {len(vendors)} vendors added across {len(LOCATIONS)} areas.")
    db.close()


if __name__ == "__main__":
    run()