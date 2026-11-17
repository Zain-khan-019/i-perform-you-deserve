import math

import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.tree import DecisionTreeRegressor

from locations import LOCATIONS

SERVICES = ["hostel", "food", "laundry", "commute"]


# ---------- 1) Budget allocation model (Decision Tree Regressor) ----------
def _make_training_data(n=3000, seed=42):
    """Generate synthetic training data for the demo.

    Premium areas raise the hostel share of the budget, while a larger
    total budget slightly lowers it.
    """
    rng = np.random.default_rng(seed)
    tiers = [t for _, _, t in LOCATIONS.values()]
    X, y = [], []
    for _ in range(n):
        budget = rng.uniform(20000, 100000)
        tier = rng.choice(tiers)
        flags = rng.integers(0, 2, size=4)
        if flags.sum() == 0:
            flags[0] = 1
        hostel = 0.50 + 0.12 * (tier - 1.0) - 0.05 * (budget - 40000) / 60000
        base = np.array([
            min(max(hostel, 0.40), 0.58),  # hostel
            0.28,                          # food
            0.07,                          # laundry
            0.12,                          # commute
        ])
        shares = (base + rng.normal(0, 0.01, 4)) * flags
        shares = shares / shares.sum()
        X.append([budget, tier, *flags])
        y.append(shares)
    return np.array(X), np.array(y)


_X, _y = _make_training_data()
_model = DecisionTreeRegressor(max_depth=8, min_samples_leaf=20, random_state=42).fit(_X, _y)


def allocate(budget, tier, services):
    """Split the monthly budget across the selected services."""
    flags = [1 if s in services else 0 for s in SERVICES]
    pred = _model.predict([[budget, tier, *flags]])[0]
    pred = np.clip(pred, 0, None) * np.array(flags)
    pred = pred / pred.sum()
    return {
        "percent": {s: round(float(p) * 100, 1) for s, p in zip(SERVICES, pred)},
        "amounts": {s: int(round(float(p) * budget / 500) * 500) for s, p in zip(SERVICES, pred)},
    }


# ---------- 2) Location + price matcher (KNN) ----------
def haversine_km(lat1, lng1, lat2, lng2):
    """Great-circle distance between two coordinates, in kilometres."""
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = p2 - p1
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def match_hostels(hostels, lat, lng, radius_km, hostel_budget, k=3):
    """Return the k best hostels within the radius and budget, ranked by KNN."""
    cands = []
    for h in hostels:
        d = haversine_km(lat, lng, h.latitude, h.longitude)
        if d <= radius_km and h.price <= hostel_budget * 1.05:
            cands.append((h, d))
    if not cands:
        return []
    feats = np.array([[d / radius_km, h.price / hostel_budget] for h, d in cands])
    query = np.array([[0.0, 0.95]])  # ideal match: closest distance, price just under budget
    knn = NearestNeighbors(n_neighbors=min(k, len(cands))).fit(feats)
    _, idx = knn.kneighbors(query)
    return [cands[i] for i in idx[0]]


def pick_service(vendors, lat, lng, radius_km, budget):
    """Pick the best food/laundry/commute vendor: high rating, nearby, within budget."""
    best, best_score = None, -1e9
    for v in vendors:
        d = haversine_km(lat, lng, v.latitude, v.longitude)
        if d > radius_km or v.price > budget * 1.1:
            continue
        score = v.rating - 0.15 * d - 0.5 * (v.price / budget)
        if score > best_score:
            best, best_score = (v, d), score
    return best