#!/usr/bin/env python3
"""One-time script to convert CSVs to JSON for static site (stdlib only)."""
import csv
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def read_csv(path):
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))

def num(s):
    if s is None or (isinstance(s, str) and not s.strip()):
        return None
    try:
        return int(float(s))
    except (ValueError, TypeError):
        return None

def float_or_none(s):
    if s is None or (isinstance(s, str) and not s.strip()):
        return None
    try:
        return float(s)
    except (ValueError, TypeError):
        return None

def str_or_none(s):
    if s is None: return None
    t = s.strip()
    return t if t else None

# mosque_about
rows = read_csv(os.path.join(ROOT, "mosque_about.csv"))
out = []
for r in rows:
    out.append({
        "mosque_name": str_or_none(r.get("mosque_name")),
        "decade_built": num(r.get("decade_built")),
        "decade_demolished": num(r.get("decade_demolished")),
        "latitude": float_or_none(r.get("latitude")),
        "longitude": float_or_none(r.get("longitude")),
        "image_url": str_or_none(r.get("image_url")),
        "description": str_or_none(r.get("description")),
        "traveler_quote": str_or_none(r.get("traveler quote")),
        "quote_author": str_or_none(r.get("quote author")),
    })
out_dir = os.path.join(ROOT, "data")
os.makedirs(out_dir, exist_ok=True)
with open(os.path.join(out_dir, "mosque_about.json"), "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

# mosques_decades
rows = read_csv(os.path.join(ROOT, "mosques_decades.csv"))
out2 = []
for r in rows:
    decade = num(r.get("decade"))
    if decade is None and r.get("decade"):
        try:
            decade = int(float(r["decade"]))
        except (ValueError, TypeError):
            continue
    if not r.get("mosque_name"):
        continue
    out2.append({
        "mosque_name": str_or_none(r.get("mosque_name")),
        "decade": decade,
        "what_happened": str_or_none(r.get("what_happend")),
        "how": str_or_none(r.get("how")),
    })
out2 = [x for x in out2 if x["mosque_name"] and x["decade"] is not None]

with open(os.path.join(out_dir, "mosques_decades.json"), "w", encoding="utf-8") as f:
    json.dump(out2, f, ensure_ascii=False, indent=2)

print("Wrote data/mosque_about.json and data/mosques_decades.json")
