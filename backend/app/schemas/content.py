from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_type: str
    question_text: str
    options: Optional[Any] = None
    skill_type: Optional[str] = None
    audio_url: Optional[str] = None
    points_value: float = 1.0


class TaskCheckIn(BaseModel):
    task_id: int
    answer: str


class TaskCheckOut(BaseModel):
    correct: bool
    points_earned: float
    correct_answer: Optional[str] = None


class LessonListOut(BaseModel):
    id: int
    title: str
    order_num: int
    course_id: int
    course_title: str
    language: str
    target_level: str
    completed: bool = False
    tasks_count: int = 0
    in_progress: bool = False


class LessonDetailOut(BaseModel):
    id: int
    title: str
    order_num: int
    course_id: int
    tasks: List[TaskOut] = []


class ProgressPutIn(BaseModel):
    current_task_index: int = Field(ge=0)
    wrong_task_ids: Optional[List[int]] = None


class StudentMeOut(BaseModel):
    id_user: int
    current_level: Optional[str] = None
    target_language: Optional[str] = None
    id_course: Optional[int] = None
    streak_days: int
    total_points: float
    onboarding_complete: bool


class StudentPatchIn(BaseModel):
    current_level: Optional[str] = None
    target_language: Optional[str] = None
    id_course: Optional[int] = None


class ProfileStatsOut(BaseModel):
    completed_lessons_count: int
    current_streak: int
    total_points: float


class DictionaryWordIn(BaseModel):
    word_original: str
    word_translation: str


class DictionaryWordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    word_original: str
    word_translation: str
    added_at: Optional[datetime] = None
