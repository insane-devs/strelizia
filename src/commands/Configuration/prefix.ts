import { bold } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { SubcommandPluginCommand, SubcommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Args, MessageCommandContext } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<SubcommandPluginCommandOptions>({
	description: "Change the bot's prefix for the server.",
	requiredUserPermissions: ['MANAGE_GUILD'],
	preconditions: ['GuildOnly'],
	subcommands: [
		{ name: 'run', messageRun: 'run' as never, default: true },
		{ name: 'reset', messageRun: 'reset' as never }
	]
})
export class UserCommand extends SubcommandPluginCommand {
	public async run(message: Message, args: Args) {
		const newPrefix = await args.pick('string', { maximum: 4 }).catch(() => null);
		const prefix = (await this.container.client.fetchPrefix(message)) as string;

		if (newPrefix) {
			await this.container.prisma.guilds.update({
				where: { id: message.guildId! },
				data: {
					prefix: newPrefix
				}
			});
			return send(message, `Successfully changed the prefix for this guild to ${bold(newPrefix)}`);
		} else return send(message, `The prefix for this guild is a ${bold(prefix)}`);
	}

	public async reset(message: Message) {
		await this.container.prisma.guilds.update({
			where: { id: message.guildId! },
			data: {
				prefix: this.container.client.options.defaultPrefix as string
			}
		});

		return send(message, `Successfully changed the prefix back to default ${bold(this.container.client.options.defaultPrefix as string)}`);
	}
}
