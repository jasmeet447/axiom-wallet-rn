#!/usr/bin/env python3
"""
generate_icons.py
Renders the Ionicons "diamond" glyph onto the app background colour and
outputs every PNG size required by Android and iOS.

Background : #0A0A0F  (darkPalette.bg)
Icon colour : #6C63FF  (darkPalette.primary)
Circle bg   : #1A1A2E  (darkPalette.card)
"""

import os
import math
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont

# ── Paths ──────────────────────────────────────────────────────────────────────
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TTF_PATH = os.path.join(
    ROOT,
    "node_modules/react-native-vector-icons/Fonts/Ionicons.ttf",
)
ANDROID_RES = os.path.join(ROOT, "android/app/src/main/res")
IOS_APPICONSET = os.path.join(
    ROOT,
    "ios/AxiomWallet/Images.xcassets/AppIcon.appiconset",
)

# ── Design tokens (match app theme) ──────────────────────────────────────────
BG_COLOR       = (10,  10,  15,  255)   # #0A0A0F
CARD_COLOR     = (26,  26,  46,  255)   # #1A1A2E
PRIMARY_COLOR  = (108, 99,  255, 255)   # #6C63FF
BORDER_COLOR   = (255, 255, 255, 20)    # subtle border

# "diamond" glyph codepoint in Ionicons
DIAMOND_CODEPOINT = 0xEB82  # decimal 60290 — filled diamond

def get_diamond_codepoint():
    """Extract the exact codepoint for 'diamond' from the TTF cmap."""
    tt = TTFont(TTF_PATH)
    glyph_map = {}
    for table in tt["cmap"].tables:
        glyph_map.update(table.cmap)
    # react-native-vector-icons reports decimal 60322 → 0xEBA2
    return 0xEBA2


DIAMOND_CP = get_diamond_codepoint()


