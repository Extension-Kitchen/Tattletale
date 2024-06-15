import { Env } from "../env";
import { useClient } from "./client";

export async function sendDm(env: Env, userSnowflake: string, message: string) {
  const client = useClient(env);

  const channel = await client.POST("/users/@me/channels", {
    body: {
      recipient_id: userSnowflake,
    },
  });

  const dmRequest = await client.POST("/channels/{channel_id}/messages", {
    params: {
      path: {
        channel_id: channel.data.id,
      },
    },
    body: {
      content: message,
    },
  });

  return dmRequest;
}
