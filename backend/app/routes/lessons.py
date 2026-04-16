## @file lessons.py
## @brief Роутер `/lessons`: каталог уроков, детали с заданиями, отметка прохождения.

from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db import get_db
from app.models.content import Lesson, Task, UserProgress
from app.models.user import User
from app.schemas.content import LessonDetailOut, LessonListOut, TaskBase
from app.core.security import get_current_user, SECRET_KEY, ALGORITHM
from jose import jwt
from datetime import datetime

router = APIRouter(prefix="/lessons", tags=["lessons"])
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

## @brief Возвращает пользователя по необязательному Bearer-токену (для списка уроков с `completed`).
def get_optional_user(token: Optional[str] = Security(oauth2_scheme_optional), db: Session = Depends(get_db)):
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username:
            return db.query(User).filter(User.username == username).first()
    except Exception:
        pass
    return None

## @brief Список уроков; для авторизованного пользователя добавляется `completed` и `tasks_count`.
@router.get("", response_model=List[LessonListOut])
def get_lessons(db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_optional_user)):
    lessons = db.query(Lesson).all()
    result = []

    completed_lesson_ids = set()
    if current_user:
        progress = db.query(UserProgress).filter(
            UserProgress.user_id == current_user.id,
            UserProgress.is_completed == True
        ).all()
        completed_lesson_ids = {p.lesson_id for p in progress}

    for lesson in lessons:
        tasks_count = db.query(Task).filter(Task.lesson_id == lesson.id).count()
        result.append(LessonListOut(
            id=lesson.id,
            title=lesson.title,
            level=lesson.level,
            order_index=lesson.order_index,
            completed=lesson.id in completed_lesson_ids if current_user else False,
            tasks_count=tasks_count,
        ))
    return result

## @brief Урок по идентификатору с полным списком заданий.
@router.get("/{lesson_id}", response_model=LessonDetailOut)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    tasks = db.query(Task).filter(Task.lesson_id == lesson_id).all()
    task_list = [
        TaskBase(
            id=t.id,
            type=t.type,
            question=t.question,
            options=t.options,
            correct_answer=t.correct_answer,
        )
        for t in tasks
    ]

    return LessonDetailOut(
        id=lesson.id,
        title=lesson.title,
        level=lesson.level,
        order_index=lesson.order_index,
        tasks=task_list
    )

## @brief Создаёт или обновляет запись прогресса: урок пройден (требуется JWT).
@router.post("/{lesson_id}/complete")
def complete_lesson(lesson_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    progress = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.lesson_id == lesson_id
    ).first()

    if not progress:
        progress = UserProgress(
            user_id=current_user.id,
            lesson_id=lesson_id,
            is_completed=True,
            completed_at=datetime.utcnow().isoformat()
        )
        db.add(progress)
    else:
        progress.is_completed = True
        progress.completed_at = datetime.utcnow().isoformat()

    db.commit()
    return {"message": "Lesson completed successfully"}
