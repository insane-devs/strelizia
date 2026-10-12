function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const config = {
  discordToken: requiredEnv("DISCORD_TOKEN"),
  guildId: requiredEnv("DISCORD_GUILD_ID"),
  convexUrl: requiredEnv("CONVEX_URL")
};

if (!/^[1-9]\d{16,19}$/.test(config.guildId)) {
  throw new Error("DISCORD_GUILD_ID must be a Discord snowflake ID");
}
