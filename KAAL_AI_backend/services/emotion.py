"""Emotion detection from user message text. Used to tune AI tone (see services.ai)."""

import re


def detect_emotion(text: str) -> str:
    """
    Classify message into one of: general, sadness, anger, fear, confusion, guilt, joy, neutral.
    General = greetings/casual; emotions = keyword-based; default = neutral.
    """
    text = text.lower().strip()

    # Greeting / casual detection (word boundaries)
    general_patterns = [
        r"\bhi\b",
        r"\bhello\b",
        r"\bhey\b",
        r"\bbye\b",
        r"\bgoodbye\b",
        r"how\s+are\s+you",
        r"who\s+are\s+you",
        r"what\s+can\s+you\s+do",
        r"\bthanks\b",
        r"\bthank\s+you\b",
        r"\bok\b"
    ]

    for pattern in general_patterns:
        if re.search(pattern, text):
            return "general"

    emotions = {
        "sadness": ["sad", "depressed", "unhappy", "cry", "lonely", "broken", "pain"],
        "anger": ["angry", "mad", "hate", "irritated", "furious", "frustrated"],
        "fear": ["scared", "fear", "anxious", "worried", "nervous", "panic"],
        "confusion": ["lost", "confused", "unsure", "doubt", "what to do"],
        "guilt": ["sorry", "guilty", "regret", "shame", "mistake"],
        "joy": ["happy", "joy", "blessed", "grateful", "excited", "peaceful"]
    }

    for emotion, keywords in emotions.items():
        if any(word in text for word in keywords):
            return emotion

    return "neutral"
