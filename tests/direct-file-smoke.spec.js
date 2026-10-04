import { test, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";
import path from "node:path";

const pageUrl = pathToFileURL(path.resolve("index.html")).toString();

test("direct-file Playable Spine boots and exposes a Rule Snapshot", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });

  await page.goto(pageUrl);
  await expect(page.locator("#level-title")).toHaveText("1. Everyone Out");
  await expect(page.locator("#status")).toContainText("Reach the glowing exit");
  await page.keyboard.down("KeyD");
  await page.waitForTimeout(250);
  await page.keyboard.up("KeyD");

  const snapshot = await page.evaluate(() => window.pocketParkTest.snapshot());
  expect(snapshot.levelId).toBe("group-exit");
  expect(snapshot.pips).toHaveLength(2);
  expect(snapshot.pips[0].x).toBeGreaterThan(120);
  expect(snapshot.complete).toBe(false);
  expect(errors).toEqual([]);
});
