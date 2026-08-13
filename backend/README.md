# Python quote collector

The backend uses FastAPI and Playwright Chromium so JavaScript-rendered public evidence can be collected. The initial Rates.ca adapter reads public recent-quote cards and does not submit fabricated personal information, request a callback, accept a declaration, or express purchase intent.

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
python -m playwright install chromium
python -m uvicorn backend.app.main:app --reload --port 8010
```

The API is then available at `http://localhost:8010`, with health status at `/health` and quote collection at `POST /api/quotes/rates_ca`.
