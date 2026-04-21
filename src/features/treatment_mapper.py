import json
import re
import math
from typing import Optional
from rapidfuzz import process, fuzz

FUZZY_MATCH_THRESHOLD = 85

_PREFIX_RE = re.compile(r"^([A-Za-z]+)\s*—")


def load_treatment_dict(path: str) -> dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def build_reverse_map(treatment_dict: dict) -> dict:
    """Maps each alias string (lowercased) to its canonical class name."""
    reverse = {}
    for class_name, aliases in treatment_dict.items():
        for alias in aliases:
            reverse[alias.lower()] = class_name
    return reverse


def map_treatment(raw: Optional[str], treatment_dict: dict, reverse_map: dict) -> str:
    if raw is None:
        return "UNKNOWN"
    if isinstance(raw, float) and math.isnan(raw):
        return "UNKNOWN"

    s = str(raw).strip()

    # Stage 1: structured prefix regex (e.g. "At — ปรับเครื่องมือ")
    m = _PREFIX_RE.match(s)
    if m:
        code = m.group(1).lower()
        if code in reverse_map:
            return reverse_map[code]

    # Stage 2: exact string match
    if s.lower() in reverse_map:
        return reverse_map[s.lower()]

    # Stage 3: fuzzy match
    candidates = list(reverse_map.keys())
    result = process.extractOne(s.lower(), candidates, scorer=fuzz.partial_ratio)
    if result and result[1] >= FUZZY_MATCH_THRESHOLD:
        return reverse_map[result[0]]

    return "UNKNOWN"
