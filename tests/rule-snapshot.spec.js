import { test, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";
import path from "node:path";

const pageUrl = pathToFileURL(path.resolve("index.html")).toString();

test.beforeEach(async ({ page }) => {
  await page.goto(pageUrl);
});

test("Shared Key opens the key door for the Local Party", async ({ page }) => {
  await page.evaluate(() => {
    window.pocketParkTest.setLevel(2);
    window.pocketParkTest.setPipPosition(0, 482, 334);
    window.pocketParkTest.tick(16);
  });

  const snapshot = await page.evaluate(() => window.pocketParkTest.snapshot());
  expect(snapshot.levelId).toBe("shared-key");
  expect(snapshot.hasSharedKey).toBe(true);
  expect(snapshot.doorOpen).toBe(true);
});

test("Push Block can hold a Pressure Plate open", async ({ page }) => {
  await page.evaluate(() => {
    window.pocketParkTest.setLevel(3);
    window.pocketParkTest.setPushBlockPosition(0, 470, 456);
    window.pocketParkTest.tick(16);
  });

  const snapshot = await page.evaluate(() => window.pocketParkTest.snapshot());
  expect(snapshot.levelId).toBe("pressure-plate");
  expect(snapshot.plateActive).toBe(true);
  expect(snapshot.doorOpen).toBe(true);
});

test("Pressure Plate opens the Timed Door window", async ({ page }) => {
  await page.evaluate(() => {
    window.pocketParkTest.setLevel(4);
    window.pocketParkTest.setPipPosition(0, 292, 382);
    window.pocketParkTest.tick(16);
  });

  const snapshot = await page.evaluate(() => window.pocketParkTest.snapshot());
  expect(snapshot.levelId).toBe("timed-door");
  expect(snapshot.plateActive).toBe(true);
  expect(snapshot.timedDoorOpen).toBe(true);
});

test("Group Exit requires every Pip to be in the exit", async ({ page }) => {
  await page.evaluate(() => {
    window.pocketParkTest.setLevel(0);
    window.pocketParkTest.setPipPosition(0, 792, 364);
    window.pocketParkTest.tick(16);
  });
  await expect.poll(() => page.evaluate(() => window.pocketParkTest.snapshot().complete)).toBe(false);

  await page.evaluate(() => {
    window.pocketParkTest.setPipPosition(1, 816, 364);
    window.pocketParkTest.tick(16);
  });
  await expect.poll(() => page.evaluate(() => window.pocketParkTest.snapshot().complete)).toBe(true);
});
