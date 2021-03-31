const { Command, util } = require('klasa');
const { EMOTES: { cross, check, typing } } = require('#util/constants');

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
		if (!message.member || !message.member.voice.channel) throw `${cross}  ::  You must be in a voice channel`;
		if (!music.player) throw `${cross}  ::  I am not currently playing any music in this server`;
		if (message.member.voice.channelID !== music.voiceChannelID) throw `${cross}  ::  We should be on the same voice channel for you to do this!`;
		await message.send(`${typing}  ::  Showing you the current queue`);
		const [np] = music.queue;
		const _page = util.chunk(music.queue.slice(1, music.queue.length), 7);
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
		const [first] = music.queue;
		music.clearQueue();
		music.queue.unshift(first);
		return message.send(`${check}  ::  Successfully cleared the queue for this server`);
	}

	async remove(message, [number]) {
		const { queue } = message.guild.music;

		if (!number) {
			const msg = await message.prompt(`${typing}  ::  Please input the queue number that you want to delete.`);
			number = Number(msg.content);
			if (isNaN(number) || number <= 0) throw `${cross}  ::  Invalid number. Exiting prompt`;
		}

		const item = queue[number];
		if (!item) throw `${cross}  ::  Sorry I can't find a track with a queue number \`${number}\`. Please run \`>queue\` again to see the whole complete list`;
		queue.splice(number, number);
		return message.send(`${check}  ::  Successfully removed **${item.info.title}** from the queue`);
	}

};
