const { Command, util } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			enabled: true,
			runIn: ['text'],
			aliases: [],
			permissionLevel: 0,
			description: 'Shows you the current queue for this server',
			extendedHelp: [
				'To remove an item in the queue, add the `remove` subcommand to open an interactive menu. (`>queue remove`)',
				'To clear the queue for this server add the `clear` subcommand. (`>queue clear`)'
			].join('\n'),
			usage: '[remove|clear] [Page:integer]',
			usageDelim: ' ',
			quotedStringSupport: false,
			subcommands: true
		});
	}

	async run(message, [page = 1]) {
		const { music } = message.guild;
		if (!message.member || !message.member.voice.channel) throw '<:xmark:415894324719386634>  ::  You must be in a voice channel';
		if (!music.player) throw '<:xmark:415894324719386634>  ::  I am not currently playing any music in this server';
		if (message.member.voice.channel.id !== music.voiceChannel.id) throw '<:xmark:415894324719386634>  ::  We should be on the same voice channel for you to do this!';
		await message.send(`<a:typing:492356308943503370>  ::  Showing you the current queue`);
		const [np] = music.queue;
		const _page = util.chunk(music.queue.slice(1, music.queue.length), 5);
		if (page > _page.length || page <= 0) throw `There is no page ${page}`;
		return message.send([
			`Current song queue for **${message.guild.name}** (Page ${page}/${_page.length})`,
			`Now Playing: **${np.info.title}** by ${np.info.author} (Requested by: ${(await this.client.users.fetch(np.requester)).username})`,
			'',
			`${(await Promise.all(_page[page - 1]
				// eslint-disable-next-line max-len
				.map(async (song) => `${music.queue.slice(1, music.queue.length).indexOf(song) + 1}. **${song.info.title}** by ${song.info.author} (Requested by: ${(await this.client.users.fetch(song.requester)).username})`))).join('\n')}`
		].join('\n'));
	}

	async clear(message) {
		const { music } = message.guild;
		if (!message.member.roles.cache.has(message.guild.settings.get('roles.dj')) && message.member.voice.channel.members
			.filter(member => !member.user.bot)
			.some(member => member.roles.cache.has(message.guild.settings.get('roles.dj')))) throw '<:xmark:415894324719386634>  ::  There is a DJ in your music session, only DJs can use this command.';
		const [first] = music.queue;
		music.clearQueue();
		music.queue.unshift(first);
		return message.send('<:checkmark:415894323436191755>  ::  Successfully cleared the queue for this server');
	}

	async remove(message, [number]) {
		const { queue } = message.guild.music;
		if (!message.member.roles.cache.has(message.guild.settings.get('roles.dj')) && message.member.voice.channel.members
			.filter(member => !member.user.bot)
			.some(member => member.roles.cache.has(message.guild.settings.get('roles.dj')))) throw '<:xmark:415894324719386634>  ::  There is a DJ in your music session, only DJs can use this command.';

		if (!number) {
			const msg = await message.prompt('<a:typing:492356308943503370>  ::  Please input the queue number that you want to delete.');
			number = Number(msg.content);
			if (isNaN(number) || number <= 0) throw '<:xmark:415894324719386634>  ::  Invalid number. Exiting prompt';
		}

		const item = queue[number];
		if (!item) throw `<:xmark:415894324719386634>  ::  Sorry I can't find a track with a queue number \`${number}\`. Please run \`>queue\` again to see the whole complete list`;
		queue.splice(number, number);
		return message.send(`<:checkmark:415894323436191755>  ::  Successfully removed **${item.info.title}** from the queue`);
	}

};
