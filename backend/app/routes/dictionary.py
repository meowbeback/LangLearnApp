from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.content import Dictionary, DictionaryWord
from app.models.user import Student, User
from app.schemas.content import DictionaryWordIn, DictionaryWordOut
from app.core.security import get_current_user

router = APIRouter(prefix="/dictionaries", tags=["dictionaries"])


def _default_langs(student: Student | None):
    src = "ru"
    tgt = (student.target_language if student and student.target_language else "en").lower()
    return src, tgt


def _get_or_create_dictionary(db: Session, user: User) -> Dictionary:
    st = db.query(Student).filter(Student.id_user == user.id).first()
    src, tgt = _default_langs(st)
    d = (
        db.query(Dictionary)
        .filter(Dictionary.user_id == user.id, Dictionary.source_lang == src, Dictionary.target_lang == tgt)
        .first()
    )
    if d:
        return d
    d = Dictionary(user_id=user.id, source_lang=src, target_lang=tgt)
    db.add(d)
    db.commit()
    db.refresh(d)
    return d


@router.get("/me/words", response_model=List[DictionaryWordOut])
def list_words(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    d = _get_or_create_dictionary(db, current_user)
    words = db.query(DictionaryWord).filter(DictionaryWord.dictionary_id == d.id).order_by(DictionaryWord.id)
    return list(words)


@router.post("/me/words", response_model=DictionaryWordOut)
def add_word(
    body: DictionaryWordIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not body.word_original.strip() or not body.word_translation.strip():
        raise HTTPException(status_code=400, detail="Words must not be empty")
    d = _get_or_create_dictionary(db, current_user)
    w = DictionaryWord(
        dictionary_id=d.id,
        word_original=body.word_original.strip(),
        word_translation=body.word_translation.strip(),
    )
    db.add(w)
    db.commit()
    db.refresh(w)
    return w
