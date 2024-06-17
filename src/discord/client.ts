import createClient, { Middleware } from "openapi-fetch";
import type { paths } from "./api";
import { Env } from "@src/env";

export const baseApiHost = "https://discord.com";
export const baseApiPath = "/api/v10";
export const baseApiUrl = `${baseApiHost}${baseApiPath}`;

let client = null;

export function useClient(env: Env): ReturnType<typeof createClient<paths>> {
  if (client === null) {
    const auth: Middleware = {
      async onRequest(req) {
        req.headers.set("Authorization", `Bot ${env.DISCORD_TOKEN}`);
        return req;
      },
    };

    client = createClient<paths>({ baseUrl: baseApiUrl });
    client.use(auth);
  }

  return client;
}
