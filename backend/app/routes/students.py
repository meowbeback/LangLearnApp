from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.content import Course
from app.models.user import User, Student
from app.schemas.content import StudentMeOut, StudentPatchIn
from app.core.security import get_current_user

router = APIRouter(prefix="/students", tags=["students"])


def _get_student(db: Session, user: User) -> Student:
    s = db.query(Student).filter(Student.id_user == user.id).first()
    if not s:
        raise HTTPException(status_code=500, detail="Student profile missing")
    return s


@router.get("/me", response_model=StudentMeOut)
def get_me(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    s = _get_student(db, current_user)
    onboarding_complete = bool(s.target_language and s.current_level)
    return StudentMeOut(
        id_user=s.id_user,
        current_level=s.current_level,
        target_language=s.target_language,
        id_course=s.id_course,
        streak_days=s.streak_days,
        total_points=s.total_points,
        onboarding_complete=onboarding_complete,
    )


@router.patch("/me", response_model=StudentMeOut)
def patch_me(
    body: StudentPatchIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    s = _get_student(db, current_user)
    if body.current_level is not None:
        s.current_level = body.current_level
    if body.target_language is not None:
        s.target_language = body.target_language
    if body.id_course is not None:
        if body.id_course != 0 and not db.query(Course).filter(Course.id == body.id_course).first():
            raise HTTPException(status_code=404, detail="Course not found")
        s.id_course = body.id_course if body.id_course != 0 else None
    db.commit()
    db.refresh(s)
    onboarding_complete = bool(s.target_language and s.current_level)
    return StudentMeOut(
        id_user=s.id_user,
        current_level=s.current_level,
        target_language=s.target_language,
        id_course=s.id_course,
        streak_days=s.streak_days,
        total_points=s.total_points,
        onboarding_complete=onboarding_complete,
    )
