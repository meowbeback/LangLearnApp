import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db import SessionLocal, Base, engine
from app.models.entities import Course, Lesson, Task


def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Course).first():
            print("Данные уже существуют в базе. Пропускаем заполнение.")
            return
        print("Добавляем начальные данные в базу...")
        course = Course(
            title="Английский для начинающих",
            language="en",
            target_level="A1",
            description="Базовый курс для тех, кто только начинает изучать английский язык.",
        )
        db.add(course)
        db.commit()
        db.refresh(course)

        lesson1 = Lesson(course_id=course.id, title="Основы: Приветствия", order_num=1)
        db.add(lesson1)
        db.commit()
        db.refresh(lesson1)

        tasks_l1 = [
            Task(
                lesson_id=lesson1.id,
                task_type="translate",
                question_text='Как сказать "Привет"?',
                correct_answer="Hello",
                points_value=1.0,
                options=["Hello", "Goodbye", "Please", "Thanks"],
                skill_type="lexicon",
            ),
            Task(
                lesson_id=lesson1.id,
                task_type="input",
                question_text='Напишите по-английски слово "Яблоко"',
                correct_answer="Apple",
                points_value=2.0,
                options=None,
                skill_type="lexicon",
            ),
            Task(
                lesson_id=lesson1.id,
                task_type="listen",
                question_text="Прослушайте слово и выберите правильный вариант",
                correct_answer="Morning",
                points_value=1.5,
                options={
                    "choices": ["Morning", "Evening", "Night", "Noon"],
                    "speak": "Morning",
                },
                skill_type="listening",
                audio_url=None,
            ),
            Task(
                lesson_id=lesson1.id,
                task_type="match",
                question_text="Сопоставьте английские слова с русскими переводами (уровень B1)",
                correct_answer="integrity|целостность,feasible|осуществимый,obsolete|устаревший",
                points_value=2.5,
                options={
                    "left": ["integrity", "feasible", "obsolete"],
                    "right": ["осуществимый", "устаревший", "целостность"],
                    "format_hint": "В одну строку через запятую: английское|русское; порядок пар любой.",
                },
                skill_type="lexicon",
            ),
        ]
        db.add_all(tasks_l1)

        lesson2 = Lesson(course_id=course.id, title="Глагол to be", order_num=2)
        db.add(lesson2)
        db.commit()
        db.refresh(lesson2)

        db.add(
            Task(
                lesson_id=lesson2.id,
                task_type="translate",
                question_text="I ___ a student",
                correct_answer="am",
                points_value=1.0,
                options=["am", "is", "are", "be"],
                skill_type="grammar",
            )
        )
        db.commit()
        print("Данные успешно добавлены!")
    except Exception as e:
        print(f"Произошла ошибка: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
