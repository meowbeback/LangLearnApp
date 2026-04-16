## @file seed_data.py
## @brief Скрипт начального заполнения БД курсом, уроками и заданиями (запуск из каталога `backend`).

import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db import SessionLocal, Base, engine
from app.models.content import Course, Lesson, Task
from app.models.user import User

## @brief Создаёт таблицы при необходимости и добавляет демо-данные, если курсов ещё нет.
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
            description="Базовый курс для тех, кто только начинает изучать английский язык."
        )
        db.add(course)
        db.commit()
        db.refresh(course)

        lesson1 = Lesson(
            course_id=course.id,
            title="Основы: Приветствия",
            level="Beginner",
            order_index=1
        )
        db.add(lesson1)
        db.commit()
        db.refresh(lesson1)

        task1_1 = Task(
            lesson_id=lesson1.id,
            type="translate",
            question='Как сказать "Привет"?',
            options=['Hello', 'Goodbye', 'Please', 'Thanks'],
            correct_answer='Hello'
        )
        task1_2 = Task(
            lesson_id=lesson1.id,
            type="input",
            question='Напишите по-английски "Яблоко"',
            options=None,
            correct_answer='Apple'
        )
        db.add_all([task1_1, task1_2])

        lesson2 = Lesson(
            course_id=course.id,
            title="Глагол to be",
            level="Beginner",
            order_index=2
        )
        db.add(lesson2)
        db.commit()
        db.refresh(lesson2)

        task2_1 = Task(
            lesson_id=lesson2.id,
            type="translate",
            question="I ___ a student",
            options=['am', 'is', 'are', 'be'],
            correct_answer="am"
        )
        db.add(task2_1)

        db.commit()
        print("Данные успешно добавлены!")

    except Exception as e:
        print(f"Произошла ошибка: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
