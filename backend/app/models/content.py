## @file content.py
## @brief ORM-модели курса, урока, задания и прогресса пользователя.

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db import Base

## @brief Курс (язык / программа): заголовок и описание.
class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)

    lessons = relationship("Lesson", back_populates="course")

## @brief Урок внутри курса: уровень и порядок сортировки.
class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    title = Column(String, index=True)
    level = Column(String)
    order_index = Column(Integer)

    course = relationship("Course", back_populates="lessons")
    tasks = relationship("Task", back_populates="lesson")
    progress = relationship("UserProgress", back_populates="lesson")

## @brief Задание: тип (`translate` / `input`), вопрос, JSON-варианты при необходимости.
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    type = Column(String)
    question = Column(String)
    correct_answer = Column(String)
    options = Column(JSON, nullable=True)

    lesson = relationship("Lesson", back_populates="tasks")

## @brief Связь пользователь–урок: завершение, балл, время завершения.
class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    is_completed = Column(Boolean, default=False)
    score = Column(Integer, default=0)
    completed_at = Column(String, nullable=True)

    user = relationship("User", back_populates="progress")
    lesson = relationship("Lesson", back_populates="progress")
