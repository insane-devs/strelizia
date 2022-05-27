import { bold } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: "Change the bot's prefix for the server.",
	requiredUserPermissions: ['MANAGE_GUILD'],
	preconditions: ['GuildOnly'],
	subCommands: ['reset', { input: 'run', default: true }]
})
export class UserCommand extends SubCommandPluginCommand {
	public async run(message: Message, args: Args) {
		const newPrefix = await args.pick('string', { maximum: 4 }).catch(() => null);
		const prefix = (await this.container.client.fetchPrefix(message)) as string;

		if (newPrefix) {
			await this.container.prisma.guilds.update({
				where: { id: message.guild!.id },
				data: {
					prefix: newPrefix
				}
			});
			return send(message, `Successfully changed the prefix for this guild to ${bold(newPrefix)}`);
		} else return send(message, `The prefix for this guild is a ${bold(prefix)}`);
	}

	public async reset(message: Message) {
		await this.container.prisma.guilds.update({
			where: { id: message.guild!.id },
			data: {
				prefix: this.container.client.options.defaultPrefix as string
			}
		});

		return send(message, `Successfully changed the prefix back to default ${bold(this.container.client.options.defaultPrefix as string)}`);
	}
}
