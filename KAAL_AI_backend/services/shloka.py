"""
Shloka retrieval: embed user input via Jina, query Pinecone index,
return best-match metadata (safe + stable version).
"""

import os
import logging
import requests
import json  # ✅ added (for emotion_map fix)
from dotenv import load_dotenv
from pinecone import Pinecone

load_dotenv()

logger = logging.getLogger(__name__)

JINA_API_KEY = os.getenv("JINA_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = os.getenv("PINECONE_INDEX")

pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)


def get_relevant_shloka(user_input: str) -> dict | None:
    """
    Embed user_input with Jina, query Pinecone, return best match metadata.

    Returns:
        dict OR None (never crash)
    """

    if not user_input or len(user_input.strip()) < 3:
        return None  # 🔥 no error → safe return

    try:
        # -------------------------
        # STEP 1: Get embedding
        # -------------------------
        headers = {"Authorization": f"Bearer {JINA_API_KEY}"}
        payload = {
            "model": "jina-embeddings-v3",
            "task": "retrieval.query",
            "dimensions": 1024,
            "input": [user_input]
        }

        res = requests.post(
            "https://api.jina.ai/v1/embeddings",
            json=payload,
            headers=headers,
            timeout=10
        )

        res.raise_for_status()
        data = res.json()

        if "data" not in data or not data["data"]:
            logger.warning("Empty embedding response")
            return None

        vector = data["data"][0]["embedding"]

        # -------------------------
        # STEP 2: Query Pinecone
        # -------------------------
        result = index.query(
            vector=vector,
            top_k=4,  # 🔥 better matching
            include_metadata=True
        )

        matches = result.get("matches", [])

        # 🔥 NO MATCH → RETURN NONE (NO ERROR)
        if not matches:
            return None

        # -------------------------
        # STEP 3: Best match
        # -------------------------
        best = matches[0]
        score = best.get("score", 0)

        # 🔥 LOW CONFIDENCE → IGNORE
        if score < 0.5:
            logger.info(f"Low score match ignored: {score}")
            return None

        metadata = best.get("metadata", {})

        # -------------------------
        # STEP 4: Extract NEW fields
        # -------------------------
        sanskrit = metadata.get("sanskrit", "").strip()

        meaning_en = metadata.get("meaning_english", "").strip()
        meaning_hi = metadata.get("meaning_hindi", "").strip()
        meaning_hinglish = metadata.get("meaning_hinglish", "").strip()
        meaning_mr = metadata.get("meaning_marathi", "").strip()

        core_meaning = metadata.get("core_meaning", "").strip()
        use_cases = metadata.get("use_cases", [])

        # ✅ FIX: emotion_map string → dict
        emotion_map_raw = metadata.get("emotion_map", "{}")
        try:
            emotion_map = json.loads(emotion_map_raw) if isinstance(emotion_map_raw, str) else emotion_map_raw
        except:
            emotion_map = {}

        # 🔥 SAFETY CHECK
        if not (meaning_en or core_meaning):
            return None

        # -------------------------
        # STEP 5: Return updated format
        # -------------------------
        return {
            "sanskrit": sanskrit,
            "meaning": {
                "english": meaning_en,
                "hindi": meaning_hi,
                "hinglish": meaning_hinglish,
                "marathi": meaning_mr
            },
            "core_meaning": core_meaning,
            "use_cases": use_cases,
            "emotion_map": emotion_map,
            "score": score
        }

    except requests.exceptions.RequestException as e:
        logger.exception("Jina API error: %s", e)
        return None

    except Exception as e:
        logger.exception("Shloka retrieval error: %s", e)
        return None