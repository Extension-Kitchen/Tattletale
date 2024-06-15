import { verifyKey } from "discord-interactions";
import { Env } from "../env";

// type VerifiedInteraction =
//   | {
//       interaction:
//         | components["schemas"]["PongInteractionCallbackRequest"]
//         | components["schemas"]["ApplicationCommandSubcommandGroupOption"]
//         | components["schemas"]["MessageComponentStringSelectResponse"];

//       isValid: true;
//     }
//   | {
//       interaction: undefined;
//       isValid: false;
//     };

export async function verifyDiscordRequest({
  request,
  env,
}: EventContext<Env, string, Record<string, unknown>>) {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  const body = await request.text();
  const isValidRequest =
    signature &&
    timestamp &&
    verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY);
  if (!isValidRequest) {
    return { isValid: false, interaction: undefined };
  }

  return { interaction: JSON.parse(body), isValid: true };
}
