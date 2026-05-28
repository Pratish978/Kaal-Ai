from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from mongodb import db
from services.user_tracking import track_user_usage

router = APIRouter()

meditation_collection = db["meditation"]


@router.get("/meditation")
def get_meditation(
    background_tasks: BackgroundTasks,
    name: Optional[str] = None,
    email: Optional[str] = None
):
    """Return one meditation document from the collection."""
    try:
        meditation = meditation_collection.find_one({}, {"_id": 0})

        # Track user usage in background
        if name or email:
            background_tasks.add_task(track_user_usage, name, email)

        return meditation
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Meditation content is temporarily unavailable."
        )