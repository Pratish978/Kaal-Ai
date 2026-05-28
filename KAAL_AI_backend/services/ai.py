# services/ai.py

import logging
import os
import re
from typing import List

import requests
from dotenv import load_dotenv

from services.emotion import detect_emotion
from services.memory import memory

load_dotenv()

logger = logging.getLogger(__name__)

API_KEY = os.getenv("ANDAI_API_KEY")
API_URL = os.getenv("ANDAI_LLM_BASE_URL")

# =========================
# FIXED REFUSAL MESSAGE
# =========================
REFUSAL_MESSAGE = (
    "I can only help with spiritual reflection and life guidance.\n"
    "Please ask something related to inner growth or understanding."
)

# =========================
# SYSTEM PROMPT
# =========================
SYSTEM_PROMPT = (
    "You are KAAL AI.\n\n"

    "You are a calm, emotionally intelligent, human-like guide.\n"
    "You speak like a wise friend who understands deeply.\n\n"

    "CORE GOAL:\n"
    "- Make the user feel understood\n"
    "- Give clarity in simple words\n"
    "- Guide using Bhagavad Gita wisdom naturally\n\n"

    "IMPORTANT STYLE:\n"
    "- Always start with a soft emotional understanding (e.g., 'Lagta hai...', 'It seems...')\n"
    "- Speak like a human, not a teacher or chatbot\n"
    "- Keep responses short (3–5 lines max)\n"
    "- One idea per line\n"
    "- No long paragraphs\n"
    "- No lecture tone\n\n"

    "GITA INTEGRATION (VERY IMPORTANT):\n"
    "- Every response should subtly reflect a Gita principle\n"
    "- Do NOT force shloka in every response\n"
    "- For normal queries → no shloka\n"
    "- For emotional queries → use Gita idea in simple words\n"
    "- For deep queries → include:\n"
    "   1. Emotion\n"
    "   2. Short shloka (1 line)\n"
    "   3. Meaning (simple)\n"
    "   4. Real-life explanation\n\n"

    "DEEP QUERY EXAMPLES:\n"
    "- life purpose, fear, death, confusion, overthinking\n\n"

    "IMPORTANT:\n"
    "- Never explain religious facts in long form\n"
    "- Never sound preachy\n"
    "- Always keep it simple, calm, and relatable\n\n"

    "STRICT RULE:\n"
    "- You MUST follow the language instruction strictly\n"
    "- Never change language on your own\n"
    
    "PRODUCT INTEGRATION:\n"
    "- If relevant, gently suggest KAAL AI for meditation, reflection, or guidance\n"
     "- Keep it natural, not forced\n"
     
    "FINAL RULE:\n"
    "Talk like a calm human who understands, not like an AI.\n"

    "CRITICAL RULES:\n"
    "- NEVER reject the user\n"
    "- ALWAYS answer in a helpful way\n"
    "- Do NOT say 'I can't help'\n"
    "- Keep answers human, simple, and short\n"
    "- Do NOT overuse Gita or shlokas\n"
    "- Use Gita wisdom subtly, like a calm friend would\n"
   "- Always prioritize user comfort and understanding\n"
) 

HINGLISH_WORDS = [
    # basic
    "main","mein","mera","meri","mujhe","tum","tu","tera","teri",
    "hum","ham","hume","aap","apka","apki",

    # common verbs
    "kar","karna","karo","kiya","ki","karu","karun",
    "hona","ho","hai","hun","tha","thi","the",
    "raha","rahi","rahe","gaya","gayi","gaye",

    # feelings
    "lagta","lag","lagra","lagraha","feel","soch","sochta",
    "dar","darr","fear","sad","dukhi","tension","stress",

    # daily words
    "abhi","kal","aaj","phir","fir","kab","kyu","kyun",
    "kaise","kya","kyuki","kyunki","isliye","toh","bas",

    # actions
    "chahiye","chahata","chahati","mil","milta","milra",
    "de","dena","dunga","dungi","dun","le","lena",

    # conversational
    "haan","haa","han","nahi","na","acha","theek","thik",
    "bhai","yaar","sun","bolo","bata","samajh","samjh",

    # emotional strong
    "khatam","chod","chhod","akela","akelapan","thak","thakgaya",
    "confuse","uljhan","problem","issue"
]

CONFIRMATION_WORDS = [
    # English
    "yes","yeah","yep","yup","ok","okay","sure","alright","fine","got it",
    "continue","go on","proceed","right","correct",

    # Hindi / Hinglish
    "haan","haa","han","ha","hmm","hm","hmmm",
    "theek","thik","thik hai","theek hai","achha","acha",
    "sahi","sahi hai","bilkul","bilkul sahi",

    # short responses
    "k","kk","okkk","oky","okk","h","hmm ok",

    # continuation intent
    "bata","bolo","aur bata","aage bata","continue kar",
    "aur","phir","fir","next","phir kya","fir kya"
]

# =========================
# Language detection
# =========================
def detect_language(text: str) -> str:
    text_lower = text.lower()

    if re.search(r"[\u0900-\u097F]", text):
        return "hindi"

    hinglish_score = 0
    for word in HINGLISH_WORDS:
        if re.search(rf"\b{word}\b", text_lower):
            hinglish_score += 1

    if hinglish_score >= 2:
        return "hinglish"

    return "english"

