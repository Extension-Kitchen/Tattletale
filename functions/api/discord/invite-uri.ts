import { Env } from "@src/env";
import { inviteUri } from "@src/discord/invite-uri";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return new Response(inviteUri(context.env));
};
