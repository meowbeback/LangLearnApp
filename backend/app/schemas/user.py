## @file user.py
## @brief Pydantic-схемы пользователя и JWT-ответа при входе.

from pydantic import BaseModel
from typing import Optional

## @brief Тело запроса регистрации и входа (логин и пароль).
class UserCreate(BaseModel):
    username: str
    password: str

## @brief Пользователь без пароля (публичные поля).
class UserOut(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True

## @brief Ответ `POST /auth/login`: токен и краткие данные пользователя.
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut
