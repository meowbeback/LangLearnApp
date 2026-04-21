from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.content import Course, Lesson, LessonProgress, Task
from app.models.user import Student, User
from app.schemas.content import (
    LessonDetailOut,
    LessonListOut,
    ProgressPutIn,
    TaskCheckIn,
    TaskCheckOut,
    TaskOut,
)
from app.core.security import decode_sub_email, get_current_user
from app.services.streak import touch_streak_on_activity

router = APIRouter(prefix="/lessons", tags=["lessons"])
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


def _listen_task_public(t: Task) -> TaskOut:
    base = TaskOut.model_validate(t)
    opts = t.options
    if isinstance(opts, list):
        new_opts = {"choices": list(opts), "speak": t.correct_answer}
    elif isinstance(opts, dict):
        new_opts = {**opts}
        if "speak" not in new_opts:
            new_opts["speak"] = t.correct_answer
        if "choices" not in new_opts:
            new_opts["choices"] = []
    else:
        new_opts = {"choices": [], "speak": t.correct_answer}
    audio = t.audio_url
    if audio and isinstance(audio, str) and "wikimedia.org" in audio:
        audio = None
    return base.model_copy(update={"options": new_opts, "audio_url": audio})


def _task_public_out(t: Task) -> TaskOut:
    if t.task_type == "listen":
        return _listen_task_public(t)
    return TaskOut.model_validate(t)


def get_optional_user(
    token: Optional[str] = Security(oauth2_scheme_optional),
    db: Session = Depends(get_db),
):
    if not token:
        return None
    email = decode_sub_email(token)
    if not email:
        return None
    return db.query(User).filter(User.email == email).first()


def normalize_answer(value: str) -> str:
    return value.strip().lower()


def answers_match(task: Task, raw: str) -> bool:
    if task.task_type == "match":
        return raw.strip() == str(task.correct_answer).strip()
    return normalize_answer(raw) == normalize_answer(task.correct_answer)


def get_or_create_progress(db: Session, user_id: int, lesson_id: int) -> LessonProgress:
    lp = (
        db.query(LessonProgress)
        .filter(LessonProgress.user_id == user_id, LessonProgress.lesson_id == lesson_id)
        .first()
    )
    if lp is None:
        lp = LessonProgress(
            user_id=user_id,
            lesson_id=lesson_id,
            status="in_progress",
            score=0.0,
            current_task_index=0,
            wrong_task_ids=[],
        )
        db.add(lp)
        db.flush()
    return lp


@router.get("", response_model=List[LessonListOut])
def get_lessons(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
    q: Optional[str] = None,
    language: Optional[str] = None,
    target_level: Optional[str] = None,
    skill_type: Optional[str] = None,
    course_id: Optional[int] = None,
):
    query = db.query(Lesson).join(Course, Lesson.course_id == Course.id)
    if q:
        term = q.strip()
        if term:
            bind = db.get_bind()
            if bind.dialect.name == "sqlite":
                needle = f"%{term.casefold()}%"
                query = query.filter(func.py_casefold(Lesson.title).like(needle))
            elif bind.dialect.name == "postgresql":
                query = query.filter(Lesson.title.ilike(f"%{term}%"))
            else:
                needle = f"%{term.lower()}%"
                query = query.filter(func.lower(Lesson.title).like(needle))
    if language:
        query = query.filter(Course.language == language)
    if target_level:
        query = query.filter(Course.target_level == target_level)
    if course_id is not None:
        query = query.filter(Lesson.course_id == course_id)
    if skill_type:
        st = skill_type.strip()
        if st:
            bind = db.get_bind()
            if bind.dialect.name == "sqlite":
                st_cf = st.casefold()
                skill_lessons = select(Task.lesson_id).where(
                    func.py_casefold(Task.skill_type) == st_cf
                )
            else:
                skill_lessons = select(Task.lesson_id).where(
                    func.lower(Task.skill_type) == st.lower()
                )
            query = query.filter(Lesson.id.in_(skill_lessons))
    lessons = query.order_by(Lesson.course_id, Lesson.order_num).all()

    completed_ids = set()
    in_progress_ids = set()
    if current_user:
        for p in (
            db.query(LessonProgress)
            .filter(LessonProgress.user_id == current_user.id)
            .all()
        ):
            if p.status == "completed":
                completed_ids.add(p.lesson_id)
            elif p.status == "in_progress":
                in_progress_ids.add(p.lesson_id)

    out: List[LessonListOut] = []
    for lesson in lessons:
        course = lesson.course or db.query(Course).filter(Course.id == lesson.course_id).first()
        tasks_count = db.query(Task).filter(Task.lesson_id == lesson.id).count()
        out.append(
            LessonListOut(
                id=lesson.id,
                title=lesson.title,
                order_num=lesson.order_num,
                course_id=lesson.course_id,
                course_title=course.title if course else "",
                language=course.language if course else "",
                target_level=course.target_level if course else "",
                completed=lesson.id in completed_ids if current_user else False,
                in_progress=lesson.id in in_progress_ids if current_user else False,
                tasks_count=tasks_count,
            )
        )
    return out


