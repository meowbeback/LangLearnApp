## @file profile.py
## @brief Роутер `/profile`: статистика пользователя для страницы профиля.

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.content import UserProgress
from app.models.user import User
from app.schemas.content import ProfileStatsOut
from app.core.security import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])

## @brief Число пройденных уроков и упрощённый streak по данным `UserProgress`.
@router.get("/stats", response_model=ProfileStatsOut)
def get_profile_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    completed_lessons = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.is_completed == True
    ).count()

    current_streak = 0
    if completed_lessons > 0:
        current_streak = 1

    return ProfileStatsOut(
        completed_lessons_count=completed_lessons,
        current_streak=current_streak
    )
