# Деплой бэкенда на Railway

Фронт остаётся на **GitHub Pages**, бэкенд — на **Railway**.

## 1. Регистрация

1. Открой [railway.app](https://railway.app)
2. **Login** → **GitHub** (или email)
3. Разреши доступ к репозиторию `ser2331/WB_BI` (можно только этот репо)

## 2. Создать сервис

1. **New Project** → **Deploy from GitHub repo**
2. Выбери репозиторий **WB_BI**
3. Railway создаст серvice — сразу открой его **Settings**:

| Параметр | Значение |
|----------|----------|
| **Root Directory** | `backend` |
| **Watch Paths** | `backend/**` (опционально) |

4. Дождись успешного **Deploy** (зелёный статус в Deployments).

5. **Settings → Networking → Public Networking**:

   ### ✅ Правильно: сгенерировать домен Railway

   Нажми кнопку **Generate Domain** — Railway сам создаст адрес вида:
   ```
   https://wb-bi-production-xxxx.up.railway.app
   ```
   **Ничего вручную в поле вводить не нужно.**

   ### ❌ Ошибка `Malformed Domain`

   Появляется, если в поле **Custom Domain** вставить:

   | Неправильно | Почему |
   |-------------|--------|
   | `https://ser2331.github.io` | это GitHub Pages, не домен для Railway |
   | `https://something.up.railway.app` | нельзя `https://` |
   | `ser2331.github.io/WB_BI/` | нельзя путь `/WB_BI/` |
   | `localhost:8000` | не публичный домен |

   **Custom Domain** нужен только если у тебя **свой** домен (`myshop.ru`) — без `https://`, без `/`.

   URL GitHub Pages (`https://ser2331.github.io`) указывается **только** в переменной `CORS_ORIGINS`, не в Networking.

6. Если кнопки **Generate Domain** нет:
   - Удали **TCP Proxy**, если он включён (иконка корзины)
   - Убедись, что деплой прошёл без ошибок
   - В **Networking** укажи порт **8000** (или оставь авто — Railway подставит `$PORT`)

7. Проверка в браузере:
   ```
   https://ТВОЙ-URL.up.railway.app/api/health
   ```
   Ответ: `{"status":"ok","mock_wb":true,...}`

## 3. Переменные окружения

**Variables** → **Add variables** (или Raw Editor):

```env
MOCK_WB=true
AUTO_SEED_MOCK=true
DEBUG=false
DATABASE_URL=sqlite+aiosqlite:////tmp/wb_bi.db
CORS_ORIGINS=https://ser2331.github.io,http://localhost:5173
CORS_ORIGIN_REGEX=https://([a-zA-Z0-9-]+\.)?github\.io
```

> **CORS:** без `CORS_ORIGINS` фронт на GitHub Pages получит `Failed to fetch`.  
> Origin всегда `https://ser2331.github.io` (без `/WB_BI/`).  
> `CORS_ORIGIN_REGEX` уже есть в коде по умолчанию — после push бэкенд пустит все `*.github.io`.

После изменения переменных Railway перезапустит сервис автоматически.

## 4. Подключить фронт (GitHub Pages)

1. GitHub → репозиторий **WB_BI** → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://ТВОЙ-URL.up.railway.app` (без `/api`) |

3. **Actions** → **Deploy frontend to GitHub Pages** → **Run workflow** (или push в `main`)

## 5. Проверка

1. Pages: https://ser2331.github.io/WB_BI/
2. В шапке должно быть **🧪 Демо Магазин WB BI** (mock-режим)
3. Дашборд с графиками и KPI

## Локальная разработка (без изменений)

```powershell
cd backend && .venv\Scripts\activate && python run.py
cd frontend && npm run dev
```

## Troubleshooting

| Проблема | Решение |
|----------|---------|
| **Malformed Domain** | Не вводи URL в Custom Domain. Используй **Generate Domain**. GitHub URL — только в `CORS_ORIGINS` |
| Build failed | Убедись, что **Root Directory** = `backend` |
| CORS error в браузере | Проверь `CORS_ORIGINS` = `https://ser2331.github.io` |
| 502 / Application failed | **Deployments** → View logs, ищи ошибку Python |
| Пустой дашборд | Нажми **Настройки → Демо без WB** или **Синхронизировать** |
| Railway sleep | На trial/free сервис может засыпать — первый запрос ~10–30 сек |

## Продакшен с реальным WB

```env
MOCK_WB=false
AUTO_SEED_MOCK=false
```

Пользователь вводит свой WB API-токен в настройках приложения.

## Стоимость

Railway даёт trial-кредиты; следи за **Usage** в дашборде. Для демо обычно хватает бесплатного периода.
