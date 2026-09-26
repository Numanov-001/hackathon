# marketch.uz

Оптовый стол цен. Цифры на графике — демо, помесячное среднее. P2P — намерение, не закрытая сделка.

## Как пользоваться

1. Откройте [http://localhost:5173](http://localhost:5173).
2. **Bozor** — товар, график, цена простым языком. Без аккаунта.
3. **Mahsulotlar** — 10 строк. Нажатие открывает график.
4. **P2P** — от дешёвого к дорогому. На бесплатном плане видны имя, цена, объём и район. Телефона нет.
5. **Kirish** — Clerk, Google или email. Роли продавца и покупателя нет.
6. **Obuna** — Bepul 0, Starter 199 000 сум/мес (телефон и своё объявление), Business 299 000 (то же плюс строка самого дешёвого предложения). Custom по договору и сам не открывается. «Tanlash» включает план. Click и Payme деньги не списывают.
7. **Yordamchi** — только после входа. Без `GROQ_API_KEY` отвечает по ценам, которые уже на экране.

## Env

Файл-шаблон называется `.env.example`, не `example.env`. У backend и frontend свой файл: процесс читает `.env` только из своей папки.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Windows, в той же папке: `copy .env.example .env`.

Значения пишите только в `.env`. Этот файл в git не попадает. В `.env.example` перечислены все имена, секреты там пустые. Секрет Clerk и ключ Groq в шаблон не кладите.

| Файл | Переменная | Зачем |
|---|---|---|
| оба | `VITE_CLERK_PUBLISHABLE_KEY` и `CLERK_PUBLISHABLE_KEY` | Вход и телефон на платном плане. Один и тот же publishable key. |
| frontend | `VITE_API_BASE_URL` | Локально оставьте пустым. |
| frontend | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | Фото товаров. Пусто — локальные картинки. |
| frontend | `GROQ_API_KEY`, `GROQ_MODEL` | Необязательный помощник. Пустой `GROQ_MODEL` — встроенный список моделей. |
| frontend | `VITE_ADMIN_PIN` | Текущие экраны его не читают. Оставьте пустым. |
| backend | `APP_NAME`, `APP_ENV`, `DEBUG`, `DATABASE_URL`, `CORS_ORIGINS` | В шаблоне уже заполнены. |
| backend | `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `CHAT_RATE_LIMIT_PER_MINUTE` | Экранный помощник их не использует. Оставьте ключ пустым. |
| backend | `REC_PRICE_WEIGHT`, `REC_LOCATION_WEIGHT`, `REC_VOLUME_WEIGHT` | В шаблоне уже заполнены. |

## Запуск

Сначала backend, потом frontend. Два терминала.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Проверка: в backend `pytest -q`, во frontend `npx tsc --noEmit`. Здоровье API: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health).

Деплой: backend по `Procfile`, переменные `DATABASE_URL`, `CORS_ORIGINS`, `CLERK_PUBLISHABLE_KEY`. Frontend: `npm run build`. Если фронт на другом хосте, задайте `VITE_API_BASE_URL` адресом backend.

## Agent

Вставьте только этот блок.

```
marketch.uz. frontend/ is Vite React: src/main.tsx → pomidor/Dashboard.tsx. backend/ is FastAPI on :8000 with SQLite. Clerk is login. Supabase is product images only. Groq is an optional assistant and lives in frontend/.env.

Do not commit .env or write secret values. Templates: backend/.env.example and frontend/.env.example. UI copy is Uzbek. Colors and sizes are in design/tokens and frontend/src/styles.css. Do not add a UI library.

Public GET /api/desk/offers must not include phone. A number is returned only for a verified Clerk JWT whose plan is starter or business. Do not trust localStorage. Custom does not unlock. Click and Payme do not charge. The Bozor chart stays public. Do not restore the notification bell or deleted screens.

Check: cd backend && pytest -q. In frontend: npx tsc --noEmit.
```
