import { rm } from "node:fs/promises";
import path from "node:path";

/**
 * Playwright global setup for the E2E suite.
 *
 * The `/support` route fetches the FAQs with `next: { revalidate: 3600 }`, so
 * Next.js persists the response in the on-disk fetch cache. Drop that cache
 * before the run so a changed mock fixture is never masked by a stale entry
 * from an earlier local run (CI always starts from a clean checkout).
 */
export default async function globalSetup() {
  await rm(path.join(process.cwd(), ".next", "cache", "fetch-cache"), {
    recursive: true,
    force: true,
  });
}
