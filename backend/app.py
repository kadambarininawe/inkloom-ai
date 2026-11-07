
from flask import Flask, jsonify, request
from flask_cors import CORS
from database import get_db_connection

import os
import re

from dotenv import load_dotenv
from google import genai
from google.genai import types


# -------------------------------
# CONFIGURATION
# -------------------------------

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = (
    genai.Client(
        api_key=GEMINI_API_KEY,
        http_options=types.HttpOptions(timeout=30000)
    )
    if GEMINI_API_KEY else None
)

app = Flask(__name__)
CORS(app)


# -------------------------------
# HOME AND HEALTH
# -------------------------------

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "INKLOOM AI Backend is running!",
        "status": "success"
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "application": "INKLOOM AI",
        "backend": "Flask",
        "status": "healthy"
    })


# -------------------------------
# SAVE REVIEW
# -------------------------------

@app.route("/api/reviews", methods=["POST"])
def save_review():

    data = request.get_json(silent=True) or {}

    required_fields = [
        "brand_name",
        "content",
        "score",
        "issues",
        "status"
    ]

    if not all(field in data for field in required_fields):
        return jsonify({
            "error": "Missing required fields"
        }), 400

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "error": "Database connection failed"
        }), 500

    cursor = None

    try:
        cursor = connection.cursor()

        query = """
            INSERT INTO review_history
            (brand_name, content, compliance_score, issues_count, status)
            VALUES (%s, %s, %s, %s, %s)
        """

        values = (
            data["brand_name"],
            data["content"],
            int(data["score"]),
            int(data["issues"]),
            data["status"]
        )

        cursor.execute(query, values)
        connection.commit()

        return jsonify({
            "message": "Review saved successfully!",
            "review_id": cursor.lastrowid,
            "status": "success"
        }), 201

    except Exception as error:
        connection.rollback()

        return jsonify({
            "error": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        connection.close()


# -------------------------------
# GET REVIEWS
# -------------------------------

@app.route("/api/reviews", methods=["GET"])
def get_reviews():

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "error": "Database connection failed"
        }), 500

    cursor = None

    try:
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT * FROM review_history
            ORDER BY reviewed_at DESC
        """)

        reviews = cursor.fetchall()

        for review in reviews:
            review["reviewed_at"] = str(review["reviewed_at"])

        return jsonify(reviews)

    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        connection.close()


# -------------------------------
# UPDATE REVIEW STATUS
# -------------------------------

@app.route("/api/reviews/<int:review_id>", methods=["PUT"])
def update_review_status(review_id):

    data = request.get_json(silent=True) or {}
    status = data.get("status")

    if status not in ["Approved", "Needs Changes"]:
        return jsonify({
            "error": "Invalid status"
        }), 400

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "error": "Database connection failed"
        }), 500

    cursor = None

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE review_history
            SET status = %s
            WHERE id = %s
            """,
            (status, review_id)
        )

        updated = cursor.rowcount
        connection.commit()

        if updated == 0:
            return jsonify({
                "error": "Review not found"
            }), 404

        return jsonify({
            "message": "Review status updated",
            "status": status
        }), 200

    except Exception as error:
        connection.rollback()

        return jsonify({
            "error": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        connection.close()


# -------------------------------
# SAVE BRAND GUIDELINES
# -------------------------------

@app.route("/api/brand", methods=["POST"])
def save_brand():

    data = request.get_json(silent=True) or {}

    required_fields = [
        "brand_name",
        "tone",
        "personality",
        "approved_words",
        "restricted_words",
        "brand_rules"
    ]

    if not all(field in data for field in required_fields):
        return jsonify({
            "error": "Missing brand information"
        }), 400

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "error": "Database connection failed"
        }), 500

    cursor = None

    try:
        cursor = connection.cursor()

        cursor.execute("""
            DELETE FROM brand_guidelines
            WHERE brand_name = %s
        """, (data["brand_name"],))

        cursor.execute("""
            INSERT INTO brand_guidelines
            (
                brand_name,
                tone,
                personality,
                approved_words,
                restricted_words,
                brand_rules,
                brand_colors
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            data["brand_name"],
            data["tone"],
            data["personality"],
            data["approved_words"],
            data["restricted_words"],
            data["brand_rules"],
            data.get("brand_colors", "")
        ))

        connection.commit()

        return jsonify({
            "message": "Brand guidelines saved successfully!",
            "status": "success"
        }), 201

    except Exception as error:
        connection.rollback()

        return jsonify({
            "error": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        connection.close()


# -------------------------------
# GET BRAND GUIDELINES
# -------------------------------

@app.route("/api/brand", methods=["GET"])
def get_brand():

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "error": "Database connection failed"
        }), 500

    cursor = None

    try:
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT * FROM brand_guidelines
            ORDER BY id DESC
            LIMIT 1
        """)

        brand = cursor.fetchone()

        return jsonify(brand or {})

    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        connection.close()