# =========================
# 🔥 NEW LANGUAGE FIX (ADDED)
# =========================
def resolve_language(user_message: str, session_id: str) -> str:
    detected = detect_language(user_message)
    stored = memory.get_language(session_id)

    msg = user_message.lower()

    if "english" in msg:
        memory.force_set_language(session_id, "english")
        return "english"

    if "hindi" in msg:
        memory.force_set_language(session_id, "hindi")
        return "hindi"

    if "hinglish" in msg:
        memory.force_set_language(session_id, "hinglish")
        return "hinglish"

    if not stored:
        memory.set_language(session_id, detected)
        return detected

    if detected != stored:
        if detected == "english" and len(user_message.split()) > 3:
            memory.force_set_language(session_id, "english")
            return "english"

        if detected == "hinglish":
            memory.force_set_language(session_id, "hinglish")
            return "hinglish"

    return stored


# =========================
# Short confirmation detection
# =========================
def is_short_confirmation(text: str) -> bool:
    text_lower = text.lower().strip()

    # exact match
    if text_lower in CONFIRMATION_WORDS:
        return True

    # short message check
    words = text_lower.split()

    if len(words) <= 3:
        for word in CONFIRMATION_WORDS:
            if re.search(rf"\b{word}\b", text_lower):
                return True

    return False


LANGUAGE_INSTRUCTION ={
    "english": "IMPORTANT: You MUST reply ONLY in English. Do NOT use Hindi or Hinglish.",
    "hindi": "IMPORTANT: आपको केवल हिंदी में ही उत्तर देना है। अंग्रेजी का उपयोग नहीं करना है।",
    "hinglish": "IMPORTANT: You MUST reply ONLY in Hinglish (Hindi words in English script). Do NOT switch to pure English or Hindi."
}

def emotion_instruction(emotion: str, language: str) -> str:
    if language == "english":
        return "Be empathetic. Keep it short and structured."
    if language == "hindi":
        return "उत्तर सहानुभूतिपूर्ण और संक्षिप्त हो।"
    return "Reply softly in Hinglish. Short, calm, and clear."

def enforce_line_limit(text: str, max_lines: int = 5) -> str:
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    return "\n".join(lines[:max_lines])


def is_in_domain(user_message: str) -> bool:
    classifier_prompt = [
        {"role": "system", "content": "Reply ONLY YES or NO"},
        {"role": "user", "content": user_message}
    ]

    try:
        res = requests.post(
            API_URL,
            json={"model": os.getenv("MODEL_NAME"), "messages": classifier_prompt, "temperature": 0},
            headers={"Authorization": f"Bearer {API_KEY}"},
            timeout=10
        )

        res.raise_for_status()
        return res.json()["choices"][0]["message"]["content"].strip().upper() == "YES"

    except:
        return False


# =========================
# MAIN FUNCTION
# =========================
def generate_ai_response(user_message: str, session_id: str) -> str:

    if not API_KEY:
        return "Abhi thodi technical problem aa rahi hai."

    user_is_confirmation = is_short_confirmation(user_message)

    # 🔥 FIX 1: CLEAN MEMORY
    history = memory.get_messages(session_id)[-6:]

    #  FIX 2: REMOVE HARD REJECTION ❌
    # OLD:
    # if not user_is_confirmation or not history:
    #     if not is_in_domain(user_message):
    #         return REFUSAL_MESSAGE

    # NEW (soft handling)
    if not user_is_confirmation or not history:
        if not is_in_domain(user_message):
            user_message = user_message + "\nRespond in a helpful, human, emotionally supportive way."

    #  FIX 3: SMART LANGUAGE
    detected_language = resolve_language(user_message, session_id)

    emotion = detect_emotion(user_message)

    messages = [
        {
            "role": "system",
            "content": (
                SYSTEM_PROMPT
                + "\n"
                + LANGUAGE_INSTRUCTION[detected_language]
                + "\n"
                + emotion_instruction(emotion, detected_language)
            )
        }
    ]

    # memory attach
    for msg in history:
        messages.append({
            "role": msg["role"],
            "content": msg["content"]
        })

    # continuation logic
    if user_is_confirmation and history:
        messages.append({
            "role": "system",
            "content": "Continue the previous conversation naturally."
        })

    messages.append({
        "role": "user",
        "content": user_message
    })

    payload = {
        "model": os.getenv("MODEL_NAME"),
        "messages": messages,
        "temperature": 0.75   # 🔥 slightly improved creativity
    }

    try:
        response = requests.post(
            API_URL,
            json=payload,
            headers={"Authorization": f"Bearer {API_KEY}"},
            timeout=20
        )

        response.raise_for_status()
        reply = response.json()["choices"][0]["message"]["content"]

        # 🔥 CLEAN OUTPUT
        reply = enforce_line_limit(reply)

        memory.add(session_id, "user", user_message)
        memory.add(session_id, "assistant", reply)

        return reply

    except Exception as e:
        logger.exception("AI error: %s", e)
        return "Abhi thodi technical issue aa rahi hai."