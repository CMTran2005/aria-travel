import struct
from typing import Optional, Tuple

def parse_wkb_point(wkb_hex: str) -> Optional[Tuple[float, float]]:
    """
    Parse PostGIS EWKB hex string to (lat, lon).
    Handles standard PostGIS POINT geometry (SRID 4326).
    """
    if not wkb_hex or not isinstance(wkb_hex, str):
        return None
    try:
        data = bytes.fromhex(wkb_hex)
        # Byte order: 0 = big endian (>), 1 = little endian (<)
        byte_order = '<' if data[0] == 1 else '>'
        geom_type = struct.unpack(f"{byte_order}I", data[1:5])[0]
        
        # Check if EWKB with SRID (0x20000000 flag)
        has_srid = bool(geom_type & 0x20000000)
        offset = 5
        if has_srid:
            offset += 4  # skip 4 bytes SRID
            
        lon, lat = struct.unpack(f"{byte_order}dd", data[offset:offset+16])
        return round(lat, 6), round(lon, 6)
    except Exception:
        return None