# -------------------------------
# ANALYZE IMAGE WITH GEMINI AI
# -------------------------------

@app.route("/api/analyze-image", methods=["POST"])
def analyze_image():

    print(
        "INKLOOM: Image analysis request received.",
        flush=True
    )

    if client is None:
        return jsonify({
            "error": "Gemini API key is not configured."
        }), 500

    if "image" not in request.files:
        return jsonify({
            "error": "Please upload an image."
        }), 400

    image = request.files["image"]

    if not image.filename:
        return jsonify({
            "error": "No image selected."
        }), 400

    if image.mimetype not in ["image/jpeg", "image/png"]:
        return jsonify({
            "error": "Only JPG and PNG images are supported."
        }), 400

    image_bytes = image.read(5 * 1024 * 1024 + 1)

    if len(image_bytes) > 5 * 1024 * 1024:
        return jsonify({
            "error": "Image size must be below 5 MB."
        }), 400

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "error": "Database connection failed."
        }), 500

    cursor = None

    try:
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT * FROM brand_guidelines
            ORDER BY id DESC
            LIMIT 1
        """)

        brand = cursor.fetchone()

        if not brand:
            return jsonify({
                "error": "Please save Brand DNA before analysing an image."
            }), 400

        prompt = f"""
You are INKLOOM AI, a brand-governance assistant.

Analyse the uploaded marketing image against these saved brand guidelines.

BRAND NAME: {brand.get('brand_name', '')}
BRAND PERSONALITY: {brand.get('personality', '')}
TONE: {brand.get('tone', '')}
APPROVED WORDS: {brand.get('approved_words', '')}
RESTRICTED WORDS: {brand.get('restricted_words', '')}
BRAND RULES: {brand.get('brand_rules', '')}
APPROVED COLOURS: {brand.get('brand_colors', '')}

Provide your analysis in these sections:

1. Brand Consistency Score (0-100)
2. Colour Consistency
3. Tone and Messaging Consistency
4. Restricted Wording Detection
5. Visual Inconsistencies
6. Specific Improvement Suggestions

For every issue, provide exact evidence, the relevant guideline,
and classification.

Do not invent violations. Explain uncertainty.
Do not automatically approve or reject content.
The final decision belongs to a human reviewer.
"""

        print(
            "INKLOOM: Sending image to Gemini...",
            flush=True
        )

        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=[
                prompt,
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=image.mimetype
                )
            ]
        )

        print(
            "INKLOOM: Gemini response received!",
            flush=True
        )

        analysis_text = response.text or ""

        # Extract compliance score
        score_match = re.search(
            r"(?:Brand Consistency Score|Brand Consistency|Score)"
            r"\s*[:\-]\s*(\d{1,3})\s*/\s*100",
            analysis_text,
            re.IGNORECASE
        )

        compliance_score = (
            int(score_match.group(1))
            if score_match else None
        )

        # Count identified issues
        issues_count = len(re.findall(
            r"Direct Violation|Potential Violation|"
            r"Style Inconsistency|Critical Violation|"
            r"Major Violation|Minor Violation",
            analysis_text,
            re.IGNORECASE
        ))

        # Save image analysis to review history
        cursor.execute("""
            INSERT INTO review_history
            (
                brand_name,
                content,
                compliance_score,
                issues_count,
                status
            )
            VALUES (%s, %s, %s, %s, %s)
        """, (
            brand.get("brand_name", ""),
            "IMAGE ANALYSIS:\n" + analysis_text,
            compliance_score,
            issues_count,
            "Pending"
        ))

        connection.commit()

        print(
            "INKLOOM: Image analysis saved to history!",
            flush=True
        )

        return jsonify({
            "status": "success",
            "brand_name": brand.get("brand_name", ""),
            "analysis": analysis_text,
            "saved_to_history": True
        }), 200

    except Exception as error:

        connection.rollback()

        print(
            "INKLOOM ERROR:",
            str(error),
            flush=True
        )

        return jsonify({
            "error": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        connection.close()


# -------------------------------
# RUN FLASK SERVER
# -------------------------------

if __name__ == "__main__":
    app.run(
        debug=True,
        port=5000
    )
