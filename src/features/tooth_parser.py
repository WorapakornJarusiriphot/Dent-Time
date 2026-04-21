import math
from typing import Optional

_AREA_LABELS = {"full mouth", "upper", "lower"}


def parse_tooth_no(tooth_no: Optional[str]) -> dict:
    if tooth_no is None:
        return {"has_tooth_no": 0, "tooth_count": 0, "is_area_treatment": 0}
    if isinstance(tooth_no, float) and math.isnan(tooth_no):
        return {"has_tooth_no": 0, "tooth_count": 0, "is_area_treatment": 0}

    s = str(tooth_no).strip()

    if s.lower() in _AREA_LABELS:
        return {"has_tooth_no": 1, "tooth_count": 0, "is_area_treatment": 1}

    parts = [p.strip() for p in s.split(",") if p.strip()]
    return {"has_tooth_no": 1, "tooth_count": len(parts), "is_area_treatment": 0}
