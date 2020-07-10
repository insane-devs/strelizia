const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			enabled: true,
			runIn: ['text'],
			requiredPermissions: [],
			requiredSettings: [],
			cooldown: 0,
			permissionLevel: 0,
			description: 'Skips the current song',
			extendedHelp: 'No extended help available.',
			usage: '',
			usageDelim: undefined,
			quotedStringSupport: false,
			subcommands: false
		});
	}

	async run(message) {
		const { music } = message.guild;
		if (!message.member || !message.member.voice.channel) throw '<:xmark:415894324719386634>  ::  You must be in a voice channel';
		if (!music.player) throw '<:xmark:415894324719386634>  ::  I am not currently playing any music in this server';
		if (message.member.voice.channel.id !== music.voiceChannel.id) throw '<:xmark:415894324719386634>  ::  We should be on the same voice channel for you to do this!';
		music.skip();
		const [song] = music.queue;
		await message.send(`<:checkmark:415894323436191755>  ::  Successfully skipped song.`);
		if (!music.queue.length) {
			music.destroy();
			return message.channel.send('No more songs left in the queue');
		}
		music.play();
		return message.channel.send(`Now playing: **${song.info.title}** by __${song.info.author}__ (Requested by: ${(await this.client.users.fetch(song.requester)).username})`);
	}

};
