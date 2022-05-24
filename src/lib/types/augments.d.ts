import type { PrismaClient } from "@prisma/client";

declare module '@kaname-png/plugin-env' {
	interface EnvKeys {
		MONGO_CONNECTION_STRING: never;
        MONGO_NAME: never;
	}
}

declare module '@sapphire/pieces' {
    interface Container {
        prisma: PrismaClient
    }
}