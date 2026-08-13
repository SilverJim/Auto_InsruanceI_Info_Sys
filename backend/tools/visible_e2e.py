"""Visible end-to-end demonstration of the Ratewise local flow."""

import asyncio
import traceback
from pathlib import Path

from playwright.async_api import async_playwright


async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=False, slow_mo=450)
        page = await browser.new_page(viewport={"width": 1440, "height": 1000})
        await page.goto("http://localhost:3000/", wait_until="domcontentloaded")

        await page.get_by_label("Legal first name").fill("Demo")
        await page.get_by_label("Legal last name").fill("Driver")
        await page.get_by_label("Date of birth").fill("1988-04-12")
        await page.get_by_label("Home postal code").fill("M5V 2T6")
        await page.get_by_label("Year first licensed").fill("2006")
        await page.get_by_role("button", name="Continue").click()

        await page.get_by_label("Model year").fill("2022")
        await page.get_by_label("Make").fill("Toyota")
        await page.locator('input[aria-label="Model"]').fill("RAV4")
        await page.get_by_role("button", name="Continue").click()

        await page.get_by_role("button", name="Continue").click()
        await page.get_by_role("button", name="Continue").click()

        await page.locator("#demo-consent").check()
        await page.get_by_role("button", name="Collect Rates.ca samples").click()
        await page.wait_for_selector("text=Rates.ca public rate samples.", timeout=90_000)

        print("VISIBLE_TEST_COMPLETE")
        print("Final heading:", await page.locator("h1").inner_text())
        print("Displayed status:", await page.locator(".mark.amber").first.inner_text())
        print("The browser will remain open for 5 minutes for inspection.")
        await page.wait_for_timeout(600_000)
        await browser.close()


if __name__ == "__main__":
    log_path = Path("work/visible-e2e.log")
    try:
        asyncio.run(main())
    except Exception:
        log_path.write_text(traceback.format_exc(), encoding="utf-8")
        raise
