# Бэкенд

## Как запустить

1. Создайте и активируйте виртуальное окружение (рекомендуется):
```bash
python -m venv venv
venv\Scripts\activate
```

2. Установите зависимости:
```bash
pip install -r requirements.txt
```

3. Запустите сервер для разработки:
```bash
uvicorn app.main:app --reload
```

API будет доступно по адресу: http://localhost:8000
Документация Swagger: http://localhost:8000/docs

## Документация (Doxygen)

Из каталога `backend`:

```bash
doxygen Doxyfile
```

Откройте `docs/html/index.html` в браузере.