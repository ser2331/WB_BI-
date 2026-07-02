# WB BI

Business Intelligence приложение для продавцов Wildberries.

## Стек

| Слой | Технологии |
|------|-----------|
| Frontend | React, TypeScript, Vite, Recharts, styled-components, SCSS |
| Backend | Python, FastAPI, SQLAlchemy, SQLite |
| API | Wildberries Seller API |

## Возможности (MVP)

- Подключение WB аккаунта через API-токен
- Настройка источников данных (продажи, заказы, остатки, воронка, регионы)
- Умная синхронизация с учётом rate limits WB API
- Дашборд с захардкоженными виджетами:
  - KPI-карточки (выручка, продажи, заказы, остатки)
  - График выручки по дням
  - График заказов по дням
  - Топ товаров по выручке
  - Воронка продаж
  - Таблица остатков на складах

## Быстрый старт

### Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
cp .env.example .env
python run.py
```

API: http://localhost:8000  
Документация: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

UI: http://localhost:5173

## Деплой (GitHub Pages + Render)

Пошаговая инструкция: **[DEPLOY.md](DEPLOY.md)**

| Куда | Что |
|------|-----|
| **GitHub** | Исходный код |
| **GitHub Pages** | Фронтенд (автодеплой через Actions) |
| **Railway** | Бэкенд FastAPI (`backend/railway.toml`) |

После деплоя:
- Pages: `https://YOUR_USERNAME.github.io/WB_BI/`
- API: `https://your-app.up.railway.app/api/health`

Подробно: **[RAILWAY.md](RAILWAY.md)**

## Демо-режим (без аккаунта WB)

По умолчанию в **локальном** `.env` включён mock-режим (`MOCK_WB=true` в `backend/.env.example`).

При старте бэкенда автоматически:
- создаётся **mock JWT** (формат как у WB, с флагом `mock: true` в payload);
- генерируются **демо-данные**: продажи, заказы, остатки, воронка, регионы за 30 дней;
- дашборд сразу заполнен.

Ручное подключение:
- UI: **Настройки → «Демо без WB»**
- API: `POST /api/wb/connect-mock`
- Получить JWT: `GET /api/mock/token`

Для продакшена отключите: `MOCK_WB=false`, `AUTO_SEED_MOCK=false`.

## Получение API-токена WB

1. Войдите в [личный кабинет продавца WB](https://seller.wildberries.ru/)
2. Настройки → Доступ к API
3. Создайте токен с категориями **Статистика** и **Аналитика**
4. Вставьте токен на странице «Настройки» в приложении

## Архитектура

```
WB_BI/
├── backend/
│   ├── app/
│   │   ├── api/          # REST endpoints
│   │   ├── models/       # SQLAlchemy модели
│   │   ├── schemas/      # Pydantic схемы
│   │   └── services/     # WB клиент, синхронизация, дашборд
│   └── requirements.txt
└── frontend/
    └── src/
        ├── api/          # HTTP клиент
        ├── components/   # Layout + виджеты
        ├── pages/        # Dashboard, Settings
        └── types/        # TypeScript типы
```

## Дорожная карта

- [ ] Фоновая автосинхронизация по расписанию
- [ ] Настраиваемые виджеты дашборда
- [ ] AI-ассистент: запрос данных на естественном языке
- [ ] Генерация временных лендингов с данными WB
- [ ] Мультиаккаунт и роли пользователей
- [ ] PostgreSQL вместо SQLite для продакшена
