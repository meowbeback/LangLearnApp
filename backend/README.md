# Бэкенд

## Как запустить

1. Перейдите в каталог `backend` и активируйте виртуальное окружение:

**macOS / Linux:**

```bash
cd backend
source venv/bin/activate
```

**Windows (cmd):**

```bash
cd backend
venv\Scripts\activate
```

Если каталога `venv` ещё нет, создайте окружение и снова активируйте:

```bash
cd backend
python -m venv venv
source venv/bin/activate
```

2. Установите зависимости:

```bash
pip install -r requirements.txt
```

3. База данных по умолчанию — SQLite (`langlearn.db` в каталоге `backend`). Для PostgreSQL:

```bash
export DATABASE_URL=postgresql+psycopg2://postgres:postgres@127.0.0.1:5432/langlearn
```

Из корня репозитория: `docker compose up -d`.

4. Таблицы и начальные данные:

```bash
python create_db.py
python seed_data.py
```

5. Миграции Alembic (при PostgreSQL):

```bash
alembic upgrade head
```

6. Сервер (в активированном `venv`):

```bash
uvicorn app.main:app --reload
```

API: http://localhost:8000  
Swagger: http://localhost:8000/docs

## Документация (Doxygen)

Из каталога `backend` с активированным `venv` при необходимости:

```bash
doxygen Doxyfile
```

Откройте `docs/html/index.html` в браузере.
