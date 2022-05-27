import { isGuildBasedChannel } from '@sapphire/discord.js-utilities';
import { container, LogLevel, SapphireClient } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class StreliziaClient extends SapphireClient {
	public constructor() {
		super({
			defaultPrefix: 's/',
			env: {
				enabled: true
			},
			regexPrefix: /^(hey +)?strelizia[,! ]/i,
			caseInsensitiveCommands: true,
			typing: true,
			logger: {
				level: LogLevel.Debug
			},
			loadMessageCommandListeners: true,
			shards: 'auto',
			intents: [
				'GUILDS',
				'GUILD_MEMBERS',
				'GUILD_BANS',
				'GUILD_EMOJIS_AND_STICKERS',
				'GUILD_VOICE_STATES',
				'GUILD_MESSAGES',
				'GUILD_MESSAGE_REACTIONS',
				'DIRECT_MESSAGES',
				'DIRECT_MESSAGE_REACTIONS'
			]
		});
	}

	public override async login(token?: string) {
		container.logger.info('Connecting to database...');
		await container.prisma.$connect();

		return super.login(token);
	}

	public override async destroy() {
		await container.prisma.$disconnect();
		return super.destroy();
	}

	public override fetchPrefix = async (message: Message) => {
		if (isGuildBasedChannel(message.channel)) {
			const guild = await container.prisma.guilds.findUnique({ where: { id: message.guild!.id } });
			return (guild?.prefix as string) ?? this.options.defaultPrefix;
		}
		return this.options.defaultPrefix as string;
	};
}
