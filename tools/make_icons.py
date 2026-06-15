#!/usr/bin/env python3
"""Generate Grave Reaper app icons with zero dependencies (stdlib only).

Pillow isn't installed in this environment, so we draw a themed icon procedurally
and encode a valid PNG by hand (zlib + struct). The art is a glowing violet coffin
(elongated hexagon) with a pale cross on a dark radial-gradient background —
on-theme for "Grave Reaper" and recognisable at small sizes.

Outputs (run from repo root: `python3 tools/make_icons.py`):
  assets/icons/icon-192.png         PWA icon
  assets/icons/icon-512.png         PWA icon
  assets/icons/maskable-512.png     PWA maskable (extra safe-zone padding)
  assets/icons/apple-touch-icon.png iOS home-screen (180)
  assets/icons/favicon-32.png       browser tab
  resources/icon.png                1024 source for @capacitor/assets (APK icons)
"""

import os
import struct
import zlib

# ── colours (R, G, B) ────────────────────────────────────────────────────────
BG_CENTER   = (42, 15, 58)     # deep violet
BG_EDGE     = (8, 4, 16)       # near-black
COFFIN_FILL = (28, 12, 44)
COFFIN_TOP  = (70, 30, 104)    # lighter toward the top for a subtle sheen
BORDER      = (200, 150, 255)  # bright violet outline (matches in-game UI)
CROSS       = (236, 222, 255)  # pale

# Coffin outline as fractions of the icon size (an elongated hexagon).
COFFIN = [
    (0.39, 0.13), (0.61, 0.13),   # head
    (0.71, 0.35), (0.585, 0.88),  # right shoulder → foot
    (0.415, 0.88), (0.29, 0.35),  # left foot → shoulder
]


def lerp(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def point_in_poly(x, y, poly):
    inside = False
    n = len(poly)
    j = n - 1
    for i in range(n):
        xi, yi = poly[i]
        xj, yj = poly[j]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside


def dist_to_poly(x, y, poly):
    best = 1e9
    n = len(poly)
    for i in range(n):
        ax, ay = poly[i]
        bx, by = poly[(i + 1) % n]
        dx, dy = bx - ax, by - ay
        seg = dx * dx + dy * dy
        t = 0.0 if seg == 0 else max(0.0, min(1.0, ((x - ax) * dx + (y - ay) * dy) / seg))
        px, py = ax + t * dx, ay + t * dy
        d = ((x - px) ** 2 + (y - py) ** 2) ** 0.5
        if d < best:
            best = d
    return best


def shade(u, v, coffin, stroke):
    """Return an (r, g, b) colour for normalised coords u, v in [0, 1]."""
    # radial-gradient background
    du, dv = u - 0.5, v - 0.5
    r = min(1.0, (du * du + dv * dv) ** 0.5 / 0.65)
    col = lerp(BG_CENTER, BG_EDGE, r)

    if point_in_poly(u, v, coffin):
        # vertical sheen on the coffin body
        body = lerp(COFFIN_TOP, COFFIN_FILL, min(1.0, (v - 0.13) / 0.75))
        col = body
        if dist_to_poly(u, v, coffin) < stroke:
            col = BORDER
        else:
            # cross
            in_v = 0.468 <= u <= 0.532 and 0.40 <= v <= 0.71
            in_h = 0.41 <= u <= 0.59 and 0.475 <= v <= 0.540
            if in_v or in_h:
                col = CROSS
    return col


def render(size, pad=0.0, ss=3):
    """Render an icon at `size` px. `pad` shrinks the art toward the centre
    (for maskable safe zones). `ss` is the supersample factor for anti-aliasing."""
    big = size * ss
    stroke = 0.022
    # remap coffin coords into the padded area
    scale = 1.0 - 2 * pad

    def remap(p):
        return (0.5 + (p[0] - 0.5) * scale, 0.5 + (p[1] - 0.5) * scale)

    coffin = [remap(p) for p in COFFIN]

    # supersampled buffer
    buf = bytearray(big * big * 3)
    for py in range(big):
        v = (py + 0.5) / big
        row = py * big * 3
        for px in range(big):
            u = (px + 0.5) / big
            r, g, b = shade(u, v, coffin, stroke * scale)
            o = row + px * 3
            buf[o] = r
            buf[o + 1] = g
            buf[o + 2] = b

    # box-downsample ss×ss → size, emit RGBA scanlines (filter byte 0)
    raw = bytearray()
    for y in range(size):
        raw.append(0)
        for x in range(size):
            tr = tg = tb = 0
            for yy in range(ss):
                base = ((y * ss + yy) * big + x * ss) * 3
                for xx in range(ss):
                    o = base + xx * 3
                    tr += buf[o]
                    tg += buf[o + 1]
                    tb += buf[o + 2]
            n = ss * ss
            raw += bytes((tr // n, tg // n, tb // n, 255))
    return bytes(raw)


def write_png(path, size, raw):
    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xffffffff))

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)  # 8-bit RGBA
    png = (b"\x89PNG\r\n\x1a\n"
           + chunk(b"IHDR", ihdr)
           + chunk(b"IDAT", zlib.compress(raw, 9))
           + chunk(b"IEND", b""))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(png)
    print(f"  wrote {path} ({size}x{size})")


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    targets = [
        ("assets/icons/icon-192.png",         192, 0.0),
        ("assets/icons/icon-512.png",         512, 0.0),
        ("assets/icons/maskable-512.png",     512, 0.12),
        ("assets/icons/apple-touch-icon.png", 180, 0.06),
        ("assets/icons/favicon-32.png",        32, 0.0),
        ("resources/icon.png",               1024, 0.0),
    ]
    print("Generating icons…")
    cache = {}
    for rel, size, pad in targets:
        key = (size, pad)
        raw = cache.get(key) or render(size, pad)
        cache[key] = raw
        write_png(os.path.join(root, rel), size, raw)
    print("Done.")


if __name__ == "__main__":
    main()
