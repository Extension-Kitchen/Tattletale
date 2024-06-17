import { sendDm } from "@src/discord/messaging";
import { components } from "@src/chaster/api";
import { Env } from "@src/env";
import { useClient } from "@src/chaster/client";

type WebhookPayload = components["schemas"]["WebhookEventForPublic"]["payload"];
type WebhookPayloadDataMap = {
  [Property in WebhookPayload["event"]]: Extract<
    WebhookPayload,
    { event: Property }
  >["data"];
};

async function lockEvent(
  env: Env,
  lock: components["schemas"]["LockForPublic"],
  message: string,
) {
  const userDiscordSnowflake = lock.user.discordId;
  const khDiscordSnowflake = lock.keyholder.discordId;

  await Promise.all([
    sendDm(env, khDiscordSnowflake, message),
    sendDm(env, userDiscordSnowflake, message),
  ]);
}

async function actionLogEvent(
  env: Env,
  data: WebhookPayloadDataMap["action_log.created"],
) {
  const client = useClient(env);

  const session = await client.GET("/api/extensions/sessions/{sessionId}", {
    params: {
      path: {
        sessionId: data.sessionId,
      },
    },
  });

  await lockEvent(env, session.data?.session.lock, JSON.stringify(data));
}

async function sessionCreatedEvent(
  env: Env,
  data: WebhookPayloadDataMap["extension_session.created"],
) {
  await lockEvent(env, data.session.lock, JSON.stringify(data));
}

async function sessionUpdatedEvent(
  env: Env,
  data: WebhookPayloadDataMap["extension_session.updated"],
) {
  await lockEvent(env, data.session.lock, JSON.stringify(data));
}

async function sessionDeletedEvent(
  env: Env,
  data: WebhookPayloadDataMap["extension_session.deleted"],
) {
  await lockEvent(env, data.session.lock, JSON.stringify(data));
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const data: WebhookPayload = await context.request.json();

  switch (data.event) {
    case "action_log.created":
      await actionLogEvent(context.env, data.data);
      break;
    case "extension_session.created":
      await sessionCreatedEvent(context.env, data.data);
      break;
    case "extension_session.updated":
      await sessionUpdatedEvent(context.env, data.data);
      break;
    case "extension_session.deleted":
      await sessionDeletedEvent(context.env, data.data);
      break;
    default:
      console.error(
        `unknown chaster event type ${(data as { event: string }).event}`,
      );
  }

  return new Response();
};
