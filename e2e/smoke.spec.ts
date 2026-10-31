import { test, expect, type Page } from "@playwright/test";
import routes from "./routes.json";
import characters from "../src/data/characters.json";
import sections from "../src/data/sections.json";
import flows from "../src/data/flows.json";

// The headings are already in the static HTML, so a heading alone does not
// prove that the bundle works. Each test therefore also fails on an uncaught
// error or a console error, and the interaction tests below only pass once
// the page has hydrated.
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console.error: ${message.text()}`);
  });
  return errors;
}

type Route = { path: string; role: "heading" | "searchbox"; name: string };

for (const route of routes as Route[]) {
  test(`${route.path} renders "${route.name}"`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(route.path);
    const target =
      route.role === "heading"
        ? page.getByRole("heading", { level: 1, name: route.name, exact: true })
        : page.getByRole(route.role, { name: route.name, exact: true });
    await expect(target).toBeVisible();
    expect(errors).toEqual([]);
  });
}

type Detail = { kind: string; base: string; pages: { id: string; heading: string }[] };

const details: Detail[] = [
  {
    kind: "character",
    base: "/postavy",
    pages: characters.map((c) => ({ id: c.id, heading: c.nameCs })),
  },
  {
    kind: "section",
    base: "/sekce",
    pages: sections.map((s) => ({ id: s.id, heading: s.nameCs })),
  },
  {
    kind: "flow",
    base: "/pruvodci",
    pages: flows.map((f) => ({ id: f.id, heading: f.title })),
  },
];

for (const detail of details) {
  test(`every ${detail.kind} page renders its heading`, async ({ page }) => {
    test.setTimeout(60_000);
    const errors = collectErrors(page);
    for (const { id, heading } of detail.pages) {
      const path = `${detail.base}/${id}`;
      await page.goto(path);
      await expect(
        page.getByRole("heading", { level: 1, name: heading, exact: true }),
        path,
      ).toBeVisible();
    }
    expect(errors).toEqual([]);
  });
}

test("the home page redirects to the characters", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/");
  await expect(page).toHaveURL(/\/postavy$/);
  await expect(page.getByRole("heading", { level: 1, name: "Postavy", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("search finds a character and opens it", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/hledat");
  await page.getByRole("searchbox", { name: "Hledat", exact: true }).fill("Agentka");
  await page.getByRole("link", { name: /^Agentka/ }).click();
  await expect(page).toHaveURL(/\/postavy\/agentka$/);
  await expect(page.getByRole("heading", { level: 1, name: "Agentka", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("a glossary term opens and closes its sheet", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/glosar");
  await page.getByRole("button", { name: "Konspirátor", exact: true }).click();
  const sheet = page.getByRole("dialog", { name: "Konspirátor", exact: true });
  await expect(sheet).toBeVisible();
  await sheet.getByRole("button", { name: "Zavřít", exact: true }).click();
  await expect(sheet).toBeHidden();
  expect(errors).toEqual([]);
});
