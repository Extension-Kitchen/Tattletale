/**
 * A simple :wave: hello page to verify the worker is working.
 */

import { Env } from "../../src/env";

export const onRequestGet: PagesFunction<Env> = (context) => {
  return new Response(`👋 ${context.env.DISCORD_APPLICATION_ID} ${context.env.CHASTER_CLIENT_ID}`);
}