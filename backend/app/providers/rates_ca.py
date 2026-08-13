from __future__ import annotations

import hashlib
import re
from datetime import datetime, timezone

from playwright.async_api import TimeoutError as PlaywrightTimeoutError
from playwright.async_api import async_playwright

from ..models import QuoteRequest, QuoteResult
from .base import QuoteProvider


SOURCE_URL = "https://rates.ca/insurance-quotes/auto/ontario"
PANEL = "CAA, Coachman, Echelon, Economical, Gore Mutual, Pafco, Pembridge, SGI, Travelers, Zenith"


class RatesCaProvider(QuoteProvider):
    provider_id = "rates_ca"
    display_name = "Rates.ca"

    async def collect(self, request: QuoteRequest) -> list[QuoteResult]:
        """Collect public recent-quote cards rendered by JavaScript.

        The collector deliberately does not submit invented personal information.
        Public samples are estimates, never applicant-specific firm quotes.
        """
        captured = datetime.now(timezone.utc)
        body = ""
        final_url = SOURCE_URL
        try:
            async with async_playwright() as playwright:
                browser = await playwright.chromium.launch(headless=True)
                page = await browser.new_page(locale="en-CA", viewport={"width": 1440, "height": 1100})
                await page.goto(SOURCE_URL, wait_until="domcontentloaded", timeout=45_000)
                try:
                    await page.wait_for_load_state("networkidle", timeout=12_000)
                except PlaywrightTimeoutError:
                    pass
                body = await page.locator("body").inner_text(timeout=15_000)
                final_url = page.url
                await browser.close()
        except Exception as exc:
            return [self._blocker(captured, f"JavaScript page collection failed: {type(exc).__name__}")]

        if "Attention Required!" in body or "you have been blocked" in body.lower():
            ray_match = re.search(r"Cloudflare Ray ID:\s*([a-z0-9]+)", body, re.IGNORECASE)
            ray = f" Ray ID: {ray_match.group(1)}." if ray_match else ""
            return [self._blocker(
                captured,
                "Rates.ca access control blocked the automated browser; no bypass was attempted." + ray,
            )]

        samples = self._parse_samples(body)
        if not samples:
            return [self._blocker(captured, "No public recent-quote cards were found; the page structure may have changed.")]

        ranked = sorted(samples, key=lambda sample: self._relevance(sample, request), reverse=True)[:6]
        return [self._to_result(sample, request, captured, final_url, index) for index, sample in enumerate(ranked)]

    @staticmethod
    def _parse_samples(text: str) -> list[dict[str, str | int]]:
        normalized = re.sub(r"[ \t]+", " ", text)
        pattern = re.compile(
            r"Recent auto Insurance Quote from (?P<city>[^\n]+).*?"
            r"(?P<gender>Male|Female), (?P<age>\d{2}) years old.*?"
            r"(?P<year>20\d{2}) (?P<vehicle>[^\n]+).*?"
            r"Cheapest Quote\s*\$\s*(?P<monthly>[\d,]+)\s*/ month\s*"
            r"\$\s*(?P<annual>[\d,]+)\s*/ year",
            re.IGNORECASE | re.DOTALL,
        )
        samples: list[dict[str, str | int]] = []
        seen: set[tuple[str, int, str]] = set()
        for match in pattern.finditer(normalized):
            annual = int(match.group("annual").replace(",", ""))
            key = (match.group("city").strip().lower(), annual, match.group("vehicle").strip())
            if key in seen:
                continue
            seen.add(key)
            samples.append({
                "city": match.group("city").strip().title(),
                "gender": match.group("gender").title(),
                "age": int(match.group("age")),
                "year": int(match.group("year")),
                "vehicle": match.group("vehicle").strip(),
                "monthly": int(match.group("monthly").replace(",", "")),
                "annual": annual,
            })
        return samples

    @staticmethod
    def _relevance(sample: dict[str, str | int], request: QuoteRequest) -> int:
        score = 0
        vehicle = str(sample["vehicle"]).lower()
        if request.make.lower() in vehicle:
            score += 5
        if request.model.lower() in vehicle:
            score += 7
        try:
            score += max(0, 4 - abs(int(sample["year"]) - int(request.vehicleYear)))
        except ValueError:
            pass
        return score

    def _to_result(self, sample, request, captured, url, index) -> QuoteResult:
        fingerprint = hashlib.sha256(
            f"{sample['city']}:{sample['vehicle']}:{sample['annual']}".encode()
        ).hexdigest()[:10]
        return QuoteResult(
            id=f"rates-{fingerprint}",
            brand="Rates.ca public sample",
            initials="R",
            color=["navy", "green", "plum", "orange"][index % 4],
            underwriter=f"Panel not disclosed for this sample ({PANEL})",
            sourceId=f"RATES-PUBLIC-{fingerprint}",
            annual=int(sample["annual"]),
            monthly=int(sample["monthly"]),
            liability="Not published",
            deductible="Not published",
            dcpd=None,
            opcf44=None,
            comparable=False,
            verified=True,
            exact=False,
            status="estimate_only",
            statusLabel="Public sample",
            differences=[
                "This is a published recent quote for another anonymous profile, not a quote for this applicant.",
                "Coverage limits, deductibles, discounts, and legal underwriter are not disclosed on the public card.",
            ],
            reference=f"PUBLIC-{fingerprint.upper()}",
            confidence="Low",
            evidenceUrl=url,
            capturedAt=captured.isoformat(),
            sourceRoute="Rates.ca public Ontario recent-quotes page",
            sampleProfile=f"{sample['city']} · {sample['gender']}, {sample['age']} · {sample['year']} {sample['vehicle']}",
        )

    def _blocker(self, captured: datetime, reason: str) -> QuoteResult:
        return QuoteResult(
            id="rates-collection-blocked",
            brand="Rates.ca",
            initials="R",
            underwriter="Not returned",
            sourceId="RATES-ROUTE",
            status="blocked",
            statusLabel="Collection blocked",
            differences=[reason],
            reference="RATES-BLOCKED",
            confidence="Low",
            evidenceUrl=SOURCE_URL,
            capturedAt=captured.isoformat(),
            sourceRoute="Rates.ca JavaScript browser adapter",
        )
