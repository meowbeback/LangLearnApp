## @file create_db.py
## @brief Создаёт все таблицы SQLAlchemy по зарегистрированным моделям (миграции не используются).

from app.db import engine, Base
from app.models import user

Base.metadata.create_all(bind=engine)
