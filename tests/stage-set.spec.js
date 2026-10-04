import { test, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";
import path from "node:path";

const pageUrl = pathToFileURL(path.resolve("index.html")).toString();

const expectedStages = [
  ["group-exit", "1. Everyone Out"],
  ["body-stack", "2. Stack Up"],
  ["shared-key", "3. Key Together"],
  ["pressure-plate", "4. Hold The Plate"],
  ["timed-door", "5. Beat The Door"],
  ["mixed-finale", "6. After-Hours Exit"]
];

test("Stage Set is reachable in the documented teaching order", async ({ page }) => {
  await page.goto(pageUrl);

  for (const [index, [levelId, title]] of expectedStages.entries()) {
    await page.keyboard.press(`Digit${index + 1}`);
    await expect(page.locator("#level-title")).toHaveText(title);
    await expect.poll(() => page.evaluate(() => window.pocketParkTest.snapshot().levelId)).toBe(levelId);
  }
});

test("N advances to the next Stage Set level", async ({ page }) => {
  await page.goto(pageUrl);
  await page.keyboard.press("Digit1");
  await page.keyboard.press("KeyN");

  await expect(page.locator("#level-title")).toHaveText("2. Stack Up");
  const snapshot = await page.evaluate(() => window.pocketParkTest.snapshot());
  expect(snapshot.levelId).toBe("body-stack");
});
