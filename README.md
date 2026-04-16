# LangLearnApp

Приложение для изучения языков с интерактивными уроками, регистрацией пользователей и персональным прогрессом.

## Функции

- Регистрация и авторизация пользователей
- Интерактивные уроки по языкам
- Персональный дашборд с прогрессом
- Профиль пользователя
- API для управления данными

## Технологии

- **Backend**: Python, FastAPI, SQLAlchemy
- **Frontend**: React, Vite, JavaScript
- **База данных**: SQLite (или другая, в зависимости от конфигурации)
- **Документация**: Doxygen (в frontend/docs)

## Установка

### Требования

- Python 3.8+
- Node.js 16+
- Git

### Backend

1. Перейдите в папку `backend`:
   ```bash
   cd backend
   ```

2. Создайте виртуальное окружение:
   ```bash
   python -m venv venv
   source venv/bin/activate  # На Windows: venv\Scripts\activate
   ```

3. Установите зависимости:
   ```bash
   pip install -r requirements.txt
   ```

4. Создайте базу данных:
   ```bash
   python create_db.py
   ```

### Frontend

1. Перейдите в папку `frontend`:
   ```bash
   cd frontend
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

## Запуск

### Backend

В папке `backend`:
```bash
uvicorn app.main:app --reload
```

API будет доступен на `http://localhost:8000`

### Frontend

В папке `frontend`:
```bash
npm run dev
```

Приложение будет доступно на `http://localhost:5173`

## Структура проекта

```
LangLearnApp/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── db.py
│   │   ├── main.py
│   │   ├── models/
│   │   │   └── user.py
│   │   ├── routes/
│   │   │   └── auth.py
│   │   └── schemas/
│   │       └── user.py
│   └── create_db.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   ├── docs/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── wiki/
└── README.md
```

## Контрибьютинг

1. Форкните репозиторий
2. Создайте ветку для вашей фичи: `git checkout -b feature/my-feature`
3. Сделайте коммиты: `git commit -m 'Add my feature'`
4. Отправьте в ветку: `git push origin feature/my-feature`
5. Создайте Pull Request

## Лицензия

MIT License