def render_icon(size: int) -> Image.Image:
    """
    Render one square icon at `size` x `size` px.
    Layout mirrors SetupScreen's logoWrap circle.
    """
    img = Image.new("RGBA", (size, size), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # ── Circle background (card colour) ──────────────────────────────────────
    padding = int(size * 0.08)
    circle_bbox = [padding, padding, size - padding, size - padding]
    draw.ellipse(circle_bbox, fill=CARD_COLOR, outline=BORDER_COLOR, width=max(1, size // 96))

    # ── Diamond glyph ─────────────────────────────────────────────────────────
    glyph_size = int(size * 0.46)
    try:
        font = ImageFont.truetype(TTF_PATH, glyph_size)
    except Exception as e:
        raise RuntimeError(f"Could not load font: {e}")

    glyph_char = chr(DIAMOND_CP)

    # Measure glyph bounding box
    bbox = font.getbbox(glyph_char)
    glyph_w = bbox[2] - bbox[0]
    glyph_h = bbox[3] - bbox[1]

    x = (size - glyph_w) // 2 - bbox[0]
    y = (size - glyph_h) // 2 - bbox[1]

    draw.text((x, y), glyph_char, fill=PRIMARY_COLOR, font=font)

    return img


def save_png(img: Image.Image, path: str):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, "PNG")
    print(f"  ✓ {os.path.relpath(path, ROOT)}")


# ── Android sizes ─────────────────────────────────────────────────────────────
ANDROID_SIZES = {
    "mipmap-mdpi":    48,
    "mipmap-hdpi":    72,
    "mipmap-xhdpi":   96,
    "mipmap-xxhdpi":  144,
    "mipmap-xxxhdpi": 192,
}

# ── iOS AppIcon sizes (all required by Xcode / App Store) ────────────────────
IOS_SIZES = [
    # iPhone
    ("Icon-20@2x.png",   40),
    ("Icon-20@3x.png",   60),
    ("Icon-29@2x.png",   58),
    ("Icon-29@3x.png",   87),
    ("Icon-40@2x.png",   80),
    ("Icon-40@3x.png",   120),
    ("Icon-60@2x.png",   120),
    ("Icon-60@3x.png",   180),
    # iPad
    ("Icon-20@1x.png",   20),
    ("Icon-20@2x~ipad.png", 40),
    ("Icon-29@1x.png",   29),
    ("Icon-29@2x~ipad.png", 58),
    ("Icon-40@1x.png",   40),
    ("Icon-40@2x~ipad.png", 80),
    ("Icon-76@1x.png",   76),
    ("Icon-76@2x.png",   152),
    ("Icon-83.5@2x.png", 167),
    # App Store
    ("Icon-1024.png",    1024),
]

IOS_CONTENTS = """{
  "images" : [
    { "filename" : "Icon-20@2x.png",      "idiom" : "iphone", "scale" : "2x", "size" : "20x20" },
    { "filename" : "Icon-20@3x.png",      "idiom" : "iphone", "scale" : "3x", "size" : "20x20" },
    { "filename" : "Icon-29@2x.png",      "idiom" : "iphone", "scale" : "2x", "size" : "29x29" },
    { "filename" : "Icon-29@3x.png",      "idiom" : "iphone", "scale" : "3x", "size" : "29x29" },
    { "filename" : "Icon-40@2x.png",      "idiom" : "iphone", "scale" : "2x", "size" : "40x40" },
    { "filename" : "Icon-40@3x.png",      "idiom" : "iphone", "scale" : "3x", "size" : "40x40" },
    { "filename" : "Icon-60@2x.png",      "idiom" : "iphone", "scale" : "2x", "size" : "60x60" },
    { "filename" : "Icon-60@3x.png",      "idiom" : "iphone", "scale" : "3x", "size" : "60x60" },
    { "filename" : "Icon-20@1x.png",      "idiom" : "ipad",   "scale" : "1x", "size" : "20x20" },
    { "filename" : "Icon-20@2x~ipad.png", "idiom" : "ipad",   "scale" : "2x", "size" : "20x20" },
    { "filename" : "Icon-29@1x.png",      "idiom" : "ipad",   "scale" : "1x", "size" : "29x29" },
    { "filename" : "Icon-29@2x~ipad.png", "idiom" : "ipad",   "scale" : "2x", "size" : "29x29" },
    { "filename" : "Icon-40@1x.png",      "idiom" : "ipad",   "scale" : "1x", "size" : "40x40" },
    { "filename" : "Icon-40@2x~ipad.png", "idiom" : "ipad",   "scale" : "2x", "size" : "40x40" },
    { "filename" : "Icon-76@1x.png",      "idiom" : "ipad",   "scale" : "1x", "size" : "76x76" },
    { "filename" : "Icon-76@2x.png",      "idiom" : "ipad",   "scale" : "2x", "size" : "76x76" },
    { "filename" : "Icon-83.5@2x.png",    "idiom" : "ipad",   "scale" : "2x", "size" : "83.5x83.5" },
    { "filename" : "Icon-1024.png",       "idiom" : "ios-marketing", "scale" : "1x", "size" : "1024x1024" }
  ],
  "info" : { "author" : "xcode", "version" : 1 }
}
"""

def main():
    print("\n── Generating Android icons ──────────────────────────────────────────")
    for folder, size in ANDROID_SIZES.items():
        img = render_icon(size)
        for name in ("ic_launcher.png", "ic_launcher_round.png"):
            save_png(img, os.path.join(ANDROID_RES, folder, name))

    print("\n── Generating iOS icons ──────────────────────────────────────────────")
    for filename, size in IOS_SIZES:
        img = render_icon(size)
        save_png(img, os.path.join(IOS_APPICONSET, filename))

    # Write Contents.json
    contents_path = os.path.join(IOS_APPICONSET, "Contents.json")
    with open(contents_path, "w") as f:
        f.write(IOS_CONTENTS)
    print(f"  ✓ {os.path.relpath(contents_path, ROOT)}")

    print("\n✅ All icons generated successfully.\n")


if __name__ == "__main__":
    main()
