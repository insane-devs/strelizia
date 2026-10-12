# Strelizia

A Discord bot using Sapphire, discord.js, Convex, and Bun with strict TypeScript.

## Setup

1. Install [Bun](https://bun.sh/) (tested with 1.4.2), then run `bun install`.
2. Copy `.env.example` to `.env`. Bun loads it automatically.
3. Fill in:
   - `DISCORD_TOKEN`: the bot token from the [Discord Developer Portal](https://discord.com/developers/applications). Keep it secret.
   - `DISCORD_GUILD_ID`: your test server's ID (enable Discord Developer Mode to copy it).
   - `CONVEX_URL`: the existing deployment URL from your Convex dashboard, e.g. `https://your-deployment.convex.cloud`. Use the deployment URL, not the `.convex.site` HTTP-actions URL.
4. Invite the bot to that server using the `bot` and `applications.commands` OAuth2 scopes. Grant permission to view the test channel and send messages; administrator access is unnecessary.
5. Run `bun run start`, then invoke `/ping` in the test server. It replies `Pong!`.

Only the Guilds gateway intent is requested. No privileged intents are needed.
Sapphire discovers commands in `src/commands/` via the `main` entry in `package.json`.
Commands register in the configured test guild when the bot starts, not globally.

## Development

- `bun run dev`: restart on source changes.
- `bun run typecheck`: check TypeScript without emitting JavaScript.
- `bun test`: run offline configuration and command smoke tests.

Bun is both the runtime and package manager; no separate build step is required.
Commit `bun.lock` for reproducible dependency resolution.

## Convex boundary

`src/convex.ts` exports a configured `ConvexHttpClient`. Constructing it validates
the deployment URL but does not make a network request. Startup does not verify
deployment connectivity, and `/ping` does not use the database.

There are no backend functions, schema changes, deployments, or authentication
credentials in this scaffold. Before adding database calls, agree on the existing
functions and their authentication requirements. Do not put Convex deployment
keys into Discord commands or expose unauthenticated write functions.

## Verification limits

Offline tests check environment validation, Bun/Sapphire command discovery,
guild-scoped registration configuration, and the ping reply. Live Discord login,
command registration, and Convex connectivity require your credentials and are
not part of those tests.
