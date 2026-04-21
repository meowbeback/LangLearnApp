from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "202604201200"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "courses",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("language", sa.String(length=64), nullable=False),
        sa.Column("target_level", sa.String(length=64), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_courses_language"), "courses", ["language"], unique=False)
    op.create_index(op.f("ix_courses_target_level"), "courses", ["target_level"], unique=False)

    op.create_table(
        "lessons",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("course_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("order_num", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_lessons_course_id"), "lessons", ["course_id"], unique=False)
    op.create_index(op.f("ix_lessons_title"), "lessons", ["title"], unique=False)

    op.create_table(
        "tasks",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("lesson_id", sa.Integer(), nullable=False),
        sa.Column("task_type", sa.String(length=64), nullable=False),
        sa.Column("question_text", sa.Text(), nullable=False),
        sa.Column("correct_answer", sa.String(length=500), nullable=False),
        sa.Column("points_value", sa.Float(), nullable=False),
        sa.Column("options", sa.JSON(), nullable=True),
        sa.Column("skill_type", sa.String(length=64), nullable=True),
        sa.Column("audio_url", sa.String(length=1024), nullable=True),
        sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_tasks_lesson_id"), "tasks", ["lesson_id"], unique=False)
    op.create_index(op.f("ix_tasks_task_type"), "tasks", ["task_type"], unique=False)
    op.create_index(op.f("ix_tasks_skill_type"), "tasks", ["skill_type"], unique=False)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("login", sa.String(length=128), nullable=False),
        sa.Column("password_hash", sa.String(length=256), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("reg_date", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "students",
        sa.Column("id_user", sa.Integer(), nullable=False),
        sa.Column("current_level", sa.String(length=64), nullable=True),
        sa.Column("target_language", sa.String(length=64), nullable=True),
        sa.Column("streak_days", sa.Integer(), nullable=False),
        sa.Column("total_points", sa.Float(), nullable=False),
        sa.Column("id_course", sa.Integer(), nullable=True),
        sa.Column("last_activity_date", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["id_course"], ["courses.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["id_user"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id_user"),
    )

    op.create_table(
        "dictionaries",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("source_lang", sa.String(length=32), nullable=False),
        sa.Column("target_lang", sa.String(length=32), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "source_lang", "target_lang", name="uq_dictionary_user_langs"),
    )
    op.create_index(op.f("ix_dictionaries_user_id"), "dictionaries", ["user_id"], unique=False)

    op.create_table(
        "dictionary_words",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("dictionary_id", sa.Integer(), nullable=False),
        sa.Column("word_original", sa.String(length=500), nullable=False),
        sa.Column("word_translation", sa.String(length=500), nullable=False),
        sa.Column("added_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["dictionary_id"], ["dictionaries.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_dictionary_words_dictionary_id"), "dictionary_words", ["dictionary_id"], unique=False)

    op.create_table(
        "lesson_progress",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("lesson_id", sa.Integer(), nullable=False),
        sa.Column("score", sa.Float(), nullable=False),
        sa.Column("completion_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("current_task_index", sa.Integer(), nullable=False),
        sa.Column("wrong_task_ids", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "lesson_id", name="uq_lesson_progress_user_lesson"),
    )
    op.create_index(op.f("ix_lesson_progress_user_id"), "lesson_progress", ["user_id"], unique=False)
    op.create_index(op.f("ix_lesson_progress_lesson_id"), "lesson_progress", ["lesson_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_lesson_progress_lesson_id"), table_name="lesson_progress")
    op.drop_index(op.f("ix_lesson_progress_user_id"), table_name="lesson_progress")
    op.drop_table("lesson_progress")
    op.drop_index(op.f("ix_dictionary_words_dictionary_id"), table_name="dictionary_words")
    op.drop_table("dictionary_words")
    op.drop_index(op.f("ix_dictionaries_user_id"), table_name="dictionaries")
    op.drop_table("dictionaries")
    op.drop_table("students")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
    op.drop_index(op.f("ix_tasks_skill_type"), table_name="tasks")
    op.drop_index(op.f("ix_tasks_task_type"), table_name="tasks")
    op.drop_index(op.f("ix_tasks_lesson_id"), table_name="tasks")
    op.drop_table("tasks")
    op.drop_index(op.f("ix_lessons_title"), table_name="lessons")
    op.drop_index(op.f("ix_lessons_course_id"), table_name="lessons")
    op.drop_table("lessons")
    op.drop_index(op.f("ix_courses_target_level"), table_name="courses")
    op.drop_index(op.f("ix_courses_language"), table_name="courses")
    op.drop_table("courses")
