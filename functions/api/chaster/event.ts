import { sendDm } from "../../../src/discord/messaging";
import { Env } from "../../../src/env";

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const data = await context.request.json();

    // bris00: 807275316888207420
    await sendDm(context.env, "807275316888207420", JSON.stringify(data));
    return new Response();
}