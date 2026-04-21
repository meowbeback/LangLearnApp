from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.content import LessonProgress
from app.models.user import Student, User
from app.schemas.content import ProfileStatsOut
from app.core.security import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/stats", response_model=ProfileStatsOut)
def get_profile_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    completed = (
        db.query(LessonProgress)
        .filter(
            LessonProgress.user_id == current_user.id,
            LessonProgress.status == "completed",
        )
        .count()
    )
    st = db.query(Student).filter(Student.id_user == current_user.id).first()
    streak = st.streak_days if st else 0
    points = float(st.total_points) if st else 0.0
    return ProfileStatsOut(
        completed_lessons_count=completed,
        current_streak=streak,
        total_points=points,
    )
