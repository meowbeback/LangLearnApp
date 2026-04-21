from app.db import Base, engine
import app.models.entities

Base.metadata.create_all(bind=engine)
