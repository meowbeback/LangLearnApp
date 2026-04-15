from fastapi import FastAPI

from app.db import Base, engine
from app.routes import auth

app = FastAPI()

# создаём таблицы при старте
Base.metadata.create_all(bind=engine)

app.include_router(auth.router)


@app.get("/")
def root():
    return {"message": "English Learning API is running"}