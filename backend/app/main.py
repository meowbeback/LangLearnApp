from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, engine
from app.models import entities
from app.routes import auth, courses, dictionary, lessons, profile, students

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
app.include_router(students.router)
app.include_router(courses.router)
app.include_router(lessons.router)
app.include_router(dictionary.router)
app.include_router(profile.router)


@app.get("/")
def root():
    return {"message": "LangLearn API is running"}
