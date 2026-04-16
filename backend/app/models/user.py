## @file user.py
## @brief ORM-модель пользователя (логин и хэш пароля).

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db import Base

## @brief Пользователь приложения и связь с таблицей прогресса.
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)

    progress = relationship("UserProgress", back_populates="user")
