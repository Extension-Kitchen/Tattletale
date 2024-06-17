import createClient, { Middleware } from "openapi-fetch";
import type { paths } from "./api";
import { Env } from "@src/env";

export const baseApiUrl = "https://api.chaster.app";

let client = null;

export function useClient(env: Env): ReturnType<typeof createClient<paths>> {
  if (client === null) {
    const auth: Middleware = {
      async onRequest(req) {
        req.headers.set("Authorization", `Bearer ${env.CHASTER_TOKEN}`);
        return req;
      },
    };

    client = createClient<paths>({ baseUrl: baseApiUrl });
    client.use(auth);
  }

  return client;
}
