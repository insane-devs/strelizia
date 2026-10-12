import { ApplicationCommandRegistries, SapphireClient } from "@sapphire/framework";
import { Events, GatewayIntentBits } from "discord.js";
import { config } from "./config";
import "./convex";

ApplicationCommandRegistries.setDefaultGuildIds([config.guildId]);

const client = new SapphireClient({
  intents: [GatewayIntentBits.Guilds]
});

client.once(Events.ClientReady, (readyClient) => {
  client.logger.info(`Logged in as ${readyClient.user.tag}`);
});

process.once("SIGINT", () => void client.destroy());
process.once("SIGTERM", () => void client.destroy());

try {
  await client.login(config.discordToken);
} catch (error) {
  client.logger.error("Failed to start the bot", error);
  await client.destroy();
  process.exitCode = 1;
}
