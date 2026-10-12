import { expect, mock, test } from "bun:test";
import { ApplicationCommandRegistries, SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import { fileURLToPath } from "node:url";
import { PingCommand } from "../src/commands/ping";

const cwd = fileURLToPath(new URL("..", import.meta.url));
const env = {
  ...process.env,
  DISCORD_TOKEN: "offline-test-token",
  DISCORD_GUILD_ID: "123456789012345678",
  CONVEX_URL: "https://offline-test.convex.cloud"
};

function runOffline(script: string, overrides: Record<string, string> = {}) {
  return Bun.spawnSync([process.execPath, "--no-env-file", "--eval", script], {
    cwd,
    env: { ...env, ...overrides }
  });
}

for (const name of ["DISCORD_TOKEN", "DISCORD_GUILD_ID", "CONVEX_URL"]) {
  test(`startup rejects missing ${name} before login`, () => {
    const result = runOffline('await import("./src/index.ts")', { [name]: "  " });
    expect(result.exitCode).toBe(1);
    expect(result.stderr.toString()).toContain(`Missing environment variable: ${name}`);
    expect(result.stderr.toString()).not.toContain(env.DISCORD_TOKEN);
  });
}

test.each(["not-an-id", "123", "000000000000000000"])(
  "configuration rejects invalid guild ID %s",
  (guildId) => {
    const result = runOffline('await import("./src/config.ts")', { DISCORD_GUILD_ID: guildId });
    expect(result.exitCode).toBe(1);
    expect(result.stderr.toString()).toContain("DISCORD_GUILD_ID must be a Discord snowflake ID");
  }
);

test.each(["not-a-url", "https://offline-test.convex.site"])(
  "Convex rejects invalid deployment URL %s",
  (convexUrl) => {
    const result = runOffline('await import("./src/convex.ts")', { CONVEX_URL: convexUrl });
    expect(result.exitCode).toBe(1);
  }
);

test("Convex initializes from trimmed configuration without a network call", () => {
  const result = runOffline(`
    globalThis.fetch = () => { throw new Error("Unexpected network request"); };
    const { config } = await import("./src/config.ts");
    const { convex } = await import("./src/convex.ts");
    console.log(JSON.stringify({ guildId: config.guildId, convexUrl: convex.url }));
  `, {
    DISCORD_GUILD_ID: ` ${env.DISCORD_GUILD_ID} `,
    CONVEX_URL: ` ${env.CONVEX_URL} `
  });
  expect(result.exitCode).toBe(0);
  expect(JSON.parse(result.stdout.toString())).toEqual({
    guildId: env.DISCORD_GUILD_ID,
    convexUrl: env.CONVEX_URL
  });
});

test("startup loads commands with guild-only registration and minimal intents", () => {
  const result = runOffline(`
    import { Client } from "discord.js";
    import { ApplicationCommandRegistries, container } from "@sapphire/framework";
    globalThis.fetch = () => { throw new Error("Unexpected network request"); };
    let loginCalls = 0;
    Client.prototype.login = async (token) => {
      if (token !== "offline-test-token") throw new Error("Unexpected login token");
      loginCalls++;
      return token;
    };
    await import("./src/index.ts");
    console.log(JSON.stringify({
      loginCalls,
      guildIds: ApplicationCommandRegistries.getDefaultGuildIds(),
      intents: container.client.options.intents.toArray(),
      commands: [...container.client.stores.get("commands").keys()]
    }));
    await container.client.destroy();
  `);
  expect(result.exitCode).toBe(0);
  expect(JSON.parse(result.stdout.toString())).toEqual({
    loginCalls: 1,
    guildIds: [env.DISCORD_GUILD_ID],
    intents: ["Guilds"],
    commands: ["ping"]
  });
});

test("Bun discovers /ping and queues registration only for the test guild", async () => {
  ApplicationCommandRegistries.setDefaultGuildIds([env.DISCORD_GUILD_ID]);
  const client = new SapphireClient({ intents: [GatewayIntentBits.Guilds] });

  try {
    client.stores.registerPath();
    const commands = client.stores.get("commands");
    await commands.loadAll();
    expect(commands.size).toBe(1);
    const ping = commands.get("ping");
    expect(ping).toBeInstanceOf(PingCommand);
    if (!(ping instanceof PingCommand)) throw new Error("Ping command was not discovered");

    await ping.registerApplicationCommands(ping.applicationCommandRegistry);
    expect([...ping.applicationCommandRegistry.chatInputCommands]).toEqual(["ping"]);
    expect([...ping.applicationCommandRegistry.guildIdsToFetch]).toEqual([env.DISCORD_GUILD_ID]);

    const reply = mock();
    await ping.chatInputRun({ reply } as unknown as Parameters<typeof ping.chatInputRun>[0]);
    expect(reply).toHaveBeenCalledTimes(1);
    expect(reply).toHaveBeenCalledWith("Pong!");
  } finally {
    ApplicationCommandRegistries.setDefaultGuildIds(null);
    await client.destroy();
  }
});
