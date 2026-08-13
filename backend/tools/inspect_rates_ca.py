"""Read-only diagnostic for the rendered Rates.ca public page."""

import asyncio

from playwright.async_api import async_playwright


async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        page = await browser.new_page(locale="en-CA")
        await page.goto(
            "https://rates.ca/insurance-quotes/auto/ontario",
            wait_until="domcontentloaded",
            timeout=45_000,
        )
        print("URL:", page.url)
        print("TITLE:", await page.title())
        print((await page.locator("body").inner_text())[:8_000])
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
