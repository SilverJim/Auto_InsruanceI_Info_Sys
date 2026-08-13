from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .models import QuoteRequest, QuoteResponse
from .providers import get_provider

app = FastAPI(title="Ratewise Quote Collector", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "browser": "playwright-system-chrome", "visible": True}


@app.post("/api/quotes/{provider_id}", response_model=QuoteResponse)
async def collect_quotes(provider_id: str, request: QuoteRequest):
    if not request.consent:
        raise HTTPException(status_code=400, detail="Explicit collection consent is required.")
    try:
        provider = get_provider(provider_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    quotes = await provider.collect(request)
    return QuoteResponse(
        quotes=quotes,
        source=provider.display_name,
        mode="public_evidence_discovery",
        notice=(
            "Results are live public evidence collected with a JavaScript browser. "
            "No invented identity was submitted and no purchase intent was expressed."
        ),
    )
