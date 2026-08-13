"""Read-only network diagnosis for Rates.ca without form submission."""

import asyncio
import json
import re

from playwright.async_api import async_playwright


async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        page = await browser.new_page(locale="en-CA")
        response = await page.goto(
            "https://rates.ca/insurance-quotes/auto/ontario",
            wait_until="domcontentloaded",
            timeout=45_000,
        )
        body = await page.locator("body").inner_text()
        ray = re.search(r"Cloudflare Ray ID:\s*([a-z0-9]+)", body, re.I)
        report = {
            "http_status": response.status if response else None,
            "title": await page.title(),
            "final_url": page.url,
            "server": (await response.all_headers()).get("server") if response else None,
            "cloudflare_ray_id": ray.group(1) if ray else None,
            "blocked_text_present": "you have been blocked" in body.lower(),
            "recent_quote_cards_present": "Recent auto Insurance Quote from" in body,
            "body_excerpt": body[:600],
        }
        print(json.dumps(report, indent=2))
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
