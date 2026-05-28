import logging
from typing import Optional

from fastapi import APIRouter, Depends, BackgroundTasks
from pydantic import BaseModel, Field

from services.ai import generate_ai_response

from services.memory import memory
from services.shloka import get_relevant_shloka
from services.user_tracking import track_user_usage

logger = logging.getLogger(__name__)

router = APIRouter()


# -------------------------
# Request / Response schemas
# -------------------------
class ChatRequest(BaseModel):
    session_id: str = Field(..., max_length=256)
    message: str = Field(..., max_length=4096)


class ChatResponse(BaseModel):
    reply: str


# -------------------------
# Confirmation words
# -------------------------
CONFIRM_WORDS = [
    "ha", "haan", "yes", "yes please",
    "ok", "okay", "please", "sure"
]


# -------------------------
# Shloka intent keywords
# -------------------------
SHLOKA_KEYWORDS = [
    "shloka", "shlok", "geeta", "gita", "bhagavad gita",
    "sanskrit verse", "quote a shloka"
]


def wants_shloka(text: str) -> bool:
    text = text.lower()
    return any(k in text for k in SHLOKA_KEYWORDS)


# -------------------------
# Main chat endpoint
# -------------------------
@router.post("/chat", response_model=ChatResponse)
def chat(
    req: ChatRequest,
    background_tasks: BackgroundTasks,
    name: Optional[str] = None,
    email: Optional[str] = None
):
    session_id = req.session_id
    user_message = req.message.strip()
    user_lower = user_message.lower()

    # --------------------------------------------------
    # Handle confirmation replies (yes / ha / ok)
    # --------------------------------------------------
    intent = memory.get_intent(session_id)

    if intent and user_lower in CONFIRM_WORDS:
        memory.clear_intent(session_id)

        if intent == "social_anxiety_tips":
            reply = (
                "Theek hai 💛\n\n"
                "Yeh 3 simple tips social anxiety mein madad karti hain:\n\n"
                "1️⃣ Breathing reset – 4 sec inhale, 6 sec exhale\n"
                "2️⃣ Small exposure – ek ya do logon se baat se start karo\n"
                "3️⃣ Mindset shift – log zyada apne baare mein sochte hain\n\n"
                "Hum dheere-dheere improve kar sakte hain 🌱"
            )

            memory.add(session_id, "user", user_message)
            memory.add(session_id, "assistant", reply)
            background_tasks.add_task(track_user_usage, name, email, "chat")
            return ChatResponse(reply=reply)

    # --------------------------------------------------
    # Shloka routing (ONLY if explicitly asked)
    # --------------------------------------------------
    if wants_shloka(user_message):
        try:
            shloka = get_relevant_shloka(user_message)
            reply = generate_ai_response(
                f"{user_message}\n\n{shloka}",
                session_id=session_id
            )
            background_tasks.add_task(track_user_usage, name, email, "chat")
            return ChatResponse(reply=reply)
        except ValueError as e:
            logger.warning("Shloka not found for session %s: %s", session_id, e)
            reply = (
                "Abhi is sawal ke liye koi shloka nahi mila. "
                "Aap koi aur sawal poochh sakte hain."
            )
            memory.add(session_id, "user", user_message)
            memory.add(session_id, "assistant", reply)
            background_tasks.add_task(track_user_usage, name, email, "chat")
            return ChatResponse(reply=reply)
        except Exception as e:
            logger.exception("Shloka lookup failed for session %s: %s", session_id, e)
            reply = (
                "Abhi thodi technical problem aa rahi hai. "
                "Aap thoda sa ruk kar phir try karein."
            )
            memory.add(session_id, "user", user_message)
            memory.add(session_id, "assistant", reply)
            background_tasks.add_task(track_user_usage, name, email, "chat")
            return ChatResponse(reply=reply)

    # --------------------------------------------------
    # Default AI response
    # --------------------------------------------------
    reply = generate_ai_response(
        user_message=user_message,
        session_id=session_id
    )

    if "tips" in reply.lower() and "bata" in reply.lower():
        memory.set_intent(session_id, "social_anxiety_tips")

    background_tasks.add_task(track_user_usage, name, email, "chat")
    return ChatResponse(reply=reply)
