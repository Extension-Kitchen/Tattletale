import { Env } from "@src/env";

export function inviteUri(env: Env) {
  const applicationId = env.DISCORD_APPLICATION_ID;
  return `https://discord.com/oauth2/authorize?client_id=${applicationId}&scope=bot`;
}
