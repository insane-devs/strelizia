import { ApplyOptions } from '@sapphire/decorators';
import type { Command } from '@sapphire/framework';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Unlocks and allow the @everyone role to speak in the whole server.',
	requiredUserPermissions: ['MODERATE_MEMBERS'],
	requiredClientPermissions: ['MANAGE_ROLES'],
	chatInputCommand: { register: true, guildIds: ['330948931397615616', '508495069914071040', '889292703525900288'] }
})
export class UserCommand extends SubCommandPluginCommand {
	public async chatInputRun(interaction: Command.ChatInputInteraction) {
		await interaction.reply({ content: 'Unlocking server...', allowedMentions: { repliedUser: false } });

		const everyone = interaction.guild?.roles.cache.get(interaction.guildId!);

		if (everyone?.permissions.serialize().SEND_MESSAGES) return interaction.editReply({ content: 'The server is currently unlocked.' });

		const newPerms = everyone?.permissions.toArray()!;
		newPerms.push('SEND_MESSAGES', 'SEND_MESSAGES_IN_THREADS');
		await everyone?.setPermissions(newPerms, `Strelizia unlock command executed by ${interaction.user.tag}`);
		return interaction.editReply({ content: 'Successfully unlocked the server.' });
	}
}
