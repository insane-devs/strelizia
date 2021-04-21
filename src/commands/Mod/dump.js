const { Command, Stopwatch, util: { chunk }, Duration: { toNow } } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { EMOTES: { cross, typing } } = require('#util/constants');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			requiredPermissions: ['EMBED_LINKS'],
			permissionLevel: 6,
			description: 'Dumps a list of members who joined the server since a specific amount of time.',
			extendedHelp: [
				'It is possible to provide a specific time of when they joined, however this would show more results. (Default is 1h)',
				'For example: `dump 5h` would show users who joined since 5 hours ago from now.\n',
				'The `--no-av` flag will filter and show users with no avatars set in their profile, useful for user token raids.\n',
				'The `--createdAt` flag will filter and show users whose accounts were created at the supplied time.',
				'For example `dump --createdAt=2w` would show users who joined an hour from now and whose account is 2 weeks old.'
			].join('\n'),
			usage: '[Duration:duration]'
		});
	}

	async run(message, [duration = Date.now() + (1000 * 60 * 60)]) {
		const stopwatch = new Stopwatch();
		await message.send(`${typing}  ::  Fetching members...`);

		const ids = [];
		const timeDiff = Number(duration) - Date.now();
		const members = await message.guild.members.fetch({ cache: false });
		let filtered = members.filter(member => Date.now() - member.joinedAt <= timeDiff);

		if (message.flagArgs.noav) filtered = filtered.filter(member => !member.user.avatarURL());

		if (message.flagArgs.createdAt) {
			const ageCheck = Number(await this.client.arguments.get('duration').run(message.flagArgs.createdAt, 'Duration', message)) - Date.now();
			filtered = filtered
				.filter(member => Date.now() - Number(member.user.createdAt) <= ageCheck);
		}

		if (!filtered.size) throw `${cross}  ::  I didn't get any members who joined during that time.`;

		const embed = new MessageEmbed()
			.setTitle(`${filtered.size} members who joined ${toNow(duration)} ago.`)
			.setColor('RANDOM');

		for (const id of filtered.keys()) {
			ids.push(id);
		}

		if (ids.join(', ').length >= 1000) {
			const chunked = chunk(ids, 20);
			chunked.forEach(arr => embed
				.addField('\u200b', arr.join(', '))
				.addField('\u200b', arr.map(id => `<@${id}>`).join(', ')));
		} else {
			embed
				.addField('\u200b', ids.join(', '))
				.addField('\u200b', ids.map(id => `<@${id}>`).join(', '));
		}

		if (embed.length > 6000 || embed.fields > 6) {
			const fields = chunk(embed.fields, 6);

			for (let i = 0; i < fields.length; i++) {
				const emb = new MessageEmbed()
					.setColor('RANDOM');

				if (i === 0) emb.setTitle(`${filtered.size} members who joined ${toNow(duration)} ago.`);
				if (i === fields.length - 1) emb.setFooter(`Took: ${stopwatch}`);
				emb.addFields(fields[i]);

				message.channel.send(emb);
			}
		} else {
			message.send(embed.setFooter(`Took: ${stopwatch}`));
		}
	}

};
