import os

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base


def register_sqlite_unicode_functions(dbapi_connection, connection_record):
    def py_casefold(s):
        if s is None:
            return None
        return str(s).casefold()

    dbapi_connection.create_function("py_casefold", 1, py_casefold)

_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_DEFAULT_SQLITE = f"sqlite:///{os.path.join(_BASE_DIR, 'langlearn.db')}"

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    _DEFAULT_SQLITE,
)

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)

if DATABASE_URL.startswith("sqlite"):
    event.listens_for(engine, "connect")(register_sqlite_unicode_functions)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
