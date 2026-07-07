# WB BI

Приложение для импорта данных и просмотра дашборда **склеек по предметам** (как в прототипе `dash_2`).

## Стек

| Слой     | Технологии                                       |
| -------- | ------------------------------------------------ |
| Frontend | React, TypeScript, Vite, styled-components, SCSS |
| Backend  | Python, FastAPI, SQLAlchemy, SQLite              |

## Возможности

- **Импорт файлов** CSV и JSON на бэкенд
- Обработка и нормализация данных в единую схему (склейки + карточки товаров)
- **Дашборд** с KPI, фильтрами, сводкой по предметам и горизонтальными карточками SKU
- JSON в формате `dash_2` (поле `blocks`) загружается напрямую
- CSV — плоский список товаров с группировкой по `groupKey` / `title` / `imt`

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

UI: http://localhost:5173 → раздел **Импорт** → загрузите `dash_2/assets/dashboard-data.json` или CSV.

### Линтеры и проверка типов

**Frontend** (`frontend/`):

```bash
npm run typecheck   # tsc -b (project references)
npm run lint        # ESLint 9 + typescript-eslint
npm run lint:fix    # автоисправления ESLint
npm run format      # Prettier — форматирование
npm run format:check # Prettier — проверка без записи
```

**Backend** (`backend/`):

```bash
pip install -r requirements-dev.txt
ruff check app
ruff format app     # форматирование
```

В CI: workflow `.github/workflows/lint.yml` (push/PR на main).

## API импорта

| Метод  | Путь                                         | Описание                                            |
| ------ | -------------------------------------------- | --------------------------------------------------- |
| POST   | `/api/import`                                | Загрузка файла (`multipart/form-data`, поле `file`) |
| GET    | `/api/dashboard/meta`                        | Мета импорта (файл, счётчики)                       |
| GET    | `/api/dashboard/kpis`                        | KPI: склейки, SKU, остаток (+ фильтры)              |
| GET    | `/api/dashboard/filters`                     | Списки периодов, предметов, брендов                 |
| GET    | `/api/dashboard/categories`                  | Категории постранично (+ фильтры)                   |
| GET    | `/api/dashboard/categories/{subject}/blocks` | Склейки категории постранично (+ фильтры)           |
| DELETE | `/api/import`                                | Удалить загруженные данные                          |

Данные хранятся **в памяти** и в файле `backend/data/dataset.json` (без отдельной БД для датасета).

Query-параметры фильтров: `periodKey`, `subject`, `brand`, `search`, `page`, `page_size`.

### Формат CSV

Минимум: `nm` (артикул WB). Рекомендуемые колонки: `subject`, `brand`, `vendorCode`, `orders`, `sales`, `stock`, `spp`, `kvv`, `ad_ctr`, `title`, `groupKey`, `periodKey`, `periodLabel`, `photo`, `wbUrl`.

## Деплой (GitHub Pages + Railway)

Пошаговая инструкция: **[DEPLOY.md](DEPLOY.md)**

| Куда             | Что                                     |
| ---------------- | --------------------------------------- |
| **GitHub**       | Исходный код                            |
| **GitHub Pages** | Фронтенд (автодеплой через Actions)     |
| **Railway**      | Бэкенд FastAPI (`backend/railway.toml`) |

После деплоя:

- Pages: `https://YOUR_USERNAME.github.io/WB_BI/`
- API: `https://your-app.up.railway.app/api/health`

Подробно: **[RAILWAY.md](RAILWAY.md)**

## Архитектура

```
WB_BI/
├── dash_2/               # локальный прототип (в .gitignore)
├── backend/
│   ├── app/
│   │   ├── api/          # import + legacy WB endpoints
│   │   ├── schemas/      # DashboardDataset
│   │   └── services/     # file_import, dataset_memory, dataset_query
└── frontend/
    └── src/
        ├── components/dashboard/  # карточки склеек
        └── pages/               # Dashboard, Import
```

Папка `dash_2/` — эталонный прототип, в git не попадает.

## Дорожная карта

- [ ] Фильтры и сортировка как в dash_2 v2+
- [ ] История периодов по склейкам
- [ ] Экспорт отфильтрованного отчёта
- [ ] PostgreSQL вместо SQLite для продакшена
