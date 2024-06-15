/// <reference types="node" />
/* global __dirname:readable, URL:readable */

import { getTests, getSuites } from "@vitest/runner/utils";
import process from "node:process";
import path from "node:path";
import {
  buildPagesASSETSBinding,
  defineWorkersProject,
} from "@cloudflare/vitest-pool-workers/config";

const assetsPath = path.join(__dirname, "public");

export default defineWorkersProject(async () => ({
  test: {
    alias: {
      "@src/": new URL("./src/", import.meta.url).pathname,
    },
    exclude: [".direnv/**", "node_modules/**"],
    globalSetup: ["./test/global-setup.ts"], // Only required for integration tests
    reporters: [
      "default",
      {
        async onFinished(files) {
          const suites = getSuites(files);
          const tests = getTests(files);
          const numFailedTestSuites = suites.filter(
            (s) => s.result?.errors,
          ).length;
          const numFailedTests = tests.filter(
            (t) => t.result?.state === "fail",
          ).length;

          const success = numFailedTestSuites === 0 && numFailedTests === 0;

          process.exit(success ? 0 : 1);
        },
      },
    ],
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.toml" },
        main: "./dist-functions/index.js", // Built by `global-setup.ts`
        singleWorker: true,
        miniflare: {
          compatibilityFlags: ["nodejs_compat"],
          serviceBindings: {
            ASSETS: await buildPagesASSETSBinding(assetsPath),
          },
        },
      },
    },
  },
}));