@router.get("/{lesson_id}/progress-state")
def get_progress_state(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lp = (
        db.query(LessonProgress)
        .filter(LessonProgress.user_id == current_user.id, LessonProgress.lesson_id == lesson_id)
        .first()
    )
    if not lp:
        return {"current_task_index": 0, "wrong_task_ids": [], "status": None}
    return {
        "current_task_index": lp.current_task_index,
        "wrong_task_ids": list(lp.wrong_task_ids or []),
        "status": lp.status,
    }


@router.get("/{lesson_id}", response_model=LessonDetailOut)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    tasks = db.query(Task).filter(Task.lesson_id == lesson_id).order_by(Task.id).all()
    task_list = [_task_public_out(t) for t in tasks]
    return LessonDetailOut(
        id=lesson.id,
        title=lesson.title,
        order_num=lesson.order_num,
        course_id=lesson.course_id,
        tasks=task_list,
    )


@router.put("/{lesson_id}/progress")
def put_progress(
    lesson_id: int,
    body: ProgressPutIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not db.query(Lesson).filter(Lesson.id == lesson_id).first():
        raise HTTPException(status_code=404, detail="Lesson not found")
    lp = get_or_create_progress(db, current_user.id, lesson_id)
    lp.current_task_index = body.current_task_index
    if body.wrong_task_ids is not None:
        lp.wrong_task_ids = body.wrong_task_ids
    if lp.status == "completed":
        lp.status = "in_progress"
    db.commit()
    return {"saved": True}


@router.post("/{lesson_id}/check-task", response_model=TaskCheckOut)
def check_task(
    lesson_id: int,
    body: TaskCheckIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = (
        db.query(Task)
        .filter(Task.id == body.task_id, Task.lesson_id == lesson_id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    ok = answers_match(task, body.answer)
    lp = get_or_create_progress(db, current_user.id, lesson_id)
    wrong = list(lp.wrong_task_ids or [])
    if ok:
        if body.task_id in wrong:
            wrong = [x for x in wrong if x != body.task_id]
    elif body.task_id not in wrong:
        wrong.append(body.task_id)
    lp.wrong_task_ids = wrong
    points = 0.0
    if ok:
        points = float(task.points_value or 0)
        lp.score = float(lp.score or 0) + points
        st = db.query(Student).filter(Student.id_user == current_user.id).first()
        if st:
            st.total_points = float(st.total_points or 0) + points
    db.commit()
    return TaskCheckOut(
        correct=ok,
        points_earned=points,
        correct_answer=task.correct_answer if not ok else None,
    )


@router.post("/{lesson_id}/complete")
def complete_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not db.query(Lesson).filter(Lesson.id == lesson_id).first():
        raise HTTPException(status_code=404, detail="Lesson not found")
    lp = get_or_create_progress(db, current_user.id, lesson_id)
    lp.status = "completed"
    lp.completion_date = datetime.now(timezone.utc)
    st = db.query(Student).filter(Student.id_user == current_user.id).first()
    if st:
        touch_streak_on_activity(st)
    db.commit()
    return {"message": "Lesson completed successfully"}


@router.post("/{lesson_id}/restart")
def restart_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not db.query(Lesson).filter(Lesson.id == lesson_id).first():
        raise HTTPException(status_code=404, detail="Lesson not found")
    lp = (
        db.query(LessonProgress)
        .filter(LessonProgress.user_id == current_user.id, LessonProgress.lesson_id == lesson_id)
        .first()
    )
    if lp:
        st = db.query(Student).filter(Student.id_user == current_user.id).first()
        if st:
            prev = float(lp.score or 0)
            st.total_points = max(0.0, float(st.total_points or 0) - prev)
        lp.status = "in_progress"
        lp.current_task_index = 0
        lp.score = 0.0
        lp.wrong_task_ids = []
        lp.completion_date = None
    db.commit()
    return {"ok": True}


@router.get("/{lesson_id}/wrong-tasks", response_model=List[TaskOut])
def wrong_tasks(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lp = (
        db.query(LessonProgress)
        .filter(LessonProgress.user_id == current_user.id, LessonProgress.lesson_id == lesson_id)
        .first()
    )
    if not lp or not lp.wrong_task_ids:
        return []
    ids = list(lp.wrong_task_ids)
    tasks = db.query(Task).filter(Task.id.in_(ids), Task.lesson_id == lesson_id).all()
    order = {tid: i for i, tid in enumerate(ids)}
    tasks.sort(key=lambda t: order.get(t.id, 999))
    return [_task_public_out(t) for t in tasks]
