## @file main.py
## @brief Точка входа FastAPI: приложение, CORS, подключение роутеров и создание таблиц БД.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import Base, engine
from app.routes import auth, lessons, profile

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(lessons.router)
app.include_router(profile.router)

## @brief Проверка доступности API (корневой маршрут).
@app.get("/")
def root():
    return {"message": "English Learning API is running"}
