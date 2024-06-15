import { sendDm } from "@src/discord/messaging";
import { components } from "@src/chaster/api";
import { Env } from "@src/env";

type WebhookPayload = components["schemas"]["WebhookEventForPublic"]["payload"];
type WebhookPayloadDataMap = {
  [Property in WebhookPayload["event"]]: Extract<
    WebhookPayload,
    { event: Property }
  >["data"];
};

async function actionLogEvent(
  env: Env,
  data: WebhookPayloadDataMap["action_log.created"],
) {
  // TODO: This sends the discord message to the user who _triggered_ the event
  // we should aim to send the message to the keyholder instead (+ maybe the lockee)
  await sendDm(env, data.actionLog.user?.discordId, JSON.stringify(data));
}

async function sessionCreatedEvent(
  _env: Env,
  _data: WebhookPayloadDataMap["extension_session.created"],
) {}

async function sessionUpdatedEvent(
  _env: Env,
  _data: WebhookPayloadDataMap["extension_session.updated"],
) {}

async function sessionDeletedEvent(
  _env: Env,
  _data: WebhookPayloadDataMap["extension_session.deleted"],
) {}

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
