# marketch.uz

Оптовый стол цен для Узбекистана. График — демо, помесячное среднее за 24 месяца. P2P — намерение купить или продать, не закрытая сделка.

На новом компьютере проект открывается после двух команд. Ключ входа Clerk и ключ фото Supabase уже лежат в `.env.example`. Это публичные ключи, без них кнопка «Kirish» не работает. Секретные ключи (Groq, Anthropic, Clerk secret) в репозитории нет: экран без них запускается.

## Запуск с чистого клона

Нужны Python 3.11+ и Node.js 20+. Два терминала.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

```bash
cd frontend
npm install
npm run dev
```

Windows: в backend вместо `source .venv/bin/activate` выполните `.venv\Scripts\activate`.

- Сайт: [http://localhost:5173](http://localhost:5173)
- API: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

Backend сам читает `backend/.env.example`, даже если `backend/.env` нет. Frontend при первом `npm run dev` копирует `frontend/.env.example` в `frontend/.env`, если своего `.env` ещё нет. Копировать руками не нужно.

Свой `backend/.env` или `frontend/.env` перекрывает шаблон. Пустые строки в `.env` шаблон не затирают.

Проверка: в backend `pytest -q`, во frontend `npx tsc --noEmit`.

## Что нажимать

1. **Bozor** — товар, график, цена простым языком. Аккаунт не нужен.
2. **Mahsulotlar** — 10 товаров. Нажатие на строку открывает график.
3. **P2P** — объявления от дешёвого к дорогому. На бесплатном плане видны имя, цена, объём и район. Телефона нет ни на экране, ни в открытом ответе API.
4. **Kirish** — Clerk: Google или email. Роли продавца и покупателя нет.
5. **Obuna** — выбор плана. «Tanlash» включает план на этом аккаунте. Click и Payme деньги не списывают.
6. **Yordamchi** — кнопка только после входа. Без Groq отвечает по ценам, которые уже на экране.

Планы:

| План | Цена | Что открыто |
|---|---|---|
| Bepul | 0 | График и список P2P без телефона. Своё объявление поставить нельзя. |
| Starter | 199 000 сум/мес | Телефон и своё объявление. |
| Business | 299 000 сум/мес | Всё из Starter и строка самого дешёвого предложения. |
| Custom | договор | API, несколько пользователей, интеграция, отдельная поддержка. Сам не включается. |

## Env

Шаблон называется `.env.example`. Файл `example.env` не используется. У backend и frontend свой шаблон.

| Файл | Переменная | В шаблоне |
|---|---|---|
| оба | `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_PUBLISHABLE_KEY` | Уже заполнены одним publishable key. Нужны для входа и для телефона на платном плане. |
| frontend | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | Уже заполнены. Это фото товаров, не секретный service role. |
| frontend | `VITE_API_BASE_URL` | Пусто. Локально Vite сам проксирует `/api` на порт 8000. Заполните только если фронт на другом хосте. |
| frontend | `GROQ_API_KEY`, `GROQ_MODEL` | Пусто специально. Помощник работает без них. |
| frontend | `VITE_ADMIN_PIN` | Пусто. Текущие экраны его не читают. |
| backend | `APP_NAME`, `APP_ENV`, `DEBUG`, `DATABASE_URL`, `CORS_ORIGINS` | Заполнены для локального SQLite. |
| backend | `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `CHAT_RATE_LIMIT_PER_MINUTE` | Ключ пустой. Экранный помощник ходит в Groq, не в Anthropic. |
| backend | `REC_PRICE_WEIGHT`, `REC_LOCATION_WEIGHT`, `REC_VOLUME_WEIGHT` | Заполнены. |

`.env` в git не коммитится. Если на новой машине уже лежит пустой `.env`, удалите его и запустите снова: подтянется шаблон.

Деплой backend: команда из `backend/Procfile`. На хосте задайте `DATABASE_URL`, `CORS_ORIGINS` и тот же `CLERK_PUBLISHABLE_KEY`. Frontend: `npm run build`. Если сайт и API на разных доменах, задайте `VITE_API_BASE_URL`.

## Agent

Вставьте только этот блок.

```
marketch.uz. frontend/ is Vite React: src/main.tsx → pomidor/Dashboard.tsx. backend/ is FastAPI on :8000 with SQLite. Clerk is login. Supabase is product images only. Groq is optional.

Publishable Clerk and Supabase values are already in backend/.env.example and frontend/.env.example so a fresh clone signs in. Do not delete them. Do not add GROQ_API_KEY, ANTHROPIC_API_KEY, or a Clerk secret key. Do not commit .env.

UI copy is Uzbek. Colors and sizes are in design/tokens and frontend/src/styles.css. Do not add a UI library.

Public GET /api/desk/offers must not include phone. A number is returned only for a verified Clerk JWT whose plan is starter or business. Do not trust localStorage. Custom does not unlock. Click and Payme do not charge. The Bozor chart stays public. Do not restore the notification bell or deleted screens.

Backend reads .env.example, then .env. Frontend copies .env.example to .env on first npm run dev if .env is missing.

Check: cd backend && pytest -q. In frontend: npx tsc --noEmit.
```
