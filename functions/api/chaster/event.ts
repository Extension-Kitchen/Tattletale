import { sendDm } from "@src/discord/messaging";
import { Env } from "@src/env";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const data = await context.request.json();

  const snowflakeId = data["discordId"];

  await sendDm(context.env, snowflakeId, JSON.stringify(data));
  return new Response();
};
