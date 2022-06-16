import type { PrismaClient } from '@prisma/client';

declare module '@kaname-png/plugin-env' {
	interface EnvKeys {
		DATABASE_URL: never;
		DISCORD_TOKEN: never[];
		OWNERS: never;
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		prisma: PrismaClient;
	}
}
