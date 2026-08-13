from __future__ import annotations

from abc import ABC, abstractmethod

from ..models import QuoteRequest, QuoteResult


class QuoteProvider(ABC):
    """Contract implemented by browser, API, broker, and handoff routes."""

    provider_id: str
    display_name: str

    @abstractmethod
    async def collect(self, request: QuoteRequest) -> list[QuoteResult]:
        """Return evidence-backed results without crossing a purchase boundary."""
