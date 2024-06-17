// NOTE: This link is a good example of pages functions and testing
// https://github.com/cloudflare/workers-sdk/tree/main/fixtures/vitest-pool-workers-examples/pages-functions-unit-integration-self

import {
  InteractionResponseType,
  InteractionType,
  InteractionResponseFlags,
} from "discord-interactions";
import { INVITE_COMMAND } from "@src/discord/commands";
import { SELF, fetchMock } from "cloudflare:test";
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterEach,
  beforeEach,
} from "vitest";
import {
  baseApiHost as discordBaseApiHost,
  baseApiPath as discordBaseApiPath,
} from "@src/discord/client";
import { baseApiUrl as chasterBaseApiHost } from "@src/chaster/client";
import * as discordVerifyMod from "@src/discord/verify";

// To make hot reloading work
import * as _ from "../dist-functions";

vi.mock("@src/discord/verify");

beforeAll(() => {
  // Enable outbound request mocking...
  fetchMock.activate();
  // ...and throw errors if an outbound request isn't mocked
  fetchMock.disableNetConnect();
});

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
});

// Ensure we matched every mock we defined
afterEach(() => fetchMock.assertNoPendingInterceptors());

describe("Server", () => {
  describe("GET /", () => {
    it("should return a greeting message with the Discord application ID", async () => {
      const response = await SELF.fetch("https://example.com/api");
      const body = await response.text();

      expect(body).to.satisfy((b) => b.startsWith("👋"));
    });
  });

  describe("POST /", () => {
    it("should handle a PING interaction", async () => {
      const interaction = {
        type: InteractionType.PING,
      };

      vi.mocked(discordVerifyMod.verifyDiscordRequest).mockReturnValue(
        Promise.resolve({
          isValid: true,
          interaction: interaction,
        }),
      );

      const response = await SELF.fetch(
        "https://example.com/api/discord/interactions",
        {
          method: "POST",
        },
      );
      const body = await response.json();
      expect(body["type"]).to.equal(InteractionResponseType.PONG);
    });

    it("should handle a lock event", async () => {
      const channelId = 0;
      const snowflake = 1243;
      const sessionId = 143;

      // mock the fetch calls to chaster
      fetchMock
        .get(chasterBaseApiHost)
        .intercept({
          method: "GET",
          headers: (headers) => headers["authorization"].startsWith("Bearer "),
          path: `/api/extensions/sessions/${sessionId}`,
        })
        .reply(200, {
          session: {
            lock: {
              user: { discordId: snowflake },
              keyholder: { discordId: snowflake },
            },
          },
        });

      // mock the fetch calls to discord
      for (const _ of [0, 1]) {
        fetchMock
          .get(discordBaseApiHost)
          .intercept({
            method: "POST",
            body: (b) => JSON.parse(b)["recipient_id"] === snowflake,
            headers: (headers) => headers["authorization"].startsWith("Bot "),
            path: discordBaseApiPath + "/users/@me/channels",
          })
          .reply(200, { id: channelId });

        fetchMock
          .get(discordBaseApiHost)
          .intercept({
            method: "POST",
            headers: (headers) => headers["authorization"].startsWith("Bot "),
            path: discordBaseApiPath + `/channels/${channelId}/messages`,
          })
          .reply(200, {});
      }

      const response = await SELF.fetch(
        "https://example.com/api/chaster/event",
        {
          method: "POST",
          body: JSON.stringify({
            event: "action_log.created",
            data: { sessionId: sessionId },
          }),
        },
      );

      expect(response.status).to.equal(200);
    });

    it("should handle an invite command interaction", async () => {
      const interaction = {
        type: InteractionType.APPLICATION_COMMAND,
        data: {
          name: INVITE_COMMAND.name,
        },
      };

      vi.mocked(discordVerifyMod.verifyDiscordRequest).mockReturnValue(
        Promise.resolve({
          isValid: true,
          interaction: interaction,
        }),
      );

      const response = await SELF.fetch(
        "https://example.com/api/discord/interactions",
        {
          method: "POST",
        },
      );
      const body = await response.json();
      expect(body["type"]).to.equal(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      );
      expect(body["data"].content).to.matchSnapshot();
      expect(body["data"].flags).to.equal(InteractionResponseFlags.EPHEMERAL);
    });

    it("should handle an unknown command interaction", async () => {
      const interaction = {
        type: InteractionType.APPLICATION_COMMAND,
        data: {
          name: "unknown",
        },
      };

      vi.mocked(discordVerifyMod.verifyDiscordRequest).mockReturnValue(
        Promise.resolve({
          isValid: true,
          interaction: interaction,
        }),
      );

      const response = await SELF.fetch(
        "https://example.com/api/discord/interactions",
        {
          method: "POST",
        },
      );
      expect(
        vi.mocked(discordVerifyMod.verifyDiscordRequest).mock.calls.length,
      ).to.equal(1);
      const body = await response.json();
      expect(response.status).to.equal(400);
      expect(body["error"]).to.equal("Unknown Type");
    });
  });

  describe("All other routes", () => {
    it('api should return a "Not Found" response', async () => {
      const response = await SELF.fetch("https://example.com/api/unknown");
      expect(response.status).to.equal(404);
      const body = await response.text();
      expect(body).to.equal("");
    });

    it('pages should return a "Not Found" response', async () => {
      const response = await SELF.fetch("https://example.com/unknown");
      expect(response.status).to.equal(404);
      const body = await response.text();
      expect(body).to.equal("");
    });
  });
});
