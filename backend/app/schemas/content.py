## @file content.py
## @brief Pydantic-схемы для уроков, заданий и статистики профиля.

from pydantic import BaseModel
from typing import List, Optional, Any

## @brief Задание урока (тип, вопрос, варианты, правильный ответ).
class TaskBase(BaseModel):
    id: int
    type: str
    question: str
    options: Optional[Any] = None
    correct_answer: str

    class Config:
        ## @brief Разрешить создание из ORM-моделей SQLAlchemy.
        from_attributes = True

## @brief Общие поля урока в ответах API.
class LessonBase(BaseModel):
    id: int
    title: str
    level: str
    order_index: int

    class Config:
        from_attributes = True

## @brief Элемент списка уроков: флаги прохождения и число заданий.
class LessonListOut(LessonBase):
    completed: Optional[bool] = False
    tasks_count: int = 0

## @brief Детальный урок с массивом `tasks`.
class LessonDetailOut(LessonBase):
    tasks: List[TaskBase] = []

## @brief Ответ эндпоинта `/profile/stats`.
class ProfileStatsOut(BaseModel):
    completed_lessons_count: int
    current_streak: int
