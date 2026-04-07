from playwright.sync_api import sync_playwright
import time

def test_add_money_to_goal():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Use headless=False to see the browser
        page = browser.new_page()

        try:
            print("Navigating to goals page...")
            page.goto('http://localhost:3000/goals')
            page.wait_for_load_state('networkidle')

            # Take screenshot for inspection
            page.screenshot(path='goals_page.png', full_page=True)
            print("Screenshot saved as goals_page.png")

            # Check if there are goals on the page
            goal_cards = page.locator('[data-testid="goal-card"], .p-5.rounded-xl').all()
            print(f"Found {len(goal_cards)} goal cards")

            if len(goal_cards) == 0:
                print("No goals found. The app might need setup or login.")
                return

            # Look for "Add Money" buttons
            add_money_buttons = page.locator('button:has-text("Add Money")').all()
            print(f"Found {len(add_money_buttons)} 'Add Money' buttons")

            if len(add_money_buttons) == 0:
                print("No 'Add Money' buttons found")
                return

            # Click the first Add Money button
            print("Clicking 'Add Money' button...")
            add_money_buttons[0].click()

            # Wait for modal to appear
            page.wait_for_selector('text=Add Money to Goal', timeout=5000)
            print("Modal opened successfully!")

            # Take screenshot of modal
            page.screenshot(path='add_money_modal.png')
            print("Modal screenshot saved as add_money_modal.png")

            # Check if the modal has the expected elements
            amount_input = page.locator('input[type="number"]').first
            submit_button = page.locator('button[type="submit"]').first

            if amount_input.is_visible() and submit_button.is_visible():
                print("Modal has input field and submit button ✓")

                # Try entering an amount
                print("Entering test amount: 100")
                amount_input.fill("100")

                # Check if preview text appears
                preview_text = page.locator('text=After adding').first
                if preview_text.is_visible():
                    print("Preview text is showing ✓")

                # Take screenshot of filled form
                page.screenshot(path='filled_form.png')
                print("Filled form screenshot saved as filled_form.png")

                print("Test completed successfully!")
            else:
                print("Modal elements not found")

        except Exception as e:
            print(f"Test failed with error: {e}")
            page.screenshot(path='error_screenshot.png')

        finally:
            browser.close()

if __name__ == "__main__":
    test_add_money_to_goal()