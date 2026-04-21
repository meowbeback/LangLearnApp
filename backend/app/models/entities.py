from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Float,
    ForeignKey,
    JSON,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    language = Column(String(64), nullable=False, index=True)
    target_level = Column(String(64), nullable=False, index=True)
    description = Column(Text, nullable=True)

    lessons = relationship("Lesson", back_populates="course", order_by="Lesson.order_num")
    students = relationship("Student", back_populates="course")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, autoincrement=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False, index=True)
    order_num = Column(Integer, nullable=False, default=0)

    course = relationship("Course", back_populates="lessons")
    tasks = relationship("Task", back_populates="lesson", order_by="Task.id", cascade="all, delete-orphan")
    progress_rows = relationship("LessonProgress", back_populates="lesson", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True)
    task_type = Column(String(64), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    correct_answer = Column(String(500), nullable=False)
    points_value = Column(Float, nullable=False, default=1.0)
    options = Column(JSON, nullable=True)
    skill_type = Column(String(64), nullable=True, index=True)
    audio_url = Column(String(1024), nullable=True)

    lesson = relationship("Lesson", back_populates="tasks")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    login = Column(String(128), nullable=False)
    password_hash = Column(String(256), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    reg_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    student = relationship("Student", back_populates="user", uselist=False, cascade="all, delete-orphan")
    lesson_progress = relationship("LessonProgress", back_populates="user", cascade="all, delete-orphan")
    dictionaries = relationship("Dictionary", back_populates="user", cascade="all, delete-orphan")


class Student(Base):
    __tablename__ = "students"

    id_user = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    current_level = Column(String(64), nullable=True)
    target_language = Column(String(64), nullable=True)
    streak_days = Column(Integer, nullable=False, default=0)
    total_points = Column(Float, nullable=False, default=0.0)
    id_course = Column(Integer, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    last_activity_date = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="student")
    course = relationship("Course", back_populates="students")


class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    __table_args__ = (UniqueConstraint("user_id", "lesson_id", name="uq_lesson_progress_user_lesson"),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Float, nullable=False, default=0.0)
    completion_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(32), nullable=False, default="in_progress")
    current_task_index = Column(Integer, nullable=False, default=0)
    wrong_task_ids = Column(JSON, nullable=True)

    user = relationship("User", back_populates="lesson_progress")
    lesson = relationship("Lesson", back_populates="progress_rows")


class Dictionary(Base):
    __tablename__ = "dictionaries"

    __table_args__ = (
        UniqueConstraint("user_id", "source_lang", "target_lang", name="uq_dictionary_user_langs"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    source_lang = Column(String(32), nullable=False)
    target_lang = Column(String(32), nullable=False)

    user = relationship("User", back_populates="dictionaries")
    words = relationship("DictionaryWord", back_populates="dictionary", cascade="all, delete-orphan")


class DictionaryWord(Base):
    __tablename__ = "dictionary_words"

    id = Column(Integer, primary_key=True, autoincrement=True)
    dictionary_id = Column(Integer, ForeignKey("dictionaries.id", ondelete="CASCADE"), nullable=False, index=True)
    word_original = Column(String(500), nullable=False)
    word_translation = Column(String(500), nullable=False)
    added_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    dictionary = relationship("Dictionary", back_populates="words")
