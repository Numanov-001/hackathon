# marketch.uz

B2B market intelligence MVP for Uzbekistan agri markets.

Price discovery + market analytics + P2P intentions. Not a marketplace, not an order book, not official real-time prices.

Local stack: FastAPI + SQLite + React/Vite.

## Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python seed_demo_data.py
uvicorn app.main:app --reload
```

Health: http://127.0.0.1:8000/health  
Docs: http://127.0.0.1:8000/docs  
API contract: `docs/API.md`

```powershell
pytest tests/test_mvp.py
```

## Frontend

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

UI: http://localhost:5173

The page reads `frontend/.env`. Put `GROQ_API_KEY` there for the assistant. Without it, the assistant still answers from the prices on screen. Clerk and Supabase keys stay in that file and are not committed.

## Deploy

Backend (Railway/Render): Python, start command from `backend/Procfile`. Set `DATABASE_URL`, `CORS_ORIGINS`, and `CLERK_PUBLISHABLE_KEY` (the same publishable key as the frontend, so a paid plan can receive phone numbers). Optional `ANTHROPIC_API_KEY`. Do not set a Clerk secret key.

Frontend (Vercel/Netlify): `frontend/` build `npm run build`. Point API/WebSocket to the backend URL and update `frontend/vercel.json`.

## Roadmap (not in this MVP)

+3 months: more categories, all regions, transactions.  
+1 year: bank API, credit scoring.  
Future marketplace fee: 2–5%. No commission code now.

Obuna in the demo is Bepul, Starter (199 000 so‘m/oy), Business (299 000 so‘m/oy), and Custom by agreement. Choosing a plan opens the account. Click and Payme are not connected.
