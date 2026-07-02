# Деплой: GitHub + GitHub Pages + Railway

Схема:

```
GitHub repo
├── frontend  →  GitHub Pages   (статический React)
└── backend   →  Railway        (FastAPI API)
```

> **Бэкенд на Railway:** пошаговая инструкция → **[RAILWAY.md](RAILWAY.md)**

С Render можно не мучиться — Railway обычно проще войти через GitHub.

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

## 2. Бэкенд на Railway (рекомендуется)

Полная инструкция: **[RAILWAY.md](RAILWAY.md)**

Кратко:

1. [railway.app](https://railway.app) → **Deploy from GitHub** → репозиторий `WB_BI`
2. **Root Directory** = `backend`
3. **Generate Domain** → скопировать URL
4. Variables: `CORS_ORIGINS=https://YOUR_USERNAME.github.io,http://localhost:5173`
5. GitHub Secret `VITE_API_URL` = URL Railway (без `/api`)

### Альтернатива: Render

См. `render.yaml` в корне — если Railway не подойдёт.

## 3. Фронтенд на GitHub Pages

### Обязательно перед первым деплоем

1. Репозиторий должен быть **Public** (на бесплатном плане Pages для private репо не работает).
2. **Settings → Pages → Build and deployment → Source** → выберите **GitHub Actions** (не «Deploy from a branch»).
3. Сохраните. Без этого шага deploy падает с `Deployment failed, try again later`.

### Secrets и деплой

1. **Settings → Secrets and variables → Actions** → **New repository secret**:

   | Secret | Значение |
   |--------|----------|
   | `VITE_API_URL` | `https://wb-bi-api.onrender.com` (URL бэкенда **без** `/api`). Пока бэкенда нет — secret можно не добавлять, UI откроется, но API не будет работать. |

2. **Actions** → выберите упавший workflow → **Re-run all jobs** (после включения Pages).
3. Пуш в `main` запустит workflow `.github/workflows/deploy-pages.yml`.
4. Сайт откроется по адресу:

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

### GitHub Pages: `Deployment failed, try again later`

| Причина | Решение |
|---------|---------|
| Pages не включён | **Settings → Pages → Source: GitHub Actions** |
| Private репозиторий | Сделайте **Public** или купите GitHub Pro |
| Первый деплой | После включения Pages нажмите **Re-run all jobs** |
| Временный сбой GitHub | Подождите 10–15 мин и перезапустите workflow |
| Secret не обязателен для сборки | `VITE_API_URL` нужен только для работы API с фронта |

### Проблемы с Render

Render иногда **не открывается** или **не пускает через GitHub** (регион, VPN, блокировки).

**Что попробовать:**

1. Регистрация через **email + пароль** вместо GitHub.
2. Другой браузер или режим инкогнито.
3. VPN (если сайт не грузится из РФ).
4. Отключить блокировщики рекламы / расширения.
5. Проверить, что GitHub OAuth разрешён: GitHub → **Settings → Applications** → Authorized OAuth Apps.

**Альтернативы Render** (тот же FastAPI-бэкенд):

| Сервис | Ссылка | Комментарий |
|--------|--------|-------------|
| **Railway** | [railway.app](https://railway.app) | Часто проще войти через GitHub |
| **Fly.io** | [fly.io](https://fly.io) | Нужна карта, есть free tier |
| **Локально** | `python run.py` | Для себя; фронт на Pages без API не покажет данные |

**Пока нет облачного бэкенда** — можно пользоваться локально:

```powershell
# Терминал 1: бэкенд
cd backend && .venv\Scripts\activate && python run.py

# Терминал 2: фронт
cd frontend && npm run dev
```

GitHub Pages откроет только UI; для полного дашборда в интернете нужен любой хостинг с Python.

### Другие ошибки
|----------|---------|
| Белый экран на Pages | Проверьте `VITE_BASE_PATH` = `/ИМЯ_РЕПО/` в workflow |
| CORS error | Добавьте точный URL Pages в `CORS_ORIGINS` на Render |
| API недоступен | Подождите cold start Render, проверьте `/api/health` |
| 404 на `/settings` | Убедитесь, что в `dist/` есть `404.html` (скрипт в `npm run build`) |
