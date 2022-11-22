import { ApplyOptions } from '@sapphire/decorators';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { Command, CommandOptions } from '@sapphire/framework';
import { Stopwatch } from '@sapphire/stopwatch';
import { Duration, DurationFormatter } from '@sapphire/time-utilities';
import { chunk } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
	requiredUserPermissions: ['MODERATE_MEMBERS'],
	requiredClientPermissions: ['EMBED_LINKS'],
	description: 'Dumps a list of members who joined the server since a specific amount of time.',
	detailedDescription: [
		'It is possible to provide a specific time of when they joined, however this would show more results. (Default is 1h)',
		'For example: `dump 5h` would show users who joined since 5 hours ago from now.\n',
		'The `noav` flag will filter and show users with no avatars set in their profile, useful for user token raids.\n',
		'The `--createdAt` flag will filter and show users whose accounts were created at the supplied time.',
		'For example `dump --createdAt=2w` would show users who joined an hour from now and whose account is 2 weeks old.'
	].join('\n')
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName(this.name)
					.setDescription(this.description)
					.addStringOption((options) => options.setName('duration').setDescription('Show users who joined since inputted time.'))
					.addBooleanOption((options) =>
						options.setName('noav').setDescription('Should the command filter and show users with no avatars set in their profile.')
					)
					.addStringOption((options) =>
						options
							.setName('createdat')
							.setDescription('Should the command filter and show users whose accounts were created at the supplied time.')
					),
			{ guildIds: ['508495069914071040'] }
		);
	}

	public async chatInputRun(interaction: Command.ChatInputInteraction) {
		const stopwatch = new Stopwatch();
		// Get all possible arguments
		const durationInput = interaction.options.getString('duration');
		const noav = interaction.options.getBoolean('noav');
		const createdAtInput = interaction.options.getString('createdat');

		// Duration offset validation
		const duration = new Duration(durationInput ?? '1h');
		const createdDuration = createdAtInput ? new Duration(createdAtInput).offset : null;
		if (isNaN(duration.offset)) interaction.reply({ content: 'Invalid duration string' });

		await interaction.reply({ content: 'Fetching members...' });
		const members = await interaction.guild?.members.fetch();

		const timeDifference = duration.offset;
		let filtered = members?.filter((member) => Date.now() - member.joinedTimestamp! <= timeDifference);

		if (noav) filtered = filtered?.filter((member) => !member.user.avatarURL());

		if (createdDuration && !isNaN(createdDuration)) {
			const accountAge = createdDuration;
			filtered = filtered?.filter((members) => Date.now() - members.user.createdTimestamp <= accountAge);
		}

		if (!filtered?.size) return interaction.editReply({ content: "I didn't get any members who joined during that time." });

		const Ids = [];
		for (const id of filtered.keys()) {
			Ids.push(id);
		}

		const paginatedMessage = new PaginatedMessage({
			template: new MessageEmbed()
				.setTitle(`${filtered.size} members who joined ${new DurationFormatter().format(duration.offset)} ago`)
				.setFooter({ text: `Took ${stopwatch}` })
		});

		const chunks = chunk(Ids, 22);
		for (const chunk of chunks) {
			paginatedMessage.addPageEmbed((embed) =>
				embed.addField('\u200b', chunk.join(', ')).addField('\u200b', chunk.map((id) => `<@${id}>`).join(', '))
			);
		}

		return paginatedMessage.run(interaction);
	}
}
