/// <reference types="node" />
/* global __dirname:readable, URL:readable */

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
    exclude: [".wrangler/**", ".direnv/**", "node_modules/**"],
    globalSetup: ["./test/global-setup.ts"], // Only required for integration tests
    teardownTimeout: 100,
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
