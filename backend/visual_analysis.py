
from PIL import Image
from collections import Counter
import os
import math


def hex_to_rgb(hex_color):
    """Convert HEX colour into RGB."""
    hex_color = hex_color.strip().lstrip("#")

    if len(hex_color) != 6:
        raise ValueError("Invalid HEX colour")

    return tuple(
        int(hex_color[i:i + 2], 16)
        for i in (0, 2, 4)
    )


def rgb_to_hex(rgb):
    """Convert RGB colour into HEX."""
    return "#{:02X}{:02X}{:02X}".format(*rgb)


def color_distance(color1, color2):
    """Calculate RGB colour distance."""
    return math.sqrt(
        sum((a - b) ** 2 for a, b in zip(color1, color2))
    )


def analyze_image(image_path, brand_colors):

    if not os.path.exists(image_path):
        raise FileNotFoundError("Image not found")

    if not brand_colors:
        raise ValueError("No brand colours provided")

    # Convert approved brand colours into RGB
    approved_colors = [
        hex_to_rgb(color)
        for color in brand_colors.split(",")
        if color.strip()
    ]

    if not approved_colors:
        raise ValueError("Invalid brand colour palette")

    # Open uploaded image
    image = Image.open(image_path).convert("RGB")

    # Resize for faster processing
    image.thumbnail((300, 300))

    # Extract dominant colours
    quantized = image.quantize(
        colors=10,
        method=Image.Quantize.MEDIANCUT
    )

    palette = quantized.getpalette()
    color_counts = Counter(quantized.getdata())

    total_pixels = sum(color_counts.values())

    dominant_colors = []

    for index, count in color_counts.most_common(10):

        rgb = tuple(palette[index * 3:index * 3 + 3])

        percentage = round(
            (count / total_pixels) * 100, 2
        )

        # Find closest approved brand colour
        closest_color = min(
            approved_colors,
            key=lambda brand_color: color_distance(
                rgb, brand_color
            )
        )

        distance = color_distance(rgb, closest_color)

        # Prototype matching threshold
        is_match = distance <= 60

        dominant_colors.append({
            "hex": rgb_to_hex(rgb),
            "percentage": percentage,
            "matches_brand": is_match,
            "closest_brand_color": rgb_to_hex(closest_color),
            "distance": round(distance, 2)
        })

    # Calculate weighted colour compliance
    matching_percentage = sum(
        color["percentage"]
        for color in dominant_colors
        if color["matches_brand"]
    )

    score = round(matching_percentage)

    return {
        "dominant_colors": dominant_colors,
        "approved_brand_colors": [
            rgb_to_hex(color)
            for color in approved_colors
        ],
        "color_compliance_score": score,
        "status": (
            "Good"
            if score >= 70
            else "Needs Improvement"
        )
    }
