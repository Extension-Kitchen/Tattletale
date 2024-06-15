import { Env } from "../env";
import { baseApiUrl } from "./client";

export async function sendDm(env: Env, userSnowflake: string, message: string) {
  const channelRequest = await fetch(`${baseApiUrl}/users/@me/channels`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bot ${env.DISCORD_TOKEN}`,
    },
    body: JSON.stringify({
      recipient_id: userSnowflake,
    }),
  });

  const channel = await channelRequest.json();

  const dmRequest = await fetch(
    `${baseApiUrl}/channels/${channel["id"]}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bot ${env.DISCORD_TOKEN}`,
      },
      body: JSON.stringify({
        content: message,
      }),
    },
  );

  return await dmRequest.json();
}
