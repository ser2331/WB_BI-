# Деплой: GitHub + GitHub Pages + Render

Схема:

```
GitHub repo
├── frontend  →  GitHub Pages   (статический React)
└── backend   →  Render         (FastAPI API)
```

## 1. Залить на GitHub

```bash
cd F:\Projects\WB_BI
git init
git add .
git commit -m "Initial commit: WB BI"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/WB_BI.git
git push -u origin main
```

> Замените `YOUR_USERNAME/WB_BI` на свой репозиторий.

## 2. Бэкенд на Render

1. [render.com](https://render.com) → **New** → **Blueprint** (или Web Service).
2. Подключите GitHub-репозиторий.
3. Render подхватит `render.yaml` в корне проекта.
4. В **Environment** задайте `CORS_ORIGINS`:

   ```
   https://YOUR_USERNAME.github.io,http://localhost:5173
   ```

   Без слэша в конце, через запятую.

5. После деплоя скопируйте URL сервиса, например:
   `https://wb-bi-api.onrender.com`

6. Проверка: `https://wb-bi-api.onrender.com/api/health`

### Переменные Render (из render.yaml)

| Переменная | Значение | Комментарий |
|------------|----------|-------------|
| `MOCK_WB` | `true` | Демо без WB-токена (можно `false` для боя) |
| `AUTO_SEED_MOCK` | `true` | Автозаполнение дашборда |
| `DATABASE_URL` | `sqlite+aiosqlite:////tmp/wb_bi.db` | На free-тарифе данные могут сбрасываться при редеплое |
| `CORS_ORIGINS` | ваш GitHub Pages URL | **обязательно вручную** |

## 3. Фронтенд на GitHub Pages

1. Репозиторий → **Settings** → **Pages**.
2. **Source**: **GitHub Actions** (не «Deploy from branch»).
3. **Secrets** → **Actions** → добавьте:

   | Secret | Значение |
   |--------|----------|
   | `VITE_API_URL` | `https://wb-bi-api.onrender.com` (ваш Render URL **без** `/api`) |

4. Пуш в `main` запустит workflow `.github/workflows/deploy-pages.yml`.
5. Сайт откроется по адресу:

   ```
   https://YOUR_USERNAME.github.io/WB_BI/
   ```

   Имя пути (`/WB_BI/`) совпадает с именем репозитория.

## 4. Первый запуск после деплоя

1. Откройте Pages URL.
2. Если бэкенд с `MOCK_WB=true` — дашборд уже с демо-данными.
3. Иначе: **Настройки** → **Демо без WB** или вставьте WB API-токен.

> На free Render сервис «засыпает» — первый запрос может идти 30–60 секунд.

## 5. Локальная разработка (без изменений)

```bash
# Терминал 1
cd backend && .venv\Scripts\activate && python run.py

# Терминал 2
cd frontend && npm run dev
```

Локально `VITE_API_URL` не нужен — Vite проксирует `/api` на `localhost:8000`.

## 6. Продакшен с реальным WB

На Render:

```env
MOCK_WB=false
AUTO_SEED_MOCK=false
```

Пользователь подключает свой токен в настройках приложения.

## Troubleshooting

| Проблема | Решение |
|----------|---------|
| Белый экран на Pages | Проверьте `VITE_BASE_PATH` = `/ИМЯ_РЕПО/` в workflow |
| CORS error | Добавьте точный URL Pages в `CORS_ORIGINS` на Render |
| API недоступен | Подождите cold start Render, проверьте `/api/health` |
| 404 на `/settings` | Убедитесь, что в `dist/` есть `404.html` (скрипт в `npm run build`) |
