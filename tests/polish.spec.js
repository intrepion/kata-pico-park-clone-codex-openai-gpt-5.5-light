import { test, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";
import path from "node:path";

const pageUrl = pathToFileURL(path.resolve("index.html")).toString();

test("mute, reduced motion, and player count persist locally", async ({ page }) => {
  await page.goto(pageUrl);
  await page.keyboard.press("KeyM");
  await page.keyboard.press("KeyV");
  await page.keyboard.press("KeyP");

  let snapshot = await page.evaluate(() => window.pocketParkTest.snapshot());
  expect(snapshot.mute).toBe(true);
  expect(snapshot.reducedMotion).toBe(true);
  expect(snapshot.playerCount).toBe(3);

  await page.reload();
  snapshot = await page.evaluate(() => window.pocketParkTest.snapshot());
  expect(snapshot.mute).toBe(true);
  expect(snapshot.reducedMotion).toBe(true);
  expect(snapshot.playerCount).toBe(3);
  await expect(page.locator("#mute-button")).toHaveText("Sound Off");
  await expect(page.locator("#motion-button")).toHaveText("Motion Low");
  await expect(page.locator("#players-button")).toHaveText("3 Pips");
});

test("Best Time is saved after Group Exit completion", async ({ page }) => {
  await page.goto(pageUrl);
  await page.evaluate(() => {
    window.pocketParkTest.setLevel(0);
    window.pocketParkTest.setPlayerCount(2);
    window.pocketParkTest.setPipPosition(0, 792, 364);
    window.pocketParkTest.setPipPosition(1, 816, 364);
    window.pocketParkTest.tick(16);
  });

  const snapshot = await page.evaluate(() => window.pocketParkTest.snapshot());
  expect(snapshot.complete).toBe(true);
  expect(snapshot.bestTimes["group-exit"]).toBeGreaterThan(0);
});
